import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useDiscover() {
  const [users, setUsers] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'))
        const usernamesSnap = await getDocs(collection(db, 'usernames'))

        const usernameUids = {}
        for (const d of usernamesSnap.docs) {
          usernameUids[d.id] = d.data().uid
        }

        const publicUsers = []
        for (const d of usersSnap.docs) {
          const u = { uid: d.id, ...d.data() }
          if (!u.username) continue
          if (u.profileVisibility === 'private') continue
          if (usernameUids[u.username.toLowerCase()] !== u.uid) continue
          publicUsers.push(u)
        }

        const settled = await Promise.allSettled(
          publicUsers.map((u) =>
            getDocs(query(collection(db, 'users', u.uid, 'collections'), where('visibility', '==', 'public')))
          )
        )

        const cols = []
        settled.forEach((res, i) => {
          if (res.status !== 'fulfilled') return
          const owner = publicUsers[i]
          for (const d of res.value.docs) {
            const data = d.data()
            if (data.deletedAt) continue
            cols.push({
              id: d.id,
              ...data,
              ownerUid: owner.uid,
              ownerUsername: owner.username,
              ownerAvatarColor: owner.avatarColor || null,
            })
          }
        })

        if (!active) return
        setUsers(publicUsers)
        setCollections(cols)
        setError(false)
        setLoading(false)
      } catch {
        if (!active) return
        setError(true)
        setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  return { users, collections, loading, error }
}