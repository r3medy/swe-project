<?php

namespace src\Core;

class ResponseCache
{
    public static function get(string $key): ?array
    {
        $path = self::path($key);
        if (!is_file($path)) {
            return null;
        }

        $entry = json_decode((string) file_get_contents($path), true);
        if (!is_array($entry) || (int) ($entry['expiresAt'] ?? 0) < time()) {
            @unlink($path);
            return null;
        }

        return $entry;
    }

    public static function set(string $key, string $body, int $ttlSeconds): void
    {
        file_put_contents(self::path($key), json_encode([
            'body' => $body,
            'expiresAt' => time() + $ttlSeconds,
        ]), LOCK_EX);
    }

    private static function path(string $key): string
    {
        $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'swe_project_response_cache';
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        return $dir . DIRECTORY_SEPARATOR . hash('sha256', $key) . '.json';
    }
}
