# Convex Functions API Contract

**Feature**: 002-digital-business-card  
**Date**: 2025-01-27  
**Backend**: Convex

## Authentication

All functions (except HTTP endpoints) require Clerk authentication. Convex validates Clerk session tokens automatically via `@convex-dev/auth-clerk`.

## Queries (Read Operations)

### users.getCurrentUser

Get the current authenticated user's profile.

**Input**: None (uses authenticated session)

**Output**:

```typescript
{
  _id: Id<"users">;
  clerkUserId: string;
  email: string;
  phoneNumber?: string;
  createdAt: number;
  updatedAt: number;
  onboardingCompleted: boolean;
} | null
```

**Errors**: Returns `null` if user not found

---

### users.getByEmail

Look up a user by email address (for in-app sharing).

**Input**:

```typescript
{
  email: string;
}
```

**Output**:

```typescript
{
  _id: Id<"users">;
  clerkUserId: string;
  email: string;
  phoneNumber?: string;
} | null
```

**Errors**: Returns `null` if user not found

---

### users.getByPhone

Look up a user by phone number (for in-app sharing).

**Input**:

```typescript
{
  phoneNumber: string;
}
```

**Output**:

```typescript
{
  _id: Id<"users">;
  clerkUserId: string;
  email: string;
  phoneNumber?: string;
} | null
```

**Errors**: Returns `null` if user not found

---

### cards.getCurrentUserCard

Get the current user's digital card.

**Input**: None (uses authenticated session)

**Output**:

```typescript
{
  _id: Id<"cards">;
  userId: Id<"users">;
  shareId: string;
  name: string;
  title?: string;
  email: string;
  phoneNumber?: string;
  company?: string;
  role?: string;
  bio?: string;
  tags: string[];
  profilePhotoId?: Id<"_storage">;
  resumeFileId?: Id<"_storage">;
  createdAt: number;
  updatedAt: number;
} | null
```

**Errors**: Returns `null` if card not found

---

### cards.getByShareId

Get a card by share ID (for public web views).

**Input**:

```typescript
{
  shareId: string;
}
```

**Output**:

```typescript
{
  _id: Id<"cards">;
  userId: Id<"users">;
  shareId: string;
  name: string;
  title?: string;
  email: string;
  phoneNumber?: string;
  company?: string;
  role?: string;
  bio?: string;
  tags: string[];
  profilePhotoId?: Id<"_storage">;
  resumeFileId?: Id<"_storage">;
  createdAt: number;
  updatedAt: number;
} | null
```

**Errors**: Returns `null` if card not found or invalid share ID

---

### socialLinks.getByCardId

Get all social links for a card.

**Input**:

```typescript
{
  cardId: Id<'cards'>;
}
```

**Output**:

```typescript
Array<{
  _id: Id<'socialLinks'>;
  cardId: Id<'cards'>;
  platform: string;
  url: string;
  order: number;
  createdAt: number;
}>;
```

**Errors**: Returns empty array if no links found

---

### contacts.getByOwnerId

Get all contacts for the current user.

**Input**: None (uses authenticated session)

**Output**:

```typescript
Array<{
  _id: Id<'contacts'>;
  ownerId: Id<'users'>;
  sourceCardId: Id<'cards'>;
  sourceUserId: Id<'users'>;
  acceptedAt: number;
  updatedAt: number;
  tags: string[];
  meetingMetadataId?: Id<'meetingMetadata'>;
  // Joined card data
  card: {
    name: string;
    title?: string;
    email: string;
    phoneNumber?: string;
    company?: string;
    role?: string;
    bio?: string;
    tags: string[];
    profilePhotoId?: Id<'_storage'>;
    resumeFileId?: Id<'_storage'>;
  };
  // Joined meeting metadata
  meetingMetadata?: {
    date: number;
    location?: string;
    notes?: string;
  };
}>;
```

**Errors**: Returns empty array if no contacts found

---

### contacts.getById

Get a specific contact by ID.

**Input**:

```typescript
{
  contactId: Id<'contacts'>;
}
```

**Output**:

```typescript
{
  _id: Id<"contacts">;
  ownerId: Id<"users">;
  sourceCardId: Id<"cards">;
  sourceUserId: Id<"users">;
  acceptedAt: number;
  updatedAt: number;
  tags: string[];
  meetingMetadataId?: Id<"meetingMetadata">;
  card: { /* full card data */ };
  meetingMetadata?: { /* meeting metadata */ };
} | null
```

**Errors**: Returns `null` if contact not found or not owned by current user

---

### files.getUrl

Get a secure download URL for a file.

**Input**:

```typescript
{
  fileId: Id<'_storage'>;
}
```

