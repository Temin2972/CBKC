import { Link } from 'react-router-dom'
import { X, AlertTriangle, Heart, MessageCircle, Shield, Clock } from 'lucide-react'
import { MODERATION_ACTIONS } from '../../lib/contentModeration'

export default function ContentModerationModal({ 
  isOpen, 
  onClose, 
  action, 
  title, 
  message, 
  showChatSuggestion 
}) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (action) {
      case MODERATION_ACTIONS.BLOCK:
        return <Shield className="text-red-500" size={48} />
      case MODERATION_ACTIONS.REJECT:
        return <Heart className="text-pink-500" size={48} />
      case MODERATION_ACTIONS.PENDING:
        return <Clock className="text-blue-500" size={48} />
      default:
        return <AlertTriangle className="text-yellow-500" size={48} />
    }
  }

  const getHeaderColor = () => {
    switch (action) {
      case MODERATION_ACTIONS.BLOCK:
        return 'from-red-500 to-orange-500'
      case MODERATION_ACTIONS.REJECT:
        return 'from-purple-500 to-pink-500'
      case MODERATION_ACTIONS.PENDING:
        return 'from-blue-500 to-cyan-500'
      default:
        return 'from-yellow-500 to-orange-500'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getHeaderColor()} p-6 text-center`}>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            {getIcon()}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {title}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-center mb-6 leading-relaxed">
            {message}
          </p>

          {/* Chat Suggestion */}
          {showChatSuggestion && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageCircle className="text-purple-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-1">
                    Trò chuyện với tư vấn viên
                  </h4>
                  <p className="text-sm text-purple-600">
                    Các tư vấn viên của chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Đừng ngại chia sẻ nhé!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {showChatSuggestion && (
              <Link
                to="/chat"
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-center hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Chat với tư vấn viên ngay
              </Link>
            )}
            
            <button
              onClick={onClose}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                showChatSuggestion 
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
              }`}
            >
              {showChatSuggestion ? 'Để sau' : 'Đã hiểu'}
            </button>
          </div>

          {/* Hotline Info for severe cases */}
          {action === MODERATION_ACTIONS.REJECT && (
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-400 mb-2">
                Nếu bạn đang trong tình trạng khẩn cấp:
              </p>
              <p className="text-sm font-semibold text-red-600">
                Đường dây nóng hỗ trợ tâm lý: 1800 599 920
              </p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  )
}
