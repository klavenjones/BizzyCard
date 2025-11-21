# Feature Specification: Digital Business Card Application

**Feature Branch**: `001-digital-business-card`  
**Created**: 2025-11-21  
**Status**: Draft  
**Input**: User description: "Build a mobile application for tech professionals that functions as a digital business card and makes it easy to create, share, and manage networking information. The app should let users create a personal profile with fields like name, title, email, phone number, company, role, short bio, and customizable tags, plus add social links (Bluesky, LinkedIn, X, Facebook, Instagram, GitHub, portfolio site, and other platforms) and optionally upload and attach a resume. The UI should include: an onboarding flow to set up the first digital card; a main 'My Card' screen showing a preview of the user's digital card with clear access to edit details, social links, and resume; a dedicated 'Share' screen that prominently displays a QR code, along with quick actions for AirDrop, email, SMS, copying a share link, and sending a .vcf file; and a 'Network' or 'Contacts' tab where users can view and organize digital cards they've received from other app users, add them as contacts/friends, and see basic metadata like tags or when/where they met. Recipients who do not have the app should still be able to receive and use the information via share flows that generate a .vcf file or a web view: the QR code and share links should open a hosted web page showing the digital card, with options to download contact info, view social links, and download the attached resume. For in-app users sharing with each other, the experience should feel seamless, with a simple, fast flow to send and accept cards, add to their in-app contact list, and quickly access previously saved cards."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Profile and View My Card (Priority: P1) 🎯 MVP

A tech professional downloads the app and needs to create their digital business card. They enter their professional information (name, title, email, phone, company, role, bio, tags) and add links to their social media profiles. They can then view their completed card on the "My Card" screen and edit any details as needed.

**Why this priority**: This is the foundational feature - without a profile, users cannot share anything. The "My Card" screen serves as the home base for managing one's digital identity. This delivers immediate value as users can see their professional card take shape.

**Independent Test**: A user can create a complete profile with all supported fields, view it on the My Card screen, edit any field, and see changes reflected immediately. No sharing or networking features required.

**Acceptance Scenarios**:

1. **Given** I am a new user opening the app for the first time, **When** I navigate to profile creation, **Then** I see a form with fields for name, title, email, phone, company, role, short bio, and customizable tags
2. **Given** I am creating my profile, **When** I add social media links, **Then** I can select from supported platforms (Bluesky, LinkedIn, X, Facebook, Instagram, GitHub, portfolio site) and add custom platform URLs
3. **Given** I have filled out my profile information, **When** I save my profile, **Then** I am taken to the "My Card" screen showing a preview of my digital business card
4. **Given** I am viewing my card on the "My Card" screen, **When** I select "Edit", **Then** I can modify any profile field including social links
5. **Given** I am on the "My Card" screen, **When** I view my card, **Then** I see my information displayed in a clean, professional card layout with my name, title, company prominently featured

---

### User Story 2 - Share Card via QR Code with Web View (Priority: P2)

A user at a networking event wants to share their business card quickly. They navigate to the "Share" screen, display their QR code, and another person scans it to view the card on a web page - no app required. The web page shows all card information and provides options to download contact info or view social links.

**Why this priority**: QR code sharing is the quickest and most universal sharing method. Combined with a web view, it works for any recipient regardless of whether they have the app. This makes the app immediately useful for real-world networking.

**Independent Test**: A user can access the Share screen, generate and display a QR code, and any person scanning it can view the full business card information on a mobile-optimized web page. Web page includes download options for contact info.

**Acceptance Scenarios**:

1. **Given** I have a completed profile, **When** I navigate to the "Share" screen, **Then** I see a prominently displayed QR code representing my digital business card
2. **Given** I am displaying my QR code, **When** another person scans it with any camera app, **Then** they are directed to a hosted web page showing my business card
3. **Given** a recipient is viewing my card on the web page, **When** the page loads, **Then** they see my name, title, company, role, phone, email, bio, tags, and all social media links in a clean, mobile-responsive layout
4. **Given** a recipient is viewing my web card, **When** they click "Download Contact", **Then** they receive options to download my information as a .vcf file or add to their device contacts
5. **Given** a recipient is viewing my web card, **When** they click on any social media link, **Then** they are directed to my profile on that platform

