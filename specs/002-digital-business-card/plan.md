# Implementation Plan: Digital Business Card Application

**Branch**: `002-digital-business-card` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-digital-business-card/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a mobile application for tech professionals that functions as a digital business card. The app enables users to create, share, and manage networking information through four core features: (1) creating and editing digital cards with profile fields, social links, and resume uploads, (2) sharing cards via QR codes, AirDrop, email, SMS, share links, and .vcf exports, (3) public web views for non-app recipients, and (4) in-app network/contacts management. The implementation uses Expo with React Native Reusables + NativeWind for UI, Convex for backend/data persistence/file storage, and Clerk + Convex for authentication and user management.

## Technical Context

**Language/Version**: TypeScript 5.9.2  
**Primary Dependencies**:

- Expo SDK 54.0.0
- React 19.1.0, React Native 0.81.5
- React Native Reusables (@rn-primitives/\*)
- NativeWind 4.2.1 with TailwindCSS 3.4.14
- Expo Router 6.0.10
- Clerk (@clerk/clerk-expo 2.16.1)
- Convex (to be installed)

**Storage**: Convex (database + file storage for resumes and profile photos)  
**Testing**: Jest (recommended for React Native/Expo, to be configured)  
**Target Platform**: iOS and Android mobile devices (Expo managed workflow)  
**Project Type**: Mobile application (Expo/React Native)  
**Performance Goals**:

- Onboarding completion in under 5 minutes (SC-001)
- Card view/edit in under 30 seconds (SC-002)
- Share options accessible in under 10 seconds (SC-003)
- Web view loads in under 3 seconds (SC-004)
- In-app sharing completes in under 15 seconds (SC-008)

**Constraints**:

- Resume file size limit: 10MB (assumption)
- Network connectivity required for all operations (offline functionality is out of scope per spec)
- Must support modern iOS and Android devices

**Scale/Scope**:

- Target: Tech professionals (initial user base)
- Network/Contacts: Up to 1000 contacts per user (SC-009)
- Public web views: Accessible to unlimited non-app users
- File storage: Resume files and profile photos per user

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Code Quality (NON-NEGOTIABLE)

✅ **PASS**: Plan will follow single responsibility principle, modular architecture with clear separation of concerns (components, services, data models). Code will be self-documenting with clear naming conventions.

### II. Security (NON-NEGOTIABLE)

✅ **PASS**:

- Clerk handles authentication securely
- Convex provides secure backend with built-in auth integration
- File uploads (resumes, photos) will be validated and stored securely
- Share links will use secure, unique identifiers
- Public web views will have appropriate access controls

### III. React, React Native, and Expo Best Practices (NON-NEGOTIABLE)

✅ **PASS**:

- Using Expo managed workflow
- Expo Router for navigation (already configured)
- React hooks for state management
- Expo SDK capabilities for file handling, sharing, QR codes
- Platform-specific optimizations where needed

### IV. UI Component Standards (NON-NEGOTIABLE)

✅ **PASS**:

- React Native Reusables components already installed (@rn-primitives/\*)
- Will use React Native Reusables components for all UI elements
- Custom components only when React Native Reusables doesn't provide equivalent
- NativeWind for styling consistency

### V. Testing Standards (NON-NEGOTIABLE)

✅ **PASS**:

- Jest testing framework configuration documented in research.md
- Unit test structure and examples provided in quickstart.md
- E2E tests explicitly prohibited per constitution (not included)
- Test coverage requirements documented
- Testing setup included in quickstart guide

## Project Structure

### Documentation (this feature)

