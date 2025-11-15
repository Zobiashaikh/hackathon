import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Better error messages for debugging
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is missing!')
  console.error('Please add VITE_SUPABASE_URL to your .env file')
  throw new Error('Missing VITE_SUPABASE_URL. Please check your .env file and restart the dev server.')
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is missing!')
  console.error('Please add VITE_SUPABASE_ANON_KEY to your .env file')
  throw new Error('Missing VITE_SUPABASE_ANON_KEY. Please check your .env file and restart the dev server.')
}

// Log successful initialization (only in dev)
if (import.meta.env.DEV) {
  console.log('✅ Supabase client initialized')
  console.log('URL:', supabaseUrl.substring(0, 30) + '...')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

