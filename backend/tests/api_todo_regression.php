<?php

$root = dirname(__DIR__);
$failures = [];

function source(string $path): string
{
    global $root;
    $fullPath = $root . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $path);
    if (!is_file($fullPath)) {
        throw new RuntimeException("Missing file: {$path}");
    }

    return file_get_contents($fullPath);
}

function assertContainsText(string $needle, string $haystack, string $message): void
{
    global $failures;
    if (!str_contains($haystack, $needle)) {
        $failures[] = $message;
    }
}

function assertNotContainsText(string $needle, string $haystack, string $message): void
{
    global $failures;
    if (str_contains($haystack, $needle)) {
        $failures[] = $message;
    }
}

$index = source('index.php');
$routes = source('src/core/Routes.php');
$chatModel = source('src/models/chatModel.php');
$wallModel = source('src/models/wallModel.php');
$authController = source('src/controllers/AuthController.php');
$profileController = source('src/controllers/ProfileController.php');
$postModel = source('src/models/postModel.php');
$userModel = source('src/models/userModel.php');
$rateLimiter = source('src/Core/RateLimiter.php');
$dbCircuitBreaker = source('src/Core/DatabaseCircuitBreaker.php');
$responseCache = source('src/Core/ResponseCache.php');
$auditLogger = source('src/Core/AuditLogger.php');

assertContainsText("'secure' => getenv('APP_ENV') === 'production'", $index, 'Session cookie secure flag must be enabled in production.');
assertContainsText('$app->addErrorMiddleware(!$isProduction, true, true)', $index, 'Slim error details must be disabled in production.');
assertContainsText('setDefaultErrorHandler', $index, 'Unexpected exceptions must use a structured JSON error handler.');
assertContainsText('PDOException', $index, 'Database exceptions must map to service-unavailable responses.');
assertContainsText('Service Unavailable', $index, 'Database outages must return a service-unavailable message.');
assertContainsText('CORS_ORIGINS', $index, 'CORS must use an allowlist instead of reflecting any Origin.');
assertNotContainsText('$allowedOrigin = $origin ? $origin : \'*\';', $index, 'CORS must not reflect arbitrary request origins.');
assertContainsText('X-Content-Type-Options', $index, 'Security headers middleware must set X-Content-Type-Options.');
assertContainsText('X-Frame-Options', $index, 'Security headers middleware must set X-Frame-Options.');
assertContainsText('Referrer-Policy', $index, 'Security headers middleware must set Referrer-Policy.');
assertContainsText('RateLimiter::check', $index, 'Rate limiting middleware must run before controllers.');
assertContainsText('Retry-After', $index, 'Rate-limited responses must include Retry-After.');
assertContainsText('csrfToken', $index, 'Session-backed API must issue a CSRF token.');
assertContainsText('X-CSRF-Token', $index, 'Unsafe authenticated requests must require X-CSRF-Token.');
assertContainsText('hash_equals', $index, 'CSRF token comparison must use constant-time comparison.');
assertContainsText('Unsupported Media Type', $index, 'JSON write endpoints must reject unsupported media types with 415.');
assertContainsText('multipart/form-data', $index, 'Multipart upload endpoints must remain allowed.');
assertNotContainsText('/savedPosts', $routes, 'Duplicate /profile/savedPosts route must be removed.');

assertContainsText('WHERE m.chatId IN', $chatModel, '/chats must fetch all messages in one query.');
assertNotContainsText('WHERE m.chatId = :chatId', $chatModel, '/chats must not fetch messages once per chat.');

assertContainsText('LIMIT ?', $wallModel, '/wall query must enforce a limit.');
assertContainsText('OFFSET ?', $wallModel, '/wall query must support pagination offset.');

assertContainsText('function error', source('src/Core/ApiResponse.php'), 'Shared ApiResponse helper must exist.');
assertContainsText("'error' => ['code' => \$status, 'message' => \$message]", source('src/Core/ApiResponse.php'), 'Shared error helper must emit the standard error envelope.');
assertContainsText('$this->error($response,', $authController, 'AuthController must use the shared error helper for failures.');
assertNotContainsText('json_encode(["message" => "User not found"])', $authController, 'AuthController must not return bare message error responses.');
assertContainsText('random_bytes', $profileController, 'Profile upload filenames must include unpredictable entropy.');
assertNotContainsText('$filename = $_SESSION[\'userId\'] . \'.\' . $extension;', $profileController, 'Profile upload filenames must not be predictable user IDs.');
assertContainsText("unset(\$user['email'])", $profileController, 'Public profile responses must remove email.');
assertContainsText('random_bytes', $postModel, 'Post upload filenames must include unpredictable entropy.');
assertNotContainsText('$fileName   = "post_" . $postId . "." . $extension;', $postModel, 'Post upload filenames must not be predictable post IDs.');
assertContainsText('strip_tags', $userModel, 'User/profile text fields must be sanitized before persistence.');
assertContainsText('strip_tags', $postModel, 'Post text fields must be sanitized before persistence.');
assertContainsText('sys_get_temp_dir', $rateLimiter, 'Rate limiting must be keyed outside the PHP session cookie.');
assertNotContainsText('$_SESSION[$storageKey]', $rateLimiter, 'Rate limiting must not be bypassable by dropping the session cookie.');
assertContainsText('DatabaseCircuitBreaker::call', $index, 'Database connection creation must use the circuit breaker.');
assertContainsText('failureCount', $dbCircuitBreaker, 'Database circuit breaker must track repeated failures.');
assertContainsText('circuitOpenUntil', $dbCircuitBreaker, 'Database circuit breaker must open after repeated failures.');
assertContainsText('ResponseCache::get', $index, 'Read-heavy public endpoints must use the response cache.');
assertContainsText('ResponseCache::set', $index, 'Successful read-heavy responses must be stored in cache.');
assertContainsText('X-Cache', $index, 'Cached endpoint responses must expose cache hit/miss state.');
assertContainsText('expiresAt', $responseCache, 'Response cache entries must expire.');
assertContainsText('AuditLogger::log', $authController, 'Authentication events must be audited.');
assertContainsText('AuditLogger::log', source('src/controllers/AdminController.php'), 'Admin actions must be audited.');
assertContainsText('event', $auditLogger, 'Audit log entries must include event names.');

if ($failures) {
    foreach ($failures as $failure) {
        fwrite(STDERR, "FAIL: {$failure}\n");
    }
    exit(1);
}

echo "PASS api_todo_regression\n";
