/**
 * Authentication Context Provider
 * Centralizes authentication state and methods
 */
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { STUDENT_EMAIL_DOMAIN, USER_ROLES } from '../constants'
import { isEmail } from '../utils/validation'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  /**
   * Sign up as a student with username
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {string} fullName - Full name
   */
  const signUpStudent = useCallback(async (username, password, fullName) => {
    try {
      const email = `${username}.student@${STUDENT_EMAIL_DOMAIN}`

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
            role: USER_ROLES.STUDENT,
          },
        },
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    }
  }, [])

  /**
   * Sign up with email (for counselors)
   * @param {string} email - Email
   * @param {string} password - Password
   * @param {Object} metadata - User metadata
   */
  const signUpWithEmail = useCallback(async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    }
  }, [])

  /**
   * Sign in with username or email
   * @param {string} identifier - Username or email
   * @param {string} password - Password
   */
  const signIn = useCallback(async (identifier, password) => {
    try {
      // Convert username to email format if needed
      const email = isEmail(identifier)
        ? identifier
        : `${identifier}.student@${STUDENT_EMAIL_DOMAIN}`

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    }
  }, [])

  /**
   * Sign out current user
   */
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    }
  }, [])

  // Memoized user info helpers
  const userInfo = useMemo(
    () => ({
      id: user?.id,
      email: user?.email,
      role: user?.user_metadata?.role,
      fullName: user?.user_metadata?.full_name,
      username: user?.user_metadata?.username,
      avatar: user?.user_metadata?.avatar_url,
      isCounselor:
        user?.user_metadata?.role === USER_ROLES.COUNSELOR ||
        user?.user_metadata?.role === USER_ROLES.ADMIN,
      isAdmin: user?.user_metadata?.role === USER_ROLES.ADMIN,
      isStudent: user?.user_metadata?.role === USER_ROLES.STUDENT,
    }),
    [user]
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      ...userInfo,
      signIn,
      signOut,
      signUpStudent,
      signUpWithEmail,
    }),
    [user, loading, userInfo, signIn, signOut, signUpStudent, signUpWithEmail]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

export default AuthContext
