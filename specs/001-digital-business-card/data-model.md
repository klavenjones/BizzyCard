# Data Model: Digital Business Card Application

**Feature**: Digital Business Card Application  
**Branch**: `001-digital-business-card`  
**Date**: 2025-11-21  
**Database**: Supabase PostgreSQL  
**Status**: Phase 1 Design

## Overview

This document defines the complete data model for BizzyCard, including database schema, entity relationships, validation rules, and state transitions. The schema is designed for PostgreSQL with Supabase row-level security (RLS) to enforce user-level isolation.

---

## Entity Relationship Diagram

```
┌─────────────────┐
│   clerk_users   │ (Managed by Clerk, external)
└────────┬────────┘
         │
         │ 1:1
         │
┌────────▼────────┐       1:N        ┌─────────────────┐
│   profiles      │◄──────────────────┤  social_links   │
└────────┬────────┘                   └─────────────────┘
         │
         │ 1:1 (optional)
         │
┌────────▼────────┐
│resume_attachments│
└─────────────────┘
         │
┌────────┴────────┐
│   profiles      │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐       M:N        ┌─────────────────┐
│ saved_contacts  │◄─────────────────►│   profiles      │
└────────┬────────┘                   └─────────────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│ contact_tags    │
└─────────────────┘

┌─────────────────┐       1:N        ┌─────────────────┐
│   profiles      │◄──────────────────┤ notifications   │
└─────────────────┘                   └─────────────────┘

┌─────────────────┐       M:N        ┌─────────────────┐
│   profiles      │◄─────────────────►│ card_exchanges  │
└─────────────────┘                   └─────────────────┘

┌─────────────────┐       1:1        ┌─────────────────┐
│   profiles      │◄──────────────────┤ shareable_links │
└─────────────────┘                   └─────────────────┘
```

---

## Database Schema

### 1. profiles

**Purpose**: Stores user profile information (digital business card data).  
**RLS Policy**: Users can only read/write their own profile. Public can read profiles via shareable link (validated by `shareable_links` table).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Profile unique identifier |
| `user_id` | `text` | NOT NULL, UNIQUE | Clerk user ID (from auth provider) |
| `email` | `text` | NOT NULL | User email (required, validated) |
| `phone` | `text` | NOT NULL | Phone number (required, international format) |
| `name` | `text` | NOT NULL | Full name (required) |
| `title` | `text` | NULL | Job title (optional) |
| `company` | `text` | NULL | Company name (optional) |
| `role` | `text` | NULL | Role at company (optional) |
| `bio` | `text` | NULL | Short bio (optional, max 500 chars) |
| `tags` | `text[]` | DEFAULT `'{}'` | Customizable tags (array of strings) |
| `profile_picture_url` | `text` | NULL | Supabase Storage URL for profile picture |
| `profile_picture_initials` | `text` | NULL | Fallback initials (computed from name) |
| `resume_visible` | `boolean` | DEFAULT `true` | Whether resume is included in shares |
| `created_at` | `timestamptz` | DEFAULT `now()` | Profile creation timestamp |
| `updated_at` | `timestamptz` | DEFAULT `now()` | Last update timestamp |
| `deleted_at` | `timestamptz` | NULL | Soft delete timestamp (NULL = active) |

**Indexes**:
- `CREATE INDEX idx_profiles_user_id ON profiles(user_id)` - Lookup by Clerk user
- `CREATE INDEX idx_profiles_email ON profiles(email)` - Search by email
- `CREATE INDEX idx_profiles_deleted_at ON profiles(deleted_at)` - Filter active profiles

**Validation Rules**:
- `email`: Standard email format (RFC 5322)
- `phone`: E.164 international format (validated via Zod)
- `name`: 1-100 characters, non-empty
- `bio`: Max 500 characters
- `tags`: Each tag 1-50 characters, max 20 tags
- `profile_picture_url`: Valid URL from Supabase Storage bucket `profile-pictures`

**Triggers**:
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

**RLS Policies**:
```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid()::text = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can create own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid()::text = user_id);

-- Public can read profiles via shareable link (checked in application layer)
CREATE POLICY "Public can view shared profiles"
ON profiles FOR SELECT
USING (deleted_at IS NULL);
```

