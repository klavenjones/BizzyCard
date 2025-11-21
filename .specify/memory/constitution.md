<!--
Sync Impact Report
===================
Version: 1.0.0 → 1.1.0
Change Type: Minor Amendment (New Principle Added)
Date: 2025-11-21

Principles Modified:
  - Added Principle VI: Expo & React Native Best Practices

Rationale:
  This amendment adds comprehensive Expo and React Native best practices to guide
  mobile development patterns. This expands the constitution's guidance without
  weakening or removing existing requirements, qualifying as a MINOR version bump.

Key Additions:
  - Expo Router file-based routing conventions
  - React Navigation best practices
  - Expo-specific APIs and tooling guidance
  - React Native hooks and lifecycle patterns
  - Platform-specific code handling
  - Asset and resource management
  - Development workflow with Expo CLI and EAS

Templates Status:
  ✅ plan-template.md - No changes required, Constitution Check section remains valid
  ✅ spec-template.md - No changes required, supports new principle requirements
  ✅ tasks-template.md - No changes required, test-first approach compatible

Impact on Existing Code:
  - Existing code should be reviewed for compliance with new Expo/RN best practices
  - Non-compliant patterns should be flagged as technical debt and tracked
  - New features MUST comply with all principles including new Principle VI

Follow-up Actions:
  - Review existing codebase for Expo/RN best practices compliance
  - Update code review checklist to include Principle VI items
  - Schedule team discussion on principle implementation and clarifications needed
-->

# BizzyCard Constitution

## Core Principles

### I. Code Quality & Type Safety

**MUST Requirements:**
- ALL code MUST be written in TypeScript with strict mode enabled (`strict: true`)
- NO usage of `any` type except when interfacing with untyped third-party libraries; document
  such cases with inline comments explaining the necessity
- ALL functions MUST have explicit return types declared
- ALL React components MUST use TypeScript interfaces/types for props
- Code MUST follow consistent naming conventions:
  - PascalCase for components, types, and interfaces
  - camelCase for functions, variables, and hooks
  - UPPER_SNAKE_CASE for constants
- ALL files MUST pass Prettier formatting and ESLint checks before commit
- Component files MUST be organized with clear separation: types, helpers, component
- NO prop drilling beyond 2 levels; use context or state management for deeper state

**Rationale:** TypeScript strict mode catches errors at compile time, reducing runtime bugs and
improving code maintainability. Consistent code quality ensures the codebase remains accessible
to all team members and future contributors.

### II. Testing Standards

**MUST Requirements:**
- ALL new features MUST include tests BEFORE implementation (Test-Driven Development)
- Test categories (include where applicable):
  - **Component Tests**: UI components with multiple states, user interactions, or conditional
    rendering
  - **Integration Tests**: Navigation flows, API interactions, state management integration
  - **E2E Tests** (for critical user journeys): Login, primary user workflows, payment flows
- Tests MUST follow Given-When-Then structure for clarity
- Tests MUST be isolated (no dependencies between test cases)
- Test files MUST be colocated with source files or in parallel `__tests__` directories
- ALL tests MUST pass before merging to main branch
- Code coverage targets:
  - NEW code: minimum 80% coverage
  - Critical paths (auth, payments, data persistence): 100% coverage

**Rationale:** Test-first development ensures features meet requirements before implementation,
reduces regression bugs, and provides living documentation. High test coverage for critical paths
protects user data and business-critical functionality.

### III. User Experience Consistency

**MUST Requirements:**
- ALL UI components MUST use the established design system (React Native Reusables)
- NO custom UI components unless design system component is insufficient; document justification
- ALL interactive elements MUST have appropriate feedback (loading states, disabled states, error
  states)
- ALL screens MUST handle loading, error, and empty states explicitly
- ALL user-facing text MUST be stored in centralized constants (no hardcoded strings)
- Platform-specific behavior MUST be handled via Platform API or platform-specific extensions
- ALL forms MUST include:
  - Input validation with clear error messages
  - Disabled submit buttons during processing
  - Success/error feedback after submission
