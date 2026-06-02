// frontend/src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔑 Supabase URL:', supabaseUrl);

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test query on init
supabase.from('voting_boards').select('id').limit(1).then(({ data, error }) => {
  console.log('🧪 Test query:', { data, error });
});

void supabase.from('voting_boards').select('id').limit(1).then(({ data, error }) => {
  console.log('🧪 data:', data, 'error:', error);
});

fetch('http://127.0.0.1:54321/rest/v1/voting_boards?limit=1', {
  headers: {
    'apikey': 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
    'Authorization': 'Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
  }
}).then(r => r.json()).then(console.log).catch(console.error)