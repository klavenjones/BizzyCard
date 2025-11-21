# Research & Technology Decisions

**Feature**: Digital Business Card Application  
**Branch**: `001-digital-business-card`  
**Date**: 2025-11-21  
**Status**: Phase 0 Complete

## Overview

This document captures all technology decisions, research findings, and rationale for the BizzyCard digital business card application. All NEEDS CLARIFICATION items from Technical Context have been resolved.

---

## 1. Mobile Framework: React Native with Expo

### Decision
Use **React Native via Expo managed workflow** with Expo SDK 52+ for cross-platform mobile development.

### Rationale
- **Cross-platform efficiency**: Single codebase targets iOS 15+ and Android 10+ (requirement FR-082)
- **Rapid development**: Expo provides batteries-included tooling (camera, file system, notifications, secure storage) without native configuration
- **Over-the-air updates**: EAS Update enables instant bug fixes and feature updates without app store review (critical for MVP iteration)
- **Managed workflow**: Avoids native code complexity while meeting all requirements (camera for QR, file sharing, notifications)
- **Constitution compliance**: Expo Router (file-based routing) and Expo APIs align with BizzyCard Constitution v1.1.0 Principle VI
- **Performance**: Modern Expo (SDK 52+) with Hermes engine delivers 60fps performance target (SC-022)

### Alternatives Considered
- **Flutter**: Rejected - team expertise in React/TypeScript, larger community for UI components, Clerk SDK has better React Native support
- **Native iOS/Android**: Rejected - 2x development time, harder to maintain, unnecessary given no platform-specific requirements beyond standard mobile features
- **React Native CLI (bare workflow)**: Rejected - Expo managed workflow meets all requirements, ejecting adds complexity without benefit

### Implementation Notes
- Use Expo Router for navigation (file-based routing in `app/` directory)
- Target Expo SDK 52+ for latest performance improvements
- EAS Build for production builds, EAS Update for OTA updates
- Expo Go for development, development builds for testing native modules

---

## 2. UI Component Library: React Native Reusables

### Decision
Use **React Native Reusables** as the primary UI component library.

### Rationale
- **User requirement**: Explicitly specified by user
- **Accessibility built-in**: Components follow WCAG AA standards (SC-011, Principle III accessibility requirements)
- **Native feel**: Components adapt to iOS and Android platform conventions
- **Customizable**: Built on Radix UI primitives, allows theming via NativeWind
- **TypeScript-first**: Strong typing aligns with Principle I (strict TypeScript)
- **Active maintenance**: Well-maintained with React Native 0.74+ compatibility

### Alternatives Considered
- **React Native Paper**: Rejected - Material Design doesn't match iOS design conventions, less flexible theming
- **NativeBase**: Rejected - heavier bundle size, slower updates, React Native Reusables specified by user
- **Custom components**: Rejected - reinventing accessible components violates Principle III (use established design system)

### Implementation Notes
- Already configured in `components/ui/` (button.tsx, text.tsx, icon.tsx)
- Extend with additional components as needed (Card, Input, Modal, etc.)
- Customize theme colors in `tailwind.config.js` for brand identity
- Document any custom components built when React Native Reusables insufficient (with justification per Principle III)

---

## 3. Styling: NativeWind (Tailwind CSS for React Native)

### Decision
Use **NativeWind 4.x** for styling React Native components.

### Rationale
- **User requirement**: Explicitly specified by user
- **Already configured**: Project has `tailwind.config.js`, `global.css`, and NativeWind setup
- **Productivity**: Utility-first CSS enables rapid UI iteration without writing StyleSheet.create()
- **Consistency**: Same Tailwind classes work across web and mobile (important for web card view)
- **Responsive design**: Built-in breakpoints (sm:, md:, lg:) simplify adaptive layouts
- **Dark mode**: `dark:` variant makes theme switching trivial (Principle VI requirement)
- **Constitution compliance**: Principle VI mandates NativeWind, no inline StyleSheet.create() except for dynamic styles

### Alternatives Considered
- **StyleSheet.create()**: Rejected - verbose, no theming system, violates Principle VI
- **Styled Components**: Rejected - runtime performance overhead, NativeWind is AOT compiled
- **Tamagui**: Rejected - NativeWind already configured and specified by user

