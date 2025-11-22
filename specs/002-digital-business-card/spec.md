# Feature Specification: Digital Business Card Application

**Feature Branch**: `002-digital-business-card`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "I want to build a mobile application for tech professionals that functions as a digital business card and makes it easy to create, share, and manage networking information. The app should let users create a personal profile with fields like name, title, email, phone number, company, role, short bio, and customizable tags, plus add social links (Bluesky, LinkedIn, X, Facebook, Instagram, GitHub, portfolio site, and other platforms) and optionally upload and attach a resume. The UI should include an onboarding flow to set up the first digital card, a main "My Card" screen showing a preview of the user's digital card with clear access to edit details, social links, and resume, a dedicated "Share" screen that prominently displays a QR code along with quick actions for AirDrop, email, SMS, copying a share link, and sending a .vcf file, and a "Network" or "Contacts" tab where users can view and organize digital cards they've received from other app users, add them as contacts/friends, and see basic metadata like tags or when/where they met. Recipients who do not have the app should still be able to receive and use the information via share flows that generate a .vcf file or a web view: the QR code and share links should open a hosted web page showing the digital card, with options to download contact info, view social links, and download the attached resume. For in-app users sharing with each other, the experience should feel seamless, with a simple, fast flow to send and accept cards, add to their in-app contact list, and quickly access previously saved cards. Please break this into clear, well-scoped features and detailed specs for: (1) creating and editing my digital card (profile fields, social links, resume upload); (2) sharing options (QR code, AirDrop, email, SMS, share link, .vcf export); (3) public web view for non-app recipients (view card, download contact, open social links, download resume); and (4) in-app contacts/network (adding contacts/friends, storing and browsing saved cards, and basic metadata for each connection)."

## Clarifications

### Session 2025-01-27

- Q: How should the system identify that two digital cards belong to the same person to prevent duplicates? → A: Match by email address first, fallback to phone number if email differs
- Q: How should users discover and identify other app users when sharing their card in-app? → A: QR code scan with optional phone number/email lookup (both methods available)
- Q: What should happen when a user tries to accept a card from someone already in their Network/Contacts? → A: Update existing contact with latest information and show a notification that contact was updated
- Q: Should users be able to upload a profile photo/avatar for their digital card? → A: Optional profile photo upload (users can add but not required)
- Q: What should happen when a user tries to share their card before completing onboarding? → A: Show message prompting user to complete onboarding, then allow sharing

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create and Edit Digital Card (Priority: P1)

A new user downloads the app and needs to create their first digital business card. They go through an onboarding flow that guides them to enter their profile information, add social links, and optionally upload a resume. After onboarding, they can view their card preview on the "My Card" screen and edit any details at any time.

**Why this priority**: This is the core functionality - without the ability to create and manage their own card, users cannot use the app. This must work before any sharing or networking features can be utilized.

**Independent Test**: Can be fully tested by having a new user complete onboarding, view their card preview, and edit their profile information. This delivers a complete digital business card that can be shared even if other features are not yet implemented.

**Acceptance Scenarios**:

1. **Given** a new user opens the app for the first time, **When** they complete the onboarding flow, **Then** they have created a digital card with at minimum their name and email, and can view it on the "My Card" screen
2. **Given** a user has completed onboarding, **When** they navigate to the "My Card" screen, **Then** they see a preview of their digital card showing all their profile information, social links, and resume (if uploaded)
3. **Given** a user is viewing their "My Card" screen, **When** they tap an edit button or field, **Then** they can modify any profile field, add/remove social links, or upload/replace/remove their resume
4. **Given** a user is editing their profile, **When** they save changes, **Then** the "My Card" preview updates immediately to reflect the changes
5. **Given** a user is adding social links, **When** they select a platform (Bluesky, LinkedIn, X, Facebook, Instagram, GitHub, portfolio, or other), **Then** they can enter the URL for that platform and it appears in their card preview
6. **Given** a user wants to add custom tags, **When** they enter tag text, **Then** they can add multiple tags that appear on their card and can be used for organization

---

### User Story 2 - Share Digital Card via Multiple Methods (Priority: P1)

A user wants to share their digital business card with others. They navigate to a dedicated "Share" screen that displays a QR code and provides multiple sharing options including AirDrop, email, SMS, copying a share link, and exporting as a .vcf file.

**Why this priority**: Sharing is essential for the app's value proposition. Users need multiple ways to share their card to accommodate different contexts and recipient preferences. This works independently of whether recipients have the app installed.

**Independent Test**: Can be fully tested by having a user with a completed card navigate to the Share screen, generate a QR code, and use each sharing method. This delivers the ability to share contact information regardless of recipient's app status.

