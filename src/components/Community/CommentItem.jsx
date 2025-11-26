import { useState } from 'react'
import { Heart, Trash2, MessageCircle } from 'lucide-react'

export default function CommentItem({ 
  comment, 
  currentUser, 
  onLike, 
  onDelete, 
  onReply,
  isReply = false,
  likingCommentId 
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  const canDelete = 
    currentUser?.id === comment.author_id || 
    currentUser?.user_metadata?.role === 'admin' ||
    currentUser?.user_metadata?.role === 'counselor'

  const handleReplyClick = () => {
    setShowReplyForm(!showReplyForm)
  }

  return (
    <div className={`${isReply ? 'ml-12' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
          {comment.author?.full_name?.[0] || 'A'}
        </div>

        {/* Comment Content */}
        <div className="flex-1">
          <div className="bg-gray-50 rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-gray-800 text-sm">
                {comment.author?.full_name || 'Ẩn danh'}
              </h4>
              {canDelete && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2 ml-2">
            {/* Like Button */}
            <button
              onClick={() => onLike(comment.id, comment.is_liked)}
              disabled={likingCommentId === comment.id}
              className={`flex items-center gap-1 text-xs transition-colors ${
                comment.is_liked ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'
              } ${likingCommentId === comment.id ? 'opacity-50' : ''}`}
            >
              <Heart 
                size={14} 
                className={comment.is_liked ? 'fill-pink-600' : ''} 
              />
              {comment.like_count > 0 && (
                <span className="font-medium">{comment.like_count}</span>
              )}
            </button>

            {/* Reply Button (only for parent comments) */}
            {!isReply && (
              <button
                onClick={handleReplyClick}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-600 transition-colors"
              >
                <MessageCircle size={14} />
                <span>Trả lời</span>
              </button>
            )}

            {/* Timestamp */}
            <span className="text-xs text-gray-400">
              {new Date(comment.created_at).toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit'
              })}
            </span>
          </div>

          {/* Reply Form */}
          {showReplyForm && onReply && (
            <div className="mt-3">
              {onReply(comment.id, () => setShowReplyForm(false))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
