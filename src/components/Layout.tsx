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
    <div className="min-h-screen bg-[#0a0a1f]">
      {/* Navigation Bar */}
      {user && (
        <nav className="bg-gray-900 border-b border-gray-800">
          <div className="mx-auto max-w-[1600px] px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => navigate('/upload')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    location.pathname === '/upload'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Upload PDF
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    location.pathname === '/dashboard'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  My PDFs
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
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