**Acceptance Scenarios**:

1. **Given** a user has created their digital card, **When** they navigate to the "Share" screen, **Then** they see a prominently displayed QR code that encodes their card information
2. **Given** a user is on the Share screen, **When** they tap the QR code or a "Save QR Code" option, **Then** they can save the QR code image to their device
3. **Given** a user is on the Share screen, **When** they tap the AirDrop option, **Then** the system presents AirDrop interface to share their card with nearby devices
4. **Given** a user is on the Share screen, **When** they tap the email option, **Then** the system opens their email client with a pre-filled message containing their card information or a share link
5. **Given** a user is on the Share screen, **When** they tap the SMS option, **Then** the system opens their messaging app with a pre-filled message containing their card information or a share link
6. **Given** a user is on the Share screen, **When** they tap "Copy Share Link", **Then** a unique, shareable link to their card is copied to their clipboard
7. **Given** a user is on the Share screen, **When** they tap "Export .vcf", **Then** a .vcf (vCard) file is generated and they can share it via any method (save to files, share via other apps, etc.)
8. **Given** a user generates a share link, **When** someone opens that link, **Then** they see the public web view of the user's digital card

---

### User Story 3 - Public Web View for Non-App Recipients (Priority: P2)

A recipient who does not have the app installed receives a QR code scan, share link, or .vcf file. They can view the digital card in a web browser, download contact information, view social links, and download the attached resume.

**Why this priority**: This ensures the app works for recipients who don't have the app installed, expanding the user base and making sharing more valuable. However, it depends on sharing functionality (P1) being complete first.

**Independent Test**: Can be fully tested by opening a share link in a web browser and verifying all card information is displayed, contact info can be downloaded, social links are clickable, and resume can be downloaded. This delivers value to non-app users and increases sharing effectiveness.

**Acceptance Scenarios**:

1. **Given** a recipient scans a QR code or opens a share link without the app installed, **When** the web page loads, **Then** they see a complete view of the digital card with all profile information, social links, and resume availability
2. **Given** a recipient is viewing a card in the web view, **When** they tap a social link, **Then** it opens in a new tab/window to the appropriate social platform
3. **Given** a recipient is viewing a card in the web view, **When** they tap a "Download Contact" or "Add to Contacts" button, **Then** a .vcf file is downloaded that can be imported into their device's contact app
4. **Given** a recipient is viewing a card with an attached resume, **When** they tap a "Download Resume" button, **Then** the resume file is downloaded to their device
5. **Given** a recipient views a card in the web view, **When** they view it on mobile or desktop, **Then** the layout is responsive and all information is readable and accessible

---

### User Story 4 - In-App Network and Contacts Management (Priority: P2)

Two users who both have the app installed can share cards with each other through an in-app flow. The recipient can accept the card, which adds it to their "Network" or "Contacts" tab. Users can view, organize, and manage all saved cards with metadata like tags and meeting context.

**Why this priority**: This creates a network effect and makes the app more valuable for active users. However, it requires both users to have the app, so it's secondary to the core sharing functionality that works for everyone.

**Independent Test**: Can be fully tested by having two app users share cards with each other, accept cards, and view them in the Network tab. This delivers a contact management system within the app.

**Acceptance Scenarios**:

1. **Given** User A wants to share their card with User B (both have the app), **When** User A scans User B's QR code or looks up User B by phone number/email, **Then** User B receives a notification or card preview with an option to accept
2. **Given** User B receives a card from User A, **When** they accept the card, **Then** it is added to their Network/Contacts tab and User A is notified
3. **Given** a user navigates to the Network/Contacts tab, **When** they view the list, **Then** they see all cards they've received from other app users, displayed with profile photos, names, and key information
4. **Given** a user is viewing a saved card in their Network tab, **When** they tap on it, **Then** they see the full card details including all profile fields, social links, and resume
5. **Given** a user is viewing or accepting a card, **When** they add tags or meeting context (when/where they met), **Then** this metadata is saved with the card and can be used for filtering or organization
6. **Given** a user is in the Network tab, **When** they search or filter by tags, name, or company, **Then** the list updates to show matching contacts
7. **Given** a user has saved cards in their Network, **When** they want to share their own card with a saved contact, **Then** they can do so directly from the contact's card view

---

### Edge Cases

