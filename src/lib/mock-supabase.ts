// Mock Supabase client for build time

export function createBrowserClient() {
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      signInWithPassword: () => Promise.resolve({ data: { session: null } }),
      signOut: () => Promise.resolve({})
    }
  }
}