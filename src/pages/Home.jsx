import { Link, Navigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import Flag from '../components/ui/Flag'
import Logo from '../components/ui/Logo'
import { ArrowRight } from '../components/ui/Arrow'
import { usePageMeta } from '../lib/seo'

const PIN_COLORS = ['#e53935', '#1e88e5', '#43a047']

function createPinIcon(color) {
  return L.divIcon({
    html: `<svg width="25" height="34" viewBox="0 0 25 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 22.5 12.5 34 12.5 34S25 22.5 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${color}"/>
      <circle cx="12.5" cy="12" r="4.5" fill="white"/>
    </svg>`,
    className: '',
    iconSize: [25, 34],
    iconAnchor: [12.5, 34],
  })
}

const pinIcons = PIN_COLORS.map((c) => createPinIcon(c))

function Figure({ children }) {
  return (
    <div className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] overflow-hidden shadow-sm">
      <div className="pointer-events-none">{children}</div>
    </div>
  )
}

function DashboardMockup() {
  return (
    <div className="bg-[var(--color-surface)]">
      <div className="h-11 border-b border-[var(--color-border)] flex items-center px-5">
        <span className="flex items-center gap-1.5 text-xs font-semibold tracking-tight text-[var(--color-ink)]">
          <Logo size={13} />
          Meta Collections
        </span>
        <div className="ml-auto w-4 h-4 rounded-full bg-[var(--color-border)]/50" />
      </div>
      <div className="px-8 py-8">
        <h3 className="font-serif text-lg font-semibold tracking-tight text-[var(--color-ink)] mb-5">Your collections</h3>
        <div className="space-y-3">
          <MockCard emoji={'\u{1F3F0}'} name="Europe" metas="2" visibility="Private" skill="Beginner" region="Estonia" regionCode="EE" />
          <MockCard emoji={'\u{1F310}'} name="Public" metas="157" visibility="Public" skill="Advanced" region="World" regionCode="world" />
          <MockCard emoji={'\u{1F510}'} name="Top Secret" metas="19" visibility="Private" />
          <div className="border border-dashed border-[var(--color-border)] rounded-lg p-4 flex items-center gap-3 text-[var(--color-ink-faint)]">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="shrink-0">
              <line x1="10" y1="4" x2="10" y2="16" />
              <line x1="4" y1="10" x2="16" y2="10" />
            </svg>
            <span className="text-[11px] font-medium">New collection</span>
          </div>
        </div>
<h3 className="text-sm font-semibold tracking-tight text-[var(--color-ink)] mt-8 mb-3">Saved collections</h3>
          <div className="space-y-3">
            <MockCard emoji={'\u{1F5FA}'} name="World" metas="83" skill="Intermediate" region="World" regionCode="world" by="pandazan_" />
            <MockCard emoji={'\u{1F3DD}'} name="Islands" metas="41" skill="Beginner" region="Greece" regionCode="GR" by="vikoisdumb" />
          </div>
      </div>
    </div>
  )
}

function CollectionMockup() {
  return (
    <div className="bg-[var(--color-surface)] relative">
      <div className="h-11 border-b border-[var(--color-border)] grid grid-cols-3 items-center px-5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-[var(--color-ink-muted)]">{'\u2190'} All</span>
          <span className="text-lg">{'\u{1F3F0}'}</span>
          <span className="text-xs font-semibold tracking-tight text-[var(--color-ink)]">Europe</span>
          <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-ink-faint)] shrink-0">
            Private
          </span>
        </div>
        <div className="flex justify-center">
          <span className="text-[11px] font-medium text-[var(--color-surface)] bg-[var(--color-ink)] rounded-md px-2.5 py-1">
            + Add meta
          </span>
        </div>
      </div>
      <div className="px-8 py-6 space-y-3">
        <MockMeta
          number={1}
          text="Estonia uses red chevrons with white arrows."
          center={[58.8, 25.5]}
          zoom={5}
          example="Estonia"
          pinIndex={0}
        />
        <MockMeta
          number={2}
          text="The Netherlands has long yellow license plates with a blue strip on the left."
          center={[52.15, 5.3]}
          zoom={5}
          example="The Netherlands"
          pinIndex={1}
        />
      </div>
    </div>
  )
}