- What happens when a user tries to share their card before completing onboarding? (System shows message prompting user to complete onboarding, then allows sharing after minimum required fields are completed)
- How does the system handle invalid or malformed social media URLs?
- What happens when a user uploads a resume file that exceeds size limits?
- How does the system handle QR code generation if the user's card information is incomplete?
- What happens when a share link is accessed after the user has deleted their account or card?
- How does the system handle duplicate contact entries when the same person shares their card multiple times? (System matches by email first, phone number as fallback, then merges/updates existing entry)
- What happens when a user tries to accept a card from someone they've already saved? (System updates existing contact with latest information and shows notification)
- How does the system handle network connectivity issues during card sharing or acceptance?
- What happens when a user scans a QR code but the card information has been updated since the QR code was generated?
- How does the system handle special characters or emoji in profile fields, tags, or social links?

## Requirements _(mandatory)_

### Functional Requirements

#### Profile Creation and Editing (Feature 1)

- **FR-001**: System MUST allow users to create a digital card with the following profile fields: name (required), title, email (required), phone number, company, role, short bio, customizable tags, and optional profile photo/avatar
- **FR-002**: System MUST allow users to add social links for the following platforms: Bluesky, LinkedIn, X (Twitter), Facebook, Instagram, GitHub, portfolio website, and other custom platforms
- **FR-003**: System MUST allow users to upload and attach a resume file to their digital card
- **FR-004**: System MUST allow users to edit any profile field, social link, resume, or profile photo at any time after card creation
- **FR-005**: System MUST provide an onboarding flow that guides new users through creating their first digital card
- **FR-006**: System MUST display a "My Card" screen that shows a preview of the user's digital card with all information, social links, and resume status
- **FR-007**: System MUST provide clear access to edit details, social links, and resume from the "My Card" screen
- **FR-008**: System MUST validate email addresses when entered
- **FR-009**: System MUST validate phone numbers when entered (format validation)
- **FR-010**: System MUST validate social link URLs when entered
- **FR-011**: System MUST allow users to remove social links they've added
- **FR-012**: System MUST allow users to remove or replace their uploaded resume
- **FR-013**: System MUST allow users to add multiple custom tags to their profile
- **FR-014**: System MUST allow users to remove tags they've added

#### Sharing Options (Feature 2)

- **FR-015**: System MUST generate a QR code that encodes the user's digital card information or a shareable link to it
- **FR-016**: System MUST display the QR code prominently on a dedicated "Share" screen
- **FR-017**: System MUST provide an AirDrop sharing option that allows users to share their card with nearby devices
- **FR-018**: System MUST provide an email sharing option that opens the user's email client with pre-filled content
- **FR-019**: System MUST provide an SMS sharing option that opens the user's messaging app with pre-filled content
- **FR-020**: System MUST provide a "Copy Share Link" option that copies a unique, shareable URL to the user's clipboard
- **FR-021**: System MUST provide a .vcf file export option that generates a vCard file containing the user's contact information
- **FR-022**: System MUST generate unique share links for each user's digital card
- **FR-023**: System MUST allow users to regenerate or revoke share links if needed
- **FR-024**: System MUST ensure QR codes remain valid and accessible even if the user updates their card information

#### Public Web View (Feature 3)

- **FR-025**: System MUST provide a public web page that displays a digital card when accessed via QR code scan or share link
- **FR-026**: System MUST display all profile information, social links, and resume availability on the public web view
- **FR-027**: System MUST allow web view visitors to click social links, which open in new tabs/windows
- **FR-028**: System MUST provide a "Download Contact" or "Add to Contacts" option that generates and downloads a .vcf file
- **FR-029**: System MUST provide a "Download Resume" option when a resume is attached to the card
- **FR-030**: System MUST ensure the web view is responsive and works on both mobile and desktop browsers
- **FR-031**: System MUST ensure the web view is accessible without requiring the app to be installed
- **FR-032**: System MUST handle web view access gracefully if a card has been deleted or is no longer available

#### In-App Network/Contacts (Feature 4)

- **FR-033**: System MUST provide a "Network" or "Contacts" tab where users can view digital cards they've received from other app users
- **FR-034**: System MUST allow users to send their card to other app users through an in-app sharing mechanism. Users MUST be able to discover recipients by scanning their QR code or by looking them up via phone number or email address
- **FR-035**: System MUST notify recipients when they receive a card from another app user
- **FR-036**: System MUST allow recipients to accept or decline received cards
- **FR-037**: System MUST add accepted cards to the user's Network/Contacts tab
- **FR-038**: System MUST allow users to view full card details for any saved contact
- **FR-039**: System MUST allow users to add tags to saved contacts for organization
- **FR-040**: System MUST allow users to add metadata to saved contacts, including when and where they met
- **FR-041**: System MUST allow users to search or filter their Network/Contacts by name, company, tags, or other criteria
- **FR-042**: System MUST allow users to share their own card directly from a saved contact's card view
- **FR-043**: System MUST prevent duplicate entries when the same person shares their card multiple times (merge or update existing entry). Duplicate detection MUST match by email address first; if email addresses differ or are unavailable, match by phone number
- **FR-045**: System MUST update existing saved contacts with the latest card information when a user accepts a card from someone already in their Network/Contacts, and MUST show a notification that the contact was updated
- **FR-046**: System MUST allow users to upload an optional profile photo/avatar for their digital card
- **FR-047**: System MUST allow users to remove or replace their profile photo at any time
- **FR-048**: System MUST prevent sharing if a user has not completed onboarding (minimum required fields: name and email). When sharing is attempted, System MUST show a message prompting the user to complete onboarding before sharing
- **FR-044**: System MUST display basic metadata (tags, meeting context) for each saved contact in the Network/Contacts list

