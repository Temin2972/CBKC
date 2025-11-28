import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useChatRoom } from '../hooks/useChatRoom'
import Navbar from '../components/Layout/Navbar'
import ChatInterface from '../components/Chat/ChatInterface'
import { MessageCircle, Users, Clock } from 'lucide-react'

export default function CounselorChat() {
  const { user } = useAuth()
  const { allChatRooms, loading } = useChatRoom(user?.id, 'counselor')
  const [selectedRoom, setSelectedRoom] = useState(null)

  const formatLastMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Vừa xong'
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} giờ trước`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} ngày trước`
    
    return date.toLocaleDateString('vi-VN')
  }

  const getStudentName = (room) => {
    // Check if student data exists and has full_name
    if (room.student?.full_name) {
      return room.student.full_name
    }
    // Fallback to 'Học sinh' if no name available
    return 'Học sinh'
  }

  const getStudentInitial = (room) => {
    // Get first letter of student name, or 'H' as fallback
    const name = getStudentName(room)
    return name[0].toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-white text-xl">Đang tải...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            Phòng Tư vấn
          </h1>
          <p className="text-white/90 text-lg">
            Quản lý và trả lời các yêu cầu tư vấn từ học sinh
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Room List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* List Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">
                    Danh sách học sinh
                  </h2>
                  <div className="bg-white/20 px-3 py-1 rounded-full">
                    <span className="text-white text-sm font-semibold">
                      {allChatRooms.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Room List */}
              <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
                {allChatRooms.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-1">Chưa có phòng tư vấn nào</p>
                    <p className="text-sm text-gray-400">
                      Các phòng tư vấn sẽ hiển thị ở đây
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {allChatRooms.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`w-full px-4 py-4 hover:bg-purple-50 transition-colors text-left ${
                          selectedRoom?.id === room.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {getStudentInitial(room)}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Student Name */}
                            <h3 className="font-semibold text-gray-800 truncate mb-1">
                              {getStudentName(room)}
                            </h3>

                            {/* Last Message Time */}
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock size={12} />
                              <span>{formatLastMessageTime(room.last_message_at)}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {!selectedRoom ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center h-full flex items-center justify-center">
                <div>
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={40} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Chọn một phòng tư vấn
                  </h2>
                  <p className="text-gray-600">
                    Chọn học sinh từ danh sách bên trái để bắt đầu tư vấn
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {getStudentInitial(selectedRoom)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {getStudentName(selectedRoom)}
                      </h2>
                      <p className="text-white/90 text-sm">
                        Phòng tư vấn
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Interface */}
                <ChatInterface chatRoom={selectedRoom} currentUser={user} />
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-white/90 rounded-2xl p-6 shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-3">
            📋 Hướng dẫn cho tư vấn viên
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-semibold text-purple-600 mb-2">Trách nhiệm</p>
              <ul className="space-y-1">
                <li>• Trả lời nhanh chóng và chuyên nghiệp</li>
                <li>• Tôn trọng quyền riêng tư học sinh</li>
                <li>• Lắng nghe và thấu hiểu</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-purple-600 mb-2">Lưu ý</p>
              <ul className="space-y-1">
                <li>• Tất cả tư vấn viên đều thấy cùng tin nhắn</li>
                <li>• Tên bạn sẽ hiển thị với mỗi tin nhắn</li>
                <li>• Phối hợp với các tư vấn viên khác</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-purple-600 mb-2">Thực hành tốt</p>
              <ul className="space-y-1">
                <li>• Sử dụng ngôn ngữ ấm áp, thân thiện</li>
                <li>• Tránh phán xét</li>
                <li>• Khuyến khích chia sẻ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
