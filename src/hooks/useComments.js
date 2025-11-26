import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useComments(postId, currentUserId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!postId) return

    fetchComments()

    // Subscribe to real-time comment updates
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          fetchComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, currentUserId])

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users!comments_author_id_fkey(id, full_name, role)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (!error) {
      // Organize comments into parent-child structure
      const organized = organizeComments(data || [], currentUserId)
      setComments(organized)
    }
    setLoading(false)
  }

  // Organize comments into 2-level hierarchy
  const organizeComments = (commentsData, userId) => {
    // First, add like info to all comments
    const commentsWithLikes = commentsData.map(comment => ({
      ...comment,
      like_count: comment.liked_by?.length || 0,
      is_liked: userId ? (comment.liked_by || []).includes(userId) : false,
      replies: []
    }))

    // Separate parent comments (no parent_comment_id) and replies
    const parentComments = commentsWithLikes.filter(c => !c.parent_comment_id)
    const replies = commentsWithLikes.filter(c => c.parent_comment_id)

    // Attach replies to their parent comments
    parentComments.forEach(parent => {
      parent.replies = replies.filter(reply => reply.parent_comment_id === parent.id)
    })

    return parentComments
  }

  const createComment = async (content, parentCommentId = null) => {
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: currentUserId,
          parent_comment_id: parentCommentId,
          content: content.trim()
        })

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Create comment error:', error)
      return { error }
    }
  }

  const toggleCommentLike = async (commentId, isCurrentlyLiked) => {
    try {
      // Get current comment
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('liked_by')
        .eq('id', commentId)
        .single()

      if (fetchError) throw fetchError

      let newLikedBy = comment.liked_by || []

      if (isCurrentlyLiked) {
        // Unlike: remove user ID
        newLikedBy = newLikedBy.filter(id => id !== currentUserId)
      } else {
        // Like: add user ID (check for duplicates)
        if (!newLikedBy.includes(currentUserId)) {
          newLikedBy = [...newLikedBy, currentUserId]
        } else {
          return { error: null }
        }
      }

      // Update the comment
      const { error: updateError } = await supabase
        .from('comments')
        .update({ liked_by: newLikedBy })
        .eq('id', commentId)

      if (updateError) throw updateError

      // Optimistically update local state
      updateCommentInState(commentId, newLikedBy)

      return { error: null }
    } catch (error) {
      console.error('Toggle comment like error:', error)
      return { error }
    }
  }

  const updateCommentInState = (commentId, newLikedBy) => {
    setComments(prevComments => {
      return prevComments.map(comment => {
        // Check if it's the parent comment
        if (comment.id === commentId) {
          return {
            ...comment,
            liked_by: newLikedBy,
            like_count: newLikedBy.length,
            is_liked: newLikedBy.includes(currentUserId)
          }
        }
        
        // Check if it's in the replies
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  liked_by: newLikedBy,
                  like_count: newLikedBy.length,
                  is_liked: newLikedBy.includes(currentUserId)
                }
              }
              return reply
            })
          }
        }
        
        return comment
      })
    })
  }

  const deleteComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Delete comment error:', error)
      return { error }
    }
  }

  return {
    comments,
    loading,
    createComment,
    toggleCommentLike,
    deleteComment,
    refetch: fetchComments
  }
}