### Implementation Notes
- Theme configuration in `tailwind.config.js` (colors, spacing, typography)
- Use `className` prop with Tailwind utilities
- Custom design tokens in Tailwind config for brand colors, spacing scale
- Reserve StyleSheet.create() only for truly dynamic styles (e.g., animated transforms)

---

## 4. Authentication: Clerk

### Decision
Use **Clerk SDK for React Native** for user authentication and account management.

### Rationale
- **User requirement**: Explicitly specified by user
- **Security**: Handles auth tokens, session management, secure storage automatically (Principle IV compliance)
- **Cross-device sync**: Clerk sessions sync across devices (FR-006 requirement)
- **Developer experience**: Pre-built React components for sign-in/sign-up flows
- **Compliance**: SOC 2 Type II certified, GDPR/CCPA compliant
- **Integration**: Works seamlessly with Supabase via JWT authentication
- **Features**: Social login (Google, Apple, GitHub), passwordless, MFA support for future enhancement

### Alternatives Considered
- **Supabase Auth**: Rejected - Clerk has better React Native SDK, more polished UI components, user specified Clerk
- **Firebase Auth**: Rejected - vendor lock-in, Clerk + Supabase is better separation of concerns
- **Custom auth**: Rejected - security risk (Principle IV), slow to build, Clerk provides better UX

### Implementation Notes
- Install `@clerk/clerk-expo` package
- Wrap app in `<ClerkProvider>` in `app/_layout.tsx`
- Use `useUser()`, `useAuth()` hooks for auth state
- Configure Clerk webhook to sync user creation with Supabase (create profile row on signup)
- Store Clerk JWT in Expo SecureStore (Principle IV requirement)
- Configure Supabase RLS policies to validate Clerk JWT

### Integration Pattern
```typescript
// Clerk user signs up → Clerk webhook → Supabase creates profile row
// Mobile app uses Clerk JWT to authenticate Supabase API calls
// Supabase RLS policies validate JWT and enforce row-level security
```

---

## 5. Backend: Supabase (PostgreSQL + Storage + Real-time)

### Decision
Use **Supabase** for backend database, file storage, and real-time subscriptions.

### Rationale
- **User requirement**: Explicitly specified by user
- **All-in-one**: PostgreSQL database, file storage, REST API, real-time subscriptions, row-level security in one service
- **PostgreSQL**: Robust relational database with JSON support, complex queries, referential integrity (FR-007)
- **Row-level security (RLS)**: Database-level access control ensures users only access their own data (FR-015, Principle IV)
- **Storage**: Built-in file storage with CDN delivery for profile pictures and resumes (FR-010, FR-196)
- **Real-time**: WebSocket subscriptions for profile updates, notifications (FR-014, FR-068)
- **TypeScript support**: Auto-generated TypeScript types from database schema (Principle I compliance)
- **Local development**: Supabase CLI enables local database for testing without cloud dependency
- **Performance**: Global CDN for assets, connection pooling, sub-100ms queries (SC-036)

### Alternatives Considered
- **Firebase**: Rejected - NoSQL doesn't fit relational data model (user profiles, contacts, links), user specified Supabase
- **AWS (RDS + S3 + AppSync)**: Rejected - complex setup, overkill for MVP, Supabase is faster to iterate
- **Custom Node.js API**: Rejected - slower to build, Supabase REST API + RLS is more secure and maintainable

### Implementation Notes
- Database schema in `supabase/migrations/001_initial_schema.sql`
- Use `@supabase/supabase-js` client library
- Row-level security policies enforce user isolation (users can only CRUD their own profiles)
- Storage buckets: `profile-pictures` (public), `resumes` (public but obscured URLs)
- Real-time subscriptions for profile updates (notify contacts when user updates their card)
- Supabase Edge Functions for serving web-viewable cards (if needed, otherwise static hosting)

### Database Design Principles
- Normalized schema with foreign keys for data integrity
- Use `uuid` for primary keys (better distribution, security)
- Timestamps (`created_at`, `updated_at`) on all tables for auditing
- Soft deletes for user profiles (keep data for referential integrity, mark as deleted)
- Indexes on frequently queried columns (user_id, email, search fields)

---

## 6. QR Code Generation & Scanning

### Decision
- **Generation**: Use `react-native-qrcode-svg` for QR code generation
- **Scanning**: Use `expo-camera` with BarCodeScanner for QR code scanning

