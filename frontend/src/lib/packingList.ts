// frontend/src/data/packingList.ts
// Comprehensive packing list database for auto-suggestion
// Each item has: id, name, category, tags (for smart filtering), weight class, essential flag

export interface PackingItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  tags: string[];       // used for smart filtering by trip type
  essential: boolean;   // always suggested regardless of trip type
  tripTypes: string[];  // 'beach' | 'mountain' | 'city' | 'business' | 'camping' | 'winter' | 'tropical' | 'backpacking' | 'family' | 'cruise'
}

export const CATEGORIES = [
  'Documents & Money',
  'Clothing — Tops',
  'Clothing — Bottoms',
  'Clothing — Outerwear',
  'Clothing — Footwear',
  'Clothing — Accessories',
  'Clothing — Sleepwear & Underwear',
  'Toiletries & Grooming',
  'Skincare & Sun Protection',
  'Health & Medicine',
  'Electronics & Gadgets',
  'Cables & Power',
  'Bags & Packing',
  'Sleep & Comfort',
  'Food & Drink',
  'Safety & Security',
  'Navigation & Outdoors',
  'Fitness & Sports',
  'Beach & Water',
  'Winter & Snow',
  'Baby & Kids',
  'Pet Travel',
  'Work & Business',
  'Photography',
  'Entertainment & Reading',
  'Laundry & Clothing Care',
  'Miscellaneous',
] as const;

