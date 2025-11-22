/**
 * Profile API Service
 * 
 * Handles all profile-related database operations using Supabase.
 * Provides functions for creating, reading, updating, and deleting profiles.
 * 
 * Task: T044 [US1]
 */

import { supabase } from './client';
import { Database } from '@/lib/types/database';
import { Profile, ProfileWithRelations } from '@/lib/types/profile';
import { profileSchema, profileUpdateSchema } from '@/lib/validation/schemas';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * Get profile by user ID with all related data
 */
export async function getProfile(userId: string): Promise<ProfileWithRelations | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      *,
      social_links(*),
      resume_attachments(*),
      shareable_links(*)
    `
    )
    .eq('user_id', userId)
    .eq('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  // Transform the data to match ProfileWithRelations type
  const profile: ProfileWithRelations = {
    id: data.id,
    user_id: data.user_id,
    email: data.email,
    phone: data.phone,
    name: data.name,
    title: data.title,
    company: data.company,
    role: data.role,
    bio: data.bio,
    tags: data.tags || [],
    profile_picture_url: data.profile_picture_url,
    profile_picture_initials: data.profile_picture_initials,
    resume_visible: data.resume_visible ?? true,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    deleted_at: data.deleted_at,
    social_links: (data.social_links as any[]) || [],
    resume: data.resume_attachments
      ? {
          file_url: data.resume_attachments.file_url,
          file_name: data.resume_attachments.file_name,
          file_size: data.resume_attachments.file_size,
        }
      : null,
  };

  return profile;
}

/**
 * Create a new profile
 */
export async function createProfile(
  userId: string,
  profileData: {
    email: string;
    phone: string;
    name: string;
    title?: string | null;
    company?: string | null;
    role?: string | null;
    bio?: string | null;
    tags?: string[];
    resume_visible?: boolean;
  }
): Promise<Profile> {
  // Validate input
  const validated = profileSchema.parse(profileData);

  // Generate initials from name
  const initials = generateInitials(validated.name);

  const insertData: ProfileInsert = {
    user_id: userId,
    email: validated.email,
    phone: validated.phone,
    name: validated.name,
    title: validated.title ?? null,
    company: validated.company ?? null,
    role: validated.role ?? null,
    bio: validated.bio ?? null,
    tags: validated.tags || [],
    profile_picture_initials: initials,
    resume_visible: validated.resume_visible ?? true,
  };

  const { data, error } = await supabase
    .from('profiles')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      // Unique constraint violation (profile already exists)
      throw new Error('Profile already exists for this user');
    }
    throw new Error(`Failed to create profile: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to create profile: No data returned');
  }

  return transformProfileRow(data);
}

/**
 * Update an existing profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<{
    email: string;
    phone: string;
    name: string;
    title: string | null;
    company: string | null;
    role: string | null;
    bio: string | null;
    tags: string[];
    resume_visible: boolean;
  }>
): Promise<Profile> {
  // Validate input (all fields optional for updates)
  const validated = profileUpdateSchema.parse(updates);

  // If name is being updated, regenerate initials
  const updateData: ProfileUpdate = { ...validated };
  if (validated.name) {
    updateData.profile_picture_initials = generateInitials(validated.name);
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('user_id', userId)
    .eq('deleted_at', null)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Profile not found');
    }
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to update profile: No data returned');
  }

  return transformProfileRow(data);
}

/**
 * Soft delete a profile (sets deleted_at timestamp)
 */
export async function deleteProfile(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('deleted_at', null);

  if (error) {
    throw new Error(`Failed to delete profile: ${error.message}`);
  }
}

/**
 * Generate initials from a name
 * Examples: "John Doe" -> "JD", "Mary Jane Watson" -> "MW", "Alice" -> "A"
 */
function generateInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Transform database row to Profile type
 */
function transformProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    user_id: row.user_id,
    email: row.email,
    phone: row.phone,
    name: row.name,
    title: row.title,
    company: row.company,
    role: row.role,
    bio: row.bio,
    tags: row.tags || [],
    profile_picture_url: row.profile_picture_url,
    profile_picture_initials: row.profile_picture_initials,
    resume_visible: row.resume_visible ?? true,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
    deleted_at: row.deleted_at,
  };
}