### Rationale
- **Generation library**:
  - Lightweight, generates QR codes as SVG (scalable, crisp on all screens)
  - Works on iOS, Android, and web (important for web card view testing)
  - Supports custom styling (colors, logo embedding for branding)
  - Performance: <2s generation target (SC-005)
- **Scanning (expo-camera)**:
  - Expo-managed API, no native configuration needed
  - Supports both in-app scanning (FR-062) and barcode types detection
  - Permission handling built-in
  - Works with camera features like torch, autofocus
  - Principle VI mandates Expo APIs for camera operations

### Alternatives Considered
- **react-native-qrcode-generator**: Rejected - generates images instead of SVG, larger bundle
- **expo-barcode-generator**: Rejected - less maintained, react-native-qrcode-svg has better styling
- **Vision Camera**: Rejected - overkill for QR scanning, Expo Camera simpler and meets requirements

### Implementation Notes
- QR code data format: `https://bizzycard.app/card/{user_id}` (deep link + web URL)
- Regenerate QR when profile changes (FR-037)
- Cache QR code SVG to avoid regeneration on every render
- In-app scanner validates QR format before processing (prevent scanning invalid codes)
- Handle camera permissions gracefully (Principle VI: just-in-time requests with explanation)

---

## 7. Sharing Methods: Native APIs

### Decision
Use **Expo Sharing API** and **Expo FileSystem** for implementing share flows.

### Rationale
- **Expo Sharing**: 
  - Cross-platform sharing dialog (AirDrop on iOS, native share on Android)
  - Handles all share methods (FR-039, FR-040, FR-041, FR-044)
  - Works with files (.vcf) and URLs
  - Principle VI mandates Expo APIs
- **vCard generation**:
  - Custom implementation using `vcf` library or manual string formatting
  - Standard vCard 3.0/4.0 format ensures compatibility (Assumption 10)
  - Export to temp file, then share via Expo Sharing
- **Email/SMS**:
  - Use `Linking.openURL()` with `mailto:` and `sms:` schemes
  - Pre-populate message with card link (FR-040, FR-041)
- **Clipboard**:
  - Use `expo-clipboard` for copy link functionality (FR-042)

### Alternatives Considered
- **react-native-share**: Rejected - Expo Sharing is managed, no native config needed
- **Custom native modules**: Rejected - unnecessary, Expo APIs cover all requirements

### Implementation Notes
- vCard format includes: name, email, phone, title, company, URL (social links), photo (base64 or URL)
- Share methods display in bottom sheet modal on Share screen
- Track share method analytics (optional, helps understand user preferences)
- Test .vcf import on iOS Contacts, Android Contacts, Outlook (SC-009)

---

## 8. Push Notifications: Expo Notifications

### Decision
Use **Expo Notifications API** for push notifications (FR-069 to FR-076).

### Rationale
- **Cross-platform**: Handles APNs (iOS) and FCM (Android) with unified API
- **Permission management**: Built-in permission requests with explanations (Principle VI)
- **Expo-managed**: No native configuration for dev builds, credentials managed by EAS
- **Local notifications**: Fallback for in-app notifications when push disabled (FR-071)
- **Scheduling**: Can schedule notifications for future delivery
- **Constitution compliance**: Principle VI mandates expo-notifications

### Alternatives Considered
- **Firebase Cloud Messaging (FCM) directly**: Rejected - Expo abstracts platform differences, easier setup
- **OneSignal**: Rejected - third-party service adds cost, Expo Notifications free with EAS

### Implementation Notes
- Request notification permission on first card save action (just-in-time, not at launch)
- Notification types: `card_saved`, `profile_updated` (FR-072, FR-073)
- Store notification preferences in Supabase (user can disable per type)
- Use Supabase real-time subscriptions to trigger notifications
- Local notification badge for unread count (FR-074)
- Notification history stored in Supabase (FR-075)

### Notification Flow
```
User A updates profile → Supabase webhook → Sends notification to User B (who saved User A's card)
User B's app receives push notification → User B opens app → Sees updated card with "refresh" prompt
```

---

## 9. Web Card Hosting: Static Site with Supabase Edge Functions

### Decision
Use **Vite + React + NativeWind** for web card static site, deployed via **Vercel/Netlify** or **Supabase Edge Functions**.

