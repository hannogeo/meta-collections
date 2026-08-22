import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

export async function getUserUid(usernameLower) {
  const snap = await getDoc(doc(db, 'usernames', usernameLower))
  return snap.exists() ? snap.data().uid : null
}

export async function setUsername(uid, username, oldUsernameLower) {
  const usernameLower = username.toLowerCase()

  const existing = await getUserUid(usernameLower)
  if (existing && existing !== uid) {
    throw new Error('Username is already taken')
  }

  if (oldUsernameLower && oldUsernameLower !== usernameLower) {
    await deleteDoc(doc(db, 'usernames', oldUsernameLower)).catch(() => {})
  }

  await setDoc(doc(db, 'users', uid), { username, usernameLower }, { merge: true })
  await setDoc(doc(db, 'usernames', usernameLower), { uid })
}
