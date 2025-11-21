# API Contracts: Digital Business Card Application

**Feature**: Digital Business Card Application  
**Branch**: `001-digital-business-card`  
**Date**: 2025-11-21  
**Backend**: Supabase REST API + Real-time Subscriptions  
**Authentication**: Clerk JWT (validated by Supabase RLS)

## Overview

This document defines all API endpoints, request/response schemas, and error handling for the BizzyCard application. The backend uses Supabase's auto-generated REST API with row-level security (RLS) policies for access control.

---

## API Architecture

### Base URLs
- **Supabase REST API**: `https://{project-id}.supabase.co/rest/v1`
- **Supabase Storage API**: `https://{project-id}.supabase.co/storage/v1`
- **Supabase Real-time**: WebSocket connection via Supabase JS Client
- **Web Card View**: `https://bizzycard.app/card/{short_code}` (static hosting + Supabase fetch)

### Authentication
- **Method**: Bearer token authentication using Clerk JWT
- **Header**: `Authorization: Bearer {clerk_jwt_token}`
- **RLS Integration**: Supabase validates Clerk JWT and extracts `user_id` via `auth.uid()`
- **Token Management**: Clerk SDK handles token refresh automatically

### Standard Headers
```http
Authorization: Bearer {clerk_jwt_token}
apikey: {supabase_anon_key}
Content-Type: application/json
Prefer: return=representation  # Return created/updated resource
```

### Error Responses
All endpoints return standard HTTP status codes:

| Status Code | Meaning | Usage |
|------------|---------|-------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Valid auth but user lacks permission (RLS denial) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., duplicate) |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server-side error |

