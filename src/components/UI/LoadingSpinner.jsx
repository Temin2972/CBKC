/**
 * Loading spinner component
 */
import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({
  size = 24,
  className = '',
  fullScreen = false,
  message = '',
}) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
        <Loader2 size={48} className="text-white animate-spin" />
        {message && (
          <p className="mt-4 text-white text-xl font-bold">{message}</p>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 size={size} className="animate-spin text-gray-500" />
      {message && <span className="ml-2 text-gray-500">{message}</span>}
    </div>
  )
}
