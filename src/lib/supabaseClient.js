/**
 * Supabase Client with Demo Mode Support
 * Supports both real Supabase backend and local demo mode for testing
 */
import { createClient } from '@supabase/supabase-js'
import {
  DEMO_USERS,
  DEMO_POSTS,
  DEMO_COMMENTS,
  DEMO_CHAT_ROOMS,
  DEMO_MESSAGES,
  DEMO_NOTIFICATIONS,
  DEMO_SURVEYS,
  DEMO_FEEDBACKS,
  DEMO_SUGGESTIONS,
  DEMO_FLAGGED_CONTENT,
  DEMO_QUOTES
} from './demoData'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Demo mode when env vars are missing
const isDemoMode = !supabaseUrl || !supabaseAnonKey

if (isDemoMode) {
  console.info('🎮 Demo Mode Active: Using local mock data for testing')
  console.info('📝 Available demo accounts:')
  console.info('   - student1 / 123456 (Học sinh)')
  console.info('   - student2 / 123456 (Học sinh)')
  console.info('   - counselor1@school.edu.vn / 123456 (Tư vấn viên)')
  console.info('   - counselor2@school.edu.vn / 123456 (Tư vấn viên)')
  console.info('   - admin@school.edu.vn / 123456 (Admin)')
}

// In-memory state for demo mode
let demoState = {
  currentUser: null,
  session: null,
  posts: [...DEMO_POSTS],
  comments: [...DEMO_COMMENTS],
  chatRooms: [...DEMO_CHAT_ROOMS],
  messages: [...DEMO_MESSAGES],
  notifications: [...DEMO_NOTIFICATIONS],
  surveys: [...DEMO_SURVEYS],
  feedbacks: [...DEMO_FEEDBACKS],
  suggestions: [...DEMO_SUGGESTIONS],
  flaggedContent: [...DEMO_FLAGGED_CONTENT],
  authListeners: new Set()
}

// Helper to get user by credentials
function getDemoUser(identifier, password) {
  if (password !== '123456') return null
  
  const normalizedId = identifier.toLowerCase()
  
  // Check all users
  for (const [key, user] of Object.entries(DEMO_USERS)) {
    if (
      user.email.toLowerCase() === normalizedId ||
      user.user_metadata.username.toLowerCase() === normalizedId ||
      `${user.user_metadata.username}.student@mentalhealth.app`.toLowerCase() === normalizedId
    ) {
      return user
    }
  }
  return null
}

// Generate unique ID
function generateId() {
  return 'demo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

// Notify auth listeners
function notifyAuthChange(event, session) {
  demoState.authListeners.forEach(callback => {
    try {
      callback(event, session)
    } catch (e) {
      console.error('Auth listener error:', e)
    }
  })
}

// Create mock Supabase client for demo mode
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ 
      data: { session: demoState.session },
      error: null 
    }),
    
    onAuthStateChange: (callback) => {
      demoState.authListeners.add(callback)
      // Call immediately with current state
      setTimeout(() => callback('INITIAL_SESSION', demoState.session), 0)
      return { 
        data: { 
          subscription: { 
            unsubscribe: () => demoState.authListeners.delete(callback) 
          } 
        } 
      }
    },
    
    signUp: async ({ email, password, options }) => {
      // Check if user already exists
      const existingUser = getDemoUser(email, '123456')
      if (existingUser) {
        return { data: null, error: { message: 'User already registered' } }
      }
      
      // Create new demo user
      const newUser = {
        id: generateId(),
        email,
        user_metadata: {
          ...options?.data,
          created_at: new Date().toISOString()
        }
      }
      
      // Add to demo users (in memory)
      const username = options?.data?.username || email.split('@')[0]
      DEMO_USERS[username] = newUser
      
      return { data: { user: newUser }, error: null }
    },
    
    signInWithPassword: async ({ email, password }) => {
      const user = getDemoUser(email, password)
      
      if (!user) {
        return { 
          data: null, 
          error: { message: 'Tên đăng nhập hoặc mật khẩu không đúng' } 
        }
      }
      
      const session = {
        user,
        access_token: 'demo-token-' + Date.now(),
        expires_at: Date.now() + 3600000
      }
      
      demoState.currentUser = user
      demoState.session = session
      
      // Notify listeners
      notifyAuthChange('SIGNED_IN', session)
      
      return { data: { user, session }, error: null }
    },
    
    signOut: async () => {
      const previousSession = demoState.session
      demoState.currentUser = null
      demoState.session = null
      
      // Notify listeners
      notifyAuthChange('SIGNED_OUT', null)
      
      return { error: null }
    },
  },
  
  // Query builder mock
  from: (table) => createQueryBuilder(table),
  
  // Channel mock for realtime
  channel: (name) => {
    const channelObj = {
      on: (event, filter, callback) => channelObj, // Return self for chaining
      subscribe: (statusCallback) => {
        if (statusCallback) setTimeout(() => statusCallback('SUBSCRIBED'), 0)
        return channelObj
      },
      unsubscribe: () => Promise.resolve('ok')
    }
    return channelObj
  },
  
  removeChannel: () => Promise.resolve('ok'),
  removeAllChannels: () => Promise.resolve([]),
  
  // Storage mock
  storage: {
    from: (bucket) => ({
      upload: async (path, file) => {
        // Mock upload - just return success
        return { data: { path }, error: null }
      },
      getPublicUrl: (path) => ({
        data: { publicUrl: `/mock-storage/${path}` }
      }),
      remove: async (paths) => ({ data: paths, error: null })
    })
  }
})

