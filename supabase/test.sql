-- ==========================================
-- supabase/seed.sql
-- Run: supabase db reset (applies migrations + this seed)
-- ==========================================

-- ==========================================
-- 1. HIDDEN GEMS
-- ==========================================

INSERT INTO hidden_gems (name, location, description, image_url, price_range, safety_score, accessibility_score, sensory_score, tags) VALUES
  (
    'Kotor Old Town',
    'Montenegro',
    'A walled medieval city on the Adriatic coast, far less crowded than Dubrovnik. Cobblestone streets, cat cafes, and stunning bay views.',
    'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&auto=format',
    '$800 - $1,200',
    9.2, 7.5, 8.0,
    ARRAY['Hidden Gem', 'Safe', 'Historic']
  ),
  (
    'Matera',
    'Italy',
    'Ancient cave city (Sassi) carved into rock — one of the oldest continuously inhabited settlements on Earth. Eerily beautiful at night.',
    'https://images.unsplash.com/photo-1533421644343-45b606a69f48?w=800&auto=format',
    '$900 - $1,400',
    8.8, 6.5, 9.1,
    ARRAY['UNESCO', 'Quiet', 'Unique', 'Solo Friendly']
  ),
  (
    'Luang Prabang',
    'Laos',
    'Serene Buddhist temples, night markets, turquoise waterfalls, and monk alms-giving ceremonies. Minimal tourist crowds year-round.',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&auto=format',
    '$600 - $1,000',
    8.5, 7.0, 9.3,
    ARRAY['Spiritual', 'Budget', 'Nature', 'Solo Friendly']
  ),
  (
    'Gjirokastra',
    'Albania',
    'A UNESCO-listed Ottoman stone city perched in the mountains. Almost entirely undiscovered by mainstream tourism.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format',
    '$500 - $800',
    8.0, 6.0, 9.5,
    ARRAY['Hidden Gem', 'Historic', 'Budget']
  ),
  (
    'Chefchaouen',
    'Morocco',
    'The famous Blue City nestled in the Rif Mountains. Labyrinthine medina painted in every shade of blue — incredibly photogenic and calm.',
    'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&auto=format',
    '$700 - $1,100',
    8.3, 6.8, 8.7,
    ARRAY['Scenic', 'Culture', 'Photography', 'Women Friendly']
  ),
  (
    'Tbilisi Old Town',
    'Georgia',
    'Sulfur bathhouses, cliff-side churches, eclectic architecture mixing Persian, Russian, and European styles. Incredible food scene on a budget.',
    'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&auto=format',
    '$600 - $1,000',
    8.6, 7.2, 8.4,
    ARRAY['Hidden Gem', 'Foodie', 'Architecture', 'Budget']
  );

-- ==========================================
-- 2. VOTING BOARDS + OPTIONS
-- Explicit IDs so options reference them safely
-- regardless of sequence state after reset.
-- ==========================================

INSERT INTO voting_boards (id, title, category, members) VALUES
  (1, 'Where should we go this winter?',  'Destination',   4),
  (2, 'Best budget stays in Lisbon',      'Accommodation', 3),
  (3, 'Group dinner night — Rome',        'Food',          6),
  (4, 'Girls Trip to Kyoto 🌸',           'Accommodation', 4),
  (5, 'Family Amalfi Coast 🍋',           'Activity',      6),
  (6, 'Solo Backpacking Balkans 🗺️',      'Transport',     3)
ON CONFLICT (id) DO NOTHING;

-- Keep sequence in sync after explicit ID inserts
SELECT setval('voting_boards_id_seq', (SELECT MAX(id) FROM voting_boards));

-- Board 1 — Destination
INSERT INTO voting_options (board_id, name, price, votes) VALUES
  (1, 'Chefchaouen, Morocco', '$750/person', 3),
  (1, 'Tbilisi, Georgia',     '$620/person', 5),
  (1, 'Kotor, Montenegro',    '$890/person', 2);

-- Board 2 — Accommodation Lisbon
INSERT INTO voting_options (board_id, name, price, votes) VALUES
  (2, 'Lisbon Serviced Apartment', '$65/night',  2),
  (2, 'Boutique Hotel Alfama',     '$110/night', 4),
  (2, 'Hostel LX Factory',         '$28/night',  1);