---

### 2. social_links

**Purpose**: Stores social media and web presence links for user profiles.  
**RLS Policy**: Users can only CRUD their own social links.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Link unique identifier |
| `profile_id` | `uuid` | NOT NULL, FOREIGN KEY → `profiles(id)` ON DELETE CASCADE | Profile reference |
| `platform` | `text` | NOT NULL | Platform type (enum-like) |
| `url` | `text` | NOT NULL | Full URL to profile |
| `display_order` | `int` | DEFAULT `0` | Display order (for sorting) |
| `visible` | `boolean` | DEFAULT `true` | Whether link is shown in shares |
| `created_at` | `timestamptz` | DEFAULT `now()` | Creation timestamp |

**Indexes**:
- `CREATE INDEX idx_social_links_profile_id ON social_links(profile_id)` - Lookup by profile

**Validation Rules**:
- `platform`: One of `bluesky`, `linkedin`, `x`, `facebook`, `instagram`, `github`, `portfolio`, `other`
- `url`: Valid URL format (HTTPS preferred)
- `display_order`: 0-99 (for UI ordering)

**Check Constraints**:
```sql
ALTER TABLE social_links
ADD CONSTRAINT valid_platform
CHECK (platform IN ('bluesky', 'linkedin', 'x', 'facebook', 'instagram', 'github', 'portfolio', 'other'));
```

**RLS Policies**:
```sql
CREATE POLICY "Users can manage own social links"
ON social_links
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()::text));
```

---

### 3. resume_attachments

**Purpose**: Stores resume file metadata for user profiles (1:1 relationship).  
**RLS Policy**: Users can only CRUD their own resume attachment.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Attachment unique identifier |
| `profile_id` | `uuid` | NOT NULL, UNIQUE, FOREIGN KEY → `profiles(id)` ON DELETE CASCADE | Profile reference (1:1) |
| `file_url` | `text` | NOT NULL | Supabase Storage URL for resume PDF |
| `file_name` | `text` | NOT NULL | Original file name (for downloads) |
| `file_size` | `bigint` | NOT NULL | File size in bytes (max 10MB) |
| `uploaded_at` | `timestamptz` | DEFAULT `now()` | Upload timestamp |

**Indexes**:
- `CREATE INDEX idx_resume_profile_id ON resume_attachments(profile_id)` - Lookup by profile

**Validation Rules**:
- `file_url`: Valid URL from Supabase Storage bucket `resumes`
- `file_size`: Max 10485760 bytes (10MB)
- `file_name`: Must end with `.pdf`

**Check Constraints**:
```sql
ALTER TABLE resume_attachments
ADD CONSTRAINT valid_file_size
CHECK (file_size <= 10485760);
```

**RLS Policies**:
```sql
CREATE POLICY "Users can manage own resume"
ON resume_attachments
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()::text));
```

---

### 4. shareable_links

**Purpose**: Generates unique shareable URLs for each profile (for QR codes and web cards).  
**RLS Policy**: Users can only read their own shareable link. Public can read any active link (for web card validation).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Link unique identifier |
| `profile_id` | `uuid` | NOT NULL, UNIQUE, FOREIGN KEY → `profiles(id)` ON DELETE CASCADE | Profile reference (1:1) |
| `short_code` | `text` | NOT NULL, UNIQUE | Short code for URL (e.g., `abc123xyz`) |
| `full_url` | `text` | NOT NULL | Full shareable URL (e.g., `https://bizzycard.app/card/abc123xyz`) |
| `access_count` | `bigint` | DEFAULT `0` | Number of times link accessed (analytics) |
| `created_at` | `timestamptz` | DEFAULT `now()` | Link creation timestamp |
| `last_accessed_at` | `timestamptz` | NULL | Last access timestamp |

**Indexes**:
- `CREATE UNIQUE INDEX idx_shareable_links_short_code ON shareable_links(short_code)` - Lookup by short code
- `CREATE INDEX idx_shareable_links_profile_id ON shareable_links(profile_id)` - Lookup by profile

