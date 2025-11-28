import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePosts } from '../hooks/usePosts'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Layout/Navbar'
import CommentSection from '../components/Community/CommentSection'
import ContentModerationModal from '../components/Community/ContentModerationModal'
import { Heart, MessageCircle, Upload, X, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import DOMPurify from 'dompurify'
import { 
  analyzeContent, 
  MODERATION_ACTIONS, 
  FLAG_LEVELS,
  getModerationMessage 
} from '../lib/contentModeration'

export default function Community() {
  const { user } = useAuth()
  const { posts, loading, createPost, deletePost, toggleLike } = usePosts(user?.id)
  const [newPost, setNewPost] = useState('')
  const [postImage, setPostImage] = useState(null)
  const [postImagePreview, setPostImagePreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [activeCommentPostId, setActiveCommentPostId] = useState(null)
  const [likingPostId, setLikingPostId] = useState(null)
  
  // Moderation modal state
  const [moderationModal, setModerationModal] = useState({
    isOpen: false,
    action: null,
    title: '',
    message: '',
    showChatSuggestion: false
  })

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5000000) {
      alert('Kích thước ảnh không được vượt quá 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPostImage(file)
      setPostImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setPostImage(null)
    setPostImagePreview('')
  }

  const closeModerationModal = () => {
    setModerationModal({
      isOpen: false,
      action: null,
      title: '',
      message: '',
      showChatSuggestion: false
    })
  }

  // Save flagged content to database
  const saveFlaggedContent = async (content, analysis, contentType = 'post', contentId = null) => {
    try {
      await supabase
        .from('flagged_content')
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
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

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!newPost.trim() && !postImage) return

    setAnalyzing(true)

    // Analyze content with AI
    const analysis = await analyzeContent(newPost)
    console.log('Content analysis:', analysis)

    setAnalyzing(false)

    // Handle based on moderation action
    if (analysis.action === MODERATION_ACTIONS.BLOCK) {
      // Aggressive content - block completely
      const moderationMsg = getModerationMessage(analysis.action, analysis.category)
      setModerationModal({
        isOpen: true,
        action: analysis.action,
        ...moderationMsg
      })
      return
    }

    if (analysis.action === MODERATION_ACTIONS.REJECT) {
      // Severe distress - reject but notify counselors
      await saveFlaggedContent(newPost, analysis, 'post')
      
      const moderationMsg = getModerationMessage(analysis.action, analysis.category)
      setModerationModal({
        isOpen: true,
        action: analysis.action,
        ...moderationMsg
      })
      
      // Clear form even though post was rejected
      setNewPost('')
      removeImage()
      return
    }

    // Handle PENDING (API unavailable)
    if (analysis.action === MODERATION_ACTIONS.PENDING) {
      setUploading(true)
      let imageUrl = null

      if (postImage) {
        const fileExt = postImage.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, postImage)

        if (!uploadError) {
          const { data } = supabase.storage.from('post-images').getPublicUrl(fileName)
          imageUrl = data.publicUrl
        }
      }

      const sanitizedContent = DOMPurify.sanitize(newPost)

      // Save to pending_content table instead of posts
      const { error } = await supabase
        .from('pending_content')
        .insert({
          user_id: user.id,
          content_type: 'post',
          content: sanitizedContent,
          image_url: imageUrl,
          pending_reason: analysis.reasoning,
          status: 'pending'
        })

      if (!error) {
        setNewPost('')
        removeImage()
        
        const moderationMsg = getModerationMessage(analysis.action, analysis.category)
        setModerationModal({
          isOpen: true,
          action: analysis.action,
          ...moderationMsg
        })
      }

      setUploading(false)
      return
    }

    // Continue with posting (ALLOW or FLAG_MILD)
    setUploading(true)
    let imageUrl = null

    if (postImage) {
      const fileExt = postImage.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, postImage)

      if (!uploadError) {
        const { data } = supabase.storage.from('post-images').getPublicUrl(fileName)
        imageUrl = data.publicUrl
      }
    }

    const sanitizedContent = DOMPurify.sanitize(newPost)

    // Create post with flag level
    const { data: postData, error } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        content: sanitizedContent,
        image_url: imageUrl,
        flag_level: analysis.flagLevel
      })
      .select()
      .single()

    if (!error) {
      // If mild concern, save to flagged content
      if (analysis.action === MODERATION_ACTIONS.FLAG_MILD && postData) {
        await saveFlaggedContent(sanitizedContent, analysis, 'post', postData.id)
      }

      setNewPost('')
      removeImage()

      // Show mild notification if flagged
      if (analysis.action === MODERATION_ACTIONS.FLAG_MILD) {
        const moderationMsg = getModerationMessage(analysis.action, analysis.category)
        setModerationModal({
          isOpen: true,
          action: analysis.action,
          ...moderationMsg
        })
      }
    }

    setUploading(false)
  }

  const handleLikePost = async (postId, isLiked) => {
    if (likingPostId) return
    
    setLikingPostId(postId)
    const { error } = await toggleLike(postId, isLiked)
    
    if (error) {
      console.error('Error toggling like:', error)
      alert('Không thể thích bài viết. Vui lòng thử lại.')
    }
    
    setLikingPostId(null)
  }

  const handleDeletePost = async (postId) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return
    
    // Close comments if this post is active
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null)
    }
    
    await deletePost(postId)
  }

  const toggleComments = (postId) => {
    console.log('Toggling comments for post:', postId)
    setActiveCommentPostId(activeCommentPostId === postId ? null : postId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400">
      <Navbar />

      {/* Moderation Modal */}
      <ContentModerationModal
        isOpen={moderationModal.isOpen}
        onClose={closeModerationModal}
        action={moderationModal.action}
        title={moderationModal.title}
        message={moderationModal.message}
        showChatSuggestion={moderationModal.showChatSuggestion}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Cộng đồng Ẩn danh
        </h1>

        {/* Create Post */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <form onSubmit={handleCreatePost}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Chia sẻ câu chuyện của bạn..."
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows="4"
              disabled={uploading || analyzing}
            />

            {postImagePreview && (
              <div className="mt-3 relative">
                <img
                  src={postImagePreview}
                  alt="Preview"
                  className="w-full max-h-64 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                <Upload size={18} />
                <span className="text-sm">Thêm ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading || analyzing}
                />
              </label>

              <button
                type="submit"
                disabled={uploading || analyzing || (!newPost.trim() && !postImage)}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang kiểm tra...
                  </>
                ) : uploading ? (
                  'Đang đăng...'
                ) : (
                  'Đăng bài'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="text-center text-white text-xl">Đang tải...</div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-xl">Chưa có bài viết nào</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-lg p-6">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                      {post.author?.full_name?.[0] || 'A'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {post.author?.full_name || 'Ẩn danh'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  {(user?.id === post.author_id || 
                    user?.user_metadata?.role === 'admin' || 
                    user?.user_metadata?.role === 'counselor') && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {/* Post Content */}
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

                {/* Post Image */}
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Post image"
                    className="w-full max-h-96 object-cover rounded-xl mb-4"
                  />
                )}

                {/* Post Actions */}
                <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleLikePost(post.id, post.is_liked)}
                    disabled={likingPostId === post.id}
                    className={`flex items-center gap-2 transition-colors ${
                      post.is_liked ? 'text-pink-600' : 'text-gray-600 hover:text-pink-600'
                    } ${likingPostId === post.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Heart 
                      size={20} 
                      className={post.is_liked ? 'fill-pink-600' : ''} 
                    />
                    <span className="text-sm">{post.like_count}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    <MessageCircle size={20} />
                    <span className="text-sm">Bình luận</span>
                    {activeCommentPostId === post.id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>

                {/* Comments Section */}
                {activeCommentPostId === post.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <CommentSection
                      postId={post.id}
                      currentUser={user}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
