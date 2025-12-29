import { useNavigate } from 'react-router-dom'
import { 
  MessageCircle, 
  UserCheck, 
  CheckCheck, 
  Trash2, 
  Eye,
  Lock
} from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'

export default function NotificationList({ userId, onClose }) {
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead
  } = useNotifications(userId)

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_message':
        return <MessageCircle size={20} className="text-blue-500" />
      case 'student_selected':
        return <UserCheck size={20} className="text-green-500" />
      case 'counselor_replied':
        return <MessageCircle size={20} className="text-purple-500" />
      case 'private_chat_request':
        return <Lock size={20} className="text-pink-500" />
      default:
        return <MessageCircle size={20} className="text-gray-500" />
    }
  }

  const handleNotificationClick = async (notification) => {
    // Đánh dấu đã đọc
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }

    // Navigate nếu có link
    if (notification.link) {
      navigate(notification.link)
      onClose?.()
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
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} ngày trước`
    
    return date.toLocaleDateString('vi-VN')
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Đang tải...
      </div>
    )
  }

  return (
    <div className="max-h-[500px] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl">
        <h3 className="font-bold text-gray-800">
          Thông báo {unreadCount > 0 && `(${unreadCount})`}
        </h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              title="Đánh dấu tất cả đã đọc"
            >
              <CheckCheck size={14} />
              <span>Đọc hết</span>
            </button>
          )}
          {notifications.some(n => n.is_read) && (
            <button
              onClick={deleteAllRead}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              title="Xóa đã đọc"
            >
              <Trash2 size={14} />
              <span>Xóa đã đọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Bell size={48} className="mx-auto mb-3 opacity-30" />
            <p>Chưa có thông báo nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                  !notification.is_read ? 'bg-blue-50/50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Unread indicator */}
                {!notification.is_read && (
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}

                <div className="flex items-start gap-3 ml-2">
                  {/* Icon */}
                  <div className="mt-1 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm mb-1 ${
                      !notification.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'
                    }`}>
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        className="p-1 text-blue-500 hover:bg-blue-100 rounded transition-colors"
                        title="Đánh dấu đã đọc"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                      title="Xóa thông báo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
