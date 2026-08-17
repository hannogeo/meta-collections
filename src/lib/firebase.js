import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCh6rsAWT4EVxvVcZTGYSSeSGdjjP4efGE",
  authDomain: "meta-collections.firebaseapp.com",
  projectId: "meta-collections",
  storageBucket: "meta-collections.firebasestorage.app",
  messagingSenderId: "944092077181",
  appId: "1:944092077181:web:b26c7780b2287e93c32514",
  measurementId: "G-B1MFG325V1"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