```text
specs/002-digital-business-card/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/                          # Expo Router app directory
├── (auth)/                   # Auth routes (already exists)
│   ├── sign-in.tsx
│   ├── sign-up/
│   └── ...
├── (tabs)/                   # Main app tabs (to be created)
│   ├── _layout.tsx          # Tab navigation layout
│   ├── my-card.tsx          # "My Card" screen
│   ├── share.tsx            # Share screen with QR code
│   └── network.tsx          # Network/Contacts tab
├── onboarding/              # Onboarding flow (to be created)
│   ├── _layout.tsx
│   ├── index.tsx            # Start of onboarding
│   ├── profile.tsx          # Profile fields
│   ├── social-links.tsx     # Social links setup
│   └── resume.tsx           # Resume upload (optional)
├── card/                    # Card viewing/editing (to be created)
│   ├── [id].tsx            # View specific card (for network contacts)
│   └── edit.tsx             # Edit own card
├── public/                  # Public web view routes (to be created)
│   └── [shareId].tsx        # Public card view via share link
└── _layout.tsx              # Root layout (exists)

components/                   # Reusable components
├── ui/                      # React Native Reusables components (exists)
│   ├── avatar.tsx
│   ├── button.tsx
│   └── ...
├── card/                     # Card-specific components (to be created)
│   ├── card-preview.tsx     # Card preview component
│   ├── profile-form.tsx     # Profile editing form
│   ├── social-links-form.tsx
│   └── qr-code-display.tsx
├── sharing/                 # Sharing components (to be created)
│   ├── share-actions.tsx    # Share buttons (AirDrop, email, SMS, etc.)
│   └── vcf-generator.tsx    # .vcf file generation
└── network/                 # Network/Contacts components (to be created)
    ├── contact-list.tsx      # List of saved contacts
    ├── contact-card.tsx     # Individual contact card view
    └── contact-search.tsx    # Search/filter component

convex/                       # Convex backend (to be created)
├── schema.ts                # Database schema
├── users.ts                 # User management functions
├── cards.ts                 # Digital card CRUD operations
├── contacts.ts              # Network/Contacts management
├── sharing.ts               # Share link generation and validation
├── files.ts                 # File upload/storage (resumes, photos)
└── http.ts                  # HTTP endpoints for public web views

lib/                          # Shared utilities (exists, to be extended)
├── theme.ts                 # Theme configuration (exists)
├── utils.ts                 # Utility functions (exists)
├── convex-client.ts         # Convex client setup (to be created)
├── validation.ts            # Form validation utilities (to be created)
└── vcf.ts                   # vCard generation utilities (to be created)

hooks/                        # Custom React hooks (to be created)
├── use-card.ts              # Card data fetching/updating
├── use-contacts.ts          # Contacts management
├── use-sharing.ts           # Sharing functionality
└── use-auth.ts              # Auth integration with Convex

services/                     # Business logic services (to be created)
├── qr-code.ts               # QR code generation
├── file-upload.ts           # File upload handling
└── notifications.ts          # Push notifications for card sharing

__tests__/                    # Unit tests (to be created)
├── components/
├── hooks/
├── services/
└── lib/
```

**Structure Decision**: Using Expo Router file-based routing with (tabs) for main navigation, (auth) for authentication flows, and feature-specific directories (onboarding/, card/, public/) for related screens. Convex backend functions organized by domain (users, cards, contacts, sharing, files). Components organized by feature area (card/, sharing/, network/) with shared UI components in ui/. Custom hooks and services separated for reusability.

## Phase Completion Status

### Phase 0: Research ✅ Complete

- **research.md**: Technology choices documented
- All NEEDS CLARIFICATION items resolved
- Integration patterns defined
- Best practices documented

### Phase 1: Design & Contracts ✅ Complete

- **data-model.md**: Complete database schema with entities, relationships, validation rules
- **contracts/convex-functions.md**: Full API contract with queries, mutations, and HTTP endpoints
- **quickstart.md**: Developer setup guide with step-by-step instructions
- **Agent Context**: Updated with TypeScript and Convex information

### Phase 2: Task Breakdown

- **Status**: Ready for `/speckit.tasks` command
- **Next Step**: Run `/speckit.tasks` to generate implementation tasks

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| N/A       | N/A        | N/A                                  |
