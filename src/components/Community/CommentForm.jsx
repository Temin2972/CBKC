import { useState } from 'react'
import { Send, X } from 'lucide-react'

export default function CommentForm({ 
  onSubmit, 
  onCancel = null, 
  placeholder = "Viết bình luận...",
  autoFocus = false,
  isReply = false
}) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || submitting) return

    setSubmitting(true)
    const { error } = await onSubmit(content)
    
    if (!error) {
      setContent('')
      if (onCancel) onCancel() // Close reply form after successful submit
    }
    
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${isReply ? 'ml-12' : ''}`}>
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={submitting}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!content.trim() || submitting}
        className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={16} />
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl hover:bg-gray-300 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </form>
  )
}
