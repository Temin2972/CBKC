import { useState } from 'react'
import { Check, ChevronRight, User, Sparkles, X, AlertTriangle, Shield, Eye, EyeOff, Info } from 'lucide-react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import CounselorProfileModal from './CounselorProfileModal'

export default function CounselorSelector({ 
  counselors, 
  loading, 
  onSelect, 
  onCancel 
}) {
  const [selectedCounselor, setSelectedCounselor] = useState(null)
  const [isPrivate, setIsPrivate] = useState(false)
  const [viewingProfile, setViewingProfile] = useState(null) // For profile modal
  
  // Track online status của tất cả counselors
  const counselorIds = counselors.map(c => c.id)
  const { onlineStatus } = useOnlineStatus(counselorIds)

  const handleSelect = (counselor) => {
    setSelectedCounselor(counselor)
    // Reset private mode when changing counselor
    if (selectedCounselor?.id !== counselor.id) {
      setIsPrivate(false)
    }
  }

  const handleConfirm = () => {
    onSelect(selectedCounselor, isPrivate)
  }

  const handleSkip = () => {
    onSelect(null, false) // Không chọn ai, tạo phòng chung
  }

  const isOnline = (counselorId) => {
    return onlineStatus[counselorId] || false
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-3">Đang tải danh sách tư vấn viên...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="inline-block p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mb-3">
          <Sparkles size={32} className="text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Chọn Tư vấn viên
        </h3>
        <p className="text-gray-600 mb-1">
          Bạn có thể chọn tư vấn viên mà bạn muốn trao đổi
        </p>
        <p className="text-sm text-gray-500">
          Hoặc bỏ qua để tất cả tư vấn viên đều có thể hỗ trợ bạn
        </p>
      </div>

      {/* Counselors List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {counselors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User size={48} className="mx-auto mb-3 opacity-50" />
            <p>Chưa có tư vấn viên nào trong hệ thống</p>
          </div>
        ) : (
          counselors.map((counselor) => {
            const online = isOnline(counselor.id)
            
            return (
              <div
                key={counselor.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedCounselor?.id === counselor.id
                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <button
                  onClick={() => handleSelect(counselor)}
                  className="w-full text-left group"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar with online indicator */}
                    <div className="relative">
                      {counselor.avatar_url ? (
                        <img 
                          src={counselor.avatar_url} 
                          alt={counselor.displayName}
                          className="w-14 h-14 rounded-full object-cover flex-shrink-0 group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <div className={`w-14 h-14 bg-gradient-to-br ${counselor.avatarColor} rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          {counselor.displayName[0]}
                        </div>
                      )}
                      {/* Online indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        online ? 'bg-green-500' : 'bg-gray-400'
                      }`} title={online ? 'Đang online' : 'Offline'}></div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800 truncate">
                        {counselor.displayName}
                      </h4>
                      {counselor.role === 'admin' && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-semibold rounded-full">
                          Admin
                        </span>
                      )}
                      {online && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Online
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {counselor.description}
                    </p>
                  </div>

                  {/* Check Mark */}
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedCounselor?.id === counselor.id
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300 group-hover:border-purple-300'
                  }`}>
                    {selectedCounselor?.id === counselor.id && (
                      <Check size={16} className="text-white" />
                    )}
                  </div>
                </div>
                </button>
                
                {/* View Profile Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setViewingProfile(counselor)
                  }}
                  className="mt-2 w-full py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Info size={14} />
                  Xem hồ sơ
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Private Chat Option - Chỉ hiện khi đã chọn tư vấn viên */}
      {selectedCounselor && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-start gap-3 mb-3">
            <button
              onClick={() => setIsPrivate(!isPrivate)}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                isPrivate 
                  ? 'bg-purple-500 border-purple-500' 
                  : 'bg-white border-gray-300 hover:border-purple-400'
              }`}
            >
              {isPrivate && <Check size={16} className="text-white" />}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {isPrivate ? (
                  <EyeOff size={18} className="text-purple-600" />
                ) : (
                  <Eye size={18} className="text-gray-600" />
                )}
                <label 
                  className="font-semibold text-gray-800 cursor-pointer"
                  onClick={() => setIsPrivate(!isPrivate)}
                >
                  Câu chuyện bí mật
                </label>
              </div>
              <p className="text-sm text-gray-600">
                Chỉ {selectedCounselor.displayName} và quản trị viên xem được cuộc trò chuyện này
              </p>
            </div>
          </div>

          {/* Warning khi chọn private */}
          {isPrivate && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 animate-fade-in">
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 space-y-1">
                  <p className="font-semibold flex items-center gap-1">
                    <Shield size={14} />
                    LƯU Ý QUAN TRỌNG
                  </p>
                  <ul className="space-y-1 ml-1">
                    <li>• Chỉ <strong>{selectedCounselor.displayName}</strong> thấy cuộc trò chuyện này</li>
                    <li>• Nếu tư vấn viên này không online, bạn sẽ phải đợi lâu hơn để được trả lời</li>
                    <li>• Nên chọn <strong>"Chat chung"</strong> nếu bạn cần được hỗ trợ nhanh chóng</li>
                    <li>• Quản trị viên vẫn có thể xem (để đảm bảo an toàn của bạn)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <X size={20} />
          Hủy
        </button>

        <button
          onClick={handleSkip}
          className="flex-1 px-6 py-3 bg-white border-2 border-purple-300 text-purple-600 rounded-xl hover:bg-purple-50 transition-colors font-medium flex items-center justify-center gap-2"
        >
          Chat chung
        </button>

        <button
          onClick={handleConfirm}
          disabled={!selectedCounselor}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {selectedCounselor ? (
            <>
              <Check size={20} />
              Xác nhận
            </>
          ) : (
            <>
              <ChevronRight size={20} />
              Chọn tư vấn viên
            </>
          )}
        </button>
      </div>

      {/* Selected Preview */}
      {selectedCounselor && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="relative">
              {selectedCounselor.avatar_url ? (
                <img 
                  src={selectedCounselor.avatar_url} 
                  alt={selectedCounselor.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className={`w-10 h-10 bg-gradient-to-br ${selectedCounselor.avatarColor} rounded-full flex items-center justify-center text-white font-bold`}>
                  {selectedCounselor.displayName[0]}
                </div>
              )}
              {isOnline(selectedCounselor.id) && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Bạn đã chọn:</p>
              <p className="font-semibold text-purple-700">
                {selectedCounselor.displayName}
                {isPrivate && ' (Câu chuyện bí mật)'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {isPrivate ? (
                <EyeOff size={20} className="text-purple-500" />
              ) : (
                <Sparkles size={20} className="text-purple-500" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Counselor Profile Modal */}
      {viewingProfile && (
        <CounselorProfileModal
          counselor={viewingProfile}
          isOnline={isOnline(viewingProfile.id)}
          onClose={() => setViewingProfile(null)}
        />
      )}
    </div>
  )
}
