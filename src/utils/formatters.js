/**
 * Utility functions for formatting data
 */

/**
 * Format a timestamp to a human-readable time string
 * Shows time only if within 24 hours, otherwise includes date
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted time string
 */
export function formatMessageTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now - date) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format a date to Vietnamese locale string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  return new Date(date).toLocaleString('vi-VN')
}

/**
 * Format a date to short format (dd/mm)
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatShortDate(date) {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  })
}

/**
 * Get display name for a message sender
 * @param {Object} sender - Sender object with role and full_name
 * @param {string} sender.role - User role
 * @param {string} sender.full_name - User's full name
 * @returns {string} Display name with role prefix
 */
export function getSenderDisplayName(sender) {
  if (!sender) return 'Người dùng'

  const name = sender.full_name || 'Ẩn danh'
  const { role } = sender

  const rolePrefix = {
    counselor: 'Tư vấn viên',
    admin: 'Quản trị viên',
    student: 'Học sinh',
  }

  return rolePrefix[role] ? `${rolePrefix[role]} ${name}` : name
}

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @returns {string} First character or 'A' if empty
 */
export function getInitials(name) {
  return name?.[0]?.toUpperCase() || 'A'
}

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text with ellipsis if needed
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Format a date to "X time ago" format in Vietnamese
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export function formatDistanceToNow(date) {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now - past
  
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  
  if (years > 0) return `${years} năm trước`
  if (months > 0) return `${months} tháng trước`
  if (days > 0) return `${days} ngày trước`
  if (hours > 0) return `${hours} giờ trước`
  if (minutes > 0) return `${minutes} phút trước`
  return 'Vừa xong'
}