- Accessibility requirements:
  - Semantic labels on all interactive elements
  - Sufficient color contrast (WCAG AA minimum)
  - Touch targets minimum 44x44 points (iOS) / 48x48 dp (Android)
  - Screen reader support for critical flows

**Rationale:** Consistent UX patterns reduce cognitive load, improve learnability, and create a
professional user experience. Accessibility ensures the app is usable by all users and meets
modern platform expectations.

### IV. Security Requirements

**MUST Requirements:**
- ALL sensitive data (tokens, passwords, API keys) MUST be stored in secure storage (Expo
  SecureStore)
- NO sensitive data in AsyncStorage, Redux persisted state, or logs
- ALL API calls MUST use HTTPS (no HTTP in production)
- ALL user inputs MUST be validated and sanitized before processing
- Authentication tokens MUST:
  - Be stored securely (SecureStore)
  - Include expiration handling
  - Be refreshed automatically where possible
  - Be cleared on logout
- ALL third-party dependencies MUST be:
  - Reviewed for security advisories before adding
  - Kept up to date with security patches
  - Audited regularly via `npm audit` or `yarn audit`
- Environment-specific configuration MUST use environment variables (never commit secrets)
- ALL WebViews MUST have JavaScript injection disabled unless explicitly required and sanitized

**Rationale:** Mobile apps handle sensitive user data and must meet high security standards.
Proactive security practices prevent data breaches, protect user privacy, and maintain trust.

### V. Performance Requirements

**MUST Requirements:**
- ALL screens MUST render initial content within 1 second on mid-range devices
- Lists with >20 items MUST use `FlatList` or `FlashList` with proper virtualization
- Images MUST:
  - Use appropriate compression and formats (WebP preferred)
  - Implement lazy loading for off-screen images
  - Include loading placeholders
  - Specify explicit width/height to prevent layout shift
- Navigation transitions MUST maintain 60fps (use React Navigation performance best practices)
- ALL network requests MUST include:
  - Timeout handling (max 30 seconds)
  - Retry logic for transient failures
  - Loading states for user feedback
  - Caching where appropriate
- Bundle size considerations:
  - Monitor and limit app bundle size (target <50MB total)
  - Use dynamic imports for large, rarely-used features
  - Avoid importing entire icon libraries (use selective imports)
- Memory management:
  - Clean up subscriptions, timers, and listeners in useEffect cleanup
  - Avoid memory leaks from uncanceled promises
  - Profile memory usage for screens with complex state

**Performance Targets:**
- App launch time: <3 seconds (cold start)
- Screen transition time: <300ms
- API response handling: <200ms to show loading state
- 60fps maintained during scrolling and animations

**Rationale:** Mobile users expect responsive, fast applications. Performance directly impacts
user satisfaction, retention, and app store ratings. Setting explicit targets ensures
performance is prioritized throughout development.

### VI. Expo & React Native Best Practices

**MUST Requirements:**

**Navigation & Routing:**
- ALL navigation MUST use Expo Router with file-based routing (no manual route configuration)
- Route files MUST follow Expo Router naming conventions:
  - `_layout.tsx` for layout wrappers and navigation structure
  - `[param].tsx` for dynamic routes
  - `(group)` folders for route groups without affecting URL structure
  - `+html.tsx` for root HTML structure (web support)
- Navigation actions MUST use `router.push()`, `router.replace()`, or `router.back()` from
  `expo-router`
- Deep linking MUST be configured in `app.json` with appropriate URL schemes
- NO direct usage of React Navigation APIs; use Expo Router abstractions

**React Hooks & Component Patterns:**
- Components MUST use functional components with hooks (NO class components)
- State management MUST use appropriate hooks:
  - `useState` for local component state
  - `useReducer` for complex state logic
  - `useContext` for shared state across component trees
  - `useMemo` and `useCallback` to prevent unnecessary re-renders (profile first)
