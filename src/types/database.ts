/**
 * Ottr Database Types
 * 
 * TypeScript interfaces for all database tables.
 * These types should match the Supabase schema.
 */

export type ConnectionStatus = 'disconnected' | 'pending' | 'connected';
export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string;
  connection_status: ConnectionStatus;
  connected_to: string | null;
  expo_push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConnectionRequest {
  id: string;
  from_user: string;
  to_user: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  // Joined fields from Supabase queries
  from_user_details?: User;
  to_user_details?: User;
}

export interface Message {
  id: string;
  from_user: string;
  to_user: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      connection_requests: {
        Row: ConnectionRequest;
        Insert: Omit<ConnectionRequest, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: RequestStatus };
        Update: Partial<Omit<ConnectionRequest, 'id' | 'from_user' | 'to_user' | 'created_at' | 'updated_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: Partial<Omit<Message, 'id' | 'from_user' | 'to_user' | 'content' | 'created_at'>>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      connection_status: ConnectionStatus;
      request_status: RequestStatus;
    };
  };
}
