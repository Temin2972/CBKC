import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'

export default function CommentList({ 
  comments, 
  loading, 
  currentUser,
  onCreateComment,
  onLikeComment,
  onDeleteComment
}) {
  const [likingCommentId, setLikingCommentId] = useState(null)

  console.log('CommentList render:', { commentsCount: comments.length, loading })

  const handleLike = async (commentId, isLiked) => {
    if (likingCommentId) return
    
    setLikingCommentId(commentId)
    await onLikeComment(commentId, isLiked)
    setLikingCommentId(null)
  }

  const handleDelete = async (commentId) => {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return
    await onDeleteComment(commentId)
  }

  const handleCreateComment = async (content, isAnonymous = false) => {
    console.log('Creating comment:', content, 'anonymous:', isAnonymous)
    const result = await onCreateComment(content, null, isAnonymous)
    console.log('Comment create result:', result)
    return result
  }

  const handleCreateReply = (parentId, onClose) => {
    return (
      <CommentForm
        onSubmit={async (content, isAnonymous = false) => {
          console.log('Creating reply to:', parentId, content, 'anonymous:', isAnonymous)
          const result = await onCreateComment(content, parentId, isAnonymous)
          console.log('Reply create result:', result)
          return result
        }}
        onCancel={onClose}
        placeholder="Viết trả lời..."
        autoFocus={true}
        isReply={true}
      />
    )
  }

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-500">
        Đang tải bình luận...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <CommentForm onSubmit={handleCreateComment} />

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              {/* Parent Comment */}
              <CommentItem
                comment={comment}
                currentUser={currentUser}
                onLike={handleLike}
                onDelete={handleDelete}
                onReply={handleCreateReply}
                likingCommentId={likingCommentId}
              />

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="space-y-3">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      currentUser={currentUser}
                      onLike={handleLike}
                      onDelete={handleDelete}
                      isReply={true}
                      likingCommentId={likingCommentId}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
