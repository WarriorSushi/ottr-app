-- Create connection_requests table
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user UUID NOT NULL REFERENCES users(id),
  to_user UUID NOT NULL REFERENCES users(id),
  status request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Ensure users can't send multiple requests to the same user
  CONSTRAINT unique_connection_request UNIQUE (from_user, to_user),
  
  -- Prevent users from sending requests to themselves
  CONSTRAINT no_self_connection CHECK (from_user != to_user)
);

-- Create indexes for performance
CREATE INDEX idx_connection_requests_from_user ON connection_requests(from_user);
CREATE INDEX idx_connection_requests_to_user ON connection_requests(to_user);
CREATE INDEX idx_connection_requests_status ON connection_requests(status);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER connection_requests_updated_at
BEFORE UPDATE ON connection_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