-- Board 3 — Food Rome
INSERT INTO voting_options (board_id, name, price, votes) VALUES
  (3, 'Trattoria da Enzo',         '$45/person', 4),
  (3, 'Roscioli',                  '$65/person', 6),
  (3, 'Supplì Roma (Street Food)', '$12/person', 3);

-- Board 4 — Kyoto Accommodation
INSERT INTO voting_options (board_id, name, price, votes) VALUES
  (4, 'Ryokan in Gion',            '$350/night', 3),
  (4, 'Modern Hotel Downtown',     '$200/night', 1),
  (4, 'Airbnb near Bamboo Forest', '$280/night', 0);

-- Board 5 — Amalfi Activity
INSERT INTO voting_options (board_id, name, price, votes) VALUES
  (5, 'Private Boat Tour',      '$120/pp',   5),
  (5, 'Pasta Cooking Class',    '$85/pp',    4),
  (5, 'Ravello Cliffside Hike', '$0 (free)', 2);

-- Board 6 — Balkans Transport
INSERT INTO voting_options (board_id, name, price, votes) VALUES
  (6, 'FlixBus Pass (7 days)',       '$89/person',  2),
  (6, 'Rent a Car & Share Costs',    '$45/day',     1),
  (6, 'Train Inter-Rail Youth Pass', '$120/person', 1);

-- Keep voting_options sequence in sync
SELECT setval('voting_options_id_seq', (SELECT MAX(id) FROM voting_options));

-- ==========================================
-- 3. LIVE VIBES
-- user_id NULL = anonymous seed rows.
-- Service role key bypasses RLS on insert;
-- SELECT policy (true) means everyone sees them.
-- ==========================================

INSERT INTO live_vibes (user_id, location, safety_score, sensory_status, message, tags) VALUES
  (NULL, 'Kotor Old Town, Montenegro',        9.1, 'Calm',     'Wandering the walls at sunrise — completely empty, totally magical. Felt very safe as a solo woman.',                                              ARRAY['Solo Female', 'Safe', 'Morning']),
  (NULL, 'Chefchaouen Medina, Morocco',       7.8, 'Moderate', 'Beautiful but busy around noon. Side streets are quieter. Locals very friendly.',                                                                  ARRAY['Culture', 'Moderate Crowds']),
  (NULL, 'Luang Prabang Night Market, Laos',  8.5, 'Lively',   'Night market buzzing tonight — great energy, not overwhelming. Grab the noodle soup!',                                                            ARRAY['Food', 'Nightlife', 'Budget']),
  (NULL, 'Tbilisi Sulfur Baths, Georgia',     9.0, 'Relaxed',  'Private bath booked for $15. Incredibly relaxing, staff very helpful. Highly recommend.',                                                          ARRAY['Wellness', 'Budget', 'Hidden Gem']),
  (NULL, 'Matera Sassi, Italy',               8.7, 'Quiet',    'Golden hour light on the cave houses — took 200 photos. Almost no one around at 6am.',                                                            ARRAY['Photography', 'Solo', 'Quiet']),
  (NULL, 'Trastevere, Rome',                  9.5, 'Quiet',    'Walking back to my hotel alone. Streets are well lit and busy enough to feel safe, but not overwhelming. Highly recommend for solo women!',        ARRAY['Solo Travel', 'Night Walk']),
  (NULL, 'Shibuya, Tokyo',                   10.0, 'Loud',     'Incredible energy but definitely a sensory overload near the crossing. Two blocks north has quiet cafes if you need a break.',                    ARRAY['Sensory Alert', 'Crowded']),
  (NULL, 'Bairro Alto, Lisbon',               8.0, 'Moderate', 'Fado night was incredible — small and intimate venues. Grab earplugs if you''re sensitive but don''t miss it. Streets outside are very walkable.', ARRAY['Nightlife', 'Music']),
  (NULL, 'Medina, Marrakech',                 7.5, 'Loud',     'Souks are a beautiful chaos — use the buddy system and keep your bag in front. Locals are incredibly kind when you step off the main drag.',       ARRAY['Market', 'Buddy Up']),
  (NULL, 'Prenzlauer Berg, Berlin',           9.8, 'Quiet',    'Sunday morning brunch vibes only. Super family-friendly, loads of cafes with oat milk. Zero stress to walk around solo here.',                     ARRAY['Solo Travel', 'Family Friendly']);