---

### User Story 3 - Multiple Sharing Methods (Priority: P3)

A user wants flexibility in how they share their card depending on the context. From the Share screen, they can use AirDrop for nearby iOS users, send via email for formal introductions, use SMS for quick exchanges, copy a shareable link for messaging apps, or generate a .vcf file for direct contact import.

**Why this priority**: Different networking contexts require different sharing methods. AirDrop is fast for in-person iOS users, email is professional, SMS is universal, and .vcf files enable direct contact import. This flexibility makes the app adaptable to any situation.

**Independent Test**: A user with a complete profile can access all sharing methods from the Share screen. Each method successfully delivers the card information or link to recipients. Works independently of contact management features.

**Acceptance Scenarios**:

1. **Given** I am on the Share screen, **When** I select "AirDrop", **Then** I can choose nearby Apple devices and send my card link via AirDrop
2. **Given** I am on the Share screen, **When** I select "Email", **Then** I can enter recipient email addresses and send a message with my card link and brief introduction
3. **Given** I am on the Share screen, **When** I select "SMS", **Then** I can enter phone numbers and send a text message with my card link
4. **Given** I am on the Share screen, **When** I select "Copy Link", **Then** my shareable card URL is copied to clipboard and I see confirmation
5. **Given** I am on the Share screen, **When** I select "Send .vcf", **Then** I can share a vCard file via any share method that imports directly into contacts apps
6. **Given** I have sent my card via any method, **When** the recipient accesses it, **Then** they can view my full card information and download options

---

### User Story 4 - Receive and Organize Cards in Network Tab (Priority: P4)

A user has collected multiple business cards from various networking events and wants to keep them organized. They navigate to the "Network" or "Contacts" tab where they can view all received cards, search by name or company, add tags or notes about where they met, and organize their professional connections.

**Why this priority**: Collecting cards is only valuable if they can be organized and retrieved. The Network tab transforms the app from a sharing tool into a professional networking hub. This feature can be built after sharing works, making it a natural next step.

**Independent Test**: A user who has received multiple cards (via any method) can view them in an organized list on the Network tab, search/filter, add tags and meeting notes, and access individual card details. Works independently of the exchange feature.

**Acceptance Scenarios**:

1. **Given** I have received business cards from others, **When** I open the Network tab, **Then** I see a list of all saved cards with names, companies, and profile pictures (if provided)
2. **Given** I am viewing my Network tab, **When** I search for a contact, **Then** I can find cards by name, company, role, or tags
3. **Given** I am viewing a specific card in my network, **When** I select "Add Tags", **Then** I can add customizable tags like "Conference 2025" or "Potential Client"
4. **Given** I am viewing a card, **When** I select "Add Note", **Then** I can record where/when we met or other context
5. **Given** I am viewing a card in my network, **When** I select "Save to Contacts", **Then** the card information is exported to my device contacts app
6. **Given** I have many saved cards, **When** I filter by tag, **Then** I see only cards with that specific tag

---

### User Story 5 - Seamless In-App User Exchange (Priority: P5)

Two users with the app installed want to exchange business cards instantly at a networking event. They can use a quick exchange flow where one user displays their in-app QR code, the other scans it with the in-app scanner, and both cards are automatically saved to each other's Network tab. The process feels instantaneous and requires minimal interaction.

**Why this priority**: This is a premium feature that creates network effects - the more people with the app, the more valuable it becomes. However, the app is fully functional without this (via QR + web view), making it a valuable enhancement rather than a requirement.

**Independent Test**: Two users with the app can initiate an exchange where one displays their in-app QR code, the other scans it within the app, and both users' cards are automatically saved to each other's Network tabs with confirmation.