- Side effects MUST use `useEffect` with proper dependency arrays and cleanup functions
- Custom hooks MUST:
  - Start with `use` prefix
  - Be pure functions that can be composed
  - Document their dependencies and side effects
- NO hooks inside conditionals, loops, or nested functions

**Expo-Specific APIs:**
- File system operations MUST use `expo-file-system` (not Node.js `fs`)
- Secure data storage MUST use `expo-secure-store` (see Security Requirements)
- Camera and media MUST use `expo-camera` and `expo-image-picker`
- Location services MUST use `expo-location` with proper permission handling
- Sensors MUST use respective Expo modules (`expo-accelerometer`, `expo-gyroscope`, etc.)
- Push notifications MUST use `expo-notifications`
- App metadata (name, version, icons) MUST be configured in `app.json`
- Environment variables MUST use Expo's environment configuration (no `react-native-config`)

**Platform-Specific Code:**
- Platform detection MUST use `Platform.OS` or `Platform.select()`
- Platform-specific files MUST use extensions: `.ios.tsx`, `.android.tsx`, `.web.tsx`
- Platform-specific code MUST be minimized; prefer cross-platform solutions
- Native modules (if required) MUST:
  - Be justified in Complexity Tracking section
  - Include fallbacks for unsupported platforms
  - Be documented with usage examples

**Styling & Theming:**
- Styles MUST use NativeWind (Tailwind CSS for React Native) as configured
- NO inline StyleSheet.create() except for dynamic styles that cannot be expressed in Tailwind
- Theme values (colors, spacing, typography) MUST be defined in `tailwind.config.js`
- Responsive styles MUST use Tailwind breakpoints (`sm:`, `md:`, `lg:`)
- Dark mode MUST be handled via NativeWind's `dark:` variant
- Avoid `Dimensions.get()` for responsive layouts; prefer Tailwind utilities

**Assets & Resources:**
- Images MUST be optimized before committing (use `expo-optimize` or manual compression)
- App icons MUST be configured in `app.json` with adaptive icons for Android
- Splash screen MUST be configured in `app.json` (use `expo-splash-screen` for programmatic
  control)
- Fonts MUST be loaded using `expo-font` with proper loading states
- Static assets MUST be placed in `assets/` directory
- Large assets (>1MB) MUST be loaded asynchronously with loading indicators

**Development Workflow:**
- Development MUST use Expo CLI (`expo start`) for dev server
- Hot reload MUST be leveraged (avoid full app restarts)
- Testing on physical devices MUST use Expo Go or development builds
- Production builds MUST use EAS Build (no local builds for App Store/Play Store)
- Over-the-air updates MUST use EAS Update for non-native changes
- Environment-specific builds MUST be configured in `eas.json`
- NO `expo eject` unless absolutely necessary and approved; use config plugins instead

**Permissions & Privacy:**
- Permissions MUST be requested only when needed (not at app launch)
- Permission requests MUST include clear explanation of why permission is needed
- ALL required permissions MUST be declared in `app.json` (`ios.infoPlist`, `android.permissions`)
- Apps MUST handle permission denial gracefully
- Location permissions MUST request least privilege (foreground only unless background required)

**Error Handling:**
- Errors MUST be caught and displayed with user-friendly messages
- Network errors MUST be handled with retry mechanisms and offline states
- Unhandled errors MUST be caught with error boundaries
- Development errors MUST use `__DEV__` flag for additional logging
- Production error tracking MUST use a service (e.g., Sentry) via Expo config plugins

**Offline Support:**
- Apps MUST detect network connectivity using `expo-network` or `@react-native-community/netinfo`
- Critical data MUST be cached locally for offline access
- Offline actions MUST be queued and synced when connection restored
- UI MUST clearly indicate offline state

