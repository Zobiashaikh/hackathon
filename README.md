# 🧠 Brain Brew

**A Hackathon Project - Revolutionizing Learning Through AI-Powered Socratic Questioning**

Brain Brew is an innovative learning platform that transforms passive PDF reading into an engaging, interactive learning experience. Built for a hackathon, this application combines the ancient Socratic method with cutting-edge AI technology to help students truly understand their lecture materials, not just memorize them.

## 🎯 Project Overview

Brain Brew addresses a common problem: students often passively read through lecture PDFs without truly understanding the content. Our solution uses AI-powered Socratic questioning to create an adaptive, personalized learning experience that ensures knowledge sticks and comprehension deepens.

## ✨ Key Features

### 🔐 **User Authentication & Account Management**
- **Secure Sign Up/Login**: Built with Supabase authentication for secure user accounts
- **User Dashboard**: Access all your uploaded PDFs in one centralized location
- **Cloud Storage**: All PDFs are securely stored in the cloud, accessible from anywhere
- **Account Persistence**: Your learning progress and PDFs are saved across sessions

### 📄 **PDF Upload & Processing**
- **Drag & Drop Interface**: Intuitive file upload with drag-and-drop support
- **Smart PDF Processing**: Automatically extracts and analyzes content using Google Gemini AI
- **Topic Extraction**: Identifies key topics and concepts from your lecture materials
- **File Management**: Track file size, upload date, and topics for each PDF
- **10MB Limit**: Optimized for lecture slides and study materials

### 🎓 **Socratic Learning Interface**
- **AI-Powered Questions**: Google Gemini AI generates thoughtful, progressive questions based on your PDF content
- **Difficulty Levels**: Questions range from basic (Level 1) to advanced (Level 4)
- **Adaptive Difficulty**: System automatically adjusts question difficulty based on your performance
- **Progressive Hints**: Get up to 3 hints per question when you need help
- **Performance Tracking**: Visual feedback on your last 3 responses to track improvement

### 📊 **Learning Analytics**
- **Topic Progress Tracking**: See which topics from your PDF you've explored
- **Performance Visualization**: Visual feedback on your learning progress
- **Response History**: Track your answers and see patterns in your understanding
- **Adaptive Algorithm**: Questions adapt in real-time to your learning pace

### 🎨 **Modern User Experience**
- **Beautiful Gradient Design**: Stunning pink, purple, and blue gradient theme throughout
- **Smooth Animations**: LiquidEther background effects and smooth transitions
- **Responsive Layout**: Clean, modern interface optimized for desktop learning
- **Intuitive Navigation**: Easy-to-use navigation between upload, dashboard, and learning

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library for building interactive interfaces
- **TypeScript** - Type-safe development for better code quality
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **React Router** - Client-side routing for seamless navigation
- **React Hot Toast** - Beautiful toast notifications for user feedback

### Backend & Services
- **Supabase** - Complete backend solution (100% Free Tier)
  - Authentication: Secure user sign up/login
  - Database: PostgreSQL for storing PDF metadata
  - Storage: File storage for PDFs (1GB free)
  - Row Level Security: Secure data access policies