**Error Response Schema**:
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "string (optional)"
  }
}
```

---

## Endpoints

### 1. Profile Management

#### 1.1 Get Current User Profile

**Endpoint**: `GET /profiles?user_id=eq.{user_id}&select=*,social_links(*),resume_attachments(*),shareable_links(*)`

**Description**: Fetch authenticated user's complete profile with related data.

**Authentication**: Required (Clerk JWT)

**Query Parameters**:
- `user_id`: User's Clerk ID (from `auth.uid()`)
- `select`: PostgreSQL select syntax for related data

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "user_id": "string (Clerk user ID)",
    "email": "user@example.com",
    "phone": "+1234567890",
    "name": "John Doe",
    "title": "Software Engineer",
    "company": "Tech Corp",
    "role": "Senior Developer",
    "bio": "Passionate about building mobile apps...",
    "tags": ["React Native", "TypeScript", "Mobile"],
    "profile_picture_url": "https://.../profile.jpg",
    "profile_picture_initials": "JD",
    "resume_visible": true,
    "created_at": "2025-11-21T12:00:00Z",
    "updated_at": "2025-11-21T12:30:00Z",
    "deleted_at": null,
    "social_links": [
      {
        "id": "uuid",
        "profile_id": "uuid",
        "platform": "linkedin",
        "url": "https://linkedin.com/in/johndoe",
        "display_order": 0,
        "visible": true,
        "created_at": "2025-11-21T12:00:00Z"
      }
    ],
    "resume_attachments": {
      "id": "uuid",
      "profile_id": "uuid",
      "file_url": "https://.../resume.pdf",
      "file_name": "John_Doe_Resume.pdf",
      "file_size": 1048576,
      "uploaded_at": "2025-11-21T12:00:00Z"
    },
    "shareable_links": {
      "id": "uuid",
      "profile_id": "uuid",
      "short_code": "abc123xyz",
      "full_url": "https://bizzycard.app/card/abc123xyz",
      "access_count": 42,
      "created_at": "2025-11-21T12:00:00Z",
      "last_accessed_at": "2025-11-21T13:00:00Z"
    }
  }
]
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT
- `403 Forbidden`: RLS policy denial (user_id mismatch)
- `404 Not Found`: Profile doesn't exist

---

#### 1.2 Create Profile

**Endpoint**: `POST /profiles`

**Description**: Create a new profile for authenticated user (called once after signup).

**Authentication**: Required (Clerk JWT)

**Request Body**:
```json
{
  "user_id": "string (Clerk user ID from JWT)",
  "email": "user@example.com",
  "phone": "+1234567890",
  "name": "John Doe",
  "title": "Software Engineer (optional)",
  "company": "Tech Corp (optional)",
  "role": "Senior Developer (optional)",
  "bio": "Short bio... (optional, max 500 chars)",
  "tags": ["React Native", "TypeScript"] (optional, max 20 tags)
}
```

**Validation**:
- `email`: Valid email format (RFC 5322)
- `phone`: E.164 international format
- `name`: 1-100 characters, non-empty
- `bio`: Max 500 characters
- `tags`: Each tag 1-50 characters, max 20 tags

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "user_id": "string",
  "email": "user@example.com",
  "phone": "+1234567890",
  "name": "John Doe",
  "title": "Software Engineer",
  "company": "Tech Corp",
  "role": "Senior Developer",
  "bio": "Passionate about building mobile apps...",
  "tags": ["React Native", "TypeScript"],
  "profile_picture_url": null,
  "profile_picture_initials": "JD",
  "resume_visible": true,
  "created_at": "2025-11-21T12:00:00Z",
  "updated_at": "2025-11-21T12:00:00Z",
  "deleted_at": null
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request body
- `409 Conflict`: Profile already exists for user_id
- `422 Unprocessable Entity`: Validation error

**Side Effects**:
- Creates `shareable_links` row automatically (via trigger or application logic)
- Creates `onboarding_state` row with `completed=true`

---

#### 1.3 Update Profile

**Endpoint**: `PATCH /profiles?user_id=eq.{user_id}`

**Description**: Update authenticated user's profile fields.

**Authentication**: Required (Clerk JWT)

**Request Body**: (all fields optional)
```json
{
  "email": "newemail@example.com",
  "phone": "+1987654321",
  "name": "Jane Doe",
  "title": "Lead Engineer",
  "company": "New Company",
  "role": "Engineering Manager",
  "bio": "Updated bio...",
  "tags": ["Leadership", "Mentoring"],
  "resume_visible": false
}
```

**Validation**: Same as Create Profile

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "user_id": "string",
  "email": "newemail@example.com",
  "phone": "+1987654321",
  "name": "Jane Doe",
  "title": "Lead Engineer",
  "company": "New Company",
  "role": "Engineering Manager",
  "bio": "Updated bio...",
  "tags": ["Leadership", "Mentoring"],
  "profile_picture_url": "https://.../profile.jpg",
  "profile_picture_initials": "JD",
  "resume_visible": false,
  "created_at": "2025-11-21T12:00:00Z",
  "updated_at": "2025-11-21T14:00:00Z",
  "deleted_at": null
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request body
- `403 Forbidden`: User doesn't own profile (RLS denial)
- `404 Not Found`: Profile doesn't exist
- `422 Unprocessable Entity`: Validation error

**Side Effects**:
- Updates `updated_at` timestamp (via trigger)
- Marks all `saved_contacts` referencing this profile with `profile_updated_since_save=true` (via trigger)
- Sends notifications to users who saved this contact (via application logic or webhook)

---

#### 1.4 Delete Profile (Soft Delete)

**Endpoint**: `PATCH /profiles?user_id=eq.{user_id}`

**Description**: Soft delete user profile (sets `deleted_at` timestamp).

**Authentication**: Required (Clerk JWT)

**Request Body**:
```json
{
  "deleted_at": "2025-11-21T15:00:00Z"
}
```

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "user_id": "string",
  "deleted_at": "2025-11-21T15:00:00Z"
}
```

**Error Responses**:
- `403 Forbidden`: User doesn't own profile
- `404 Not Found`: Profile doesn't exist

**Side Effects**:
- Shareable link becomes invalid (web card shows "This card is no longer available")
- QR code no longer works
- Saved contacts still retain profile snapshot (profile_id set to NULL via ON DELETE SET NULL)

---

### 2. Social Links Management

#### 2.1 Get Social Links

**Endpoint**: `GET /social_links?profile_id=eq.{profile_id}&order=display_order.asc`

**Description**: Get all social links for a profile.

