# Data Model: Digital Business Card Application

**Feature**: 002-digital-business-card  
**Date**: 2025-01-27  
**Backend**: Convex

## Schema Overview

The data model consists of five main entities:

1. **users** - User accounts linked to Clerk authentication
2. **cards** - Digital business cards (one per user)
3. **socialLinks** - Social media/platform links (many per card)
4. **contacts** - Saved contacts in user's network
5. **meetingMetadata** - Meeting context for contacts

## Entity Definitions

### users

Represents a user account in the application, linked to Clerk authentication.

**Fields**:

- `_id`: `Id<"users">` - Convex document ID
- `clerkUserId`: `string` - Clerk user ID (unique, indexed)
- `email`: `string` - User email (from Clerk, indexed for lookups)
- `phoneNumber`: `string | undefined` - User phone number (optional, indexed for lookups)
- `createdAt`: `number` - Timestamp of account creation
- `updatedAt`: `number` - Timestamp of last update
- `onboardingCompleted`: `boolean` - Whether user has completed onboarding (name + email minimum)

**Relationships**:

- One-to-one with `cards` (via `userId`)
- One-to-many with `contacts` (as `ownerId`)

**Validation Rules**:

- `clerkUserId` must be unique
- `email` must be valid email format
- `phoneNumber` must be valid phone format if provided

**State Transitions**:

- Created when user first authenticates via Clerk
- `onboardingCompleted` set to `true` when user completes onboarding (has name + email in card)

### cards

Represents a user's digital business card profile.

**Fields**:

- `_id`: `Id<"cards">` - Convex document ID
- `userId`: `Id<"users">` - Reference to user (unique, one card per user)
- `shareId`: `string` - Unique share link identifier (indexed, used in public URLs)
- `name`: `string` - User's full name (required)
- `title`: `string | undefined` - Job title
- `email`: `string` - Email address (required, validated)
- `phoneNumber`: `string | undefined` - Phone number (validated if provided)
- `company`: `string | undefined` - Company name
- `role`: `string | undefined` - Role at company
- `bio`: `string | undefined` - Short bio
- `tags`: `string[]` - Custom tags (array of strings)
- `profilePhotoId`: `Id<"_storage"> | undefined` - Convex file storage ID for profile photo
- `resumeFileId`: `Id<"_storage"> | undefined` - Convex file storage ID for resume
- `createdAt`: `number` - Timestamp of card creation
- `updatedAt`: `number` - Timestamp of last update

**Relationships**:

- Many-to-one with `users` (via `userId`)
- One-to-many with `socialLinks` (via `cardId`)

**Validation Rules**:

- `name` is required (minimum 1 character)
- `email` is required and must be valid email format
- `phoneNumber` must be valid phone format if provided
- `shareId` must be unique
- `tags` array maximum length: 20 (reasonable limit)
- File size limits: Profile photo max 5MB, Resume max 10MB

**State Transitions**:

- Created during onboarding (with minimum name + email)
- Updated whenever user edits profile
- Share link remains valid even after updates (points to card, not snapshot)

### socialLinks

Represents a social media or platform link associated with a card.

**Fields**:

- `_id`: `Id<"socialLinks">` - Convex document ID
- `cardId`: `Id<"cards">` - Reference to card
- `platform`: `string` - Platform type (e.g., "linkedin", "github", "twitter", "bluesky", "facebook", "instagram", "portfolio", "custom")
- `url`: `string` - Full URL to the platform profile/page
- `order`: `number` - Display order (for sorting)
- `createdAt`: `number` - Timestamp of creation

**Relationships**:

- Many-to-one with `cards` (via `cardId`)

**Validation Rules**:

- `platform` must be one of: "linkedin", "github", "twitter", "bluesky", "facebook", "instagram", "portfolio", "custom"
- `url` must be valid URL format
- `url` must be unique per card (no duplicate links for same platform)

**State Transitions**:

- Created when user adds social link
- Updated when user modifies link URL
- Deleted when user removes link

### contacts

Represents a saved contact in a user's network (received from another app user).

**Fields**:

- `_id`: `Id<"contacts">` - Convex document ID
- `ownerId`: `Id<"users">` - User who saved this contact
- `sourceCardId`: `Id<"cards">` - Reference to the card that was shared
- `sourceUserId`: `Id<"users">` - Reference to the user who shared the card
- `acceptedAt`: `number` - Timestamp when contact was accepted
- `updatedAt`: `number` - Timestamp when contact was last updated
- `tags`: `string[]` - Tags added by the owner (for organization)
- `meetingMetadataId`: `Id<"meetingMetadata"> | undefined` - Reference to meeting metadata (optional)

**Relationships**:

