-- Structured, place-linked community insights for Discovery places.

CREATE TABLE IF NOT EXISTS place_hidden_gems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS place_things_to_do (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS place_attractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  popularity_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS place_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS place_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('review', 'tip', 'safety_note')),
  title TEXT,
  body TEXT NOT NULL,
  rating INTEGER CHECK (
    rating IS NULL OR (rating >= 1 AND rating <= 5)
  ),
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT review_requires_rating CHECK (
    (type = 'review' AND rating IS NOT NULL)
    OR (type <> 'review' AND rating IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS place_hidden_gems_place_id_idx
  ON place_hidden_gems(place_id);

CREATE INDEX IF NOT EXISTS place_things_to_do_place_id_idx
  ON place_things_to_do(place_id);

CREATE INDEX IF NOT EXISTS place_attractions_place_id_idx
  ON place_attractions(place_id);

CREATE INDEX IF NOT EXISTS place_faqs_place_id_idx
  ON place_faqs(place_id);

CREATE INDEX IF NOT EXISTS place_insights_place_id_idx
  ON place_insights(place_id);

CREATE INDEX IF NOT EXISTS place_insights_type_idx
  ON place_insights(type);

ALTER TABLE place_hidden_gems ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_things_to_do ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Place hidden gems are viewable by everyone"
  ON place_hidden_gems FOR SELECT
  USING (true);

CREATE POLICY "Place things to do are viewable by everyone"
  ON place_things_to_do FOR SELECT
  USING (true);

CREATE POLICY "Place attractions are viewable by everyone"
  ON place_attractions FOR SELECT
  USING (true);

CREATE POLICY "Place FAQs are viewable by everyone"
  ON place_faqs FOR SELECT
  USING (true);

CREATE POLICY "Place insights are viewable by everyone"
  ON place_insights FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create place insights"
  ON place_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own place insights"
  ON place_insights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own place insights"
  ON place_insights FOR DELETE
  USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE place_insights;

-- Lightweight voting for live vibe checkins.

ALTER TABLE live_vibes
  ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS live_vibe_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  live_vibe_id INTEGER NOT NULL REFERENCES live_vibes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(live_vibe_id, user_id)
);

CREATE INDEX IF NOT EXISTS live_vibe_votes_live_vibe_id_idx
  ON live_vibe_votes(live_vibe_id);

ALTER TABLE live_vibe_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Live vibe votes are viewable by everyone"
  ON live_vibe_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can create own live vibe votes"
  ON live_vibe_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own live vibe votes"
  ON live_vibe_votes FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.toggle_live_vibe_upvote(
  p_vibe_id INTEGER,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_count INTEGER;
  next_voted BOOLEAN;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'User can only toggle their own live vibe vote';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM live_vibe_votes
    WHERE live_vibe_id = p_vibe_id
      AND user_id = p_user_id
  ) THEN
    DELETE FROM live_vibe_votes
    WHERE live_vibe_id = p_vibe_id
      AND user_id = p_user_id;

    UPDATE live_vibes
    SET upvotes = GREATEST(COALESCE(upvotes, 0) - 1, 0)
    WHERE id = p_vibe_id
    RETURNING upvotes INTO next_count;

    next_voted := false;
  ELSE
    INSERT INTO live_vibe_votes (live_vibe_id, user_id)
    VALUES (p_vibe_id, p_user_id);

    UPDATE live_vibes
    SET upvotes = COALESCE(upvotes, 0) + 1
    WHERE id = p_vibe_id
    RETURNING upvotes INTO next_count;

    next_voted := true;
  END IF;

  RETURN jsonb_build_object('upvotes', COALESCE(next_count, 0), 'hasVoted', next_voted);
END;
$$;

-- Long-form community travel stories.

CREATE TABLE IF NOT EXISTS travel_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  place_id INTEGER REFERENCES places(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL,
  image_url TEXT,
  mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS travel_stories_place_id_idx
  ON travel_stories(place_id);

CREATE INDEX IF NOT EXISTS travel_stories_user_id_idx
  ON travel_stories(user_id);

ALTER TABLE travel_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Travel stories are viewable by everyone"
  ON travel_stories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create travel stories"
  ON travel_stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own travel stories"
  ON travel_stories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own travel stories"
  ON travel_stories FOR DELETE
  USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE travel_stories;
