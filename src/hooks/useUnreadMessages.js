import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useUnreadMessages(userId, userRole) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hasNewMessages, setHasNewMessages] = useState(false)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchUnreadCount()

    // Subscribe to real-time updates for new messages
    const channel = supabase
      .channel('unread-messages-tracker')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          console.log('New message detected:', payload)
          // Only count if message is not from current user
          if (payload.new.sender_id !== userId) {
            fetchUnreadCount()
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          console.log('Message updated (possibly marked as read):', payload)
          // Refetch when read_by array changes
          if (payload.new.read_by && payload.new.read_by.includes(userId)) {
            fetchUnreadCount()
          }
        }
      )
      .subscribe((status) => {
        console.log('Unread messages subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, userRole])

  const fetchUnreadCount = async () => {
    if (!userId) return

    try {
      if (userRole === 'student') {
        // For students: count unread messages in their chat room
        await fetchStudentUnreadCount()
      } else if (userRole === 'counselor' || userRole === 'admin') {
        // For counselors: count unread messages across all active rooms
        await fetchCounselorUnreadCount()
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentUnreadCount = async () => {
    // First get student's chat room
    const { data: chatRoom, error: roomError } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('student_id', userId)
      .single()

    if (roomError || !chatRoom) {
      setUnreadCount(0)
      setHasNewMessages(false)
      return
    }

    // Get unread messages (messages not sent by student and not in read_by array)
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('id, read_by, sender_id')
      .eq('chat_room_id', chatRoom.id)
      .neq('sender_id', userId)

    if (messagesError) {
      console.error('Error fetching student messages:', messagesError)
      return
    }

    // Count messages where user is not in read_by array
    const unread = messages?.filter(
      msg => !(msg.read_by || []).includes(userId)
    ).length || 0

    setUnreadCount(unread)
    setHasNewMessages(unread > 0)
  }

  const fetchCounselorUnreadCount = async () => {
    // Get all active chat rooms
    const { data: chatRooms, error: roomsError } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('status', 'active')

    if (roomsError || !chatRooms || chatRooms.length === 0) {
      setUnreadCount(0)
      setHasNewMessages(false)
      return
    }

    const roomIds = chatRooms.map(room => room.id)

    // Get unread messages across all rooms (not sent by counselor and not in read_by)
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('id, read_by, sender_id')
      .in('chat_room_id', roomIds)
      .neq('sender_id', userId)

    if (messagesError) {
      console.error('Error fetching counselor messages:', messagesError)
      return
    }

    // Count messages where counselor is not in read_by array
    const unread = messages?.filter(
      msg => !(msg.read_by || []).includes(userId)
    ).length || 0

    setUnreadCount(unread)
    setHasNewMessages(unread > 0)
  }

  // Function to mark messages as read
  const markMessagesAsRead = async (chatRoomId) => {
    if (!userId || !chatRoomId) return

    try {
      // Get all unread messages in this chat room
      const { data: messages, error: fetchError } = await supabase
        .from('chat_messages')
        .select('id, read_by')
        .eq('chat_room_id', chatRoomId)
        .neq('sender_id', userId)

      if (fetchError) throw fetchError

      if (!messages || messages.length === 0) return

      // Filter messages that haven't been read by current user
      const unreadMessages = messages.filter(
        msg => !(msg.read_by || []).includes(userId)
      )

      // Update each unread message to add current user to read_by array
      for (const msg of unreadMessages) {
        const newReadBy = [...(msg.read_by || []), userId]
        
        await supabase
          .from('chat_messages')
          .update({ read_by: newReadBy })
          .eq('id', msg.id)
      }

      // Refetch count after marking as read
      await fetchUnreadCount()
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  return {
    unreadCount,
    hasNewMessages,
    loading,
    refetch: fetchUnreadCount,
    markMessagesAsRead
  }
}
