import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useChatRoom } from '../hooks/useChatRoom'
import { useBroadcastOnline } from '../hooks/useOnlineStatus'
import Navbar from '../components/Layout/Navbar'
import ChatInterface from '../components/Chat/ChatInterface'
import { MessageCircle, Users, Clock, EyeOff, Eye, Shield } from 'lucide-react'

export default function CounselorChat() {
  const { user } = useAuth()
  const { roomId } = useParams() // Get roomId from URL if present
  const { allChatRooms, loading } = useChatRoom(user?.id, user?.user_metadata?.role)
  const [selectedRoom, setSelectedRoom] = useState(null)
  
  // Broadcast online status để students thấy
  useBroadcastOnline(user?.id)

  // Auto-select room when roomId is in URL or when rooms load
  useEffect(() => {
    if (!loading && allChatRooms.length > 0 && roomId) {
      const room = allChatRooms.find(r => r.id === roomId)
      if (room) {
        setSelectedRoom(room)
      }
    }
  }, [loading, allChatRooms, roomId])

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
    if (room.student?.full_name) {
      return room.student.full_name
    }
    return 'Học sinh'
  }

  const getStudentInitial = (room) => {
    const name = getStudentName(room)
    return name[0].toUpperCase()
  }

  // Check if room is private and assigned to current counselor
  const isPrivateRoom = (room) => {
    return room.counselor_id !== null
  }

  const isMyPrivateRoom = (room) => {
    return room.counselor_id === user?.id
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
                {user?.user_metadata?.role === 'counselor' && (
                  <p className="text-white/80 text-xs mt-1">
                    Hiển thị chat chung và chat riêng của bạn
                  </p>
                )}
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
                    {allChatRooms.map((room) => {
                      const isPrivate = isPrivateRoom(room)
                      const isMyPrivate = isMyPrivateRoom(room)
                      
                      return (
                        <button
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={`w-full px-4 py-4 hover:bg-purple-50 transition-colors text-left relative ${
                            selectedRoom?.id === room.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                {getStudentInitial(room)}
                              </div>
                              
                              {/* Private indicator badge */}
                              {isPrivate && (
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                                  isMyPrivate ? 'bg-purple-500' : 'bg-gray-400'
                                }`} title={isMyPrivate ? 'Chat riêng của bạn' : 'Chat riêng của tư vấn viên khác'}>
                                  <EyeOff size={10} className="text-white" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Student Name with privacy indicator */}
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-800 truncate">
                                  {getStudentName(room)}
                                </h3>
                                {isPrivate && (
                                  <EyeOff size={14} className={isMyPrivate ? 'text-purple-600' : 'text-gray-400'} />
                                )}
                              </div>

                              {/* Privacy status text */}
                              {isPrivate && (
                                <p className={`text-xs mb-1 ${isMyPrivate ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
                                  {isMyPrivate ? '🔒 Chat riêng của bạn' : '🔒 Chat riêng'}
                                </p>
                              )}

                              {/* Last Message Time */}
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock size={12} />
                                <span>{formatLastMessageTime(room.last_message_at)}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
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
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg relative">
                      {getStudentInitial(selectedRoom)}
                      {isPrivateRoom(selectedRoom) && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                          <EyeOff size={12} className="text-purple-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-white">
                          {getStudentName(selectedRoom)}
                        </h2>
                        {isPrivateRoom(selectedRoom) && (
                          <EyeOff size={18} className="text-white/80" />
                        )}
                      </div>
                      <p className="text-white/90 text-sm">
                        {isMyPrivateRoom(selectedRoom) 
                          ? '🔒 Chat riêng với bạn (chỉ bạn và admin thấy)'
                          : isPrivateRoom(selectedRoom)
                            ? '🔒 Chat riêng (admin có thể xem)'
                            : 'Phòng tư vấn chung'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Privacy Notice for shared private rooms (admin only) */}
                {isPrivateRoom(selectedRoom) && !isMyPrivateRoom(selectedRoom) && user?.user_metadata?.role === 'admin' && (
                  <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
                    <div className="flex items-center gap-2 text-sm text-yellow-800">
                      <Shield size={16} />
                      <span>
                        Đây là chat riêng của tư vấn viên khác. Bạn xem được vì bạn là admin (để đảm bảo an toàn).
                      </span>
                    </div>
                  </div>
                )}

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
              <p className="font-semibold text-purple-600 mb-2 flex items-center gap-1">
                <Eye size={16} />
                Chat chung
              </p>
              <ul className="space-y-1">
                <li>• Tất cả tư vấn viên đều thấy</li>
                <li>• Phù hợp cho hỗ trợ nhanh</li>
                <li>• Có thể cùng nhau tư vấn</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-purple-600 mb-2 flex items-center gap-1">
                <EyeOff size={16} />
                Chat riêng
              </p>
              <ul className="space-y-1">
                <li>• Chỉ bạn và admin thấy</li>
                <li>• Học sinh chọn tư vấn viên cụ thể</li>
                <li>• Đảm bảo riêng tư cao hơn</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-purple-600 mb-2 flex items-center gap-1">
                <Shield size={16} />
                Trách nhiệm
              </p>
              <ul className="space-y-1">
                <li>• Trả lời nhanh và chuyên nghiệp</li>
                <li>• Tôn trọng quyền riêng tư</li>
                <li>• Lắng nghe và thấu hiểu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
