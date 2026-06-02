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