**Acceptance Scenarios**:

1. **Given** I am at a networking event with another app user, **When** I go to Share screen and they open their in-app QR scanner, **Then** they can scan my code directly in the app (not via device camera)
2. **Given** another user scans my in-app QR code, **When** the scan completes, **Then** they see my full card within the app and can save it to their Network tab with one tap
3. **Given** I scan another user's in-app QR code, **When** I save their card, **Then** they receive a notification that I've added them and can add me back
4. **Given** two users are exchanging cards, **When** both accept the exchange, **Then** both cards appear in each other's Network tab automatically
5. **Given** I have exchanged cards with another user, **When** they later update their profile, **Then** I see an option to refresh their saved card with updated information

---

### User Story 6 - Resume Upload and Attachment (Priority: P6)

A user attending job fairs or recruiting events wants to include their resume with their business card. They upload a PDF resume from the My Card screen, toggle whether it's visible in shares, and recipients viewing their web card can download the resume alongside contact information.

**Why this priority**: Resume attachment is valuable for job-seeking contexts but not essential for basic networking. The app functions fully without it, making it a nice-to-have enhancement that can be added after core features are stable.

**Independent Test**: A user can upload a PDF resume from the My Card screen, toggle its visibility in privacy settings, and recipients viewing the shared web card can download the resume. Works independently of all other features.

**Acceptance Scenarios**:

1. **Given** I am editing my profile on the My Card screen, **When** I select "Attach Resume", **Then** I can upload a PDF file from my device (max 10MB)
2. **Given** I have uploaded a resume, **When** I view my card, **Then** I see an indicator that a resume is attached with option to preview or remove it
3. **Given** I have a resume attached, **When** I go to Share screen, **Then** I can toggle whether the resume is included in shares
4. **Given** a recipient views my web card with resume enabled, **When** they scroll down, **Then** they see a "Download Resume" button prominently displayed
5. **Given** a recipient clicks "Download Resume", **When** the download initiates, **Then** they receive my PDF resume with an appropriate filename (e.g., "John_Doe_Resume.pdf")

---

### User Story 7 - Onboarding Flow for First-Time Users (Priority: P7)

A new user downloading the app for the first time is guided through an onboarding flow that explains the app's value proposition, walks them through creating their first digital card, and introduces key features like sharing and organizing contacts. The flow is skippable for users who want to dive in directly.

**Why this priority**: Onboarding improves user experience and reduces abandonment, but the app must work without it. This is polish that can be added after all core features are proven and stable. Advanced users may prefer to skip onboarding entirely.

**Independent Test**: A new user opening the app for the first time sees an onboarding flow (2-3 screens) explaining key features, then proceeds to profile creation. Users can skip onboarding and go straight to creating their card.

**Acceptance Scenarios**:

1. **Given** I am opening the app for the first time, **When** the app launches, **Then** I see an onboarding welcome screen explaining digital business cards
2. **Given** I am viewing onboarding, **When** I swipe through screens, **Then** I see key features explained (create card, share via QR, organize contacts) with visuals
3. **Given** I am in onboarding, **When** I tap "Skip", **Then** I am taken directly to profile creation
4. **Given** I complete onboarding, **When** I proceed, **Then** I am guided to create my first digital business card
5. **Given** I have completed my first card, **When** onboarding finishes, **Then** I land on the My Card screen and onboarding doesn't appear again

---

### Edge Cases