// Create query builder for mock database operations
function createQueryBuilder(table) {
  let queryState = {
    table,
    filters: [],
    orderBy: null,
    limitCount: null,
    data: null
  }
  
  const getTableData = () => {
    switch (table) {
      case 'posts': return demoState.posts
      case 'comments': return demoState.comments
      case 'chat_rooms': return demoState.chatRooms
      case 'chat_messages': return demoState.messages
      case 'notifications': return demoState.notifications
      case 'surveys': return demoState.surveys
      case 'survey_responses': return []
      case 'feedbacks': return demoState.feedbacks
      case 'suggestions': return demoState.suggestions
      case 'flagged_content': return demoState.flaggedContent
      case 'quotes': return DEMO_QUOTES
      case 'users': 
      case 'profiles':
        return Object.values(DEMO_USERS).map(u => ({
          id: u.id,
          email: u.email,
          ...u.user_metadata
        }))
      default: return []
    }
  }
  
  const setTableData = (newData) => {
    switch (table) {
      case 'posts': demoState.posts = newData; break
      case 'comments': demoState.comments = newData; break
      case 'chat_rooms': demoState.chatRooms = newData; break
      case 'chat_messages': demoState.messages = newData; break
      case 'notifications': demoState.notifications = newData; break
      case 'feedbacks': demoState.feedbacks = newData; break
      case 'suggestions': demoState.suggestions = newData; break
      case 'flagged_content': demoState.flaggedContent = newData; break
    }
  }
  
  const applyFilters = (data) => {
    let result = [...data]
    
    for (const filter of queryState.filters) {
      result = result.filter(item => {
        if (filter.op === 'eq') return item[filter.column] === filter.value
        if (filter.op === 'neq') return item[filter.column] !== filter.value
        if (filter.op === 'in') return filter.value.includes(item[filter.column])
        if (filter.op === 'is') return filter.value === null ? item[filter.column] == null : item[filter.column] != null
        if (filter.op === 'contains') {
          const arr = item[filter.column]
          return Array.isArray(arr) && arr.some(v => filter.value.includes(v))
        }
        if (filter.op === 'not_contains') {
          const arr = item[filter.column]
          return !Array.isArray(arr) || !arr.some(v => filter.value.includes(v))
        }
        if (filter.op === 'or') return true // Complex OR handled separately
        return true
      })
    }
    
    if (queryState.orderBy) {
      result.sort((a, b) => {
        const valA = a[queryState.orderBy.column]
        const valB = b[queryState.orderBy.column]
        const cmp = valA < valB ? -1 : valA > valB ? 1 : 0
        return queryState.orderBy.ascending ? cmp : -cmp
      })
    }
    
    if (queryState.limitCount) {
      result = result.slice(0, queryState.limitCount)
    }
    
    return result
  }
  
  const builder = {
    select: (columns = '*', options = {}) => {
      queryState.columns = columns
      queryState.selectOptions = options
      return builder
    },
    
    insert: (data) => {
      queryState.data = Array.isArray(data) ? data : [data]
      queryState.operation = 'insert'
      return builder
    },
    
    update: (data) => {
      queryState.data = data
      queryState.operation = 'update'
      return builder
    },
    
    delete: () => {
      queryState.operation = 'delete'
      return builder
    },
    
    upsert: (data) => {
      queryState.data = Array.isArray(data) ? data : [data]
      queryState.operation = 'upsert'
      return builder
    },
    
    eq: (column, value) => {
      queryState.filters.push({ column, value, op: 'eq' })
      return builder
    },
    
    neq: (column, value) => {
      queryState.filters.push({ column, value, op: 'neq' })
      return builder
    },
    
    in: (column, values) => {
      queryState.filters.push({ column, value: values, op: 'in' })
      return builder
    },
    
    is: (column, value) => {
      queryState.filters.push({ column, value, op: 'is' })
      return builder
    },
    
    or: (conditions) => {
      queryState.filters.push({ op: 'or', conditions })
      return builder
    },
    
    contains: (column, value) => {
      queryState.filters.push({ column, value, op: 'contains' })
      return builder
    },
    
    not: (column, op, value) => {
      queryState.filters.push({ column, value, op: 'not_' + op })
      return builder
    },

    order: (column, { ascending = true } = {}) => {
      queryState.orderBy = { column, ascending }
      return builder
    },
    
    limit: (count) => {
      queryState.limitCount = count
      return builder
    },
    
    range: (from, to) => {
      // For pagination
      return builder
    },
    
    single: async () => {
      const tableData = getTableData()
      const filtered = applyFilters(tableData)
      return { 
        data: filtered[0] || null, 
        error: null 
      }
    },
    
    maybeSingle: async () => {
      const tableData = getTableData()
      const filtered = applyFilters(tableData)
      return { data: filtered[0] || null, error: null }
    },
    
    // Make builder thenable for async/await support
    then: function(resolve, reject) {
      const executeQuery = () => {
        let result
        
        // Handle count query
        if (queryState.selectOptions?.count === 'exact' && queryState.selectOptions?.head) {
          const tableData = getTableData()
          const filtered = applyFilters(tableData)
          result = { count: filtered.length, data: null, error: null }
        }
        else if (queryState.operation === 'insert') {
          const newItems = queryState.data.map(item => ({
            id: item.id || generateId(),
            ...item,
            created_at: item.created_at || new Date().toISOString()
          }))
          const tableData = getTableData()
          setTableData([...tableData, ...newItems])
          result = { data: newItems, error: null }
        } 
        else if (queryState.operation === 'update') {
          const tableData = getTableData()
          const updated = tableData.map(item => {
            const matches = queryState.filters.every(f => {
              if (f.op === 'eq') return item[f.column] === f.value
              return true
            })
            return matches ? { ...item, ...queryState.data } : item
          })
          setTableData(updated)
          result = { data: queryState.data, error: null }
        }
        else if (queryState.operation === 'delete') {
          const tableData = getTableData()
          const remaining = tableData.filter(item => {
            return !queryState.filters.every(f => {
              if (f.op === 'eq') return item[f.column] === f.value
              return true
            })
          })
          setTableData(remaining)
          result = { data: null, error: null }
        }
        else {
          // Select
          const tableData = getTableData()
          const filtered = applyFilters(tableData)
          result = { data: filtered, error: null }
        }
        
        return result
      }
      
      try {
        const result = executeQuery()
        if (resolve) resolve(result)
        return result
      } catch (err) {
        if (reject) reject(err)
        throw err
      }
    }
  }
  
  return builder
}

// Export the client
export const supabase = isDemoMode 
  ? createMockClient() 
  : createClient(supabaseUrl, supabaseAnonKey)

export { isDemoMode }

// Export demo state accessor for components that need it
export const getDemoState = () => isDemoMode ? demoState : null

// Reset demo state (useful for testing)
export const resetDemoState = () => {
  if (!isDemoMode) return
  
  demoState = {
    currentUser: null,
    session: null,
    posts: [...DEMO_POSTS],
    comments: [...DEMO_COMMENTS],
    chatRooms: [...DEMO_CHAT_ROOMS],
    messages: [...DEMO_MESSAGES],
    notifications: [...DEMO_NOTIFICATIONS],
    surveys: [...DEMO_SURVEYS],
    feedbacks: [...DEMO_FEEDBACKS],
    suggestions: [...DEMO_SUGGESTIONS],
    flaggedContent: [...DEMO_FLAGGED_CONTENT],
    authListeners: new Set()
  }
}
