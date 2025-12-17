import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Clock, 
  Check, 
  X, 
  AlertTriangle,
  MessageCircle,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react'
import { usePendingContent } from '../../hooks/usePendingContent'
import { FLAG_LEVELS } from '../../lib/contentModeration'
import { supabase } from '../../lib/supabaseClient'

export default function PendingSection() {
  const navigate = useNavigate()
  const { 
    pendingItems, 
    loading, 
    approveContent, 
    rejectContent, 
    flagAndReject 
  } = usePendingContent()
  
  const [processingId, setProcessingId] = useState(null)
  const [expandedItems, setExpandedItems] = useState(new Set())
  const [showFlagOptions, setShowFlagOptions] = useState(null)
  const [chattingUserId, setChattingUserId] = useState(null)

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const handleApprove = async (item) => {
    setProcessingId(item.id)
    await approveContent(item)
    setProcessingId(null)
  }

  const handleReject = async (itemId) => {
    if (!confirm('Từ chối bài viết này?')) return
    setProcessingId(itemId)
    await rejectContent(itemId)
    setProcessingId(null)
  }

  const handleFlagAndReject = async (item, flagLevel, category) => {
    setProcessingId(item.id)
    await flagAndReject(item, flagLevel, category)
    setShowFlagOptions(null)
    setProcessingId(null)
  }

  // Navigate to student's chat room, create one if it doesn't exist
  const handleChatWithStudent = async (studentId) => {
    setChattingUserId(studentId)
    
    try {
      // Check if chat room already exists for this student
      const { data: existingRoom, error: fetchError } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('student_id', studentId)
        .single()

      if (existingRoom) {
        // Room exists, navigate to it
        navigate(`/chat/${existingRoom.id}`)
        return
      }

      // Room doesn't exist, create one for the student
      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert({
          student_id: studentId
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating chat room:', createError)
        alert('Không thể tạo phòng chat. Vui lòng thử lại.')
        return
      }

      // Navigate to the new room
      navigate(`/chat/${newRoom.id}`)
      
    } catch (error) {
      console.error('Error handling chat:', error)
      alert('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setChattingUserId(null)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Vừa xong'
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} giờ trước`
    
    return date.toLocaleDateString('vi-VN')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="text-blue-500" size={24} />
          <h3 className="text-xl font-bold text-gray-800">Chờ duyệt</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          Đang tải...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Clock className="text-blue-500" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Chờ duyệt</h3>
            <p className="text-sm text-gray-500">
              Nội dung cần xem xét trước khi đăng
            </p>
          </div>
        </div>

        {pendingItems.length > 0 && (
          <div className="px-3 py-1 bg-blue-100 rounded-full">
            <span className="text-sm font-semibold text-blue-600">
              {pendingItems.length} đang chờ
            </span>
          </div>
        )}
      </div>

      {/* Empty State */}
      {pendingItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-500" />
          </div>
          <p className="text-gray-600 font-medium">Không có nội dung chờ duyệt</p>
          <p className="text-sm text-gray-400 mt-1">
            Tất cả nội dung đã được xử lý!
          </p>
        </div>
      )}

      {/* Pending Items List */}
      <div className="space-y-4">
        {pendingItems.map((item) => {
          const isExpanded = expandedItems.has(item.id)
          const isProcessing = processingId === item.id

          return (
            <div 
              key={item.id}
              className="border border-blue-200 bg-blue-50 rounded-xl overflow-hidden"
            >
              {/* Item Header */}
              <div 
                className="bg-blue-100 px-4 py-3 cursor-pointer"
                onClick={() => toggleExpand(item.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="text-blue-500" size={20} />
                    
                    {/* User Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                      {item.user?.full_name?.[0] || 'A'}
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {item.user?.full_name || 'Ẩn danh'}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="px-2 py-0.5 bg-blue-200 rounded-full text-xs text-blue-700">
                          {item.content_type === 'post' ? 'Bài viết' : 'Bình luận'}
                        </span>
                        <span>{formatTime(item.created_at)}</span>
                        {item.image_url && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <ImageIcon size={12} />
                            Có ảnh
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-gray-600" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4">
                  {/* Content Preview */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {item.content}
                    </p>
                    
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt="Attached"
                        className="mt-3 max-h-48 rounded-lg object-cover"
                      />
                    )}
                  </div>

                  {/* Info about why pending */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">Lý do chờ duyệt:</p>
                        <p className="text-yellow-700">
                          {item.pending_reason || 'Hệ thống AI không khả dụng - cần duyệt thủ công'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Approve */}
                    <button
                      onClick={() => handleApprove(item)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      <Check size={16} />
                      <span>{isProcessing ? 'Đang xử lý...' : 'Duyệt đăng'}</span>
                    </button>

                    {/* Reject */}
                    <button
                      onClick={() => handleReject(item.id)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      <X size={16} />
                      <span>Từ chối</span>
                    </button>

                    {/* Flag Options */}
                    <div className="relative">
                      <button
                        onClick={() => setShowFlagOptions(showFlagOptions === item.id ? null : item.id)}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        <AlertTriangle size={16} />
                        <span>Gắn cờ</span>
                        <ChevronDown size={14} />
                      </button>

                      {showFlagOptions === item.id && (
                        <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                          <button
                            onClick={() => handleFlagAndReject(item, FLAG_LEVELS.MILD, 'mild_negative')}
                            className="w-full text-left px-4 py-2 hover:bg-yellow-50 text-sm flex items-center gap-2 rounded-t-lg"
                          >
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            Cần theo dõi
                          </button>
                          <button
                            onClick={() => handleFlagAndReject(item, FLAG_LEVELS.IMMEDIATE, 'depression')}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm flex items-center gap-2"
                          >
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            Cần chú ý
                          </button>
                          <button
                            onClick={() => handleFlagAndReject(item, FLAG_LEVELS.IMMEDIATE, 'self_harm')}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm flex items-center gap-2 rounded-b-lg"
                          >
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            Cần can thiệp
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Quick Chat */}
                    <button
                      onClick={() => handleChatWithStudent(item.user_id)}
                      disabled={chattingUserId === item.user_id}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors ml-auto disabled:opacity-50"
                    >
                      {chattingUserId === item.user_id ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Đang mở...</span>
                        </>
                      ) : (
                        <>
                          <MessageCircle size={16} />
                          <span>Chat với học sinh</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
