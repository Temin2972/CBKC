// src/hooks/useOnlineStatus.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Hook để track trạng thái online của users thông qua Supabase Presence
 * @param {string[]} userIds - Mảng các user IDs cần track
 * @returns {Object} Map của userId -> boolean (online status)
 */
export function useOnlineStatus(userIds = []) {
  const [onlineStatus, setOnlineStatus] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userIds || userIds.length === 0) {
      setLoading(false)
      return
    }

    // Tạo channel để track presence
    const channelName = 'online-users'
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: 'user_id'
        }
      }
    })

    // Subscribe to presence changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const online = {}
        
        // Check which users are online
        userIds.forEach(userId => {
          online[userId] = Object.values(state).some(
            presences => presences.some(p => p.user_id === userId)
          )
        })
        
        setOnlineStatus(online)
        setLoading(false)
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [userIds?.join(',')])

  return { onlineStatus, loading }
}

/**
 * Hook để broadcast trạng thái online của user hiện tại
 * @param {string} userId - ID của user hiện tại
 */
export function useBroadcastOnline(userId) {
  useEffect(() => {
    if (!userId) return

    const channelName = 'online-users'
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: 'user_id'
        }
      }
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        // Presence synced
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track presence when subscribed
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString()
          })
        }
      })

    // Cleanup
    return () => {
      channel.unsubscribe()
    }
  }, [userId])
}

/**
 * Simplified hook - check if a single user is online
 */
export function useIsUserOnline(userId) {
  const { onlineStatus, loading } = useOnlineStatus([userId])
  return {
    isOnline: onlineStatus[userId] || false,
    loading
  }
}
