# Implementation Plan: Digital Business Card Application

**Branch**: `001-digital-business-card` | **Date**: 2025-11-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-digital-business-card/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

BizzyCard is a mobile application for tech professionals to create, share, and manage digital business cards. The app enables users to create personal profiles with professional information, share cards via QR code with web view for non-app users, and organize received business cards in an in-app network. The technical approach uses React Native with Expo for cross-platform mobile development, Clerk for authentication, Supabase (PostgreSQL + Storage) for backend, NativeWind/Tailwind for styling, and React Native Reusables for UI components. The implementation will follow test-driven development with Jest/React Native Testing Library, prioritizing user stories P1-P2 for MVP (Profile + My Card + QR Share + Web View).

## Technical Context

**Language/Version**: TypeScript 5.x with React Native via Expo SDK 52+, strict mode enabled  
**Primary Dependencies**:

- Frontend: Expo Router (file-based routing), React Native Reusables (UI components), NativeWind (Tailwind for RN)
- Authentication: Clerk SDK for React Native
- Backend: Supabase JS Client (PostgreSQL database, Storage, Real-time subscriptions)
- Additional: Expo Camera (QR scanning), Expo Sharing/FileSystem (share flows), Expo Notifications (push notifications)

**Storage**: Supabase PostgreSQL (user profiles, social links, saved contacts, notifications), Supabase Storage (profile pictures, resume PDFs), Expo SecureStore (auth tokens), AsyncStorage (local caching for offline access)  
**Testing**: Jest + React Native Testing Library (component/integration tests), Detox (E2E for critical flows), Supabase local development environment  
**Target Platform**: iOS 15+ and Android 10+ (cross-platform with Expo managed workflow)  
**Project Type**: Mobile application (React Native + Expo) with backend API integration  
**Performance Goals**:

- App launch: <3s cold start
- Screen transitions: <300ms with 60fps
- QR generation: <2s
- Web card load: <2s on 4G
- API responses: <200ms (read), <500ms (write) p95

**Constraints**:

- App bundle size: <50MB
- Profile picture uploads: max 5MB (JPG/PNG/WebP)
- Resume uploads: max 10MB (PDF only)
- Offline-capable: cached user profile + saved contacts accessible without network
- Cross-device sync: profile changes sync within 2s
- Security: all sensitive data in SecureStore, HTTPS only, row-level security on Supabase

**Scale/Scope**:

- Initial target: 10k users
- 7 main user stories (P1-P7 prioritization)
- ~15-20 screens including onboarding, profile management, share flows, network tab
- Backend: ~10 database tables, ~15-20 API endpoints (Supabase REST + real-time)
- File storage: profile pictures + resumes with CDN delivery

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle I: Code Quality & Type Safety ✅

- TypeScript strict mode enabled: ✅ (tsconfig.json already configured)
- No `any` types except documented third-party interfaces: ✅
- Explicit return types on all functions: ✅
- React components use TypeScript interfaces for props: ✅
- Naming conventions (PascalCase/camelCase/UPPER_SNAKE_CASE): ✅
- Prettier + ESLint configured: ✅ (existing setup)
- No prop drilling beyond 2 levels: ✅ (will use Context/Clerk/Supabase state)

**Status**: PASS - All requirements met by existing configuration and planned approach

### Principle II: Testing Standards ✅

- Test-Driven Development (tests before implementation): ✅ PLANNED
- Component tests for UI with multiple states: ✅ PLANNED
- Integration tests for navigation, API, state management: ✅ PLANNED
- E2E tests for critical journeys (auth, profile, share): ✅ PLANNED (Detox)
- Given-When-Then structure: ✅ PLANNED
- Test isolation: ✅ PLANNED
- 80% coverage for new code, 100% for critical paths: ✅ PLANNED

**Status**: PASS - Testing infrastructure and standards will be established in Phase 1

### Principle III: User Experience Consistency ✅

- React Native Reusables design system: ✅ SPECIFIED (user requirement)
- No custom UI without justification: ✅
- Loading/error/empty states on all screens: ✅ PLANNED
- Centralized user-facing text constants: ✅ PLANNED
- Platform-specific behavior via Platform API: ✅ PLANNED
- Form validation with clear error messages: ✅ PLANNED
- Accessibility: semantic labels, WCAG AA contrast, 44x44pt touch targets, screen reader support: ✅ PLANNED

**Status**: PASS - React Native Reusables provides accessible components, will ensure compliance

### Principle IV: Security Requirements ✅

- Expo SecureStore for sensitive data (tokens, API keys): ✅ PLANNED
- No sensitive data in AsyncStorage/Redux/logs: ✅ PLANNED
- HTTPS only (Supabase enforces): ✅
- Input validation and sanitization: ✅ PLANNED
- Secure auth token management (Clerk handles): ✅
- Dependency security audits: ✅ PLANNED (CI/CD)
- Environment variables for config: ✅ PLANNED (Expo env config)
- WebViews with JavaScript injection disabled: ✅ N/A (no WebViews in app, only serving web cards)

