-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
-- Users can read their own data
CREATE POLICY users_read_own ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can read data of users they are connected to
CREATE POLICY users_read_connected ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND connected_to = users.id
    )
  );

-- Users can read data of users who have sent them connection requests
CREATE POLICY users_read_requesters ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM connection_requests
      WHERE to_user = auth.uid() AND from_user = users.id
    )
  );

-- Users can update their own data
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for connection_requests table
-- Users can read connection requests they've sent or received
CREATE POLICY connection_requests_read_own ON connection_requests
  FOR SELECT
  USING (auth.uid() = from_user OR auth.uid() = to_user);

-- Users can insert connection requests they're sending
CREATE POLICY connection_requests_insert_own ON connection_requests
  FOR INSERT
  WITH CHECK (auth.uid() = from_user);

-- Users can update connection requests they've received
CREATE POLICY connection_requests_update_received ON connection_requests
  FOR UPDATE
  USING (auth.uid() = to_user);

-- Create policies for messages table
-- Users can read messages they've sent or received
CREATE POLICY messages_read_own ON messages
  FOR SELECT
  USING (auth.uid() = from_user OR auth.uid() = to_user);

-- Users can insert messages they're sending
CREATE POLICY messages_insert_own ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = from_user AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND connected_to = to_user
    )
  );

-- Users can update (mark as read) messages they've received
CREATE POLICY messages_update_received ON messages
  FOR UPDATE
  USING (
    auth.uid() = to_user AND
    -- Only allow updating the read_at field
    (SELECT array_length(akeys(to_jsonb(messages) - array['read_at']::text[]), 1)) = 0
  );
