/**
 * TypeScript Type Definitions for BizzyCard API
 * 
 * These types will be auto-generated from Supabase schema using:
 * `npx supabase gen types typescript --project-id <project-id> > lib/types/database.ts`
 * 
 * This file serves as documentation for the expected types.
 * The actual types in lib/types/database.ts will be generated and should match this structure.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================================================
// Database Schema Types
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          phone: string
          name: string
          title: string | null
          company: string | null
          role: string | null
          bio: string | null
          tags: string[]
          profile_picture_url: string | null
          profile_picture_initials: string | null
          resume_visible: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          phone: string
          name: string
          title?: string | null
          company?: string | null
          role?: string | null
          bio?: string | null
          tags?: string[]
          profile_picture_url?: string | null
          profile_picture_initials?: string | null
          resume_visible?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          phone?: string
          name?: string
          title?: string | null
          company?: string | null
          role?: string | null
          bio?: string | null
          tags?: string[]
          profile_picture_url?: string | null
          profile_picture_initials?: string | null
          resume_visible?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      social_links: {
        Row: {
          id: string
          profile_id: string
          platform: SocialPlatform
          url: string
          display_order: number
          visible: boolean
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          platform: SocialPlatform
          url: string
          display_order?: number
          visible?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          platform?: SocialPlatform
          url?: string
          display_order?: number
          visible?: boolean
          created_at?: string
        }
      }
      resume_attachments: {
        Row: {
          id: string
          profile_id: string
          file_url: string
          file_name: string
          file_size: number
          uploaded_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          file_url: string
          file_name: string
          file_size: number
          uploaded_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          file_url?: string
          file_name?: string
          file_size?: number
          uploaded_at?: string
        }
      }
      shareable_links: {
        Row: {
          id: string
          profile_id: string
          short_code: string
          full_url: string
          access_count: number
          created_at: string
          last_accessed_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          short_code?: string
          full_url?: string
          access_count?: number
          created_at?: string
          last_accessed_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          short_code?: string
          full_url?: string
          access_count?: number
          created_at?: string
          last_accessed_at?: string | null
        }
      }
      saved_contacts: {
        Row: {
          id: string
          user_id: string
          profile_id: string
          custom_tags: string[]
          notes: string | null
          is_favorite: boolean
          saved_at: string
          last_viewed_at: string | null
          profile_updated_since_save: boolean
        }
        Insert: {
          id?: string
          user_id: string
          profile_id: string
          custom_tags?: string[]
          notes?: string | null
          is_favorite?: boolean
          saved_at?: string
          last_viewed_at?: string | null
          profile_updated_since_save?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          profile_id?: string
          custom_tags?: string[]
          notes?: string | null
          is_favorite?: boolean
          saved_at?: string
          last_viewed_at?: string | null
          profile_updated_since_save?: boolean
        }
      }
      card_exchanges: {
        Row: {
          id: string
          initiator_profile_id: string
          recipient_profile_id: string
          exchange_method: ExchangeMethod
          initiator_accepted: boolean
          recipient_accepted: boolean
          exchanged_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          initiator_profile_id: string
          recipient_profile_id: string
          exchange_method?: ExchangeMethod
          initiator_accepted?: boolean
          recipient_accepted?: boolean
          exchanged_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          initiator_profile_id?: string
          recipient_profile_id?: string
          exchange_method?: ExchangeMethod
          initiator_accepted?: boolean
          recipient_accepted?: boolean
          exchanged_at?: string
          completed_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          related_profile_id: string | null
          related_exchange_id: string | null
          is_read: boolean
          push_sent: boolean
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          related_profile_id?: string | null
          related_exchange_id?: string | null
          is_read?: boolean
          push_sent?: boolean
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: NotificationType
          title?: string
          message?: string
          related_profile_id?: string | null
          related_exchange_id?: string | null
          is_read?: boolean
          push_sent?: boolean
          created_at?: string
          read_at?: string | null
        }
      }
      onboarding_state: {
        Row: {
          id: string
          user_id: string
          completed: boolean
          skipped: boolean
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          completed?: boolean
          skipped?: boolean
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          completed?: boolean
          skipped?: boolean
          completed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      social_platform: SocialPlatform
      exchange_method: ExchangeMethod
      notification_type: NotificationType
    }
  }
}

// ============================================================================
// Enum Types
// ============================================================================

export type SocialPlatform =
  | 'bluesky'
  | 'linkedin'
  | 'x'
  | 'facebook'
  | 'instagram'
  | 'github'
  | 'portfolio'
  | 'other'

export type ExchangeMethod = 'in_app_scan' | 'qr_scan' | 'manual'

export type NotificationType =
  | 'card_saved'
  | 'profile_updated'
  | 'exchange_request'
  | 'exchange_accepted'

// ============================================================================
// Helper Types for Convenience
// ============================================================================

// Row types (for reading from database)
export type Profile = Database['public']['Tables']['profiles']['Row']
export type SocialLink = Database['public']['Tables']['social_links']['Row']
export type ResumeAttachment = Database['public']['Tables']['resume_attachments']['Row']
export type ShareableLink = Database['public']['Tables']['shareable_links']['Row']
export type SavedContact = Database['public']['Tables']['saved_contacts']['Row']
export type CardExchange = Database['public']['Tables']['card_exchanges']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type OnboardingState = Database['public']['Tables']['onboarding_state']['Row']

// Insert types (for creating records)
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type SocialLinkInsert = Database['public']['Tables']['social_links']['Insert']
export type ResumeAttachmentInsert = Database['public']['Tables']['resume_attachments']['Insert']
export type ShareableLinkInsert = Database['public']['Tables']['shareable_links']['Insert']
export type SavedContactInsert = Database['public']['Tables']['saved_contacts']['Insert']
export type CardExchangeInsert = Database['public']['Tables']['card_exchanges']['Insert']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type OnboardingStateInsert = Database['public']['Tables']['onboarding_state']['Insert']

// Update types (for updating records)
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type SocialLinkUpdate = Database['public']['Tables']['social_links']['Update']
export type ResumeAttachmentUpdate = Database['public']['Tables']['resume_attachments']['Update']
export type ShareableLinkUpdate = Database['public']['Tables']['shareable_links']['Update']
export type SavedContactUpdate = Database['public']['Tables']['saved_contacts']['Update']
export type CardExchangeUpdate = Database['public']['Tables']['card_exchanges']['Update']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']
export type OnboardingStateUpdate = Database['public']['Tables']['onboarding_state']['Update']

// ============================================================================
// Extended Types with Relationships
// ============================================================================

export interface ProfileWithRelations extends Profile {
  social_links: SocialLink[]
  resume_attachments?: ResumeAttachment
  shareable_links?: ShareableLink
}

export interface SavedContactWithProfile extends SavedContact {
  profiles: ProfileWithRelations
}

export interface CardExchangeWithProfiles extends CardExchange {
  initiator_profile: Profile
  recipient_profile: Profile
}

export interface NotificationWithProfile extends Notification {
  related_profile?: Profile
  related_exchange?: CardExchange
}

// ============================================================================
// API Request/Response Types
// ============================================================================

// Profile Creation
export interface CreateProfileRequest {
  user_id: string
  email: string
  phone: string
  name: string
  title?: string
  company?: string
  role?: string
  bio?: string
  tags?: string[]
}

export interface UpdateProfileRequest {
  email?: string
  phone?: string
  name?: string
  title?: string
  company?: string
  role?: string
  bio?: string
  tags?: string[]
  resume_visible?: boolean
}

// Social Links
export interface CreateSocialLinkRequest {
  profile_id: string
  platform: SocialPlatform
  url: string
  display_order?: number
  visible?: boolean
}

export interface UpdateSocialLinkRequest {
  url?: string
  display_order?: number
  visible?: boolean
}

// Resume
export interface CreateResumeAttachmentRequest {
  profile_id: string
  file_url: string
  file_name: string
  file_size: number
}

// Saved Contacts
export interface SaveContactRequest {
  user_id: string
  profile_id: string
  custom_tags?: string[]
  notes?: string
}

export interface UpdateSavedContactRequest {
  custom_tags?: string[]
  notes?: string
  is_favorite?: boolean
  profile_updated_since_save?: boolean
}

// Card Exchanges
export interface CreateCardExchangeRequest {
  initiator_profile_id: string
  recipient_profile_id: string
  exchange_method?: ExchangeMethod
}

export interface AcceptCardExchangeRequest {
  recipient_accepted: boolean
}

// Notifications
export interface MarkNotificationReadRequest {
  is_read: boolean
}

// Onboarding
export interface UpdateOnboardingStateRequest {
  user_id: string
  completed?: boolean
  skipped?: boolean
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  error: {
    code: string
    message: string
    details?: string
  }
}

export interface ValidationError extends ApiError {
  error: {
    code: 'validation_error'
    message: string
    details: string
    field?: string
  }
}

export interface AuthenticationError extends ApiError {
  error: {
    code: 'authentication_error'
    message: 'Missing or invalid authentication token'
  }
}

export interface AuthorizationError extends ApiError {
  error: {
    code: 'authorization_error'
    message: 'You do not have permission to access this resource'
  }
}

export interface NotFoundError extends ApiError {
  error: {
    code: 'not_found'
    message: string
  }
}

export interface ConflictError extends ApiError {
  error: {
    code: 'conflict'
    message: string
  }
}

// ============================================================================
// Query Types (for React Query)
// ============================================================================

export interface ProfileQueryKey {
  scope: 'profile'
  userId: string
}

export interface SavedContactsQueryKey {
  scope: 'saved-contacts'
  userId: string
  filters?: {
    tags?: string[]
    search?: string
  }
}

export interface NotificationsQueryKey {
  scope: 'notifications'
  userId: string
  unreadOnly?: boolean
}

// ============================================================================
// Utility Types
// ============================================================================

// Type for Supabase query responses (always returns array)
export type QueryResponse<T> = T[] | null

// Type for Supabase single record responses
export type SingleResponse<T> = T | null

// Type for paginated responses
export interface PaginatedResponse<T> {
  data: T[]
  count: number | null
  hasMore: boolean
}

// ============================================================================
// Constants
// ============================================================================

export const SOCIAL_PLATFORMS: Record<SocialPlatform, { label: string; icon: string }> = {
  bluesky: { label: 'Bluesky', icon: 'bluesky' },
  linkedin: { label: 'LinkedIn', icon: 'linkedin' },
  x: { label: 'X (Twitter)', icon: 'twitter' },
  facebook: { label: 'Facebook', icon: 'facebook' },
  instagram: { label: 'Instagram', icon: 'instagram' },
  github: { label: 'GitHub', icon: 'github' },
  portfolio: { label: 'Portfolio', icon: 'globe' },
  other: { label: 'Other', icon: 'link' },
}

export const NOTIFICATION_TYPES: Record<NotificationType, { title: string; icon: string }> = {
  card_saved: { title: 'Card Saved', icon: 'bookmark' },
  profile_updated: { title: 'Profile Updated', icon: 'refresh-cw' },
  exchange_request: { title: 'Exchange Request', icon: 'user-plus' },
  exchange_accepted: { title: 'Exchange Accepted', icon: 'check-circle' },
}

// ============================================================================
// Validation Constants
// ============================================================================

export const VALIDATION_LIMITS = {
  PROFILE: {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    BIO_MAX_LENGTH: 500,
    TAGS_MAX_COUNT: 20,
    TAG_MIN_LENGTH: 1,
    TAG_MAX_LENGTH: 50,
  },
  RESUME: {
    MAX_FILE_SIZE: 10485760, // 10MB in bytes
    ALLOWED_FORMATS: ['.pdf'],
  },
  PROFILE_PICTURE: {
    MAX_FILE_SIZE: 5242880, // 5MB in bytes
    ALLOWED_FORMATS: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  SAVED_CONTACT: {
    NOTES_MAX_LENGTH: 1000,
    TAGS_MAX_COUNT: 30,
    TAG_MIN_LENGTH: 1,
    TAG_MAX_LENGTH: 50,
  },
  NOTIFICATION: {
    TITLE_MIN_LENGTH: 1,
    TITLE_MAX_LENGTH: 100,
    MESSAGE_MIN_LENGTH: 1,
    MESSAGE_MAX_LENGTH: 500,
  },
} as const