**Status**: PASS - Clerk and Supabase provide security infrastructure, will implement best practices

### Principle V: Performance Requirements ✅

- Initial render <1s on mid-range devices: ✅ PLANNED
- FlatList/FlashList for lists >20 items: ✅ PLANNED (Network tab)
- Image optimization (WebP, lazy loading, placeholders): ✅ PLANNED (Supabase CDN + compression)
- 60fps navigation transitions: ✅ (Expo Router with React Navigation)
- Network timeout/retry/loading states/caching: ✅ PLANNED (React Query for Supabase)
- Bundle size <50MB: ✅ PLANNED (selective imports, dynamic imports)
- Memory management (cleanup subscriptions/timers): ✅ PLANNED

**Status**: PASS - Performance targets align with success criteria, will profile and optimize

### Principle VI: Expo & React Native Best Practices ✅

**Navigation & Routing:**

- Expo Router file-based routing: ✅ ALREADY CONFIGURED (app/\_layout.tsx exists)
- Route naming conventions (\_layout, [param], (group), +html): ✅ PLANNED
- Deep linking in app.json: ✅ PLANNED
- No direct React Navigation APIs: ✅ PLANNED

**React Hooks & Component Patterns:**

- Functional components with hooks only: ✅ PLANNED
- Appropriate hook usage (useState/useReducer/useContext/useMemo/useCallback): ✅ PLANNED
- useEffect with proper dependencies and cleanup: ✅ PLANNED
- Custom hooks with `use` prefix: ✅ PLANNED
- No hooks in conditionals/loops: ✅ PLANNED

**Expo-Specific APIs:**

- expo-file-system for file operations: ✅ PLANNED
- expo-secure-store for secure data: ✅ PLANNED
- expo-camera and expo-image-picker: ✅ PLANNED (QR scan, profile pictures)
- expo-notifications: ✅ PLANNED (push notifications)
- app.json for app metadata: ✅ ALREADY EXISTS
- Expo environment configuration: ✅ PLANNED

**Platform-Specific Code:**

- Platform.OS or Platform.select(): ✅ PLANNED
- Platform-specific files (.ios/.android extensions) only when necessary: ✅ PLANNED
- Minimize platform-specific code: ✅ PLANNED

**Styling & Theming:**

- NativeWind (Tailwind for RN): ✅ SPECIFIED (user requirement, already configured)
- No inline StyleSheet.create() except dynamic styles: ✅ PLANNED
- Theme in tailwind.config.js: ✅ ALREADY CONFIGURED
- Responsive styles with Tailwind breakpoints: ✅ PLANNED
- Dark mode via `dark:` variant: ✅ PLANNED

**Assets & Resources:**

- Optimized images: ✅ PLANNED (assets/ directory exists)
- App icons in app.json: ✅ ALREADY CONFIGURED
- Splash screen in app.json: ✅ ALREADY CONFIGURED
- expo-font for custom fonts: ✅ PLANNED (if needed)
- Large assets loaded asynchronously: ✅ PLANNED

**Development Workflow:**

- Expo CLI for dev server: ✅ ALREADY IN USE
- Hot reload: ✅ ALREADY IN USE
- EAS Build for production: ✅ PLANNED
- EAS Update for OTA updates: ✅ PLANNED
- eas.json for environment configs: ✅ PLANNED
- Config plugins instead of eject: ✅ PLANNED

**Permissions & Privacy:**

- Just-in-time permission requests: ✅ PLANNED (camera for QR scan)
- Permission explanations: ✅ PLANNED
- Permissions in app.json: ✅ PLANNED
- Graceful permission denial handling: ✅ PLANNED

**Error Handling:**

- User-friendly error messages: ✅ PLANNED
- Network error retry and offline states: ✅ PLANNED
- Error boundaries: ✅ PLANNED
- Production error tracking: ✅ PLANNED (consider Sentry)

**Offline Support:**

- Network connectivity detection: ✅ PLANNED (expo-network)
- Local caching for critical data: ✅ PLANNED (AsyncStorage + React Query)
- Offline action queuing: ✅ PLANNED
- UI offline indicators: ✅ PLANNED

**Status**: PASS - Expo best practices align with existing setup and planned architecture

### Overall Assessment

**GATE STATUS: PASS ✅**

All constitution principles are satisfied by the chosen technology stack:

- Clerk provides secure, managed authentication
- Supabase provides PostgreSQL, storage, real-time capabilities with row-level security
- NativeWind + React Native Reusables provide consistent, accessible UI
- Expo managed workflow with Router enables best practices without complexity
- Test-driven approach with Jest/React Native Testing Library/Detox ensures quality