- Many-to-one with `users` (as `ownerId`)
- Many-to-one with `cards` (as `sourceCardId`)
- One-to-one with `meetingMetadata` (optional, via `meetingMetadataId`)

**Validation Rules**:

- Duplicate prevention: Cannot have two contacts with same `sourceUserId` for same `ownerId`
- When duplicate detected (by email/phone matching), update existing contact instead of creating new

**State Transitions**:

- Created when user accepts a shared card
- Updated when same person shares card again (updates with latest card information)
- Tags and meeting metadata can be updated independently

### meetingMetadata

Represents contextual information about when and where a user met a contact.

**Fields**:

- `_id`: `Id<"meetingMetadata">` - Convex document ID
- `contactId`: `Id<"contacts">` - Reference to contact (unique, one per contact)
- `date`: `number` - Date when they met (timestamp)
- `location`: `string | undefined` - Location where they met (optional)
- `notes`: `string | undefined` - Additional notes (optional)
- `createdAt`: `number` - Timestamp of creation
- `updatedAt`: `number` - Timestamp of last update

**Relationships**:

- One-to-one with `contacts` (via `contactId`)

**Validation Rules**:

- `date` must be valid timestamp
- `location` and `notes` are optional text fields

**State Transitions**:

- Created when user adds meeting context to a contact
- Updated when user modifies meeting information

## Indexes

For optimal query performance:

1. **users**:
   - Index on `clerkUserId` (unique)
   - Index on `email` (for lookups)
   - Index on `phoneNumber` (for lookups, sparse)

2. **cards**:
   - Index on `userId` (unique, one card per user)
   - Index on `shareId` (unique, for public web views)

3. **socialLinks**:
   - Index on `cardId` (for fetching all links for a card)
   - Index on `(cardId, platform)` (for duplicate detection)

4. **contacts**:
   - Index on `ownerId` (for fetching user's contacts)
   - Index on `(ownerId, sourceUserId)` (for duplicate detection)
   - Index on `sourceCardId` (for card lookups)

5. **meetingMetadata**:
   - Index on `contactId` (unique, one per contact)

## Data Flow Patterns

### Card Creation (Onboarding)

1. User authenticates via Clerk
2. Convex creates/updates `users` record
3. User completes onboarding form
4. Convex creates `cards` record with minimum name + email
5. `users.onboardingCompleted` set to `true`
6. Share link (`shareId`) generated automatically

### Card Update

1. User edits profile in app
2. Convex mutation updates `cards` record
3. `updatedAt` timestamp updated
4. Share link remains unchanged (still valid)

### Social Link Management

1. User adds social link
2. Convex creates `socialLinks` record
3. Validation ensures no duplicate platform per card
4. Links ordered by `order` field for display

### Contact Sharing and Acceptance

1. User A shares card with User B (via QR scan or lookup)
2. Convex creates pending share request (or uses notifications)
3. User B accepts card
4. Convex checks for duplicate (by email/phone matching)
5. If duplicate: Update existing `contacts` record
6. If new: Create `contacts` record
7. Notification sent to User A

### Duplicate Detection Logic

```typescript
// Pseudo-code for duplicate detection
function findDuplicateContact(ownerId, cardData) {
  // Try email first
  const emailMatch = contacts
    .filter((c) => c.ownerId === ownerId)
    .join(cards, (c) => c.sourceCardId === cards._id)
    .filter((c) => cards.email === cardData.email)
    .first();

  if (emailMatch) return emailMatch;

  // Fallback to phone number
  if (cardData.phoneNumber) {
    const phoneMatch = contacts
      .filter((c) => c.ownerId === ownerId)
      .join(cards, (c) => c.sourceCardId === cards._id)
      .filter((c) => cards.phoneNumber === cardData.phoneNumber)
      .first();

    if (phoneMatch) return phoneMatch;
  }

  return null; // No duplicate found
}
```

## File Storage

Convex file storage (`_storage`) used for:

- Profile photos (`cards.profilePhotoId`)
- Resume files (`cards.resumeFileId`)

**File Handling**:

- Upload: Client uploads file → Convex stores → Returns file ID
- Download: Convex generates secure URL → Client downloads
- Public access: Convex generates public URL for web view downloads

## Migration Considerations

**Initial Setup**:

- Create schema in Convex
- Set up indexes
- Configure Clerk integration
- Create user sync function

**Future Migrations**:

- Add new fields with default values
- Add new indexes as needed
- Handle data migrations if schema changes

## Data Privacy and Retention

- User data stored in Convex (subject to Convex data policies)
- Share links remain valid until explicitly revoked
- Deleted cards: Share links should return 404 or "card not found" message
- Contact data: Persists until user deletes contact
- File storage: Files remain until card is deleted or file is replaced
