import { useComments } from '../../hooks/useComments'
import CommentList from './CommentList'

export default function CommentSection({ postId, currentUser }) {
  const { 
    comments, 
    loading,
    createComment,
    toggleCommentLike,
    deleteComment
  } = useComments(postId, currentUser?.id)

  console.log('CommentSection render:', { postId, commentsCount: comments.length, loading })

  return (
    <div>
      <CommentList
        comments={comments}
        loading={loading}
        currentUser={currentUser}
        onCreateComment={createComment}
        onLikeComment={toggleCommentLike}
        onDeleteComment={deleteComment}
      />
    </div>
  )
}
