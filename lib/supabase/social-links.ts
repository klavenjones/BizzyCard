/**
 * Social Links API Service
 * 
 * Handles all social link-related database operations using Supabase.
 * Provides CRUD operations for social media links associated with profiles.
 * 
 * Task: T045 [US1]
 */

import { supabase } from './client';
import { Database } from '@/lib/types/database';
import { SocialLink } from '@/lib/types/profile';
import { socialLinkSchema, socialLinksSchema } from '@/lib/validation/schemas';

type SocialLinkRow = Database['public']['Tables']['social_links']['Row'];
type SocialLinkInsert = Database['public']['Tables']['social_links']['Insert'];
type SocialLinkUpdate = Database['public']['Tables']['social_links']['Update'];

/**
 * Get all social links for a profile
 */
export async function getSocialLinks(profileId: string): Promise<SocialLink[]> {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .eq('profile_id', profileId)
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch social links: ${error.message}`);
  }

  return (data || []).map(transformSocialLinkRow);
}

/**
 * Create a new social link
 */
export async function createSocialLink(
  profileId: string,
  linkData: {
    platform: string;
    url: string;
    display_order?: number;
    visible?: boolean;
  }
): Promise<SocialLink> {
  // Validate input
  const validated = socialLinkSchema.parse(linkData);

  const insertData: SocialLinkInsert = {
    profile_id: profileId,
    platform: validated.platform,
    url: validated.url,
    display_order: validated.display_order ?? 0,
    visible: validated.visible ?? true,
  };

  const { data, error } = await supabase
    .from('social_links')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create social link: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to create social link: No data returned');
  }

  return transformSocialLinkRow(data);
}

/**
 * Update an existing social link
 */
export async function updateSocialLink(
  linkId: string,
  updates: Partial<{
    platform: string;
    url: string;
    display_order: number;
    visible: boolean;
  }>
): Promise<SocialLink> {
  // Validate input if provided
  const updateData: SocialLinkUpdate = {};
  if (updates.platform !== undefined) updateData.platform = updates.platform;
  if (updates.url !== undefined) updateData.url = updates.url;
  if (updates.display_order !== undefined) updateData.display_order = updates.display_order;
  if (updates.visible !== undefined) updateData.visible = updates.visible;

  // Validate if any fields are being updated
  if (Object.keys(updateData).length > 0) {
    const validationData = {
      platform: updateData.platform || 'other',
      url: updateData.url || 'https://example.com',
      display_order: updateData.display_order ?? 0,
      visible: updateData.visible ?? true,
    };
    socialLinkSchema.partial().parse(validationData);
  }

  const { data, error } = await supabase
    .from('social_links')
    .update(updateData)
    .eq('id', linkId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Social link not found');
    }
    throw new Error(`Failed to update social link: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to update social link: No data returned');
  }

  return transformSocialLinkRow(data);
}

/**
 * Delete a social link
 */
export async function deleteSocialLink(linkId: string): Promise<void> {
  const { error } = await supabase.from('social_links').delete().eq('id', linkId);

  if (error) {
    throw new Error(`Failed to delete social link: ${error.message}`);
  }
}

/**
 * Replace all social links for a profile (delete existing, create new)
 */
export async function replaceSocialLinks(
  profileId: string,
  links: Array<{
    platform: string;
    url: string;
    display_order?: number;
    visible?: boolean;
  }>
): Promise<SocialLink[]> {
  // Validate all links
  const validated = socialLinksSchema.parse(links);

  // Delete existing links
  const { error: deleteError } = await supabase
    .from('social_links')
    .delete()
    .eq('profile_id', profileId);

  if (deleteError) {
    throw new Error(`Failed to delete existing social links: ${deleteError.message}`);
  }

  // Create new links
  if (validated.length === 0) {
    return [];
  }

  const insertData: SocialLinkInsert[] = validated.map((link, index) => ({
    profile_id: profileId,
    platform: link.platform,
    url: link.url,
    display_order: link.display_order ?? index,
    visible: link.visible ?? true,
  }));

  const { data, error } = await supabase
    .from('social_links')
    .insert(insertData)
    .select()
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to create social links: ${error.message}`);
  }

  return (data || []).map(transformSocialLinkRow);
}

/**
 * Transform database row to SocialLink type
 */
function transformSocialLinkRow(row: SocialLinkRow): SocialLink {
  return {
    id: row.id,
    profile_id: row.profile_id,
    platform: row.platform as SocialLink['platform'],
    url: row.url,
    display_order: row.display_order ?? 0,
    visible: row.visible ?? true,
    created_at: row.created_at || new Date().toISOString(),
  };
}

