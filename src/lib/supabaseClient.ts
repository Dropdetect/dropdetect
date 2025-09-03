import { createBrowserClient as originalCreateBrowserClient } from '@supabase/auth-helpers-nextjs'
import { createBrowserClient as mockCreateBrowserClient } from './mock-supabase'

// Use mock client during build time
const createBrowserClient = 
  typeof process !== 'undefined' && 
  process.env.NODE_ENV === 'production' && 
  process.env.NEXT_PHASE === 'phase-production-build' 
    ? mockCreateBrowserClient 
    : originalCreateBrowserClient

export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.com',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key'
  )
}


