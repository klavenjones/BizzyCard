# Quickstart Guide: BizzyCard Development Setup

**Feature**: Digital Business Card Application  
**Branch**: `001-digital-business-card`  
**Date**: 2025-11-21  
**Estimated Setup Time**: 30-45 minutes

## Overview

This guide will get you from zero to running the BizzyCard app locally in under an hour. Follow the steps in order.

---

## Prerequisites

Before starting, ensure you have the following installed:

### Required Tools
- **Node.js**: v18+ (LTS recommended)
- **Yarn**: v1.22+ (project uses Yarn)
- **Git**: Latest version
- **iOS Development** (Mac only):
  - Xcode 15+ (from Mac App Store)
  - Xcode Command Line Tools: `xcode-select --install`
  - CocoaPods: `sudo gem install cocoapods`
- **Android Development**:
  - Android Studio (latest version)
  - Android SDK 33+ (configurable in Android Studio)
  - Java JDK 11+ (bundled with Android Studio)

### Recommended Tools
- **VS Code**: With Expo Tools extension
- **Expo Go**: Install on your physical device (for testing)
  - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
  - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Accounts Needed
- **Clerk Account**: Sign up at [clerk.com](https://clerk.com) (free tier available)
- **Supabase Account**: Sign up at [supabase.com](https://supabase.com) (free tier available)
- **Expo Account**: Sign up at [expo.dev](https://expo.dev) (free tier available)

---

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd BizzyCard

# Checkout the feature branch
git checkout 001-digital-business-card

# Install dependencies
yarn install

# Install iOS dependencies (Mac only)
cd ios && pod install && cd ..
```

**Troubleshooting**:
- If `yarn install` fails, try deleting `node_modules` and `yarn.lock`, then run `yarn install` again
- If CocoaPods fails, run `pod repo update` then try again

---

## Step 2: Set Up Supabase Backend

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in:
   - **Name**: BizzyCard
   - **Database Password**: Generate a secure password (save this!)
   - **Region**: Choose closest to you
4. Click **Create new project** (takes ~2 minutes)

### 2.2 Run Database Migrations

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link project (get project-id from Supabase dashboard URL)
supabase link --project-ref <your-project-id>

# Run migrations to create tables
supabase db push
```

**Note**: If migrations fail, you can manually run the SQL from `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor.

### 2.3 Configure Row-Level Security (RLS)

RLS policies are included in the migration. Verify they're enabled:

1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Ensure all tables have RLS enabled
3. Verify policies exist for each table (see `data-model.md` for details)

### 2.4 Create Storage Buckets

```bash
# Option 1: Via Supabase CLI
supabase storage create profile-pictures --public
supabase storage create resumes --public

# Option 2: Via Dashboard
# 1. Go to Storage → Create bucket
# 2. Name: profile-pictures, Public: YES
# 3. Name: resumes, Public: YES
```

### 2.5 Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy these values (you'll need them in Step 4):
   - **Project URL**: `https://<project-id>.supabase.co`
   - **Anon/Public Key**: Long string starting with `eyJ...`

---

## Step 3: Set Up Clerk Authentication

### 3.1 Create Clerk Application

1. Go to [clerk.com](https://clerk.com) and sign in
2. Click **Add Application**
3. Fill in:
   - **Name**: BizzyCard
   - **Authentication Options**: Enable **Email** and **Phone** (or social providers)
4. Click **Create Application**

### 3.2 Configure Clerk for React Native

1. Go to **Configure** → **Instances**
2. Add **iOS** instance:
   - Bundle ID: `com.bizzycard.app` (or your custom bundle ID)
3. Add **Android** instance:
   - Package Name: `com.bizzycard.app` (or your custom package name)

### 3.3 Get Clerk Credentials

1. Go to **API Keys**
2. Copy these values (you'll need them in Step 4):
   - **Publishable Key**: Starts with `pk_test_...`
   - **Secret Key**: Starts with `sk_test_...` (keep this secure!)

### 3.4 Configure Clerk + Supabase Integration

1. In Clerk Dashboard, go to **JWT Templates**
2. Click **New Template** → **Supabase**
3. Fill in:
   - **Template Name**: Supabase
   - **Supabase Project URL**: Your Supabase project URL from Step 2.5
   - **Supabase JWT Secret**: Get from Supabase Dashboard → Settings → API → JWT Secret
4. Click **Save**
5. Copy the **Issuer URL** (you'll configure Supabase with this)

### 3.5 Configure Supabase to Accept Clerk JWTs

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Scroll to **JWT** section
3. Enable **JWT**
4. Fill in:
   - **JWT Secret**: Use Clerk's JWT Secret (from Clerk Dashboard → Developers → API Keys → JWT Public Key)
   - **JWKS URL**: `https://<clerk-frontend-api>.clerk.accounts.dev/.well-known/jwks.json`
5. Click **Save**

**Important**: Clerk and Supabase integration allows Clerk to issue JWTs that Supabase validates for RLS policies.

---

## Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ... # Your Supabase anon key

# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... # Your Clerk publishable key

# Web Card Base URL (use localhost for development)
EXPO_PUBLIC_WEB_CARD_BASE_URL=http://localhost:3000

# Optional: Sentry DSN (for error tracking, leave empty for now)
SENTRY_DSN=
```

**Security Note**: Never commit `.env` to Git. It's already in `.gitignore`.

---

## Step 5: Update Configuration Files

### 5.1 Update `app.json`

Update the following fields in `app.json`:

```json
{
  "expo": {
    "name": "BizzyCard",
    "slug": "bizzycard",
    "scheme": "bizzycard",
    "ios": {
      "bundleIdentifier": "com.bizzycard.app",
      "supportsTablet": true
    },
    "android": {
      "package": "com.bizzycard.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

### 5.2 Configure Deep Linking

Deep linking is required for QR code scanning and card sharing.

**iOS**: Add to `app.json` (already configured if using Expo Router)

```json
{
  "expo": {
    "scheme": "bizzycard"
  }
}
```

**Android**: Expo Router handles this automatically.

**Test deep links**:
- iOS: `bizzycard://card/abc123`
- Android: `bizzycard://card/abc123`
- Web: `https://bizzycard.app/card/abc123`

---

## Step 6: Run the App

### 6.1 Start Expo Dev Server

```bash
# Start the Expo development server
yarn start
```

This opens the Expo DevTools in your browser.

### 6.2 Run on iOS Simulator (Mac only)

```bash
# Option 1: Press 'i' in the terminal
# Option 2: Run command directly
yarn ios
```

**Troubleshooting**:
- If simulator doesn't open, open Xcode → Xcode → Open Developer Tool → Simulator
- If build fails, try `cd ios && pod install && cd ..` then retry

### 6.3 Run on Android Emulator

```bash
# Option 1: Press 'a' in the terminal
# Option 2: Run command directly
yarn android
```

**Troubleshooting**:
- Ensure an emulator is running (open Android Studio → AVD Manager → Run device)
- If build fails, check Android SDK is installed (Android Studio → SDK Manager)

### 6.4 Run on Physical Device (Expo Go)

1. Install **Expo Go** app on your device
2. Scan QR code from terminal with:
   - **iOS**: Camera app
   - **Android**: Expo Go app
3. App should load on your device

**Note**: Some features (like notifications) may not work in Expo Go. Use development builds for full functionality.

---

## Step 7: Verify Setup

### 7.1 Test Authentication

1. Open the app (should show sign-in screen)
2. Click **Sign Up**
3. Enter email and password
4. Verify email (check inbox)
5. Should redirect to onboarding/profile creation

**Troubleshooting**:
- If sign-in fails, check Clerk publishable key in `.env`
- If email verification doesn't work, check Clerk email settings (Dashboard → Emails)

### 7.2 Test Supabase Connection

1. Complete profile creation form
2. Click **Save**
3. Verify profile appears on "My Card" screen
4. Check Supabase Dashboard → Table Editor → `profiles` → Should see new row

**Troubleshooting**:
- If save fails, check Supabase URL and anon key in `.env`
- If RLS denies insert, verify Clerk JWT integration (Step 3.4-3.5)

### 7.3 Test QR Code Generation

1. Navigate to **Share** tab
2. QR code should appear
3. Copy the shareable link
4. Paste in browser (should show web card - not implemented yet, will show 404)

---

## Step 8: Run Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

**Expected Result**: All existing tests should pass. Coverage report in `coverage/` directory.

---

## Step 9: Set Up Development Builds (Optional but Recommended)

Expo Go has limitations (no notifications, no custom native modules). Development builds give you full functionality.

### 9.1 Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 9.2 Configure EAS Build

```bash
# Initialize EAS configuration
eas build:configure
```

This creates `eas.json` with build configurations.

### 9.3 Create Development Build

```bash
# iOS Development Build
eas build --profile development --platform ios

# Android Development Build
eas build --profile development --platform android
```

**Note**: First build takes 15-30 minutes. Subsequent builds are faster.

### 9.4 Install Development Build

1. Once build completes, scan QR code from terminal
2. Download and install the development build on your device
3. Run `yarn start` → press `d` to open development build
4. App opens with full native functionality

---

## Step 10: Optional Setup

### 10.1 Set Up Sentry (Error Tracking)

1. Sign up at [sentry.io](https://sentry.io)
2. Create new project → React Native
3. Copy DSN to `.env`: `SENTRY_DSN=https://...@sentry.io/...`
4. Initialize Sentry in `app/_layout.tsx` (see docs)

### 10.2 Set Up Pre-commit Hooks

```bash
# Install Husky
yarn add --dev husky lint-staged

# Initialize Husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "yarn lint-staged"
```

Edit `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### 10.3 Set Up GitHub Actions CI

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: yarn install
      - run: yarn lint
      - run: yarn test --coverage
      - uses: codecov/codecov-action@v3
```

---

## Common Issues & Solutions

### Issue: "Module not found" errors

**Solution**:
```bash
# Clear Metro bundler cache
yarn start --clear

# Or manually clear
rm -rf node_modules .expo
yarn install
```

### Issue: Expo Go crashes on launch

**Solution**:
- Ensure Expo SDK version matches (`expo-cli` version vs `expo` package version)
- Update Expo Go app to latest version
- Try running on simulator/emulator instead

### Issue: Supabase RLS denies all queries

**Solution**:
- Verify Clerk JWT integration (Step 3.4-3.5)
- Check RLS policies are enabled (Supabase Dashboard → Authentication → Policies)
- Test JWT manually: Get JWT from Clerk → Decode at jwt.io → Verify `sub` claim matches `user_id`

### Issue: iOS build fails with CocoaPods error

**Solution**:
```bash
cd ios
pod deintegrate
pod install
cd ..
yarn ios
```

### Issue: Android build fails with Gradle error

**Solution**:
```bash
cd android
./gradlew clean
cd ..
yarn android
```

---

## Development Workflow

### Daily Workflow

1. **Pull latest changes**:
   ```bash
   git pull origin 001-digital-business-card
   yarn install
   ```

2. **Start development**:
   ```bash
   yarn start
   # Press 'i' for iOS or 'a' for Android
   ```

3. **Write tests first** (TDD approach per Constitution Principle II)
4. **Implement feature**
5. **Run tests**:
   ```bash
   yarn test
   ```

6. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat: implement profile creation form"
   ```

### Creating a New Feature

1. Create a new component:
   ```bash
   mkdir components/profile
   touch components/profile/profile-form.tsx
   touch components/profile/__tests__/profile-form.test.tsx
   ```

2. Write test first:
   ```typescript
   // profile-form.test.tsx
   describe('ProfileForm', () => {
     it('should render all required fields', () => {
       render(<ProfileForm />);
       expect(screen.getByLabelText('Name')).toBeOnScreen();
       expect(screen.getByLabelText('Email')).toBeOnScreen();
       // ...
     });
   });
   ```

3. Implement component until test passes
4. Add integration tests if needed
5. Update documentation

---

## Project Structure Quick Reference

```
app/                     # Expo Router screens
├── (auth)/             # Authentication screens
├── (onboarding)/       # Onboarding flow
├── (tabs)/             # Main app tabs
└── _layout.tsx         # Root layout with providers

components/             # Reusable components
├── ui/                 # React Native Reusables
├── business-card/      # Card display components
├── profile/            # Profile management components
└── share/              # Sharing components

lib/                    # Services and utilities
├── supabase/          # Supabase client and API
├── clerk/             # Clerk auth helpers
├── hooks/             # Custom React hooks
├── types/             # TypeScript types
└── utils/             # General utilities

tests/                  # Test files
├── components/        # Component tests
├── integration/       # Integration tests
└── e2e/              # End-to-end tests

supabase/              # Backend configuration
└── migrations/        # Database migrations

specs/                 # Feature specifications
└── 001-digital-business-card/
    ├── spec.md
    ├── plan.md
    ├── research.md
    ├── data-model.md
    ├── quickstart.md (this file)
    └── contracts/
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `yarn start` | Start Expo dev server |
| `yarn ios` | Run on iOS simulator |
| `yarn android` | Run on Android emulator |
| `yarn test` | Run all tests |
| `yarn test:watch` | Run tests in watch mode |
| `yarn lint` | Run ESLint |
| `yarn format` | Run Prettier |
| `yarn type-check` | Run TypeScript compiler (check types) |
| `npx expo install` | Install Expo-compatible packages |
| `eas build` | Build with EAS (cloud builds) |
| `eas update` | Publish OTA update |
| `supabase db push` | Push migrations to Supabase |
| `supabase gen types typescript` | Generate TypeScript types from schema |

---

## Next Steps

Now that your environment is set up, you're ready to start implementing features!

1. **Read the documentation**:
   - `spec.md` - Feature requirements and user stories
   - `data-model.md` - Database schema and entity relationships
   - `contracts/api-endpoints.md` - API endpoint documentation

2. **Start with User Story 1 (P1 - MVP)**:
   - Create authentication flow (`app/(auth)/`)
   - Implement profile creation (`app/(onboarding)/create-profile.tsx`)
   - Build "My Card" screen (`app/(tabs)/my-card.tsx`)

3. **Follow TDD approach**:
   - Write test first
   - Implement feature
   - Refactor
   - Repeat

4. **Reference Constitution**:
   - `.specify/memory/constitution.md` - Project standards and best practices

---

## Getting Help

### Documentation
- **Expo Docs**: [docs.expo.dev](https://docs.expo.dev)
- **React Native Docs**: [reactnative.dev](https://reactnative.dev)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Clerk Docs**: [clerk.com/docs](https://clerk.com/docs)
- **NativeWind Docs**: [nativewind.dev](https://nativewind.dev)

### Community
- **Expo Discord**: [expo.dev/discord](https://expo.dev/discord)
- **React Native Discord**: [reactnative.dev/discord](https://reactnative.dev/discord)
- **Supabase Discord**: [supabase.com/discord](https://supabase.com/discord)

### Troubleshooting
- Clear Metro cache: `yarn start --clear`
- Reset Expo cache: `expo start -c`
- Clean build: `cd ios && pod install && cd .. && yarn ios`
- Check logs: `npx react-native log-ios` or `npx react-native log-android`

---

**Congratulations! You're ready to build BizzyCard. Happy coding! 🚀**

