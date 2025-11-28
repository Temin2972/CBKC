import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { FLAG_LEVELS } from '../lib/contentModeration'

export function useFlaggedContent() {
  const [flaggedItems, setFlaggedItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFlaggedContent()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('flagged-content-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flagged_content'
        },
        () => {
          fetchFlaggedContent()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchFlaggedContent = async () => {
    try {
      // Fetch flagged content with user info
      const { data, error } = await supabase
        .from('flagged_content')
        .select(`
          *,
          user:users!flagged_content_user_id_fkey(id, full_name, email, role)
        `)
        .eq('is_resolved', false)
        .order('flag_level', { ascending: false }) // Higher levels first
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group by user for display
      const groupedByUser = groupItemsByUser(data || [])
      setFlaggedItems(groupedByUser)

    } catch (error) {
      console.error('Error fetching flagged content:', error)
      setFlaggedItems([])
    } finally {
      setLoading(false)
    }
  }

  // Group flagged items by user
  const groupItemsByUser = (items) => {
    const userMap = new Map()

    items.forEach(item => {
      const userId = item.user_id
      
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user: item.user,
          userId: userId,
          highestFlagLevel: item.flag_level,
          items: []
        })
      }

      const userGroup = userMap.get(userId)
      userGroup.items.push(item)
      
      // Update highest flag level
      if (item.flag_level > userGroup.highestFlagLevel) {
        userGroup.highestFlagLevel = item.flag_level
      }
    })

    // Convert to array and sort by highest flag level
    return Array.from(userMap.values()).sort((a, b) => {
      // Sort by flag level first (higher = more urgent)
      if (b.highestFlagLevel !== a.highestFlagLevel) {
        return b.highestFlagLevel - a.highestFlagLevel
      }
      // Then by most recent item
      const aLatest = Math.max(...a.items.map(i => new Date(i.created_at).getTime()))
      const bLatest = Math.max(...b.items.map(i => new Date(i.created_at).getTime()))
      return bLatest - aLatest
    })
  }

  // Mark a flagged item as resolved
  const resolveItem = async (itemId) => {
    try {
      const { error } = await supabase
        .from('flagged_content')
        .update({ 
          is_resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', itemId)

      if (error) throw error

      // Refresh the list
      await fetchFlaggedContent()
      return { error: null }
    } catch (error) {
      console.error('Error resolving flagged item:', error)
      return { error }
    }
  }

  // Mark all items for a user as resolved
  const resolveAllForUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('flagged_content')
        .update({ 
          is_resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_resolved', false)

      if (error) throw error

      await fetchFlaggedContent()
      return { error: null }
    } catch (error) {
      console.error('Error resolving items for user:', error)
      return { error }
    }
  }

  // Get counts by flag level
  const getCounts = () => {
    let immediate = 0
    let mild = 0

    flaggedItems.forEach(group => {
      if (group.highestFlagLevel === FLAG_LEVELS.IMMEDIATE) {
        immediate++
      } else if (group.highestFlagLevel === FLAG_LEVELS.MILD) {
        mild++
      }
    })

    return { immediate, mild, total: flaggedItems.length }
  }

  return {
    flaggedItems,
    loading,
    resolveItem,
    resolveAllForUser,
    getCounts,
    refetch: fetchFlaggedContent
  }
}