**No violations requiring justification. Ready to proceed to Phase 0 research.**

---

### Post-Design Re-evaluation (Phase 1 Complete)

After completing Phase 1 design (data model, API contracts, quickstart), all Constitution principles remain satisfied:

**✅ Principle I (Code Quality & Type Safety)**:

- TypeScript types defined in `contracts/types.ts`
- Supabase will auto-generate types from schema: `supabase gen types typescript`
- All API contracts documented with strict request/response schemas
- Zod validation schemas planned for runtime type checking

**✅ Principle II (Testing Standards)**:

- Test structure defined in `quickstart.md`
- Given-When-Then examples provided in API contracts
- Coverage targets: 80% for new code, 100% for critical paths (auth, profile, share)
- Mock strategies documented (MSW for API mocking)

**✅ Principle III (User Experience Consistency)**:

- React Native Reusables confirmed as UI library
- All screens have defined loading/error/empty states in data model
- Text constants strategy documented in project structure
- Accessibility requirements mapped to Success Criteria (SC-011)

**✅ Principle IV (Security Requirements)**:

- Expo SecureStore specified for auth tokens (Clerk manages)
- Supabase RLS policies defined in data model (row-level security)
- HTTPS enforced by Supabase
- Input validation via Zod schemas documented
- File upload validation (size, format) defined in data model

**✅ Principle V (Performance Requirements)**:

- Performance optimizations documented in `research.md` (React Query caching, image optimization, FlashList)
- Bundle size targets defined: <50MB
- API response time targets: <200ms reads, <500ms writes (Supabase SLA)
- Offline support via React Query + AsyncStorage

**✅ Principle VI (Expo & React Native Best Practices)**:

- Expo Router file-based routing structure defined in project structure
- All Expo APIs specified (expo-camera, expo-notifications, expo-secure-store, expo-file-system, expo-sharing)
- NativeWind styling confirmed in all component planning
- Platform-specific code minimized (only where necessary)
- Development workflow with EAS Build/Update documented in quickstart
- Permission handling strategy defined (just-in-time requests)

**GATE STATUS: PASS ✅**

All principles satisfied. Design is complete and ready for implementation (Phase 2: Task breakdown via `/speckit.tasks`).

## Project Structure

### Documentation (this feature)

