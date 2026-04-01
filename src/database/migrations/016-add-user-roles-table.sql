-- Migration 016: Add user_roles junction table for multi-role support
-- Users can now have multiple roles simultaneously.
-- users.role is retained as the "primary" role for backward compatibility.

CREATE TABLE IF NOT EXISTS user_roles (
  user_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_name VARCHAR(50) NOT NULL REFERENCES roles(name) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_name)
);

-- Migrate existing single-role data
INSERT INTO user_roles (user_id, role_name)
SELECT id, role FROM users
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