**Output**:

```typescript
{
  url: string; // Secure download URL
  expiresAt: number; // Timestamp when URL expires
}
```

**Errors**: Throws if file not found

---

## Mutations (Write Operations)

### users.syncFromClerk

Create or update user record from Clerk authentication event.

**Input**:

```typescript
{
  clerkUserId: string;
  email: string;
  phoneNumber?: string;
}
```

**Output**:

```typescript
{
  _id: Id<"users">;
  clerkUserId: string;
  email: string;
  phoneNumber?: string;
  createdAt: number;
  updatedAt: number;
  onboardingCompleted: boolean;
}
```

**Errors**: Throws if validation fails

---

### cards.create

Create a new digital card for the current user (during onboarding).

**Input**:

```typescript
{
  name: string; // Required
  email: string; // Required
  title?: string;
  phoneNumber?: string;
  company?: string;
  role?: string;
  bio?: string;
  tags?: string[];
}
```

**Output**:

```typescript
{
  _id: Id<'cards'>;
  shareId: string; // Auto-generated
  // ... all card fields
}
```

**Errors**:

- Throws if user already has a card
- Throws if name or email is missing
- Throws if email format is invalid

---

### cards.update

Update the current user's digital card.

**Input**:

```typescript
{
  name?: string;
  title?: string;
  email?: string;
  phoneNumber?: string;
  company?: string;
  role?: string;
  bio?: string;
  tags?: string[];
}
```

**Output**:

```typescript
{
  _id: Id<'cards'>;
  // ... updated card fields
  updatedAt: number;
}
```

**Errors**:

- Throws if card not found
- Throws if email format is invalid
- Throws if phone format is invalid

---

### cards.updateProfilePhoto

Update the profile photo for the current user's card.

**Input**:

```typescript
{
  fileId: Id<'_storage'>; // File uploaded via Convex file storage
}
```

**Output**:

```typescript
{
  _id: Id<'cards'>;
  profilePhotoId: Id<'_storage'>;
  updatedAt: number;
}
```

**Errors**:

- Throws if card not found
- Throws if file not found

---

### cards.updateResume

Update the resume file for the current user's card.

**Input**:

```typescript
{
  fileId: Id<'_storage'>; // File uploaded via Convex file storage
}
```

**Output**:

```typescript
{
  _id: Id<'cards'>;
  resumeFileId: Id<'_storage'>;
  updatedAt: number;
}
```

**Errors**:

- Throws if card not found
- Throws if file not found
- Throws if file size exceeds 10MB

---

### cards.removeProfilePhoto

Remove the profile photo from the current user's card.

**Input**: None (uses authenticated session)

**Output**:

```typescript
{
  _id: Id<'cards'>;
  profilePhotoId: undefined;
  updatedAt: number;
}
```

**Errors**: Throws if card not found

---

### cards.removeResume

Remove the resume file from the current user's card.

**Input**: None (uses authenticated session)

**Output**:

```typescript
{
  _id: Id<'cards'>;
  resumeFileId: undefined;
  updatedAt: number;
}
```

**Errors**: Throws if card not found

---

### cards.regenerateShareId

Regenerate the share link ID for the current user's card.

**Input**: None (uses authenticated session)

**Output**:

```typescript
{
  _id: Id<'cards'>;
  shareId: string; // New share ID
  updatedAt: number;
}
```

**Errors**: Throws if card not found

---

### socialLinks.add

Add a social link to the current user's card.

**Input**:

```typescript
{
  platform: string; // "linkedin" | "github" | "twitter" | "bluesky" | "facebook" | "instagram" | "portfolio" | "custom"
  url: string;
  order?: number; // Optional, defaults to next available order
}
```

**Output**:

```typescript
{
  _id: Id<'socialLinks'>;
  cardId: Id<'cards'>;
  platform: string;
  url: string;
  order: number;
  createdAt: number;
}
```

**Errors**:

- Throws if card not found
- Throws if platform is invalid
- Throws if URL format is invalid
- Throws if duplicate platform for same card

---

### socialLinks.update

Update a social link.

**Input**:

```typescript
{
  linkId: Id<"socialLinks">;
  url?: string;
  order?: number;
}
```

**Output**:

```typescript
{
  _id: Id<'socialLinks'>;
  // ... updated fields
}
```

**Errors**:

- Throws if link not found
- Throws if link doesn't belong to current user's card
- Throws if URL format is invalid

---

### socialLinks.remove

Remove a social link.

**Input**:

```typescript
{
  linkId: Id<'socialLinks'>;
}
```

**Output**:

```typescript
{
  success: true;
}
```

**Errors**:

