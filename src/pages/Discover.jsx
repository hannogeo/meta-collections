import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDiscover } from '../hooks/useDiscover'
import { useSavedCollections } from '../hooks/useSavedCollections'
import AppNav from '../components/ui/AppNav'
import AvatarMenu from '../components/ui/AvatarMenu'
import Avatar from '../components/ui/Avatar'
import Logo from '../components/ui/Logo'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Flag from '../components/ui/Flag'
import DiscoverRegionFilter from '../components/discover/DiscoverRegionFilter'
import { getRegion, getContinent, WORLD } from '../lib/regions'
import { avatarColorFromUsername } from '../lib/avatar'
import { usePageMeta } from '../lib/seo'

const PAGE_SIZE = 10
const CONTINENT_CODE_SUFFIX = '__continent'

const SKILL_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export default function Discover() {
  const { user, loading: authLoading } = useAuth()
  const { users, collections, loading, error } = useDiscover()
  const { isSaved, saveCollection, unsaveCollection } = useSavedCollections(user?.uid)

  const [searchQuery, setSearchQuery] = useState('')
  const [mode, setMode] = useState('collections')
  const [regionFilter, setRegionFilter] = useState(null)
  const [page, setPage] = useState(1)

  usePageMeta({
    title: 'Discover | Meta Collections',
    description: 'Discover the most saved GeoGuessr meta collections.',
    noindex: true,
  })

  useEffect(() => {
    setPage(1)
  }, [searchQuery, mode, regionFilter])

  if (authLoading) return <LoadingSpinner />

  const q = searchQuery.trim().toLowerCase()

  const filteredCollections = collections
    .filter((c) => {
      if (regionFilter === WORLD.code) return c.region === WORLD.code
      if (typeof regionFilter === 'string' && regionFilter.endsWith(CONTINENT_CODE_SUFFIX)) {
        const contCode = regionFilter.replace(CONTINENT_CODE_SUFFIX, '')
        return getContinent(c.region)?.code === contCode
      }
      if (typeof regionFilter === 'string') return c.region === regionFilter
      return true
    })
    .filter((c) => (q ? c.name.toLowerCase().includes(q) : true))
    .sort((a, b) => (b.saveCount || 0) - (a.saveCount || 0) || a.name.localeCompare(b.name))

  const filteredUsers = users
    .filter((u) => (q ? u.username?.toLowerCase().includes(q) : true))
    .sort((a, b) => a.username.localeCompare(b.username))

  const isFiltered = !!regionFilter
  const isCollectionsMode = mode === 'collections'
  const showUsersPrompt = !isCollectionsMode && !q
  const results = isCollectionsMode ? filteredCollections : filteredUsers
  const paginate = isCollectionsMode ? (q || isFiltered) : true
  const totalPages = paginate ? Math.max(1, Math.ceil(results.length / PAGE_SIZE)) : 1
  const safePage = Math.min(page, totalPages)
  const shown = paginate
    ? results.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
    : results.slice(0, PAGE_SIZE)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[var(--color-ink)]">
            <Logo />
            Meta Collections
          </Link>
          <div className="flex items-center gap-4">
            {user && <AppNav current="discover" />}
            {user ? (
              <AvatarMenu />
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
                  Log in
                </Link>
                <Link to="/signup">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] mb-1">
          Discover
        </h1>
        {isCollectionsMode && (q || isFiltered) && (
          <p className="text-sm text-[var(--color-ink-faint)] mb-6">
            {results.length} {results.length === 1 ? 'collection' : 'collections'}
          </p>
        )}

        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)] pointer-events-none">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isCollectionsMode ? 'Search collections...' : 'Search users...'}
                className="w-full pl-9 pr-3 py-2 text-sm bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)]/40 transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="flex rounded-md border border-[var(--color-border)] overflow-hidden shrink-0">
              {['collections', 'users'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    mode === m
                      ? 'bg-[var(--color-ink)] text-[var(--color-surface)]'
                      : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)]/30'
                  }`}
                >
                  {m === 'collections' ? 'Collections' : 'Users'}
                </button>
              ))}
            </div>
          </div>

          {isCollectionsMode && (
            <div className="max-w-xs">
              <DiscoverRegionFilter value={regionFilter} onChange={setRegionFilter} />
            </div>
          )}
        </div>

        {loading ? (
          <LoadingSpinner fullPage={false} />
        ) : error ? (
          <p className="text-sm text-[var(--color-danger)]">
            Could not load discover data. Please try again.
          </p>
        ) : showUsersPrompt ? (
          <p className="text-sm text-[var(--color-ink-muted)] text-center py-16">
            Search for users to find them.
          </p>
        ) : shown.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)] text-center py-16">
            {isCollectionsMode
              ? q || isFiltered
                ? 'No collections match your search.'
                : 'No public collections yet.'
              : 'No users match your search.'}
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {isCollectionsMode
                ? shown.map((c) => (
                    <DiscoverCollectionCard
                      key={`${c.ownerUid}_${c.id}`}
                      collection={c}
                      isSaved={isSaved(c.ownerUid, c.id)}
                      canSave={!!user && c.ownerUid !== user.uid}
                      onToggleSave={async () => {
                        if (isSaved(c.ownerUid, c.id)) {
                          await unsaveCollection(c.ownerUid, c.id)
                        } else {
                          await saveCollection({
                            ownerUid: c.ownerUid,
                            ownerUsername: c.ownerUsername,
                            collectionId: c.id,
                            collection: c,
                          })
                        }
                      }}
                    />
                  ))
                : shown.map((u) => (
                    <DiscoverUserCard
                      key={u.uid}
                      user={u}
                      publicCollectionCount={collections.filter((c) => c.ownerUid === u.uid).length}
                    />
                  ))}
            </div>

            {paginate && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  &larr; Previous
                </button>
                <span className="text-sm tabular-nums text-[var(--color-ink-faint)]">
                  {safePage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function DiscoverCollectionCard({ collection, isSaved, canSave, onToggleSave }) {
  const region = collection.region ? getRegion(collection.region) : null
  const skill = collection.skillLevel ? SKILL_LABELS[collection.skillLevel] : null

  return (
    <div className="group relative flex items-center gap-3 bg-[var(--color-surface-raised)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] rounded-lg p-4 transition-all">
      <Link
        to={`/${collection.ownerUsername}/${collection.name}`}
        className="group absolute inset-0 rounded-lg z-0"
        tabIndex={-1}
        aria-label={`Open ${collection.name}`}
      />
      <Link to={`/${collection.ownerUsername}/${collection.name}`} className="w-10 h-10 flex items-center justify-center rounded-lg text-xl shrink-0">
        {collection.emoji || (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[var(--color-ink-faint)]">
            <circle cx="10" cy="10" r="8" strokeDasharray="3 3"/>
          </svg>
        )}
      </Link>
      <div className="flex-1 min-w-0 relative z-10 pointer-events-none">
        <h3 className="text-sm font-medium text-[var(--color-ink)] truncate">
          {collection.name}
        </h3>
        <p className="text-xs text-[var(--color-ink-faint)] mt-0.5 tabular-nums flex items-center gap-1.5">
          <span>{collection.metaCount || 0} {collection.metaCount === 1 ? 'meta' : 'metas'}</span>
          <span className="inline-flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            {collection.saveCount || 0} {collection.saveCount === 1 ? 'save' : 'saves'}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[var(--color-ink-faint)]">
            by{' '}
            <Link
              to={`/${collection.ownerUsername}`}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:underline underline-offset-2 transition-colors"
            >
              {collection.ownerUsername}
            </Link>
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
                ? 'border-[var(--color-border)] text-[var(--color-ink)] bg-[var(--color-border)]/20'
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

function DiscoverUserCard({ user, publicCollectionCount }) {
  return (
    <Link
      to={`/${user.username}`}
      className="flex items-center gap-3 bg-[var(--color-surface-raised)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] rounded-lg p-4 transition-all"
    >
      <Avatar
        username={user.username}
        color={user.avatarColor || avatarColorFromUsername(user.username)}
        size={36}
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-[var(--color-ink)] truncate">
          {user.username}
        </h3>
        <p className="text-xs text-[var(--color-ink-faint)] mt-0.5 tabular-nums">
          {publicCollectionCount} public {publicCollectionCount === 1 ? 'collection' : 'collections'}
        </p>
      </div>
    </Link>
  )
}