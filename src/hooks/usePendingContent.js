import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function usePendingContent() {
  const [pendingItems, setPendingItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingContent()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('pending-content-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pending_content'
        },
        () => {
          fetchPendingContent()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchPendingContent = async () => {
    try {
      const { data, error } = await supabase
        .from('pending_content')
        .select(`
          *,
          user:users!pending_content_user_id_fkey(id, full_name, email, role)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      setPendingItems(data || [])
    } catch (error) {
      console.error('Error fetching pending content:', error)
      setPendingItems([])
    } finally {
      setLoading(false)
    }
  }

  // Approve content - move to posts/comments table
  // Now accepts optional topic parameter for counselor to override
  const approveContent = async (item, overrideTopic = null) => {
    try {
      if (item.content_type === 'post') {
        // Create post with topic (use override or original)
        const { error: postError } = await supabase
          .from('posts')
          .insert({
            author_id: item.user_id,
            content: item.content,
            image_url: item.image_url,
            flag_level: 0, // Approved = normal
            topic: overrideTopic || item.topic || 'mental'
          })

        if (postError) throw postError
      } else if (item.content_type === 'comment') {
        // Create comment
        const { error: commentError } = await supabase
          .from('comments')
          .insert({
            post_id: item.post_id,
            author_id: item.user_id,
            parent_comment_id: item.parent_comment_id,
            content: item.content,
            flag_level: 0
          })

        if (commentError) throw commentError
      }

      // Update pending content status
      const { error: updateError } = await supabase
        .from('pending_content')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', item.id)

      if (updateError) throw updateError

      await fetchPendingContent()
      return { error: null }
    } catch (error) {
      console.error('Error approving content:', error)
      return { error }
    }
  }

  // Reject content
  const rejectContent = async (itemId, reason = '') => {
    try {
      const { error } = await supabase
        .from('pending_content')
        .update({ 
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', itemId)

      if (error) throw error

      await fetchPendingContent()
      return { error: null }
    } catch (error) {
      console.error('Error rejecting content:', error)
      return { error }
    }
  }

  // Flag content as concerning and notify
  const flagAndReject = async (item, flagLevel, category) => {
    try {
      // Save to flagged content for counselor attention
      await supabase
        .from('flagged_content')
        .insert({
          user_id: item.user_id,
          content_type: item.content_type,
          content: item.content,
          flag_level: flagLevel,
          category: category,
          reasoning: 'Manually flagged during pending review',
          is_resolved: false
        })

      // Update pending content status
      const { error } = await supabase
        .from('pending_content')
        .update({ 
          status: 'flagged',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', item.id)

      if (error) throw error

      await fetchPendingContent()
      return { error: null }
    } catch (error) {
      console.error('Error flagging content:', error)
      return { error }
    }
  }

  return {
    pendingItems,
    loading,
    approveContent,
    rejectContent,
    flagAndReject,
    refetch: fetchPendingContent
  }
}
