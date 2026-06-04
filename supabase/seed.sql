-- ==========================================
-- supabase/seed.sql
-- Run: supabase db reset (applies migrations + this seed)
-- ==========================================

-- ==========================================
-- 1. PLACES
-- ==========================================

INSERT INTO places (name, slug, category, sub_category, city, country, location, description, image_url, price_range, avg_cost_pp, best_time_of_day, safety_score, accessibility_score, sensory_score, tags, vibes) VALUES
  (
    'Kotor Old Town',
    'kotor-old-town', 'attraction', 'historic_site', 'Kotor', 'Montenegro',
    'Montenegro',
    'A walled medieval city on the Adriatic coast, far less crowded than Dubrovnik. Cobblestone streets, cat cafes, and stunning bay views.',
    'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&auto=format',
    '$800 - $1,200',
    15.00, ARRAY['morning', 'afternoon'],
    9.2, 7.5, 8.0,
    ARRAY['Hidden Gem', 'Safe', 'Historic'],
    ARRAY['history', 'calm']
  ),
  (
    'Matera',
    'matera-sassi', 'attraction', 'historic_site', 'Matera', 'Italy',
    'Italy',
    'Ancient cave city (Sassi) carved into rock — one of the oldest continuously inhabited settlements on Earth. Eerily beautiful at night.',
    'https://images.unsplash.com/photo-1533421644343-45b606a69f48?w=800&auto=format',
    '$900 - $1,400',
    25.00, ARRAY['morning', 'evening'],
    8.8, 6.5, 9.1,
    ARRAY['UNESCO', 'Quiet', 'Unique', 'Solo Friendly'],
    ARRAY['history', 'calm', 'hidden']
  ),
  (
    'Luang Prabang',
    'luang-prabang-temples', 'attraction', 'temple', 'Luang Prabang', 'Laos',
    'Laos',
    'Serene Buddhist temples, night markets, turquoise waterfalls, and monk alms-giving ceremonies. Minimal tourist crowds year-round.',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&auto=format',
    '$600 - $1,000',
    10.00, ARRAY['morning'],
    8.5, 7.0, 9.3,
    ARRAY['Spiritual', 'Budget', 'Nature', 'Solo Friendly'],
    ARRAY['calm', 'nature', 'arts']
  ),
  (
    'Gjirokastra',
    'gjirokastra-stone-city', 'attraction', 'historic_site', 'Gjirokastra', 'Albania',
    'Albania',
    'A UNESCO-listed Ottoman stone city perched in the mountains. Almost entirely undiscovered by mainstream tourism.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format',
    '$500 - $800',
    5.00, ARRAY['morning', 'afternoon'],
    8.0, 6.0, 9.5,
    ARRAY['Hidden Gem', 'Historic', 'Budget'],
    ARRAY['history', 'hidden']
  ),
  (
    'Chefchaouen',
    'chefchaouen-blue-city', 'attraction', 'neighborhood', 'Chefchaouen', 'Morocco',
    'Morocco',
    'The famous Blue City nestled in the Rif Mountains. Labyrinthine medina painted in every shade of blue — incredibly photogenic and calm.',
    'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&auto=format',
    '$700 - $1,100',
    12.00, ARRAY['morning', 'afternoon'],
    8.3, 6.8, 8.7,
    ARRAY['Scenic', 'Culture', 'Photography', 'Women Friendly'],
    ARRAY['arts', 'social']
  ),
  (
    'Tbilisi Old Town',
    'tbilisi-old-town', 'attraction', 'neighborhood', 'Tbilisi', 'Georgia',
    'Georgia',
    'Sulfur bathhouses, cliff-side churches, eclectic architecture mixing Persian, Russian, and European styles. Incredible food scene on a budget.',
    'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&auto=format',
    '$600 - $1,000',
    20.00, ARRAY['afternoon', 'evening'],
    8.6, 7.2, 8.4,
    ARRAY['Hidden Gem', 'Foodie', 'Architecture', 'Budget'],
    ARRAY['food', 'history', 'social']
  );

-- Initialize place_stats for the seeded places
INSERT INTO place_stats (place_id, trip_count, avg_rating)
SELECT id, floor(random() * 100), 4.5 FROM places;





-- ==========================================
-- supabase/seed.sql
-- ==========================================

-- ==========================================
-- 1. CITIES
-- ==========================================
INSERT INTO cities (name, country, country_code, lat, lng, timezone, currency, avg_daily_budget_low, avg_daily_budget_mid, avg_daily_budget_high, best_months, safety_score, is_active) VALUES
('Rome',  'Italy',     'IT', 41.9028, 12.4964, 'Europe/Rome',    'EUR', 80,  160, 350, ARRAY[3,4,5,9,10],   8.2, true),
('Tokyo', 'Japan',     'JP', 35.6762, 139.6503,'Asia/Tokyo',     'JPY', 70,  150, 400, ARRAY[3,4,10,11],    9.5, true),
('Bali',  'Indonesia', 'ID', -8.3405, 115.0920,'Asia/Makassar',  'IDR', 40,  90,  250, ARRAY[4,5,6,7,8,9],  7.8, true),
('Kotor', 'Montenegro','ME', 42.4247, 18.7712, 'Europe/Podgorica','EUR',50,  100, 200, ARRAY[5,6,9,10],     9.2, true),
('Tbilisi','Georgia',  'GE', 41.7151, 44.8271, 'Asia/Tbilisi',   'GEL',30,  70,  180, ARRAY[4,5,6,9,10],   8.6, true);

