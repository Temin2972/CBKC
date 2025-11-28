import { useState } from 'react'
import { useComments } from '../../hooks/useComments'
import CommentList from './CommentList'
import ContentModerationModal from './ContentModerationModal'
import { getModerationMessage, MODERATION_ACTIONS } from '../../lib/contentModeration'

export default function CommentSection({ postId, currentUser }) {
  const { 
    comments, 
    loading,
    createComment,
    toggleCommentLike,
    deleteComment
  } = useComments(postId, currentUser?.id)

  // Moderation modal state
  const [moderationModal, setModerationModal] = useState({
    isOpen: false,
    action: null,
    title: '',
    message: '',
    showChatSuggestion: false
  })

  const closeModerationModal = () => {
    setModerationModal({
      isOpen: false,
      action: null,
      title: '',
      message: '',
      showChatSuggestion: false
    })
  }

  // Wrapper for createComment that handles moderation
  const handleCreateComment = async (content, parentId) => {
    const result = await createComment(content, parentId)
    
    // Handle moderation result
    if (result.moderation) {
      if (result.moderation.blocked || result.moderation.rejected) {
        const action = result.moderation.blocked 
          ? MODERATION_ACTIONS.BLOCK 
          : MODERATION_ACTIONS.REJECT
        const moderationMsg = getModerationMessage(action, result.moderation.category)
        
        setModerationModal({
          isOpen: true,
          action: action,
          ...moderationMsg
        })
        
        return { error: new Error('Content moderated'), moderated: true }
      }
      
      if (result.moderation.pending) {
        // Show pending notification
        const moderationMsg = getModerationMessage(MODERATION_ACTIONS.PENDING, result.moderation.category)
        
        setModerationModal({
          isOpen: true,
          action: MODERATION_ACTIONS.PENDING,
          ...moderationMsg
        })
        
        return { error: null, moderated: true }
      }
      
      if (result.moderation.flagged) {
        // Mild flag - show brief notification (optional)
        // For now, we'll just let it through silently
      }
    }
    
    return result
  }

  console.log('CommentSection render:', { postId, commentsCount: comments.length, loading })

  return (
    <div>
      {/* Moderation Modal */}
      <ContentModerationModal
        isOpen={moderationModal.isOpen}
        onClose={closeModerationModal}
        action={moderationModal.action}
        title={moderationModal.title}
        message={moderationModal.message}
        showChatSuggestion={moderationModal.showChatSuggestion}
      />

      <CommentList
        comments={comments}
        loading={loading}
        currentUser={currentUser}
        onCreateComment={handleCreateComment}
        onLikeComment={toggleCommentLike}
        onDeleteComment={deleteComment}
      />
    </div>
  )
}
