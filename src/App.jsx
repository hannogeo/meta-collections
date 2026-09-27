import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Discover from './pages/Discover'
import Collection from './pages/Collection'
import Profile from './pages/Profile'
import Trash from './pages/Trash'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/:username/:collectionName" element={<Collection />} />
            <Route path="/:username" element={<Profile />} />
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
