import { useState, useEffect } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export function savedDocId(ownerUid, collectionId) {
  return `${ownerUid}_${collectionId}`
}

export function useSavedCollections(userId) {
  const [savedCollections, setSavedCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!userId) {
      setSavedCollections([])
      setLoading(false)
      setLoaded(false)
      return
    }

    setLoading(true)
    setLoaded(false)

    const q = query(
      collection(db, 'users', userId, 'savedCollections'),
      orderBy('savedAt', 'desc')
    )

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        setSavedCollections(snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })))
        setLoading(false)
        setLoaded(true)
      },
      () => {
        setLoading(false)
        setLoaded(false)
      }
    )

    return unsubscribe
  }, [userId])

  function isSaved(ownerUid, collectionId) {
    return savedCollections.some(
      (s) => s.ownerUid === ownerUid && s.collectionId === collectionId
    )
  }

  async function saveCollection({ ownerUid, ownerUsername, collectionId, collection }) {
    const id = savedDocId(ownerUid, collectionId)
    await setDoc(doc(db, 'users', userId, 'savedCollections', id), {
      ownerUid,
      ownerUsername,
      collectionId,
      name: collection.name,
      emoji: collection.emoji || null,
      visibility: collection.visibility || 'public',
      skillLevel: collection.skillLevel || null,
      region: collection.region || null,
      metaCount: collection.metaCount || 0,
      savedAt: serverTimestamp(),
    })
  }

  async function unsaveCollection(ownerUid, collectionId) {
    await deleteDoc(doc(db, 'users', userId, 'savedCollections', savedDocId(ownerUid, collectionId)))
  }

  return {
    savedCollections,
    loading,
    loaded,
    isSaved,
    saveCollection,
    unsaveCollection,
  }
}