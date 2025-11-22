# Setup Instructions: Phase 1

This document provides step-by-step instructions for completing the manual setup tasks in Phase 1.

## T001: Install Supabase CLI

Install the Supabase CLI globally:

```bash
npm install -g supabase
```

Verify installation:

```bash
supabase --version
```

## T002: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: `BizzyCard` (or your preferred name)
   - Database Password: Generate a strong password (save it securely)
   - Region: Choose closest to your users
4. Wait for project to be created (~2 minutes)
5. Go to Project Settings → API
6. Copy the following values to your `.env` file:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_ANON_KEY` (anon/public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role key - keep secret!)

## T003: Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click "Create Application"
3. Fill in application details:
   - Name: `BizzyCard`
   - Authentication: Choose your preferred methods (Email, Phone, Social)
4. After creation, go to API Keys
5. Copy the following values to your `.env` file:
   - `CLERK_PUBLISHABLE_KEY` (starts with `pk_test_` or `pk_live_`)
   - `CLERK_SECRET_KEY` (starts with `sk_test_` or `sk_live_`)

## T004: Configure Clerk + Supabase JWT Integration

### Step 1: Configure Clerk JWT Template

1. In Clerk Dashboard, go to **JWT Templates**
2. Click **New Template**
3. Name: `Supabase`
4. Token Lifetime: `3600` (1 hour)
5. Add the following claims:

```json
{
  "aud": "authenticated",
  "role": "authenticated",
  "exp": "{{exp}}",
  "sub": "{{user.id}}"
}
```

6. Save the template and copy the **Template ID**

### Step 2: Configure Supabase JWT Provider

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **JWT** provider
3. Configure JWT settings:
   - **JWT Secret**: Get from Clerk Dashboard → JWT Templates → Your template → Secret
   - **JWT URL**: `https://YOUR_CLERK_DOMAIN.clerk.accounts.dev`
   - **JWKS URL**: `https://YOUR_CLERK_DOMAIN.clerk.accounts.dev/.well-known/jwks.json`

### Step 3: Update Environment Variables

Add to your `.env` file:

```
CLERK_JWT_TEMPLATE_ID=your-template-id-here
CLERK_DOMAIN=your-clerk-domain.clerk.accounts.dev
```

## T005: Initialize Environment Variables

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill in all values from T002 and T003 above

3. **Important**: Never commit `.env` to git (it's already in `.gitignore`)

## Next Steps

After completing all manual setup tasks:

1. Run `yarn install` to install all dependencies (T006)
2. Verify Jest configuration: `yarn test` (should show no tests yet)
3. Verify EAS configuration: `eas build:configure` (if EAS CLI is installed)

## Troubleshooting

### Supabase CLI Issues

- Ensure Node.js 18+ is installed
- Try `npm install -g supabase@latest`

### Clerk JWT Issues

- Verify JWT template claims match exactly
- Check that Supabase JWT provider is enabled
- Ensure Clerk domain is correct in Supabase settings

### Environment Variables

- Ensure `.env` file is in project root
- Check that all variables are set (no empty values)
- Restart your development server after updating `.env`