```text
specs/001-digital-business-card/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── api-endpoints.md # Supabase REST API contracts
│   └── types.ts         # TypeScript types for API contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Expo + React Native Mobile Application Structure

app/                          # Expo Router file-based routing (EXISTING)
├── _layout.tsx              # Root layout with providers (Clerk, theme, etc.)
├── +html.tsx                # Root HTML (web support)
├── +not-found.tsx           # 404 handler
├── index.tsx                # Landing/redirect (authenticated users → (tabs))
├── (auth)/                  # Auth flow (grouped route, not in URL)
│   ├── _layout.tsx          # Auth layout
│   ├── sign-in.tsx          # Sign in screen
│   └── sign-up.tsx          # Sign up screen
├── (onboarding)/            # Onboarding flow (grouped route)
│   ├── _layout.tsx          # Onboarding layout
│   ├── welcome.tsx          # Welcome screen
│   ├── features.tsx         # Features explanation
│   └── create-profile.tsx   # Initial profile creation
├── (tabs)/                  # Main app tabs (grouped route)
│   ├── _layout.tsx          # Tab navigator
│   ├── my-card.tsx          # My Card screen (home)
│   ├── share.tsx            # Share screen with QR code
│   └── network.tsx          # Network/Contacts tab
├── profile/                 # Profile management
│   ├── edit.tsx             # Edit profile form
│   ├── edit-social.tsx      # Edit social links
│   └── upload-resume.tsx    # Resume upload
├── contact/                 # Contact detail screens
│   └── [id].tsx             # Contact detail (dynamic route)
└── scan/                    # In-app QR scanning
    └── index.tsx            # QR scanner screen

components/                   # Reusable UI components
├── ui/                      # React Native Reusables components (EXISTING)
│   ├── button.tsx           # Pre-configured button component
│   ├── text.tsx             # Pre-configured text component
│   └── icon.tsx             # Icon component
├── business-card/           # Business card display components
│   ├── card-preview.tsx     # Card preview component
│   ├── card-field.tsx       # Individual field display
│   └── social-links.tsx     # Social media links list
├── profile/                 # Profile-related components
│   ├── profile-picture.tsx  # Profile picture with fallback
│   ├── profile-form.tsx     # Profile editing form
│   └── tag-input.tsx        # Custom tag input
├── share/                   # Sharing components
│   ├── qr-code.tsx          # QR code generator/display
│   ├── share-buttons.tsx    # Share method buttons
│   └── vcf-generator.tsx    # vCard generation logic
└── network/                 # Network tab components
    ├── contact-list.tsx     # Contact list with search
    ├── contact-card.tsx     # Contact list item
    └── contact-filter.tsx   # Tag filter component

lib/                         # Utilities and services
├── supabase/               # Supabase client and API
│   ├── client.ts           # Supabase client initialization
│   ├── profiles.ts         # Profile CRUD operations
│   ├── contacts.ts         # Saved contacts operations
│   ├── notifications.ts    # Notification operations
│   └── storage.ts          # File upload/download helpers
├── clerk/                  # Clerk auth helpers
│   ├── provider.tsx        # Clerk provider wrapper
│   └── hooks.ts            # Auth hooks
├── utils/                  # General utilities
│   ├── validation.ts       # Input validation (email, phone, URL)
│   ├── formatting.ts       # Data formatting (phone numbers, etc.)
│   └── vcf.ts              # vCard file generation
├── hooks/                  # Custom React hooks
│   ├── use-profile.ts      # Profile data hook
│   ├── use-contacts.ts     # Contacts data hook
│   ├── use-offline.ts      # Offline detection hook
│   └── use-permissions.ts  # Permission handling hook
├── constants/              # App constants
│   ├── text.ts             # User-facing text strings
│   ├── platforms.ts        # Social media platform definitions
│   └── config.ts           # App configuration
├── types/                  # TypeScript type definitions
│   ├── database.ts         # Supabase database types (generated)
│   ├── profile.ts          # Profile domain types
│   └── contact.ts          # Contact domain types
├── theme.ts                # Theme configuration (EXISTING)
└── utils.ts                # General utilities (EXISTING)

assets/                     # Static assets (EXISTING)
├── images/                 # App images
└── fonts/                  # Custom fonts (if needed)

tests/                      # Test files
├── components/             # Component tests
│   ├── business-card/
│   ├── profile/
│   ├── share/
│   └── network/
├── integration/            # Integration tests
│   ├── auth-flow.test.tsx
│   ├── profile-creation.test.tsx
│   ├── share-flow.test.tsx
│   └── network-management.test.tsx
├── e2e/                    # End-to-end tests (Detox)
│   ├── onboarding.e2e.ts
│   ├── create-profile.e2e.ts
│   ├── share-card.e2e.ts
│   └── exchange-cards.e2e.ts
└── lib/                    # Library tests
    ├── supabase/
    ├── utils/
    └── hooks/

supabase/                   # Supabase backend (NEW)
├── migrations/             # Database migrations
│   └── 001_initial_schema.sql
├── functions/              # Edge functions (if needed for web card serving)
│   └── serve-card/
└── seed.sql                # Test data seeding

web-card/                   # Web view for shared cards (NEW - separate hosting)
├── public/
│   └── index.html
├── src/
│   ├── App.tsx             # Web card display component
│   └── main.tsx            # Web entry point
└── vite.config.ts          # Build configuration

# Configuration files (root level)
package.json
tsconfig.json               # TypeScript configuration
app.json                    # Expo configuration
eas.json                    # EAS Build/Update configuration
tailwind.config.js          # NativeWind/Tailwind configuration (EXISTING)
babel.config.js             # Babel configuration (EXISTING)
metro.config.js             # Metro bundler configuration (EXISTING)
jest.config.js              # Jest test configuration (NEW)
.detoxrc.js                 # Detox E2E configuration (NEW)
.env.example                # Environment variable template (NEW)
```

**Structure Decision**:

This is a **mobile application structure** using Expo with file-based routing. Key design decisions:

1. **Expo Router for Navigation**: Using file-based routing in `app/` directory with grouped routes for auth, onboarding, and main tabs. This aligns with Expo best practices (Constitution Principle VI) and reduces boilerplate.

2. **Feature-Based Components**: Components organized by feature domain (business-card, profile, share, network) rather than by type, improving maintainability.

3. **Centralized Services**: `lib/` contains all external service integrations (Supabase, Clerk) and shared utilities, keeping components clean and testable.

4. **Backend via Supabase**: No custom backend server needed. Supabase provides PostgreSQL database, file storage, real-time subscriptions, and REST API with row-level security. Schema defined in `supabase/migrations/`.

5. **Separate Web Card Hosting**: Web-viewable cards for non-app users will be served via Supabase Edge Functions or a lightweight Vite-based web app, keeping the mobile app bundle small.

6. **Test Colocation**: Tests organized to mirror source structure, with separate directories for unit, integration, and E2E tests.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations requiring justification.** All Constitution principles are satisfied by the chosen technology stack and architecture.

---

## Phase 0: Research & Technology Decisions

_(Generated in research.md - see next section)_
