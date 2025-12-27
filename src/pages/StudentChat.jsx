import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useChatRoom } from '../hooks/useChatRoom'
import { useQuotes } from '../hooks/useQuotes'
import { useCounselors } from '../hooks/useCounselors'
import { useBroadcastOnline } from '../hooks/useOnlineStatus'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Layout/Navbar'
import ChatInterface from '../components/Chat/ChatInterface'
import CounselorSelector from '../components/Chat/CounselorSelector'
import { MessageCircle, Trash2, Plus, AlertCircle, Users, Eye, EyeOff } from 'lucide-react'

export default function StudentChat() {
  const { user } = useAuth()
  const { chatRoom, loading, createChatRoom, deleteChatRoom } = useChatRoom(
    user?.id,
    'student'
  )
  const { quote, loading: quoteLoading } = useQuotes()
  const { counselors, loading: counselorsLoading } = useCounselors()
  
  // Broadcast online status
  useBroadcastOnline(user?.id)
  
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showCounselorSelector, setShowCounselorSelector] = useState(false)

  // Get counselor info if this is a private chat
  const privateCounselor = chatRoom?.counselor_id 
    ? counselors.find(c => c.id === chatRoom.counselor_id)
    : null

  const handleShowCounselorSelector = () => {
    setShowCounselorSelector(true)
  }

  const handleCancelSelection = () => {
    setShowCounselorSelector(false)
  }

  const handleSelectCounselor = async (selectedCounselor, isPrivate) => {
    setCreating(true)
    setShowCounselorSelector(false)

    try {
      // Tạo phòng chat với counselor_id nếu là private
      const roomData = {
        student_id: user.id,
        counselor_id: (isPrivate && selectedCounselor) ? selectedCounselor.id : null
      }

      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert(roomData)
        .select()
        .single()
      
      if (createError) {
        console.error('Error creating chat room:', createError)
        alert('Không thể tạo phòng chat. Vui lòng thử lại.')
        setCreating(false)
        return
      }

      // Gửi tin nhắn chào mừng phù hợp
      let welcomeMessage = ''
      
      if (isPrivate && selectedCounselor) {
        // Private chat - chỉ counselor được chọn thấy
        welcomeMessage = `🔒 Xin chào thầy/cô ${selectedCounselor.displayName}! Em muốn được tư vấn riêng với thầy/cô. Em cảm ơn ạ!`
      } else if (selectedCounselor && !isPrivate) {
        // Preferred counselor nhưng vẫn là chat chung
        welcomeMessage = `👋 Xin chào! Em mong muốn được tư vấn viên ${selectedCounselor.displayName} hỗ trợ (nhưng các thầy/cô khác cũng có thể giúp em ạ). Cảm ơn ạ!`
      } else {
        // Chat chung - không chọn ai cả
        welcomeMessage = `👋 Xin chào! Em cần được tư vấn. Mong các thầy/cô hỗ trợ em ạ!`
      }
      
      await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: newRoom.id,
          sender_id: user.id,
          content: welcomeMessage
        })
      
      // Force refetch để cập nhật UI
      window.location.reload()
      
    } catch (err) {
      console.error('Error in handleSelectCounselor:', err)
      alert('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteChatRoom = async () => {
    const confirmMsg = privateCounselor
      ? `Bạn có chắc muốn xóa cuộc trò chuyện bí mật với ${privateCounselor.displayName}? Tất cả tin nhắn sẽ bị xóa vĩnh viễn.`
      : 'Bạn có chắc muốn xóa phòng chat này? Tất cả tin nhắn sẽ bị xóa vĩnh viễn.'
    
    if (!confirm(confirmMsg)) {
      return
    }

    setDeleting(true)
    const { error } = await deleteChatRoom()
    
    if (error) {
      alert('Không thể xóa phòng chat. Vui lòng thử lại.')
    }
    
    setDeleting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center text-white text-xl">Đang tải...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">
            Tư vấn Tâm lý
          </h1>
          <p className="text-white/90 text-lg">
            Kết nối với tư vấn viên một cách riêng tư và an toàn
          </p>
        </div>

        {/* No Chat Room - Create Prompt */}
        {!chatRoom && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {!showCounselorSelector ? (
              // Initial view - Show create button
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={40} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    Bạn chưa có phòng tư vấn
                  </h2>
                  <p className="text-gray-600 mb-2">
                    Tạo phòng tư vấn để kết nối với các tư vấn viên
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Bạn có thể chọn chat chung hoặc chat riêng với một tư vấn viên
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left max-w-md mx-auto">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-2">Lưu ý:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Bạn chỉ có thể có một phòng tư vấn tại một thời điểm</li>
                        <li>Tin nhắn của bạn được mã hóa và bảo mật</li>
                        <li>Các tư vấn viên sẽ trả lời nhanh nhất có thể</li>
                        <li>Bạn sẽ thấy tên của tư vấn viên trong mỗi tin nhắn</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleShowCounselorSelector}
                  disabled={creating || counselorsLoading}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 mx-auto shadow-lg"
                >
                  {creating ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Plus size={24} />
                      Tạo phòng tư vấn
                    </>
                  )}
                </button>

                {/* Counselors count preview */}
                {!counselorsLoading && counselors.length > 0 && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-gray-600">
                    <Users size={18} />
                    <span className="text-sm">
                      {counselors.length} tư vấn viên đang sẵn sàng hỗ trợ
                    </span>
                  </div>
                )}
              </div>
            ) : (
              // Expanded view - Show counselor selector
              <div className="animate-fade-in">
                <CounselorSelector
                  counselors={counselors}
                  loading={counselorsLoading}
                  onSelect={handleSelectCounselor}
                  onCancel={handleCancelSelection}
                />
              </div>
            )}
          </div>
        )}

        {/* Has Chat Room - Show Chat */}
        {chatRoom && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-white">
                    {privateCounselor 
                      ? `Tư vấn riêng với ${privateCounselor.displayName}`
                      : 'Phòng tư vấn của bạn'
                    }
                  </h2>
                  {privateCounselor && (
                    <EyeOff size={20} className="text-white/80" />
                  )}
                </div>
                <p className="text-white/90 text-sm">
                  {privateCounselor 
                    ? `🔒 Chỉ ${privateCounselor.displayName} và quản trị viên thấy cuộc trò chuyện này`
                    : 'Các tư vấn viên đang sẵn sàng hỗ trợ bạn'
                  }
                </p>
              </div>
              <button
                onClick={handleDeleteChatRoom}
                disabled={deleting}
                className="px-4 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 size={18} />
                {deleting ? 'Đang xóa...' : 'Xóa phòng'}
              </button>
            </div>

            {/* Chat Interface */}
            <ChatInterface chatRoom={chatRoom} currentUser={user} />
          </div>
        )}

        {/* Simple Quote Section */}
        {!quoteLoading && quote && (
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="bg-white/90 rounded-2xl shadow-lg p-6 text-center">
              <p className="text-xl text-gray-800 mb-2">
                "{quote.content}"
              </p>
              {quote.author && (
                <p className="text-sm text-gray-600">
                  — {quote.author} —
                </p>
              )}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-white/90 rounded-2xl p-6 shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-3">
            💡 Mẹo sử dụng phòng tư vấn
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">•</span>
              <span><strong>Chat chung:</strong> Tất cả tư vấn viên đều thấy và có thể trả lời - phù hợp khi cần hỗ trợ nhanh</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">•</span>
              <span><strong>Câu chuyện bí mật:</strong> Chỉ tư vấn viên được chọn thấy - phù hợp cho vấn đề riêng tư</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">•</span>
              <span>Hãy chia sẻ những gì bạn cảm thấy thoải mái</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">•</span>
              <span>Các tư vấn viên luôn tôn trọng sự riêng tư của bạn</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">•</span>
              <span>Bạn có thể xóa phòng chat bất cứ lúc nào</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