- What happens when a user tries to create a profile without required fields (name, email, phone)?
- How does the system handle invalid email addresses or phone numbers?
- What happens when a user tries to add a social link with an invalid URL format?
- How does the app behave when trying to share via AirDrop but no nearby devices are found?
- What happens when a user tries to upload a non-PDF file as a resume?
- What happens when a user tries to upload a resume larger than 10MB?
- How does the QR code link behave if the user deletes their profile after sharing?
- What happens when scanning a QR code that isn't a valid BizzyCard QR code?
- How does the web view render on very old browsers or devices with JavaScript disabled?
- What happens when a user has 500+ saved contacts in their Network tab (performance)?
- How does the app handle network failures when loading someone's web card?
- What happens when a user tries to scan their own QR code?
- What happens when two users try to exchange cards but one has poor connectivity?
- How are duplicates handled if a user receives the same card multiple times?
- What happens when a user receives a card from someone who later updates their information?
- How does the app behave when trying to export a .vcf file but storage permissions are denied?
- What happens when a user's uploaded resume file becomes corrupted or inaccessible?

## Requirements *(mandatory)*

### Functional Requirements

**Profile Management:**
- **FR-001**: System MUST allow users to create a profile with required fields: name, email, phone number
- **FR-002**: System MUST allow users to add optional profile fields: title, company, role, short bio, customizable tags
- **FR-003**: System MUST validate email addresses using standard email format validation
- **FR-004**: System MUST validate phone numbers using international phone number format standards
- **FR-005**: System MUST allow users to add social media links for supported platforms: Bluesky, LinkedIn, X (Twitter), Facebook, Instagram, GitHub, and custom portfolio sites
- **FR-006**: System MUST validate social media URLs to ensure proper formatting
- **FR-007**: System MUST allow users to edit any profile field after initial creation
- **FR-008**: System MUST persist user profile data locally on the device
- **FR-009**: System MUST allow users to upload a PDF resume file (max 10MB)
- **FR-010**: System MUST allow users to preview their uploaded resume
- **FR-011**: System MUST allow users to remove their uploaded resume

**My Card Screen:**
- **FR-012**: System MUST display a "My Card" screen showing a preview of the user's digital business card
- **FR-013**: System MUST provide clear access to edit profile details, social links, and resume from the My Card screen
- **FR-014**: System MUST display all profile fields in a professional card layout on the My Card screen
- **FR-015**: System MUST show an indicator when a resume is attached to the profile

**Share Screen & QR Code:**
- **FR-016**: System MUST provide a dedicated "Share" screen prominently displaying a QR code
- **FR-017**: System MUST generate a unique QR code for each user's profile that links to a web-viewable card
- **FR-018**: System MUST regenerate the QR code when profile information changes
- **FR-019**: System MUST provide quick action buttons for multiple sharing methods: AirDrop, Email, SMS, Copy Link, Send .vcf

**Sharing Methods:**
- **FR-020**: System MUST support sharing via AirDrop for iOS devices
- **FR-021**: System MUST support sharing via email with a pre-composed message including the card link
- **FR-022**: System MUST support sharing via SMS with the card link
- **FR-023**: System MUST allow users to copy their shareable card link to clipboard
- **FR-024**: System MUST generate downloadable .vcf (vCard) files compatible with standard contact apps
- **FR-025**: System MUST support sharing .vcf files via native mobile sharing options

**Web View for Recipients:**
- **FR-026**: System MUST provide a hosted web page that displays business card information without requiring app installation
- **FR-027**: Web page MUST be mobile-responsive and render correctly on all device sizes
- **FR-028**: Web page MUST display all shared profile fields: name, title, company, role, phone, email, bio, tags, and social media links
- **FR-029**: Web page MUST provide a "Download Contact" button that generates a .vcf file
- **FR-030**: Web page MUST provide clickable links to all social media profiles
- **FR-031**: Web page MUST provide a "Download Resume" button when a resume is attached and sharing is enabled
- **FR-032**: System MUST generate unique, shareable URLs for each user's web-viewable card

