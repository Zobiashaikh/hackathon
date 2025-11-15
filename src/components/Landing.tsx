import { useNavigate } from 'react-router-dom'
import LiquidEther from './LiquidEther.tsx'

function Landing() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/upload')
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a1f]">
      {/* LiquidEther Background */}
      <div className="absolute inset-0 z-0">
        <LiquidEther
          colors={['#5227FF', '#FF9FFC', '#B19EEF']}
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


          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight leading-[1.1] px-4">
            Because your brain deserves better than Ctrl+C, Ctrl+V.
          </h1>

          {/* CTA Button */}
          <div className="flex items-center justify-center mt-12">
            <button
              onClick={handleGetStarted}
              className="px-10 py-4 text-lg font-semibold bg-white text-black rounded-full hover:bg-gray-100 transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing