-- Structured, place-linked community insights for Discovery hidden gems.

CREATE TABLE IF NOT EXISTS place_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hidden_gem_id INTEGER NOT NULL REFERENCES hidden_gems(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS place_insights_hidden_gem_id_idx
  ON place_insights(hidden_gem_id);

CREATE INDEX IF NOT EXISTS place_insights_type_idx
  ON place_insights(type);

ALTER TABLE place_insights ENABLE ROW LEVEL SECURITY;

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
