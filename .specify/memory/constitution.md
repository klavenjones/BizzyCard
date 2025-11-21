<!--
Sync Impact Report
===================
Version: INITIAL → 1.0.0
Change Type: Initial Ratification
Date: 2025-11-21

Principles Created:
  1. Code Quality & Type Safety
  2. Testing Standards
  3. User Experience Consistency
  4. Security Requirements
  5. Performance Requirements

Additional Sections:
  - Development Workflow
  - Quality Gates
  - Governance

Templates Status:
  ✅ plan-template.md - Reviewed, Constitution Check section aligns with new principles
  ✅ spec-template.md - Reviewed, User Scenarios and Requirements sections support principles
  ✅ tasks-template.md - Reviewed, Test-first approach and phased structure align with principles

Follow-up Actions:
  - Constitution is now active and enforceable
  - All new features must pass Constitution Check in plan.md
  - Code reviews must verify compliance with these principles
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

## Development Workflow

### Code Review Requirements

- ALL code changes MUST be reviewed by at least one other developer
- Reviews MUST verify:
  - Constitution compliance (all MUST requirements met)
  - Test coverage meets standards
  - No security vulnerabilities introduced
  - Performance implications considered
  - Accessibility requirements met
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

## Quality Gates

### Pre-Commit Gates

- TypeScript compilation succeeds (no errors)
- Prettier formatting applied
- ESLint passes with no errors (warnings are acceptable if justified)

### Pre-Merge Gates (CI/CD)

- ALL tests pass
- Code coverage meets thresholds
- No critical or high severity security vulnerabilities
- Bundle size has not increased unexpectedly (>10% without justification)
- iOS and Android builds succeed

### Pre-Release Gates

- ALL acceptance criteria from spec.md met
- Critical user journeys tested on physical devices (iOS and Android)
- Performance profiling completed (no significant regressions)
- Security review completed for features touching sensitive data
- Accessibility audit completed for new UI

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

**Version**: 1.0.0 | **Ratified**: 2025-11-21 | **Last Amended**: 2025-11-21
