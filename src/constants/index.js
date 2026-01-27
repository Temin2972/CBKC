// Application constants

// User roles
export const USER_ROLES = {
  STUDENT: 'student',
  COUNSELOR: 'counselor',
  ADMIN: 'admin',
}

// Route paths
export const ROUTES = {
  HOME: '/home',
  LOGIN: '/login',
  REGISTER: '/register',
  LANDING: '/',
  CHAT: '/chat',
  CHAT_ROOM: '/chat/:roomId',
  COMMUNITY: '/community',
  BOOKING: '/booking',
  SURVEY: '/survey',
  FEEDBACK: '/feedback',
  PROFILE: '/profile',
  GUIDE: '/guide',
  INFO: '/info',
  CONTACT: '/contact',
  DONATE: '/donate',
}

// External links
export const EXTERNAL_LINKS = {
  FACEBOOK_FANPAGE: 'https://www.facebook.com/Bucthuchieuthu6',
}

// Operating hours
export const OPERATING_HOURS = {
  START: '08:00',
  END: '17:00',
  DISPLAY: '8:00 - 17:00',
}

// File upload limits
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
}

// Notification settings
export const NOTIFICATION_SETTINGS = {
  MAX_NOTIFICATIONS: 50,
  AUTO_READ_DELAY: 1000, // 1 second
}

// Password validation
export const PASSWORD_RULES = {
  MIN_LENGTH: 6,
}

// Email domain for student accounts
export const STUDENT_EMAIL_DOMAIN = 'mentalhealth.app'

// App metadata
export const APP_NAME = 'S-Net by CBKC'
