import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  analyzeContent, 
  MODERATION_ACTIONS, 
  FLAG_LEVELS 
} from '../lib/contentModeration'

export function useComments(postId, currentUserId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!postId) {
      setLoading(false)
      return
    }

    fetchComments()

    // Subscribe to real-time comment updates (filter client-side to avoid binding mismatch)
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments'
        },
        (payload) => {
          // Filter client-side
          const record = payload.new || payload.old
          if (record?.post_id !== postId) return
          
          console.log('Comment change:', payload.eventType)
          fetchComments()
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
      
      // Get comments without join - no foreign key needed!
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (commentsError) {
        console.error('Error fetching comments:', commentsError)
        setComments([])
        setLoading(false)
        return
      }

      if (!commentsData || commentsData.length === 0) {
        console.log('No comments found')
        setComments([])
        setLoading(false)
        return
      }

      // Get unique author IDs
      const authorIds = [...new Set(commentsData.map(c => c.author_id))]
      console.log('Fetching authors:', authorIds)
      
      // Fetch all authors in one query
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, role')
        .in('id', authorIds)

      if (usersError) {
        console.error('Error fetching users:', usersError)
      }

      // Map authors to comments
      const usersMap = {}
      if (usersData) {
        usersData.forEach(user => {
          usersMap[user.id] = user
        })
      }

      // Combine comments with author info
      const commentsWithAuthors = commentsData.map(comment => ({
        ...comment,
        author: usersMap[comment.author_id] || null
      }))

      console.log('Fetched comments with authors:', commentsWithAuthors)
      
      // Organize comments into parent-child structure
      const organized = organizeComments(commentsWithAuthors, currentUserId)
      setComments(organized)
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

  // Save flagged content to database
  const saveFlaggedContent = async (content, analysis, commentId) => {
    try {
      await supabase
        .from('flagged_content')
        .insert({
          user_id: currentUserId,
          content_type: 'comment',
          content_id: commentId,
          content: content,
          flag_level: analysis.flagLevel,
          category: analysis.category,
          keywords: analysis.keywords,
          reasoning: analysis.reasoning,
          is_resolved: false
        })
    } catch (error) {
      console.error('Error saving flagged content:', error)
    }
  }

  const createComment = async (content, parentCommentId = null, isAnonymous = false) => {
    if (!currentUserId) {
      return { 
        error: new Error('You must be logged in to comment'),
        moderation: null
      }
    }

    // Analyze content with AI
    const analysis = await analyzeContent(content)
    console.log('Comment analysis:', analysis)

    // Handle based on moderation action
    if (analysis.action === MODERATION_ACTIONS.BLOCK) {
      // Aggressive content - block completely
      return { 
        error: null, 
        moderation: {
          blocked: true,
          action: analysis.action,
          category: analysis.category
        }
      }
    }

    if (analysis.action === MODERATION_ACTIONS.REJECT) {
      // Severe distress - reject but notify counselors
      await saveFlaggedContent(content, analysis, null)
      
      return { 
        error: null, 
        moderation: {
          rejected: true,
          action: analysis.action,
          category: analysis.category
        }
      }
    }

    // Handle PENDING (API unavailable)
    if (analysis.action === MODERATION_ACTIONS.PENDING) {
      try {
        const { error } = await supabase
          .from('pending_content')
          .insert({
            user_id: currentUserId,
            content_type: 'comment',
            post_id: postId,
            parent_comment_id: parentCommentId,
            content: content.trim(),
            pending_reason: analysis.reasoning,
            status: 'pending',
            is_anonymous: isAnonymous
          })

        if (error) throw error

        return { 
          error: null, 
          moderation: {
            pending: true,
            action: analysis.action,
            category: analysis.category
          }
        }
      } catch (error) {
        console.error('Error saving pending comment:', error)
        return { error, moderation: null }
      }
    }

    // Continue with posting (ALLOW or FLAG_MILD)
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: isAnonymous ? null : currentUserId,
          parent_comment_id: parentCommentId,
          content: content.trim(),
          flag_level: analysis.flagLevel
        })
        .select()

      if (error) {
        console.error('Error creating comment:', error)
        throw error
      }

      console.log('Comment created:', data)

      // If mild concern, save to flagged content
      if (analysis.action === MODERATION_ACTIONS.FLAG_MILD && data && data[0]) {
        await saveFlaggedContent(content.trim(), analysis, data[0].id)
      }
      
      // Immediately refetch to show the new comment
      await fetchComments()
      
      return { 
        error: null, 
        moderation: analysis.action === MODERATION_ACTIONS.FLAG_MILD ? {
          flagged: true,
          action: analysis.action,
          category: analysis.category
        } : null
      }
    } catch (error) {
      console.error('Create comment exception:', error)
      return { error, moderation: null }
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
