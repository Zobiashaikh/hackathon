import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Landing from './components/Landing'
import Login from './components/Login'
import SignUp from './components/SignUp'
import PDFUpload from './components/PDFUpload'
import LearningInterface from './components/LearningInterface'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Landing Page - No Layout wrapper */}
          <Route path="/" element={<Landing />} />
          
          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Protected Routes */}
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Layout>
                  <PDFUpload />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Learning Interface - Protected */}
          <Route 
            path="/learn" 
            element={
              <ProtectedRoute>
                <LearningInterface />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App