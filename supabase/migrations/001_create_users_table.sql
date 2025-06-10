-- Create users table
CREATE TYPE connection_status AS ENUM ('disconnected', 'pending', 'connected');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL CHECK (username ~ '^@[a-zA-Z0-9_]+$'),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  connection_status connection_status NOT NULL DEFAULT 'disconnected',
  connected_to UUID REFERENCES users(id),
  expo_push_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_connection_status ON users(connection_status);
CREATE INDEX idx_users_connected_to ON users(connected_to);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
