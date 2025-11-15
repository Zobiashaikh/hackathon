import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService } from '../services/auth'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    authService.getSession().then((session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen to auth state changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    const result = await authService.signUp(email, password)
    if (result.error) {
      return { error: result.error }
    }
    setUser(result.user)
    return { error: null }
  }

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password)
    if (result.error) {
      return { error: result.error }
    }
    setUser(result.user)
    return { error: null }
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