### Rationale
- **Shared styling**: NativeWind (Tailwind) works on web, ensures consistent card styling between app and web view
- **Lightweight**: Static site with minimal JavaScript, optimized for mobile web (SC-010: <2s load time)
- **SEO-friendly**: Static HTML with meta tags for social sharing (Open Graph, Twitter Cards)
- **Serverless**: No server to maintain, scales automatically
- **Performance**: CDN delivery, pre-rendered HTML, lazy-load images
- **Shared types**: Can reuse TypeScript types from mobile app for data contracts

### Architecture
```
Mobile app QR code → https://bizzycard.app/card/{user_id}
Web request → Fetch user profile from Supabase REST API (public endpoint)
Render React component with profile data → Static HTML + JSON
Client-side: Download .vcf button, social links, resume download
```

### Alternatives Considered
- **Server-side rendering (Next.js)**: Rejected - overkill for simple card view, static site is faster
- **Mobile WebView**: Rejected - web view is for recipients without app, needs public URL
- **Supabase Edge Functions only**: Possible, but Vite build provides better DX for web development

### Implementation Notes
- Separate `web-card/` directory with Vite config
- Fetch profile via Supabase REST API (public, read-only endpoint with RLS policy allowing public reads by shareable link)
- Lazy-load profile picture and resume download link
- Error handling: "This card is no longer available" if profile deleted (FR-053)
- Mobile-responsive with NativeWind (same Tailwind classes as mobile app)
- Accessibility: WCAG AA compliance (SC-011)

---

## 10. Offline Support & Caching: React Query + AsyncStorage

### Decision
Use **TanStack React Query** for data fetching and caching, with **AsyncStorage** for persistence.

### Rationale
- **React Query benefits**:
  - Automatic caching, background refetching, optimistic updates
  - Loading/error states built-in (Principle III: handle loading/error states)
  - Stale-while-revalidate: show cached data instantly, refresh in background
  - Reduces Supabase API calls, improves perceived performance
  - Retry logic for transient failures (Principle V requirement)
- **AsyncStorage**:
  - Persisted cache for offline access (FR-081, Principle VI offline support)
  - Stores user's own profile and saved contacts
  - NOT for sensitive data (auth tokens use SecureStore per Principle IV)
- **Offline queue**:
  - Custom queue for offline actions (profile updates, save contact)
  - Sync when network restored

### Alternatives Considered
- **Redux + Redux Persist**: Rejected - React Query simpler for server state, no need for global client state
- **SWR**: Rejected - React Query has better offline support and DevTools
- **No caching**: Rejected - poor offline experience, slower app (violates SC-023, SC-026)

### Implementation Notes
- Install `@tanstack/react-query` and `@tanstack/react-query-persist-client`
- Wrap app in `<QueryClientProvider>` in `app/_layout.tsx`
- Custom hooks: `useProfile()`, `useContacts()`, `useNotifications()`
- Cache invalidation on profile update, contact save
- Offline detection with `expo-network` (Principle VI requirement)
- UI offline indicator (banner or toast)

---

## 11. Form Validation: Zod + React Hook Form

### Decision
Use **Zod** for schema validation and **React Hook Form** for form state management.

### Rationale
- **Zod**:
  - TypeScript-first schema validation (Principle I: type safety)
  - Reuse validation schemas on frontend and backend (Supabase Edge Functions)
  - Clear error messages for users (Principle III: form validation requirements)
  - Validates email, phone, URL formats (FR-021, FR-022, FR-024)
- **React Hook Form**:
  - Minimal re-renders, better performance than controlled inputs
  - Native integration with Zod via `@hookform/resolvers`
  - Handles form state, errors, submission
  - Accessibility: automatic ARIA attributes

### Alternatives Considered
- **Formik**: Rejected - React Hook Form has better performance and TypeScript support
- **Yup**: Rejected - Zod is TypeScript-native, better inference
- **Manual validation**: Rejected - error-prone, Zod provides consistent validation

### Implementation Notes
- Define Zod schemas in `lib/validation/schemas.ts`
- Schemas: `profileSchema`, `socialLinkSchema`, `contactSchema`
- Email validation: `z.string().email()`
- Phone validation: `z.string().regex()` with international format
- URL validation: `z.string().url()`
- Disable submit button during processing (Principle III requirement)
- Show inline errors below fields

---

## 12. Testing Strategy

### Decision
- **Unit/Component tests**: Jest + React Native Testing Library
- **Integration tests**: Jest + React Native Testing Library + Mock Supabase
- **E2E tests**: Detox for critical user journeys

