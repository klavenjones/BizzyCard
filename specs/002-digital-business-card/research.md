# Research: Digital Business Card Application

**Feature**: 002-digital-business-card  
**Date**: 2025-01-27  
**Purpose**: Document technology choices, integration patterns, and best practices for implementing the digital business card application.

## Technology Stack Decisions

### Convex Integration

**Decision**: Use Convex for all backend server logic, data persistence, and file storage.

**Rationale**:

- Convex provides a unified backend solution with real-time database, file storage, and serverless functions
- Built-in TypeScript support aligns with project requirements
- Automatic API generation from schema and functions
- Real-time subscriptions enable live updates for in-app features
- File storage API handles resume and profile photo uploads
- Integrates seamlessly with Clerk for authentication

**Alternatives Considered**:

- Firebase: More complex setup, separate services for different features
- Supabase: Requires more configuration, PostgreSQL knowledge needed
- Custom backend: Significant development overhead, maintenance burden

**Integration Pattern**:

- Convex schema defines data models (users, cards, contacts, files)
- Convex mutations for write operations (create, update, delete)
- Convex queries for read operations with real-time subscriptions
- Convex HTTP endpoints for public web views (share links)
- Convex file storage for resumes and profile photos

**References**:

- Convex Documentation: https://docs.convex.dev
- Convex + Clerk Integration: https://docs.convex.dev/auth/clerk

### Clerk + Convex Authentication Integration

**Decision**: Integrate existing Clerk authentication with Convex to store users and profiles in the database.

**Rationale**:

- Clerk already installed and configured in the project
- Convex provides Clerk integration via `@convex-dev/auth-clerk`
- Separates authentication (Clerk) from application data (Convex)
- Enables user profile management in Convex database
- Supports user lookup by email/phone for in-app sharing

**Alternatives Considered**:

- Clerk-only: No application data storage, would need separate database
- Convex-only auth: Would require rebuilding auth flows already in place

**Integration Pattern**:

1. User authenticates via Clerk (existing flow)
2. Convex receives Clerk session token
3. Convex validates token and creates/updates user record in database
4. User profile and digital card linked to Clerk user ID
5. All Convex queries/mutations authenticated via Clerk session

**Implementation Steps**:

1. Install `@convex-dev/auth-clerk` package
2. Configure Convex auth provider with Clerk
3. Create user sync function to create/update users in Convex on Clerk auth events
4. Update Convex client to use Clerk authentication
5. Add user lookup functions (by email, phone) for in-app sharing

**References**:

- Convex Clerk Auth: https://docs.convex.dev/auth/clerk
- Clerk Expo Integration: https://clerk.com/docs/quickstarts/expo

### QR Code Generation

**Decision**: Use `react-native-qrcode-svg` or `expo-qrcode` for QR code generation in the mobile app.

**Rationale**:

- Native React Native libraries for QR code generation
- Can encode share links directly
- Lightweight and performant
- Works with Expo managed workflow

**Alternatives Considered**:

- Server-side generation: Adds latency, requires API calls
- Third-party service: Additional dependency, potential costs

**Implementation Pattern**:

- Generate QR code on Share screen
- Encode share link URL (e.g., `https://app.bizzycard.com/public/{shareId}`)
- Display QR code as SVG/image component
- Allow saving QR code to device gallery
- QR code remains valid even if card is updated (points to share link, not card data)

**References**:

- react-native-qrcode-svg: https://github.com/awesomejerry/react-native-qrcode-svg
- Expo QR Code: https://docs.expo.dev/versions/latest/sdk/qrcode/

### File Upload (Resumes and Profile Photos)

**Decision**: Use Convex file storage API with Expo ImagePicker and DocumentPicker.

**Rationale**:

- Convex file storage handles uploads, storage, and retrieval
- Expo ImagePicker for profile photos (camera or gallery)
- Expo DocumentPicker for resume files (PDF, DOCX, etc.)
- Convex provides secure file URLs for downloads
- File size validation handled client-side before upload

**Alternatives Considered**:

- Base64 encoding: Inefficient for large files, increases payload size
- Third-party storage (S3): Additional service, more complexity

**Implementation Pattern**:

1. User selects file via Expo picker
2. Client-side validation (file type, size limit: 10MB)
3. Upload to Convex file storage via mutation
4. Store file ID in card document
5. Generate secure download URLs via Convex
6. Public web view uses Convex file URLs for downloads

**References**:

- Convex File Storage: https://docs.convex.dev/file-storage
- Expo ImagePicker: https://docs.expo.dev/versions/latest/sdk/imagepicker/
- Expo DocumentPicker: https://docs.expo.dev/versions/latest/sdk/document-picker/

### Share Link Generation

**Decision**: Generate unique, secure share links using Convex with format: `https://app.bizzycard.com/public/{shareId}`

**Rationale**:

- Share links must be unique and non-guessable
- Convex can generate cryptographically secure IDs
- Links persist until explicitly revoked
- Public web view accessible without authentication
- Share links remain valid even if card is updated

**Alternatives Considered**:

- Sequential IDs: Predictable, security risk
- User-generated links: User friction, potential conflicts

**Implementation Pattern**:

1. Generate unique share ID on card creation (Convex `Id<"cards">` or custom UUID)
2. Store share ID in card document
3. Create public route: `/public/[shareId]`
4. Public route queries Convex for card by share ID
5. Display card in web view (no auth required)
6. Allow regeneration/revocation of share links

### vCard (.vcf) Generation

**Decision**: Generate vCard files client-side using a lightweight vCard library or custom implementation.

**Rationale**:

- vCard format is well-documented (RFC 6350)
- Client-side generation reduces server load
- Can be generated on-demand for downloads
- Works for both mobile app and web view