**Authentication**: Required (Clerk JWT)

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "profile_id": "uuid",
    "platform": "linkedin",
    "url": "https://linkedin.com/in/johndoe",
    "display_order": 0,
    "visible": true,
    "created_at": "2025-11-21T12:00:00Z"
  },
  {
    "id": "uuid",
    "profile_id": "uuid",
    "platform": "github",
    "url": "https://github.com/johndoe",
    "display_order": 1,
    "visible": true,
    "created_at": "2025-11-21T12:00:00Z"
  }
]
```

---

#### 2.2 Create Social Link

**Endpoint**: `POST /social_links`

**Description**: Add a new social link to user's profile.

**Authentication**: Required (Clerk JWT)

**Request Body**:
```json
{
  "profile_id": "uuid",
  "platform": "linkedin",
  "url": "https://linkedin.com/in/johndoe",
  "display_order": 0,
  "visible": true
}
```

**Validation**:
- `platform`: One of `bluesky`, `linkedin`, `x`, `facebook`, `instagram`, `github`, `portfolio`, `other`
- `url`: Valid HTTPS URL format
- `display_order`: 0-99

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "profile_id": "uuid",
  "platform": "linkedin",
  "url": "https://linkedin.com/in/johndoe",
  "display_order": 0,
  "visible": true,
  "created_at": "2025-11-21T12:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request body
- `403 Forbidden`: User doesn't own profile
- `422 Unprocessable Entity`: Validation error (invalid platform or URL)

---

#### 2.3 Update Social Link

**Endpoint**: `PATCH /social_links?id=eq.{link_id}`

**Description**: Update a social link.

**Authentication**: Required (Clerk JWT)

**Request Body**: (all fields optional)
```json
{
  "url": "https://linkedin.com/in/janedoe",
  "display_order": 5,
  "visible": false
}
```

**Response**: `200 OK`

**Error Responses**:
- `403 Forbidden`: User doesn't own link
- `404 Not Found`: Link doesn't exist

---

#### 2.4 Delete Social Link

**Endpoint**: `DELETE /social_links?id=eq.{link_id}`

**Description**: Remove a social link.

**Authentication**: Required (Clerk JWT)

**Response**: `204 No Content`

**Error Responses**:
- `403 Forbidden`: User doesn't own link
- `404 Not Found`: Link doesn't exist

---

### 3. Resume Management

#### 3.1 Upload Resume

**Endpoint**: `POST /storage/v1/object/resumes/{user_id}/{file_name}`

**Description**: Upload resume PDF file to Supabase Storage.

**Authentication**: Required (Clerk JWT)

**Request**: Multipart form data with file

**Headers**:
```http
Authorization: Bearer {clerk_jwt_token}
Content-Type: multipart/form-data
```

**Response**: `200 OK`
```json
{
  "Key": "resumes/{user_id}/John_Doe_Resume.pdf",
  "Bucket": "resumes"
}
```

**Then create database record**:

**Endpoint**: `POST /resume_attachments`

**Request Body**:
```json
{
  "profile_id": "uuid",
  "file_url": "https://{project}.supabase.co/storage/v1/object/public/resumes/{user_id}/John_Doe_Resume.pdf",
  "file_name": "John_Doe_Resume.pdf",
  "file_size": 1048576
}
```

**Response**: `201 Created`

**Validation**:
- File format: PDF only
- File size: Max 10MB (10485760 bytes)

**Error Responses**:
- `400 Bad Request`: Invalid file format or size
- `403 Forbidden`: User doesn't own profile
- `409 Conflict`: Resume already exists (only one per profile)

---

#### 3.2 Delete Resume

**Endpoint**: `DELETE /resume_attachments?profile_id=eq.{profile_id}`

**Description**: Delete resume record and file from storage.

**Authentication**: Required (Clerk JWT)

**Response**: `204 No Content`

**Side Effects**:
- Deletes file from Supabase Storage (via application logic or trigger)

---

### 4. Saved Contacts (Network Tab)

#### 4.1 Get Saved Contacts

**Endpoint**: `GET /saved_contacts?user_id=eq.{user_id}&select=*,profiles(*,social_links(*))&order=saved_at.desc`

**Description**: Get all saved contacts for authenticated user with profile data.

**Authentication**: Required (Clerk JWT)

**Query Parameters**:
- `order`: Sort by `saved_at.desc`, `profiles.name.asc`, etc.
- `custom_tags`: Filter by tag (e.g., `custom_tags=cs.{Conference}`)
- `limit`: Pagination limit
- `offset`: Pagination offset

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "user_id": "string (Clerk user ID)",
    "profile_id": "uuid",
    "custom_tags": ["Conference 2025", "Potential Client"],
    "notes": "Met at React Native EU conference...",
    "is_favorite": true,
    "saved_at": "2025-11-21T12:00:00Z",
    "last_viewed_at": "2025-11-21T13:00:00Z",
    "profile_updated_since_save": false,
    "profiles": {
      "id": "uuid",
      "name": "Jane Smith",
      "title": "Product Manager",
      "company": "Startup Inc",
      "email": "jane@startup.com",
      "phone": "+1234567890",
      "profile_picture_url": "https://.../jane.jpg",
      "profile_picture_initials": "JS",
      "social_links": [
        {
          "platform": "linkedin",
          "url": "https://linkedin.com/in/janesmith"
        }
      ]
    }
  }
]
```

