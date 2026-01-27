/**
 * Image Lightbox Component
 * For viewing images in fullscreen modal
 */
import { useEffect } from 'react'
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react'

export default function ImageLightbox({ src, alt, onClose }) {
  // Close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = src
    link.download = alt || 'image'
    link.click()
  }

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={(e) => { e.stopPropagation(); handleDownload() }}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          title="Tải xuống"
        >
          <Download size={20} />
        </button>
        <button
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          title="Đóng"
        >
          <X size={20} />
        </button>
      </div>

      {/* Image */}
      <div 
        className="max-w-[90vw] max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt || 'Image'}
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Caption */}
      {alt && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-lg text-white text-sm">
          {alt}
        </div>
      )}

      {/* Click anywhere to close hint */}
      <div className="absolute bottom-4 right-4 text-white/50 text-sm">
        Nhấn ESC hoặc click ra ngoài để đóng
      </div>
    </div>
  )
}
