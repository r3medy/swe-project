<?php
// متلمسش الملف ده
// Don't edit this file
use DI\Container;
use Slim\Factory\AppFactory;
use Slim\Psr7\Response;
use src\Core\DatabaseCircuitBreaker;
use src\Core\RateLimiter;
use src\Core\ResponseCache;

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/src/core/DatabaseConfig.php'; // Database Configuration

$isProduction = getenv('APP_ENV') === 'production';

// Cookies & Session
session_set_cookie_params([
    'lifetime' => 86400 * 7, // 7 days
    'path' => '/',
    'domain' => '',
    'secure' => getenv('APP_ENV') === 'production',
    'httponly' => true,
    'samesite' => 'Lax'
]);

if (session_status() === PHP_SESSION_NONE) session_start();
if (empty($_SESSION['csrfToken'])) {
    $_SESSION['csrfToken'] = bin2hex(random_bytes(32));
}

$container = new Container();
$container->set('db', function () use ($host, $db_name, $username, $password, $opts) {
    return DatabaseCircuitBreaker::call('mysql', function () use ($host, $db_name, $username, $password, $opts) {
        // Connection statement
        $conn_stmt = "mysql:host=$host;dbname=$db_name;charset=utf8mb4";
        // Returning the connection
        return new PDO($conn_stmt, $username, $password, $opts);
    });
});

// Creating an application with the database container
AppFactory::setContainer($container);
$app = AppFactory::create();

// Middlewares
// Allow JSON inputs
$app->addBodyParsingMiddleware();
// Error handler
// displayErrorDetails=true, logErrors=true, logErrorDetails=true
$errorMiddleware = $app->addErrorMiddleware(!$isProduction, true, true);
$errorMiddleware->setDefaultErrorHandler(function ($request, Throwable $exception) {
    $isDatabaseUnavailable = $exception instanceof PDOException
        || str_contains($exception->getMessage(), 'Database circuit');
    $status = $isDatabaseUnavailable ? 503 : 500;
    $message = $status === 503 ? 'Service Unavailable' : 'Internal Server Error';

    $response = new Response();
    $response->getBody()->write(json_encode([
        'error' => ['code' => $status, 'message' => $message],
    ]));

    return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
});

$app->add(function ($request, $handler) {
    $method = strtoupper($request->getMethod());
    if ($method === 'OPTIONS') {
        return $handler->handle($request);
    }

    $path = $request->getUri()->getPath();
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $isStrictAuthEndpoint = in_array($path, ['/auth/login', '/auth/checkUser'], true);
    $limit = $isStrictAuthEndpoint ? 5 : 100;
    $window = 60;
    $rate = RateLimiter::check($ip . ':' . $method . ':' . $path, $limit, $window);

    if (!$rate['allowed']) {
        $response = new Response();
        $response->getBody()->write(json_encode([
            'error' => ['code' => 429, 'message' => 'Too many requests'],
        ]));

        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withHeader('Retry-After', (string) $rate['retryAfter'])
            ->withHeader('X-RateLimit-Remaining', '0')
            ->withHeader('X-RateLimit-Reset', (string) $rate['reset'])
            ->withStatus(429);
    }

    $response = $handler->handle($request);
    return $response
        ->withHeader('X-RateLimit-Remaining', (string) $rate['remaining'])
        ->withHeader('X-RateLimit-Reset', (string) $rate['reset']);
});

$app->add(function ($request, $handler) {
    $unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    $method = strtoupper($request->getMethod());
    $path = $request->getUri()->getPath();
    $exemptPaths = ['/', '/auth/checkUser', '/auth/register', '/auth/login'];

    if (
        isset($_SESSION['userId'])
        && in_array($method, $unsafeMethods, true)
        && !in_array($path, $exemptPaths, true)
    ) {
        $submittedToken = $request->getHeaderLine('X-CSRF-Token');
        $sessionToken = $_SESSION['csrfToken'] ?? '';

        if ($submittedToken === '' || $sessionToken === '' || !hash_equals($sessionToken, $submittedToken)) {
            $response = new Response();
            $response->getBody()->write(json_encode([
                'error' => ['code' => 403, 'message' => 'Invalid CSRF token'],
            ]));

            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withHeader('X-CSRF-Token', $_SESSION['csrfToken'] ?? '')
                ->withStatus(403);
        }
    }

    $response = $handler->handle($request);
    return $response->withHeader('X-CSRF-Token', $_SESSION['csrfToken'] ?? '');
});

$app->add(function ($request, $handler) {
    $method = strtoupper($request->getMethod());
    if (in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
        $contentType = strtolower($request->getHeaderLine('Content-Type'));
        $hasBody = $request->getBody()->getSize() !== 0;
        $isJson = str_contains($contentType, 'application/json');
        $isMultipart = str_contains($contentType, 'multipart/form-data');

        if ($hasBody && !$isJson && !$isMultipart) {
            $response = new Response();
            $response->getBody()->write(json_encode([
                'error' => ['code' => 415, 'message' => 'Unsupported Media Type'],
            ]));

            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(415);
        }
    }

    return $handler->handle($request);
});

$app->add(function ($request, $handler) {
    $path = $request->getUri()->getPath();
    $method = strtoupper($request->getMethod());
    $cacheable = $method === 'GET' && in_array($path, ['/tags', '/wall'], true);

    if (!$cacheable) {
        return $handler->handle($request);
    }

    $cacheKey = $method . ':' . (string) $request->getUri();
    $cached = ResponseCache::get($cacheKey);
    if ($cached) {
        $response = new Response();
        $response->getBody()->write((string) $cached['body']);
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withHeader('Cache-Control', 'public, max-age=60')
            ->withHeader('X-Cache', 'HIT')
            ->withStatus(200);
    }

    $response = $handler->handle($request);
    if ($response->getStatusCode() === 200) {
        ResponseCache::set($cacheKey, (string) $response->getBody(), 60);
    }

    return $response
        ->withHeader('Cache-Control', 'public, max-age=60')
        ->withHeader('X-Cache', 'MISS');
});

$app->add(function ($request, $handler) {
    $response = $handler->handle($request);

    return $response
        ->withHeader('X-Content-Type-Options', 'nosniff')
        ->withHeader('X-Frame-Options', 'DENY')
        ->withHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        ->withHeader('X-Permitted-Cross-Domain-Policies', 'none');
});

$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    $origin = $request->getHeaderLine('Origin');
    $allowedOrigins = array_values(array_filter(array_map('trim', explode(',', getenv('CORS_ORIGINS') ?: 'http://localhost:5173'))));
    $defaultOrigin = $allowedOrigins[0] ?? 'http://localhost:5173';
    $allowedOrigin = in_array($origin, $allowedOrigins, true) ? $origin : $defaultOrigin;

    return $response
        // Force JSON response
        ->withHeader('Content-Type', 'application/json')
        // CORS
        ->withHeader('Access-Control-Allow-Credentials', 'true')
        ->withHeader('Access-Control-Allow-Origin', $allowedOrigin)
        ->withHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, X-Token-Auth, Authorization');
});

// Routes
$routes = require __DIR__ . '/src/core/Routes.php';
$routes($app);

// Pre-flight requests
$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response->withStatus(200);
});

// Run the server
$app->run();