---

#### 4.2 Save Contact

**Endpoint**: `POST /saved_contacts`

**Description**: Save a received business card to Network tab.

**Authentication**: Required (Clerk JWT)

**Request Body**:
```json
{
  "user_id": "string (Clerk user ID)",
  "profile_id": "uuid (profile being saved)",
  "custom_tags": ["Conference 2025"],
  "notes": "Met at networking event..."
}
```

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "user_id": "string",
  "profile_id": "uuid",
  "custom_tags": ["Conference 2025"],
  "notes": "Met at networking event...",
  "is_favorite": false,
  "saved_at": "2025-11-21T12:00:00Z",
  "last_viewed_at": null,
  "profile_updated_since_save": false
}
```

**Error Responses**:
- `409 Conflict`: Contact already saved (duplicate)

**Side Effects**:
- Sends notification to profile owner (via application logic or webhook)

---

#### 4.3 Update Saved Contact

**Endpoint**: `PATCH /saved_contacts?id=eq.{contact_id}`

**Description**: Update tags, notes, or favorite status for a saved contact.

**Authentication**: Required (Clerk JWT)

**Request Body**: (all fields optional)
```json
{
  "custom_tags": ["Conference 2025", "Follow Up"],
  "notes": "Updated notes...",
  "is_favorite": true,
  "profile_updated_since_save": false
}
```

**Response**: `200 OK`

---

#### 4.4 Delete Saved Contact

**Endpoint**: `DELETE /saved_contacts?id=eq.{contact_id}`

**Description**: Remove a saved contact from Network tab.

**Authentication**: Required (Clerk JWT)

**Response**: `204 No Content`

---

#### 4.5 Search Saved Contacts

**Endpoint**: `GET /saved_contacts?user_id=eq.{user_id}&profiles.name=ilike.%{query}%&select=*,profiles(*)`

**Description**: Search saved contacts by name, company, or tags.

**Authentication**: Required (Clerk JWT)

**Query Parameters**:
- `profiles.name=ilike.%{query}%`: Search by name
- `profiles.company=ilike.%{query}%`: Search by company
- `custom_tags=cs.{tag}`: Filter by tag

**Response**: Same as Get Saved Contacts

---

### 5. Card Exchanges (In-App QR Scan)

#### 5.1 Create Card Exchange

**Endpoint**: `POST /card_exchanges`

**Description**: Initiate a card exchange when User A displays QR and User B scans in-app.

**Authentication**: Required (Clerk JWT)

**Request Body**:
```json
{
  "initiator_profile_id": "uuid (User A's profile)",
  "recipient_profile_id": "uuid (User B's profile)",
  "exchange_method": "in_app_scan"
}
```

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "initiator_profile_id": "uuid",
  "recipient_profile_id": "uuid",
  "exchange_method": "in_app_scan",
  "initiator_accepted": true,
  "recipient_accepted": false,
  "exchanged_at": "2025-11-21T12:00:00Z",
  "completed_at": null
}
```

