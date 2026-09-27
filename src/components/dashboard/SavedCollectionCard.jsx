import { Link } from 'react-router-dom'
import Flag from '../ui/Flag'
import { getRegion, WORLD } from '../../lib/regions'

const SKILL_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export default function SavedCollectionCard({ saved, onUnsave }) {
  const region = getRegion(saved.region)
  const skill = saved.skillLevel ? SKILL_LABELS[saved.skillLevel] : null

  return (
    <div className="group relative bg-[var(--color-surface-raised)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] rounded-lg p-4 transition-all flex items-center gap-3">
      <Link
        to={`/${saved.ownerUsername}/${saved.name}`}
        className="absolute inset-0 rounded-lg z-0"
        tabIndex={-1}
      />
      <div className="w-10 h-10 flex items-center justify-center rounded-lg text-xl shrink-0">
        {saved.emoji}
      </div>
      <div className="flex-1 min-w-0 relative z-10 pointer-events-none">
        <h3 className="text-sm font-medium text-[var(--color-ink)] truncate">
          {saved.name}
        </h3>
        <p className="text-xs text-[var(--color-ink-faint)] mt-0.5 tabular-nums flex items-center gap-1.5">
          <span>{saved.metaCount || 0} {saved.metaCount === 1 ? 'meta' : 'metas'}</span>
          <span className="inline-flex items-center gap-0.5 text-[var(--color-ink-faint)]">
            by <span className="text-[var(--color-ink-muted)]">{saved.ownerUsername}</span>
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
                {region.code === WORLD.code ? region.name : region.name}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="relative shrink-0 z-10">
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onUnsave(saved)
          }}
          className="opacity-100 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded text-[var(--color-ink-faint)] hover:text-[var(--color-danger)] hover:bg-[var(--color-border)]/40 transition-all cursor-pointer"
          title="Remove from saved"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}