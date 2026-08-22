import { useEffect, useRef, useCallback } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'

function TiltCard({ children, glossIntensity = 0.07 }) {
  const ref = useRef(null)
  const frameRef = useRef(null)
  const intensityRef = useRef(glossIntensity)
  intensityRef.current = glossIntensity

  const handleMouseMove = useCallback((e) => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const midX = rect.width / 2
      const midY = rect.height / 2
      const rotateY = ((x - midX) / midX) * 6
      const rotateX = ((midY - y) / midY) * 6
      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`
      const gloss = el.querySelector('.gloss')
      if (gloss) {
        gloss.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,${intensityRef.current}) 0%, transparent 50%)`
        gloss.style.opacity = '1'
      }
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)'
    const gloss = el.querySelector('.gloss')
    if (gloss) gloss.style.opacity = '0'
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm transition-transform duration-200 ease-out select-none"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="gloss absolute inset-0 pointer-events-none z-10 opacity-0 transition-opacity duration-300" />
      <div className="pointer-events-none">{children}</div>
    </div>
  )
}

function DashboardMockup() {
  return (
    <div className="bg-[var(--color-surface)]">
      <div className="h-11 border-b border-[var(--color-border)] flex items-center px-5">
        <span className="text-xs font-semibold tracking-tight text-[var(--color-ink)]">Meta Collections</span>
        <div className="ml-auto w-4 h-4 rounded-full bg-[var(--color-border)]/50" />
      </div>
      <div className="px-8 py-8">
        <h3 className="text-lg font-semibold tracking-tight text-[var(--color-ink)] mb-5">Your collections</h3>
        <div className="grid grid-cols-2 gap-3">
          <MockCard emoji={'\u{1F3F0}'} name="Europe" metas="2" visibility="Private" />
          <MockCard emoji={'\u{1F310}'} name="Public" metas="157" visibility="Public" />
          <MockCard emoji={'\u{1F510}'} name="Top Secret" metas="19" visibility="Private" />
          <div className="border border-dashed border-[var(--color-border)] rounded-lg p-4 flex flex-col items-center justify-center gap-1.5 text-[var(--color-ink-faint)] min-h-[68px]">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="10" y1="4" x2="10" y2="16" />
              <line x1="4" y1="10" x2="16" y2="10" />
            </svg>
            <span className="text-[11px] font-medium">New collection</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CollectionMockup() {
  return (
    <div className="bg-[var(--color-surface)]">
      <div className="h-11 border-b border-[var(--color-border)] flex items-center px-5 gap-3">
        <span className="text-xs text-[var(--color-ink-muted)]">{'\u2190'} All</span>
        <span className="text-lg">{'\u{1F3F0}'}</span>
        <span className="text-xs font-semibold tracking-tight text-[var(--color-ink)]">Europe</span>
        <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-ink-faint)] ml-auto">
          Private
        </span>
        <span className="text-[11px] tabular-nums text-[var(--color-ink-faint)]">2/1000</span>
      </div>
      <div className="px-8 py-6 space-y-3">
        <MockMeta
          number={1}
          text="Estonia uses red chevrons with white arrows."
          center={[58.8, 25.5]}
          zoom={5}
          example="Estonia"
        />
        <MockMeta
          number={2}
          text="The Netherlands has long yellow license plates with a blue strip on the left."
          center={[52.15, 5.3]}
          zoom={5}
          example="The Netherlands"
        />
      </div>
    </div>
  )
}

function MockCard({ emoji, name, metas, visibility }) {
  const lockIcon = visibility === 'Private' ? (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ) : (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
  return (
    <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg p-4 flex items-center">
      <span className="text-lg shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0 ml-3">
        <div className="text-xs font-medium text-[var(--color-ink)] truncate">{name}</div>
        <div className="text-[11px] text-[var(--color-ink-faint)] mt-0.5 flex items-center gap-1.5">
          <span>{metas} metas</span>
          <span className="inline-flex items-center gap-0.5 text-[var(--color-ink-faint)]">
            {lockIcon}
            {visibility}
          </span>
        </div>
      </div>
    </div>
  )
}

function MockMeta({ number, text, center, zoom, example }) {
  return (
    <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg p-4">
      <div className="flex gap-3">
        <div className="w-5 shrink-0 pt-0.5">
          <span className="text-[11px] font-medium text-[var(--color-ink-faint)]">{number}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--color-ink)] leading-relaxed">{text}</p>
          <div className="mt-3 h-36 rounded-md border border-[var(--color-border)] overflow-hidden pointer-events-none">
            <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} attributionControl={false} zoomControl={false} dragging={false} doubleClickZoom={false} touchZoom={false} keyboard={false} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={center} />
            </MapContainer>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--color-ink-faint)]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <span className="truncate">{example}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  )
}

function Feature({ icon, title, description }) {
  return (
    <div>
      <div className="w-9 h-9 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-ink-muted)] mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-medium text-[var(--color-ink)] mb-1.5">{title}</h3>
      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{description}</p>
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()

  useEffect(() => { document.title = 'Meta Collections' }, [])

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">Meta Collections</span>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
              Log in
            </Link>
            <Link to="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-20 sm:pt-28 sm:pb-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--color-ink)] leading-[1.1]">
              Your GeoGuessr metas,<br />in one place.
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-ink-muted)] mt-5 leading-relaxed max-w-lg">
              Your metas are scattered across Discord, notes apps, and
              bookmarks you'll never open again. Put them somewhere
              you can actually find them.
            </p>
            <div className="flex items-center gap-3 mt-8">
              <Link to="/signup">
                <Button>Get started</Button>
              </Link>
              <Link to="/login" className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors px-3 py-2">
                Already have an account?
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-24">
          <TiltCard glossIntensity={0.03}>
            <DashboardMockup />
          </TiltCard>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-24">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] mb-12">
            What you can do
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
            <Feature
              icon={<PinIcon />}
              title="Mark things on a map"
              description="Explain your meta and drop a pin or draw a polygon on the map."
            />
            <Feature
              icon={<LinkIcon />}
              title="Add Street View links"
              description="Show the exact frame instead of just trying to describe it."
            />
            <Feature
              icon={<ShareIcon />}
              title="Go public or stay private"
              description="Public collections give anyone read-only access with just a URL. Private ones stay yours."
            />
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-24">
          <TiltCard>
            <CollectionMockup />
          </TiltCard>
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="text-xs text-[var(--color-ink-faint)]">Meta Collections</span>
          <a href="https://github.com/hannogeo/meta-collections" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)] transition-colors">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