**Error Responses**:
- `400 Bad Request`: Can't exchange with self
- `409 Conflict`: Exchange already exists

**Side Effects**:
- Sends notification to recipient (exchange request)

---

#### 5.2 Accept Card Exchange

**Endpoint**: `PATCH /card_exchanges?id=eq.{exchange_id}`

**Description**: Recipient accepts the card exchange.

**Authentication**: Required (Clerk JWT)

**Request Body**:
```json
{
  "recipient_accepted": true
}
```

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "initiator_profile_id": "uuid",
  "recipient_profile_id": "uuid",
  "exchange_method": "in_app_scan",
  "initiator_accepted": true,
  "recipient_accepted": true,
  "exchanged_at": "2025-11-21T12:00:00Z",
  "completed_at": "2025-11-21T12:05:00Z"
}
```

**Side Effects** (via trigger or application logic):
- Sets `completed_at` timestamp
- Creates two `saved_contacts` rows (mutual save)
- Sends notifications to both users (exchange accepted)

---

### 6. Notifications

#### 6.1 Get Notifications

**Endpoint**: `GET /notifications?user_id=eq.{user_id}&order=created_at.desc&limit=50`

**Description**: Get all notifications for authenticated user.

**Authentication**: Required (Clerk JWT)

**Query Parameters**:
- `is_read=eq.false`: Filter unread notifications
- `limit`: Pagination limit (default 50)
- `offset`: Pagination offset

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "user_id": "string (Clerk user ID)",
    "type": "card_saved",
    "title": "Someone saved your card",
    "message": "Jane Smith saved your business card",
    "related_profile_id": "uuid",
    "related_exchange_id": null,
    "is_read": false,
    "push_sent": true,
    "created_at": "2025-11-21T12:00:00Z",
    "read_at": null
  },
  {
    "id": "uuid",
    "user_id": "string",
    "type": "profile_updated",
    "title": "Contact updated their profile",
    "message": "John Doe updated their business card",
    "related_profile_id": "uuid",
    "related_exchange_id": null,
    "is_read": true,
    "push_sent": true,
    "created_at": "2025-11-20T10:00:00Z",
    "read_at": "2025-11-20T10:30:00Z"
  }
]
```

---

#### 6.2 Mark Notification as Read

**Endpoint**: `PATCH /notifications?id=eq.{notification_id}`

**Description**: Mark a notification as read.

**Authentication**: Required (Clerk JWT)

**Request Body**:
```json
{
  "is_read": true
}
```

**Response**: `200 OK`

**Side Effects**:
- Sets `read_at` timestamp (via trigger)

---

#### 6.3 Get Unread Count

**Endpoint**: `GET /notifications?user_id=eq.{user_id}&is_read=eq.false&select=count`

**Description**: Get count of unread notifications (for badge).

**Authentication**: Required (Clerk JWT)

**Response**: `200 OK`
```json
[
  {
    "count": 5
  }
]
```

---

### 7. Web Card Public Endpoint

#### 7.1 Get Public Profile by Short Code

**Endpoint**: `GET /shareable_links?short_code=eq.{short_code}&select=*,profiles(*,social_links(*),resume_attachments(*))`

**Description**: Fetch public profile data for web card view (no authentication required).

