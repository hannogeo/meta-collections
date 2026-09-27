import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
  updateDoc,
  increment,
  writeBatch,
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
    try {
      await updateDoc(doc(db, 'users', ownerUid, 'collections', collectionId), {
        saveCount: increment(1),
      })
    } catch {}
  }

  async function unsaveCollection(ownerUid, collectionId) {
    await deleteDoc(doc(db, 'users', userId, 'savedCollections', savedDocId(ownerUid, collectionId)))
    try {
      await updateDoc(doc(db, 'users', ownerUid, 'collections', collectionId), {
        saveCount: increment(-1),
      })
    } catch {}
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

export function useFollows(profileUid, viewerUid) {
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [myFollowing, setMyFollowing] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!profileUid) {
      setFollowers([])
      setFollowing([])
      setLoading(false)
      setError(false)
      return
    }

    setLoading(true)
    setError(false)
    const un1 = onSnapshot(
      query(collection(db, 'users', profileUid, 'followers'), orderBy('followedAt', 'desc')),
      (snap) => setFollowers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => setError(true)
    )
    const un2 = onSnapshot(
      query(collection(db, 'users', profileUid, 'following'), orderBy('followedAt', 'desc')),
      (snap) => setFollowing(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => setError(true)
    )

    const t = setTimeout(() => setLoading(false), 1)

    return () => {
      un1()
      un2()
      clearTimeout(t)
    }
  }, [profileUid])

  useEffect(() => {
    if (!viewerUid) {
      setMyFollowing([])
      return
    }
    const un = onSnapshot(
      query(collection(db, 'users', viewerUid, 'following'), orderBy('followedAt', 'desc')),
      (snap) => setMyFollowing(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => {}
    )
    return un
  }, [viewerUid])

  const isFollowing = !!profileUid && myFollowing.some((f) => f.id === profileUid)

  const follow = useCallback(async ({ myUsername, myAvatarColor, targetUsername, targetAvatarColor }) => {
    if (!profileUid || !viewerUid) return
    const batch = writeBatch(db)
    batch.set(doc(db, 'users', viewerUid, 'following', profileUid), {
      username: targetUsername || null,
      avatarColor: targetAvatarColor || null,
      followedAt: serverTimestamp(),
    })
    batch.set(doc(db, 'users', profileUid, 'followers', viewerUid), {
      username: myUsername || null,
      avatarColor: myAvatarColor || null,
      followedAt: serverTimestamp(),
    })
    await batch.commit()
  }, [profileUid, viewerUid])

  const unfollow = useCallback(async () => {
    if (!profileUid || !viewerUid) return
    const batch = writeBatch(db)
    batch.delete(doc(db, 'users', viewerUid, 'following', profileUid))
    batch.delete(doc(db, 'users', profileUid, 'followers', viewerUid))
    await batch.commit()
  }, [profileUid, viewerUid])

  return { followers, following, followersCount: followers.length, followingCount: following.length, isFollowing, follow, unfollow, loading, error }
}