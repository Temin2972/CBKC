import { X, GraduationCap, Shield, Mail } from 'lucide-react'

export default function CounselorProfileModal({ counselor, isOnline, onClose }) {
  if (!counselor) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header with close button */}
        <div className="relative">
          {/* Cover gradient */}
          <div className={`h-24 bg-gradient-to-br ${counselor.avatarColor} rounded-t-2xl`}></div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>

          {/* Avatar */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="relative">
              {counselor.avatar_url ? (
                <img 
                  src={counselor.avatar_url} 
                  alt={counselor.displayName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className={`w-24 h-24 bg-gradient-to-br ${counselor.avatarColor} rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg`}>
                  {counselor.displayName[0]}
                </div>
              )}
              {/* Online indicator */}
              <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-3 border-white ${
                isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-14 px-6 pb-6">
          {/* Name and role */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              {counselor.displayName}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                counselor.role === 'admin' 
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {counselor.role === 'admin' ? (
                  <>
                    <Shield size={14} />
                    Quản trị viên
                  </>
                ) : (
                  <>
                    <GraduationCap size={14} />
                    Tư vấn viên
                  </>
                )}
              </span>
              {isOnline && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  Đang online
                </span>
              )}
            </div>
          </div>

          {/* Specialty */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Chuyên môn
            </h3>
            <p className="text-gray-700">
              {counselor.specialty || counselor.description || 'Tư vấn tâm lý học đường'}
            </p>
          </div>

          {/* Bio */}
          {counselor.bio && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Giới thiệu
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {counselor.bio}
              </p>
            </div>
          )}

          {/* Email (optional) */}
          {counselor.email && (
            <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-100">
              <Mail size={14} />
              {counselor.email}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
