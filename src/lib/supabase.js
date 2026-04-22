import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Key are missing from .env file.');
}

// Connect DIRECTLY from the browser to Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Connection check for Console
(async () => {
  try {
    const { data, error } = await supabase.from('companies').select('count').limit(1);
    if (error) {
      console.error('🔍 Supabase Status:', error.message);
    } else {
      console.log('🚀 Supabase is READY and CONNECTED.');
    }
  } catch (err) {
    console.error('🔍 Supabase Status: Network Error', err);
  }
})();
