<!--
  Sync Impact Report:
  Version change: N/A → 1.0.0 (initial constitution)
  Modified principles: N/A (new constitution)
  Added sections: Core Principles (5), Technology Stack Requirements, Development Workflow
  Removed sections: N/A
  Templates requiring updates:
    ✅ plan-template.md - Constitution Check section aligns with new principles
    ✅ spec-template.md - Requirements section aligns with testing and component standards
    ✅ tasks-template.md - Updated to reflect unit tests only (removed contract/integration test examples), updated paths for React Native/Expo structure, updated file extensions to .ts/.tsx
    ✅ checklist-template.md - No changes needed (generic template)
    ✅ agent-file-template.md - No changes needed (generic template)
  Follow-up TODOs: None
-->

# BizzyCard Constitution

## Core Principles

### I. Code Quality (NON-NEGOTIABLE)

All code MUST be clean, maintainable, and modular. Code must follow single responsibility principle, be self-documenting through clear naming, and organized into logical modules with minimal coupling. Refactoring is mandatory when code complexity exceeds maintainability thresholds. Code reviews MUST verify adherence to these standards before merge.

**Rationale**: Clean, maintainable code reduces technical debt, accelerates feature development, and enables long-term project sustainability. Modular architecture ensures components can be tested, updated, and replaced independently.

### II. Security (NON-NEGOTIABLE)

Security considerations MUST be integrated into all development decisions. Sensitive data handling, authentication flows, and API interactions MUST follow security best practices. Dependencies MUST be regularly audited for vulnerabilities. Security reviews are required for features handling user data or authentication.

**Rationale**: Security vulnerabilities can compromise user trust and data integrity. Proactive security measures prevent costly breaches and maintain compliance with data protection standards.

### III. React, React Native, and Expo Best Practices (NON-NEGOTIABLE)

All code MUST follow official React, React Native, and Expo best practices and conventions. This includes proper use of hooks, component lifecycle management, state management patterns, navigation patterns (Expo Router), and platform-specific optimizations. Code MUST leverage Expo SDK capabilities where applicable and follow React Native performance optimization guidelines.

**Rationale**: Adherence to framework best practices ensures compatibility, performance, and maintainability. It reduces bugs, improves developer experience, and ensures the codebase remains aligned with framework evolution.

### IV. UI Component Standards (NON-NEGOTIABLE)

All UI components MUST be sourced from React Native Reusables (https://reactnativereusables.com/) when available. Custom components may only be created when React Native Reusables does not provide equivalent functionality. Custom components MUST follow React Native Reusables patterns and styling conventions for consistency.

**Rationale**: Using a standardized UI component library ensures design consistency, reduces development time, and maintains accessibility standards. It prevents UI fragmentation and simplifies maintenance.

### V. Testing Standards (NON-NEGOTIABLE)

All features MUST include comprehensive unit tests. Tests MUST be written using clean, maintainable patterns and MUST cover core functionality, edge cases, and error handling. E2E (End-to-End) tests are explicitly prohibited—only unit tests are permitted. Test coverage MUST be maintained for all critical paths.

**Rationale**: Unit tests provide fast feedback, enable confident refactoring, and document expected behavior. Focusing exclusively on unit tests ensures test suite maintainability and execution speed while providing sufficient coverage for feature validation.

## Technology Stack Requirements

**Primary Framework**: React Native with Expo  
**UI Component Library**: React Native Reusables (https://reactnativereusables.com/)  
**Language**: TypeScript  
**Styling**: NativeWind (Tailwind CSS for React Native)  
**Navigation**: Expo Router  
**Authentication**: Clerk (via @clerk/clerk-expo)  
**Testing**: Unit testing framework (Jest recommended for React Native/Expo projects)

All technology choices MUST align with Expo compatibility and React Native best practices. New dependencies MUST be evaluated for security, maintenance status, and alignment with project principles before integration.

## Development Workflow

**Code Review Requirements**: All code changes MUST be reviewed for compliance with constitution principles before merge. Reviews MUST verify: code quality standards, security considerations, framework best practices adherence, UI component source compliance, and unit test coverage.

**Testing Workflow**: Unit tests MUST be written alongside feature implementation. Tests MUST pass before code review submission. Test failures block merge until resolved.

**Refactoring Policy**: Code that violates constitution principles MUST be refactored. Technical debt tracking is required, and refactoring tasks MUST be prioritized alongside feature work.

**Documentation**: Code MUST be self-documenting through clear naming and structure. Complex logic MUST include inline comments explaining rationale. API boundaries and component interfaces MUST be documented.

## Governance

This constitution supersedes all other development practices and guidelines. All team members and contributors MUST comply with these principles.

**Amendment Procedure**: Constitution amendments require documentation of rationale, impact assessment on existing codebase, and approval process. Version increments follow semantic versioning (MAJOR.MINOR.PATCH).

**Compliance Review**: Regular compliance reviews MUST be conducted during code reviews and sprint retrospectives. Violations MUST be addressed through refactoring or documented justification in complexity tracking.

**Version Control**: Constitution changes MUST be committed with clear version bump rationale. All dependent templates and documentation MUST be updated to reflect constitution changes.

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27