**Rationale:** Expo and React Native have evolved best practices that prevent common pitfalls,
improve performance, and ensure cross-platform compatibility. Following these patterns ensures
the app leverages Expo's strengths, maintains upgrade compatibility, and provides a consistent
development experience. Expo Router file-based routing reduces boilerplate and keeps navigation
logic colocated with screens. Using Expo's managed workflow maximizes over-the-air update
capabilities and simplifies build processes.

## Development Workflow

### Code Review Requirements

- ALL code changes MUST be reviewed by at least one other developer
- Reviews MUST verify:
  - Constitution compliance (all MUST requirements met)
  - Test coverage meets standards
  - No security vulnerabilities introduced
  - Performance implications considered
  - Accessibility requirements met
  - Expo/React Native best practices followed (Principle VI)
- Breaking changes MUST be documented and communicated to the team
- Technical debt MUST be justified and tracked (create follow-up issues)

### Branch Strategy

- `main` branch is protected (production-ready code only)
- Feature branches follow naming: `feature/###-descriptive-name`
- Bug fix branches: `fix/###-descriptive-name`
- Hotfix branches: `hotfix/###-descriptive-name`
- ALL branches must be up to date with main before merging

### Documentation Requirements

- Complex features MUST include inline code documentation (TSDoc comments)
- Architecture decisions MUST be documented in `/specs/` directory
- API integrations MUST document endpoints, authentication, and error handling
- Environment setup MUST be documented in README.md
- Expo configuration changes MUST be documented with rationale

## Quality Gates

### Pre-Commit Gates

- TypeScript compilation succeeds (no errors)
- Prettier formatting applied
- ESLint passes with no errors (warnings are acceptable if justified)
- Expo CLI validates `app.json` configuration (run `expo doctor` if available)

### Pre-Merge Gates (CI/CD)

- ALL tests pass
- Code coverage meets thresholds
- No critical or high severity security vulnerabilities
- Bundle size has not increased unexpectedly (>10% without justification)
- iOS and Android builds succeed (via EAS Build or local builds)
- Expo SDK version compatibility verified

### Pre-Release Gates

- ALL acceptance criteria from spec.md met
- Critical user journeys tested on physical devices (iOS and Android)
- Performance profiling completed (no significant regressions)
- Security review completed for features touching sensitive data
- Accessibility audit completed for new UI
- App Store and Play Store metadata updated
- EAS Update configured for production channel

## Governance

### Amendment Process

- Constitution amendments MUST be proposed via written proposal in team discussions
- Amendments require approval from project lead and majority of active contributors
- Breaking amendments (removing or weakening existing requirements) require unanimous approval
- All amendments MUST include:
  - Rationale for change
  - Impact assessment on existing code
  - Migration plan if existing code needs updates
- Version incremented per semantic versioning:
  - MAJOR: Breaking governance changes (principle removal/weakening)
  - MINOR: New principles or expanded requirements
  - PATCH: Clarifications, wording improvements, non-semantic changes

### Compliance Review

- Constitution compliance MUST be checked during code review
- Violations MUST be justified and approved, or code must be revised
- Repeated violations indicate need for principle clarification or tooling improvements
- Constitution MUST be reviewed quarterly for relevance and effectiveness

### Complexity Justification

- Any violation of MUST requirements requires explicit justification
- Justifications MUST be documented in:
  - Implementation plan (plan.md) Complexity Tracking section
  - Pull request description
  - Code comments at point of violation
- Alternative approaches MUST be documented ("we rejected simpler approach X because...")
- Technical debt from justified violations MUST be tracked and have remediation timeline

### Living Document

- This constitution is a living document, evolving with project needs
- Feedback on principles is encouraged and should be raised in team discussions
- Constitution should enable development velocity, not hinder it
- When principles conflict with pragmatism, document the tradeoff and decide explicitly

**Version**: 1.1.0 | **Ratified**: 2025-11-21 | **Last Amended**: 2025-11-21