export const PACKING_ITEMS: PackingItem[] = [

  // ─────────────────────────────────────────────
  // DOCUMENTS & MONEY
  // ─────────────────────────────────────────────
  { id: 'doc-001', name: 'Passport', category: 'Documents & Money', tags: ['identity', 'international'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'doc-002', name: 'Visa', category: 'Documents & Money', tags: ['identity', 'international'], essential: false, tripTypes: ['beach', 'city', 'business', 'tropical', 'backpacking', 'cruise'] },
  { id: 'doc-003', name: 'National ID / Driver\'s License', category: 'Documents & Money', tags: ['identity'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'doc-004', name: 'Travel Insurance Documents', category: 'Documents & Money', tags: ['insurance', 'safety'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'doc-005', name: 'Flight Tickets / Boarding Passes', category: 'Documents & Money', tags: ['transport'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'doc-006', name: 'Hotel Booking Confirmations', category: 'Documents & Money', tags: ['accommodation'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'winter', 'tropical', 'family', 'cruise'] },
  { id: 'doc-007', name: 'Cash (Local Currency)', category: 'Documents & Money', tags: ['money'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'doc-008', name: 'Credit / Debit Cards', category: 'Documents & Money', tags: ['money'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'doc-009', name: 'Travel Wallet / Card Holder', category: 'Documents & Money', tags: ['money', 'organisation'], essential: false, tripTypes: ['city', 'business', 'backpacking', 'family'] },
  { id: 'doc-010', name: 'Vaccination Certificate / Yellow Card', category: 'Documents & Money', tags: ['health', 'international'], essential: false, tripTypes: ['tropical', 'backpacking'] },
  { id: 'doc-011', name: 'International Driving Permit', category: 'Documents & Money', tags: ['transport', 'driving'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking', 'family'] },
  { id: 'doc-012', name: 'Emergency Contact Card', category: 'Documents & Money', tags: ['safety', 'emergency'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'doc-013', name: 'Photocopies of All Documents', category: 'Documents & Money', tags: ['safety', 'backup'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'doc-014', name: 'Travel Itinerary Printout', category: 'Documents & Money', tags: ['planning'], essential: false, tripTypes: ['city', 'business', 'family', 'cruise'] },
  { id: 'doc-015', name: 'Student / Senior Discount Card', category: 'Documents & Money', tags: ['discount'], essential: false, tripTypes: ['city', 'backpacking', 'family'] },
  { id: 'doc-016', name: 'Frequent Flyer / Loyalty Cards', category: 'Documents & Money', tags: ['rewards'], essential: false, tripTypes: ['business', 'city'] },
  { id: 'doc-017', name: 'Foreign Currency Exchange Receipt', category: 'Documents & Money', tags: ['money'], essential: false, tripTypes: ['backpacking', 'tropical'] },
  { id: 'doc-018', name: 'Cruise Boarding Card', category: 'Documents & Money', tags: ['transport', 'cruise'], essential: false, tripTypes: ['cruise'] },

  // ─────────────────────────────────────────────
  // CLOTHING — TOPS
  // ─────────────────────────────────────────────
  { id: 'top-001', name: 'T-Shirts', category: 'Clothing — Tops', tags: ['casual', 'layering'], essential: true, tripTypes: ['beach', 'city', 'camping', 'tropical', 'backpacking', 'family'] },
  { id: 'top-002', name: 'Polo Shirts', category: 'Clothing — Tops', tags: ['smart casual'], essential: false, tripTypes: ['city', 'business', 'cruise'] },
  { id: 'top-003', name: 'Dress Shirts / Blouses', category: 'Clothing — Tops', tags: ['formal', 'smart'], essential: false, tripTypes: ['business', 'city', 'cruise'] },
  { id: 'top-004', name: 'Tank Tops / Vests', category: 'Clothing — Tops', tags: ['beach', 'heat', 'layering'], essential: false, tripTypes: ['beach', 'tropical'] },
  { id: 'top-005', name: 'Long Sleeve Shirts', category: 'Clothing — Tops', tags: ['layering', 'sun protection'], essential: false, tripTypes: ['mountain', 'camping', 'winter', 'backpacking'] },
  { id: 'top-006', name: 'Thermal Base Layer Top', category: 'Clothing — Tops', tags: ['warmth', 'layering'], essential: false, tripTypes: ['mountain', 'winter', 'camping'] },
  { id: 'top-007', name: 'Fleece / Midlayer Top', category: 'Clothing — Tops', tags: ['warmth', 'layering'], essential: false, tripTypes: ['mountain', 'winter', 'camping'] },
  { id: 'top-008', name: 'Hoodie / Sweatshirt', category: 'Clothing — Tops', tags: ['casual', 'warmth'], essential: false, tripTypes: ['city', 'mountain', 'camping', 'backpacking', 'family'] },
  { id: 'top-009', name: 'Sports / Workout Top', category: 'Clothing — Tops', tags: ['fitness', 'active'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'top-010', name: 'Swimsuit Top / Bikini Top', category: 'Clothing — Tops', tags: ['beach', 'water'], essential: false, tripTypes: ['beach', 'tropical', 'cruise'] },
  { id: 'top-011', name: 'Rash Guard / UV Shirt', category: 'Clothing — Tops', tags: ['beach', 'sun protection'], essential: false, tripTypes: ['beach', 'tropical'] },
  { id: 'top-012', name: 'Smart Casual Top', category: 'Clothing — Tops', tags: ['dinner', 'evening'], essential: false, tripTypes: ['city', 'cruise', 'business'] },

  // ─────────────────────────────────────────────
  // CLOTHING — BOTTOMS
  // ─────────────────────────────────────────────
  { id: 'bot-001', name: 'Jeans', category: 'Clothing — Bottoms', tags: ['casual', 'versatile'], essential: false, tripTypes: ['city', 'backpacking', 'family'] },
  { id: 'bot-002', name: 'Chinos / Trousers', category: 'Clothing — Bottoms', tags: ['smart casual', 'business'], essential: false, tripTypes: ['business', 'city', 'cruise'] },
  { id: 'bot-003', name: 'Shorts', category: 'Clothing — Bottoms', tags: ['casual', 'heat'], essential: false, tripTypes: ['beach', 'city', 'tropical', 'backpacking', 'family'] },
  { id: 'bot-004', name: 'Swim Shorts / Trunks', category: 'Clothing — Bottoms', tags: ['beach', 'water'], essential: false, tripTypes: ['beach', 'tropical', 'cruise'] },
  { id: 'bot-005', name: 'Leggings / Yoga Pants', category: 'Clothing — Bottoms', tags: ['comfort', 'active', 'layering'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking', 'family'] },
  { id: 'bot-006', name: 'Hiking Pants', category: 'Clothing — Bottoms', tags: ['outdoor', 'active'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'bot-007', name: 'Thermal Base Layer Bottoms', category: 'Clothing — Bottoms', tags: ['warmth', 'layering'], essential: false, tripTypes: ['mountain', 'winter'] },
  { id: 'bot-008', name: 'Skirt / Dress', category: 'Clothing — Bottoms', tags: ['feminine', 'versatile'], essential: false, tripTypes: ['beach', 'city', 'tropical', 'cruise'] },
  { id: 'bot-009', name: 'Joggers / Sweatpants', category: 'Clothing — Bottoms', tags: ['comfort', 'travel day'], essential: false, tripTypes: ['city', 'backpacking', 'family'] },
  { id: 'bot-010', name: 'Formal Trousers / Suit Pants', category: 'Clothing — Bottoms', tags: ['formal', 'business'], essential: false, tripTypes: ['business', 'cruise'] },
  { id: 'bot-011', name: 'Sarong / Pareo', category: 'Clothing — Bottoms', tags: ['beach', 'versatile'], essential: false, tripTypes: ['beach', 'tropical'] },
  { id: 'bot-012', name: 'Snow Pants / Ski Trousers', category: 'Clothing — Bottoms', tags: ['winter', 'snow', 'ski'], essential: false, tripTypes: ['winter', 'mountain'] },

  // ─────────────────────────────────────────────
  // CLOTHING — OUTERWEAR
  // ─────────────────────────────────────────────
  { id: 'out-001', name: 'Rain Jacket / Waterproof Shell', category: 'Clothing — Outerwear', tags: ['rain', 'weather'], essential: false, tripTypes: ['mountain', 'city', 'camping', 'backpacking', 'family'] },
  { id: 'out-002', name: 'Down Jacket / Puffer', category: 'Clothing — Outerwear', tags: ['warmth', 'cold'], essential: false, tripTypes: ['mountain', 'winter', 'camping'] },
  { id: 'out-003', name: 'Light Cardigan / Wrap', category: 'Clothing — Outerwear', tags: ['layering', 'AC'], essential: false, tripTypes: ['city', 'beach', 'tropical', 'cruise', 'backpacking'] },
  { id: 'out-004', name: 'Windbreaker', category: 'Clothing — Outerwear', tags: ['wind', 'light', 'packable'], essential: false, tripTypes: ['mountain', 'beach', 'camping', 'backpacking'] },
  { id: 'out-005', name: 'Winter Coat / Heavy Parka', category: 'Clothing — Outerwear', tags: ['extreme cold'], essential: false, tripTypes: ['winter'] },
  { id: 'out-006', name: 'Blazer / Sport Coat', category: 'Clothing — Outerwear', tags: ['smart', 'business', 'dinner'], essential: false, tripTypes: ['business', 'city', 'cruise'] },
  { id: 'out-007', name: 'Ski Jacket', category: 'Clothing — Outerwear', tags: ['ski', 'snow', 'winter'], essential: false, tripTypes: ['winter', 'mountain'] },
  { id: 'out-008', name: 'Poncho / Emergency Rain Cover', category: 'Clothing — Outerwear', tags: ['rain', 'packable'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },

  // ─────────────────────────────────────────────
  // CLOTHING — FOOTWEAR
  // ─────────────────────────────────────────────
  { id: 'fwt-001', name: 'Walking / Sneakers', category: 'Clothing — Footwear', tags: ['everyday', 'comfort'], essential: true, tripTypes: ['city', 'family', 'backpacking'] },
  { id: 'fwt-002', name: 'Hiking Boots', category: 'Clothing — Footwear', tags: ['outdoor', 'trail', 'waterproof'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'fwt-003', name: 'Sandals / Flip Flops', category: 'Clothing — Footwear', tags: ['beach', 'casual', 'shower'], essential: false, tripTypes: ['beach', 'tropical', 'backpacking', 'cruise'] },
  { id: 'fwt-004', name: 'Dress Shoes / Heels', category: 'Clothing — Footwear', tags: ['formal', 'dinner'], essential: false, tripTypes: ['business', 'city', 'cruise'] },
  { id: 'fwt-005', name: 'Water Shoes / Aqua Socks', category: 'Clothing — Footwear', tags: ['water', 'beach', 'reef'], essential: false, tripTypes: ['beach', 'tropical'] },
  { id: 'fwt-006', name: 'Winter Boots / Snow Boots', category: 'Clothing — Footwear', tags: ['cold', 'snow', 'waterproof'], essential: false, tripTypes: ['winter', 'mountain'] },
  { id: 'fwt-007', name: 'Ski Boots', category: 'Clothing — Footwear', tags: ['ski', 'snow'], essential: false, tripTypes: ['winter'] },
  { id: 'fwt-008', name: 'Slip-on Shoes / Loafers', category: 'Clothing — Footwear', tags: ['comfort', 'airport', 'casual'], essential: false, tripTypes: ['city', 'business', 'cruise'] },
  { id: 'fwt-009', name: 'Trail Running Shoes', category: 'Clothing — Footwear', tags: ['active', 'light hiking'], essential: false, tripTypes: ['mountain', 'backpacking'] },
  { id: 'fwt-010', name: 'Hotel Slippers / Indoor Shoes', category: 'Clothing — Footwear', tags: ['comfort', 'indoor'], essential: false, tripTypes: ['city', 'business', 'cruise', 'family'] },

  // ─────────────────────────────────────────────
  // CLOTHING — ACCESSORIES
  // ─────────────────────────────────────────────
  { id: 'acc-001', name: 'Sunglasses', category: 'Clothing — Accessories', tags: ['sun', 'UV protection'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'tropical', 'winter', 'camping'] },
  { id: 'acc-002', name: 'Sun Hat / Wide Brim Hat', category: 'Clothing — Accessories', tags: ['sun protection', 'beach'], essential: false, tripTypes: ['beach', 'tropical', 'camping'] },
  { id: 'acc-003', name: 'Beanie / Warm Hat', category: 'Clothing — Accessories', tags: ['warmth', 'cold'], essential: false, tripTypes: ['mountain', 'winter', 'camping'] },
  { id: 'acc-004', name: 'Scarf / Neck Warmer', category: 'Clothing — Accessories', tags: ['warmth', 'versatile'], essential: false, tripTypes: ['city', 'mountain', 'winter', 'backpacking'] },
  { id: 'acc-005', name: 'Gloves / Mittens', category: 'Clothing — Accessories', tags: ['warmth', 'cold'], essential: false, tripTypes: ['mountain', 'winter', 'camping'] },
  { id: 'acc-006', name: 'Ski Gloves', category: 'Clothing — Accessories', tags: ['ski', 'snow', 'waterproof'], essential: false, tripTypes: ['winter'] },
  { id: 'acc-007', name: 'Belt', category: 'Clothing — Accessories', tags: ['essential', 'formal'], essential: false, tripTypes: ['city', 'business', 'cruise'] },
  { id: 'acc-008', name: 'Watch', category: 'Clothing — Accessories', tags: ['time', 'smart'], essential: false, tripTypes: ['city', 'business', 'backpacking'] },
  { id: 'acc-009', name: 'Jewellery / Accessories', category: 'Clothing — Accessories', tags: ['style'], essential: false, tripTypes: ['city', 'cruise', 'business'] },
  { id: 'acc-010', name: 'Neck Gaiter / Balaclava', category: 'Clothing — Accessories', tags: ['cold', 'wind', 'dust'], essential: false, tripTypes: ['mountain', 'winter', 'camping'] },
  { id: 'acc-011', name: 'Baseball Cap', category: 'Clothing — Accessories', tags: ['sun', 'casual'], essential: false, tripTypes: ['city', 'beach', 'camping', 'backpacking'] },
  { id: 'acc-012', name: 'Headband / Hair Ties', category: 'Clothing — Accessories', tags: ['active', 'grooming'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking', 'beach'] },
  { id: 'acc-013', name: 'Umbrella (Compact)', category: 'Clothing — Accessories', tags: ['rain', 'packable'], essential: false, tripTypes: ['city', 'family'] },

  // ─────────────────────────────────────────────
  // CLOTHING — SLEEPWEAR & UNDERWEAR
  // ─────────────────────────────────────────────
  { id: 'slp-001', name: 'Underwear', category: 'Clothing — Sleepwear & Underwear', tags: ['essential'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'slp-002', name: 'Socks (Regular)', category: 'Clothing — Sleepwear & Underwear', tags: ['essential'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'slp-003', name: 'Thermal / Wool Socks', category: 'Clothing — Sleepwear & Underwear', tags: ['warmth', 'cold'], essential: false, tripTypes: ['mountain', 'winter', 'camping'] },
  { id: 'slp-004', name: 'Hiking Socks', category: 'Clothing — Sleepwear & Underwear', tags: ['outdoor', 'blister prevention'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'slp-005', name: 'Compression Socks', category: 'Clothing — Sleepwear & Underwear', tags: ['health', 'long flight'], essential: false, tripTypes: ['city', 'business', 'backpacking', 'cruise'] },
  { id: 'slp-006', name: 'Pyjamas / Sleepwear', category: 'Clothing — Sleepwear & Underwear', tags: ['sleep', 'comfort'], essential: false, tripTypes: ['city', 'family', 'business', 'cruise'] },
  { id: 'slp-007', name: 'Sleep Shorts / Loungewear', category: 'Clothing — Sleepwear & Underwear', tags: ['sleep', 'comfort'], essential: false, tripTypes: ['beach', 'tropical', 'backpacking'] },
  { id: 'slp-008', name: 'Sports Bra', category: 'Clothing — Sleepwear & Underwear', tags: ['active', 'feminine'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking', 'beach'] },
  { id: 'slp-009', name: 'Bra', category: 'Clothing — Sleepwear & Underwear', tags: ['feminine'], essential: false, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },

  // ─────────────────────────────────────────────
  // TOILETRIES & GROOMING
  // ─────────────────────────────────────────────
  { id: 'tlt-001', name: 'Toothbrush', category: 'Toiletries & Grooming', tags: ['hygiene'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'tlt-002', name: 'Toothpaste', category: 'Toiletries & Grooming', tags: ['hygiene'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'tlt-003', name: 'Shampoo', category: 'Toiletries & Grooming', tags: ['hair', 'hygiene'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'tlt-004', name: 'Conditioner', category: 'Toiletries & Grooming', tags: ['hair'], essential: false, tripTypes: ['city', 'business', 'cruise', 'family'] },
  { id: 'tlt-005', name: 'Body Wash / Soap', category: 'Toiletries & Grooming', tags: ['hygiene'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'tlt-006', name: 'Deodorant / Antiperspirant', category: 'Toiletries & Grooming', tags: ['hygiene'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'tlt-007', name: 'Razor / Shaving Kit', category: 'Toiletries & Grooming', tags: ['grooming'], essential: false, tripTypes: ['city', 'business', 'cruise', 'backpacking'] },
  { id: 'tlt-008', name: 'Shaving Cream / Gel', category: 'Toiletries & Grooming', tags: ['grooming'], essential: false, tripTypes: ['city', 'business', 'cruise'] },
  { id: 'tlt-009', name: 'Moisturiser / Body Lotion', category: 'Toiletries & Grooming', tags: ['skincare'], essential: false, tripTypes: ['city', 'business', 'winter', 'cruise'] },
  { id: 'tlt-010', name: 'Lip Balm / ChapStick', category: 'Toiletries & Grooming', tags: ['skincare', 'cold', 'sun'], essential: false, tripTypes: ['mountain', 'winter', 'beach', 'camping'] },
  { id: 'tlt-011', name: 'Hairbrush / Comb', category: 'Toiletries & Grooming', tags: ['hair', 'grooming'], essential: false, tripTypes: ['city', 'business', 'cruise', 'family'] },
  { id: 'tlt-012', name: 'Hair Dryer (Travel Size)', category: 'Toiletries & Grooming', tags: ['hair', 'electric'], essential: false, tripTypes: ['business', 'city', 'cruise'] },
  { id: 'tlt-013', name: 'Hair Straightener / Curler', category: 'Toiletries & Grooming', tags: ['hair', 'electric'], essential: false, tripTypes: ['business', 'cruise'] },
  { id: 'tlt-014', name: 'Dry Shampoo', category: 'Toiletries & Grooming', tags: ['hair', 'convenience'], essential: false, tripTypes: ['backpacking', 'camping', 'city'] },
  { id: 'tlt-015', name: 'Cotton Swabs / Q-Tips', category: 'Toiletries & Grooming', tags: ['grooming', 'hygiene'], essential: false, tripTypes: ['city', 'family', 'cruise'] },
  { id: 'tlt-016', name: 'Nail Clippers / File', category: 'Toiletries & Grooming', tags: ['grooming'], essential: false, tripTypes: ['city', 'business', 'cruise', 'backpacking'] },
  { id: 'tlt-017', name: 'Tweezers', category: 'Toiletries & Grooming', tags: ['grooming', 'first aid'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'tlt-018', name: 'Feminine Hygiene Products', category: 'Toiletries & Grooming', tags: ['feminine', 'health'], essential: false, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'tlt-019', name: 'Menstrual Cup / Disc', category: 'Toiletries & Grooming', tags: ['feminine', 'eco', 'backpacking'], essential: false, tripTypes: ['backpacking', 'camping', 'mountain'] },
  { id: 'tlt-020', name: 'Toilet Paper / Travel Tissues', category: 'Toiletries & Grooming', tags: ['hygiene', 'emergency'], essential: false, tripTypes: ['camping', 'backpacking', 'mountain'] },
  { id: 'tlt-021', name: 'Hand Sanitiser', category: 'Toiletries & Grooming', tags: ['hygiene', 'health'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'tlt-022', name: 'Wet Wipes / Baby Wipes', category: 'Toiletries & Grooming', tags: ['hygiene', 'convenience'], essential: false, tripTypes: ['family', 'camping', 'backpacking'] },
  { id: 'tlt-023', name: 'Perfume / Cologne (Travel Size)', category: 'Toiletries & Grooming', tags: ['fragrance'], essential: false, tripTypes: ['city', 'business', 'cruise'] },
  { id: 'tlt-024', name: 'Makeup Kit', category: 'Toiletries & Grooming', tags: ['feminine', 'style'], essential: false, tripTypes: ['city', 'business', 'cruise'] },
  { id: 'tlt-025', name: 'Makeup Remover Wipes', category: 'Toiletries & Grooming', tags: ['feminine', 'skincare'], essential: false, tripTypes: ['city', 'business', 'cruise'] },
  { id: 'tlt-026', name: 'Electric Toothbrush', category: 'Toiletries & Grooming', tags: ['hygiene', 'electric'], essential: false, tripTypes: ['business', 'city', 'cruise'] },
  { id: 'tlt-027', name: 'Floss / Interdental Brush', category: 'Toiletries & Grooming', tags: ['hygiene'], essential: false, tripTypes: ['city', 'business', 'cruise', 'backpacking'] },
  { id: 'tlt-028', name: 'Mouthwash (Travel Size)', category: 'Toiletries & Grooming', tags: ['hygiene'], essential: false, tripTypes: ['city', 'business', 'cruise'] },
  { id: 'tlt-029', name: 'Toilet Seat Covers', category: 'Toiletries & Grooming', tags: ['hygiene'], essential: false, tripTypes: ['backpacking', 'tropical'] },
  { id: 'tlt-030', name: 'Waterproof Toiletry Bag', category: 'Toiletries & Grooming', tags: ['organisation'], essential: false, tripTypes: ['beach', 'camping', 'backpacking'] },

  // ─────────────────────────────────────────────
  // SKINCARE & SUN PROTECTION
  // ─────────────────────────────────────────────
  { id: 'sun-001', name: 'Sunscreen SPF 50+', category: 'Skincare & Sun Protection', tags: ['sun', 'UV', 'health'], essential: false, tripTypes: ['beach', 'mountain', 'tropical', 'camping'] },
  { id: 'sun-002', name: 'After-Sun Lotion / Aloe Vera', category: 'Skincare & Sun Protection', tags: ['beach', 'burn'], essential: false, tripTypes: ['beach', 'tropical'] },
  { id: 'sun-003', name: 'Face Sunscreen SPF 50', category: 'Skincare & Sun Protection', tags: ['sun', 'face', 'skincare'], essential: false, tripTypes: ['beach', 'mountain', 'tropical', 'city'] },
  { id: 'sun-004', name: 'UV Protection Lip Balm', category: 'Skincare & Sun Protection', tags: ['sun', 'lips'], essential: false, tripTypes: ['beach', 'mountain', 'winter'] },
  { id: 'sun-005', name: 'Insect Repellent', category: 'Skincare & Sun Protection', tags: ['bugs', 'mosquito', 'tropical'], essential: false, tripTypes: ['tropical', 'camping', 'backpacking', 'mountain'] },
  { id: 'sun-006', name: 'Mosquito Repellent Bands', category: 'Skincare & Sun Protection', tags: ['bugs', 'kids'], essential: false, tripTypes: ['tropical', 'camping', 'family'] },
  { id: 'sun-007', name: 'Anti-Itch Cream', category: 'Skincare & Sun Protection', tags: ['bugs', 'relief'], essential: false, tripTypes: ['tropical', 'camping', 'backpacking'] },
  { id: 'sun-008', name: 'Face Moisturiser with SPF', category: 'Skincare & Sun Protection', tags: ['skincare', 'daily'], essential: false, tripTypes: ['city', 'beach', 'mountain'] },

  // ─────────────────────────────────────────────
  // HEALTH & MEDICINE
  // ─────────────────────────────────────────────
  { id: 'med-001', name: 'Prescription Medications', category: 'Health & Medicine', tags: ['health', 'essential'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'med-002', name: 'Pain Relievers (Paracetamol / Ibuprofen)', category: 'Health & Medicine', tags: ['pain', 'fever'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'med-003', name: 'Antihistamines / Allergy Medicine', category: 'Health & Medicine', tags: ['allergy', 'hay fever'], essential: false, tripTypes: ['mountain', 'camping', 'tropical', 'backpacking'] },
  { id: 'med-004', name: 'Motion Sickness Tablets', category: 'Health & Medicine', tags: ['nausea', 'travel sickness'], essential: false, tripTypes: ['cruise', 'mountain', 'backpacking'] },
  { id: 'med-005', name: 'Anti-Diarrhoea Medicine', category: 'Health & Medicine', tags: ['stomach', 'food safety'], essential: false, tripTypes: ['tropical', 'backpacking', 'camping'] },
  { id: 'med-006', name: 'Rehydration Sachets / Electrolytes', category: 'Health & Medicine', tags: ['hydration', 'heat', 'illness'], essential: false, tripTypes: ['tropical', 'beach', 'mountain', 'camping'] },
  { id: 'med-007', name: 'Altitude Sickness Pills (Acetazolamide)', category: 'Health & Medicine', tags: ['altitude', 'mountain'], essential: false, tripTypes: ['mountain'] },
  { id: 'med-008', name: 'Malaria Prophylaxis', category: 'Health & Medicine', tags: ['malaria', 'tropical'], essential: false, tripTypes: ['tropical'] },
  { id: 'med-009', name: 'First Aid Kit', category: 'Health & Medicine', tags: ['safety', 'emergency'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking', 'family'] },
  { id: 'med-010', name: 'Plasters / Band-Aids', category: 'Health & Medicine', tags: ['first aid', 'blisters'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'med-011', name: 'Antiseptic Cream / Wipes', category: 'Health & Medicine', tags: ['first aid', 'wound'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking', 'family'] },
  { id: 'med-012', name: 'Blister Plasters', category: 'Health & Medicine', tags: ['blisters', 'walking'], essential: false, tripTypes: ['city', 'mountain', 'backpacking'] },
  { id: 'med-013', name: 'Thermometer', category: 'Health & Medicine', tags: ['health', 'fever'], essential: false, tripTypes: ['family', 'tropical', 'backpacking'] },
  { id: 'med-014', name: 'Eye Drops', category: 'Health & Medicine', tags: ['eyes', 'dry', 'flight'], essential: false, tripTypes: ['city', 'business', 'cruise'] },
  { id: 'med-015', name: 'Contact Lenses & Solution', category: 'Health & Medicine', tags: ['eyes', 'vision'], essential: false, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'med-016', name: 'Glasses / Prescription Sunglasses', category: 'Health & Medicine', tags: ['vision'], essential: false, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'med-017', name: 'Vitamins / Supplements', category: 'Health & Medicine', tags: ['health', 'immunity'], essential: false, tripTypes: ['backpacking', 'mountain', 'tropical'] },
  { id: 'med-018', name: 'Sleep Aid / Melatonin', category: 'Health & Medicine', tags: ['sleep', 'jet lag'], essential: false, tripTypes: ['business', 'long haul', 'cruise'] },
  { id: 'med-019', name: 'Compression Bandage', category: 'Health & Medicine', tags: ['injury', 'sprain'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'med-020', name: 'Medical Alert Bracelet', category: 'Health & Medicine', tags: ['emergency', 'medical condition'], essential: false, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'med-021', name: 'Earplugs (Noise)', category: 'Health & Medicine', tags: ['sleep', 'noise'], essential: false, tripTypes: ['backpacking', 'city', 'cruise', 'camping'] },
  { id: 'med-022', name: 'Feminine Pain Relief Patches', category: 'Health & Medicine', tags: ['feminine', 'pain'], essential: false, tripTypes: ['city', 'backpacking', 'business'] },
  { id: 'med-023', name: 'Hand Cream', category: 'Health & Medicine', tags: ['skincare', 'dry', 'winter'], essential: false, tripTypes: ['winter', 'mountain', 'business'] },

  // ─────────────────────────────────────────────
  // ELECTRONICS & GADGETS
  // ─────────────────────────────────────────────
  { id: 'elc-001', name: 'Smartphone', category: 'Electronics & Gadgets', tags: ['essential', 'navigation', 'communication'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'elc-002', name: 'Laptop', category: 'Electronics & Gadgets', tags: ['work', 'remote'], essential: false, tripTypes: ['business', 'city', 'backpacking'] },
  { id: 'elc-003', name: 'Tablet / iPad', category: 'Electronics & Gadgets', tags: ['entertainment', 'kids'], essential: false, tripTypes: ['family', 'business', 'cruise'] },
  { id: 'elc-004', name: 'E-Reader / Kindle', category: 'Electronics & Gadgets', tags: ['reading', 'entertainment'], essential: false, tripTypes: ['beach', 'backpacking', 'cruise', 'city'] },
  { id: 'elc-005', name: 'Portable Battery / Power Bank', category: 'Electronics & Gadgets', tags: ['charging', 'essential'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'elc-006', name: 'Camera (DSLR / Mirrorless)', category: 'Electronics & Gadgets', tags: ['photography'], essential: false, tripTypes: ['mountain', 'city', 'beach', 'tropical', 'backpacking'] },
  { id: 'elc-007', name: 'Action Camera (GoPro)', category: 'Electronics & Gadgets', tags: ['photography', 'video', 'waterproof'], essential: false, tripTypes: ['beach', 'mountain', 'camping', 'backpacking', 'winter'] },
  { id: 'elc-008', name: 'Drone', category: 'Electronics & Gadgets', tags: ['photography', 'video', 'aerial'], essential: false, tripTypes: ['mountain', 'beach', 'tropical'] },
  { id: 'elc-009', name: 'Headphones (Over-ear)', category: 'Electronics & Gadgets', tags: ['audio', 'noise cancelling', 'flight'], essential: false, tripTypes: ['business', 'city', 'cruise'] },
  { id: 'elc-010', name: 'Earbuds / AirPods', category: 'Electronics & Gadgets', tags: ['audio', 'compact'], essential: false, tripTypes: ['beach', 'mountain', 'city', 'business', 'backpacking', 'family'] },
  { id: 'elc-011', name: 'Smartwatch / Fitness Tracker', category: 'Electronics & Gadgets', tags: ['fitness', 'navigation', 'health'], essential: false, tripTypes: ['mountain', 'city', 'camping', 'backpacking'] },
  { id: 'elc-012', name: 'GPS Device / Garmin', category: 'Electronics & Gadgets', tags: ['navigation', 'outdoor', 'offline maps'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'elc-013', name: 'Portable WiFi / MiFi Device', category: 'Electronics & Gadgets', tags: ['internet', 'connectivity'], essential: false, tripTypes: ['business', 'family', 'city'] },
  { id: 'elc-014', name: 'Local SIM Card / eSIM', category: 'Electronics & Gadgets', tags: ['connectivity', 'data'], essential: false, tripTypes: ['backpacking', 'tropical', 'city', 'business'] },
  { id: 'elc-015', name: 'Satellite Communicator (Garmin inReach)', category: 'Electronics & Gadgets', tags: ['safety', 'emergency', 'remote'], essential: false, tripTypes: ['mountain', 'camping'] },
  { id: 'elc-016', name: 'Portable Speaker (Waterproof)', category: 'Electronics & Gadgets', tags: ['audio', 'beach', 'camping'], essential: false, tripTypes: ['beach', 'camping', 'backpacking'] },
  { id: 'elc-017', name: 'Electric Shaver', category: 'Electronics & Gadgets', tags: ['grooming', 'electric'], essential: false, tripTypes: ['business', 'city', 'cruise'] },
  { id: 'elc-018', name: 'Noise Machine / Sleep App Device', category: 'Electronics & Gadgets', tags: ['sleep', 'noise'], essential: false, tripTypes: ['business', 'city'] },

  // ─────────────────────────────────────────────
  // CABLES & POWER
  // ─────────────────────────────────────────────
  { id: 'pwr-001', name: 'Universal Travel Adapter', category: 'Cables & Power', tags: ['essential', 'power', 'international'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'pwr-002', name: 'USB-C Charging Cable', category: 'Cables & Power', tags: ['charging', 'essential'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'pwr-003', name: 'Lightning Cable (Apple)', category: 'Cables & Power', tags: ['charging', 'apple'], essential: false, tripTypes: ['city', 'business', 'family'] },
  { id: 'pwr-004', name: 'Laptop Charger', category: 'Cables & Power', tags: ['work', 'charging'], essential: false, tripTypes: ['business', 'city', 'backpacking'] },
  { id: 'pwr-005', name: 'Multi-Port USB Charger', category: 'Cables & Power', tags: ['charging', 'multiple devices'], essential: false, tripTypes: ['family', 'business', 'backpacking'] },
  { id: 'pwr-006', name: 'Solar Charger Panel', category: 'Cables & Power', tags: ['charging', 'outdoor', 'eco'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'pwr-007', name: 'Camera Battery Charger', category: 'Cables & Power', tags: ['photography', 'charging'], essential: false, tripTypes: ['mountain', 'city', 'beach'] },
  { id: 'pwr-008', name: 'HDMI Cable', category: 'Cables & Power', tags: ['work', 'presentation'], essential: false, tripTypes: ['business'] },
  { id: 'pwr-009', name: 'Extension Lead / Power Strip', category: 'Cables & Power', tags: ['power', 'multiple devices'], essential: false, tripTypes: ['business', 'family'] },

  // ─────────────────────────────────────────────
  // BAGS & PACKING
  // ─────────────────────────────────────────────
  { id: 'bag-001', name: 'Main Suitcase / Luggage', category: 'Bags & Packing', tags: ['essential', 'storage'], essential: true, tripTypes: ['city', 'business', 'cruise', 'family'] },
  { id: 'bag-002', name: 'Backpack (Travel / Hiking)', category: 'Bags & Packing', tags: ['outdoor', 'backpacking'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'bag-003', name: 'Day Pack / Small Backpack', category: 'Bags & Packing', tags: ['day trips', 'city'], essential: false, tripTypes: ['city', 'mountain', 'backpacking', 'family'] },
  { id: 'bag-004', name: 'Packing Cubes', category: 'Bags & Packing', tags: ['organisation', 'compression'], essential: false, tripTypes: ['city', 'business', 'backpacking', 'family'] },
  { id: 'bag-005', name: 'Compression Sacks', category: 'Bags & Packing', tags: ['compression', 'space saving'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'bag-006', name: 'Dry Bags / Waterproof Bags', category: 'Bags & Packing', tags: ['waterproof', 'beach', 'kayak'], essential: false, tripTypes: ['beach', 'mountain', 'camping', 'backpacking'] },
  { id: 'bag-007', name: 'Tote Bag / Reusable Shopping Bag', category: 'Bags & Packing', tags: ['shopping', 'eco', 'beach'], essential: false, tripTypes: ['city', 'beach', 'family'] },
  { id: 'bag-008', name: 'Foldable Duffel Bag', category: 'Bags & Packing', tags: ['extra storage', 'packable'], essential: false, tripTypes: ['city', 'backpacking', 'family', 'cruise'] },
  { id: 'bag-009', name: 'Anti-Theft Backpack', category: 'Bags & Packing', tags: ['safety', 'city', 'pickpocket'], essential: false, tripTypes: ['city', 'backpacking', 'business'] },
  { id: 'bag-010', name: 'Luggage Locks', category: 'Bags & Packing', tags: ['security'], essential: false, tripTypes: ['city', 'business', 'backpacking', 'cruise'] },
  { id: 'bag-011', name: 'Luggage Tags', category: 'Bags & Packing', tags: ['identification'], essential: false, tripTypes: ['city', 'business', 'family', 'cruise'] },
  { id: 'bag-012', name: 'Luggage Scale', category: 'Bags & Packing', tags: ['weight', 'airline'], essential: false, tripTypes: ['city', 'business', 'backpacking', 'family'] },
  { id: 'bag-013', name: 'Neck Pouch / Money Belt', category: 'Bags & Packing', tags: ['security', 'anti-theft'], essential: false, tripTypes: ['city', 'backpacking', 'tropical'] },
  { id: 'bag-014', name: 'Clear Zip-lock Bags', category: 'Bags & Packing', tags: ['liquids', 'organisation', 'airport'], essential: false, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'bag-015', name: 'Garment Bag / Suit Carrier', category: 'Bags & Packing', tags: ['formal', 'business', 'wrinkle-free'], essential: false, tripTypes: ['business', 'cruise'] },

  // ─────────────────────────────────────────────
  // SLEEP & COMFORT
  // ─────────────────────────────────────────────
  { id: 'slc-001', name: 'Travel Pillow (Neck)', category: 'Sleep & Comfort', tags: ['sleep', 'flight', 'comfort'], essential: false, tripTypes: ['city', 'business', 'backpacking', 'cruise', 'family'] },
  { id: 'slc-002', name: 'Eye Mask / Sleep Mask', category: 'Sleep & Comfort', tags: ['sleep', 'light blocking'], essential: false, tripTypes: ['city', 'business', 'backpacking', 'cruise', 'family'] },
  { id: 'slc-003', name: 'Sleeping Bag', category: 'Sleep & Comfort', tags: ['camping', 'cold', 'outdoor'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'slc-004', name: 'Sleeping Bag Liner', category: 'Sleep & Comfort', tags: ['hygiene', 'hostel', 'warmth'], essential: false, tripTypes: ['backpacking', 'camping'] },
  { id: 'slc-005', name: 'Inflatable Sleeping Mat', category: 'Sleep & Comfort', tags: ['camping', 'outdoor', 'sleep'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'slc-006', name: 'Lightweight Travel Blanket', category: 'Sleep & Comfort', tags: ['comfort', 'flight', 'cold AC'], essential: false, tripTypes: ['family', 'city', 'cruise', 'backpacking'] },
  { id: 'slc-007', name: 'Hammock (Lightweight)', category: 'Sleep & Comfort', tags: ['outdoor', 'camping', 'beach', 'relax'], essential: false, tripTypes: ['beach', 'camping', 'backpacking'] },
  { id: 'slc-008', name: 'Earplugs', category: 'Sleep & Comfort', tags: ['sleep', 'noise', 'hostel'], essential: false, tripTypes: ['backpacking', 'city', 'camping', 'cruise'] },
  { id: 'slc-009', name: 'White Noise App / Device', category: 'Sleep & Comfort', tags: ['sleep', 'noise'], essential: false, tripTypes: ['business', 'city', 'family'] },

  // ─────────────────────────────────────────────
  // FOOD & DRINK
  // ─────────────────────────────────────────────
  { id: 'fod-001', name: 'Reusable Water Bottle', category: 'Food & Drink', tags: ['hydration', 'eco'], essential: true, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'winter', 'tropical', 'backpacking', 'family', 'cruise'] },
  { id: 'fod-002', name: 'Water Purification Tablets / Filter', category: 'Food & Drink', tags: ['water safety', 'outdoor'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking', 'tropical'] },
  { id: 'fod-003', name: 'Insulated Flask / Thermos', category: 'Food & Drink', tags: ['hot drink', 'cold drink', 'camping'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking', 'winter'] },
  { id: 'fod-004', name: 'Energy Bars / Snacks', category: 'Food & Drink', tags: ['energy', 'hiking', 'quick food'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking', 'family'] },
  { id: 'fod-005', name: 'Instant Coffee / Tea Bags', category: 'Food & Drink', tags: ['hot drink', 'morning'], essential: false, tripTypes: ['camping', 'backpacking', 'mountain'] },
  { id: 'fod-006', name: 'Lightweight Camp Stove', category: 'Food & Drink', tags: ['cooking', 'camping'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'fod-007', name: 'Camp Cookware / Mess Kit', category: 'Food & Drink', tags: ['cooking', 'camping'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'fod-008', name: 'Reusable Cutlery Set', category: 'Food & Drink', tags: ['eco', 'camping', 'outdoor'], essential: false, tripTypes: ['camping', 'backpacking'] },
  { id: 'fod-009', name: 'Portable Food Container / Tiffin', category: 'Food & Drink', tags: ['food storage', 'family'], essential: false, tripTypes: ['family', 'camping', 'backpacking'] },
  { id: 'fod-010', name: 'Baby Food / Formula', category: 'Food & Drink', tags: ['baby', 'family'], essential: false, tripTypes: ['family'] },
  { id: 'fod-011', name: 'Collapsible Cup / Bowl', category: 'Food & Drink', tags: ['compact', 'camping', 'eco'], essential: false, tripTypes: ['camping', 'backpacking', 'mountain'] },
  { id: 'fod-012', name: 'Protein Powder / Supplements', category: 'Food & Drink', tags: ['fitness', 'nutrition'], essential: false, tripTypes: ['mountain', 'backpacking', 'camping'] },

  // ─────────────────────────────────────────────
  // SAFETY & SECURITY
  // ─────────────────────────────────────────────
  { id: 'saf-001', name: 'Padlock (TSA Approved)', category: 'Safety & Security', tags: ['security', 'luggage'], essential: false, tripTypes: ['backpacking', 'city', 'camping'] },
  { id: 'saf-002', name: 'Personal Safety Alarm', category: 'Safety & Security', tags: ['safety', 'solo', 'women'], essential: false, tripTypes: ['city', 'backpacking', 'tropical'] },
  { id: 'saf-003', name: 'Doorstop Alarm', category: 'Safety & Security', tags: ['safety', 'solo', 'women', 'hotel'], essential: false, tripTypes: ['city', 'backpacking'] },
  { id: 'saf-004', name: 'Whistle', category: 'Safety & Security', tags: ['emergency', 'outdoor', 'safety'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'saf-005', name: 'RFID Blocking Wallet / Sleeve', category: 'Safety & Security', tags: ['anti-theft', 'card skimming'], essential: false, tripTypes: ['city', 'business', 'backpacking'] },
  { id: 'saf-006', name: 'Portable Safe / Lock Box', category: 'Safety & Security', tags: ['valuables', 'hotel'], essential: false, tripTypes: ['backpacking', 'tropical'] },
  { id: 'saf-007', name: 'Cable Lock (for bags)', category: 'Safety & Security', tags: ['anti-theft', 'backpacking'], essential: false, tripTypes: ['backpacking', 'city'] },
  { id: 'saf-008', name: 'Headlamp / Torch', category: 'Safety & Security', tags: ['light', 'outdoor', 'emergency'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'saf-009', name: 'Emergency Mylar Blanket', category: 'Safety & Security', tags: ['emergency', 'cold', 'survival'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'saf-010', name: 'Fire Starter / Lighter', category: 'Safety & Security', tags: ['camping', 'survival'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'saf-011', name: 'Pepper Spray (where legal)', category: 'Safety & Security', tags: ['safety', 'solo', 'women'], essential: false, tripTypes: ['city', 'backpacking'] },
  { id: 'saf-012', name: 'VPN Subscription', category: 'Safety & Security', tags: ['digital safety', 'wifi'], essential: false, tripTypes: ['city', 'business', 'backpacking'] },

  // ─────────────────────────────────────────────
  // NAVIGATION & OUTDOORS
  // ─────────────────────────────────────────────
  { id: 'nav-001', name: 'Offline Maps Downloaded (Maps.me / Google)', category: 'Navigation & Outdoors', tags: ['navigation', 'offline'], essential: false, tripTypes: ['city', 'mountain', 'backpacking', 'tropical'] },
  { id: 'nav-002', name: 'Physical Map / Guidebook', category: 'Navigation & Outdoors', tags: ['navigation', 'offline'], essential: false, tripTypes: ['city', 'backpacking', 'mountain'] },
  { id: 'nav-003', name: 'Compass', category: 'Navigation & Outdoors', tags: ['navigation', 'outdoor', 'hiking'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'nav-004', name: 'Trekking Poles', category: 'Navigation & Outdoors', tags: ['hiking', 'stability', 'downhill'], essential: false, tripTypes: ['mountain', 'backpacking'] },
  { id: 'nav-005', name: 'Multi-tool / Swiss Army Knife', category: 'Navigation & Outdoors', tags: ['outdoor', 'utility'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'nav-006', name: 'Duct Tape (small roll)', category: 'Navigation & Outdoors', tags: ['repair', 'utility'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'nav-007', name: 'Paracord / Rope', category: 'Navigation & Outdoors', tags: ['outdoor', 'utility', 'survival'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'nav-008', name: 'Tent / Bivvy Bag', category: 'Navigation & Outdoors', tags: ['camping', 'shelter'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'nav-009', name: 'Tarp / Ground Sheet', category: 'Navigation & Outdoors', tags: ['camping', 'shelter'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'nav-010', name: 'Carabiner Clips', category: 'Navigation & Outdoors', tags: ['outdoor', 'utility', 'climbing'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },
  { id: 'nav-011', name: 'Bear Canister / Food Hang Bag', category: 'Navigation & Outdoors', tags: ['camping', 'wildlife', 'food storage'], essential: false, tripTypes: ['mountain', 'camping'] },
  { id: 'nav-012', name: 'Binoculars', category: 'Navigation & Outdoors', tags: ['wildlife', 'sightseeing', 'birdwatching'], essential: false, tripTypes: ['mountain', 'camping', 'backpacking'] },

  // ─────────────────────────────────────────────
  // FITNESS & SPORTS
  // ─────────────────────────────────────────────
  { id: 'fit-001', name: 'Resistance Bands', category: 'Fitness & Sports', tags: ['fitness', 'compact', 'workout'], essential: false, tripTypes: ['business', 'backpacking', 'city'] },
  { id: 'fit-002', name: 'Jump Rope', category: 'Fitness & Sports', tags: ['fitness', 'compact', 'cardio'], essential: false, tripTypes: ['backpacking', 'business'] },
  { id: 'fit-003', name: 'Yoga Mat (Foldable)', category: 'Fitness & Sports', tags: ['yoga', 'fitness', 'flexible'], essential: false, tripTypes: ['city', 'beach', 'backpacking'] },
  { id: 'fit-004', name: 'Running Shoes', category: 'Fitness & Sports', tags: ['running', 'fitness'], essential: false, tripTypes: ['city', 'beach', 'backpacking', 'business'] },
  { id: 'fit-005', name: 'Sports Towel (Microfibre)', category: 'Fitness & Sports', tags: ['beach', 'gym', 'compact'], essential: false, tripTypes: ['beach', 'mountain', 'camping', 'backpacking'] },
  { id: 'fit-006', name: 'Ski / Snowboard Equipment', category: 'Fitness & Sports', tags: ['ski', 'snow', 'winter'], essential: false, tripTypes: ['winter'] },
  { id: 'fit-007', name: 'Snorkel & Mask', category: 'Fitness & Sports', tags: ['beach', 'water', 'snorkelling'], essential: false, tripTypes: ['beach', 'tropical', 'cruise'] },

  // ─────────────────────────────────────────────
  // BEACH & WATER
  // ─────────────────────────────────────────────
  { id: 'bch-001', name: 'Beach Towel', category: 'Beach & Water', tags: ['beach', 'pool'], essential: false, tripTypes: ['beach', 'tropical', 'cruise'] },
  { id: 'bch-002', name: 'Waterproof Phone Case', category: 'Beach & Water', tags: ['beach', 'water', 'phone protection'], essential: false, tripTypes: ['beach', 'tropical', 'camping'] },
  { id: 'bch-003', name: 'Underwater Camera Housing', category: 'Beach & Water', tags: ['photography', 'water', 'diving'], essential: false, tripTypes: ['beach', 'tropical'] },
  { id: 'bch-004', name: 'Inflatable Beach Mat / Lounger', category: 'Beach & Water', tags: ['beach', 'relax', 'comfort'], essential: false, tripTypes: ['beach', 'tropical'] },
  { id: 'bch-005', name: 'Beach Umbrella', category: 'Beach & Water', tags: ['beach', 'shade', 'sun protection'], essential: false, tripTypes: ['beach', 'tropical'] },
  { id: 'bch-006', name: 'Snorkelling Fins', category: 'Beach & Water', tags: ['water', 'snorkelling', 'diving'], essential: false, tripTypes: ['beach', 'tropical'] },
  { id: 'bch-007', name: 'Reef-Safe Sunscreen', category: 'Beach & Water', tags: ['beach', 'eco', 'sun protection'], essential: false, tripTypes: ['beach', 'tropical'] },
  { id: 'bch-008', name: 'Mesh Beach Bag', category: 'Beach & Water', tags: ['beach', 'sand-proof'], essential: false, tripTypes: ['beach', 'tropical'] },

  // ─────────────────────────────────────────────
  // WINTER & SNOW
  // ─────────────────────────────────────────────
  { id: 'win-001', name: 'Hand Warmers', category: 'Winter & Snow', tags: ['cold', 'warmth', 'disposable'], essential: false, tripTypes: ['winter', 'mountain'] },
  { id: 'win-002', name: 'Toe Warmers', category: 'Winter & Snow', tags: ['cold', 'warmth', 'feet'], essential: false, tripTypes: ['winter', 'mountain'] },
  { id: 'win-003', name: 'Ski Goggles', category: 'Winter & Snow', tags: ['ski', 'snow', 'UV'], essential: false, tripTypes: ['winter'] },
  { id: 'win-004', name: 'Ice Grips / Crampons (for boots)', category: 'Winter & Snow', tags: ['ice', 'safety', 'traction'], essential: false, tripTypes: ['winter', 'mountain'] },
  { id: 'win-005', name: 'Avalanche Safety Kit', category: 'Winter & Snow', tags: ['safety', 'ski', 'backcountry'], essential: false, tripTypes: ['winter', 'mountain'] },
  { id: 'win-006', name: 'Ski Helmet', category: 'Winter & Snow', tags: ['safety', 'ski', 'snow'], essential: false, tripTypes: ['winter'] },
  { id: 'win-007', name: 'Neck Warmer / Snood', category: 'Winter & Snow', tags: ['warmth', 'cold'], essential: false, tripTypes: ['winter', 'mountain'] },
  { id: 'win-008', name: 'Waterproof Trousers / Gaiters', category: 'Winter & Snow', tags: ['wet', 'snow', 'waterproof'], essential: false, tripTypes: ['winter', 'mountain'] },

  // ─────────────────────────────────────────────
  // BABY & KIDS
  // ─────────────────────────────────────────────
  { id: 'kid-001', name: 'Nappies / Diapers', category: 'Baby & Kids', tags: ['baby', 'family'], essential: false, tripTypes: ['family'] },
  { id: 'kid-002', name: 'Baby Carrier / Sling', category: 'Baby & Kids', tags: ['baby', 'family', 'hands-free'], essential: false, tripTypes: ['family'] },
  { id: 'kid-003', name: 'Portable Cot / Travel Bed', category: 'Baby & Kids', tags: ['baby', 'sleep'], essential: false, tripTypes: ['family'] },
  { id: 'kid-004', name: 'Stroller / Pushchair', category: 'Baby & Kids', tags: ['baby', 'family', 'walking'], essential: false, tripTypes: ['family'] },
  { id: 'kid-005', name: 'Baby Monitor', category: 'Baby & Kids', tags: ['baby', 'safety', 'sleep'], essential: false, tripTypes: ['family'] },
  { id: 'kid-006', name: 'Child Harness / Wrist Strap', category: 'Baby & Kids', tags: ['toddler', 'safety'], essential: false, tripTypes: ['family'] },
  { id: 'kid-007', name: 'Kids Noise-Cancelling Headphones', category: 'Baby & Kids', tags: ['kids', 'entertainment', 'flight'], essential: false, tripTypes: ['family'] },
  { id: 'kid-008', name: 'Colouring Books / Activity Kit', category: 'Baby & Kids', tags: ['entertainment', 'kids', 'flight'], essential: false, tripTypes: ['family'] },
  { id: 'kid-009', name: 'Favourite Toys / Comfort Items', category: 'Baby & Kids', tags: ['kids', 'comfort'], essential: false, tripTypes: ['family'] },
  { id: 'kid-010', name: 'Portable High Chair / Seat Booster', category: 'Baby & Kids', tags: ['baby', 'feeding'], essential: false, tripTypes: ['family'] },
  { id: 'kid-011', name: 'Children\'s Sunscreen', category: 'Baby & Kids', tags: ['sun', 'kids', 'sensitive skin'], essential: false, tripTypes: ['family', 'beach'] },
  { id: 'kid-012', name: 'Baby Wipes (Extra Pack)', category: 'Baby & Kids', tags: ['hygiene', 'baby'], essential: false, tripTypes: ['family'] },
  { id: 'kid-013', name: 'Portable Potty', category: 'Baby & Kids', tags: ['toddler', 'toilet training'], essential: false, tripTypes: ['family'] },

  // ─────────────────────────────────────────────
  // PET TRAVEL
  // ─────────────────────────────────────────────
  { id: 'pet-001', name: 'Pet Carrier / Crate', category: 'Pet Travel', tags: ['pet', 'transport'], essential: false, tripTypes: ['city', 'family'] },
  { id: 'pet-002', name: 'Pet Food & Treats', category: 'Pet Travel', tags: ['pet', 'food'], essential: false, tripTypes: ['city', 'camping', 'family'] },
  { id: 'pet-003', name: 'Pet Water Bowl (Collapsible)', category: 'Pet Travel', tags: ['pet', 'hydration'], essential: false, tripTypes: ['city', 'camping', 'mountain', 'family'] },
  { id: 'pet-004', name: 'Pet Medication', category: 'Pet Travel', tags: ['pet', 'health'], essential: false, tripTypes: ['city', 'camping', 'family'] },
  { id: 'pet-005', name: 'Pet First Aid Kit', category: 'Pet Travel', tags: ['pet', 'health', 'safety'], essential: false, tripTypes: ['mountain', 'camping'] },
  { id: 'pet-006', name: 'Pet Vaccination Records', category: 'Pet Travel', tags: ['pet', 'documents'], essential: false, tripTypes: ['city', 'family'] },
  { id: 'pet-007', name: 'Dog Poo Bags', category: 'Pet Travel', tags: ['pet', 'hygiene', 'dog'], essential: false, tripTypes: ['city', 'camping', 'mountain'] },
  { id: 'pet-008', name: 'Pet Leash & Collar with ID Tag', category: 'Pet Travel', tags: ['pet', 'safety'], essential: false, tripTypes: ['city', 'camping', 'mountain', 'family'] },

  // ─────────────────────────────────────────────
  // WORK & BUSINESS
  // ─────────────────────────────────────────────
  { id: 'wrk-001', name: 'Business Cards', category: 'Work & Business', tags: ['networking', 'professional'], essential: false, tripTypes: ['business'] },
  { id: 'wrk-002', name: 'Notebook / Notepad', category: 'Work & Business', tags: ['notes', 'meetings'], essential: false, tripTypes: ['business', 'city'] },
  { id: 'wrk-003', name: 'Pens / Stationery', category: 'Work & Business', tags: ['writing', 'notes'], essential: false, tripTypes: ['business', 'city', 'family'] },
  { id: 'wrk-004', name: 'Laptop Stand (Portable)', category: 'Work & Business', tags: ['ergonomics', 'remote work'], essential: false, tripTypes: ['business'] },
  { id: 'wrk-005', name: 'Portable Keyboard & Mouse', category: 'Work & Business', tags: ['remote work', 'productivity'], essential: false, tripTypes: ['business'] },
  { id: 'wrk-006', name: 'Presentation Clicker', category: 'Work & Business', tags: ['presentation', 'business'], essential: false, tripTypes: ['business'] },
  { id: 'wrk-007', name: 'External Hard Drive / USB', category: 'Work & Business', tags: ['data backup', 'storage'], essential: false, tripTypes: ['business', 'backpacking'] },
  { id: 'wrk-008', name: 'Webcam (Portable)', category: 'Work & Business', tags: ['video calls', 'remote work'], essential: false, tripTypes: ['business'] },

  // ─────────────────────────────────────────────
  // PHOTOGRAPHY
  // ─────────────────────────────────────────────
  { id: 'pho-001', name: 'Camera Bag / Case', category: 'Photography', tags: ['photography', 'protection'], essential: false, tripTypes: ['city', 'mountain', 'beach', 'backpacking'] },
  { id: 'pho-002', name: 'Extra Memory Cards', category: 'Photography', tags: ['photography', 'storage'], essential: false, tripTypes: ['city', 'mountain', 'beach', 'backpacking', 'tropical'] },
  { id: 'pho-003', name: 'Extra Camera Batteries', category: 'Photography', tags: ['photography', 'power'], essential: false, tripTypes: ['city', 'mountain', 'beach', 'backpacking'] },
  { id: 'pho-004', name: 'Tripod / Gorilla Pod', category: 'Photography', tags: ['photography', 'video', 'solo'], essential: false, tripTypes: ['city', 'mountain', 'beach', 'backpacking'] },
  { id: 'pho-005', name: 'Selfie Stick', category: 'Photography', tags: ['photography', 'solo', 'family'], essential: false, tripTypes: ['city', 'beach', 'family', 'cruise'] },
  { id: 'pho-006', name: 'ND Filters / Lens Filters', category: 'Photography', tags: ['photography', 'advanced'], essential: false, tripTypes: ['mountain', 'beach', 'city'] },
  { id: 'pho-007', name: 'Lens Cleaning Kit', category: 'Photography', tags: ['photography', 'maintenance'], essential: false, tripTypes: ['city', 'mountain', 'beach', 'backpacking'] },
  { id: 'pho-008', name: 'Portable Hard Drive for Photo Backup', category: 'Photography', tags: ['photography', 'backup', 'storage'], essential: false, tripTypes: ['city', 'mountain', 'backpacking'] },

  // ─────────────────────────────────────────────
  // ENTERTAINMENT & READING
  // ─────────────────────────────────────────────
  { id: 'ent-001', name: 'Books / Novels', category: 'Entertainment & Reading', tags: ['reading', 'relaxation'], essential: false, tripTypes: ['beach', 'cruise', 'backpacking', 'city'] },
  { id: 'ent-002', name: 'Travel Journal / Diary', category: 'Entertainment & Reading', tags: ['writing', 'memories'], essential: false, tripTypes: ['city', 'backpacking', 'mountain', 'beach'] },
  { id: 'ent-003', name: 'Playing Cards / Travel Games', category: 'Entertainment & Reading', tags: ['games', 'family', 'social'], essential: false, tripTypes: ['family', 'camping', 'backpacking', 'cruise'] },
  { id: 'ent-004', name: 'Travel-sized Board Game', category: 'Entertainment & Reading', tags: ['games', 'family', 'social'], essential: false, tripTypes: ['family', 'camping', 'cruise'] },
  { id: 'ent-005', name: 'Guidebook / Phrasebook', category: 'Entertainment & Reading', tags: ['language', 'culture', 'navigation'], essential: false, tripTypes: ['city', 'backpacking', 'tropical'] },
  { id: 'ent-006', name: 'Podcasts / Music Downloaded Offline', category: 'Entertainment & Reading', tags: ['audio', 'entertainment', 'offline'], essential: false, tripTypes: ['city', 'mountain', 'backpacking', 'cruise'] },
  { id: 'ent-007', name: 'Language Learning App (Offline)', category: 'Entertainment & Reading', tags: ['language', 'culture'], essential: false, tripTypes: ['city', 'backpacking', 'tropical'] },

  // ─────────────────────────────────────────────
  // LAUNDRY & CLOTHING CARE
  // ─────────────────────────────────────────────
  { id: 'lnd-001', name: 'Travel Laundry Detergent (Sheets)', category: 'Laundry & Clothing Care', tags: ['laundry', 'long trip', 'eco'], essential: false, tripTypes: ['backpacking', 'city', 'tropical'] },
  { id: 'lnd-002', name: 'Portable Clothesline / Washing Line', category: 'Laundry & Clothing Care', tags: ['laundry', 'drying', 'camping'], essential: false, tripTypes: ['backpacking', 'camping', 'mountain'] },
  { id: 'lnd-003', name: 'Clothespins / Pegs', category: 'Laundry & Clothing Care', tags: ['laundry', 'drying'], essential: false, tripTypes: ['backpacking', 'camping', 'beach'] },
  { id: 'lnd-004', name: 'Wrinkle Release Spray', category: 'Laundry & Clothing Care', tags: ['clothing care', 'business'], essential: false, tripTypes: ['business', 'city', 'cruise'] },
  { id: 'lnd-005', name: 'Fabric Freshener Spray', category: 'Laundry & Clothing Care', tags: ['clothing care', 'odour'], essential: false, tripTypes: ['backpacking', 'city'] },
  { id: 'lnd-006', name: 'Stain Remover Pen / Wipes', category: 'Laundry & Clothing Care', tags: ['clothing care', 'stains'], essential: false, tripTypes: ['family', 'business', 'city', 'backpacking'] },
  { id: 'lnd-007', name: 'Travel Sewing Kit', category: 'Laundry & Clothing Care', tags: ['clothing repair', 'emergency'], essential: false, tripTypes: ['backpacking', 'city', 'cruise'] },

  // ─────────────────────────────────────────────
  // MISCELLANEOUS
  // ─────────────────────────────────────────────
  { id: 'msc-001', name: 'Sunglasses Case', category: 'Miscellaneous', tags: ['protection', 'organisation'], essential: false, tripTypes: ['beach', 'city', 'mountain'] },
  { id: 'msc-002', name: 'Zip-Lock Bags (Various Sizes)', category: 'Miscellaneous', tags: ['organisation', 'waterproof', 'food'], essential: false, tripTypes: ['beach', 'mountain', 'city', 'camping', 'backpacking', 'family'] },
  { id: 'msc-003', name: 'Rubber Bands / Bungee Cords', category: 'Miscellaneous', tags: ['utility', 'organisation'], essential: false, tripTypes: ['camping', 'backpacking', 'mountain'] },
  { id: 'msc-004', name: 'Sticky Notes / Markers', category: 'Miscellaneous', tags: ['organisation', 'notes'], essential: false, tripTypes: ['business', 'family'] },
  { id: 'msc-005', name: 'Gifts for Hosts / Locals', category: 'Miscellaneous', tags: ['culture', 'etiquette'], essential: false, tripTypes: ['backpacking', 'tropical', 'city'] },
  { id: 'msc-006', name: 'Laundry Bags (Dirty Clothes)', category: 'Miscellaneous', tags: ['organisation', 'laundry'], essential: false, tripTypes: ['beach', 'mountain', 'city', 'business', 'camping', 'backpacking', 'family', 'cruise'] },
  { id: 'msc-007', name: 'Travel Umbrella', category: 'Miscellaneous', tags: ['rain', 'compact'], essential: false, tripTypes: ['city', 'family', 'business'] },
  { id: 'msc-008', name: 'Spare Passport Photos', category: 'Miscellaneous', tags: ['documents', 'visa', 'emergency'], essential: false, tripTypes: ['backpacking', 'tropical', 'city'] },
  { id: 'msc-009', name: 'Tip Money / Small Bills', category: 'Miscellaneous', tags: ['money', 'etiquette'], essential: false, tripTypes: ['city', 'tropical', 'cruise', 'backpacking'] },
  { id: 'msc-010', name: 'Reusable Straw', category: 'Miscellaneous', tags: ['eco', 'drink'], essential: false, tripTypes: ['beach', 'tropical', 'backpacking', 'city'] },
  { id: 'msc-011', name: 'Mini Sewing Kit', category: 'Miscellaneous', tags: ['repair', 'clothing'], essential: false, tripTypes: ['city', 'backpacking', 'business', 'cruise'] },
  { id: 'msc-012', name: 'Spare Keys / Key Copies', category: 'Miscellaneous', tags: ['home', 'security'], essential: false, tripTypes: ['city', 'family'] },
];

// ---------------------------------------------------------------------------
// Helper: get suggestions filtered by trip type
// ---------------------------------------------------------------------------
export function getSuggestionsForTripType(tripType: string): PackingItem[] {
  return PACKING_ITEMS.filter(item => item.tripTypes.includes(tripType));
}

// ---------------------------------------------------------------------------
// Helper: get essential items (always suggest regardless of trip type)
// ---------------------------------------------------------------------------
export function getEssentialItems(): PackingItem[] {
  return PACKING_ITEMS.filter(item => item.essential);
}

// ---------------------------------------------------------------------------
// Helper: search items by name (for autocomplete)
// ---------------------------------------------------------------------------
export function searchItems(query: string): PackingItem[] {
  const q = query.toLowerCase();
  return PACKING_ITEMS.filter(item =>
    item.name.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    item.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

// ---------------------------------------------------------------------------
// Helper: get items grouped by category
// ---------------------------------------------------------------------------
export function getItemsByCategory(): Record<string, PackingItem[]> {
  return PACKING_ITEMS.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);
}