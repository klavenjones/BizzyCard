# Quick Start Guide: Digital Business Card Application

**Feature**: 002-digital-business-card  
**Date**: 2025-01-27

## Prerequisites

- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g expo-cli`
- Convex account and project set up
- Clerk account and application configured
- iOS Simulator or Android Emulator (or physical device with Expo Go)

## Initial Setup

### 1. Install Dependencies

```bash
# Install Convex
npm install convex @convex-dev/auth-clerk

# Install additional Expo packages
npx expo install expo-image-picker expo-document-picker expo-sharing expo-notifications expo-file-system

# Install QR code library
npm install react-native-qrcode-svg

# Install testing dependencies
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

### 2. Set Up Convex

```bash
# Initialize Convex (if not already done)
npx convex dev

# This will:
# - Create convex/ directory
# - Set up Convex configuration
# - Create .env.local with Convex deployment URL
```

### 3. Configure Clerk + Convex Integration

1. Install Clerk Convex integration:
   ```bash
   npx convex auth install clerk
   ```

2. Update `convex/auth.config.js` (or create if needed):
   ```javascript
   export default {
     providers: [
       {
         domain: process.env.CLERK_DOMAIN,
         applicationID: process.env.CLERK_APPLICATION_ID,
       },
     ],
   };
   ```

3. Add environment variables to `.env.local`:
   ```
   CLERK_DOMAIN=your-clerk-domain
   CLERK_APPLICATION_ID=your-clerk-app-id
   CONVEX_DEPLOYMENT_URL=your-convex-url
   ```

### 4. Create Convex Schema

Create `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    onboardingCompleted: v.boolean(),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_email", ["email"])
    .index("by_phone", ["phoneNumber"]),

  cards: defineTable({
    userId: v.id("users"),
    shareId: v.string(),
    name: v.string(),
    title: v.optional(v.string()),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    bio: v.optional(v.string()),
    tags: v.array(v.string()),
    profilePhotoId: v.optional(v.id("_storage")),
    resumeFileId: v.optional(v.id("_storage")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_share_id", ["shareId"]),

  socialLinks: defineTable({
    cardId: v.id("cards"),
    platform: v.string(),
    url: v.string(),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_card_id", ["cardId"])
    .index("by_card_platform", ["cardId", "platform"]),

  contacts: defineTable({
    ownerId: v.id("users"),
    sourceCardId: v.id("cards"),
    sourceUserId: v.id("users"),
    acceptedAt: v.number(),
    updatedAt: v.number(),
    tags: v.array(v.string()),
    meetingMetadataId: v.optional(v.id("meetingMetadata")),
  })
    .index("by_owner_id", ["ownerId"])
    .index("by_owner_source", ["ownerId", "sourceUserId"])
    .index("by_source_card", ["sourceCardId"]),

  meetingMetadata: defineTable({
    contactId: v.id("contacts"),
    date: v.number(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_contact_id", ["contactId"]),
});
```

### 5. Set Up Convex Client in App

Create `lib/convex-client.ts`:

```typescript
import { ConvexReactClient } from "convex/react";
import { CONVEX_URL } from "@env";

export const convex = new ConvexReactClient(CONVEX_URL);
```

Update `app/_layout.tsx` to wrap app with ConvexProvider:

```typescript
import { ConvexProvider } from "convex/react";
import { convex } from "@/lib/convex-client";

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      {/* Your existing layout */}
    </ConvexProvider>
  );
}
```

## Development Workflow

### 1. Start Development Server

```bash
# Terminal 1: Start Expo dev server
npm run dev

# Terminal 2: Start Convex dev server
npx convex dev
```

### 2. Create Convex Functions

Functions are created in `convex/` directory. Example structure:

```
convex/
├── schema.ts
├── users.ts          # User management
├── cards.ts          # Card CRUD
├── socialLinks.ts    # Social links
├── contacts.ts       # Contacts/network
├── files.ts          # File handling
└── http.ts           # HTTP endpoints
```

### 3. Implement Features in Priority Order

**Phase 1: Core Card Creation (P1)**
1. Set up onboarding flow (`app/onboarding/`)
2. Create card creation mutation (`convex/cards.ts`)
3. Implement "My Card" screen (`app/(tabs)/my-card.tsx`)
4. Add card editing functionality

**Phase 2: Sharing (P1)**
1. Implement Share screen (`app/(tabs)/share.tsx`)
2. Add QR code generation
3. Implement sharing methods (AirDrop, email, SMS, .vcf)
4. Create share link generation

**Phase 3: Public Web View (P2)**
1. Create public route (`app/public/[shareId].tsx`)
2. Implement Convex HTTP endpoint (`convex/http.ts`)
3. Add download functionality (.vcf, resume)

**Phase 4: Network/Contacts (P2)**
1. Implement Network tab (`app/(tabs)/network.tsx`)
2. Add contact acceptance flow
3. Implement duplicate detection
4. Add search/filter functionality

## Testing Setup

### 1. Configure Jest

Create `jest.config.js`:

```javascript
module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
};
```

### 2. Create Test Utilities

Create `__tests__/utils/mock-convex.ts` for mocking Convex functions in tests.

### 3. Write Unit Tests

Example test structure:

```typescript
// __tests__/components/card-preview.test.tsx
import { render } from "@testing-library/react-native";
import { CardPreview } from "@/components/card/card-preview";

describe("CardPreview", () => {
  it("displays card information correctly", () => {
    const card = {
      name: "John Doe",
      email: "john@example.com",
      // ... other fields
    };
    
    const { getByText } = render(<CardPreview card={card} />);
    
    expect(getByText("John Doe")).toBeTruthy();
    expect(getByText("john@example.com")).toBeTruthy();
  });
});
```

## Key Implementation Notes

### File Uploads

1. Use `expo-image-picker` for profile photos
2. Use `expo-document-picker` for resume files
3. Upload to Convex file storage:
   ```typescript
   const fileId = await convex.mutation("files.upload", {
     file: fileBlob,
     fileName: "resume.pdf",
   });
   ```

### QR Code Generation

```typescript
import QRCode from "react-native-qrcode-svg";

<QRCode
  value={`https://app.bizzycard.com/public/${shareId}`}
  size={200}
/>
```

### Share Link Format

Share links use format: `https://app.bizzycard.com/public/{shareId}`

The `shareId` is a unique identifier stored in the `cards` table.

### Duplicate Contact Detection

When accepting a card, check for duplicates:
1. Query contacts by email (from source card)
2. If no match, query by phone number
3. If match found, update existing contact
4. If no match, create new contact

## Environment Variables

Required environment variables (add to `.env.local`):

```
# Convex
CONVEX_URL=your-convex-deployment-url

# Clerk (already configured)
CLERK_PUBLISHABLE_KEY=your-clerk-key

# App
APP_URL=https://app.bizzycard.com
```

## Common Commands

```bash
# Start development
npm run dev
npx convex dev

# Run tests
npm test

# Build for production
npx expo build

# Deploy Convex functions
npx convex deploy
```

## Next Steps

1. Review [data-model.md](./data-model.md) for database schema
2. Review [contracts/convex-functions.md](./contracts/convex-functions.md) for API contracts
3. Start implementing features in priority order (P1 first)
4. Write unit tests alongside implementation
5. Follow constitution principles (code quality, security, React Native best practices)

## Resources

- [Convex Documentation](https://docs.convex.dev)
- [Clerk + Convex Integration](https://docs.convex.dev/auth/clerk)
- [Expo Documentation](https://docs.expo.dev)
- [React Native Reusables](https://reactnativereusables.com)
- [NativeWind Documentation](https://www.nativewind.dev)

