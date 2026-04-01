-- Migration: Create roles table for dynamic role management
-- Superadmin can add/edit/delete roles; validation moves to app layer

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed all existing roles (is_system = true means they cannot be deleted)
INSERT INTO roles (name, display_name, description, is_system) VALUES
  ('superadmin',    'Super Admin',   'Full system access including role management', true),
  ('admin',         'Admin',         'Full system access and user management',       true),
  ('teacher',       'Teacher',       'Teaching staff',                               true),
  ('student',       'Student',       'Student accounts',                             true),
  ('librarian',     'Librarian',     'Library management access',                    true),
  ('user',          'Viewer',        'Basic authenticated read-only access',         true),
  ('principal',     'Principal',     'School principal',                             false),
  ('mentor',        'Mentor',        'Student mentor',                               false),
  ('class_teacher', 'Class Teacher', 'Class teacher with attendance access',         false),
  ('accounts',      'Accounts',      'Accounts and finance department',              false),
  ('front_desk',    'Front Desk',    'Reception and front desk staff',               false)
ON CONFLICT (name) DO NOTHING;

-- Drop the hardcoded CHECK constraint (validation now done at application level)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add superadmin to the schema check (schema.sql is the source of truth for new installs)
-- Existing installs use this migration instead
