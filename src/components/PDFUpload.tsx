import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { processPDF, analyzePDFContent, PDFAnalysisResult } from '../services/gemini'
import { useAuth } from '../contexts/AuthContext'
import { pdfStorageService } from '../services/pdfStorage'
import toast from 'react-hot-toast'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

function PDFUpload() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [pdfContent, setPdfContent] = useState<string | null>(null)
  const [pdfFileName, setPdfFileName] = useState<string>('')
  const [pdfFileData, setPdfFileData] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<PDFAnalysisResult | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (selectedFile: File): string | null => {
    if (selectedFile.type !== 'application/pdf') {
      return 'Only PDF files are allowed'
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB'
    }
    return null
  }

  const handleFileSelect = (selectedFile: File) => {
    setError(null)
    setAnalysisResult(null)
    setPdfContent(null)
    const validationError = validateFile(selectedFile)
    
    if (validationError) {
      setError(validationError)
      setFile(null)
      return
    }

    setFile(selectedFile)
    setPdfFileName(selectedFile.name)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1]
          resolve(base64)
        } else {
          reject(new Error('Failed to convert file to base64'))
        }
      }
      reader.onerror = () => reject(new Error('Error reading file'))
      reader.readAsDataURL(file)
    })
  }

  const handleProcessPDF = async () => {
    if (!file || !user) return
    
    setIsProcessing(true)
    setError(null)
    setAnalysisResult(null)
    
    try {
      const pdfBase64 = await fileToBase64(file)
      const extractedText = await processPDF(file)
      setPdfContent(extractedText)
      
      const analysis = await analyzePDFContent(extractedText)
      setAnalysisResult(analysis)
      
      setPdfFileData(pdfBase64)

      // Save PDF to Supabase
      setIsSaving(true)
      try {
        const { path: filePath, error: uploadError } = await pdfStorageService.uploadPDF(file, user.id)
        
        if (uploadError) {
          console.error('Failed to upload PDF:', uploadError)
          console.error('Upload error details:', {
            message: uploadError.message,
            userId: user.id,
            fileName: file.name,
            fileSize: file.size
          })
          toast.error(`PDF processed but failed to save: ${uploadError.message}`)
        } else if (!filePath) {
          console.error('Upload succeeded but no file path returned')
          toast.error('PDF processed but failed to get file path.')
        } else {
          // Save PDF record to database
          const { data, error: saveError } = await pdfStorageService.savePDFRecord({
            user_id: user.id,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            topics: analysis.topics,
          })

          if (saveError) {
            console.error('Failed to save PDF record:', saveError)
            console.error('Save error details:', {
              message: saveError.message,
              record: {
                user_id: user.id,
                file_name: file.name,
                file_path: filePath,
                file_size: file.size,
                topics: analysis.topics
              }
            })
            toast.error(`PDF processed but failed to save record: ${saveError.message}`)
          } else if (!data) {
            console.error('Save succeeded but no data returned')
            toast.error('PDF processed but failed to get saved record.')
          } else {
            console.log('PDF saved successfully:', data)
            toast.success('PDF saved successfully!')
          }
        }
      } catch (saveErr) {
        console.error('Unexpected error saving PDF:', saveErr)
        toast.error('An unexpected error occurred while saving the PDF.')
      } finally {
        setIsSaving(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process PDF. Please try again.'
      setError(errorMessage)
      setPdfContent(null)
      setAnalysisResult(null)
      setPdfFileData(null)
    } finally {
      setIsProcessing(false)
      setIsSaving(false)
    }
  }

  const handleStartLearning = () => {
    if (pdfContent && analysisResult && pdfFileData) {
      navigate('/learn', {
        state: {
          pdfContent,
          pdfFileData,
          analysisResult,
          pdfFileName,
        },
      })
    }
  }

  const handleTryAgain = () => {
    setError(null)
    setFile(null)
    setPdfContent(null)
    setAnalysisResult(null)
    setPdfFileData(null)
    setPdfFileName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  if (analysisResult && !isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              PDF Processed Successfully!
            </h1>
            <p className="text-gray-400">
              Your lecture slides have been analyzed and are ready for learning.
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Topics Found:
            </h2>
            <div className="space-y-2">
              {analysisResult.topics.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {analysisResult.topics.map((topic, index) => (
                    <li key={index} className="text-gray-300">
                      {topic}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No topics identified</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleStartLearning}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Learning
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2 px-6 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
            >
              View My PDFs
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Upload Your Lecture Slides
        </h1>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center transition-colors
            ${isDragging 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-700 hover:border-gray-600'
            }
            ${error ? 'border-red-500/50' : ''}
          `}
        >
          <div className="flex flex-col items-center">
            <svg
              className="w-16 h-16 text-gray-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg text-gray-300 mb-2">
              Drag and drop your PDF file here
            </p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <button
              onClick={handleBrowseClick}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-4">
              PDF files only, max size 10MB
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">Error</p>
                <p className="text-sm text-red-300 mt-1">{error}</p>
                <button
                  onClick={handleTryAgain}
                  className="mt-3 text-sm text-red-400 hover:text-red-300 underline font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {file && !error && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="font-medium text-white">{file.name}</p>
                  <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleProcessPDF}
            disabled={!file || isProcessing}
            className={`
              w-full py-3 px-6 rounded-lg font-medium transition-colors
              ${file && !isProcessing
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Processing...</span>
              </div>
            ) : (
              'Process PDF'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PDFUpload