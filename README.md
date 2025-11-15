# 🧠 Brain Brew

**A Hackathon Project - Revolutionizing Learning Through AI-Powered Socratic Questioning**

Brain Brew is an innovative learning platform that transforms passive PDF reading into an engaging, interactive learning experience. Built for a hackathon focused on **"Digital Economy and Future Work"**, this application combines the ancient Socratic method with cutting-edge AI technology to help students develop critical thinking skills essential for tomorrow's workforce.

## 🎯 Project Overview

### The Problem: The AI Dependency Crisis

In today's digital economy, students are increasingly relying on AI tools like ChatGPT to get instant answers, leading to a dangerous trend: **students are getting dumber because they're not thinking for themselves**. This passive consumption of AI-generated answers is creating a generation that lacks critical thinking skills—the very skills that will be most valuable in the future of work.

Students often:
- Copy-paste questions into ChatGPT without engaging with the material
- Accept AI answers without understanding the reasoning
- Passively read through lecture PDFs without truly comprehending the content
- Lose the ability to think critically and solve problems independently

### Our Solution: AI That Teaches You to Think

Brain Brew flips the script on AI in education. Instead of giving you answers, it **asks you questions**—transforming AI from a crutch into a personal Socratic tutor. By using the Socratic method, Brain Brew ensures students develop the critical thinking, problem-solving, and analytical skills that will be indispensable in the digital economy and future workplace.

**For the Digital Economy & Future Work:**
- **Critical Thinking**: The most valuable skill in an AI-powered workforce
- **Active Learning**: Preparing students to be innovators, not just consumers
- **Adaptive Intelligence**: Teaching students to think alongside AI, not be replaced by it
- **Workforce Readiness**: Building skills that automation can't replicate

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

### Theme: Digital Economy and Future Work

Brain Brew directly addresses the skills gap emerging in the digital economy. As AI becomes ubiquitous in the workplace, the ability to think critically, ask the right questions, and solve problems creatively will be what separates thriving professionals from those left behind.

### Problem Solved
**The AI Dependency Crisis**: Students are consuming AI answers without thinking, losing critical thinking skills essential for the future workforce. Brain Brew transforms AI from a shortcut into a thinking partner that builds these crucial skills.

### Innovation
- **Combats AI Dependency**: Uses AI to teach thinking, not replace it
- **Builds Workforce Skills**: Develops critical thinking, problem-solving, and analytical reasoning
- **Socratic Method Meets Modern AI**: Ancient wisdom powered by cutting-edge technology
