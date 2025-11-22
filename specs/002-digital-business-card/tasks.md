# Implementation Tasks: Digital Business Card Application

**Feature Branch**: `002-digital-business-card`  
**Date**: 2025-01-27  
**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Summary

This document breaks down the implementation of the digital business card application into actionable, dependency-ordered tasks. Tasks are organized by user story priority (P1, P2) to enable independent implementation and testing.

**Total Tasks**: 107  
**MVP Scope**: Phase 1-3 (Setup, Foundational, User Story 1) - 47 tasks

## Implementation Strategy

**MVP First**: Start with User Story 1 (Create and Edit Digital Card) to deliver core functionality. This enables users to create and manage their digital cards independently of sharing features.

**Incremental Delivery**:

- Phase 1-3: Core card creation and editing (MVP)
- Phase 4: Add sharing capabilities
- Phase 5: Enable public web views for non-app users
- Phase 6: Add in-app network/contacts management
- Phase 7: Polish and cross-cutting concerns

## Dependencies

**User Story Completion Order**:

1. **User Story 1 (P1)** - Create and Edit Digital Card → **MUST complete first** (blocks all other stories)
2. **User Story 2 (P1)** - Share Digital Card → Can start after US1, enables sharing
3. **User Story 3 (P2)** - Public Web View → Depends on US2 (needs share links)
4. **User Story 4 (P2)** - In-App Network/Contacts → Depends on US1 and US2 (needs cards and sharing)

**Parallel Opportunities**: Within each phase, tasks marked with [P] can be worked on in parallel.

## Phase 1: Setup & Project Initialization

**Goal**: Set up project dependencies, Convex configuration, and development environment.

**Independent Test**: Project builds successfully, Convex dev server runs, dependencies installed.

---

- [ ] T001 Install Convex dependencies: `yarn add convex`
- [ ] T002 Install Expo packages for file handling: `npx expo install expo-image-picker expo-document-picker expo-sharing expo-notifications expo-file-system`
- [ ] T003 Install QR code library: `yarn add react-native-qrcode-svg`
- [ ] T004 Install testing dependencies: `yarn add -D jest @testing-library/react-native @testing-library/jest-native`
- [ ] T005 Initialize Convex project: `npx convex dev` (creates convex/ directory and .env.local)
- [ ] T006 Configure Clerk + Convex integration: Use these guides as reference: Clerk: <https://clerk.com/docs/guides/development/integrations/databases/convex>, Convex: <https://docs.convex.dev/auth/clerk>
- [ ] T007 Create Convex auth configuration file: `convex/auth.config.js`
- [ ] T008 Add environment variables to `.env.local`: CONVEX_URL, CLERK_DOMAIN, CLERK_APPLICATION_ID
- [ ] T009 Create Jest configuration file: `jest.config.js` with Expo preset
- [ ] T010 Create test utilities directory: `__tests__/utils/` for mocking Convex, Clerk, Expo APIs

## Phase 2: Foundational Infrastructure

**Goal**: Set up Convex schema, authentication integration, client configuration, and core utilities. These are blocking prerequisites for all user stories.

**Independent Test**: Convex schema deployed, auth integration working, client can connect to Convex.

---

- [ ] T011 [P] Create Convex schema file: `convex/schema.ts` with all entity definitions (users, cards, socialLinks, contacts, meetingMetadata)
- [ ] T012 [P] Create Convex users functions: `convex/users.ts` with syncFromClerk mutation and getCurrentUser query
- [ ] T013 [P] Create Convex client setup: `lib/convex-client.ts` with ConvexReactClient configuration
- [ ] T014 [P] Update root layout to wrap app with ConvexProvider: `app/_layout.tsx`
- [ ] T015 [P] Create validation utilities: `lib/validation.ts` with email, phone, URL validation functions
- [ ] T016 [P] Create vCard generation utilities: `lib/vcf.ts` with vCard file generation functions
- [ ] T017 [P] Create QR code service: `services/qr-code.ts` with QR code generation logic
- [ ] T018 [P] Create file upload service: `services/file-upload.ts` with file handling utilities
- [ ] T019 Create custom auth hook: `hooks/use-auth.ts` for Clerk + Convex integration
- [ ] T020 Create user sync function in Convex: `convex/users.ts` mutation to sync user from Clerk on auth events

## Phase 3: User Story 1 - Create and Edit Digital Card (P1)

**Goal**: Enable users to create their first digital business card through onboarding and edit it via the "My Card" screen.

**Independent Test**: New user can complete onboarding, create a card with name and email minimum, view card preview, and edit all profile fields, social links, and resume.

**Acceptance Criteria**:

