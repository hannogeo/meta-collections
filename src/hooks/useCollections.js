import { useState, useEffect } from 'react'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  increment,
  getDoc,
  getDocs,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getUserUid } from '../lib/users'

const MAX_COLLECTIONS = 5
const MAX_METAS = 1000

export function useCollections(userId) {
  const [collections, setCollections] = useState([])
  const [trashCollections, setTrashCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!userId) {
      setCollections([])
      setTrashCollections([])
      setLoading(false)
      setLoaded(false)
      return
    }

    setLoading(true)
    setLoaded(false)

    const q = query(
      collection(db, 'users', userId, 'collections'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setCollections(all.filter((c) => !c.deletedAt))
      setTrashCollections(all.filter((c) => c.deletedAt))
      setLoading(false)
      setLoaded(true)
    })

    return unsubscribe
  }, [userId])

  function isNameTaken(name, excludeId) {
    return collections.some(
      (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== excludeId
    )
  }

  async function createCollection(name, emoji, visibility = 'private') {
    const activeCount = collections.length
    if (activeCount >= MAX_COLLECTIONS) {
      throw new Error(`Maximum of ${MAX_COLLECTIONS} collections reached`)
    }
    if (isNameTaken(name)) {
      throw new Error('A collection with this name already exists')
    }

    const docRef = await addDoc(collection(db, 'users', userId, 'collections'), {
      name,
      emoji: emoji || null,
      visibility,
      createdAt: serverTimestamp(),
      metaCount: 0,
      deletedAt: null,
    })

    return docRef.id
  }

  async function renameCollection(collectionId, newName, emoji, visibility) {
    if (isNameTaken(newName, collectionId)) {
      throw new Error('A collection with this name already exists')
    }
    const updates = { name: newName }
    if (emoji !== undefined) updates.emoji = emoji || null
    if (visibility !== undefined) updates.visibility = visibility
    await updateDoc(doc(db, 'users', userId, 'collections', collectionId), updates)
  }

  async function updateEmoji(collectionId, emoji) {
    await updateDoc(doc(db, 'users', userId, 'collections', collectionId), {
      emoji: emoji || null,
    })
  }

  async function softDeleteCollection(collectionId) {
    await updateDoc(doc(db, 'users', userId, 'collections', collectionId), {
      deletedAt: serverTimestamp(),
    })
  }

  async function restoreCollection(collectionId) {
    await updateDoc(doc(db, 'users', userId, 'collections', collectionId), {
      deletedAt: null,
    })
  }

  async function permanentDeleteCollection(collectionId) {
    const metasSnap = await getDocs(collection(db, 'users', userId, 'collections', collectionId, 'metas'))

    for (const metaDoc of metasSnap.docs) {
      await deleteDoc(doc(db, 'users', userId, 'collections', collectionId, 'metas', metaDoc.id))
    }

    await deleteDoc(doc(db, 'users', userId, 'collections', collectionId))
  }

  async function emptyTrash() {
    for (const col of trashCollections) {
      await permanentDeleteCollection(col.id)
    }
  }

  async function getMetas(collectionId) {
    const q = query(
      collection(db, 'users', userId, 'collections', collectionId, 'metas'),
      orderBy('order', 'asc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  }

  async function addMeta(collectionId, { text, mapData, examples }) {
    const colDoc = await getDoc(doc(db, 'users', userId, 'collections', collectionId))
    const colData = colDoc.data()

    if (colData.metaCount >= MAX_METAS) {
      throw new Error(`Maximum of ${MAX_METAS} metas per collection reached`)
    }

    const metaRef = await addDoc(
      collection(db, 'users', userId, 'collections', collectionId, 'metas'),
      {
        text,
        mapData: mapData || null,
        examples: examples || null,
        createdAt: serverTimestamp(),
        order: colData.metaCount,
      }
    )

    await updateDoc(doc(db, 'users', userId, 'collections', collectionId), {
      metaCount: increment(1),
    })

    return metaRef.id
  }

  async function updateMeta(collectionId, metaId, { text, mapData, examples }) {
    await updateDoc(doc(db, 'users', userId, 'collections', collectionId, 'metas', metaId), {
      text,
      mapData: mapData || null,
      examples: examples || null,
    })
  }

  async function deleteMeta(collectionId, metaId) {
    await deleteDoc(doc(db, 'users', userId, 'collections', collectionId, 'metas', metaId))
    await updateDoc(doc(db, 'users', userId, 'collections', collectionId), {
      metaCount: increment(-1),
    })
  }

  return {
    collections,
    trashCollections,
    loading,
    loaded,
    createCollection,
    renameCollection,
    updateEmoji,
    softDeleteCollection,
    restoreCollection,
    permanentDeleteCollection,
    emptyTrash,
    getMetas,
    addMeta,
    updateMeta,
    deleteMeta,
    MAX_COLLECTIONS,
    MAX_METAS,
  }
}

export async function resolveCollectionPath(username, collectionName) {
  const uid = await getUserUid(username.toLowerCase())
  if (!uid) return null

  const q = query(
    collection(db, 'users', uid, 'collections'),
    where('name', '==', collectionName),
    where('visibility', '==', 'public')
  )
  const snap = await getDocs(q)
  if (snap.empty) return null

  const doc = snap.docs[0]
  const data = doc.data()
  if (data.deletedAt) return null

  return { uid, collectionId: doc.id, ...data }
}

export async function loadPublicMetas(uid, collectionId) {
  const q = query(
    collection(db, 'users', uid, 'collections', collectionId, 'metas'),
    orderBy('order', 'asc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}
