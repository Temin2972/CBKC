import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

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
        (payload) => {
          console.log('New message received:', payload)
          fetchMessages() // Refetch to get sender info
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

      if (error) throw error

      console.log('Message sent:', data)
      
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
