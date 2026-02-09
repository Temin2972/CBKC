import { useState } from 'react'
import { Send, X, Loader2, EyeOff, Eye } from 'lucide-react'

export default function CommentForm({ 
  onSubmit, 
  onCancel = null, 
  placeholder = "Viết bình luận...",
  autoFocus = false,
  isReply = false
}) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false) // Default to non-anonymous

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || submitting) return

    setSubmitting(true)
    const result = await onSubmit(content, isAnonymous)
    
    // If moderated (blocked/rejected), still clear the form
    if (!result?.error || result?.moderated) {
      setContent('')
      setIsAnonymous(false) // Reset anonymous toggle
      if (onCancel) onCancel() // Close reply form after submit
    }
    
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className={`${isReply ? 'ml-12' : ''}`}>
      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={submitting}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm disabled:opacity-50"
        />
        
        {/* Anonymous Toggle Button */}
        <button
          type="button"
          onClick={() => setIsAnonymous(!isAnonymous)}
          disabled={submitting}
          className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1 text-sm ${
            isAnonymous 
              ? 'bg-purple-100 text-purple-700 border-2 border-purple-300' 
              : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
          }`}
          title={isAnonymous ? 'Đang ẩn danh' : 'Hiện tên'}
        >
          {isAnonymous ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>

        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </form>
  )
}
