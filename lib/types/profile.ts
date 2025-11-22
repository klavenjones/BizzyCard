/**
 * Domain types for Profile and SocialLink entities
 * These types represent the business domain models
 */

export type SocialPlatform =
  | 'bluesky'
  | 'linkedin'
  | 'x'
  | 'facebook'
  | 'instagram'
  | 'github'
  | 'portfolio'
  | 'other';

export interface SocialLink {
  id: string;
  profile_id: string;
  platform: SocialPlatform;
  url: string;
  display_order: number;
  visible: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  phone: string;
  name: string;
  title: string | null;
  company: string | null;
  role: string | null;
  bio: string | null;
  tags: string[];
  profile_picture_url: string | null;
  profile_picture_initials: string | null;
  resume_visible: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProfileWithRelations extends Profile {
  social_links?: SocialLink[];
  resume?: {
    file_url: string;
    file_name: string;
    file_size: number;
  } | null;
}