**Alternatives Considered**:

- Server-side generation: Requires API calls, adds latency
- Third-party service: Additional dependency

**Implementation Pattern**:

1. Extract card data (name, email, phone, company, etc.)
2. Format according to vCard 3.0 or 4.0 specification
3. Generate .vcf file content
4. Trigger download via Expo FileSystem or web download
5. Support importing to device contacts

**References**:

- vCard RFC 6350: https://datatracker.ietf.org/doc/html/rfc6350
- Expo FileSystem: https://docs.expo.dev/versions/latest/sdk/filesystem/

### In-App Sharing (AirDrop, Email, SMS)

**Decision**: Use Expo Sharing API and platform-specific sharing capabilities.

**Rationale**:

- Expo Sharing API provides cross-platform sharing
- AirDrop available via iOS ShareSheet
- Email/SMS via platform share dialogs
- Native user experience
- Works with .vcf files and share links

**Alternatives Considered**:

- Custom implementations: Platform-specific code, more maintenance
- Third-party libraries: Additional dependencies

**Implementation Pattern**:

1. Generate share content (share link, .vcf file, or card preview)
2. Use Expo Sharing.shareAsync() for cross-platform sharing
3. Platform handles available share targets (AirDrop, email, SMS, etc.)
4. Pre-fill email/SMS with share link or card information

**References**:

- Expo Sharing: https://docs.expo.dev/versions/latest/sdk/sharing/

### Push Notifications for In-App Card Sharing

**Decision**: Use Expo Notifications for push notifications when users receive cards.

**Rationale**:

- Expo provides unified push notification API
- Works with both iOS and Android
- Can be integrated with Convex backend for notification delivery
- Required for in-app card sharing notifications (FR-035)

**Alternatives Considered**:

- In-app only notifications: Users might miss cards if app is closed
- Email notifications: Less immediate, requires email access

**Implementation Pattern**:

1. Request notification permissions on app launch
2. Register device token with Convex (linked to user)
3. When card is shared, Convex mutation triggers notification
4. Expo Notifications delivers push notification
5. User taps notification to open app and view card

**References**:

- Expo Notifications: https://docs.expo.dev/versions/latest/sdk/notifications/

### Public Web View Implementation

**Decision**: Create web-accessible routes using Expo Router web support and Convex HTTP endpoints.

**Rationale**:

- Expo Router supports web routes
- Public routes don't require authentication
- Convex HTTP endpoints can serve card data
- Responsive design works on mobile and desktop browsers
- Can be hosted alongside mobile app or separately

**Alternatives Considered**:

- Separate web application: Additional codebase to maintain
- Server-side rendering: More complex setup

**Implementation Pattern**:

1. Create `/public/[shareId]` route in Expo Router
2. Route queries Convex HTTP endpoint with share ID
3. Convex validates share ID and returns card data
4. Web view displays card with download options
5. Generate .vcf download on-demand
6. Resume download via Convex file URL

### Duplicate Contact Detection

**Decision**: Implement duplicate detection using email-first, phone-fallback matching as specified in clarifications.

**Rationale**:

- Matches user expectations (email is primary identifier)
- Phone number provides fallback for edge cases
- Prevents duplicate entries in Network/Contacts
- Updates existing contacts with latest information

**Implementation Pattern**:

1. On card acceptance, query Network/Contacts by email
2. If match found, update existing contact
3. If no email match, query by phone number
4. If match found, update existing contact
5. If no match, create new contact entry
6. Show notification when contact is updated vs. created

### Search and Filtering

**Decision**: Implement client-side search/filtering for Network/Contacts list.

**Rationale**:

- Success criteria: Find contact in under 10 seconds for up to 1000 contacts
- Client-side filtering is fast for this scale
- Reduces server load
- Works offline for viewing

**Alternatives Considered**:

- Server-side search: Adds latency, requires network
- Full-text search service: Overkill for 1000 contacts

**Implementation Pattern**:

1. Load all contacts via Convex query (real-time subscription)
2. Implement search/filter in React component
3. Filter by name, company, tags (client-side)
4. Update filtered list in real-time as user types
5. Optimize with debouncing for performance

## Testing Setup

**Decision**: Configure Jest for React Native/Expo unit testing.

**Rationale**:

- Constitution requires unit tests for all features
- Jest is the standard testing framework for React Native
- Works with Expo managed workflow
- Supports TypeScript

**Setup Requirements**:

1. Install Jest and React Native testing utilities
2. Configure Jest for Expo/TypeScript
3. Set up test file structure matching source structure
4. Create test utilities for mocking Convex, Clerk, Expo APIs
5. Establish test coverage targets

**References**:

- Jest React Native: https://jestjs.io/docs/tutorial-react-native
- Expo Testing: https://docs.expo.dev/guides/testing-with-jest/

## Best Practices

### Convex Best Practices

- Use TypeScript for type safety
- Define schema first, then functions
- Use queries for read operations, mutations for writes
- Leverage real-time subscriptions for live updates
- Handle errors gracefully in Convex functions
- Use Convex HTTP endpoints for public routes

### Expo Best Practices

- Use Expo Router file-based routing
- Leverage Expo SDK capabilities (ImagePicker, DocumentPicker, Sharing)
- Follow platform-specific guidelines (iOS/Android)
- Optimize images and assets
- Handle deep linking for share links

### React Native Reusables Best Practices

- Use components from library when available
- Follow component API patterns
- Maintain styling consistency with NativeWind
- Ensure accessibility compliance

### Security Best Practices

- Validate all user inputs
- Sanitize file uploads (type, size)
- Use secure share link generation
- Implement rate limiting for public endpoints
- Protect sensitive data in Convex functions

## Unresolved Items

None - all technology choices and patterns have been determined.
