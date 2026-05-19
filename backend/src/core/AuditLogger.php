<?php

namespace src\Core;

class AuditLogger {
    public static function log(string $event, array $context = []): void {
        $dir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'logs';
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        $entry = [
            'timestamp' => gmdate('c'),
            'event' => $event,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'userId' => $_SESSION['userId'] ?? null,
            'context' => $context,
        ];

        file_put_contents($dir . DIRECTORY_SEPARATOR . 'audit.log', json_encode($entry) . PHP_EOL, FILE_APPEND | LOCK_EX);
    }
}
