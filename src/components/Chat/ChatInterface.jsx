import { useState, useEffect, useRef } from 'react'
import { useChatMessages } from '../../hooks/useChatMessages'
import { useUnreadMessages } from '../../hooks/useUnreadMessages'
import { Send, Trash2 } from 'lucide-react'

export default function ChatInterface({ chatRoom, currentUser }) {
  const { messages, loading, sending, sendMessage, deleteMessage } = useChatMessages(
    chatRoom?.id,
    currentUser?.id
  )
  const { markMessagesAsRead } = useUnreadMessages(
    currentUser?.id,
    currentUser?.user_metadata?.role
  )
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)
  const hasMarkedAsRead = useRef(false)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Tự động đánh dấu tin nhắn là đã đọc khi vào chat
  useEffect(() => {
    if (chatRoom?.id && currentUser?.id && messages.length > 0 && !hasMarkedAsRead.current) {
      // Mark messages as read after a short delay to ensure user is viewing
      const timer = setTimeout(() => {
        markMessagesAsRead(chatRoom.id)
        hasMarkedAsRead.current = true
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [chatRoom?.id, currentUser?.id, messages.length, markMessagesAsRead])

  // Reset flag when chat room changes
  useEffect(() => {
    hasMarkedAsRead.current = false
  }, [chatRoom?.id])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending) return

    const { error } = await sendMessage(newMessage)
    
    if (!error) {
      setNewMessage('')
    } else {
      alert('Không thể gửi tin nhắn. Vui lòng thử lại.')
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Bạn có chắc muốn xóa tin nhắn này?')) return
    
    const { error } = await deleteMessage(messageId)
    
    if (error) {
      alert('Không thể xóa tin nhắn.')
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else {
      return date.toLocaleString('vi-VN', { 
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  const getSenderDisplayName = (message) => {
    if (!message.sender) {
      console.log('No sender data for message:', message)
      return 'Người dùng'
    }
    
    // Get role from public.users (not user_metadata)
    const role = message.sender.role
    const name = message.sender.full_name || 'Ẩn danh'
    
    console.log('Sender info:', { role, name, sender: message.sender })
    
    if (role === 'counselor') {
      return `Tư vấn viên ${name}`
    } else if (role === 'admin') {
      return `Quản trị viên ${name}`
    } else if (role === 'student') {
      return `Học sinh ${name}`
    } else {
      return name
    }
  }

  // Kiểm tra xem tin nhắn đã được đọc chưa
  const isMessageRead = (message) => {
    if (message.is_mine) return true // Tin nhắn của mình luôn coi như đã đọc
    return (message.read_by || []).includes(currentUser?.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Đang tải tin nhắn...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-250px)]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <p className="text-lg mb-2">Chưa có tin nhắn nào</p>
              <p className="text-sm">Hãy bắt đầu cuộc trò chuyện!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    message.is_mine
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  {/* Sender name */}
                  <div className={`text-xs font-semibold mb-1 ${
                    message.is_mine ? 'text-purple-200' : 'text-purple-600'
                  }`}>
                    {getSenderDisplayName(message)}
                  </div>

                  {/* Message Content */}
                  <p className="whitespace-pre-wrap break-words">
                    {message.content}
                  </p>

                  {/* Timestamp, Read status, and Delete Button */}
                  <div className="flex items-center justify-between mt-2 gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs ${
                          message.is_mine ? 'text-white/80' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </span>

                      {/* Read indicator - chỉ hiển thị cho tin nhắn của mình */}
                      {message.is_mine && (
                        <span className={`text-xs ${
                          (message.read_by || []).length > 1 
                            ? 'text-green-200' 
                            : 'text-white/60'
                        }`}>
                          {(message.read_by || []).length > 1 ? '✓✓ Đã xem' : '✓ Đã gửi'}
                        </span>
                      )}
                    </div>

                    {message.is_mine && (
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={18} />
            <span>{sending ? 'Đang gửi...' : 'Gửi'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}
