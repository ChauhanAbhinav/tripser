-- ==========================================
-- 1. TABLE CREATION
-- ==========================================

-- Profiles (extends the built-in auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  dob DATE,
  phone TEXT,
  tq_score INTEGER DEFAULT 0,
  diversity_score INTEGER DEFAULT 0,
  sustainability_index INTEGER DEFAULT 0,
  community_karma INTEGER DEFAULT 0,
  travel_dna JSONB,
  travel_storybook JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live Vibes (Community Check-ins)
CREATE TABLE IF NOT EXISTS live_vibes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  location TEXT NOT NULL,
  safety_score NUMERIC NOT NULL,
  sensory_status TEXT NOT NULL,
  message TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Itineraries
CREATE TABLE IF NOT EXISTS itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Itinerary Events
CREATE TABLE IF NOT EXISTS itinerary_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'flight', 'hotel', 'food', 'alert', 'transit'
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT DEFAULT 'Confirmed',
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Travel Documents (Digital Wallet)
CREATE TABLE IF NOT EXISTS travel_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'passport', 'visa', 'insurance', 'ticket'
  status TEXT DEFAULT 'Active',
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Places (Primary Discovery Entities)
CREATE TABLE IF NOT EXISTS places (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT,
  description TEXT,
  image_url TEXT,
  price_range TEXT,
  safety_score NUMERIC,
  accessibility_score NUMERIC,
  sensory_score NUMERIC,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packing Lists (Dynamic Itinerary Items)
CREATE TABLE IF NOT EXISTS packing_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget per trip
CREATE TABLE IF NOT EXISTS trip_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  trip_name TEXT NOT NULL,
  total_budget NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
  trip_budget_id UUID REFERENCES trip_budgets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  note TEXT,
  paid_by TEXT DEFAULT 'self',
  split_with TEXT[] DEFAULT '{}',
  date DATE DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. TRIGGERS
-- ==========================================
-- Automatically create a profile when a new user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Ensure data privacy and security

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view profiles, but only the owner can edit theirs
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Itineraries & Events: Only the owner can view and manage
CREATE POLICY "Users manage own itineraries" ON itineraries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own events" ON itinerary_events FOR ALL USING (
  itinerary_id IN (SELECT id FROM itineraries WHERE user_id = auth.uid())
);

-- Travel Documents: Only the owner can view and manage
CREATE POLICY "Users manage own documents" ON travel_documents FOR ALL USING (auth.uid() = user_id);

-- Places: Anyone can view them
CREATE POLICY "Places are viewable by everyone" ON places FOR SELECT USING (true);

-- Packing Lists: Only the owner can view and manage
CREATE POLICY "Users manage own packing lists" ON packing_lists FOR ALL USING (auth.uid() = user_id);

-- Budgets & Expenses: Only the owner can view and manage
CREATE POLICY "Users manage own budgets" ON trip_budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own expenses" ON expenses FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 4. COMMUNITY HUB SETUP 
-- ==========================================

-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE live_vibes;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;

-- ==========================================
-- 5. STORAGE BUCKETS & POLICIES
-- ==========================================

-- Create 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to avatars
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their avatars
CREATE POLICY "Users can upload an avatar." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow users to update their own uploaded avatars
CREATE POLICY "Users can update their own avatar." ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatar." ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() = owner);
