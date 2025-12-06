<?php

namespace src\Core;

class Validator
{
    public $errors = [];
    public function validate($field, $value) {
        if (method_exists($this, $field)) {
            $this->$field($value);
        }
        return $this->errors;
    }

    private function username($value) {
        if (!isset($value))
            $this->errors['username'] = "Username is required";
        if (!preg_match('/^[a-z0-9_-]{3,16}$/', $value))
            $this->errors['username'] = "Username must contain only letters, numbers, and underscores";
        if (strlen($value) < 3)
            $this->errors['username'] = "Username must be at least 3 characters long";
        if (strlen($value) > 24)
            $this->errors['username'] = "Username must be at most 24 characters long";
    }

    private function email($value) {
        if (!isset($value))
            $this->errors['email'] = "Email is required";
        if (!filter_var($value, FILTER_VALIDATE_EMAIL))
            $this->errors['email'] = "Invalid email format";
    }

    private function password($value) {
        if (!isset($value))
            $this->errors['password'] = "Password is required";
        if (strlen($value) < 8)
            $this->errors['password'] = "Password must be at least 8 characters long";
    }

    private function role($value) {
        if (!in_array($value, ['Client', 'Freelancer']))
            $this->errors['role'] = "Invalid role";
    }

    private function gender($value) {
        if (!in_array($value, ['Male', 'Female']))
            $this->errors['gender'] = "Invalid gender";
    }

    private function firstName($value) {
        if (!isset($value))
            $this->errors['firstName'] = "First name is required";
        if (strlen($value) < 2)
            $this->errors['firstName'] = "First name must be at least 2 characters long";
    }

    private function lastName($value) {
        if (!isset($value))
            $this->errors['lastName'] = "Last name is required";
        if (strlen($value) < 2)
            $this->errors['lastName'] = "Last name must be at least 2 characters long";
    }

    private function title($value) {
        if (!isset($value))
            $this->errors['title'] = "Title is required";
        if (strlen($value) < 2)
            $this->errors['title'] = "Title must be at least 2 characters long";
    }

    private function country($value) {
        if (!isset($value))
            $this->errors['country'] = "Country is required";
        if (strlen($value) < 2)
            $this->errors['country'] = "Country must be at least 2 characters long";
    }

    private function bio($value) {
        if (!isset($value))
            $this->errors['bio'] = "Bio is required";
        if (strlen($value) < 2)
            $this->errors['bio'] = "Bio must be at least 2 characters long";
    }
}
