import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useChatRoom } from '../hooks/useChatRoom'
import { useQuotes } from '../hooks/useQuotes'
import Navbar from '../components/Layout/Navbar'
import ChatInterface from '../components/Chat/ChatInterface'
import { MessageCircle, Trash2, Plus, AlertCircle } from 'lucide-react'

export default function StudentChat() {
  const { user } = useAuth()
  const { chatRoom, loading, createChatRoom, deleteChatRoom } = useChatRoom(
    user?.id,
    'student'
  )
  const { quote, loading: quoteLoading } = useQuotes()
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleCreateChatRoom = async () => {
    setCreating(true)
    const { error } = await createChatRoom()
    
    if (error) {
      alert('Không thể tạo phòng chat. Vui lòng thử lại.')
    }
    
    setCreating(false)
  }

  const handleDeleteChatRoom = async () => {
    if (!confirm('Bạn có chắc muốn xóa phòng chat này? Tất cả tin nhắn sẽ bị xóa vĩnh viễn.')) {
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
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
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
                Tất cả tư vấn viên đều có thể xem và trả lời tin nhắn của bạn
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
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
              onClick={handleCreateChatRoom}
              disabled={creating}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 mx-auto"
            >
              <Plus size={24} />
              {creating ? 'Đang tạo...' : 'Tạo phòng tư vấn'}
            </button>
          </div>
        )}

        {/* Has Chat Room - Show Chat */}
        {chatRoom && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Phòng tư vấn của bạn
                </h2>
                <p className="text-white/90 text-sm">
                  Các tư vấn viên đang sẵn sàng hỗ trợ bạn
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
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">•</span>
              <span>Tên tư vấn viên sẽ hiển thị bên cạnh mỗi tin nhắn của họ</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