- Throws if link not found
- Throws if link doesn't belong to current user's card

---

### contacts.acceptCard

Accept a shared card and add to network (with duplicate detection).

**Input**:

```typescript
{
  sourceCardId: Id<'cards'>; // Card that was shared
  sourceUserId: Id<'users'>; // User who shared the card
}
```

**Output**:

```typescript
{
  _id: Id<'contacts'>;
  ownerId: Id<'users'>;
  sourceCardId: Id<'cards'>;
  sourceUserId: Id<'users'>;
  acceptedAt: number;
  updatedAt: number;
  isUpdate: boolean; // true if existing contact was updated, false if new contact
}
```

**Errors**:

- Throws if card not found
- Throws if source user not found
- Throws if trying to add own card as contact

**Duplicate Detection**:

- Checks for existing contact by email first
- Falls back to phone number if email doesn't match
- Updates existing contact if duplicate found
- Creates new contact if no duplicate

---

### contacts.updateTags

Update tags for a contact.

**Input**:

```typescript
{
  contactId: Id<"contacts">;
  tags: string[];
}
```

**Output**:

```typescript
{
  _id: Id<"contacts">;
  tags: string[];
  updatedAt: number;
}
```

**Errors**:

- Throws if contact not found
- Throws if contact doesn't belong to current user

---

### contacts.addMeetingMetadata

Add or update meeting metadata for a contact.

**Input**:

```typescript
{
  contactId: Id<"contacts">;
  date: number; // Timestamp
  location?: string;
  notes?: string;
}
```

**Output**:

```typescript
{
  _id: Id<"meetingMetadata">;
  contactId: Id<"contacts">;
  date: number;
  location?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
```

**Errors**:

- Throws if contact not found
- Throws if contact doesn't belong to current user

---

### contacts.remove

Remove a contact from the network.

**Input**:

```typescript
{
  contactId: Id<'contacts'>;
}
```

**Output**:

```typescript
{
  success: true;
}
```

**Errors**:

- Throws if contact not found
- Throws if contact doesn't belong to current user

---

### sharing.sendCard

Send a card to another app user (creates notification/pending request).

**Input**:

```typescript
{
  recipientUserId: Id<'users'>; // User to send card to
}
```

**Output**:

```typescript
{
  success: true;
  notificationId?: string; // If notification system is used
}
```

**Errors**:

- Throws if recipient not found
- Throws if trying to send to self
- Throws if current user doesn't have a card

---

## HTTP Endpoints (Public)

### GET /public/:shareId

Public web view endpoint for share links (no authentication required).

**Path Parameters**:

- `shareId`: string - Share link identifier

**Query Parameters**: None

**Response**:

```typescript
{
  card: {
    name: string;
    title?: string;
    email: string;
    phoneNumber?: string;
    company?: string;
    role?: string;
    bio?: string;
    tags: string[];
    profilePhotoUrl?: string; // Public file URL
    resumeFileUrl?: string; // Public file URL
    socialLinks: Array<{
      platform: string;
      url: string;
    }>;
  };
}
```

**Status Codes**:

- `200 OK`: Card found and returned
- `404 Not Found`: Share ID invalid or card deleted
- `500 Internal Server Error`: Server error

---

### GET /public/:shareId/vcf

Download vCard file for a shared card (no authentication required).

**Path Parameters**:

- `shareId`: string - Share link identifier

**Query Parameters**: None

**Response**:

- Content-Type: `text/vcard`
- Body: vCard file content (.vcf format)

**Status Codes**:

- `200 OK`: vCard generated and returned
- `404 Not Found`: Share ID invalid or card deleted
- `500 Internal Server Error`: Server error

---

### GET /public/:shareId/resume

Download resume file for a shared card (no authentication required).

**Path Parameters**:

- `shareId`: string - Share link identifier

**Query Parameters**: None

**Response**:

- Content-Type: Based on file type
- Body: Resume file content
- Content-Disposition: `attachment; filename="resume.pdf"`

**Status Codes**:

- `200 OK`: Resume file returned
- `404 Not Found`: Share ID invalid, card deleted, or no resume attached
- `500 Internal Server Error`: Server error

---

## Error Handling

All functions follow consistent error handling:

**Error Response Format**:

```typescript
{
  error: string; // Error message
  code?: string; // Error code (e.g., "VALIDATION_ERROR", "NOT_FOUND")
  details?: any; // Additional error details
}
```

**Common Error Codes**:

- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `DUPLICATE`: Duplicate resource (e.g., duplicate social link platform)
- `FILE_TOO_LARGE`: File size exceeds limit
- `INVALID_FILE_TYPE`: File type not allowed