**Network/Contacts Tab:**
- **FR-033**: System MUST provide a "Network" or "Contacts" tab where users can view received business cards
- **FR-034**: System MUST display saved cards in an organized list with names, companies, and profile pictures (if available)
- **FR-035**: System MUST provide search functionality for saved contacts by name, company, role, or tags
- **FR-036**: System MUST allow users to add custom tags to saved cards (e.g., "Conference 2025", "Client")
- **FR-037**: System MUST allow users to add notes to saved cards (e.g., where/when they met)
- **FR-038**: System MUST allow users to export saved cards to device contacts
- **FR-039**: System MUST allow users to filter saved cards by custom tags
- **FR-040**: System MUST display metadata for each card (date received, tags, notes)

**In-App User Exchange:**
- **FR-041**: System MUST provide an in-app QR code scanner for seamless card exchange between users
- **FR-042**: System MUST allow users to scan another user's QR code within the app (not via device camera)
- **FR-043**: System MUST display scanned user's full card within the app before saving
- **FR-044**: System MUST allow users to save received cards to their Network tab with one tap
- **FR-045**: System MUST notify users when someone scans and saves their card
- **FR-046**: System MUST support automatic mutual card exchange when both users accept
- **FR-047**: System MUST allow users to refresh saved cards when the original owner updates their profile

**Onboarding:**
- **FR-048**: System MUST provide an onboarding flow for first-time users explaining key features
- **FR-049**: System MUST allow users to skip onboarding and proceed directly to profile creation
- **FR-050**: System MUST show onboarding only once per user (not on subsequent app launches)

**General:**
- **FR-051**: System MUST provide visual feedback for all user actions (loading states, success confirmations, error messages)
- **FR-052**: System MUST handle offline scenarios gracefully (show appropriate messages when network required)
- **FR-053**: System MUST support both iOS and Android platforms
- **FR-054**: System MUST allow users to delete their profile and all associated data

### Key Entities

- **User Profile**: Represents a tech professional's digital business card. Key attributes include unique identifier, required fields (name, email, phone), optional fields (title, company, role, bio, tags), social media links array, resume file reference, privacy settings, creation/update timestamps.

- **Social Link**: Represents a social media or web presence link. Attributes include platform type (Bluesky, LinkedIn, X, Facebook, Instagram, GitHub, Portfolio, Other), URL, display order, visibility status.

- **Resume Attachment**: Represents an uploaded resume file. Attributes include file reference/URL, file size, upload timestamp, visibility status (whether included in shares).

- **Shared Card Link**: Represents a shareable instance of a business card with a unique URL. Attributes include unique shareable URL, reference to source User Profile, creation timestamp, access count (optional analytics).

- **Saved Contact**: Represents a received business card saved in a user's Network tab. Attributes include reference to source User Profile (if they have the app) or snapshot of card data (if received via web), custom tags, meeting notes, date received, last viewed timestamp, update status (if source profile changed).

- **Card Exchange Event**: Represents a mutual exchange between two app users. Attributes include both User Profile references, exchange timestamp, acceptance status, exchange method (in-app scan).

- **Onboarding State**: Represents whether a user has completed onboarding. Attributes include user reference, onboarding completed flag, completion timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

**User Onboarding & Profile Creation:**
- **SC-001**: New users can create a complete profile with all required fields in under 3 minutes
- **SC-002**: 90% of users who start profile creation complete it and save their first card
- **SC-003**: Users can add and edit social media links in under 30 seconds per link

**Sharing Effectiveness:**
- **SC-004**: Users can generate and display their QR code for sharing in under 2 seconds from the My Card screen
- **SC-005**: 95% of QR code scans successfully direct recipients to the web card page within 3 seconds
- **SC-006**: Recipients without the app can view a shared business card and download contact info in under 30 seconds
- **SC-007**: 85% of users successfully share their card using at least one method within their first session
- **SC-008**: Generated .vcf files import successfully into iOS Contacts, Android Contacts, and Outlook with all supported fields

**Web View Performance:**
- **SC-009**: Web card pages load and render all content within 2 seconds on standard mobile network speeds (4G)
- **SC-010**: Web card pages pass WCAG AA accessibility standards for mobile and desktop browsers
- **SC-011**: Web card pages render correctly on 95% of modern browsers (Chrome, Safari, Firefox, Edge) released in the last 3 years

