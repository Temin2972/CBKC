import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useComments(postId, currentUserId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!postId) {
      setLoading(false)
      return
    }

    fetchComments()

    // Subscribe to real-time comment updates
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          console.log('New comment:', payload)
          fetchComments() // Refetch all comments when new one is added
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          console.log('Comment updated:', payload)
          fetchComments() // Refetch when comment is updated (likes)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          console.log('Comment deleted:', payload)
          fetchComments() // Refetch when comment is deleted
        }
      )
      .subscribe((status) => {
        console.log('Comment subscription status:', status)
      })

    return () => {
      console.log('Cleaning up comment subscription')
      supabase.removeChannel(channel)
    }
  }, [postId, currentUserId])

  const fetchComments = async () => {
    if (!postId) return

    try {
      console.log('Fetching comments for post:', postId)
      
      // First, try with the foreign key relationship
      let { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:users!comments_author_id_fkey(id, full_name, role)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      // If foreign key error, fall back to fetching users separately
      if (error && error.code === 'PGRST200') {
        console.log('Foreign key not found, using fallback query')
        
        // Get comments without join
        const commentsResult = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', postId)
          .order('created_at', { ascending: true })

        if (commentsResult.error) {
          throw commentsResult.error
        }

        // Get unique author IDs
        const authorIds = [...new Set(commentsResult.data.map(c => c.author_id))]
        
        // Fetch all authors
        const usersResult = await supabase
          .from('users')
          .select('id, full_name, role')
          .in('id', authorIds)

        if (usersResult.error) {
          console.error('Error fetching users:', usersResult.error)
        }

        // Map authors to comments
        const usersMap = {}
        if (usersResult.data) {
          usersResult.data.forEach(user => {
            usersMap[user.id] = user
          })
        }

        data = commentsResult.data.map(comment => ({
          ...comment,
          author: usersMap[comment.author_id] || null
        }))
        
        error = null
      }

      if (error) {
        console.error('Error fetching comments:', error)
        setComments([])
      } else {
        console.log('Fetched comments:', data)
        // Organize comments into parent-child structure
        const organized = organizeComments(data || [], currentUserId)
        setComments(organized)
      }
    } catch (err) {
      console.error('Exception fetching comments:', err)
      setComments([])
    } finally {
      setLoading(false)
    }
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
    if (!currentUserId) {
      return { error: new Error('You must be logged in to comment') }
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: currentUserId,
          parent_comment_id: parentCommentId,
          content: content.trim()
        })
        .select()

      if (error) {
        console.error('Error creating comment:', error)
        throw error
      }

      console.log('Comment created:', data)
      
      // Immediately refetch to show the new comment
      await fetchComments()
      
      return { error: null }
    } catch (error) {
      console.error('Create comment exception:', error)
      return { error }
    }
  }

  const toggleCommentLike = async (commentId, isCurrentlyLiked) => {
    if (!currentUserId) {
      return { error: new Error('You must be logged in to like') }
    }

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
      
      // Refetch comments after delete
      await fetchComments()
      
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
