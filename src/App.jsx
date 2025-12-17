import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import LandingPage from './pages/LandingPage'
import Home from './pages/Home'
import StudentChat from './pages/StudentChat'
import CounselorChat from './pages/CounselorChat'
import Community from './pages/Community'
import ProtectedRoute from './components/Layout/ProtectedRoute'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
        <div className="text-white text-2xl font-bold">Đang tải...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/home" /> : <LandingPage />} 
        />
        
        <Route 
          path="/login" 
          element={user ? <Navigate to="/home" /> : <Login />} 
        />
        
        <Route 
          path="/register" 
          element={user ? <Navigate to="/home" /> : <Register />} 
        />
        
        {/* Protected Routes - Require Authentication */}
        <Route element={<ProtectedRoute user={user} />}>
          <Route path="/home" element={<Home />} />
          
          {/* Chat route - different component based on role */}
          <Route 
            path="/chat" 
            element={
              user?.user_metadata?.role === 'student' 
                ? <StudentChat /> 
                : <CounselorChat />
            } 
          />
          
          {/* Chat with specific room ID - for counselors to open a specific student's chat */}
          <Route 
            path="/chat/:roomId" 
            element={<CounselorChat />} 
          />
          
          <Route path="/community" element={<Community />} />
        </Route>

        {/* Catch all - redirect based on auth status */}
        <Route 
          path="*" 
          element={<Navigate to={user ? "/home" : "/"} />} 
        />
      </Routes>
      <Analytics />
    </BrowserRouter>
  )
}

export default App
