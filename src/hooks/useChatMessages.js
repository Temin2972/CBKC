import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { createNotification } from './useNotifications'

export function useChatMessages(chatRoomId, currentUserId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!chatRoomId) {
      setLoading(false)
      return
    }

    fetchMessages()
    subscribeToMessages()

    return () => {
      supabase.removeAllChannels()
    }
  }, [chatRoomId])

  const fetchMessages = async () => {
    if (!chatRoomId) return

    try {
      console.log('Fetching messages for room:', chatRoomId)

      // Get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_room_id', chatRoomId)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      if (!messagesData || messagesData.length === 0) {
        console.log('No messages found')
        setMessages([])
        setLoading(false)
        return
      }

      // Get unique sender IDs
      const senderIds = [...new Set(messagesData.map(m => m.sender_id))]
      console.log('Fetching senders:', senderIds)

      // Fetch all senders from public.users (which has role directly)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, role')
        .in('id', senderIds)

      if (usersError) {
        console.error('Error fetching users:', usersError)
      }

      // Map users to messages
      const usersMap = {}
      if (usersData) {
        usersData.forEach(user => {
          usersMap[user.id] = user
        })
      }

      const messagesWithSenders = messagesData.map(msg => ({
        ...msg,
        sender: usersMap[msg.sender_id] || null,
        is_mine: msg.sender_id === currentUserId
      }))

      console.log('Fetched messages with senders:', messagesWithSenders)
      setMessages(messagesWithSenders)
    } catch (err) {
      console.error('Exception fetching messages:', err)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const subscribeToMessages = () => {
    if (!chatRoomId) return

    const channel = supabase
      .channel(`chat-messages-${chatRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoomId}`
        },
        async (payload) => {
          console.log('New message received:', payload)
          fetchMessages() // Chỉ refetch messages, KHÔNG tạo notification
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoomId}`
        },
        (payload) => {
          console.log('Message deleted:', payload)
          fetchMessages()
        }
      )
      .subscribe((status) => {
        console.log('Message subscription status:', status)
      })

    return channel
  }

  // Hàm tạo thông báo cho tin nhắn mới
  const handleNewMessageNotification = async (newMessage) => {
    try {
      console.log('📨 Creating notification for new message:', newMessage)

      // Đảm bảo message có sender_id
      if (!newMessage.sender_id) {
        console.error('❌ Message has no sender_id')
        return
      }

      // Lấy thông tin chat room
      const { data: chatRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .select('student_id, counselor_id')
        .eq('id', newMessage.chat_room_id)
        .single()

      if (roomError || !chatRoom) {
        console.error('❌ Error fetching chat room:', roomError)
        return
      }

      console.log('📋 Chat room info:', chatRoom)

      // Lấy thông tin sender
      const { data: sender, error: senderError } = await supabase
        .from('users')
        .select('id, full_name, role')
        .eq('id', newMessage.sender_id)
        .single()

      if (senderError || !sender) {
        console.error('❌ Error fetching sender:', senderError)
        return
      }

      console.log('👤 Sender info:', sender)

      const senderName = sender.full_name || 'Người dùng'
      const senderRole = sender.role

      // XÁC ĐỊNH AI SẼ NHẬN THÔNG BÁO
      let recipients = []
      let notificationType = 'new_message'
      let notificationTitle = ''
      let notificationMessage = ''

      // Case 1: CHAT RIÊNG (counselor_id !== null)
      if (chatRoom.counselor_id) {
        console.log('🔒 Private chat detected')
        
        if (senderRole === 'student') {
          // Học sinh gửi -> Thông báo cho counselor được chỉ định
          recipients.push(chatRoom.counselor_id)
          console.log('➕ Added counselor to recipients:', chatRoom.counselor_id)
          
          // Thông báo cho admin
          const { data: admins } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'admin')
          
          if (admins && admins.length > 0) {
            recipients.push(...admins.map(a => a.id))
            console.log('➕ Added admins to recipients:', admins.map(a => a.id))
          }

          notificationType = 'new_message'
          notificationTitle = '💬 Tin nhắn riêng mới'
          notificationMessage = `${senderName} đã gửi tin nhắn trong chat riêng`
          
        } else if (senderRole === 'counselor' || senderRole === 'admin') {
          // Counselor/Admin gửi -> Thông báo cho học sinh
          recipients.push(chatRoom.student_id)
          console.log('➕ Added student to recipients:', chatRoom.student_id)

          notificationType = 'counselor_replied'
          notificationTitle = '💬 Tư vấn viên đã trả lời'
          notificationMessage = `${senderName} đã trả lời tin nhắn của bạn`
        }

      } 
      // Case 2: CHAT CHUNG (counselor_id === null)
      else {
        console.log('🌐 Public chat detected')
        
        if (senderRole === 'student') {
          // Học sinh gửi -> Thông báo cho TẤT CẢ counselors và admins
          const { data: counselors } = await supabase
            .from('users')
            .select('id')
            .in('role', ['counselor', 'admin'])
          
          if (counselors) {
            recipients = counselors.map(c => c.id)
            console.log('➕ Added all counselors/admins to recipients:', recipients)
          }

          notificationType = 'new_message'
          notificationTitle = '💬 Tin nhắn mới từ học sinh'
          notificationMessage = `${senderName} đã gửi tin nhắn mới`
          
        } else if (senderRole === 'counselor' || senderRole === 'admin') {
          // Counselor gửi -> Thông báo cho học sinh
          recipients.push(chatRoom.student_id)
          console.log('➕ Added student to recipients:', chatRoom.student_id)

          notificationType = 'counselor_replied'
          notificationTitle = '💬 Tư vấn viên đã trả lời'
          notificationMessage = `${senderName} đã trả lời tin nhắn của bạn`
        }
      }

      // Loại bỏ người gửi khỏi danh sách nhận
      recipients = recipients.filter(id => id !== newMessage.sender_id)
      // Loại bỏ duplicate
      recipients = [...new Set(recipients)]

      console.log('📬 Final recipients:', recipients)

      // Tạo thông báo cho từng người nhận
      for (const recipientId of recipients) {
        console.log(`📤 Creating notification for recipient: ${recipientId}`)
        
        const result = await createNotification(
          recipientId,
          notificationType,
          notificationTitle,
          notificationMessage,
          `/chat${chatRoom.counselor_id ? `/${newMessage.chat_room_id}` : ''}`,
          {
            chat_room_id: newMessage.chat_room_id,
            sender_id: newMessage.sender_id,
            is_private: chatRoom.counselor_id !== null
          }
        )

        if (result.error) {
          console.error(`❌ Failed to create notification for ${recipientId}:`, result.error)
        } else {
          console.log(`✅ Notification created for ${recipientId}`)
        }
      }

      console.log('✅ All notifications created successfully')

    } catch (error) {
      console.error('❌ Error creating notification for new message:', error)
    }
  }

  const sendMessage = async (content) => {
    if (!currentUserId || !chatRoomId) {
      return { error: new Error('Missing user or chat room') }
    }

    if (!content.trim()) {
      return { error: new Error('Message cannot be empty') }
    }

    setSending(true)

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: chatRoomId,
          sender_id: currentUserId,
          content: content.trim()
        })
        .select()
        .single()

      if (error) throw error

      console.log('Message sent:', data)
      
      // TẠO THÔNG BÁO NGAY SAU KHI GỬI THÀNH CÔNG
      try {
        await handleNewMessageNotification(data)
        console.log('✅ Notification created after sending message')
      } catch (notifError) {
        console.error('❌ Failed to create notification:', notifError)
        // Không throw error - tin nhắn đã gửi thành công rồi
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Error sending message:', error)
      return { error }
    } finally {
      setSending(false)
    }
  }

  const deleteMessage = async (messageId) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error deleting message:', error)
      return { error }
    }
  }

  return {
    messages,
    loading,
    sending,
    sendMessage,
    deleteMessage,
    refetch: fetchMessages
  }
}
