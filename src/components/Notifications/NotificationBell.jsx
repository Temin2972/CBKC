import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import NotificationList from './NotificationList'

export default function NotificationBell({ userId }) {
  const { unreadCount, loading } = useNotifications(userId)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Thông báo"
      >
        <Bell size={20} />
        
        {/* Badge hiển thị số thông báo chưa đọc */}
        {!loading && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-fade-in-up">
          <NotificationList 
            userId={userId} 
            onClose={() => setShowDropdown(false)} 
          />
        </div>
      )}
    </div>
  )
}
