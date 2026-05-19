<?php

namespace src\Core;

class RateLimiter
{
    public static function check(string $key, int $maxRequests, int $windowSeconds): array
    {
        $storageDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'swe_project_rate_limits';
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0775, true);
        }

        $storagePath = $storageDir . DIRECTORY_SEPARATOR . hash('sha256', $key) . '.json';
        $now = time();
        $window = ['count' => 0, 'reset' => $now + $windowSeconds];

        if (is_file($storagePath)) {
            $stored = json_decode((string) file_get_contents($storagePath), true);
            if (is_array($stored) && isset($stored['count'], $stored['reset'])) {
                $window = $stored;
            }
        }

        if ($now >= (int) $window['reset']) {
            $window = [
                'count' => 0,
                'reset' => $now + $windowSeconds,
            ];
        }

        $window['count']++;
        file_put_contents($storagePath, json_encode($window), LOCK_EX);

        $remaining = max(0, $maxRequests - (int) $window['count']);

        return [
            'allowed' => (int) $window['count'] <= $maxRequests,
            'remaining' => $remaining,
            'reset' => (int) $window['reset'],
            'retryAfter' => max(1, (int) $window['reset'] - $now),
        ];
    }
}
