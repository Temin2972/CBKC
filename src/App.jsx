/**
 * Main Application Component
 * Handles routing and global state
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { useAuth } from './contexts/AuthContext'
import { useNotifications } from './hooks/useNotifications'
import { useTabNotification } from './hooks/useTabNotification'
import { LoadingSpinner } from './components/UI'
import { ROUTES, APP_NAME, USER_ROLES } from './constants'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import LandingPage from './pages/LandingPage'
import Home from './pages/Home'
import StudentChat from './pages/StudentChat'
import CounselorChat from './pages/CounselorChat'
import Community from './pages/Community'
import Booking from './pages/Booking'
import Survey from './pages/Survey'
import Feedback from './pages/Feedback'
import Profile from './pages/Profile'
import Guide from './pages/Guide'
import Info from './pages/Info'
import Contact from './pages/Contact'
import Donate from './pages/Donate'
import ProtectedRoute from './components/Layout/ProtectedRoute'

/**
 * Route configuration for cleaner routing
 */
const publicRoutes = [
  { path: ROUTES.LANDING, element: LandingPage },
  { path: ROUTES.LOGIN, element: Login },
  { path: ROUTES.REGISTER, element: Register },
  { path: ROUTES.GUIDE, element: Guide },
  { path: ROUTES.INFO, element: Info },
  { path: ROUTES.CONTACT, element: Contact },
  { path: ROUTES.DONATE, element: Donate },
]

const protectedRoutes = [
  { path: ROUTES.HOME, element: Home },
  { path: ROUTES.COMMUNITY, element: Community },
  { path: ROUTES.BOOKING, element: Booking },
  { path: ROUTES.SURVEY, element: Survey },
  { path: ROUTES.FEEDBACK, element: Feedback },
  { path: ROUTES.PROFILE, element: Profile },
]

function App() {
  const { user, loading, role } = useAuth()

  // Get unread count for tab notification
  const { unreadCount } = useNotifications(user?.id)

  // Update tab title when there are new notifications
  useTabNotification(unreadCount, APP_NAME)

  if (loading) {
    return <LoadingSpinner fullScreen message="Đang tải..." />
  }

  // Determine which chat component to render based on user role
  const ChatComponent = role === USER_ROLES.STUDENT ? StudentChat : CounselorChat

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Redirect to home if logged in */}
        {publicRoutes.map(({ path, element: Element }) => (
          <Route
            key={path}
            path={path}
            element={user ? <Navigate to={ROUTES.HOME} /> : <Element />}
          />
        ))}

        {/* Protected Routes - Require Authentication */}
        <Route element={<ProtectedRoute user={user} />}>
          {protectedRoutes.map(({ path, element: Element }) => (
            <Route key={path} path={path} element={<Element />} />
          ))}

          {/* Chat routes - dynamic based on role */}
          <Route path={ROUTES.CHAT} element={<ChatComponent />} />
          <Route path={ROUTES.CHAT_ROOM} element={<CounselorChat />} />
        </Route>

        {/* Catch all - redirect based on auth status */}
        <Route
          path="*"
          element={<Navigate to={user ? ROUTES.HOME : ROUTES.LANDING} />}
        />
      </Routes>
      <Analytics />
    </BrowserRouter>
  )
}

export default App