- User completes onboarding flow and creates digital card
- User views card preview on "My Card" screen
- User can edit profile fields, social links, and resume
- Changes save and preview updates immediately

---

### Convex Backend Functions

- [ ] T021 [US1] Create cards query: `convex/cards.ts` with getCurrentUserCard query
- [ ] T022 [US1] Create cards mutation: `convex/cards.ts` with create mutation (onboarding)
- [ ] T023 [US1] Create cards update mutation: `convex/cards.ts` with update mutation
- [ ] T024 [US1] Create cards file mutations: `convex/cards.ts` with updateProfilePhoto, updateResume, removeProfilePhoto, removeResume
- [ ] T025 [US1] Create socialLinks queries: `convex/socialLinks.ts` with getByCardId query
- [ ] T026 [US1] Create socialLinks mutations: `convex/socialLinks.ts` with add, update, remove mutations
- [ ] T027 [US1] Create files functions: `convex/files.ts` with getUrl query for secure file downloads

### Custom Hooks

- [ ] T028 [US1] Create use-card hook: `hooks/use-card.ts` for card data fetching and mutations
- [ ] T029 [US1] Create use-social-links hook: `hooks/use-social-links.ts` for social links management

### UI Components

- [ ] T030 [US1] Create card preview component: `components/card/card-preview.tsx` displaying card information
- [ ] T031 [US1] Create profile form component: `components/card/profile-form.tsx` for editing profile fields
- [ ] T032 [US1] Create social links form component: `components/card/social-links-form.tsx` for managing social links
- [ ] T033 [US1] Create file upload component: `components/card/file-upload.tsx` for resume and profile photo uploads

### Screens

- [ ] T034 [US1] Create onboarding layout: `app/onboarding/_layout.tsx` with navigation structure
- [ ] T035 [US1] Create onboarding index screen: `app/onboarding/index.tsx` (start of onboarding)
- [ ] T036 [US1] Create onboarding profile screen: `app/onboarding/profile.tsx` for profile fields entry
- [ ] T037 [US1] Create onboarding social links screen: `app/onboarding/social-links.tsx` for social links setup
- [ ] T038 [US1] Create onboarding resume screen: `app/onboarding/resume.tsx` for optional resume upload
- [ ] T039 [US1] Create tabs layout: `app/(tabs)/_layout.tsx` with tab navigation (My Card, Share, Network)
- [ ] T040 [US1] Create My Card screen: `app/(tabs)/my-card.tsx` showing card preview with edit access
- [ ] T041 [US1] Create card edit screen: `app/card/edit.tsx` for editing own card details

### Integration

- [ ] T042 [US1] Integrate onboarding flow with card creation: Connect onboarding screens to Convex create mutation
- [ ] T043 [US1] Integrate My Card screen with card data: Connect to use-card hook and display card preview
- [ ] T044 [US1] Integrate edit functionality: Connect edit screen to update mutations with validation
- [ ] T044a [US1] Add email validation: Implement email format validation in profile form (FR-008) - validate on input and show error messages
- [ ] T044b [US1] Add phone validation: Implement phone number format validation in profile form (FR-009) - validate on input and show error messages
- [ ] T045 [US1] Add onboarding completion check: Update users.onboardingCompleted when card created with name + email

## Phase 4: User Story 2 - Share Digital Card (P1)

**Goal**: Enable users to share their digital card via QR code, AirDrop, email, SMS, share link, and .vcf export.

**Independent Test**: User with completed card can navigate to Share screen, see QR code, use all sharing methods (AirDrop, email, SMS, copy link, .vcf export).

**Acceptance Criteria**:

- QR code displays prominently on Share screen
- All sharing methods work (AirDrop, email, SMS, copy link, .vcf)
- Share link is unique and accessible
- QR code can be saved to device

---

### Convex Backend Functions

- [ ] T046 [US2] Create cards share link mutation: `convex/cards.ts` with regenerateShareId mutation
- [ ] T047 [US2] Create cards share query: `convex/cards.ts` with getByShareId query (for public web views)

### Custom Hooks

- [ ] T048 [US2] Create use-sharing hook: `hooks/use-sharing.ts` for sharing functionality

### UI Components

- [ ] T049 [US2] Create QR code display component: `components/card/qr-code-display.tsx` showing QR code with save option
- [ ] T050 [US2] Create share actions component: `components/sharing/share-actions.tsx` with AirDrop, email, SMS, copy link buttons
- [ ] T051 [US2] Create vcf generator component: `components/sharing/vcf-generator.tsx` for .vcf file generation

### Screens

- [ ] T052 [US2] Create Share screen: `app/(tabs)/share.tsx` with QR code and sharing options
- [ ] T053 [US2] Add share link generation: Generate unique shareId on card creation in Convex

### Integration

- [ ] T054 [US2] Integrate QR code generation: Connect QR code component to share link URL (FR-024: QR codes encode shareId which remains valid after card updates)
- [ ] T055 [US2] Integrate AirDrop sharing: Use Expo Sharing API for AirDrop functionality
- [ ] T056 [US2] Integrate email sharing: Use Expo Sharing API with pre-filled email content
- [ ] T057 [US2] Integrate SMS sharing: Use Expo Sharing API with pre-filled SMS content
- [ ] T058 [US2] Integrate copy share link: Copy share link URL to clipboard
- [ ] T059 [US2] Integrate .vcf export: Generate and share .vcf file using vCard utilities
- [ ] T060 [US2] Add share validation: Prevent sharing if onboarding not completed (FR-048) - Show message prompting user to complete onboarding, disable sharing actions until onboarding is complete
- [ ] T061 [US2] Add QR code save functionality: Allow saving QR code image to device gallery

## Phase 5: User Story 3 - Public Web View (P2)

**Goal**: Enable non-app recipients to view digital cards in a web browser, download contact info, view social links, and download resumes.

**Independent Test**: Share link opens in web browser, displays card information, allows .vcf download, social links work, resume downloads successfully.

**Acceptance Criteria**:

- Public web view displays complete card information
- Social links open in new tabs
- .vcf download works
- Resume download works
- Layout is responsive on mobile and desktop

---

### Convex Backend Functions

- [ ] T062 [US3] Create HTTP endpoint for public card view: `convex/http.ts` with GET /public/:shareId endpoint
- [ ] T063 [US3] Create HTTP endpoint for .vcf download: `convex/http.ts` with GET /public/:shareId/vcf endpoint
- [ ] T064 [US3] Create HTTP endpoint for resume download: `convex/http.ts` with GET /public/:shareId/resume endpoint

### Screens

- [ ] T065 [US3] Create public web view route: `app/public/[shareId].tsx` displaying card in web browser
- [ ] T066 [US3] Add responsive styling: Ensure public web view works on mobile and desktop browsers

### Integration

- [ ] T067 [US3] Integrate public card view: Connect route to Convex HTTP endpoint
- [ ] T068 [US3] Integrate .vcf download: Add download button linking to /public/:shareId/vcf endpoint
- [ ] T069 [US3] Integrate resume download: Add download button linking to /public/:shareId/resume endpoint
- [ ] T070 [US3] Add error handling: Handle 404 for invalid share IDs or deleted cards
- [ ] T071 [US3] Add social links functionality: Make social links clickable and open in new tabs

## Phase 6: User Story 4 - In-App Network/Contacts (P2)

**Goal**: Enable app users to share cards with each other, accept cards into their network, and manage contacts with tags and meeting metadata.

**Independent Test**: Two app users can share cards, recipient accepts card, contact appears in Network tab, user can add tags and meeting context, search/filter works.

**Acceptance Criteria**:

- Users can share cards via QR scan or email/phone lookup
- Recipients receive notifications and can accept/decline
- Accepted cards appear in Network/Contacts tab
- Users can add tags and meeting metadata
- Search and filter functionality works
- Duplicate detection prevents duplicate contacts

---

### Convex Backend Functions

- [ ] T072 [US4] Create contacts queries: `convex/contacts.ts` with getByOwnerId and getById queries
- [ ] T073 [US4] Create contacts mutations: `convex/contacts.ts` with acceptCard mutation (with duplicate detection)
- [ ] T074 [US4] Create contacts update mutations: `convex/contacts.ts` with updateTags and addMeetingMetadata mutations
- [ ] T075 [US4] Create contacts remove mutation: `convex/contacts.ts` with remove mutation
- [ ] T076 [US4] Create sharing mutation: `convex/sharing.ts` with sendCard mutation for in-app sharing
- [ ] T077 [US4] Implement duplicate detection logic: Email-first, phone-fallback matching in acceptCard mutation
- [ ] T078 [US4] Create users lookup queries: `convex/users.ts` with getByEmail and getByPhone queries for in-app sharing

### Custom Hooks

- [ ] T079 [US4] Create use-contacts hook: `hooks/use-contacts.ts` for contacts data fetching and management
- [ ] T080 [US4] Create use-notifications hook: `hooks/use-notifications.ts` for push notification handling

### UI Components

- [ ] T081 [US4] Create contact list component: `components/network/contact-list.tsx` displaying saved contacts
- [ ] T082 [US4] Create contact card component: `components/network/contact-card.tsx` for individual contact view
- [ ] T083 [US4] Create contact search component: `components/network/contact-search.tsx` for search/filter functionality

### Screens

- [ ] T084 [US4] Create Network tab screen: `app/(tabs)/network.tsx` with contact list and search
- [ ] T085 [US4] Create contact detail screen: `app/card/[id].tsx` for viewing saved contact cards
- [ ] T086 [US4] Add QR scan functionality: Integrate QR code scanner for in-app card sharing
- [ ] T087 [US4] Add user lookup UI: Create UI for email/phone lookup in Share screen

### Services

- [ ] T088 [US4] Create notifications service: `services/notifications.ts` for push notification setup and delivery

### Integration

- [ ] T089 [US4] Integrate QR scan for sharing: Connect QR scanner to sendCard mutation
- [ ] T090 [US4] Integrate user lookup: Connect email/phone lookup to users queries and sendCard mutation
- [ ] T091 [US4] Integrate contact acceptance: Connect accept/decline UI to acceptCard mutation (FR-036: decline dismisses notification without storing card)
- [ ] T092 [US4] Integrate Network tab: Connect Network screen to use-contacts hook
- [ ] T093 [US4] Integrate search/filter: Connect search component to filter contacts list
- [ ] T094 [US4] Integrate tags and meeting metadata: Connect UI to update mutations
- [ ] T095 [US4] Integrate push notifications: Set up notifications for card sharing events

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Add error handling, loading states, edge case handling, and final polish.

**Independent Test**: All edge cases handled gracefully, error messages user-friendly, loading states present, app feels polished.

**Maps to**: Edge cases from spec.md (lines 100-109), Success Criteria validation (SC-001 through SC-012), Non-functional requirements (error handling, performance, accessibility)

---

- [ ] T096 Add error handling for network failures: Handle connectivity issues during card operations (Edge case: network connectivity issues during sharing/acceptance)
- [ ] T097 Add loading states: Show loading indicators during async operations (Success Criteria: SC-002, SC-003, SC-008)
- [ ] T098 Add empty states: Show appropriate messages when no data (no contacts, no card, etc.) (Edge case: empty states)
- [ ] T099 Handle invalid social media URLs: Validate and show error messages (FR-010, Edge case: invalid/malformed social media URLs)
- [ ] T100 Handle file size limits: Validate resume size (10MB) and show error if exceeded (Assumption: 10MB limit, Edge case: file size limits)
- [ ] T101 Handle special characters: Ensure emoji and special characters work in profile fields, tags, social links (Edge case: special characters/emoji)
- [ ] T102 Add share link revocation handling: Handle deleted cards gracefully in public web view (FR-032, Edge case: share link accessed after card deletion)
- [ ] T103 Add accessibility improvements: Ensure all UI components are accessible (Non-functional requirement: accessibility)
- [ ] T104 Add error boundaries: Wrap screens with error boundaries for graceful error handling (Non-functional requirement: error handling)
- [ ] T105 Performance optimization: Optimize queries, add pagination if needed for large contact lists (SC-009: search/filter in under 10 seconds for up to 1000 contacts)

## Parallel Execution Examples

### User Story 1 (Phase 3)

**Can work in parallel**:

- T021-T027: Convex backend functions (different files)
- T028-T029: Custom hooks (different files)
- T030-T033: UI components (different files)
- T034-T041: Screens (different files)

**Must be sequential**:

- T042-T045: Integration tasks (depend on components/hooks being complete)

### User Story 2 (Phase 4)

**Can work in parallel**:

- T046-T047: Convex functions
- T048: Custom hook
- T049-T051: UI components
- T052: Screen

**Must be sequential**:

- T053-T061: Integration tasks

### User Story 4 (Phase 6)

**Can work in parallel**:

- T072-T078: Convex functions
- T079-T080: Custom hooks
- T081-T083: UI components
- T084-T087: Screens
- T088: Service

**Must be sequential**:

- T089-T095: Integration tasks

## Task Count Summary

- **Phase 1 (Setup)**: 10 tasks
- **Phase 2 (Foundational)**: 10 tasks
- **Phase 3 (User Story 1)**: 27 tasks (includes T044a, T044b for validation)
- **Phase 4 (User Story 2)**: 16 tasks
- **Phase 5 (User Story 3)**: 10 tasks
- **Phase 6 (User Story 4)**: 24 tasks
- **Phase 7 (Polish)**: 10 tasks

**Total**: 107 tasks

## MVP Scope Recommendation

**Minimum Viable Product**: Phases 1-3 (Setup, Foundational, User Story 1)

This delivers:

- Complete onboarding flow
- Card creation and editing
- Profile management (fields, social links, resume)
- "My Card" screen with preview

**Total MVP Tasks**: 47 tasks

After MVP, proceed with Phase 4 (Sharing) to enable the core value proposition.