function MockCard({ emoji, name, metas, visibility, skill, region, regionCode, by }) {
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
    <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg p-4 flex items-center gap-3">
      <span className="text-lg shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-[var(--color-ink)] truncate">{name}</div>
        <div className="text-[11px] text-[var(--color-ink-faint)] mt-0.5 flex items-center gap-1.5">
          <span>{metas} metas</span>
          {visibility && (
            <span className="inline-flex items-center gap-0.5 text-[var(--color-ink-faint)]">
              {lockIcon}
              {visibility}
            </span>
          )}
          {by && (
            <span className="inline-flex items-center gap-0.5 text-[var(--color-ink-faint)]">
              by <span className="text-[var(--color-ink-muted)]">{by}</span>
            </span>
          )}
        </div>
        {(skill || region) && (
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {skill && (
              <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-[var(--color-border)]/40 text-[var(--color-ink-muted)]">
                {skill}
              </span>
            )}
            {region && (
              <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-[var(--color-border)]/40 text-[var(--color-ink-muted)] inline-flex items-center gap-1">
                <Flag code={regionCode || 'world'} size="text-[10px]" />
                {region}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function MockMeta({ number, text, center, zoom, example, pinIndex = 0 }) {
  return (
    <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg p-4">
      <div className="flex gap-3">
        <div className="w-5 shrink-0 pt-0.5">
          <span className="text-[11px] font-medium text-[var(--color-ink-faint)]">{number}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--color-ink)] leading-relaxed">{text}</p>
          <div className="mt-3 h-36 rounded-md border border-[var(--color-border)] overflow-hidden pointer-events-none">
            <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} attributionControl={false} zoomControl={false} dragging={false} doubleClickZoom={false} touchZoom={false} keyboard={false} style={{ height: '100%', width: '100%' }} className="mock-map">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={center} icon={pinIcons[pinIndex]} />
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

function CompassIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  )
}

function Feature({ index, icon, title, description }) {
  return (
    <div className="bg-[var(--color-surface-raised)] p-6 sm:p-7">
      <div className="flex items-center justify-between mb-8">
        <span className="w-9 h-9 rounded-md border border-[var(--color-border)] flex items-center justify-center text-[var(--color-ink-muted)]">
          {icon}
        </span>
        <span className="font-mono text-[11px] text-[var(--color-ink-faint)]">0{index}</span>
      </div>
      <h3 className="text-sm font-medium text-[var(--color-ink)] mb-1.5">{title}</h3>
      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{description}</p>
    </div>
  )
}

export default function Home() {
  const { user, loading: authLoading } = useAuth()

  usePageMeta({
    title: 'Meta Collections - GeoGuessr metas, in one place',
    description: 'Store your GeoGuessr metas in one place - organize tips and tricks by region and skill level, search them, and reference them while you play.',
  })

  if (authLoading) return <LoadingSpinner />
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[var(--color-ink)]">
            <Logo />
            Meta Collections
          </span>
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
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 dot-grid-fade opacity-70 pointer-events-none" aria-hidden="true" />
          <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-20 sm:pt-24 sm:pb-24">
            <div className="max-w-3xl">
              <p className="eyebrow mb-6">GeoGuessr meta organizer</p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[var(--color-ink)] leading-[1.02]">
                Your GeoGuessr metas,<br />in one place.
              </h1>
              <p className="text-base sm:text-lg text-[var(--color-ink-muted)] mt-6 leading-relaxed max-w-lg">
                Your metas are scattered across Discord, notes apps, and
                bookmarks you'll never open again. Put them somewhere
                you can actually find them.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-9">
                <Link to="/signup">
                  <Button>Get started</Button>
                </Link>
                <Link to="/login" className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors px-3 py-2">
                  I already have an account
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-16 sm:pb-20">
          <Link
            to="/discover"
            className="group relative flex items-center justify-between gap-4 w-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] rounded-xl pl-5 pr-6 py-5 transition-colors overflow-hidden"
          >
            <span className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-accent)]" aria-hidden="true" />
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-ink)] text-[var(--color-surface)] flex items-center justify-center shrink-0">
                <CompassIcon />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-[var(--color-ink)]">Browse public collections</h3>
                  <span className="hidden sm:inline font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--color-accent)]">No sign-in</span>
                </div>
                <p className="text-sm text-[var(--color-ink-muted)] line-clamp-2 sm:truncate">
                  Check out the most saved metas right away.
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)] transition-colors shrink-0">
              Discover
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="flex items-end justify-between mb-4">
            <span className="eyebrow">The dashboard</span>
            <span className="font-mono text-[11px] text-[var(--color-ink-faint)]">Fig. 01</span>
          </div>
          <Figure>
            <DashboardMockup />
          </Figure>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="flex items-end justify-between gap-6 mb-10 border-t border-[var(--color-border)] pt-6">
            <div>
              <p className="eyebrow mb-3">What you get</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
                Maps, Street View, and a share link.
              </h2>
            </div>
            <span className="hidden sm:block font-mono text-[11px] text-[var(--color-ink-faint)] shrink-0 pb-1">01 &mdash; 03</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-px bg-[var(--color-border)] border border-[var(--color-border)] rounded-xl overflow-hidden">
            <Feature
              index={1}
              icon={<PinIcon />}
              title="Mark things on a map"
              description="Explain your meta and drop up to 3 pins on the map to show exactly where to plonk."
            />
            <Feature
              index={2}
              icon={<LinkIcon />}
              title="Add Street View links"
              description="Show the exact frame instead of just trying to describe it."
            />
            <Feature
              index={3}
              icon={<ShareIcon />}
              title="Go public or stay private"
              description="Public collections give anyone read-only access with just a URL. Private ones stay yours."
            />
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="flex items-end justify-between mb-4">
            <span className="eyebrow">A collection</span>
            <span className="font-mono text-[11px] text-[var(--color-ink-faint)]">Fig. 02</span>
          </div>
          <Figure>
            <CollectionMockup />
          </Figure>
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-xs text-[var(--color-ink-faint)]">
            <Logo size={16} />
            <span className="font-medium text-[var(--color-ink-muted)]">Meta Collections</span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">
            Made for GeoGuessr
          </span>
          <a href="https://github.com/hannogeo/meta-collections" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)] transition-colors">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
