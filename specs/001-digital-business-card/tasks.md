# Tasks: Digital Business Card Application

**Feature Branch**: `001-digital-business-card`  
**Input**: Design documents from `/specs/001-digital-business-card/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Test tasks are included as this project follows Test-Driven Development (TDD) per Constitution Principle II.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. MVP is User Story 1 + User Story 2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a React Native mobile app with Expo:

- **App screens**: `app/` (Expo Router file-based routing)
- **Components**: `components/`
- **Services**: `lib/`
- **Tests**: `tests/` (mirrors app structure)
- **Backend**: `supabase/` (migrations and edge functions)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and development environment setup

- [x] T001 Install and configure Supabase CLI globally (`npm install -g supabase`)
- [x] T002 Create Supabase project and save credentials to `.env`
- [x] T003 [P] Create Clerk application and save credentials to `.env`
- [x] T004 [P] Configure Clerk + Supabase JWT integration (Clerk JWT templates, Supabase JWT provider)
- [x] T005 Initialize environment variables from `.env.example` template (see SETUP.md for instructions)
- [x] T006 [P] Install project dependencies (`yarn install`)
- [x] T007 [P] Configure Jest testing framework in `jest.config.js`
- [x] T008 [P] Configure Detox E2E testing in `.detoxrc.js`
- [x] T009 [P] Setup test utilities and mocks in `tests/utils/test-helpers.tsx`
- [x] T010 [P] Configure EAS Build in `eas.json` (development, preview, production profiles)

**Checkpoint**: Development environment ready - can start development

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Backend Foundation

- [x] T011 Create initial database migration in `supabase/migrations/001_initial_schema.sql` (all tables from data-model.md)
- [x] T012 Run database migration with `supabase db push` (requires Supabase project setup - see PHASE2_STATUS.md)
- [x] T013 Create Supabase storage buckets: `profile-pictures` (public) and `resumes` (public) (requires Supabase project - see PHASE2_STATUS.md)
- [x] T014 Configure RLS policies for all tables in migration file
- [x] T015 Create storage RLS policies for upload/read access (requires Supabase project - see PHASE2_STATUS.md)

### Supabase Client & Types

- [x] T016 Initialize Supabase client in `lib/supabase/client.ts`
- [x] T017 Generate TypeScript types from database schema: `supabase gen types typescript > lib/types/database.ts` (requires T012 completion - see PHASE2_STATUS.md)
- [x] T018 [P] Create domain types in `lib/types/profile.ts` (Profile, SocialLink domain models)
- [x] T019 [P] Create domain types in `lib/types/contact.ts` (SavedContact domain models)

### Clerk Authentication Foundation

- [x] T020 Wrap app in ClerkProvider in `app/_layout.tsx`
- [x] T021 Configure Clerk token cache with Expo SecureStore
- [x] T022 Create auth hooks in `lib/clerk/hooks.ts` (useUser, useAuth wrappers)
- [x] T023 [P] Create auth guards/protected routes in `lib/clerk/guards.tsx`

### React Query & State Management Foundation

- [x] T024 Setup React Query provider in `app/_layout.tsx` with persistence config
- [x] T025 Create React Query client configuration in `lib/query-client.ts`
- [x] T026 [P] Setup AsyncStorage persistence for React Query cache

### Validation & Forms Foundation

- [x] T027 Create Zod validation schemas in `lib/validation/schemas.ts` (profileSchema, socialLinkSchema)
- [x] T028 [P] Create validation utilities in `lib/utils/validation.ts` (email, phone, URL validators, use libphonenumber-js for international format validation)

### UI Foundation

- [x] T029 Configure global theme in `lib/theme.ts` (colors, spacing, typography)
- [x] T030 [P] Create error boundary component in `components/error-boundary.tsx`
- [x] T031 [P] Create loading indicator component in `components/ui/loading.tsx`
- [x] T032 [P] Create toast/notification component in `components/ui/toast.tsx`

### Navigation Foundation

- [x] T033 Configure root layout with providers in `app/_layout.tsx` (Clerk, Query, Theme)
- [x] T034 Create auth layout in `app/(auth)/_layout.tsx`
- [x] T035 [P] Configure deep linking in `app.json` (scheme: bizzycard)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Account, Profile and View My Card (Priority: P1) 🎯 MVP

**Goal**: New users can sign up, create their digital business card with all fields, and view it on the "My Card" screen. This is the foundation - without a profile, nothing else works.

**Independent Test**: A user can sign up/log in, create a complete profile with all supported fields, view it on the My Card screen, edit any field, and see changes reflected immediately. No sharing or networking features required.

### Tests for User Story 1 (TDD Approach)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T036 [P] [US1] Component test for sign-up form in `tests/components/auth/sign-up-form.test.tsx`
- [x] T037 [P] [US1] Component test for profile creation form in `tests/components/profile/profile-form.test.tsx`
- [x] T038 [P] [US1] Component test for My Card screen in `tests/components/my-card.test.tsx`
- [x] T039 [P] [US1] Integration test for complete profile creation flow in `tests/integration/profile-creation.test.tsx`
- [x] T040 [P] [US1] E2E test for sign-up and profile creation in `tests/e2e/create-profile.e2e.ts`

### Implementation for User Story 1

#### Authentication Screens

- [x] T041 [P] [US1] Create sign-in screen in `app/(auth)/sign-in.tsx` (Clerk SignIn component)
- [x] T042 [P] [US1] Create sign-up screen in `app/(auth)/sign-up.tsx` (Clerk SignUp component)
- [x] T043 [US1] Configure auth redirect logic in `app/index.tsx` (authenticated → tabs, unauthenticated → auth)

#### Profile Data Layer

- [x] T044 [P] [US1] Create profile API service in `lib/supabase/profiles.ts` (createProfile, updateProfile, getProfile)
- [x] T045 [P] [US1] Create social links API service in `lib/supabase/social-links.ts` (CRUD operations)
- [x] T046 [US1] Create profile hooks in `lib/hooks/use-profile.ts` (useProfile, useUpdateProfile with React Query, uses last-write-wins via Supabase updated_at timestamp)
- [x] T047 [P] [US1] Create social links hooks in `lib/hooks/use-social-links.ts` (useSocialLinks, useUpdateSocialLinks)

#### Profile Picture Upload

- [x] T048 [P] [US1] Create image picker utility in `lib/utils/image-picker.ts` (expo-image-picker wrapper)
- [x] T049 [P] [US1] Create image upload service in `lib/supabase/storage.ts` (uploadProfilePicture, deleteProfilePicture)
- [x] T050 [US1] Create profile picture component in `components/profile/profile-picture.tsx` (displays picture or initials)

#### Profile Form Components

- [ ] T051 [P] [US1] Create profile form in `components/profile/profile-form.tsx` (name, title, email, phone, company, role, bio, tags)
- [ ] T052 [P] [US1] Create social links editor in `components/profile/social-links-editor.tsx` (add/edit/delete social links)
- [ ] T053 [P] [US1] Create tag input component in `components/profile/tag-input.tsx` (customizable tags with add/remove)
- [ ] T054 [US1] Integrate form validation with Zod schemas in profile form

#### Business Card Preview

- [ ] T055 [P] [US1] Create card preview component in `components/business-card/card-preview.tsx` (displays profile as card)
- [ ] T056 [P] [US1] Create card field display component in `components/business-card/card-field.tsx` (individual field with icon)
- [ ] T057 [P] [US1] Create social links display in `components/business-card/social-links.tsx` (icons + links)

#### Screens

- [ ] T058 [US1] Create profile creation screen in `app/(onboarding)/create-profile.tsx` (first-time profile setup)
- [ ] T059 [US1] Create My Card screen in `app/(tabs)/my-card.tsx` (displays card preview with edit button)
- [ ] T060 [US1] Create edit profile screen in `app/profile/edit.tsx` (full profile editing)
- [ ] T061 [US1] Create edit social links screen in `app/profile/edit-social.tsx` (manage social links)

#### Tab Navigation

- [ ] T062 [US1] Configure tab navigator in `app/(tabs)/_layout.tsx` (My Card, Share, Network tabs)

#### Integration & Error Handling

- [ ] T063 [US1] Add loading states to all profile forms (skeleton loaders)
- [ ] T064 [US1] Add error handling for profile creation/update (toast notifications)
- [ ] T065 [US1] Add validation error display in forms (inline errors below fields)
- [ ] T066 [US1] Create Supabase webhook handler to create profile row on Clerk signup

**Checkpoint**: User Story 1 complete - users can sign up, create profile, and view their card

---

## Phase 4: User Story 2 - Share Card via QR Code with Web View (Priority: P2)

**Goal**: Users can quickly share their business card via QR code. Recipients without the app can scan and view the card on a mobile-optimized web page with download options.

**Independent Test**: A user can access the Share screen, generate and display a QR code, and any person scanning it can view the full business card information on a mobile-optimized web page. Web page includes download options for contact info.

### Tests for User Story 2 (TDD Approach)

- [ ] T067 [P] [US2] Component test for QR code display in `tests/components/share/qr-code.test.tsx`
- [ ] T068 [P] [US2] Component test for Share screen in `tests/components/share/share-screen.test.tsx`
- [ ] T069 [P] [US2] Integration test for QR code generation in `tests/integration/qr-generation.test.tsx`
- [ ] T070 [P] [US2] E2E test for share flow in `tests/e2e/share-card.e2e.ts`

### Implementation for User Story 2

#### Shareable Links Data Layer

- [ ] T071 [P] [US2] Create shareable links API service in `lib/supabase/shareable-links.ts` (getShareableLink, incrementAccessCount)
- [ ] T072 [US2] Create shareable link hook in `lib/hooks/use-shareable-link.ts` (useShareableLink with React Query)

#### QR Code Generation

- [ ] T073 [P] [US2] Install and configure `react-native-qrcode-svg` package
- [ ] T074 [P] [US2] Create QR code generator component in `components/share/qr-code.tsx` (generates QR with shareable link)
- [ ] T075 [US2] Add QR code caching logic (avoid regeneration on every render)

#### Share Screen

- [ ] T076 [US2] Create Share screen in `app/(tabs)/share.tsx` (displays QR code prominently)
- [ ] T077 [US2] Add shareable link display on Share screen (copy link button)
- [ ] T078 [US2] Add QR code regeneration logic when profile updates

#### Web Card View (Static Site)

- [ ] T079 [P] [US2] Create web card project structure in `web-card/` (Vite + React)
- [ ] T080 [P] [US2] Setup Vite config in `web-card/vite.config.ts` (with NativeWind/Tailwind)
- [ ] T081 [P] [US2] Create web card component in `web-card/src/App.tsx` (fetches profile from Supabase)
- [ ] T082 [P] [US2] Create public profile fetch API route (Supabase REST with public RLS policy)
- [ ] T083 [US2] Style web card with NativeWind (matches mobile app design)
- [ ] T084 [US2] Add mobile-responsive layout for web card (test on various screen sizes)
- [ ] T085 [US2] Add "This card is no longer available" handling for deleted profiles
- [ ] T086 [US2] Deploy web card to Vercel/Netlify (configure environment variables)

#### vCard Generation

- [ ] T087 [P] [US2] Create vCard generator utility in `lib/utils/vcf.ts` (formats profile as vCard 3.0/4.0)
- [ ] T088 [P] [US2] Add download vCard button to web card view
- [ ] T089 [US2] Test vCard import on iOS Contacts, Android Contacts, Outlook

#### Integration & Polish

- [ ] T090 [US2] Add loading state while QR code generates
- [ ] T091 [US2] Add error handling for shareable link fetch failures
- [ ] T092 [US2] Add analytics tracking for QR scans (increment access_count)

**Checkpoint**: User Story 2 complete - users can share cards via QR, recipients can view on web

---

## Phase 5: User Story 3 - Multiple Sharing Methods (Priority: P3)

**Goal**: Users have flexibility in sharing - AirDrop for nearby iOS users, email for formal introductions, SMS for quick exchanges, copy link for messaging apps, and .vcf files for direct contact import.

**Independent Test**: A user with a complete profile can access all sharing methods from the Share screen. Each method successfully delivers the card information or link to recipients. Works independently of contact management features.

### Tests for User Story 3 (TDD Approach)

- [ ] T093 [P] [US3] Component test for share buttons in `tests/components/share/share-buttons.test.tsx`
- [ ] T094 [P] [US3] Integration test for share methods in `tests/integration/share-methods.test.tsx`
- [ ] T095 [P] [US3] E2E test for various share methods in `tests/e2e/share-methods.e2e.ts`

### Implementation for User Story 3

#### Share Methods Infrastructure

- [ ] T096 [P] [US3] Install `expo-sharing` and `expo-file-system` packages
- [ ] T097 [P] [US3] Install `expo-clipboard` package for copy link functionality
- [ ] T098 [P] [US3] Create share utilities in `lib/utils/sharing.ts` (wrappers for Expo Sharing API)

#### Share Methods Components

- [ ] T099 [P] [US3] Create share buttons component in `components/share/share-buttons.tsx` (AirDrop, Email, SMS, Copy, vCard)
- [ ] T100 [P] [US3] Create share method modal in `components/share/share-modal.tsx` (bottom sheet with share options)

#### Share Method Implementations

- [ ] T101 [P] [US3] Implement AirDrop share in `lib/utils/sharing.ts` (Expo Sharing on iOS)
- [ ] T102 [P] [US3] Implement email share using `Linking.openURL('mailto:...')` with pre-filled message
- [ ] T103 [P] [US3] Implement SMS share using `Linking.openURL('sms:...')` with card link
- [ ] T104 [P] [US3] Implement copy link using `expo-clipboard`
- [ ] T105 [US3] Implement vCard file share (generate vCard, save to temp, share via Expo Sharing)

#### Integration with Share Screen

- [ ] T106 [US3] Add share buttons to Share screen in `app/(tabs)/share.tsx`
- [ ] T107 [US3] Add platform-specific logic (show AirDrop only on iOS)
- [ ] T108 [US3] Add success/error toasts for share actions
- [ ] T109 [US3] Add analytics tracking for share method usage

**Checkpoint**: User Story 3 complete - users can share via multiple methods

---

## Phase 6: User Story 4 - Receive and Organize Cards in Network Tab (Priority: P4)

**Goal**: Users can organize received business cards, search by name/company, add tags and meeting notes, and access individual card details. The app becomes a professional networking hub.

**Independent Test**: A user who has received multiple cards (via any method) can view them in an organized list on the Network tab, search/filter, add tags and meeting notes, and access individual card details. Works independently of the exchange feature.

### Tests for User Story 4 (TDD Approach)

- [ ] T110 [P] [US4] Component test for contact list in `tests/components/network/contact-list.test.tsx`
- [ ] T111 [P] [US4] Component test for contact card item in `tests/components/network/contact-card.test.tsx`
- [ ] T112 [P] [US4] Component test for search/filter in `tests/components/network/contact-filter.test.tsx`
- [ ] T113 [P] [US4] Integration test for contact management in `tests/integration/contact-management.test.tsx`
- [ ] T114 [P] [US4] E2E test for network tab in `tests/e2e/network-tab.e2e.ts`

### Implementation for User Story 4

#### Saved Contacts Data Layer

- [ ] T115 [P] [US4] Create saved contacts API service in `lib/supabase/contacts.ts` (saveContact, updateContact, deleteContact, searchContacts)
- [ ] T116 [US4] Create contacts hooks in `lib/hooks/use-contacts.ts` (useContacts, useSaveContact, useUpdateContact, useSearchContacts)

#### Network Tab Components

- [ ] T117 [P] [US4] Create contact list component in `components/network/contact-list.tsx` (uses FlashList for performance)
- [ ] T118 [P] [US4] Create contact card item in `components/network/contact-card.tsx` (displays name, company, picture, tags)
- [ ] T119 [P] [US4] Create contact search bar in `components/network/contact-search.tsx` (debounced search input)
- [ ] T120 [P] [US4] Create contact filter component in `components/network/contact-filter.tsx` (filter by tags)
- [ ] T121 [US4] Create empty state component in `components/network/empty-state.tsx` (when no contacts saved)

#### Contact Detail Screen

- [ ] T122 [US4] Create contact detail screen in `app/contact/[id].tsx` (dynamic route, shows full profile)
- [ ] T123 [US4] Add tag editor in contact detail screen (add/remove custom tags)
- [ ] T124 [US4] Add notes editor in contact detail screen (meeting notes, context)
- [ ] T125 [US4] Add favorite toggle in contact detail screen
- [ ] T126 [US4] Add export to device contacts button (generates vCard and uses device API)

#### Network Tab Screen

- [ ] T127 [US4] Create Network tab screen in `app/(tabs)/network.tsx` (displays contact list with search/filter)
- [ ] T128 [US4] Implement search functionality with debouncing (300ms delay)
- [ ] T129 [US4] Implement tag filtering (multi-select tags)
- [ ] T130 [US4] Add pull-to-refresh for contact list
- [ ] T131 [US4] Add pagination/infinite scroll for 500+ contacts

#### Contact Management

- [ ] T132 [US4] Add "Save Contact" action to web card view (for recipients with app installed)
- [ ] T133 [US4] Handle duplicate contact detection (prevent saving same contact twice)
- [ ] T134 [US4] Add contact update indicator (show "Updated" badge when profile changes)

#### Integration & Polish

- [ ] T135 [US4] Add loading skeletons for contact list
- [ ] T136 [US4] Add error handling for contact operations (save, update, delete)
- [ ] T137 [US4] Add confirmation dialog for delete contact
- [ ] T138 [US4] Optimize performance for large contact lists (virtualization, memoization)

**Checkpoint**: User Story 4 complete - users can organize and manage received cards

---

## Phase 7: User Story 5 - Seamless In-App User Exchange (Priority: P5)

**Goal**: Two users with the app can exchange cards instantly via in-app QR scanning. Both cards are automatically saved to each other's Network tab. Creates network effects - more users = more valuable.

**Independent Test**: Two users with the app can initiate an exchange where one displays their in-app QR code, the other scans it within the app, and both users' cards are automatically saved to each other's Network tabs with confirmation.

### Tests for User Story 5 (TDD Approach)

- [ ] T139 [P] [US5] Component test for in-app QR scanner in `tests/components/scan/qr-scanner.test.tsx`
- [ ] T140 [P] [US5] Integration test for card exchange flow in `tests/integration/card-exchange.test.tsx`
- [ ] T141 [P] [US5] E2E test for mutual card exchange in `tests/e2e/card-exchange.e2e.ts`

### Implementation for User Story 5

#### Card Exchanges Data Layer

- [ ] T142 [P] [US5] Create card exchanges API service in `lib/supabase/card-exchanges.ts` (createExchange, acceptExchange, getExchanges)
- [ ] T143 [US5] Create card exchange hooks in `lib/hooks/use-card-exchanges.ts` (useCreateExchange, useAcceptExchange)

#### In-App QR Scanner

- [ ] T144 [P] [US5] Install `expo-camera` package for barcode scanning
- [ ] T145 [P] [US5] Create camera permissions utility in `lib/hooks/use-permissions.ts` (request camera permission)
- [ ] T146 [P] [US5] Create in-app QR scanner component in `components/scan/qr-scanner.tsx` (Camera with barcode scanner)
- [ ] T147 [US5] Add QR code validation logic (ensure it's a valid BizzyCard QR)

#### QR Scan Screen

- [ ] T148 [US5] Create scan screen in `app/scan/index.tsx` (in-app camera for QR scanning)
- [ ] T149 [US5] Add scan success animation and feedback
- [ ] T150 [US5] Add error handling for invalid QR codes
- [ ] T151 [US5] Add permission denied screen (explain why camera is needed)

#### Card Exchange Flow

- [ ] T152 [US5] Create card preview modal after scan (shows scanned user's card before saving)
- [ ] T153 [US5] Add "Save to Network" button in preview modal
- [ ] T154 [US5] Implement mutual exchange logic (both users' cards saved automatically)
- [ ] T155 [US5] Add exchange acceptance flow (recipient can accept/decline)

#### Exchange Notifications

- [ ] T156 [US5] Send notification when someone scans your card (via application logic)
- [ ] T157 [US5] Send notification when mutual exchange completes
- [ ] T158 [US5] Add exchange request notification UI in app

#### Integration with Share Screen

- [ ] T159 [US5] Add "Scan QR Code" button to Share screen (opens in-app scanner)
- [ ] T160 [US5] Add visual distinction between "My QR Code" (for others to scan) and "Scan QR Code" (to scan others)

**Checkpoint**: User Story 5 complete - users can exchange cards seamlessly in-app

---

## Phase 8: User Story 6 - Resume Upload and Attachment (Priority: P6)

**Goal**: Users attending job fairs or recruiting events can attach their resume to their business card. Recipients viewing the web card can download the resume alongside contact info.

**Independent Test**: A user can upload a PDF resume from the My Card screen, toggle its visibility in privacy settings, and recipients viewing the shared web card can download the resume. Works independently of all other features.

### Tests for User Story 6 (TDD Approach)

- [ ] T161 [P] [US6] Component test for resume upload in `tests/components/profile/resume-upload.test.tsx`
- [ ] T162 [P] [US6] Integration test for resume attachment in `tests/integration/resume-attachment.test.tsx`
- [ ] T163 [P] [US6] E2E test for resume upload and download in `tests/e2e/resume-upload.e2e.ts`

### Implementation for User Story 6

#### Resume Data Layer

- [ ] T164 [P] [US6] Create resume API service in `lib/supabase/resumes.ts` (uploadResume, deleteResume, getResumeUrl)
- [ ] T165 [US6] Create resume hooks in `lib/hooks/use-resume.ts` (useUploadResume, useDeleteResume)

#### Resume Upload Components

- [ ] T166 [P] [US6] Create document picker utility in `lib/utils/document-picker.ts` (expo-document-picker wrapper)
- [ ] T167 [P] [US6] Create resume upload component in `components/profile/resume-upload.tsx` (file picker, validation, upload)
- [ ] T168 [P] [US6] Add file validation (PDF only, max 10MB)
- [ ] T169 [US6] Add upload progress indicator

#### Resume Display & Management

- [ ] T170 [US6] Create upload resume screen in `app/profile/upload-resume.tsx` (document picker + upload)
- [ ] T171 [US6] Add resume indicator to My Card screen (shows attached resume with preview/remove options)
- [ ] T172 [US6] Add resume visibility toggle in profile settings (include in shares or not)
- [ ] T173 [US6] Add resume preview functionality (open PDF viewer)

#### Resume Download on Web Card

- [ ] T174 [US6] Add "Download Resume" button to web card view in `web-card/src/App.tsx`
- [ ] T175 [US6] Implement resume download with proper filename (e.g., "John_Doe_Resume.pdf")
- [ ] T176 [US6] Add conditional rendering (only show if resume attached and visible)

#### Integration & Polish

- [ ] T177 [US6] Add loading state during resume upload (progress bar)
- [ ] T178 [US6] Add error handling for upload failures (size exceeded, wrong format)
- [ ] T179 [US6] Add success confirmation after upload
- [ ] T180 [US6] Add confirmation dialog before deleting resume

**Checkpoint**: User Story 6 complete - users can attach resumes to their cards

---

## Phase 9: User Story 7 - Onboarding Flow for First-Time Users (Priority: P7)

**Goal**: New users are guided through an onboarding flow explaining the app's value proposition and key features. The flow is skippable for advanced users who want to dive in directly.

**Independent Test**: A new user opening the app for the first time sees an onboarding flow (2-3 screens) explaining key features, then proceeds to profile creation. Users can skip onboarding and go straight to creating their card.

### Tests for User Story 7 (TDD Approach)

- [ ] T181 [P] [US7] Component test for onboarding screens in `tests/components/onboarding/onboarding-flow.test.tsx`
- [ ] T182 [P] [US7] Integration test for onboarding navigation in `tests/integration/onboarding-flow.test.tsx`
- [ ] T183 [P] [US7] E2E test for first-time user onboarding in `tests/e2e/onboarding.e2e.ts`

### Implementation for User Story 7

#### Onboarding State Data Layer

- [ ] T184 [P] [US7] Create onboarding state API service in `lib/supabase/onboarding.ts` (getOnboardingState, updateOnboardingState)
- [ ] T185 [US7] Create onboarding hooks in `lib/hooks/use-onboarding.ts` (useOnboardingState, useCompleteOnboarding)

#### Onboarding Screens

- [ ] T186 [P] [US7] Create onboarding layout in `app/(onboarding)/_layout.tsx` (stack navigator)
- [ ] T187 [P] [US7] Create welcome screen in `app/(onboarding)/welcome.tsx` (explains digital business cards)
- [ ] T188 [P] [US7] Create features screen in `app/(onboarding)/features.tsx` (swipeable screens with key features)
- [ ] T189 [US7] Add skip button to all onboarding screens

#### Onboarding Components

- [ ] T190 [P] [US7] Create onboarding slide component in `components/onboarding/onboarding-slide.tsx` (reusable slide with image, title, description)
- [ ] T191 [P] [US7] Create pagination dots component in `components/onboarding/pagination-dots.tsx` (shows current slide)
- [ ] T192 [US7] Add swipe gestures between onboarding screens

#### Onboarding Logic

- [ ] T193 [US7] Add onboarding check in `app/index.tsx` (new users → onboarding, returning → main app)
- [ ] T194 [US7] Add skip onboarding functionality (mark as skipped in database)
- [ ] T195 [US7] Add complete onboarding functionality (mark as completed, redirect to profile creation)
- [ ] T196 [US7] Ensure onboarding only shows once per user

#### Integration & Polish

- [ ] T197 [US7] Add onboarding animations (slide transitions, fade-ins)
- [ ] T198 [US7] Add onboarding illustrations or graphics
- [ ] T199 [US7] Add onboarding copy and messaging
- [ ] T200 [US7] Test onboarding on various screen sizes

**Checkpoint**: User Story 7 complete - new users have guided first-run experience

---

## Phase 10: Notifications Infrastructure (Cross-Cutting)

**Purpose**: Push notifications for card saved, profile updated, and exchange requests. Supports all user stories that involve interactions between users.

### Tests for Notifications

- [ ] T201 [P] Component test for notification list in `tests/components/notifications/notification-list.test.tsx`
- [ ] T202 [P] Integration test for notification delivery in `tests/integration/notifications.test.tsx`

### Implementation

#### Notifications Data Layer

- [ ] T203 [P] Create notifications API service in `lib/supabase/notifications.ts` (getNotifications, markAsRead, getUnreadCount)
- [ ] T204 Create notifications hooks in `lib/hooks/use-notifications.ts` (useNotifications, useMarkAsRead, useUnreadCount)

#### Push Notifications Setup

- [ ] T205 Install `expo-notifications` package
- [ ] T206 Configure push notification permissions in `lib/hooks/use-permissions.ts`
- [ ] T207 Create notification handler in `lib/notifications/handler.ts` (register device, handle incoming)
- [ ] T208 Setup Supabase real-time subscription for new notifications
- [ ] T209 Create notification background handler for iOS/Android

#### Notification UI

- [ ] T210 [P] Create notification list component in `components/notifications/notification-list.tsx`
- [ ] T211 [P] Create notification item component in `components/notifications/notification-item.tsx`
- [ ] T212 [P] Create unread badge component in `components/notifications/unread-badge.tsx`
- [ ] T213 Create notification screen in `app/notifications/index.tsx` (list all notifications)

#### Notification Triggers

- [ ] T214 Add notification trigger when someone saves your card (via Supabase webhook or trigger)
- [ ] T215 Add notification trigger when saved contact updates profile (via Supabase trigger)
- [ ] T216 Add notification trigger for exchange requests
- [ ] T217 Add notification trigger for exchange acceptance

#### Integration

- [ ] T218 Add unread count badge to app icon
- [ ] T219 Add notification preferences screen (enable/disable notification types)
- [ ] T220 Add in-app notification fallback (when push disabled)
- [ ] T221 Test notifications on iOS and Android physical devices

**Checkpoint**: Notifications fully functional across all user stories

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, performance optimization, and final polish

### Performance Optimization

- [ ] T222 [P] Profile app with React DevTools Profiler (identify slow renders)
- [ ] T223 [P] Optimize images with WebP compression (profile pictures)
- [ ] T224 [P] Implement FlashList in Network tab (replace FlatList for better performance)
- [ ] T225 [P] Add React.memo() to frequently re-rendered components
- [ ] T226 [P] Optimize React Query cache settings (stale times, gc times)
- [ ] T227 Measure app bundle size and optimize if >50MB

### Offline Support

- [ ] T228 [P] Add offline detection with `expo-network` in `lib/hooks/use-offline.ts`
- [ ] T229 [P] Add offline banner UI in `components/ui/offline-banner.tsx`
- [ ] T230 Create offline action queue for profile updates (sync when online)
- [ ] T231 Test offline mode (cached data accessible, actions queued)

### Error Tracking & Monitoring

- [ ] T232 [P] Setup Sentry for error tracking (recommended for production, not blocking for MVP) $(configure in `app/_layout.tsx`)
- [ ] T233 [P] Add error boundaries to all major screens
- [ ] T234 Add performance monitoring for API calls (Sentry transactions)

### Accessibility

- [ ] T235 [P] Add accessibility labels to all interactive elements
- [ ] T236 [P] Test with iOS VoiceOver (critical flows: profile, share, network)
- [ ] T237 [P] Test with Android TalkBack
- [ ] T238 Verify color contrast meets WCAG AA standards (Lighthouse audit)
- [ ] T239 Verify touch targets are 44x44pt minimum

### Security Audit

- [ ] T240 [P] Review all Supabase RLS policies (ensure user isolation)
- [ ] T241 [P] Audit file upload validation (prevent malicious files)
- [ ] T242 [P] Verify all sensitive data uses Expo SecureStore
- [ ] T243 Review Clerk JWT integration (ensure tokens validated correctly)
- [ ] T244 Run `npm audit` and fix vulnerabilities

### Documentation

- [ ] T245 [P] Update README.md with setup instructions (link to quickstart.md)
- [ ] T246 [P] Document environment variables in `.env.example`
- [ ] T247 [P] Add inline code comments for complex logic
- [ ] T248 [P] Create API documentation for Supabase edge functions (if any)

### Testing & Quality

- [ ] T249 Run full test suite and ensure >80% coverage
- [ ] T250 Run E2E tests on iOS simulator
- [ ] T251 Run E2E tests on Android emulator
- [ ] T252 Test on physical devices (iPhone, Android)
- [ ] T253 Run Lighthouse audit on web card view (performance, accessibility)
- [ ] T254 Validate all acceptance scenarios from spec.md

### Final Polish

- [ ] T255 [P] Add loading animations (skeleton screens for all data fetching)
- [ ] T256 [P] Add success/error animations (Lottie or react-native-reanimated)
- [ ] T257 Add haptic feedback for key actions (save, share, scan)
- [ ] T258 Polish typography and spacing (ensure consistency)
- [ ] T259 Dark mode support (test all screens with dark theme)
- [ ] T260 Add app icon and splash screen assets
- [ ] T261 Test deep linking (QR codes, shareable URLs)

### Deployment Preparation

- [ ] T262 Configure EAS Build for production (iOS and Android)
- [ ] T263 Setup EAS Update for OTA updates
- [ ] T264 Configure app store metadata (screenshots, descriptions)
- [ ] T265 Test production build on TestFlight (iOS)
- [ ] T266 Test production build on Google Play Internal Testing (Android)

**Checkpoint**: App is polished, tested, and ready for production deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if team capacity allows)
  - Or sequentially in priority order: US1 → US2 → US3 → US4 → US5 → US6 → US7
- **Notifications (Phase 10)**: Can be implemented in parallel with user stories US4-US7
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Depends on US1 (needs profile to share)
- **User Story 3 (P3)**: Can start after US2 - Extends sharing functionality
- **User Story 4 (P4)**: Can start after Foundational - Independent (just needs profiles to exist)
- **User Story 5 (P5)**: Depends on US4 (needs Network tab to save exchanged cards)
- **User Story 6 (P6)**: Can start after US1 - Extends profile functionality
- **User Story 7 (P7)**: Can start after US1 - Independent (onboarding flow before profile creation)

### Within Each User Story

1. Tests MUST be written and FAIL before implementation
2. Data layer (API services, hooks) before UI components
3. Reusable components before screens
4. Core screens before integration/polish
5. Story complete and tested before moving to next priority

### Parallel Opportunities

**Setup Phase**: All tasks marked [P] (T003, T004, T006-T010)

**Foundational Phase**:

- T018-T019 (domain types)
- T023 (auth guards) parallel with T022
- T028 (validation utils) parallel with T027
- T030-T032 (UI foundation components)
- T035 (deep linking) parallel with T033-T034

**User Story 1**:

- Tests: T036-T040 (all parallel)
- Auth screens: T041-T042 (parallel)
- Data layer: T044-T045 (parallel), T047 (parallel with T046)
- Components: T048-T049, T051-T053, T055-T057 (all parallel where no dependencies)

**User Story 2**:

- Tests: T067-T070 (all parallel)
- Data + QR: T071, T073-T074 (parallel)
- Web card: T079-T082 (parallel)
- vCard: T087-T088 (parallel)

**User Story 3**:

- Tests: T093-T095 (all parallel)
- Infrastructure: T096-T098 (all parallel)
- Share methods: T101-T104 (all parallel)

**User Story 4**:

- Tests: T110-T114 (all parallel)
- Components: T117-T121 (all parallel)

**User Story 5**:

- Tests: T139-T141 (all parallel)
- Scanner setup: T144-T146 (parallel)

**User Story 6**:

- Tests: T161-T163 (all parallel)
- Components: T166-T168 (parallel)

**User Story 7**:

- Tests: T181-T183 (all parallel)
- Screens: T186-T188 (parallel)
- Components: T190-T191 (parallel)

**Notifications Phase**:

- Tests: T201-T202 (parallel)
- Data + setup: T203-T204 (parallel)
- UI components: T210-T212 (parallel)

**Polish Phase**:

- Performance: T222-T226 (all parallel)
- Offline: T228-T229 (parallel)
- Error tracking: T232-T234 (parallel)
- Accessibility: T235-T239 (all parallel)
- Security: T240-T244 (all parallel)
- Documentation: T245-T248 (all parallel)
- Animations: T255-T256 (parallel)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (write them first):
Task T036: "Component test for sign-up form in tests/components/auth/sign-up-form.test.tsx"
Task T037: "Component test for profile creation form in tests/components/profile/profile-form.test.tsx"
Task T038: "Component test for My Card screen in tests/components/my-card.test.tsx"
Task T039: "Integration test for complete profile creation flow in tests/integration/profile-creation.test.tsx"
Task T040: "E2E test for sign-up and profile creation in tests/e2e/create-profile.e2e.ts"

# Launch auth screens together (after tests fail):
Task T041: "Create sign-in screen in app/(auth)/sign-in.tsx"
Task T042: "Create sign-up screen in app/(auth)/sign-up.tsx"

# Launch data layer together:
Task T044: "Create profile API service in lib/supabase/profiles.ts"
Task T045: "Create social links API service in lib/supabase/social-links.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 Only)

**Minimum Viable Product**: Users can sign up, create their digital card, and share it via QR code. Recipients can view the card on a web page.

1. Complete Phase 1: Setup (~2-3 hours)
2. Complete Phase 2: Foundational (~4-6 hours)
3. Complete Phase 3: User Story 1 (~8-12 hours)
4. Complete Phase 4: User Story 2 (~6-8 hours)
5. **STOP and VALIDATE**: Test MVP independently
6. Deploy web card to production
7. Create development build and test on physical devices
8. Ready for beta testing or demo

**Total MVP Time Estimate**: ~20-30 hours of development

### Incremental Delivery

Each phase adds value without breaking previous functionality:

1. **Setup + Foundational** → Foundation ready
2. **+ User Story 1** → Users can create and view their card (MVP baseline)
3. **+ User Story 2** → Users can share via QR code (MVP complete) 🎯
4. **+ User Story 3** → Users have multiple sharing options
5. **+ User Story 4** → Users can organize received cards (networking hub)
6. **+ User Story 5** → In-app users can exchange cards seamlessly
7. **+ User Story 6** → Job seekers can attach resumes
8. **+ User Story 7** → New users get guided onboarding
9. **+ Notifications** → Users get real-time updates
10. **+ Polish** → Production-ready app

### Parallel Team Strategy

With multiple developers (3 people):

**Week 1**:

- Team: Complete Setup + Foundational together (~1 day)
- Developer A: User Story 1 (Profile & My Card)
- Developer B: User Story 2 (QR Code & Web Card)
- Developer C: User Story 4 (Network Tab)

**Week 2**:

- Developer A: User Story 3 (Share Methods)
- Developer B: User Story 5 (In-App Exchange)
- Developer C: User Story 6 (Resume Upload)

**Week 3**:

- Developer A: User Story 7 (Onboarding)
- Developer B: Notifications Infrastructure
- Developer C: Polish & Testing

---

## Task Summary

**Total Tasks**: 266

**Tasks by Phase**:

- Phase 1 (Setup): 10 tasks
- Phase 2 (Foundational): 25 tasks
- Phase 3 (User Story 1): 30 tasks
- Phase 4 (User Story 2): 26 tasks
- Phase 5 (User Story 3): 17 tasks
- Phase 6 (User Story 4): 28 tasks
- Phase 7 (User Story 5): 22 tasks
- Phase 8 (User Story 6): 20 tasks
- Phase 9 (User Story 7): 20 tasks
- Phase 10 (Notifications): 21 tasks
- Phase 11 (Polish): 47 tasks

**Parallel Opportunities**: 120+ tasks marked [P] can run in parallel with proper team coordination

**Independent Test Criteria**: Each user story has clear independent test criteria and acceptance scenarios from spec.md

**MVP Scope**: User Story 1 + User Story 2 (56 tasks including Setup and Foundational)

**Constitution Compliance**: All tasks follow TDD approach (tests first) per Principle II

---

## Notes

- All tasks follow the strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- [P] tasks can be parallelized (different files, no blocking dependencies)
- [Story] labels (US1-US7) map tasks to specific user stories for traceability
- Each user story is independently testable and deliverable
- Tests are written FIRST (TDD approach) - they must fail before implementation
- Stop at any checkpoint to validate story independently
- Each phase represents a deployable increment
- Commit after each task or logical group
- All paths are based on Expo + React Native project structure from plan.md