### Rationale
- **Jest**: Standard for React Native, fast, excellent TypeScript support
- **React Native Testing Library**: User-centric testing (test behavior, not implementation)
- **Detox**: Industry standard for React Native E2E, supports iOS and Android simulators
- **Constitution Principle II**: Mandates test-driven development, 80% coverage for new code, 100% for critical paths
- **Mock Supabase**: Use MSW (Mock Service Worker) or custom mocks to avoid hitting real API in tests

### Test Coverage Targets
- Profile creation: 100% (critical path)
- Authentication flows: 100% (critical path)
- Share functionality: 100% (critical path)
- Network tab: 80%
- UI components: 80%
- Utilities: 90%

### Alternatives Considered
- **Appium**: Rejected - Detox is faster, better React Native integration
- **Manual testing only**: Rejected - violates Constitution Principle II
- **Enzyme**: Rejected - deprecated, React Native Testing Library is modern standard

### Implementation Notes
- Test files colocated with source (`__tests__/` directories)
- Given-When-Then structure (Principle II requirement)
- Mock Supabase client for integration tests
- E2E tests run on CI for iOS and Android builds
- Jest coverage reports in CI, fail if below thresholds

### Example Test Structure
```typescript
// Given-When-Then example
describe('ProfileForm', () => {
  it('should show validation error when email is invalid', () => {
    // Given: User is on profile form
    render(<ProfileForm />);
    
    // When: User enters invalid email
    fireEvent.changeText(screen.getByLabelText('Email'), 'invalid-email');
    fireEvent.press(screen.getByText('Save'));
    
    // Then: Validation error is shown
    expect(screen.getByText('Please enter a valid email')).toBeOnScreen();
  });
});
```

---

## 13. Performance Optimization Strategies

### Decision
Implement performance optimizations to meet Success Criteria (SC-022 to SC-029).

### Key Strategies

1. **Image Optimization**:
   - Compress profile pictures server-side (Supabase Storage with transformation API)
   - Use WebP format for 30% smaller file sizes (Principle V requirement)
   - Lazy load images with placeholder (React Native Fast Image or Expo Image)
   - Cache images in CDN (Supabase provides global CDN)

2. **List Performance**:
   - Use `FlashList` instead of `FlatList` for Network tab (10x faster rendering)
   - Virtualization for lists >20 items (Principle V requirement)
   - Memoize list item components with `React.memo()`
   - Pagination or infinite scroll for 500+ contacts (SC-015)

3. **Bundle Size**:
   - Selective imports from icon libraries (e.g., import individual icons, not entire Lucide)
   - Dynamic imports for rarely-used features (onboarding, resume upload)
   - Tree shaking via Metro bundler
   - Target <50MB (SC-034)

4. **Navigation Performance**:
   - Lazy load screens with `React.lazy()` + `Suspense`
   - Optimize animations (use `react-native-reanimated` for 60fps)
   - Reduce screen transition work (move heavy computations to background)

5. **API Performance**:
   - React Query caching (stale-while-revalidate)
   - Debounce search queries (Network tab search)
   - Optimistic updates for better perceived performance
   - Batch API calls where possible

### Alternatives Considered
- **react-native-fast-image**: Rejected - Expo Image provides similar caching with less configuration
- **Redux for caching**: Rejected - React Query better suited for server state

### Implementation Notes
- Profile memory usage with React DevTools Profiler
- Monitor bundle size in CI (warn if >10% increase)
- Lighthouse audit for web card view
- Test on mid-range devices (3-year-old iPhone/Android)

---

## 14. Development Workflow & Tooling

### Decision
- **Package manager**: Yarn (existing setup)
- **Version control**: Git with feature branch workflow (Constitution: Development Workflow)
- **CI/CD**: GitHub Actions for tests, linting, builds
- **Builds**: EAS Build (Expo Application Services)
- **OTA Updates**: EAS Update
- **Error tracking**: Sentry (Principle VI: production error tracking)
- **Code quality**: ESLint, Prettier, TypeScript strict mode (Principle I)

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
on: [push, pull_request]

jobs:
  test:
    - Run TypeScript compiler
    - Run ESLint
    - Run Prettier check
    - Run Jest (unit + integration tests)
    - Upload coverage to Codecov
  
  build:
    - EAS Build (iOS + Android) on main branch
    - Upload build artifacts
  
  e2e:
    - Run Detox E2E tests on iOS simulator
    - Run Detox E2E tests on Android emulator