**Contact Management:**
- **SC-012**: Users can find a specific contact from a list of 100+ saved cards in under 5 seconds using search
- **SC-013**: Users can add tags and notes to received cards in under 30 seconds
- **SC-014**: The Network tab displays and scrolls smoothly through 500+ saved contacts with no performance degradation

**In-App Exchange:**
- **SC-015**: In-app card exchange between two users completes in under 10 seconds from scan to both cards saved
- **SC-016**: 90% of in-app QR scans successfully capture card information on first attempt

**Performance & Reliability:**
- **SC-017**: The app maintains 60fps performance during navigation between screens and scrolling on mid-range devices (3-year-old iPhone/Android)
- **SC-018**: App launch time is under 3 seconds (cold start)
- **SC-019**: Resume uploads complete in under 15 seconds for files up to 10MB on standard mobile networks
- **SC-020**: 99% of sharing actions (QR, email, SMS, AirDrop, .vcf) complete successfully without errors

**User Satisfaction:**
- **SC-021**: 80% of users rate the app as "easy to use" for creating and sharing their business card (user survey)
- **SC-022**: 85% of users who receive a card via QR code successfully download contact info or view social links
- **SC-023**: App maintains an average rating of 4.5+ stars on App Store and Play Store
- **SC-024**: User retention rate of 70%+ after 30 days for users who create a profile

**Bundle & Technical:**
- **SC-025**: App bundle size remains under 50MB for initial download on both iOS and Android
- **SC-026**: Zero critical security vulnerabilities in uploaded resume handling or data storage

---

## Assumptions

1. **Hosting Infrastructure**: Assumes web-viewable cards will be hosted on a reliable service that handles URL generation, storage, and content delivery
2. **QR Code Format**: Assumes standard QR code format that is compatible with all modern camera apps (iOS Camera, Android Camera, third-party readers)
3. **Platform Support**: Assumes iOS 15+ and Android 10+ as minimum supported versions
4. **Data Storage**: Assumes all user data will be stored locally on device with optional cloud backup for cross-device sync (cloud sync not in scope for this spec)
5. **Resume Format**: Assumes PDF is the only accepted resume format (most universal and prevents malware via executable files)
6. **File Size Limits**: Assumes 10MB max resume size is sufficient for most professional resumes (typically 1-3MB)
7. **Social Platform Support**: Assumes the listed platforms (Bluesky, LinkedIn, X, Facebook, Instagram, GitHub) are the most relevant for tech professionals; system allows custom URLs for other platforms
8. **Network Requirements**: Assumes sharing methods (QR web view, email, SMS) require network connectivity; offline fallback is viewing saved local cards only
9. **vCard Compatibility**: Assumes standard vCard 3.0 or 4.0 format for .vcf files ensures compatibility with major contacts applications
10. **Privacy**: Assumes users control what information is shared; by default all profile fields are included in shares (privacy controls can be added in future enhancement)
11. **AirDrop Availability**: Assumes AirDrop is iOS-only; Android users will use alternative sharing methods
12. **In-App Exchange**: Assumes both users must have the app installed and be using it actively for seamless in-app exchange feature

---

## Next Steps

This specification is ready for:
1. **Quality Validation** - Automated checklist verification
2. **Clarification** (`/speckit.clarify`) - Resolve any unclear requirements
3. **Technical Planning** (`/speckit.plan`) - Architect the implementation approach
4. **Constitution Check** - Verify alignment with BizzyCard Constitution v1.1.0 principles
5. **Design Phase** - Create data models, API contracts, and quickstart guide
6. **Task Breakdown** (`/speckit.tasks`) - Generate detailed implementation tasks

**Note**: This spec prioritizes user stories to enable incremental delivery. P1 (Profile + My Card) and P2 (QR + Web View) can be delivered as an MVP, with subsequent priorities adding value independently.
