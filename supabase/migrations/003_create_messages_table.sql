-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user UUID NOT NULL REFERENCES users(id),
  to_user UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Prevent users from sending messages to themselves
  CONSTRAINT no_self_messaging CHECK (from_user != to_user)
);

-- Create indexes for performance
CREATE INDEX idx_messages_from_user ON messages(from_user);
CREATE INDEX idx_messages_to_user ON messages(to_user);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_read_at ON messages(read_at);

-- Create composite index for conversation queries
CREATE INDEX idx_messages_conversation ON messages(from_user, to_user, created_at DESC);
CREATE INDEX idx_messages_conversation_reverse ON messages(to_user, from_user, created_at DESC);
