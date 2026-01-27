/**
 * Session Timeout Modal Component
 * Displays warning when session is about to expire
 */
import { Clock, RefreshCw, LogOut } from 'lucide-react'

export default function SessionTimeoutModal({ isOpen, onExtend, onLogout, remainingMinutes = 5 }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Phiên làm việc sắp hết hạn
            </h2>
            <p className="text-sm text-gray-500">
              Còn khoảng {remainingMinutes} phút
            </p>
          </div>
        </div>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Vì lý do bảo mật, phiên làm việc của bạn sẽ tự động đăng xuất sau {remainingMinutes} phút không hoạt động. 
          Bạn muốn tiếp tục?
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onExtend}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors"
          >
            <RefreshCw size={18} />
            Tiếp tục làm việc
          </button>
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>

        {/* Security tip */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Mẹo bảo mật:</strong> Luôn đăng xuất khi sử dụng máy tính công cộng để bảo vệ tài khoản của bạn.
          </p>
        </div>
      </div>
    </div>
  )
}
