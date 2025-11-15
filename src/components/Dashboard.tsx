import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { pdfStorageService, type PDFRecord } from '../services/pdfStorage'
import toast from 'react-hot-toast'
import Layout from './Layout'

function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [pdfs, setPdfs] = useState<PDFRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadPDFs()
    }
  }, [user])

  const loadPDFs = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await pdfStorageService.getUserPDFs(user.id)

    if (error) {
      toast.error('Failed to load PDFs')
    } else {
      setPdfs(data || [])
    }

    setLoading(false)
  }

  const handleDelete = async (pdfId: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this PDF?')) return

    const { error } = await pdfStorageService.deletePDF(pdfId, filePath)

    if (error) {
      toast.error('Failed to delete PDF')
    } else {
      toast.success('PDF deleted successfully')
      loadPDFs()
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    toast.success('Signed out successfully')
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My PDFs</h1>
              <p className="text-gray-400">Manage your uploaded lecture slides</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/upload')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Upload PDF
              </button>
              <button
                onClick={handleSignOut}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* PDFs List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Loading your PDFs...</div>
            </div>
          ) : pdfs.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-lg">
              <svg
                className="w-16 h-16 text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-400 mb-4">No PDFs uploaded yet</p>
              <button
                onClick={() => navigate('/upload')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Upload Your First PDF
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-red-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{pdf.file_name}</h3>
                        <p className="text-sm text-gray-400">{formatFileSize(pdf.file_size)}</p>
                      </div>
                    </div>
                  </div>

                  {pdf.topics && pdf.topics.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Topics:</p>
                      <div className="flex flex-wrap gap-1">
                        {pdf.topics.slice(0, 3).map((topic, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                          >
                            {topic}
                          </span>
                        ))}
                        {pdf.topics.length > 3 && (
                          <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                            +{pdf.topics.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Uploaded {formatDate(pdf.created_at)}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate('/upload')}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => pdf.id && handleDelete(pdf.id, pdf.file_path)}
                      className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard

