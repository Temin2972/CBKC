import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { createNotification } from './useNotifications'

// Urgency level constants
export const URGENCY_LEVELS = {
  COMPLETED: -1,  // Counseling completed
  NORMAL: 0,
  ATTENTION: 1,
  URGENT: 2,
  CRITICAL: 3
}

export const URGENCY_LABELS = {
  [URGENCY_LEVELS.COMPLETED]: { label: 'Đã hoàn thành', color: 'gray', icon: '✅' },
  [URGENCY_LEVELS.NORMAL]: { label: 'Bình thường', color: 'green', icon: '🟢' },
  [URGENCY_LEVELS.ATTENTION]: { label: 'Cần chú ý', color: 'yellow', icon: '🟡' },
  [URGENCY_LEVELS.URGENT]: { label: 'Khẩn cấp', color: 'orange', icon: '🟠' },
  [URGENCY_LEVELS.CRITICAL]: { label: 'Rất khẩn cấp', color: 'red', icon: '🔴' }
}

export function useChatRoom(userId, userRole) {
  const [chatRoom, setChatRoom] = useState(null)
  const [allChatRooms, setAllChatRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    if (userRole === 'student') {
      // Students: fetch their own chat room
      fetchStudentChatRoom()
      subscribeToStudentChatRoom()
    } else if (userRole === 'counselor' || userRole === 'admin') {
      // Counselors: fetch chat rooms they have access to
      fetchAllChatRooms()
      subscribeToCounselorChatRooms()
    }

    return () => {
      supabase.removeAllChannels()
    }
  }, [userId, userRole])

  // ============================================================
  // STUDENT FUNCTIONS
  // ============================================================

  const fetchStudentChatRoom = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          counselor:users!chat_rooms_counselor_id_fkey(id, full_name, role)
        `)
        .eq('student_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is okay
        console.error('Error fetching chat room:', error)
        setError(error)
      } else {
        setChatRoom(data)
      }
    } catch (err) {
      console.error('Exception fetching chat room:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToStudentChatRoom = () => {
    const channel = supabase
      .channel(`student-chat-room-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms'
        },
        (payload) => {
          // Filter client-side to avoid binding mismatch
          const record = payload.new || payload.old
          if (record?.student_id !== userId) return
          
          console.log('Chat room updated:', payload.eventType)
          if (payload.eventType === 'DELETE') {
            setChatRoom(null)
          } else {
            fetchStudentChatRoom()
          }
        }
      )
      .subscribe()

    return channel
  }

  const createChatRoom = async () => {
    if (chatRoom) {
      return { error: new Error('Chat room already exists') }
    }

    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          student_id: userId,
          status: 'active',
          urgency_level: URGENCY_LEVELS.NORMAL
        })
        .select()
        .single()

      if (error) throw error

      setChatRoom(data)
      return { data, error: null }
    } catch (error) {
      console.error('Error creating chat room:', error)
      return { error }
    }
  }

  const deleteChatRoom = async (roomId = null) => {
    const idToDelete = roomId || chatRoom?.id

    if (!idToDelete) {
      return { error: new Error('No chat room to delete') }
    }

    try {
      const { error } = await supabase
        .from('chat_rooms')
        .delete()
        .eq('id', idToDelete)

      if (error) throw error

      setChatRoom(null)
      return { error: null }
    } catch (error) {
      console.error('Error deleting chat room:', error)
      return { error }
    }
  }

  // ============================================================
  // COUNSELOR FUNCTIONS
  // ============================================================

  const fetchAllChatRooms = async () => {
    try {
      // Fetch ALL active chat rooms first
      const { data: rooms, error: roomsError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('status', 'active')
        .order('urgency_level', { ascending: false }) // Urgent first
        .order('last_message_at', { ascending: false })

      if (roomsError) throw roomsError

      if (!rooms || rooms.length === 0) {
        setAllChatRooms([])
        setLoading(false)
        return
      }

      // Get student IDs and counselor IDs
      const studentIds = rooms.map(r => r.student_id).filter(Boolean)
      const counselorIds = rooms.map(r => r.counselor_id).filter(Boolean)
      const allUserIds = [...new Set([...studentIds, ...counselorIds])]

      // Get users info
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, role')
        .in('id', allUserIds)

      if (usersError) {
        console.error('Error fetching users:', usersError)
      }

      // Map users to rooms
      const usersMap = {}
      if (users) {
        users.forEach(u => {
          usersMap[u.id] = u
        })
      }

      const roomsWithUsers = rooms.map(room => ({
        ...room,
        student: usersMap[room.student_id] || null,
        counselor: usersMap[room.counselor_id] || null
      }))

      // FILTER BASED ON ROLE AND counselor_id
      let filteredRooms = roomsWithUsers

      if (userRole === 'counselor') {
        // Counselors can ONLY see:
        // 1. Public rooms (counselor_id = null)
        // 2. Private rooms assigned to them (counselor_id = their id)
        filteredRooms = roomsWithUsers.filter(room =>
          room.counselor_id === null || room.counselor_id === userId
        )
      } else if (userRole === 'admin') {
        // Admins can see ALL rooms (no filtering)
        filteredRooms = roomsWithUsers
      }

      setAllChatRooms(filteredRooms)
    } catch (err) {
      console.error('Exception fetching chat rooms:', err)
      setError(err)
      setAllChatRooms([])
    } finally {
      setLoading(false)
    }
  }

  const subscribeToCounselorChatRooms = () => {
    const channel = supabase
      .channel('all-chat-rooms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms'
        },
        (payload) => {
          console.log('Chat rooms updated:', payload)
          fetchAllChatRooms()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          console.log('New message, updating room order:', payload)
          fetchAllChatRooms()
        }
      )
      .subscribe()

    return channel
  }

  // ============================================================
  // CHAT TRANSFER/HANDOFF
  // ============================================================

  /**
   * Transfer a chat room to another counselor
   * @param {string} roomId - Chat room ID
   * @param {string} toCounselorId - Target counselor ID
   * @param {string} reason - Reason for transfer (optional)
   * @param {string} fromCounselorName - Name of current counselor
   */
  const transferChatRoom = async (roomId, toCounselorId, reason = '', fromCounselorName = '') => {
    try {
      // Get current room info
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .select('*, student:users!chat_rooms_student_id_fkey(id, full_name)')
        .eq('id', roomId)
        .single()

      if (roomError) throw roomError

      // Log the transfer (create a chat_transfers record)
      const { error: logError } = await supabase
        .from('chat_transfers')
        .insert({
          chat_room_id: roomId,
          from_counselor_id: userId,
          to_counselor_id: toCounselorId,
          reason: reason,
          student_id: room.student_id
        })

      // If table doesn't exist, that's okay - we'll still do the transfer
      if (logError && !logError.message.includes('does not exist')) {
        console.warn('Could not log transfer:', logError)
      }

      // Update the room's counselor
      const { error: updateError } = await supabase
        .from('chat_rooms')
        .update({
          counselor_id: toCounselorId,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId)

      if (updateError) throw updateError

      // Notify the new counselor
      const studentName = room.student?.full_name || 'Học sinh'
      await createNotification(
        toCounselorId,
        'chat_transfer',
        '🔄 Chat được chuyển giao cho bạn',
        `${fromCounselorName || 'Tư vấn viên khác'} đã chuyển chat với ${studentName} cho bạn.${reason ? ` Lý do: ${reason}` : ''}`,
        '/chat',
        { chat_room_id: roomId, from_counselor_id: userId }
      )

      // Notify the student
      await createNotification(
        room.student_id,
        'chat_transfer',
        '👋 Tư vấn viên mới sẽ hỗ trợ bạn',
        'Chat của bạn đã được chuyển sang tư vấn viên khác. Họ sẽ tiếp tục hỗ trợ bạn.',
        '/chat',
        { chat_room_id: roomId }
      )

      // Send a system message in the chat
      await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: roomId,
          sender_id: userId,
          content: `📋 Chat đã được chuyển giao sang tư vấn viên khác.${reason ? ` Lý do: ${reason}` : ''}`,
          is_system: true
        })

      // Refresh the rooms list
      fetchAllChatRooms()

      return { error: null }
    } catch (error) {
      console.error('Error transferring chat:', error)
      return { error }
    }
  }

  // ============================================================
  // URGENCY LEVEL MANAGEMENT
  // ============================================================

  /**
   * Set the urgency level of a chat room
   * @param {string} roomId - Chat room ID
   * @param {number} level - Urgency level (0-3)
   */
  const setUrgencyLevel = async (roomId, level) => {
    try {
      if (level < 0 || level > 3) {
        throw new Error('Invalid urgency level')
      }

      const { error } = await supabase
        .from('chat_rooms')
        .update({
          urgency_level: level,
          updated_at: new Date().toISOString()
        })
        .eq('id', roomId)

      if (error) throw error

      // If setting to critical, notify all admins
      if (level === URGENCY_LEVELS.CRITICAL) {
        const { data: admins } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'admin')

        if (admins && admins.length > 0) {
          const { data: room } = await supabase
            .from('chat_rooms')
            .select('student:users!chat_rooms_student_id_fkey(full_name)')
            .eq('id', roomId)
            .single()

          const studentName = room?.student?.full_name || 'Học sinh'

          for (const admin of admins) {
            await createNotification(
              admin.id,
              'urgent_case',
              '🔴 Case RẤT KHẨN CẤP',
              `Chat với ${studentName} đã được đánh dấu là rất khẩn cấp. Cần can thiệp ngay!`,
              '/chat',
              { chat_room_id: roomId, urgency_level: level }
            )
          }
        }
      }

      // Refresh to update UI
      if (userRole === 'student') {
        fetchStudentChatRoom()
      } else {
        fetchAllChatRooms()
      }

      return { error: null }
    } catch (error) {
      console.error('Error setting urgency level:', error)
      return { error }
    }
  }

  /**
   * Get the urgency info for a level
   * @param {number} level - Urgency level
   */
  const getUrgencyInfo = (level) => {
    return URGENCY_LABELS[level] || URGENCY_LABELS[URGENCY_LEVELS.NORMAL]
  }

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // Student data
    chatRoom,

    // Counselor data
    allChatRooms,

    // Common
    loading,
    error,

    // Actions
    createChatRoom,
    deleteChatRoom,
    refetch: userRole === 'student' ? fetchStudentChatRoom : fetchAllChatRooms,

    // Transfer
    transferChatRoom,

    // Urgency
    setUrgencyLevel,
    getUrgencyInfo,
    URGENCY_LEVELS,
    URGENCY_LABELS
  }
}