**Validation Rules**:
- `short_code`: 12 characters, alphanumeric (generated via nanoid or similar)
- `full_url`: `https://bizzycard.app/card/{short_code}`

**Triggers**:
```sql
-- Auto-generate short code and full URL on insert
CREATE OR REPLACE FUNCTION generate_shareable_link()
RETURNS TRIGGER AS $$
BEGIN
  NEW.short_code = nanoid(12); -- Custom function or generate in application
  NEW.full_url = 'https://bizzycard.app/card/' || NEW.short_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shareable_links_generate
BEFORE INSERT ON shareable_links
FOR EACH ROW
EXECUTE FUNCTION generate_shareable_link();
```

**RLS Policies**:
```sql
CREATE POLICY "Users can view own shareable link"
ON shareable_links FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()::text));

CREATE POLICY "Public can view active shareable links"
ON shareable_links FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE deleted_at IS NULL));
```

---

### 5. saved_contacts

**Purpose**: Stores business cards saved by users in their Network tab (M:N relationship between users).  
**RLS Policy**: Users can only CRUD their own saved contacts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Contact unique identifier |
| `user_id` | `text` | NOT NULL | Clerk user ID (who saved the contact) |
| `profile_id` | `uuid` | NOT NULL, FOREIGN KEY → `profiles(id)` ON DELETE SET NULL | Saved profile reference |
| `custom_tags` | `text[]` | DEFAULT `'{}'` | Custom tags (e.g., "Conference 2025") |
| `notes` | `text` | NULL | Notes about where/when met (max 1000 chars) |
| `is_favorite` | `boolean` | DEFAULT `false` | Whether contact is marked as favorite |
| `saved_at` | `timestamptz` | DEFAULT `now()` | When contact was saved |
| `last_viewed_at` | `timestamptz` | NULL | Last time contact was viewed |
| `profile_updated_since_save` | `boolean` | DEFAULT `false` | Whether source profile updated since save |

**Indexes**:
- `CREATE INDEX idx_saved_contacts_user_id ON saved_contacts(user_id)` - Lookup by user
- `CREATE INDEX idx_saved_contacts_profile_id ON saved_contacts(profile_id)` - Lookup by profile
- `CREATE INDEX idx_saved_contacts_tags ON saved_contacts USING GIN(custom_tags)` - Search by tags

**Validation Rules**:
- `notes`: Max 1000 characters
- `custom_tags`: Each tag 1-50 characters, max 30 tags

**Triggers**:
```sql
-- Mark contact as updated when source profile changes
CREATE OR REPLACE FUNCTION mark_contacts_updated()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE saved_contacts
  SET profile_updated_since_save = true
  WHERE profile_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_update_saved_contacts
AFTER UPDATE ON profiles
FOR EACH ROW
WHEN (OLD.updated_at IS DISTINCT FROM NEW.updated_at)
EXECUTE FUNCTION mark_contacts_updated();
```

**RLS Policies**:
```sql
CREATE POLICY "Users can manage own saved contacts"
ON saved_contacts
USING (user_id = auth.uid()::text);
```

---

### 6. card_exchanges

**Purpose**: Tracks mutual card exchanges between app users (in-app QR scan exchanges).  
**RLS Policy**: Users can only view exchanges they're involved in.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Exchange unique identifier |
| `initiator_profile_id` | `uuid` | NOT NULL, FOREIGN KEY → `profiles(id)` | Profile who initiated exchange |
| `recipient_profile_id` | `uuid` | NOT NULL, FOREIGN KEY → `profiles(id)` | Profile who received exchange |
| `exchange_method` | `text` | DEFAULT `'in_app_scan'` | Exchange method (enum-like) |
| `initiator_accepted` | `boolean` | DEFAULT `true` | Initiator acceptance (auto-accepted) |
| `recipient_accepted` | `boolean` | DEFAULT `false` | Recipient acceptance status |
| `exchanged_at` | `timestamptz` | DEFAULT `now()` | Exchange timestamp |
| `completed_at` | `timestamptz` | NULL | When both parties accepted |

