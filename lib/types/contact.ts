/**
 * Domain types for SavedContact entity
 * Represents a contact saved by a user in their Network tab
 */

import type { Profile } from './profile';

export interface SavedContact {
  id: string;
  user_id: string;
  profile_id: string;
  custom_tags: string[];
  notes: string | null;
  is_favorite: boolean;
  saved_at: string;
  last_viewed_at: string | null;
  profile_updated_since_save: boolean;
}

export interface SavedContactWithProfile extends SavedContact {
  profile: Profile;
}

