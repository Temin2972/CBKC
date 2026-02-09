import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  AlertTriangle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle,
  Check,
  Clock,
  User,
  Loader2
} from 'lucide-react'
import { FLAG_LEVELS, getFlagLevelLabel, getCategoryLabel } from '../../lib/contentModeration'
import { useFlaggedContent } from '../../hooks/useFlaggedContent'
import { supabase } from '../../lib/supabaseClient'

export default function CautionSection() {
  const navigate = useNavigate()
  const { flaggedItems, loading, resolveItem, resolveAllForUser, getCounts } = useFlaggedContent()
  const [expandedUsers, setExpandedUsers] = useState(new Set())
  const [resolvingItem, setResolvingItem] = useState(null)
  const [chattingUserId, setChattingUserId] = useState(null)

  const counts = getCounts()

  const toggleUserExpand = (userId) => {
    const newExpanded = new Set(expandedUsers)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedUsers(newExpanded)
  }

  const handleResolve = async (itemId) => {
    setResolvingItem(itemId)
    await resolveItem(itemId)
    setResolvingItem(null)
  }

  const handleResolveAll = async (userId) => {
    if (!confirm('Đánh dấu tất cả nội dung của người dùng này là đã xử lý?')) return
    await resolveAllForUser(userId)
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

  const getFlagLevelStyles = (level) => {
    switch (level) {
      case FLAG_LEVELS.IMMEDIATE:
        return {
          bg: 'bg-red-50 border-red-200',
          badge: 'bg-red-500 text-white',
          icon: <AlertTriangle className="text-red-500" size={20} />,
          headerBg: 'bg-red-100'
        }
      case FLAG_LEVELS.MILD:
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          badge: 'bg-yellow-500 text-white',
          icon: <AlertCircle className="text-yellow-600" size={20} />,
          headerBg: 'bg-yellow-100'
        }
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          badge: 'bg-gray-500 text-white',
          icon: <AlertCircle className="text-gray-500" size={20} />,
          headerBg: 'bg-gray-100'
        }
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-orange-500" size={24} />
          <h3 className="text-xl font-bold text-gray-800">Đáng chú ý</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          Đang tải...
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-xl">
            <AlertTriangle className="text-orange-500" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Đáng chú ý</h3>
            <p className="text-sm text-gray-500">
              Học sinh cần được quan tâm
            </p>
          </div>
        </div>

        {/* Counts */}
        <div className="flex items-center gap-2 flex-wrap">
          {counts.immediate > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-full">
              <AlertTriangle size={14} className="text-red-600" />
              <span className="text-xs font-semibold text-red-600">
                {counts.immediate} khẩn cấp
              </span>
            </div>
          )}
          {counts.mild > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full">
              <AlertCircle size={14} className="text-yellow-600" />
              <span className="text-xs font-semibold text-yellow-600">
                {counts.mild} theo dõi
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {flaggedItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-500" />
          </div>
          <p className="text-gray-600 font-medium">Không có nội dung cần chú ý</p>
          <p className="text-sm text-gray-400 mt-1">
            Tất cả học sinh đều ổn!
          </p>
        </div>
      )}

      {/* Flagged Users List */}
      <div className="space-y-4">
        {flaggedItems.map((userGroup) => {
          const isExpanded = expandedUsers.has(userGroup.userId)
          const styles = getFlagLevelStyles(userGroup.highestFlagLevel)

          return (
            <div 
              key={userGroup.userId}
              className={`border rounded-xl overflow-hidden ${styles.bg}`}
            >
              {/* User Header - Always Visible */}
              <div 
                className={`${styles.headerBg} px-4 py-3 cursor-pointer`}
                onClick={() => toggleUserExpand(userGroup.userId)}
              >
                <div className="flex items-center gap-3">
                  {styles.icon}
                  
                  {/* User Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {userGroup.user?.full_name?.[0] || 'A'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate">
                      {userGroup.user?.full_name || 'Ẩn danh'}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                      <span>{userGroup.items.length} nội dung được gắn cờ</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${styles.badge}`}>
                        {getFlagLevelLabel(userGroup.highestFlagLevel)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Quick Chat Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleChatWithStudent(userGroup.userId)
                      }}
                      disabled={chattingUserId === userGroup.userId}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 whitespace-nowrap"
                    >
                      {chattingUserId === userGroup.userId ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <MessageCircle size={16} />
                          <span>Chat ngay</span>
                        </>
                      )}
                    </button>

                    {/* Expand/Collapse */}
                    <button className="p-1.5 hover:bg-white/50 rounded-lg transition-colors">
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-gray-600" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 space-y-3">
                  {userGroup.items.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-white rounded-lg p-4 border border-gray-200"
                    >
                      {/* Content Type & Time */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                            {item.content_type === 'post' ? 'Bài viết' : 'Bình luận'}
                          </span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            item.flag_level === FLAG_LEVELS.IMMEDIATE 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {getCategoryLabel(item.category)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock size={12} />
                          <span>{formatTime(item.created_at)}</span>
                        </div>
                      </div>

                      {/* Full Content */}
                      <p className="text-gray-700 whitespace-pre-wrap mb-3">
                        {item.content}
                      </p>

                      {/* Keywords Detected */}
                      {item.keywords && item.keywords.length > 0 && (
                        <div className="mb-3">
                          <span className="text-xs text-gray-500">Từ khóa phát hiện: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.keywords.map((keyword, idx) => (
                              <span 
                                key={idx}
                                className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Reasoning */}
                      {item.reasoning && (
                        <div className="text-xs text-gray-500 italic mb-3 p-2 bg-gray-50 rounded">
                          <strong>Phân tích AI:</strong> {item.reasoning}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResolve(item.id)}
                          disabled={resolvingItem === item.id}
                          className="text-sm px-3 py-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <Check size={14} />
                          <span>{resolvingItem === item.id ? 'Đang xử lý...' : 'Đã xử lý'}</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Resolve All Button */}
                  {userGroup.items.length > 1 && (
                    <button
                      onClick={() => handleResolveAll(userGroup.userId)}
                      className="w-full py-2 text-sm text-gray-600 hover:bg-white rounded-lg transition-colors"
                    >
                      Đánh dấu tất cả đã xử lý
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