**Indexes**:
- `CREATE INDEX idx_card_exchanges_initiator ON card_exchanges(initiator_profile_id)` - Lookup by initiator
- `CREATE INDEX idx_card_exchanges_recipient ON card_exchanges(recipient_profile_id)` - Lookup by recipient

**Validation Rules**:
- `exchange_method`: One of `in_app_scan`, `qr_scan`, `manual`
- `initiator_profile_id != recipient_profile_id` (can't exchange with self)

**Check Constraints**:
```sql
ALTER TABLE card_exchanges
ADD CONSTRAINT no_self_exchange
CHECK (initiator_profile_id != recipient_profile_id);
```

**Triggers**:
```sql
-- Set completed_at when both parties accept
CREATE OR REPLACE FUNCTION complete_exchange()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.initiator_accepted = true AND NEW.recipient_accepted = true THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER card_exchanges_complete
BEFORE UPDATE ON card_exchanges
FOR EACH ROW
EXECUTE FUNCTION complete_exchange();
```

**RLS Policies**:
```sql
CREATE POLICY "Users can view own exchanges"
ON card_exchanges FOR SELECT
USING (
  initiator_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()::text)
  OR recipient_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()::text)
);
```

---

### 7. notifications

**Purpose**: Stores notifications for users (card saved, profile updated, exchange requests).  
**RLS Policy**: Users can only view/update their own notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Notification unique identifier |
| `user_id` | `text` | NOT NULL | Clerk user ID (recipient) |
| `type` | `text` | NOT NULL | Notification type (enum-like) |
| `title` | `text` | NOT NULL | Notification title |
| `message` | `text` | NOT NULL | Notification message body |
| `related_profile_id` | `uuid` | NULL, FOREIGN KEY → `profiles(id)` | Related profile (who triggered) |
| `related_exchange_id` | `uuid` | NULL, FOREIGN KEY → `card_exchanges(id)` | Related exchange (if applicable) |
| `is_read` | `boolean` | DEFAULT `false` | Whether notification was read |
| `push_sent` | `boolean` | DEFAULT `false` | Whether push notification sent |
| `created_at` | `timestamptz` | DEFAULT `now()` | Notification creation timestamp |
| `read_at` | `timestamptz` | NULL | When notification was read |

**Indexes**:
- `CREATE INDEX idx_notifications_user_id ON notifications(user_id)` - Lookup by user
- `CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read)` - Unread notifications

**Validation Rules**:
- `type`: One of `card_saved`, `profile_updated`, `exchange_request`, `exchange_accepted`
- `title`: 1-100 characters
- `message`: 1-500 characters

**Check Constraints**:
```sql
ALTER TABLE notifications
ADD CONSTRAINT valid_notification_type
CHECK (type IN ('card_saved', 'profile_updated', 'exchange_request', 'exchange_accepted'));
```

**Triggers**:
```sql
-- Set read_at when notification is marked as read
CREATE OR REPLACE FUNCTION set_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = true AND OLD.is_read = false THEN
    NEW.read_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_read_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION set_notification_read_at();
```

**RLS Policies**:
```sql
CREATE POLICY "Users can manage own notifications"
ON notifications
USING (user_id = auth.uid()::text);
```

---

### 8. onboarding_state

**Purpose**: Tracks whether users have completed onboarding (prevent showing onboarding again).  
**RLS Policy**: Users can only view/update their own onboarding state.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | State unique identifier |
| `user_id` | `text` | NOT NULL, UNIQUE | Clerk user ID |
| `completed` | `boolean` | DEFAULT `false` | Whether onboarding completed |
| `skipped` | `boolean` | DEFAULT `false` | Whether onboarding was skipped |
| `completed_at` | `timestamptz` | NULL | Completion timestamp |

**Indexes**:
- `CREATE UNIQUE INDEX idx_onboarding_user_id ON onboarding_state(user_id)` - Lookup by user

**RLS Policies**:
```sql
CREATE POLICY "Users can manage own onboarding state"
ON onboarding_state
USING (user_id = auth.uid()::text);
```

---

## Entity Validation Rules Summary

### Profile (profiles)
- **Required**: `user_id`, `email`, `phone`, `name`
- **Email**: RFC 5322 format, unique per user
- **Phone**: E.164 international format (e.g., +1234567890)
- **Name**: 1-100 chars, non-empty
- **Bio**: Max 500 chars
- **Tags**: Max 20 tags, each 1-50 chars
- **Profile picture**: Max 5MB, formats: JPG, PNG, WebP

### Social Link (social_links)
- **Required**: `profile_id`, `platform`, `url`
- **Platform**: Must be one of supported platforms or `other`
- **URL**: Valid HTTPS URL format
- **Display order**: 0-99

### Resume Attachment (resume_attachments)
- **Required**: `profile_id`, `file_url`, `file_name`, `file_size`
- **File size**: Max 10MB (10485760 bytes)
- **File format**: PDF only (.pdf extension)

### Saved Contact (saved_contacts)
- **Required**: `user_id`, `profile_id`
- **Notes**: Max 1000 chars
- **Custom tags**: Max 30 tags, each 1-50 chars
- **No duplicates**: Unique constraint on (user_id, profile_id)

### Notification (notifications)
- **Required**: `user_id`, `type`, `title`, `message`
- **Type**: Must be valid notification type
- **Title**: 1-100 chars
- **Message**: 1-500 chars

---

## State Transitions

### Profile Lifecycle
```
[New User] → [Onboarding] → [Profile Created] → [Active]
                                ↓
                          [Profile Updated] (triggers saved_contacts.profile_updated_since_save)
                                ↓
                          [Profile Deleted] (soft delete, sets deleted_at)
                                ↓
                          [Shareable Link Invalidated]
```

### Card Exchange Flow
```
[User A displays QR] → [User B scans in-app] → [Exchange Created]
                                                    ↓
                                          [initiator_accepted=true]
                                          [recipient_accepted=false]
                                                    ↓
                                          [User B accepts]
                                                    ↓
                                          [recipient_accepted=true]
                                          [completed_at=now()]
                                                    ↓
                                          [Both cards added to saved_contacts]
                                          [Notifications sent to both users]
```

### Notification Flow
```
[Triggering Event] → [Notification Created] → [Push Sent (if enabled)] → [User Views] → [Marked as Read]
                                                      ↓
                                          [In-app notification shown if push failed]
```

### Contact Update Flow
```
[Profile Updated] → [Trigger: mark_contacts_updated()] → [saved_contacts.profile_updated_since_save=true]
                                                               ↓
                                                    [Notification sent to users who saved contact]
                                                               ↓
                                                    [User views contact → sees "Updated" badge]
                                                               ↓
                                                    [User refreshes contact → profile_updated_since_save=false]
```

---

## Data Integrity & Constraints

### Referential Integrity
- All foreign keys use `ON DELETE CASCADE` or `ON DELETE SET NULL` as appropriate
- Deleting a profile cascades to: social_links, resume_attachments, shareable_links
- Deleting a profile sets NULL in: saved_contacts.profile_id (preserve contact for user who saved it)

### Unique Constraints
- `profiles.user_id`: One profile per Clerk user
- `shareable_links.short_code`: Unique short codes for URLs
- `shareable_links.profile_id`: One shareable link per profile
- `resume_attachments.profile_id`: One resume per profile
- `onboarding_state.user_id`: One onboarding state per user
- `saved_contacts(user_id, profile_id)`: User can't save same contact twice

### Check Constraints
- `social_links.platform`: Must be valid platform type
- `resume_attachments.file_size`: Max 10MB
- `card_exchanges`: No self-exchanges
- `notifications.type`: Must be valid notification type

---

## Security: Row-Level Security (RLS)

All tables enforce row-level security policies:

1. **User Isolation**: Users can only access their own data (profiles, social_links, resume_attachments, saved_contacts, notifications, onboarding_state)
2. **Public Read**: Public can read profiles and shareable_links for web card viewing (validated in application layer)
3. **Clerk JWT**: Policies use `auth.uid()` which extracts user ID from Clerk JWT token
4. **Supabase RLS**: Enforced at database level, cannot be bypassed even with direct API access

**Example Policy Structure**:
```sql
-- Enable RLS on table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid()::text = user_id);
```

---

## Database Migrations

### Migration Strategy
- Use Supabase migrations (`supabase/migrations/`)
- Sequential numbering: `001_initial_schema.sql`, `002_add_notifications.sql`, etc.
- Each migration is idempotent (can be run multiple times safely)
- Test migrations in local Supabase before deploying to production

### Initial Migration (`001_initial_schema.sql`)
```sql
-- Create tables in dependency order
-- 1. profiles (no dependencies)
-- 2. social_links (depends on profiles)
-- 3. resume_attachments (depends on profiles)
-- 4. shareable_links (depends on profiles)
-- 5. saved_contacts (depends on profiles)
-- 6. card_exchanges (depends on profiles)
-- 7. notifications (depends on profiles, card_exchanges)
-- 8. onboarding_state (no dependencies)

-- Create triggers
-- Create RLS policies
-- Create indexes
```

---

## Supabase Storage Buckets

### profile-pictures
- **Purpose**: Store user profile pictures
- **Access**: Public (read), authenticated users can upload (RLS policy validates user_id)
- **Max file size**: 5MB
- **Allowed formats**: JPG, PNG, WebP
- **Transformations**: Auto-resize to 512x512, compress to WebP

### resumes
- **Purpose**: Store user resume PDFs
- **Access**: Public (read via obscured URLs), authenticated users can upload (RLS policy validates user_id)
- **Max file size**: 10MB
- **Allowed formats**: PDF only

**Storage RLS Policies**:
```sql
-- profile-pictures bucket
CREATE POLICY "Users can upload own profile picture"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

-- resumes bucket (similar structure)
```

---

## TypeScript Types

TypeScript types will be auto-generated from Supabase schema using `supabase gen types typescript`. Example types:

```typescript
// Generated types in lib/types/database.ts
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          phone: string;
          name: string;
          title: string | null;
          // ... all columns
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          // ... required fields
        };
        Update: {
          email?: string;
          phone?: string;
          // ... updatable fields
        };
      };
      // ... other tables
    };
  };
};

// Domain types in lib/types/profile.ts
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type SocialLink = Database['public']['Tables']['social_links']['Row'];
// ... other types
```

---

## Query Patterns

### Common Queries

**Get user profile with social links and resume**:
```sql
SELECT
  p.*,
  COALESCE(
    json_agg(sl ORDER BY sl.display_order) FILTER (WHERE sl.id IS NOT NULL),
    '[]'
  ) AS social_links,
  json_build_object(
    'file_url', ra.file_url,
    'file_name', ra.file_name,
    'file_size', ra.file_size
  ) AS resume
FROM profiles p
LEFT JOIN social_links sl ON sl.profile_id = p.id
LEFT JOIN resume_attachments ra ON ra.profile_id = p.id
WHERE p.user_id = $1 AND p.deleted_at IS NULL
GROUP BY p.id, ra.file_url, ra.file_name, ra.file_size;
```

**Get saved contacts with profile data**:
```sql
SELECT
  sc.*,
  p.name,
  p.title,
  p.company,
  p.profile_picture_url,
  p.profile_picture_initials
FROM saved_contacts sc
JOIN profiles p ON p.id = sc.profile_id
WHERE sc.user_id = $1
ORDER BY sc.saved_at DESC;
```

**Search contacts by name or company**:
```sql
SELECT sc.*, p.*
FROM saved_contacts sc
JOIN profiles p ON p.id = sc.profile_id
WHERE sc.user_id = $1
  AND (
    p.name ILIKE '%' || $2 || '%'
    OR p.company ILIKE '%' || $2 || '%'
  )
ORDER BY p.name;
```

---

## Next Steps

✅ **Phase 1 Data Model Complete**

**Next**:
1. Generate API contracts (`contracts/api-endpoints.md`, `contracts/types.ts`)
2. Generate quickstart guide (`quickstart.md`)
3. Update agent context with data model
4. Implement database migrations in `supabase/migrations/001_initial_schema.sql`

