import { useState, useEffect, useRef, useCallback } from 'react'
import { useChatMessages } from '../../hooks/useChatMessages'
import { useUnreadMessages } from '../../hooks/useUnreadMessages'
import { Send, Trash2, Bot, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { generateAIResponse, shouldAIRespond } from '../../lib/aiTriage'

// AI Response delay in milliseconds (1 minute = 60000ms)
const AI_RESPONSE_DELAY = 60000

// AI Introduction message
const AI_INTRO_MESSAGE = `Chào em! 👋 Hiện tại các thầy cô đang bận, nhưng mình là Tâm An - trợ lý tâm lý của S-Net để giúp em trong quá trình chờ thầy cô nha! 

Mình sẵn sàng lắng nghe em chia sẻ. Em có thể kể cho mình nghe em đang cảm thấy như thế nào không? 💭`

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
  const aiTimerRef = useRef(null)
  const aiHasRespondedRef = useRef(false)
  const conversationHistoryRef = useRef([])
  const [aiProcessing, setAiProcessing] = useState(false)

  // Check if counselor has replied
  const counselorHasReplied = useCallback(() => {
    return messages.some(msg => {
      const role = msg.sender?.role
      return (role === 'counselor' || role === 'admin') && !msg.is_system
    })
  }, [messages])

  // Send AI message to chat
  const sendAIMessage = useCallback(async (content, isIntro = false) => {
    if (!chatRoom?.id) return

    try {
      await supabase.from('chat_messages').insert({
        chat_room_id: chatRoom.id,
        sender_id: null, // NULL indicates system/AI message
        content: content,
        is_system: true,
        metadata: {
          type: 'ai_triage',
          sender_name: 'Tâm An',
          is_ai: true,
          is_intro: isIntro
        }
      })
    } catch (error) {
      console.error('Error sending AI message:', error)
    }
  }, [chatRoom?.id])

  // Process student message with AI
  const processWithAI = useCallback(async (studentMessage) => {
    if (counselorHasReplied()) return

    setAiProcessing(true)

    try {
      // Add to conversation history
      conversationHistoryRef.current.push({
        content: studentMessage,
        isAI: false
      })

      // Generate AI response
      const { response, assessment } = await generateAIResponse(
        conversationHistoryRef.current,
        studentMessage
      )

      if (response && !counselorHasReplied()) {
        await sendAIMessage(response)

        // Add AI response to history
        conversationHistoryRef.current.push({
          content: response,
          isAI: true
        })

        // Update chat room with assessment if available
        if (assessment) {
          await supabase
            .from('chat_rooms')
            .update({
              urgency_level: assessment.urgencyLevel,
              ai_assessment: assessment,
              ai_triage_complete: true
            })
            .eq('id', chatRoom.id)
        }
      }
    } catch (error) {
      console.error('AI processing error:', error)
    }

    setAiProcessing(false)
  }, [chatRoom?.id, counselorHasReplied, sendAIMessage])

  // Start AI timer after student's first message
  const startAITimer = useCallback(() => {
    // Don't start if counselor has already replied or AI has already responded
    if (counselorHasReplied() || aiHasRespondedRef.current) return

    // Clear existing timer
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current)
    }

    // Set timer for AI response
    aiTimerRef.current = setTimeout(async () => {
      // Double check counselor hasn't replied
      if (!counselorHasReplied() && !aiHasRespondedRef.current) {
        aiHasRespondedRef.current = true

        // Send introduction message
        await sendAIMessage(AI_INTRO_MESSAGE, true)

        // Add to conversation history
        conversationHistoryRef.current.push({
          content: AI_INTRO_MESSAGE,
          isAI: true
        })
      }
    }, AI_RESPONSE_DELAY)
  }, [counselorHasReplied, sendAIMessage])

  // Watch for new student messages to trigger AI
  useEffect(() => {
    if (!messages || messages.length === 0) return

    const lastMessage = messages[messages.length - 1]
    const isStudentMessage = lastMessage.sender?.role === 'student' && !lastMessage.is_system
    const isCurrentUser = lastMessage.sender_id === currentUser?.id

    // If this is a student message and AI hasn't started yet, start timer
    if (isStudentMessage && !aiHasRespondedRef.current && !counselorHasReplied()) {
      startAITimer()
    }

    // If AI has already introduced, respond to new student messages
    if (isStudentMessage && aiHasRespondedRef.current && !counselorHasReplied() && isCurrentUser) {
      // Only process if this is the latest message and hasn't been processed
      const lastNonSystemMsg = messages.filter(m => !m.is_system).slice(-1)[0]
      if (lastNonSystemMsg?.id === lastMessage.id) {
        processWithAI(lastMessage.content)
      }
    }

    // Stop AI if counselor replies
    if (counselorHasReplied() && aiTimerRef.current) {
      clearTimeout(aiTimerRef.current)
      aiTimerRef.current = null
    }
  }, [messages, currentUser?.id, counselorHasReplied, startAITimer, processWithAI])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Tự động đánh dấu tin nhắn là đã đọc khi vào chat
  useEffect(() => {
    if (chatRoom?.id && currentUser?.id && messages.length > 0 && !hasMarkedAsRead.current) {
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
    aiHasRespondedRef.current = false
    conversationHistoryRef.current = []
  }, [chatRoom?.id])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim() || sending) return

    const messageContent = newMessage
    setNewMessage('')

    const { error } = await sendMessage(messageContent)

    if (error) {
      setNewMessage(messageContent)
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
    // Check if this is an AI message
    if (message.is_system && message.metadata?.is_ai) {
      return '🤖 Tâm An (Trợ lý AI)'
    }

    if (!message.sender) {
      return 'Người dùng'
    }

    const role = message.sender.role
    const name = message.sender.full_name || 'Ẩn danh'

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

  const isAIMessage = (message) => {
    return message.is_system && message.metadata?.is_ai
  }

  const isMessageRead = (message) => {
    if (message.is_mine) return true
    return (message.read_by || []).includes(currentUser?.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="typing-dot"></div>
            <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
            <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
            <span className="ml-2">Đang tải tin nhắn...</span>
          </div>
        </div>
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
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex message-enter ${isAIMessage(message)
                    ? 'justify-start'
                    : message.is_mine
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 transition-all duration-200 hover:shadow-md ${isAIMessage(message)
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                      : message.is_mine
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                >
                  {/* Sender name */}
                  <div className={`text-xs font-semibold mb-1 flex items-center gap-1 ${isAIMessage(message)
                      ? 'text-teal-100'
                      : message.is_mine
                        ? 'text-purple-200'
                        : 'text-purple-600'
                    }`}>
                    {isAIMessage(message) && <Sparkles size={12} />}
                    {getSenderDisplayName(message)}
                  </div>

                  {/* Message Content */}
                  <p className="whitespace-pre-wrap break-words">
                    {message.content}
                  </p>

                  {/* Timestamp and Delete Button */}
                  <div className="flex items-center justify-between mt-2 gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs ${isAIMessage(message) || message.is_mine
                            ? 'text-white/80'
                            : 'text-gray-500'
                          }`}
                      >
                        {formatTime(message.created_at)}
                      </span>

                      {message.is_mine && !isAIMessage(message) && (
                        <span className={`text-xs ${(message.read_by || []).length > 1
                            ? 'text-green-200'
                            : 'text-white/60'
                          }`}>
                          {(message.read_by || []).length > 1 ? '✓✓ Đã xem' : '✓ Đã gửi'}
                        </span>
                      )}
                    </div>

                    {message.is_mine && !isAIMessage(message) && (
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

            {/* AI Processing Indicator */}
            {aiProcessing && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bot size={16} className="animate-bounce" />
                    <span className="text-sm">Tâm An đang soạn tin nhắn...</span>
                  </div>
                </div>
              </div>
            )}

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