- **Google Gemini AI** - Advanced AI for:
  - PDF content extraction
  - Question generation using Socratic method
  - Topic identification and analysis

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account ([Sign up for free](https://supabase.com))
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd hackathon2-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Create a Supabase project
   - Set up the database table and storage bucket
   - Configure security policies

4. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## 📖 How It Works

1. **Sign Up/Login**: Create an account or sign in to access your learning dashboard
2. **Upload PDF**: Drag and drop or browse to upload your lecture PDF (max 10MB)
3. **AI Processing**: Brain Brew extracts content and identifies key topics using Gemini AI
4. **Start Learning**: Begin your Socratic learning session with AI-generated questions
5. **Adaptive Learning**: Answer questions and receive hints. The system adapts to your level
6. **Track Progress**: View your uploaded PDFs and learning progress in your dashboard

## 🎨 Design Philosophy

Brain Brew features a stunning gradient design with pink, purple, and blue colors throughout:
- **Hero Section**: Eye-catching landing page with animated LiquidEther background
- **About Section**: Comprehensive information about the platform and its benefits
- **Dark Mode Gradients**: Beautiful gradient backgrounds that create an immersive learning environment
- **Modern UI Elements**: Glassmorphism effects, smooth animations, and intuitive navigation

## 🔒 Security Features

- **Row Level Security (RLS)**: Database policies ensure users can only access their own data
- **Secure File Storage**: PDFs stored securely in Supabase with user-specific access
- **Authentication**: Secure sign up/login with email verification support
- **Environment Variables**: Sensitive keys stored securely, never committed to git

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── Landing.tsx          # Landing page with About section
│   │   ├── Layout.tsx          # Main layout with navigation
│   │   ├── Login.tsx           # Login component
│   │   ├── SignUp.tsx          # Sign up component
│   │   ├── PDFUpload.tsx       # PDF upload interface
│   │   ├── LearningInterface.tsx  # Main learning interface
│   │   ├── Dashboard.tsx       # User dashboard
│   │   └── ProtectedRoute.tsx  # Route protection
│   ├── services/
│   │   ├── auth.ts            # Authentication service
│   │   ├── pdfStorage.ts      # PDF storage service
│   │   └── gemini.ts          # Gemini AI integration
│   ├── contexts/
│   │   └── AuthContext.tsx     # Authentication context
│   ├── lib/
│   │   └── supabase.ts        # Supabase client configuration
│   └── App.tsx                # Main app with routing
├── SUPABASE_SETUP.md          # Detailed Supabase setup guide
├── TROUBLESHOOTING.md         # Troubleshooting guide
└── README.md                  # This file
```

## 🎯 Hackathon Highlights

### Problem Solved
Students struggle with passive learning from PDFs. Brain Brew transforms this into an active, engaging experience.

### Innovation
- Combines ancient Socratic method with modern AI
- Adaptive learning that personalizes to each user
- Beautiful, modern UI that makes learning enjoyable

### Technical Achievements
- Full-stack application built in a hackathon timeframe
- Secure authentication and file storage
- AI integration for intelligent question generation
- Responsive, beautiful UI with gradient design

## 🚀 Deployment

### Vercel Deployment
1. Push code to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

## 📝 Environment Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Supabase Dashboard → Settings → API |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | [Google AI Studio](https://makersuite.google.com/app/apikey) |

## 🐛 Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

Common issues:
- "Failed to fetch" errors → Check if Supabase project is paused
- Missing environment variables → Restart dev server after adding to `.env`
- Authentication errors → Verify Supabase credentials

## 🎓 Learning Features Explained

### Socratic Method
The Socratic method uses questions to stimulate critical thinking. Brain Brew generates questions that:
- Start simple and progress to complex
- Encourage deep understanding, not memorization
- Adapt to your learning pace

### Adaptive Difficulty
- **Level 1**: Basic recall questions
- **Level 2**: Understanding and application
- **Level 3**: Analysis and synthesis
- **Level 4**: Advanced critical thinking

The system tracks your performance and adjusts difficulty automatically.

### Progressive Hints
When you're stuck, Brain Brew provides up to 3 hints:
- **Hint 1**: Gentle nudge in the right direction
- **Hint 2**: More specific guidance
- **Hint 3**: Direct clue to the answer

## 📊 Supabase Free Tier

Brain Brew uses Supabase's generous free tier:
- ✅ 50,000 monthly active users
- ✅ 500 MB database storage
- ✅ 1 GB file storage (perfect for PDFs)
- ✅ 5 GB bandwidth per month
- ✅ Unlimited API requests

**Note**: Free projects pause after 1 week of inactivity but can be resumed instantly.

## 🤝 Contributing

This is a hackathon project, but contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Share feedback

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Supabase** for providing an amazing free backend platform
- **Google Gemini AI** for powerful AI capabilities
- **React & Vite** communities for excellent tooling
- **Tailwind CSS** for beautiful styling utilities

---

**Built with ❤️ for Hackathon 2024**

**Start brewing your brain today! 🧠✨**
