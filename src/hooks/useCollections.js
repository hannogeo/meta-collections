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
} from 'firebase/firestore'
import { db } from '../lib/firebase'

const MAX_COLLECTIONS = 5
const MAX_METAS = 1000

export function useCollections(userId) {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setCollections([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'users', userId, 'collections'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setCollections(data)
      setLoading(false)
    })

    return unsubscribe
  }, [userId])

  async function createCollection(name) {
    if (collections.length >= MAX_COLLECTIONS) {
      throw new Error(`Maximum of ${MAX_COLLECTIONS} collections reached`)
    }

    const docRef = await addDoc(collection(db, 'users', userId, 'collections'), {
      name,
      createdAt: serverTimestamp(),
      metaCount: 0,
    })

    return docRef.id
  }

  async function deleteCollection(collectionId) {
    const metasSnap = await getDocs(collection(db, 'users', userId, 'collections', collectionId, 'metas'))

    for (const metaDoc of metasSnap.docs) {
      await deleteDoc(doc(db, 'users', userId, 'collections', collectionId, 'metas', metaDoc.id))
    }

    await deleteDoc(doc(db, 'users', userId, 'collections', collectionId))
  }

  async function getMetas(collectionId) {
    const q = query(
      collection(db, 'users', userId, 'collections', collectionId, 'metas'),
      orderBy('order', 'asc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  }

  async function addMeta(collectionId, { text, mapData }) {
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
        createdAt: serverTimestamp(),
        order: colData.metaCount,
      }
    )

    await updateDoc(doc(db, 'users', userId, 'collections', collectionId), {
      metaCount: increment(1),
    })

    return metaRef.id
  }

  async function updateMeta(collectionId, metaId, { text, mapData }) {
    await updateDoc(doc(db, 'users', userId, 'collections', collectionId, 'metas', metaId), {
      text,
      mapData: mapData || null,
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
    loading,
    createCollection,
    deleteCollection,
    getMetas,
    addMeta,
    updateMeta,
    deleteMeta,
    MAX_COLLECTIONS,
    MAX_METAS,
  }
}
