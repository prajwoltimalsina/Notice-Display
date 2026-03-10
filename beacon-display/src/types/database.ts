export type AppRole = 'admin' | 'user';

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

// MongoDB Notice model - uses _id and fileUrl
export interface Notice {
  _id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  file_type: string;
  status: 'draft' | 'published';
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  z_index: number;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

// For creating a notice (without _id)
export interface NoticeInput {
  title: string;
  description?: string;
  file_type?: string;
  status?: 'draft' | 'published';
  is_published?: boolean;
  created_by?: string;
}

// MongoDB User model
export interface MongoUser {
  _id: string;
  email: string;
  name: string;
  role: AppRole;
  created_at: string;
}
