import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthResponse {
  user: User | null
  session: Session | null
  error: Error | null
}

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { user: null, session: null, error }
      }

      return { user: data.user, session: data.session, error: null }
    } catch (err) {
      return {
        user: null,
        session: null,
        error: err instanceof Error ? err : new Error('An unexpected error occurred'),
      }
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { user: null, session: null, error }
      }

      return { user: data.user, session: data.session, error: null }
    } catch (err) {
      return {
        user: null,
        session: null,
        error: err instanceof Error ? err : new Error('An unexpected error occurred'),
      }
    }
  },

  // Sign out
  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error: error ? new Error(error.message) : null }
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('An unexpected error occurred'),
      }
    }
  },

  // Get current session
  async getSession(): Promise<Session | null> {
    try {
      const { data } = await supabase.auth.getSession()
      return data.session
    } catch {
      return null
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await supabase.auth.getUser()
      return data.user
    } catch {
      return null
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null)
    })
  },
}