### Key Entities

- **Digital Card**: Represents a user's complete business card profile, containing profile fields (name, title, email, phone, company, role, bio, tags), optional profile photo/avatar, social links (platform and URL pairs), optional resume file, unique share link, and QR code data. Each user has one primary card that they can edit.

- **Social Link**: Represents a connection to an external social platform or website. Contains platform type (Bluesky, LinkedIn, X, Facebook, Instagram, GitHub, portfolio, or custom) and URL. Belongs to a Digital Card.

- **Resume**: Represents an uploaded resume file attached to a Digital Card. Contains file data, filename, upload date, and file type. Optional - a Digital Card may have zero or one resume.

- **Share Link**: Represents a unique, shareable URL that points to a public web view of a Digital Card. Contains the unique identifier, creation date, and references the Digital Card it represents.

- **Saved Contact**: Represents a digital card received from another app user and saved in the current user's Network. Contains the full Digital Card information, acceptance date, optional tags added by the current user, optional meeting metadata (when/where met), and relationship to the original card owner.

- **Meeting Metadata**: Represents contextual information about when and where a user met a contact. Contains date, location (optional), and notes (optional). Associated with a Saved Contact.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can complete the onboarding flow and create their first digital card in under 5 minutes
- **SC-002**: Users can view and edit their digital card information in under 30 seconds from the "My Card" screen
- **SC-003**: Users can generate and access sharing options (QR code, share link, .vcf) in under 10 seconds from the Share screen
- **SC-004**: Share links and QR codes load the public web view in under 3 seconds on standard mobile networks
- **SC-005**: 95% of share link recipients can successfully view the digital card in a web browser without errors
- **SC-006**: Users can download contact information (.vcf) from the web view in under 5 seconds
- **SC-007**: Users can download resume files from the web view in under 10 seconds for files up to 10MB
- **SC-008**: In-app card sharing between two app users completes (send and accept) in under 15 seconds
- **SC-009**: Users can search and filter their Network/Contacts list and find a specific contact in under 10 seconds for networks up to 1000 contacts
- **SC-010**: 90% of users successfully complete onboarding on their first attempt without requiring support
- **SC-011**: The public web view renders correctly and is fully functional on 95% of modern mobile and desktop browsers
- **SC-012**: Social links in the web view successfully open the correct platform 99% of the time

## Assumptions

- Users have internet connectivity when creating, editing, and sharing cards (offline functionality is out of scope)
- Resume file size limits are reasonable (assumed 10MB maximum, but this may need platform-specific configuration)
- The app targets modern mobile devices (iOS and Android) with current operating system versions
- Users have basic familiarity with mobile apps and QR codes
- Social media platforms remain accessible and URLs follow standard formats
- The app will have user authentication/accounts (implied by "my card" and user-specific data, but authentication method not specified)
- Share links are persistent and remain valid unless explicitly revoked by the user
- The public web view is hosted on a web server accessible via the share links
- In-app notifications for card sharing require push notification capabilities
- Users can have only one primary digital card (editable profile) but can receive and save multiple cards from others

## Dependencies

- User authentication system (users must be able to create accounts and log in)
- File storage system for resume uploads and retrieval
- Web hosting infrastructure for public web views
- QR code generation library or service
- Device sharing capabilities (AirDrop for iOS, equivalent for Android)
- Push notification service for in-app card sharing notifications
- Contact import capabilities on user devices (.vcf file support)

## Out of Scope

- Offline functionality for viewing or editing cards
- Multiple card profiles per user (users have one primary card)
- Card templates or customization of card appearance/layout
- Analytics or tracking of who viewed shared cards
- Two-way communication or messaging between contacts
- Calendar integration or event management
- Card expiration or automatic deletion
- Business/organization accounts with multiple users
- Card versioning or history of changes
- Integration with external CRM systems
