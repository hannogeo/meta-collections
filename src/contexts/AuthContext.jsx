import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { getUserProfile } from '../lib/users'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user) { setUserProfile(null); return }
    let active = true
    getUserProfile(user.uid).then((profile) => {
      if (active) setUserProfile(profile)
    })
    return () => { active = false }
  }, [user])

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  function logout() {
    setUserProfile(null)
    return signOut(auth)
  }

  const value = { user, userProfile, setUserProfile, loading, signup, login, logout }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