```

### Alternatives Considered
- **Local builds**: Rejected - EAS Build is faster, handles certificates, recommended by Expo
- **No CI**: Rejected - violates Constitution Pre-Merge Gates

### Implementation Notes
- Feature branches: `001-digital-business-card/*`
- Commit message convention: Conventional Commits
- Pre-commit hooks: Husky + lint-staged (run Prettier, ESLint)
- Branch protection: require tests to pass before merge

---

## 15. Environment Configuration

### Decision
Use **Expo environment variables** with `.env` files for configuration.

### Rationale
- **Principle VI**: Mandates Expo environment configuration (no react-native-config)
- **Security**: Never commit secrets to repo (Principle IV)
- **Flexibility**: Different configs for dev/staging/prod
- **EAS integration**: eas.json supports environment-specific builds

### Configuration Variables
```bash
# .env.example
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_WEB_CARD_BASE_URL=https://bizzycard.app
SENTRY_DSN=https://...
```

### Alternatives Considered
- **Hardcoded values**: Rejected - violates Principle IV (no secrets in code)
- **react-native-config**: Rejected - violates Principle VI (must use Expo config)

### Implementation Notes
- Use `EXPO_PUBLIC_*` prefix for client-side variables
- Store sensitive keys (API secrets) in EAS Secrets for builds
- Gitignore `.env` files, provide `.env.example`
- Document required variables in README.md (Constitution: Documentation Requirements)

---

## Summary of Technology Stack

| Category | Technology | Rationale |
|----------|-----------|-----------|
| **Mobile Framework** | React Native + Expo SDK 52+ | Cross-platform, managed workflow, OTA updates |
| **Navigation** | Expo Router | File-based routing, Principle VI compliance |
| **UI Components** | React Native Reusables | User requirement, accessible, customizable |
| **Styling** | NativeWind (Tailwind) | User requirement, utility-first, Principle VI |
| **Authentication** | Clerk | User requirement, secure, great DX |
| **Backend** | Supabase (PostgreSQL + Storage) | User requirement, all-in-one, RLS, real-time |
| **State Management** | React Query + Context | Server state caching, minimal client state |
| **Forms** | React Hook Form + Zod | Performance, type-safe validation |
| **Testing** | Jest + RTL + Detox | Unit, integration, E2E coverage |
| **QR Code** | react-native-qrcode-svg + expo-camera | Generate and scan QR codes |
| **Notifications** | Expo Notifications | Push + in-app notifications |
| **File Sharing** | Expo Sharing + FileSystem | Native share dialogs, .vcf export |
| **Offline** | React Query + AsyncStorage | Caching, offline access |
| **Web Card** | Vite + React + NativeWind | Static site, shared styling |
| **Error Tracking** | Sentry | Production error monitoring |
| **CI/CD** | GitHub Actions + EAS | Automated testing and builds |

---

## Open Questions & Future Considerations

### Open Questions
*None remaining - all NEEDS CLARIFICATION items resolved.*

### Future Enhancements (Out of Scope for MVP)
1. **Social login**: Add "Sign in with Google/Apple" via Clerk
2. **Multi-card support**: Users can create multiple cards (personal, professional, side projects)
3. **Card analytics**: Track QR scans, link clicks (privacy-respecting)
4. **Card templates**: Pre-designed card layouts for different professions
5. **Contact CRM features**: Reminders to follow up, notes, tagging relationships
6. **Export contacts**: Bulk export saved contacts as CSV
7. **Team cards**: Company admins can create cards for employees
8. **NFC support**: Tap phones to exchange cards (Android, iPhone 14+)
9. **Internationalization**: Multi-language support
10. **Dark mode**: User preference for light/dark theme (foundation already in NativeWind)

---

## Next Steps

✅ **Phase 0 Complete**: All technology decisions documented with rationale.

**Ready for Phase 1**:
1. Generate `data-model.md` (database schema, entity relationships)
2. Generate API contracts in `contracts/` (Supabase REST API endpoints, TypeScript types)
3. Generate `quickstart.md` (developer setup guide)
4. Update agent context with new technologies

**Phase 2** (separate command):
- Break down into implementation tasks (`/speckit.tasks`)
- Task prioritization based on user stories (P1 → P7)

