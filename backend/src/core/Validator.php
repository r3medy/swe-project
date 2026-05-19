<?php

namespace src\Core;

class Validator {
    public $errors = [];

    public function reset() {
        $this->errors = [];
    }

    public function validate($field, $value, $options = []) {
        if (method_exists($this, $field)) {
            $this->$field($value, $options);
        }
        return $this->errors;
    }

    private function username($value) {
        if (!$this->isFilledString($value)) {
            $this->errors['username'] = "Username is required";
            return;
        }
        if (!preg_match('/^[a-zA-Z0-9_]{3,24}$/', $value))
            $this->errors['username'] = "Username must contain only letters, numbers, and underscores";
        if (strlen($value) < 3)
            $this->errors['username'] = "Username must be at least 3 characters long";
        if (strlen($value) > 24)
            $this->errors['username'] = "Username must be at most 24 characters long";
    }

    private function email($value) {
        if (!$this->isFilledString($value)) {
            $this->errors['email'] = "Email is required";
            return;
        }
        if (!filter_var($value, FILTER_VALIDATE_EMAIL))
            $this->errors['email'] = "Invalid email format";
    }

    private function password($value) {
        if (!$this->isFilledString($value)) {
            $this->errors['password'] = "Password is required";
            return;
        }
        if (
            strlen($value) < 8
            || !preg_match('/[a-z]/', $value)
            || !preg_match('/[A-Z]/', $value)
            || !preg_match('/[\d\W_]/', $value)
        ) {
            $this->errors['password'] = "Password must be at least 8 characters long and include mixed case plus a digit or special character";
        }
    }

    private function role($value, $options = []) {
        $allowedRoles = ['Client', 'Freelancer'];
        if (!empty($options['allowAdmin'])) $allowedRoles[] = 'Admin';

        if (!in_array($value, $allowedRoles, true))
            $this->errors['role'] = "Invalid role";
    }

    private function gender($value) {
        if (!in_array($value, ['Male', 'Female'], true))
            $this->errors['gender'] = "Invalid gender";
    }

    private function firstName($value) {
        $this->validateMinLength('firstName', $value, "First name", 2);
    }

    private function lastName($value) {
        $this->validateMinLength('lastName', $value, "Last name", 2);
    }

    private function title($value) {
        $this->validateMinLength('title', $value, "Title", 2);
    }

    private function country($value) {
        $this->validateMinLength('country', $value, "Country", 2);
    }

    private function bio($value) {
        $this->validateMinLength('bio', $value, "Bio", 2);
    }

    private function validateMinLength($field, $value, $label, $minLength) {
        if (!$this->isFilledString($value)) {
            $this->errors[$field] = "$label is required";
            return;
        }

        if (strlen($value) < $minLength)
            $this->errors[$field] = "$label must be at least $minLength characters long";
    }

    private function isFilledString($value) {
        return is_string($value) && trim($value) !== '';
    }
}
