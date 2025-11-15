import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900">
      {/* Navigation Bar */}
      {user && (
        <nav className="bg-gradient-to-r from-purple-900/90 via-pink-900/90 to-blue-900/90 backdrop-blur-md border-b border-white/10">
          <div className="mx-auto max-w-[1600px] px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => navigate('/upload')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    location.pathname === '/upload'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Upload PDF
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    location.pathname === '/dashboard'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  My PDFs
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-sm">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
      
      <div className="mx-auto max-w-[1600px] px-8 py-8">
        {children}
      </div>
    </div>
  )
}

export default Layout