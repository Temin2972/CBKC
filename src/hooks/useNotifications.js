import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchNotifications()
    subscribeToNotifications()

    return () => {
      supabase.removeAllChannels()
    }
  }, [userId])

  const fetchNotifications = async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50) // Giới hạn 50 thông báo gần nhất

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount((data || []).filter(n => !n.is_read).length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification:', payload)
          fetchNotifications()
          
          // Hiển thị browser notification nếu được phép
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(payload.new.title, {
              body: payload.new.message,
              icon: '/icon.svg',
              badge: '/icon.svg'
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchNotifications()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchNotifications()
        }
      )
      .subscribe()

    return channel
  }

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) throw error

      // Cập nhật local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error

      // Cập nhật local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) throw error

      // Cập nhật local state
      const notification = notifications.find(n => n.id === notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const deleteAllRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .eq('is_read', true)

      if (error) throw error

      // Cập nhật local state
      setNotifications(prev => prev.filter(n => !n.is_read))
    } catch (error) {
      console.error('Error deleting read notifications:', error)
    }
  }

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    requestNotificationPermission,
    refetch: fetchNotifications
  }
}

// Helper function to create notification (call from backend/edge functions ideally)
export async function createNotification(userId, type, title, message, link = null, data = null) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        link,
        data
      })

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { error }
  }
}
