-- Migration: Add new user roles
-- Adds: principal, mentor, class_teacher, accounts, front_desk

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN (
    'admin',
    'teacher',
    'student',
    'librarian',
    'user',
    'principal',
    'mentor',
    'class_teacher',
    'accounts',
    'front_desk'
  ));