-- ==========================================
-- 2. PLACES — ROME
-- ==========================================
INSERT INTO places (name, slug, category, sub_category, city, country, location, address, description, image_url, price_tier, avg_cost_pp, avg_duration_mins, best_time_of_day, best_months, safety_score, accessibility_score, sensory_score, popularity_score, value_score, tags, vibes, lat, lng, is_active, is_verified) VALUES

-- Attractions
('Colosseum', 'colosseum-rome', 'attraction', 'ancient_site', 'Rome', 'Italy', 'Piazza del Colosseo, Rome', 'Piazza del Colosseo, 1', 'The iconic 2000-year-old amphitheater. Book early morning slots to beat crowds.', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format', 'mid', 18, 150, ARRAY['morning'], ARRAY[3,4,5,9,10], 8.5, 8.0, 6.0, 9.8, 7.5, ARRAY['history','ancient','iconic','rome'], ARRAY['history','arts'], 41.8902, 12.4922, true, true),

('Vatican Museums & Sistine Chapel', 'vatican-museums-rome', 'attraction', 'museum', 'Rome', 'Italy', 'Viale Vaticano, Rome', 'Viale Vaticano, 00165', 'World-class art collection culminating in Michelangelo''s Sistine Chapel ceiling. Pre-book to skip 3-hour queues.', 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&auto=format', 'mid', 20, 180, ARRAY['morning'], ARRAY[3,4,5,9,10], 9.0, 8.5, 5.0, 9.7, 7.0, ARRAY['history','art','museum','iconic'], ARRAY['history','arts'], 41.9065, 12.4536, true, true),

('Pantheon', 'pantheon-rome', 'attraction', 'ancient_site', 'Rome', 'Italy', 'Piazza della Rotonda, Rome', 'Piazza della Rotonda', 'The best-preserved ancient Roman building. The oculus lets in a shaft of light. Go early morning.', 'https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=800&auto=format', 'budget', 5, 60, ARRAY['morning'], ARRAY[3,4,5,9,10], 8.8, 9.0, 7.0, 9.2, 9.0, ARRAY['history','ancient','architecture'], ARRAY['history'], 41.8986, 12.4769, true, true),

('Borghese Gallery', 'borghese-gallery-rome', 'attraction', 'museum', 'Rome', 'Italy', 'Piazzale Scipione Borghese, Rome', 'Piazzale Scipione Borghese, 5', 'Intimate museum with Bernini sculptures and Caravaggio paintings. Only 360 visitors per 2hr slot — book weeks ahead.', 'https://images.unsplash.com/photo-1533421644343-45b606a69f48?w=800&auto=format', 'mid', 15, 120, ARRAY['morning','afternoon'], ARRAY[3,4,5,9,10], 9.5, 8.5, 8.5, 8.8, 8.5, ARRAY['art','museum','history','intimate'], ARRAY['arts','history'], 41.9143, 12.4921, true, true),

('Trastevere Neighborhood', 'trastevere-rome', 'attraction', 'neighborhood', 'Rome', 'Italy', 'Trastevere, Rome', 'Piazza di Santa Maria in Trastevere', 'Rome''s most charming neighborhood. Cobblestone streets, ivy-covered buildings, buzzing piazzas. Best at golden hour.', 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&auto=format', 'budget', 0, 120, ARRAY['afternoon','evening'], ARRAY[3,4,5,9,10,11], 9.2, 8.5, 7.5, 9.0, 10.0, ARRAY['neighborhood','romantic','walk','free'], ARRAY['social','history','nightlife'], 41.8896, 12.4697, true, true),

-- Hidden Gems
('Quartiere Coppedè', 'quartiere-coppede-rome', 'hidden_gem', 'neighborhood', 'Rome', 'Italy', 'Piazza Mincio, Rome', 'Piazza Mincio', 'A fairy-tale architectural district almost no tourists visit. Fantasy buildings mixing Art Nouveau, Gothic and Baroque.', 'https://images.unsplash.com/photo-1513622470522-26cb3c8d56b2?w=800&auto=format', 'budget', 0, 60, ARRAY['morning','afternoon'], ARRAY[3,4,5,9,10], 9.3, 8.0, 9.5, 6.2, 10.0, ARRAY['hidden','architecture','quiet','free'], ARRAY['hidden-gems','arts'], 41.9138, 12.5174, true, false),

('Testaccio Market', 'testaccio-market-rome', 'hidden_gem', 'market', 'Rome', 'Italy', 'Via Aldo Manuzio, Rome', 'Via Aldo Manuzio, 66B', 'Rome''s best local food market. Incredible street food stalls, cheap suppli and supplì. Tourists rarely venture here.', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&auto=format', 'budget', 12, 90, ARRAY['morning'], ARRAY[3,4,5,9,10,11], 8.8, 8.5, 7.0, 6.8, 9.5, ARRAY['food','market','local','hidden','budget'], ARRAY['food','hidden-gems','markets'], 41.8779, 12.4768, true, false),

('Pigneto District', 'pigneto-rome', 'hidden_gem', 'neighborhood', 'Rome', 'Italy', 'Via del Pigneto, Rome', 'Via del Pigneto', 'Rome''s hipster neighborhood — street art, independent bars, aperitivo culture. Zero tourists, pure local life.', 'https://images.unsplash.com/photo-1513622470522-26cb3c8d56b2?w=800&auto=format', 'budget', 15, 120, ARRAY['evening'], ARRAY[3,4,5,9,10,11], 8.2, 7.5, 7.5, 5.8, 9.0, ARRAY['nightlife','local','street-art','hidden'], ARRAY['nightlife','hidden-gems','social'], 41.8847, 12.5311, true, false),

('Centrale Montemartini', 'centrale-montemartini-rome', 'hidden_gem', 'museum', 'Rome', 'Italy', 'Via Ostiense 106, Rome', 'Via Ostiense, 106', 'Ancient sculptures displayed inside a decommissioned power plant. Surreal and spectacular — half the price of major museums.', 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&auto=format', 'budget', 8, 90, ARRAY['morning','afternoon'], ARRAY[3,4,5,9,10], 9.0, 8.0, 9.0, 5.5, 9.8, ARRAY['museum','hidden','art','history','unique'], ARRAY['arts','hidden-gems','history'], 41.8698, 12.4784, true, false),

-- Restaurants
('Roscioli', 'roscioli-rome', 'restaurant', 'trattoria', 'Rome', 'Italy', 'Via dei Giubbonari 21, Rome', 'Via dei Giubbonari, 21', 'The best carbonara in Rome. Also an incredible deli. Book weeks in advance — worth every effort.', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format', 'mid', 35, 90, ARRAY['afternoon','evening'], ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 9.5, 8.5, 8.0, 9.5, 8.0, ARRAY['food','pasta','roman','classic','must-try'], ARRAY['food'], 41.8940, 12.4730, true, true),

('Da Enzo al 29', 'da-enzo-rome', 'restaurant', 'trattoria', 'Rome', 'Italy', 'Via dei Vascellari 29, Trastevere', 'Via dei Vascellari, 29', 'A tiny Trastevere gem. Cash only, no reservations, arrive early. Authentic cacio e pepe that locals queue for.', 'https://images.unsplash.com/photo-1537047902298-e05b62a03d42?w=800&auto=format', 'budget', 22, 75, ARRAY['afternoon','evening'], ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 9.2, 7.5, 8.5, 8.8, 9.5, ARRAY['food','pasta','local','cash-only','authentic'], ARRAY['food','hidden-gems'], 41.8886, 12.4683, true, false),

('Supplì Roma', 'suppli-roma', 'restaurant', 'street_food', 'Rome', 'Italy', 'Via di San Francesco a Ripa 137', 'Via di San Francesco a Ripa, 137', 'The definitive Roman street food: deep-fried risotto balls with ragù and mozzarella. Quick, cheap, incredible.', 'https://images.unsplash.com/photo-1495474472205-c711ccb39446?w=800&auto=format', 'budget', 6, 20, ARRAY['morning','afternoon'], ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 9.0, 8.0, 8.0, 8.2, 10.0, ARRAY['street-food','budget','fast','roman','snack'], ARRAY['food','markets'], 41.8893, 12.4700, true, false),

('Coromandel', 'coromandel-rome', 'restaurant', 'cafe', 'Rome', 'Italy', 'Via del Monte Giordano 60', 'Via del Monte Giordano, 60', 'Excellent brunch cafe in the centro storico. Great coffee, eggs, avocado toast done right. Popular with locals.', 'https://images.unsplash.com/photo-1495474472205-c711ccb39446?w=800&auto=format', 'mid', 18, 60, ARRAY['morning'], ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 9.3, 9.0, 8.5, 7.5, 8.5, ARRAY['cafe','brunch','coffee','morning'], ARRAY['food','wellness'], 41.8994, 12.4718, true, false),

-- Stays
('Hotel Campo Marzio', 'hotel-campo-marzio-rome', 'stay', 'boutique_hotel', 'Rome', 'Italy', 'Via di Campo Marzio, Rome', 'Via di Campo Marzio, 7', 'Elegant boutique hotel in the heart of historic Rome. Walking distance to Pantheon and Piazza Navona.', 'https://images.unsplash.com/photo-1542314831-c53cd4b85ca4?w=800&auto=format', 'mid', 130, 0, NULL, NULL, 9.5, 9.0, 9.0, 8.5, 7.5, ARRAY['boutique','central','historic','safe'], ARRAY['wellness'], 41.9002, 12.4757, true, true),

('Boutique Trastevere', 'boutique-trastevere-rome', 'stay', 'boutique_hotel', 'Rome', 'Italy', 'Via della Lungaretta, Trastevere', 'Via della Lungaretta, 15', 'Charming hotel in Trastevere. Perfect for nightlife access and authentic neighborhood feel.', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format', 'mid', 95, 0, NULL, NULL, 9.2, 8.0, 8.5, 7.8, 8.5, ARRAY['boutique','trastevere','value','nightlife'], ARRAY['social'], 41.8896, 12.4697, true, false),

('The Beehive Hostel', 'beehive-hostel-rome', 'stay', 'hostel', 'Rome', 'Italy', 'Via Marghera 8, Rome', 'Via Marghera, 8', 'Rome''s best social hostel near Termini. Rooftop garden, great community vibe, female-only dorms available.', 'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&auto=format', 'budget', 35, 0, NULL, NULL, 8.8, 8.5, 8.0, 7.2, 9.5, ARRAY['hostel','budget','social','female-friendly','rooftop'], ARRAY['social'], 41.9009, 12.5009, true, false),

-- Activities
('Roman Cooking Class', 'roman-cooking-class', 'activity', 'cooking', 'Rome', 'Italy', 'Trastevere, Rome', 'Via della Lungara, 10', 'Learn to make pasta, tiramisu, and pizza from a Roman home cook. Small groups, includes market visit.', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format', 'mid', 65, 180, ARRAY['morning','afternoon'], ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 9.8, 9.0, 9.0, 8.0, 8.5, ARRAY['food','cooking','experience','hands-on','social'], ARRAY['food','social'], 41.8893, 12.4680, true, false),

('Bike Tour of Ancient Rome', 'bike-tour-ancient-rome', 'activity', 'tour', 'Rome', 'Italy', 'Appian Way, Rome', 'Via Appia Antica', 'Cycle along the ancient Appian Way past catacombs, ruins and countryside. Best way to see ancient Rome without crowds.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format', 'mid', 40, 180, ARRAY['morning'], ARRAY[3,4,5,9,10], 8.5, 7.0, 9.0, 7.5, 9.0, ARRAY['outdoor','cycling','history','appian-way','active'], ARRAY['adventure','history'], 41.8464, 12.5120, true, false);

-- ==========================================
-- 3. PLACES — TOKYO
-- ==========================================
INSERT INTO places (name, slug, category, sub_category, city, country, location, address, description, image_url, price_tier, avg_cost_pp, avg_duration_mins, best_time_of_day, best_months, safety_score, accessibility_score, sensory_score, popularity_score, value_score, tags, vibes, lat, lng, is_active, is_verified) VALUES

('Senso-ji Temple', 'sensoji-temple-tokyo', 'attraction', 'temple', 'Tokyo', 'Japan', 'Asakusa, Tokyo', '2-3-1 Asakusa, Taito', 'Tokyo''s oldest temple. The Thunder Gate and five-story pagoda are iconic. Go at 6am before the crowds arrive.', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format', 'budget', 0, 90, ARRAY['morning'], ARRAY[3,4,10,11], 9.8, 9.0, 7.0, 9.6, 10.0, ARRAY['temple','history','iconic','free','japan'], ARRAY['history','arts'], 35.7148, 139.7967, true, true),

('Shinjuku Gyoen Garden', 'shinjuku-gyoen-tokyo', 'attraction', 'park', 'Tokyo', 'Japan', 'Shinjuku, Tokyo', '11 Naitomachi, Shinjuku', 'A massive formal garden combining French, English and Japanese garden styles. Perfect cherry blossoms in spring.', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&auto=format', 'budget', 4, 120, ARRAY['morning','afternoon'], ARRAY[3,4,10,11], 9.9, 9.5, 9.5, 8.8, 9.5, ARRAY['nature','garden','peaceful','sakura','walk'], ARRAY['nature','wellness'], 35.6851, 139.7100, true, true),

('Shibuya Crossing & District', 'shibuya-crossing-tokyo', 'attraction', 'neighborhood', 'Tokyo', 'Japan', 'Shibuya, Tokyo', 'Shibuya Scramble Crossing', 'The world''s busiest pedestrian crossing. Sensory overload in the best possible way. View it from Starbucks above.', 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format', 'budget', 0, 60, ARRAY['afternoon','evening'], ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 9.5, 9.5, 3.0, 9.4, 10.0, ARRAY['iconic','crossing','neon','shopping','people-watching'], ARRAY['social','nightlife'], 35.6595, 139.7004, true, true),

('teamLab Planets', 'teamlab-planets-tokyo', 'attraction', 'art_installation', 'Tokyo', 'Japan', 'Toyosu, Tokyo', '6-1-16 Toyosu, Koto', 'Immersive digital art you walk through — rooms of floating flowers, infinite mirrors, and light. Book weeks ahead.', 'https://images.unsplash.com/photo-1533421644343-45b606a69f48?w=800&auto=format', 'mid', 32, 90, ARRAY['afternoon','evening'], ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 9.9, 8.5, 6.0, 9.1, 8.0, ARRAY['art','digital','immersive','unique','instagram'], ARRAY['arts','adventure'], 35.6448, 139.7950, true, true),

('Yanaka Ginza', 'yanaka-ginza-tokyo', 'hidden_gem', 'neighborhood', 'Tokyo', 'Japan', 'Yanaka, Tokyo', 'Yanaka Ginza Shopping Street', 'A preserved Showa-era shopping street that survived WWII. Cats everywhere, indie shops, incredible snacks. Zero tourists.', 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&auto=format', 'budget', 8, 90, ARRAY['morning','afternoon'], ARRAY[3,4,10,11], 9.9, 8.5, 9.0, 6.2, 9.8, ARRAY['hidden','local','cats','showa','shopping','authentic'], ARRAY['hidden-gems','markets','history'], 35.7256, 139.7663, true, false),

('Shimokitazawa', 'shimokitazawa-tokyo', 'hidden_gem', 'neighborhood', 'Tokyo', 'Japan', 'Shimokitazawa, Setagaya', 'Shimokitazawa Station Area', 'Tokyo''s bohemian village. Vintage clothing, jazz bars, indie theatre, curry shops. Where young Tokyo actually hangs out.', 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format', 'budget', 15, 120, ARRAY['afternoon','evening'], ARRAY[3,4,10,11], 9.8, 8.0, 8.5, 6.5, 9.5, ARRAY['hidden','vintage','jazz','indie','local','nightlife'], ARRAY['nightlife','hidden-gems','social'], 35.6614, 139.6672, true, false),

('Tsukiji Outer Market', 'tsukiji-outer-market-tokyo', 'hidden_gem', 'market', 'Tokyo', 'Japan', 'Tsukiji, Chuo', '4-16-2 Tsukiji, Chuo', 'The world-famous fish market outer section stays open. Best tamagoyaki, fresh sushi and street seafood in the city.', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&auto=format', 'budget', 20, 90, ARRAY['morning'], ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 9.8, 9.0, 7.5, 8.5, 9.0, ARRAY['food','market','sushi','seafood','morning','local'], ARRAY['food','markets','hidden-gems'], 35.6654, 139.7707, true, false),

('Ichiran Ramen', 'ichiran-ramen-tokyo', 'restaurant', 'ramen', 'Tokyo', 'Japan', 'Multiple locations, Tokyo', 'Shibuya, Tokyo', 'Solo dining booths, intensely personal ramen experience. Adjust richness, spice, noodle firmness. A Tokyo institution.', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format', 'budget', 12, 45, ARRAY['afternoon','evening'], ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 9.9, 9.0, 9.0, 9.2, 9.5, ARRAY['food','ramen','solo','japanese','budget','solo-friendly'], ARRAY['food','wellness'], 35.6595, 139.7004, true, true),

('Sushi Dai', 'sushi-dai-tokyo', 'restaurant', 'sushi', 'Tokyo', 'Japan', 'Toyosu Market, Tokyo', 'Toyosu Market, Koto', 'Legendary counter sushi at Toyosu Market. Queue from 4am for the breakfast omakase at $30. Worth every minute.', 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&auto=format', 'budget', 30, 60, ARRAY['morning'], ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 9.8, 7.5, 9.0, 8.8, 9.8, ARRAY['food','sushi','breakfast','omakase','queue-worth-it'], ARRAY['food','hidden-gems'], 35.6448, 139.7950, true, false),

('Kissa Tanto', 'kissa-tanto-tokyo', 'restaurant', 'cafe', 'Tokyo', 'Japan', 'Shibuya, Tokyo', 'Shibuya Stream, Tokyo', 'A perfect Japanese-style kissaten (old-school coffee shop). Thick toast, hand-drip coffee, total calm inside the city chaos.', 'https://images.unsplash.com/photo-1495474472205-c711ccb39446?w=800&auto=format', 'budget', 10, 60, ARRAY['morning','afternoon'], ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 9.9, 9.0, 10.0, 7.2, 9.8, ARRAY['cafe','coffee','quiet','japanese','calm'], ARRAY['wellness','hidden-gems'], 35.6595, 139.7004, true, false),

('Capsule Hotel Anshin Oyado', 'capsule-hotel-anshin-tokyo', 'stay', 'capsule_hotel', 'Tokyo', 'Japan', 'Shinjuku, Tokyo', '7-10-10 Nishishinjuku, Shinjuku', 'Premium capsule hotel with female-only floors. Sauna, spa, great facilities. The authentic Tokyo experience at a fraction of cost.', 'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&auto=format', 'budget', 45, 0, NULL, NULL, 9.9, 9.5, 8.5, 8.0, 9.5, ARRAY['capsule','budget','female-friendly','sauna','japanese','unique'], ARRAY['wellness','adventure'], 35.6938, 139.6917, true, false),

('Shinjuku Granbell Hotel', 'granbell-hotel-tokyo', 'stay', 'boutique_hotel', 'Tokyo', 'Japan', 'Shinjuku, Tokyo', '2-14-5 Kabukicho, Shinjuku', 'Stylish boutique hotel with rooftop bar in the heart of Shinjuku. Modern design, excellent location.', 'https://images.unsplash.com/photo-1542314831-c53cd4b85ca4?w=800&auto=format', 'mid', 120, 0, NULL, NULL, 9.8, 9.5, 8.0, 8.2, 8.0, ARRAY['boutique','shinjuku','rooftop','modern','central'], ARRAY['social'], 35.6938, 139.7034, true, false),

('Tsukiji Fish Market Morning Tour', 'tsukiji-morning-tour-tokyo', 'activity', 'tour', 'Tokyo', 'Japan', 'Tsukiji, Tokyo', 'Tsukiji Outer Market', 'Guided early morning tour of Tsukiji market followed by a sushi breakfast. Includes tuna auction viewing.', 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&auto=format', 'mid', 55, 180, ARRAY['morning'], ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 9.8, 8.5, 7.5, 7.8, 8.5, ARRAY['food','market','tour','morning','sushi','experience'], ARRAY['food','adventure'], 35.6654, 139.7707, true, false),

('Tokyo Cooking Class — Ramen & Gyoza', 'tokyo-cooking-class', 'activity', 'cooking', 'Tokyo', 'Japan', 'Shibuya, Tokyo', 'Shibuya, Tokyo', 'Make ramen from scratch with a local chef. Small group, includes sake tasting, take recipe home.', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format', 'mid', 60, 150, ARRAY['afternoon'], ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 9.9, 9.0, 9.0, 7.5, 8.8, ARRAY['food','cooking','class','experience','social','hands-on'], ARRAY['food','social'], 35.6595, 139.7004, true, false);

-- ==========================================
-- 4. PLACES — BALI
-- ==========================================
INSERT INTO places (name, slug, category, sub_category, city, country, location, address, description, image_url, price_tier, avg_cost_pp, avg_duration_mins, best_time_of_day, best_months, safety_score, accessibility_score, sensory_score, popularity_score, value_score, tags, vibes, lat, lng, is_active, is_verified) VALUES

('Tegallalang Rice Terraces', 'tegallalang-rice-terraces-bali', 'attraction', 'nature', 'Bali', 'Indonesia', 'Tegallalang, Ubud', 'Jalan Raya Tegallalang, Ubud', 'UNESCO-listed rice terraces with dramatic drops and emerald green fields. Visit at 7am before tour buses arrive.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format', 'budget', 3, 90, ARRAY['morning'], ARRAY[4,5,6,7,8,9], 8.0, 6.5, 9.5, 9.0, 9.5, ARRAY['nature','rice-terraces','iconic','photography','bali'], ARRAY['nature','adventure'], -8.4313, 115.2789, true, true),

('Uluwatu Temple', 'uluwatu-temple-bali', 'attraction', 'temple', 'Bali', 'Indonesia', 'Uluwatu, Bali', 'Jalan Raya Uluwatu', 'Clifftop temple with dramatic 70m ocean drops. Kecak fire dance at sunset is extraordinary. Watch monkeys.', 'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&auto=format', 'budget', 4, 120, ARRAY['afternoon','evening'], ARRAY[4,5,6,7,8,9], 7.5, 6.0, 8.5, 9.2, 9.5, ARRAY['temple','sunset','cliff','kecak-dance','ocean'], ARRAY['history','arts','adventure'], -8.8291, 115.0849, true, true),

('Campuhan Ridge Walk', 'campuhan-ridge-walk-bali', 'hidden_gem', 'nature', 'Bali', 'Indonesia', 'Ubud, Bali', 'Jalan Raya Campuhan, Ubud', 'A free 9km ridge walk through tropical jungle and rice paddies. Do it at sunrise for mist and silence. No tourists.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format', 'budget', 0, 120, ARRAY['morning'], ARRAY[4,5,6,7,8,9], 8.5, 6.0, 10.0, 6.8, 10.0, ARRAY['hiking','free','sunrise','nature','quiet','hidden'], ARRAY['nature','wellness','hidden-gems','adventure'], -8.5068, 115.2527, true, false),

('Warung Babi Guling Ibu Oka', 'babi-guling-ibu-oka-bali', 'restaurant', 'warung', 'Bali', 'Indonesia', 'Jalan Tegal Sari, Ubud', 'Jalan Tegal Sari 2, Ubud', 'The most famous suckling pig in Bali. Anthony Bourdain came here twice. Arrive at 11am — sold out by noon.', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format', 'budget', 5, 45, ARRAY['morning','afternoon'], ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 8.5, 8.0, 8.0, 9.0, 10.0, ARRAY['food','babi-guling','pork','local','budget','iconic'], ARRAY['food','hidden-gems'], -8.5069, 115.2624, true, true),

('Naughty Nuri''s Warung', 'naughty-nuris-bali', 'restaurant', 'warung', 'Bali', 'Indonesia', 'Jalan Raya Sanggingan, Ubud', 'Jalan Raya Sanggingan, Ubud', 'Famous for legendary BBQ pork ribs and potent martinis. Cash only, picnic tables, incredibly fun atmosphere.', 'https://images.unsplash.com/photo-1537047902298-e05b62a03d42?w=800&auto=format', 'budget', 12, 90, ARRAY['afternoon','evening'], ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 8.0, 7.0, 7.5, 8.5, 9.5, ARRAY['food','bbq','ribs','martini','fun','cash-only'], ARRAY['food','social','nightlife'], -8.4959, 115.2484, true, false),

('Puri Wisata Bungalows', 'puri-wisata-bali', 'stay', 'guesthouse', 'Bali', 'Indonesia', 'Ubud, Bali', 'Jalan Kajeng 24, Ubud', 'Family-run guesthouse in central Ubud with rice paddy views. Included breakfast, beautiful garden, exceptional value.', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format', 'budget', 28, 0, NULL, NULL, 8.5, 7.5, 9.5, 7.5, 10.0, ARRAY['guesthouse','budget','ubud','rice-paddy','breakfast-included','value'], ARRAY['wellness','nature'], -8.5069, 115.2624, true, false),

('Alaya Resort Ubud', 'alaya-resort-ubud-bali', 'stay', 'resort', 'Bali', 'Indonesia', 'Ubud, Bali', 'Jalan Hanoman, Ubud', 'Stunning boutique resort with infinity pool over the jungle. Perfect balance of luxury and authenticity.', 'https://images.unsplash.com/photo-1542314831-c53cd4b85ca4?w=800&auto=format', 'luxury', 180, 0, NULL, NULL, 9.0, 8.5, 9.8, 8.8, 8.0, ARRAY['resort','luxury','pool','jungle','romantic','infinity-pool'], ARRAY['wellness','social'], -8.5195, 115.2637, true, true),

('Bali Yoga & Meditation Retreat', 'bali-yoga-meditation', 'activity', 'wellness', 'Bali', 'Indonesia', 'Ubud, Bali', 'Jalan Kajeng, Ubud', 'Morning yoga and meditation session in an open-air jungle shala. Ends with healthy breakfast. Perfect hangover cure.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format', 'budget', 18, 120, ARRAY['morning'], ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 9.5, 8.0, 10.0, 7.8, 9.5, ARRAY['yoga','meditation','wellness','morning','healthy','jungle'], ARRAY['wellness','nature'], -8.5069, 115.2624, true, false),

('Balinese Cooking Class', 'balinese-cooking-class-ubud', 'activity', 'cooking', 'Bali', 'Indonesia', 'Ubud, Bali', 'Jalan Suweta, Ubud', 'Morning market visit then cook 8 Balinese dishes. Learn about spices and techniques. Consistently rated Bali''s top activity.', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format', 'budget', 35, 240, ARRAY['morning'], ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 9.2, 8.5, 9.0, 9.0, 9.5, ARRAY['cooking','class','food','morning','market','experience'], ARRAY['food','social','markets'], -8.5069, 115.2624, true, true),

('Mount Batur Sunrise Trek', 'mount-batur-sunrise-trek-bali', 'activity', 'trekking', 'Bali', 'Indonesia', 'Kintamani, Bali', 'Mount Batur, Kintamani', 'Active volcano sunrise trek. Leave at 2am, reach summit at sunrise, look over a caldera lake. Life-changing views.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format', 'budget', 45, 360, ARRAY['morning'], ARRAY[4,5,6,7,8,9], 7.5, 4.0, 10.0, 8.8, 9.0, ARRAY['hiking','volcano','sunrise','adventure','trekking','active'], ARRAY['adventure','nature'], -8.2423, 115.3751, true, true);

-- ==========================================
-- 5. KEEP EXISTING PLACES (from original seed)
-- Already inserted by previous seed.sql run.
-- If running fresh, uncomment:
-- ==========================================
-- (The 6 original places: Kotor, Matera, Luang Prabang, Gjirokastra, Chefchaouen, Tbilisi)
-- are included in the original seed.sql — keep running both files.

-- ==========================================
-- 6. PLACE STATS
-- ==========================================
INSERT INTO place_stats (place_id, view_count, save_count, trip_count, review_count, avg_rating)
SELECT
  id,
  (popularity_score * 80 + 20)::INTEGER,
  (popularity_score * 40 + 10)::INTEGER,
  (popularity_score * 50 + 5)::INTEGER,
  (popularity_score * 15 + 2)::INTEGER,
  LEAST(5.0, 3.5 + (popularity_score / 10.0) * 1.5)
FROM places
ON CONFLICT (place_id) DO UPDATE SET
  view_count   = EXCLUDED.view_count,
  save_count   = EXCLUDED.save_count,
  trip_count   = EXCLUDED.trip_count,
  review_count = EXCLUDED.review_count,
  avg_rating   = EXCLUDED.avg_rating;

-- ==========================================
-- 7. TRIP TEMPLATES
-- ==========================================
INSERT INTO trip_templates (city_id, title, days, pace, budget_tier, tags, use_count, is_featured)
SELECT c.id, '5 Days in Rome — History & Food',        5, 'balanced', 'mid',    ARRAY['history','food','hidden-gems'], 1240, true  FROM cities c WHERE c.name = 'Rome'
UNION ALL
SELECT c.id, 'Tokyo in 7 Days — Culture & Food',       7, 'packed',   'mid',    ARRAY['food','arts','nightlife'],      980,  true  FROM cities c WHERE c.name = 'Tokyo'
UNION ALL
SELECT c.id, 'Bali Slow Retreat — 10 Days',            10,'relaxed',  'budget', ARRAY['beach','wellness','nature'],    754,  true  FROM cities c WHERE c.name = 'Bali'
UNION ALL
SELECT c.id, 'Rome Weekend — Best of 3 Days',          3, 'packed',   'mid',    ARRAY['history','food'],               632,  true  FROM cities c WHERE c.name = 'Rome'
UNION ALL
SELECT c.id, 'Tokyo Budget Week',                      7, 'balanced', 'budget', ARRAY['food','hidden-gems','markets'], 510,  true  FROM cities c WHERE c.name = 'Tokyo'
UNION ALL
SELECT c.id, 'Bali Luxury Escape — 7 Days',            7, 'relaxed',  'luxury', ARRAY['wellness','beach','food'],      420,  true  FROM cities c WHERE c.name = 'Bali';

-- ==========================================
-- 8. PLACE INSIGHTS (Tips + Safety Notes)
-- ==========================================
INSERT INTO place_insights (place_id, user_id, type, title, body, helpful_count)
SELECT p.id, NULL::uuid, 'tip', 'Best time to visit', 'Arrive at opening time — 30 mins makes the difference between peaceful and packed.', 42
FROM places p WHERE p.slug = 'colosseum-rome'
UNION ALL
SELECT p.id, NULL::uuid, 'safety_note', 'Watch for pickpockets', 'Pickpockets work in groups near the metro entrance. Keep bags zipped and in front at all times.', 38
FROM places p WHERE p.slug = 'colosseum-rome'
UNION ALL
SELECT p.id, NULL::uuid, 'tip', 'Book weeks ahead', 'Vatican gets 6 million visitors a year. Book online 3–4 weeks in advance or face 3-hour queues.', 55
FROM places p WHERE p.slug = 'vatican-museums-rome'
UNION ALL
SELECT p.id, NULL::uuid, 'tip', 'Cash only', 'Da Enzo is cash only and takes no reservations. Arrive at 12:30pm sharp to get a table.', 31
FROM places p WHERE p.slug = 'da-enzo-rome'
UNION ALL
SELECT p.id, NULL::uuid, 'tip', 'Arrive before 11am', 'Babi Guling sells out by noon every day without exception. Get there at 11am.', 48
FROM places p WHERE p.slug = 'babi-guling-ibu-oka-bali'
UNION ALL
SELECT p.id, NULL::uuid, 'safety_note', 'Monkey warning', 'The monkeys at Uluwatu will steal sunglasses, food, and phones. Keep everything secured in a bag.', 62
FROM places p WHERE p.slug = 'uluwatu-temple-bali'
UNION ALL
SELECT p.id, NULL::uuid, 'tip', '6am is magical', 'The crossing at 6am has interesting light and manageable crowds. By 6pm it is pure sensory overload — plan accordingly.', 29
FROM places p WHERE p.slug = 'shibuya-crossing-tokyo'
UNION ALL
SELECT p.id, NULL::uuid, 'tip', 'Sunrise is everything', 'Leave Ubud at 3am. At summit by 6am. Clouds usually clear by 6:30am. Bring warm layers — it gets cold at 1717m.', 44
FROM places p WHERE p.slug = 'mount-batur-sunrise-trek-bali';

-- ==========================================
-- 9. PLACE FAQS
-- ==========================================
INSERT INTO place_faqs (place_id, question, answer, sort_order)
SELECT p.id, 'Do I need to book in advance?', 'Yes — book at least 2–3 weeks ahead online to skip long queues.', 1
FROM places p WHERE p.slug = 'colosseum-rome'
UNION ALL
SELECT p.id, 'Is it accessible?', 'Partially — the main arena floor is accessible but underground areas require stairs.', 2
FROM places p WHERE p.slug = 'colosseum-rome'
UNION ALL
SELECT p.id, 'What should I wear?', 'Shoulders and knees must be covered to enter. Scarves available at entrance for a small fee.', 1
FROM places p WHERE p.slug = 'vatican-museums-rome';