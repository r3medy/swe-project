<?php

namespace src\Core;

use RuntimeException;
use Throwable;

class DatabaseCircuitBreaker
{
    public static function call(string $name, callable $operation): mixed
    {
        $path = self::statePath($name);
        $state = self::readState($path);
        $now = time();

        if (($state['circuitOpenUntil'] ?? 0) > $now) {
            throw new RuntimeException('Database circuit is temporarily open');
        }

        try {
            $result = $operation();
            self::writeState($path, ['failureCount' => 0, 'circuitOpenUntil' => 0]);
            return $result;
        } catch (Throwable $exception) {
            $failureCount = (int) ($state['failureCount'] ?? 0) + 1;
            $circuitOpenUntil = $failureCount >= 3 ? $now + 30 : 0;

            self::writeState($path, [
                'failureCount' => $failureCount,
                'circuitOpenUntil' => $circuitOpenUntil,
            ]);

            throw $exception;
        }
    }

    private static function statePath(string $name): string
    {
        $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'swe_project_circuit_breakers';
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        return $dir . DIRECTORY_SEPARATOR . hash('sha256', $name) . '.json';
    }

    private static function readState(string $path): array
    {
        if (!is_file($path)) {
            return ['failureCount' => 0, 'circuitOpenUntil' => 0];
        }

        $state = json_decode((string) file_get_contents($path), true);
        return is_array($state) ? $state : ['failureCount' => 0, 'circuitOpenUntil' => 0];
    }

    private static function writeState(string $path, array $state): void
    {
        file_put_contents($path, json_encode($state), LOCK_EX);
    }
}
