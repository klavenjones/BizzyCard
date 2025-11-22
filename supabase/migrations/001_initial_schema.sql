-- Initial Schema Migration for BizzyCard
-- Creates all tables, triggers, RLS policies, and indexes

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate random alphanumeric string for shareable links
CREATE OR REPLACE FUNCTION generate_short_code(length INTEGER DEFAULT 12)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate shareable link (short_code and full_url)
CREATE OR REPLACE FUNCTION generate_shareable_link()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate unique short code (retry if collision)
  LOOP
    NEW.short_code := generate_short_code(12);
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM shareable_links WHERE short_code = NEW.short_code
    );
  END LOOP;
  
  NEW.full_url := 'https://bizzycard.app/card/' || NEW.short_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to mark contacts as updated when profile changes
CREATE OR REPLACE FUNCTION mark_contacts_updated()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE saved_contacts
  SET profile_updated_since_save = true
  WHERE profile_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to complete exchange when both parties accept
CREATE OR REPLACE FUNCTION complete_exchange()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.initiator_accepted = true AND NEW.recipient_accepted = true THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to set notification read_at timestamp
CREATE OR REPLACE FUNCTION set_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = true AND OLD.is_read = false THEN
    NEW.read_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Tables
-- ============================================================================

-- 1. profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  role TEXT,
  bio TEXT,
  tags TEXT[] DEFAULT '{}',
  profile_picture_url TEXT,
  profile_picture_initials TEXT,
  resume_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 2. social_links
CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_platform CHECK (platform IN ('bluesky', 'linkedin', 'x', 'facebook', 'instagram', 'github', 'portfolio', 'other'))
);

-- 3. resume_attachments
CREATE TABLE IF NOT EXISTS resume_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_file_size CHECK (file_size <= 10485760)
);

-- 4. shareable_links
CREATE TABLE IF NOT EXISTS shareable_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  short_code TEXT NOT NULL UNIQUE,
  full_url TEXT NOT NULL,
  access_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_accessed_at TIMESTAMPTZ
);

-- 5. saved_contacts
CREATE TABLE IF NOT EXISTS saved_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  custom_tags TEXT[] DEFAULT '{}',
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  saved_at TIMESTAMPTZ DEFAULT now(),
  last_viewed_at TIMESTAMPTZ,
  profile_updated_since_save BOOLEAN DEFAULT false,
  UNIQUE(user_id, profile_id)
);

-- 6. card_exchanges
CREATE TABLE IF NOT EXISTS card_exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_profile_id UUID NOT NULL REFERENCES profiles(id),
  recipient_profile_id UUID NOT NULL REFERENCES profiles(id),
  exchange_method TEXT DEFAULT 'in_app_scan',
  initiator_accepted BOOLEAN DEFAULT true,
  recipient_accepted BOOLEAN DEFAULT false,
  exchanged_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT no_self_exchange CHECK (initiator_profile_id != recipient_profile_id),
  CONSTRAINT valid_exchange_method CHECK (exchange_method IN ('in_app_scan', 'qr_scan', 'manual'))
);

-- 7. notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_profile_id UUID REFERENCES profiles(id),
  related_exchange_id UUID REFERENCES card_exchanges(id),
  is_read BOOLEAN DEFAULT false,
  push_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ,
  CONSTRAINT valid_notification_type CHECK (type IN ('card_saved', 'profile_updated', 'exchange_request', 'exchange_accepted'))
);

-- 8. onboarding_state
CREATE TABLE IF NOT EXISTS onboarding_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  completed BOOLEAN DEFAULT false,
  skipped BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at);

-- social_links indexes
CREATE INDEX IF NOT EXISTS idx_social_links_profile_id ON social_links(profile_id);

-- resume_attachments indexes
CREATE INDEX IF NOT EXISTS idx_resume_profile_id ON resume_attachments(profile_id);

-- shareable_links indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_shareable_links_short_code ON shareable_links(short_code);
CREATE INDEX IF NOT EXISTS idx_shareable_links_profile_id ON shareable_links(profile_id);

-- saved_contacts indexes
CREATE INDEX IF NOT EXISTS idx_saved_contacts_user_id ON saved_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_contacts_profile_id ON saved_contacts(profile_id);
CREATE INDEX IF NOT EXISTS idx_saved_contacts_tags ON saved_contacts USING GIN(custom_tags);

-- card_exchanges indexes
CREATE INDEX IF NOT EXISTS idx_card_exchanges_initiator ON card_exchanges(initiator_profile_id);
CREATE INDEX IF NOT EXISTS idx_card_exchanges_recipient ON card_exchanges(recipient_profile_id);

-- notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);

-- onboarding_state indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_onboarding_user_id ON onboarding_state(user_id);

-- ============================================================================
-- Triggers
-- ============================================================================

-- profiles triggers
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS profiles_update_saved_contacts ON profiles;
CREATE TRIGGER profiles_update_saved_contacts
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.updated_at IS DISTINCT FROM NEW.updated_at)
  EXECUTE FUNCTION mark_contacts_updated();

-- shareable_links triggers
DROP TRIGGER IF EXISTS shareable_links_generate ON shareable_links;
CREATE TRIGGER shareable_links_generate
  BEFORE INSERT ON shareable_links
  FOR EACH ROW
  EXECUTE FUNCTION generate_shareable_link();

-- card_exchanges triggers
DROP TRIGGER IF EXISTS card_exchanges_complete ON card_exchanges;
CREATE TRIGGER card_exchanges_complete
  BEFORE UPDATE ON card_exchanges
  FOR EACH ROW
  EXECUTE FUNCTION complete_exchange();

-- notifications triggers
DROP TRIGGER IF EXISTS notifications_read_at ON notifications;
CREATE TRIGGER notifications_read_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION set_notification_read_at();

-- ============================================================================
-- Row-Level Security (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareable_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_state ENABLE ROW LEVEL SECURITY;

-- profiles RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Public can view shared profiles" ON profiles;
CREATE POLICY "Public can view shared profiles"
  ON profiles FOR SELECT
  USING (deleted_at IS NULL);

-- social_links RLS policies
DROP POLICY IF EXISTS "Users can manage own social links" ON social_links;
CREATE POLICY "Users can manage own social links"
  ON social_links
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()::text));

-- resume_attachments RLS policies
DROP POLICY IF EXISTS "Users can manage own resume" ON resume_attachments;
CREATE POLICY "Users can manage own resume"
  ON resume_attachments
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()::text));

-- shareable_links RLS policies
DROP POLICY IF EXISTS "Users can view own shareable link" ON shareable_links;
CREATE POLICY "Users can view own shareable link"
  ON shareable_links FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()::text));

DROP POLICY IF EXISTS "Public can view active shareable links" ON shareable_links;
CREATE POLICY "Public can view active shareable links"
  ON shareable_links FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE deleted_at IS NULL));

-- saved_contacts RLS policies
DROP POLICY IF EXISTS "Users can manage own saved contacts" ON saved_contacts;
CREATE POLICY "Users can manage own saved contacts"
  ON saved_contacts
  USING (user_id = auth.uid()::text);

-- card_exchanges RLS policies
DROP POLICY IF EXISTS "Users can view own exchanges" ON card_exchanges;
CREATE POLICY "Users can view own exchanges"
  ON card_exchanges FOR SELECT
  USING (
    initiator_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()::text)
    OR recipient_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()::text)
  );

-- notifications RLS policies
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
CREATE POLICY "Users can manage own notifications"
  ON notifications
  USING (user_id = auth.uid()::text);

-- onboarding_state RLS policies
DROP POLICY IF EXISTS "Users can manage own onboarding state" ON onboarding_state;
CREATE POLICY "Users can manage own onboarding state"
  ON onboarding_state
  USING (user_id = auth.uid()::text);