**Authentication**: None (public endpoint)

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "profile_id": "uuid",
    "short_code": "abc123xyz",
    "full_url": "https://bizzycard.app/card/abc123xyz",
    "access_count": 42,
    "created_at": "2025-11-21T12:00:00Z",
    "profiles": {
      "id": "uuid",
      "name": "John Doe",
      "title": "Software Engineer",
      "company": "Tech Corp",
      "email": "john@techcorp.com",
      "phone": "+1234567890",
      "bio": "Passionate about mobile development...",
      "tags": ["React Native", "TypeScript"],
      "profile_picture_url": "https://.../profile.jpg",
      "resume_visible": true,
      "deleted_at": null,
      "social_links": [
        {
          "platform": "linkedin",
          "url": "https://linkedin.com/in/johndoe",
          "visible": true
        }
      ],
      "resume_attachments": {
        "file_url": "https://.../John_Doe_Resume.pdf",
        "file_name": "John_Doe_Resume.pdf"
      }
    }
  }
]
```

**Error Responses**:
- `404 Not Found`: Invalid short code or profile deleted

**Side Effects**:
- Increment `access_count` (optional analytics)
- Update `last_accessed_at` timestamp

---

### 8. Onboarding State

#### 8.1 Get Onboarding State

**Endpoint**: `GET /onboarding_state?user_id=eq.{user_id}`

**Description**: Check if user has completed onboarding.

**Authentication**: Required (Clerk JWT)

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "user_id": "string (Clerk user ID)",
    "completed": true,
    "skipped": false,
    "completed_at": "2025-11-21T12:00:00Z"
  }
]
```

---

#### 8.2 Update Onboarding State

**Endpoint**: `POST /onboarding_state` or `PATCH /onboarding_state?user_id=eq.{user_id}`

**Description**: Mark onboarding as completed or skipped.

**Authentication**: Required (Clerk JWT)

**Request Body**:
```json
{
  "user_id": "string (Clerk user ID)",
  "completed": true,
  "skipped": false
}
```

**Response**: `201 Created` or `200 OK`

---

## Real-time Subscriptions

### Supabase Real-time via WebSocket

**Use Cases**:
1. **Profile Updates**: Listen for changes to user's own profile
2. **Contact Updates**: Listen for changes to saved contacts (when they update their profile)
3. **Notifications**: Listen for new notifications

**Example: Subscribe to Notifications**:
```typescript
import { supabase } from '@/lib/supabase/client';

const subscription = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log('New notification:', payload.new);
      // Show in-app notification or refresh notification list
    }
  )
  .subscribe();

// Cleanup
return () => {
  subscription.unsubscribe();
};
```

**Example: Subscribe to Profile Updates**:
```typescript
const subscription = supabase
  .channel('profile_updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'profiles',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log('Profile updated:', payload.new);
      // Refresh profile data
    }
  )
  .subscribe();
```

---

## Rate Limiting

**Supabase Rate Limits** (Free Tier):
- REST API: 100 requests per 10 seconds per IP
- Storage API: 200 requests per 10 seconds per IP
- Real-time: 100 concurrent connections per project

**Application-Level Rate Limiting**:
- Implement debouncing for search queries (300ms delay)
- Cache frequently accessed data with React Query (reduce API calls)
- Batch updates where possible (e.g., multiple social links in one transaction)

---

## Pagination

**Supabase Pagination**:
- Use `limit` and `offset` query parameters
- Example: `GET /saved_contacts?user_id=eq.{user_id}&limit=20&offset=0`

**Recommended Pagination Strategy**:
- Page size: 20 items per page (Network tab)
- Infinite scroll with React Query's `useInfiniteQuery`

---

## Error Handling Best Practices

1. **Network Errors**: Retry with exponential backoff (React Query handles automatically)
2. **Validation Errors**: Show inline errors below form fields (Zod schemas)
3. **Authentication Errors**: Redirect to sign-in, clear cached tokens
4. **RLS Denials (403)**: Show "You don't have permission" message
5. **Not Found (404)**: Show appropriate empty state or "deleted" message
6. **Server Errors (500)**: Show generic error, log to Sentry

---

## TypeScript Types

See `contracts/types.ts` for complete TypeScript type definitions auto-generated from Supabase schema.

---

## Testing API Contracts

### Contract Tests
- Validate request/response schemas match Zod definitions
- Test RLS policies enforce user isolation
- Test error responses return expected status codes
- Test real-time subscriptions trigger on database changes

### Mock API for Tests
- Use MSW (Mock Service Worker) to mock Supabase API in tests
- Provide fixtures for common responses (profile, contacts, notifications)

---

## Next Steps

✅ **Phase 1 API Contracts Complete**

**Next**:
1. Generate TypeScript types file (`contracts/types.ts`)
2. Generate quickstart guide (`quickstart.md`)
3. Update agent context with API contracts

