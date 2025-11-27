import { Quote } from 'lucide-react'
import { useQuotes } from '../../hooks/useQuotes'

export default function QuoteDisplay() {
  const { quote, loading } = useQuotes()

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 animate-pulse">
        <div className="h-20 bg-purple-200 rounded"></div>
      </div>
    )
  }

  if (!quote) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 md:p-12 relative overflow-hidden">
      {/* Decorative Quote Icon */}
      <div className="absolute top-4 left-4 opacity-20">
        <Quote size={60} className="text-purple-600" />
      </div>
      
      {/* Quote Content */}
      <div className="relative z-10">
        <blockquote className="text-xl md:text-2xl font-medium text-gray-800 italic leading-relaxed mb-4">
          "{quote.content}"
        </blockquote>
        
        {/* Author if available */}
        {quote.author && (
          <div className="flex justify-end">
            <p className="text-base md:text-lg font-semibold text-purple-700">
              — {quote.author}
            </p>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-4 right-4 opacity-20">
        <Quote size={60} className="text-pink-600 rotate-180" />
      </div>
    </div>
  )
}
