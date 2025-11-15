import { useState, useRef, useEffect, ChangeEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  generateSocraticQuestion,
  evaluateResponse,
  generateExplanation,
  generateHint,
  generateIntroExplanation,
  ConversationMessage,
} from '../services/gemini'

// Speech Recognition types
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: SpeechRecognitionErrorEvent) => void
  onend: () => void
}

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent {
  error: string
  message: string
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface Message {
  id: string
  type: 'ai-question' | 'user-answer' | 'ai-explanation'
  content: string
  timestamp: Date
}

type DifficultyLevel = 1 | 2 | 3 | 4
type QualityLevel = 'strong' | 'partial' | 'needs_work'

interface DifficultyInfo {
  level: DifficultyLevel
  name: string
  color: string
  bgColor: string
}

const DIFFICULTY_LEVELS: Record<DifficultyLevel, DifficultyInfo> = {
  1: {
    level: 1,
    name: 'Basic',
    color: '#10B981',
    bgColor: 'bg-green-500',
  },
  2: {
    level: 2,
    name: 'Foundational',
    color: '#3B82F6',
    bgColor: 'bg-blue-500',
  },
  3: {
    level: 3,
    name: 'Intermediate',
    color: '#F59E0B',
    bgColor: 'bg-orange-500',
  },
  4: {
    level: 4,
    name: 'Advanced',
    color: '#8B5CF6',
    bgColor: 'bg-purple-500',
  },
}

function LearningInterface() {
  const location = useLocation()
  const navigate = useNavigate()
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Get data from navigation state
  const state = location.state as {
    pdfContent?: string
    analysisResult?: { topics: string[]; concepts: string[] }
  } | null

  const pdfContent = state?.pdfContent || ''
  const topics = state?.analysisResult?.topics || []

  // State management
  const [currentQuestionText, setCurrentQuestionText] = useState<string>('')
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1)
  const [currentAttempts, setCurrentAttempts] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showHintButton, setShowHintButton] = useState(false)
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(1)
  const [recentQualities, setRecentQualities] = useState<QualityLevel[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [userAnswer, setUserAnswer] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [difficultyChanged, setDifficultyChanged] = useState(false)
  const [exploredTopics, setExploredTopics] = useState<Set<string>>(new Set())
  const [lastErrorAction, setLastErrorAction] = useState<(() => Promise<void>) | null>(null)
  const [hasShownIntro, setHasShownIntro] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Generate intro explanation first, then first question on mount
  useEffect(() => {
    if (pdfContent && !hasShownIntro) {
      showIntroExplanation()
    }
  }, [])

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 100)
  }, [messages, isLoading])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [userAnswer])

  const showIntroExplanation = async () => {
    if (!pdfContent) return

    setIsLoading(true)
    setError(null)

    const retryAction = async () => {
      await showIntroExplanation()
    }
    setLastErrorAction(() => retryAction)

    try {
      const firstTopic = topics.length > 0 ? topics[0] : undefined
      const introExplanation = await generateIntroExplanation(
        pdfContent,
        currentDifficulty,
        firstTopic
      )

      // Add intro explanation to messages
      const introMessage: Message = {
        id: `intro-${Date.now()}`,
        type: 'ai-explanation',
        content: introExplanation,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, introMessage])

      // Add to conversation history
      setConversationHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: introExplanation,
          type: 'explanation',
        },
      ])

      setHasShownIntro(true)
      setLastErrorAction(null)

      // After showing intro, generate the first question
      setTimeout(() => {
        generateNextQuestion()
      }, 500) // Small delay to let the intro message render
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate introduction'
      if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        setError('API rate limit reached. Please wait a moment and try again.')
      } else {
        setError(errorMessage)
      }
      console.error('Error generating intro:', err)
      toast.error('Failed to generate introduction. Click retry to try again.')
      setIsLoading(false)
    }
  }

  const generateNextQuestion = async () => {
    if (!pdfContent) return

    setIsLoading(true)
    setError(null)

    const retryAction = async () => {
      await generateNextQuestion()
    }
    setLastErrorAction(() => retryAction)

    try {
      // Mark current topic as explored if we have topics
      if (topics.length > 0) {
        const currentTopicIndex = Math.min(
          Math.floor((currentQuestionNumber - 1) / 3),
          topics.length - 1
        )
        const currentTopic = topics[currentTopicIndex]
        if (currentTopic) {
          setExploredTopics((prev) => new Set([...prev, currentTopic]))
        }
      }

      const question = await generateSocraticQuestion(
        pdfContent,
        currentDifficulty,
        conversationHistory,
        topics[Math.min(Math.floor((currentQuestionNumber - 1) / 3), topics.length - 1)] || topics[0]
      )

      setCurrentQuestionText(question)

      // Add question to messages with fade-in animation
      const questionMessage: Message = {
        id: `question-${Date.now()}`,
        type: 'ai-question',
        content: question,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, questionMessage])

      // Add to conversation history
      setConversationHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: question,
          type: 'question',
        },
      ])
      setLastErrorAction(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate question'
      if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        setError('API rate limit reached. Please wait a moment and try again.')
      } else {
        setError(errorMessage)
      }
      console.error('Error generating question:', err)
      toast.error('Failed to generate question. Click retry to try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setUserAnswer(e.target.value)
  }

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = ''
          let finalTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' '
            } else {
              interimTranscript += transcript
            }
          }

          if (finalTranscript) {
            setUserAnswer((prev) => prev + finalTranscript)
          } else if (interimTranscript) {
            setUserAnswer((prev) => {
              // Remove previous interim results and add new one
              const base = prev.replace(/\s*\[Listening\.\.\.\]\s*$/, '')
              return base + ' [Listening...]'
            })
          }
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          if (event.error === 'no-speech') {
            toast.error('No speech detected. Please try again.')
          } else if (event.error === 'not-allowed') {
            toast.error('Microphone permission denied. Please enable it in your browser settings.')
          } else {
            toast.error('Speech recognition error. Please try again.')
          }
        }

        recognition.onend = () => {
          setIsListening(false)
          setUserAnswer((prev) => prev.replace(/\s*\[Listening\.\.\.\]\s*$/, ''))
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        toast.success('Listening... Speak now!')
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        toast.error('Failed to start speech recognition. Please try again.')
      }
    }
  }

  const handleSubmitAnswer = async () => {
    if (userAnswer.trim().length < 20) return
    if (!currentQuestionText || !pdfContent) return

    setIsLoading(true)
    setError(null)

    // Add user answer to messages
    const userMessage: Message = {
      id: `answer-${Date.now()}`,
      type: 'user-answer',
      content: userAnswer,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Add to conversation history
    const conversationAnswer: ConversationMessage = {
      role: 'user',
      content: userAnswer,
      type: 'answer',
    }
    setConversationHistory((prev) => [...prev, conversationAnswer])

    try {
      // Evaluate the response
      const evaluation = await evaluateResponse(
        currentQuestionText,
        userAnswer,
        pdfContent,
        currentDifficulty
      )

      // Add quality to recent qualities and check difficulty
      setRecentQualities((prev) => {
        const updated = [...prev, evaluation.quality]
        const recentThree = updated.slice(-3) // Keep only last 3
        
        // Check and adjust difficulty if we have 3 qualities
        if (recentThree.length === 3) {
          checkAndAdjustDifficulty(recentThree)
        }
        
        return recentThree
      })

      if (evaluation.quality === 'strong') {
        // Generate explanation
        const explanation = await generateExplanation(
          currentQuestionText,
          userAnswer,
          pdfContent,
          currentDifficulty
        )

        // Add explanation to messages
        const explanationMessage: Message = {
          id: `explanation-${Date.now()}`,
          type: 'ai-explanation',
          content: explanation,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, explanationMessage])

        // Add to conversation history
        setConversationHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: explanation,
            type: 'explanation',
          },
        ])

        // Wait 2 seconds, then generate next question
        setTimeout(async () => {
          // Reset attempts and hints
          setCurrentAttempts(0)
          setHintsUsed(0)
          setShowHintButton(false)
          setCurrentQuestionNumber((prev) => prev + 1)

          // Show encouraging message
          toast.success('Great job! Moving to the next question...', {
            icon: '✨',
            duration: 2000,
          })

          await generateNextQuestion()
        }, 2000)
      } else {
        // Show feedback
        const feedbackMessage: Message = {
          id: `feedback-${Date.now()}`,
          type: 'ai-explanation',
          content: evaluation.feedback,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, feedbackMessage])

        // Add to conversation history
        setConversationHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: evaluation.feedback,
            type: 'explanation',
          },
        ])

        // Increment attempts
        const newAttempts = currentAttempts + 1
        setCurrentAttempts(newAttempts)

        // Show hint button
        setShowHintButton(true)

        // If attempts >= 3, move to next question anyway
        if (newAttempts >= 3) {
          setTimeout(async () => {
            // Reset attempts and hints
            setCurrentAttempts(0)
            setHintsUsed(0)
            setShowHintButton(false)
            setCurrentQuestionNumber((prev) => prev + 1)

            await generateNextQuestion()
          }, 2000)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to evaluate answer'
      setError(errorMessage)
      console.error('Error evaluating answer:', err)
    } finally {
      setIsLoading(false)
      // Clear input after submission
      setUserAnswer('')
    }
  }

  const handleGetHint = async () => {
    if (hintsUsed >= 3 || !currentQuestionText || !pdfContent) return

    setIsLoading(true)
    setError(null)

    try {
      const hint = await generateHint(
        currentQuestionText,
        userAnswer || '',
        hintsUsed + 1,
        pdfContent,
        currentDifficulty
      )

      // Add hint to messages
      const hintMessage: Message = {
        id: `hint-${Date.now()}`,
        type: 'ai-explanation',
        content: `💡 Hint ${hintsUsed + 1}/3: ${hint}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, hintMessage])

      // Increment hints used
      setHintsUsed((prev) => {
        const newHints = prev + 1
        // Hide hint button after 3 hints
        if (newHints >= 3) {
          setShowHintButton(false)
        }
        return newHints
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate hint'
      setError(errorMessage)
      console.error('Error generating hint:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewSession = () => {
    if (
      window.confirm(
        'Are you sure you want to start a new session? This will clear all progress and conversation history.'
      )
    ) {
      // Reset all state
      setMessages([])
      setConversationHistory([])
      setCurrentQuestionNumber(1)
      setCurrentQuestionText('')
      setCurrentAttempts(0)
      setHintsUsed(0)
      setShowHintButton(false)
      setCurrentDifficulty(1)
      setRecentQualities([])
      setUserAnswer('')
      setError(null)
      setExploredTopics(new Set())
      setDifficultyChanged(false)

      // Navigate back to upload page
      navigate('/')
      toast.success('Session cleared. Upload a new PDF to start learning!')
    }
  }

  const checkAndAdjustDifficulty = (qualities: QualityLevel[]) => {
    // Check if we have 3 recent qualities
    if (qualities.length === 3) {
      const allStrong = qualities.every((q) => q === 'strong')
      const allNeedsWork = qualities.every((q) => q === 'needs_work')

      if (allStrong && currentDifficulty < 4) {
        // All 3 are strong - increase difficulty
        const newDifficulty = (currentDifficulty + 1) as DifficultyLevel
        setCurrentDifficulty(newDifficulty)
        setDifficultyChanged(true)
        setRecentQualities([]) // Clear after adjustment
        
        // Show toast notification
        toast.success('Excellent! Moving to harder questions...', {
          icon: '🎯',
          duration: 3000,
        })

        // Reset animation after a short delay
        setTimeout(() => {
          setDifficultyChanged(false)
        }, 1000)
      } else if (allNeedsWork && currentDifficulty > 1) {
        // All 3 need work - decrease difficulty
        const newDifficulty = (currentDifficulty - 1) as DifficultyLevel
        setCurrentDifficulty(newDifficulty)
        setDifficultyChanged(true)
        setRecentQualities([]) // Clear after adjustment
        
        // Show toast notification
        toast('Let\'s try a simpler approach...', {
          icon: '📚',
          duration: 3000,
        })

        // Reset animation after a short delay
        setTimeout(() => {
          setDifficultyChanged(false)
        }, 1000)
      }
    }
  }

  const difficultyInfo = DIFFICULTY_LEVELS[currentDifficulty]
  const charCount = userAnswer.length
  const minChars = 20
  const canSubmit = charCount >= minChars && !isLoading

  // Convert recentQualities to performance display for sidebar
  const getPerformanceIcon = (quality: QualityLevel | undefined): string => {
    if (quality === undefined) return '-'
    if (quality === 'strong') return '✓'
    if (quality === 'partial') return '~'
    return '✗'
  }

  const getPerformanceColor = (quality: QualityLevel | undefined): string => {
  if (quality === undefined) return 'bg-gray-800 text-gray-500'
  if (quality === 'strong') return 'bg-green-900 text-green-400'
  if (quality === 'partial') return 'bg-yellow-900 text-yellow-400'
  return 'bg-red-900 text-red-400'
}

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-purple-900/90 via-pink-900/90 via-orange-900/90 to-blue-900/90 backdrop-blur-md border-b border-white/10 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 via-orange-400 to-blue-400 bg-clip-text text-transparent">Brain Brew - Socratic Learning</h1>
            <div
              className={`px-4 py-1 rounded-full text-white font-semibold text-sm transition-all duration-500 ${
                difficultyChanged ? 'scale-110 shadow-lg animate-pulse' : ''
              }`}
              style={{ backgroundColor: difficultyInfo.color }}
            >
              Level {currentDifficulty} ({difficultyInfo.name})
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-medium text-white">
              Question {currentQuestionNumber}
            </div>
            <button
              onClick={handleNewSession}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-colors"
            >
              New Session
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-8 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            {lastErrorAction && (
              <button
                onClick={lastErrorAction}
                className="px-4 py-1 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 bg-slate-900">
            {/* Empty State */}
            {messages.length === 0 && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="text-6xl mb-4">📚</div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 via-orange-400 to-blue-400 bg-clip-text text-transparent mb-2">
                    Ready to Start Learning!
                  </h2>
                  <p className="text-gray-300">
                    Your first question will appear here. Take your time to think through each
                    answer.
                  </p>
                </div>
              </div>
            )}

            {messages.length === 0 && isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="max-w-3xl rounded-lg px-6 py-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm text-white border border-white/20">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-5 w-5"
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
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex animate-fade-in ${
                  message.type === 'user-answer' ? 'justify-end' : 'justify-start'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`max-w-3xl rounded-lg px-6 py-4 transition-all hover:shadow-md backdrop-blur-sm ${
                    message.type === 'ai-question'
                      ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 text-white border border-white/20'
                      : message.type === 'user-answer'
                      ? 'bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-purple-500/20 text-white border border-white/20'
                      : 'bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 text-white border border-white/20'
                  }`}
                >
                  <p className="text-base whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && messages.length > 0 && (
              <div className="flex justify-start animate-fade-in">
                <div className="max-w-3xl rounded-lg px-6 py-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm text-white border border-white/20">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-5 w-5"
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
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
<div className="border-t border-white/10 bg-slate-900 px-8 py-4">
  <div className="max-w-4xl mx-auto">
    <div className="mb-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={userAnswer}
          onChange={handleAnswerChange}
          placeholder="Type your answer here (minimum 20 characters)..."
          className="w-full px-4 py-3 pr-12 border border-white/20 bg-gradient-to-br from-purple-900/40 via-pink-900/40 via-orange-900/40 to-blue-900/40 backdrop-blur-sm text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none min-h-[100px] max-h-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
          rows={3}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          disabled={isLoading}
          className={`absolute right-3 top-3 p-2 rounded-full transition-all ${
            isListening
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 9a1 1 0 10-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="text-sm text-gray-400">
          <span className={charCount < minChars ? 'text-red-400' : 'text-gray-400'}>
            {charCount}/{minChars} characters
          </span>
        </div>
        {showHintButton && hintsUsed < 3 && (
          <button
            onClick={handleGetHint}
            disabled={isLoading}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium disabled:text-gray-600 disabled:cursor-not-allowed"
          >
            Get Hint ({hintsUsed + 1}/3)
          </button>
        )}
      </div>
    </div>
    <button
      onClick={handleSubmitAnswer}
      disabled={!canSubmit || isLoading}
      className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
        canSubmit && !isLoading
          ? 'bg-gradient-to-r from-pink-500 via-purple-500 via-orange-500 to-blue-500 text-white hover:from-pink-600 hover:via-purple-600 hover:via-orange-600 hover:to-blue-600 hover:shadow-lg transform hover:scale-[1.02]'
          : 'bg-gray-800/50 text-gray-400 cursor-not-allowed'
      }`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
          <svg
            className="animate-spin h-5 w-5"
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
        'Submit Answer'
      )}
    </button>
  </div>
</div>
        </div>

        {/* Right Sidebar */}
<div className="w-96 bg-slate-900 border-l border-white/10 flex flex-col">
  {/* Simple Info Section */}
  <div className="p-4 bg-slate-800 border-b border-white/10">
    <div className="space-y-3">
      <div>
        <div
          className="px-3 py-2 rounded-lg text-white font-semibold text-center text-sm"
          style={{ backgroundColor: difficultyInfo.color }}
        >
          Level {currentDifficulty} - {difficultyInfo.name}
        </div>
      </div>
      {recentQualities.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2">Recent:</p>
          <div className="flex space-x-2">
            {recentQualities.map((quality, index) => (
              <div
                key={index}
                className={`flex-1 aspect-square rounded flex items-center justify-center text-lg font-bold ${getPerformanceColor(
                  quality
                )}`}
              >
                {getPerformanceIcon(quality)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
</div>
      </div>
    </div>
  )
}

export default LearningInterface
