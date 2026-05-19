$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$failures = New-Object System.Collections.Generic.List[string]

function Get-Source([string] $Path) {
    $fullPath = Join-Path $root $Path
    if (-not (Test-Path -LiteralPath $fullPath)) {
        throw "Missing file: $Path"
    }

    return Get-Content -LiteralPath $fullPath -Raw
}

function Assert-Contains([string] $Needle, [string] $Haystack, [string] $Message) {
    if (-not $Haystack.Contains($Needle)) {
        $script:failures.Add($Message)
    }
}

function Assert-NotContains([string] $Needle, [string] $Haystack, [string] $Message) {
    if ($Haystack.Contains($Needle)) {
        $script:failures.Add($Message)
    }
}

$index = Get-Source 'index.php'
$routes = Get-Source 'src/core/Routes.php'
$chatModel = Get-Source 'src/models/chatModel.php'
$wallModel = Get-Source 'src/models/wallModel.php'
$authController = Get-Source 'src/controllers/AuthController.php'
$profileController = Get-Source 'src/controllers/ProfileController.php'
$postModel = Get-Source 'src/models/postModel.php'
$userModel = Get-Source 'src/models/userModel.php'
$rateLimiter = Get-Source 'src/Core/RateLimiter.php'
$dbCircuitBreaker = Get-Source 'src/Core/DatabaseCircuitBreaker.php'
$responseCache = Get-Source 'src/Core/ResponseCache.php'
$auditLogger = Get-Source 'src/Core/AuditLogger.php'

Assert-Contains "'secure' => getenv('APP_ENV') === 'production'" $index 'Session cookie secure flag must be enabled in production.'
Assert-Contains '$app->addErrorMiddleware(!$isProduction, true, true)' $index 'Slim error details must be disabled in production.'
Assert-Contains 'setDefaultErrorHandler' $index 'Unexpected exceptions must use a structured JSON error handler.'
Assert-Contains 'PDOException' $index 'Database exceptions must map to service-unavailable responses.'
Assert-Contains 'Service Unavailable' $index 'Database outages must return a service-unavailable message.'
Assert-Contains 'CORS_ORIGINS' $index 'CORS must use an allowlist instead of reflecting any Origin.'
Assert-NotContains '$allowedOrigin = $origin ? $origin : ''*'';' $index 'CORS must not reflect arbitrary request origins.'
Assert-Contains 'X-Content-Type-Options' $index 'Security headers middleware must set X-Content-Type-Options.'
Assert-Contains 'X-Frame-Options' $index 'Security headers middleware must set X-Frame-Options.'
Assert-Contains 'Referrer-Policy' $index 'Security headers middleware must set Referrer-Policy.'
Assert-Contains 'RateLimiter::check' $index 'Rate limiting middleware must run before controllers.'
Assert-Contains 'Retry-After' $index 'Rate-limited responses must include Retry-After.'
Assert-Contains 'csrfToken' $index 'Session-backed API must issue a CSRF token.'
Assert-Contains 'X-CSRF-Token' $index 'Unsafe authenticated requests must require X-CSRF-Token.'
Assert-Contains 'hash_equals' $index 'CSRF token comparison must use constant-time comparison.'
Assert-Contains 'Unsupported Media Type' $index 'JSON write endpoints must reject unsupported media types with 415.'
Assert-Contains 'multipart/form-data' $index 'Multipart upload endpoints must remain allowed.'
Assert-NotContains '/savedPosts' $routes 'Duplicate /profile/savedPosts route must be removed.'

Assert-Contains 'WHERE m.chatId IN' $chatModel '/chats must fetch all messages in one query.'
Assert-NotContains 'WHERE m.chatId = :chatId' $chatModel '/chats must not fetch messages once per chat.'

Assert-Contains 'LIMIT ?' $wallModel '/wall query must enforce a limit.'
Assert-Contains 'OFFSET ?' $wallModel '/wall query must support pagination offset.'

$apiResponse = Get-Source 'src/Core/ApiResponse.php'
Assert-Contains 'function error' $apiResponse 'Shared ApiResponse helper must exist.'
Assert-Contains "'error' => ['code' => `$status, 'message' => `$message]" $apiResponse 'Shared error helper must emit the standard error envelope.'
Assert-Contains '$this->error($response,' $authController 'AuthController must use the shared error helper for failures.'
Assert-NotContains 'json_encode(["message" => "User not found"])' $authController 'AuthController must not return bare message error responses.'
Assert-Contains 'random_bytes' $profileController 'Profile upload filenames must include unpredictable entropy.'
Assert-NotContains '$filename = $_SESSION[''userId''] . ''.'' . $extension;' $profileController 'Profile upload filenames must not be predictable user IDs.'
Assert-Contains "unset(`$user['email'])" $profileController 'Public profile responses must remove email.'
Assert-Contains 'random_bytes' $postModel 'Post upload filenames must include unpredictable entropy.'
Assert-NotContains '$fileName   = "post_" . $postId . "." . $extension;' $postModel 'Post upload filenames must not be predictable post IDs.'
Assert-Contains 'strip_tags' $userModel 'User/profile text fields must be sanitized before persistence.'
Assert-Contains 'strip_tags' $postModel 'Post text fields must be sanitized before persistence.'
Assert-Contains 'sys_get_temp_dir' $rateLimiter 'Rate limiting must be keyed outside the PHP session cookie.'
Assert-NotContains '$_SESSION[$storageKey]' $rateLimiter 'Rate limiting must not be bypassable by dropping the session cookie.'
Assert-Contains 'DatabaseCircuitBreaker::call' $index 'Database connection creation must use the circuit breaker.'
Assert-Contains 'failureCount' $dbCircuitBreaker 'Database circuit breaker must track repeated failures.'
Assert-Contains 'circuitOpenUntil' $dbCircuitBreaker 'Database circuit breaker must open after repeated failures.'
Assert-Contains 'ResponseCache::get' $index 'Read-heavy public endpoints must use the response cache.'
Assert-Contains 'ResponseCache::set' $index 'Successful read-heavy responses must be stored in cache.'
Assert-Contains 'X-Cache' $index 'Cached endpoint responses must expose cache hit/miss state.'
Assert-Contains 'expiresAt' $responseCache 'Response cache entries must expire.'
Assert-Contains 'AuditLogger::log' $authController 'Authentication events must be audited.'
Assert-Contains 'AuditLogger::log' (Get-Source 'src/controllers/AdminController.php') 'Admin actions must be audited.'
Assert-Contains 'event' $auditLogger 'Audit log entries must include event names.'

if ($failures.Count -gt 0) {
    foreach ($failure in $failures) {
        Write-Error "FAIL: $failure" -ErrorAction Continue
    }
    exit 1
}

Write-Output 'PASS api_todo_regression'
