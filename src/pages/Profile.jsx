import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { getUserByUsername } from '../lib/users'
import { avatarColorFromUsername } from '../lib/avatar'
import { useFollows, useSavedCollections } from '../hooks/useSavedCollections'
import Avatar from '../components/ui/Avatar'
import AvatarMenu from '../components/ui/AvatarMenu'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Flag from '../components/ui/Flag'
import { getRegion } from '../lib/regions'
import { usePageMeta } from '../lib/seo'

const SKILL_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export default function Profile() {
  const { username } = useParams()
  const { user, userProfile, loading: authLoading } = useAuth()

  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [collections, setCollections] = useState([])
  const [showList, setShowList] = useState(null)
  const [followError, setFollowError] = useState(false)
  const [saveErrorId, setSaveErrorId] = useState(null)

  const { isSaved, saveCollection, unsaveCollection } = useSavedCollections(user?.uid)

  const isViewerOwner = !!user && profile?.uid === user.uid

  useEffect(() => {
    let active = true
    setProfile(null)
    setCollections([])
    setProfileLoading(true)
    setNotFound(false)
    ;(async () => {
      try {
        const result = await getUserByUsername(username)
        if (!active) return
        if (!result) {
          setNotFound(true)
          setProfileLoading(false)
          return
        }
        const privateProfile = result.profileVisibility === 'private'
        if (privateProfile && !(user && result.uid === user.uid)) {
          setNotFound(true)
          setProfileLoading(false)
          return
        }
        setProfile(result)
        setProfileLoading(false)
      } catch {
        if (!active) return
        setNotFound(true)
        setProfileLoading(false)
      }
    })()
    return () => { active = false }
  }, [username, user])

  useEffect(() => {
    if (!profile?.uid) return
    const q = query(
      collection(db, 'users', profile.uid, 'collections'),
      where('visibility', '==', 'public')
    )
    const unsubscribe = onSnapshot(q, (snap) => {
      setCollections(snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((c) => !c.deletedAt))
    })
    return unsubscribe
  }, [profile?.uid])

  const { followers, following, followersCount, followingCount, isFollowing, follow, unfollow, error: followsError } =
    useFollows(profile?.uid || null, user?.uid || null)

  usePageMeta({
    title: profile ? `${profile.username} | Meta Collections` : 'Meta Collections',
    description: profile
      ? `View ${profile.username}'s public GeoGuessr collections${collections.length ? ` - ${collections.length} ${collections.length === 1 ? 'collection' : 'collections'}` : ''}.`
      : 'View this Meta Collections profile.',
    noindex: false,
  })

  if (authLoading) return <LoadingSpinner />
  if (profileLoading) return <LoadingSpinner />
  if (notFound || !profile) return <Navigate to="/404" />

  async function handleFollowToggle() {
    setFollowError(false)
    try {
      if (isFollowing) {
        await unfollow()
      } else {
        await follow({
          myUsername: userProfile?.username,
          myAvatarColor: userProfile?.avatarColor,
          targetUsername: profile.username,
          targetAvatarColor: profile.avatarColor,
        })
      }
    } catch {
      setFollowError(true)
    }
  }

  const listData = showList === 'followers'
    ? followers
    : showList === 'following'
      ? following
      : []

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">
            Meta Collections
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <AvatarMenu />
            ) : (
              <>
                <Link to="/login" className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
                  Log in
                </Link>
                <Link to="/signup">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-start gap-5">
          <Avatar
            username={profile.username}
            color={profile.avatarColor || avatarColorFromUsername(profile.username)}
            size={72}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] truncate">
                {profile.username}
              </h1>
              {user && !isViewerOwner && (
                <Button
                  onClick={handleFollowToggle}
                  variant={isFollowing ? 'secondary' : 'primary'}
                  className="text-sm px-4 py-1.5"
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-5 mt-2">
              <button
                onClick={() => setShowList('followers')}
                className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
              >
                <span className="font-medium text-[var(--color-ink)]">{followersCount}</span> Followers
              </button>
              <button
                onClick={() => setShowList('following')}
                className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
              >
                <span className="font-medium text-[var(--color-ink)]">{followingCount}</span> Following
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-[var(--color-ink-faint)]">
              {profile.profileVisibility === 'private' && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-[var(--color-border)] uppercase tracking-wider">
                  Private profile
                </span>
              )}
            </div>
          </div>
        </div>

        {followError && (
          <p className="mt-4 text-sm text-[var(--color-danger)]">
            Could not {isFollowing ? 'unfollow' : 'follow'} this user. Please try again.
          </p>
        )}
        {followsError && (
          <p className="mt-4 text-sm text-[var(--color-danger)]">
            Could not load followers/following for this profile.
          </p>
        )}

        <div className="mt-12">
          <h2 className="text-base font-semibold tracking-tight text-[var(--color-ink)] mb-4">
            Public collections
          </h2>
          {collections.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-muted)]">
              No public collections yet.
            </p>
          ) : (
            <div className="space-y-3">
              {collections.map((col) => (
                <ProfileCollectionCard
                  key={col.id}
                  collection={col}
                  username={profile.username}
                  canSave={!!user && !isViewerOwner}
                  isSaved={isSaved(profile.uid, col.id)}
                  onToggleSave={async () => {
                    setSaveErrorId(null)
                    try {
                      if (isSaved(profile.uid, col.id)) {
                        await unsaveCollection(profile.uid, col.id)
                      } else {
                        await saveCollection({
                          ownerUid: profile.uid,
                          ownerUsername: profile.username,
                          collectionId: col.id,
                          collection: col,
                        })
                      }
                    } catch {
                      setSaveErrorId(col.id)
                    }
                  }}
                  saveError={saveErrorId === col.id}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Modal
        open={!!showList}
        onClose={() => setShowList(null)}
        title={showList === 'followers' ? 'Followers' : 'Following'}
      >
        {listData.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">
            {followsError
              ? 'Could not load this list. Please try again.'
              : `Nobody${showList === 'followers' ? ' follows' : ' is followed by'} ${profile.username} yet.`}
          </p>
        ) : (
          <div className="space-y-1">
            {listData.map((u) => (
              <Link
                key={u.id}
                to={`/${u.username}`}
                onClick={() => setShowList(null)}
                className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[var(--color-border)]/30 transition-colors"
              >
                <Avatar
                  username={u.username}
                  color={u.avatarColor || avatarColorFromUsername(u.username)}
                  size={28}
                />
                <span className="text-sm text-[var(--color-ink)]">{u.username}</span>
              </Link>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

function ProfileCollectionCard({ collection, username, canSave, isSaved, onToggleSave, saveError }) {
  const region = collection.region ? getRegion(collection.region) : null
  const skill = collection.skillLevel ? SKILL_LABELS[collection.skillLevel] : null

  return (
    <div className="group relative bg-[var(--color-surface-raised)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] rounded-lg p-4 transition-all flex items-center gap-3">
      <Link
        to={`/${username}/${collection.name}`}
        className="absolute inset-0 rounded-lg z-0"
        tabIndex={-1}
      />
      <div className="w-10 h-10 flex items-center justify-center rounded-lg text-xl shrink-0">
        {collection.emoji}
      </div>
      <div className="flex-1 min-w-0 relative z-10 pointer-events-none">
        <h3 className="text-sm font-medium text-[var(--color-ink)] truncate">
          {collection.name}
        </h3>
        <p className="text-xs text-[var(--color-ink-faint)] mt-0.5 tabular-nums flex items-center gap-1.5 flex-wrap">
          <span>{collection.metaCount || 0} {collection.metaCount === 1 ? 'meta' : 'metas'}</span>
          <span className="inline-flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            {collection.saveCount || 0} {collection.saveCount === 1 ? 'save' : 'saves'}
          </span>
        </p>
        {(skill || region) && (
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {skill && (
              <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-[var(--color-border)]/40 text-[var(--color-ink-muted)]">
                {skill}
              </span>
            )}
            {region && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-[var(--color-border)]/40 text-[var(--color-ink-muted)]">
                <Flag code={region.code} size="text-[11px]" />
                {region.name}
              </span>
            )}
          </div>
        )}
      </div>
      {canSave && saveError && (
        <span className="text-xs text-[var(--color-danger)] shrink-0">Could not save.</span>
      )}
      {canSave && (
        <div className="relative shrink-0 z-10">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleSave()
            }}
            className={`text-xs font-medium rounded-md px-3 py-1.5 transition-colors cursor-pointer border ${
              isSaved
                ? 'border-[var(--color-border)] text-[var(--color-ink)] bg-[var(--color-border)]/20 hover:text-[var(--color-ink)] hover:border-[var(--color-border-hover)]'
                : 'border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-border-hover)]'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save collection'}
          >
            {isSaved ? (
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                Saved
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                Save
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}