import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './components/Landing'
import PDFUpload from './components/PDFUpload'
import LearningInterface from './components/LearningInterface'

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page - No Layout wrapper */}
        <Route path="/" element={<Landing />} />
        
        {/* Upload Page - With Layout */}
        <Route
          path="/upload"
          element={
            <Layout>
              <PDFUpload />
            </Layout>
          }
        />
        
        {/* Learning Interface - No Layout (has its own full-screen layout) */}
        <Route 
          path="/learn" 
          element={<LearningInterface />} 
        />
      </Routes>
    </Router>
  )
}

export default App