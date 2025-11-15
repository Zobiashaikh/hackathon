import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LiquidEther from './LiquidEther.tsx'

function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleGetStarted = () => {
    if (user) {
      navigate('/upload')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900">
        {/* LiquidEther Background */}
        <div className="absolute inset-0 z-0">
          <LiquidEther
            colors={['#FF6B9D', '#C084FC', '#60A5FA']}
            mouseForce={20}
            cursorSize={100}
            isViscous={false}
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            dt={0.014}
            BFECC={true}
            resolution={0.5}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.5}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={1000}
            autoRampDuration={0.6}
          />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8">
          {/* Main Content */}
          <div className="max-w-5xl text-center">
            {/* Brand Name */}
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4 tracking-tight">
              Brain Brew
            </h2>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight leading-[1.1] px-4">
              Because your brain deserves better than Ctrl+C, Ctrl+V.
            </h1>

            {/* CTA Button */}
            <div className="flex items-center justify-center mt-12">
              <button
                onClick={handleGetStarted}
                className="px-10 py-4 text-lg font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-full hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="relative w-full min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-6">
              About Brain Brew
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white mb-4">
                Transform Your Learning Experience
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Brain Brew is an innovative learning platform that revolutionizes how students interact with their lecture materials. 
                Instead of passively reading through PDFs, we use the ancient Socratic method combined with cutting-edge AI to create 
                an engaging, interactive learning experience.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Our platform doesn't just help you memorize—it helps you understand. By asking thoughtful, progressive questions 
                tailored to your learning pace, Brain Brew ensures that knowledge sticks and comprehension deepens.
              </p>
            </div>
            <div className="bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">AI-Powered Learning</h4>
                    <p className="text-gray-300">Leveraging Google Gemini AI to extract and understand your lecture content</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Socratic Method</h4>
                    <p className="text-gray-300">Learn through guided questioning, not rote memorization</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Adaptive Learning</h4>
                    <p className="text-gray-300">Questions adjust to your performance for optimal learning</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-12">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">
              Why Brain Brew?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚡</span>
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Fast & Efficient</h4>
                <p className="text-gray-300">
                  Upload your PDFs and start learning immediately. No setup, no hassle.
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Personalized</h4>
                <p className="text-gray-300">
                  Every learning session adapts to your understanding level and pace.
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💾</span>
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Always Accessible</h4>
                <p className="text-gray-300">
                  All your PDFs are saved securely in the cloud. Access them anytime, anywhere.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <button
              onClick={handleGetStarted}
              className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-full hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl shadow-lg"
            >
              Start Learning Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing