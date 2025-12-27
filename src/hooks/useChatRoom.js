import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

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
          table: 'chat_rooms',
          filter: `student_id=eq.${userId}`
        },
        (payload) => {
          console.log('Chat room updated:', payload)
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
          status: 'active'
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
        .order('last_message_at', { ascending: false })

      if (roomsError) throw roomsError

      if (!rooms || rooms.length === 0) {
        setAllChatRooms([])
        setLoading(false)
        return
      }

      // Get student IDs
      const studentIds = rooms.map(r => r.student_id)

      // Get students info
      const { data: students, error: studentsError } = await supabase
        .from('users')
        .select('id, full_name, role')
        .in('id', studentIds)

      if (studentsError) {
        console.error('Error fetching students:', studentsError)
      }

      // Map students to rooms
      const studentsMap = {}
      if (students) {
        students.forEach(s => {
          studentsMap[s.id] = s
        })
      }

      const roomsWithStudents = rooms.map(room => ({
        ...room,
        student: studentsMap[room.student_id] || null
      }))

      // FILTER BASED ON ROLE AND counselor_id
      let filteredRooms = roomsWithStudents

      if (userRole === 'counselor') {
        // Counselors can ONLY see:
        // 1. Public rooms (counselor_id = null)
        // 2. Private rooms assigned to them (counselor_id = their id)
        filteredRooms = roomsWithStudents.filter(room => 
          room.counselor_id === null || room.counselor_id === userId
        )
      } else if (userRole === 'admin') {
        // Admins can see ALL rooms (no filtering)
        filteredRooms = roomsWithStudents
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
    refetch: userRole === 'student' ? fetchStudentChatRoom : fetchAllChatRooms
  }
}
