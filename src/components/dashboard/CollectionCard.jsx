import { Link } from 'react-router-dom'
import Button from '../ui/Button'

export default function CollectionCard({ collection, onDelete }) {
  return (
    <Link
      to={`/collections/${collection.id}`}
      className="group flex items-center justify-between px-4 py-3 -mx-4 rounded-md hover:bg-[var(--color-border)]/30 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-[var(--color-ink)] truncate">
          {collection.name}
        </h3>
        <p className="text-xs text-[var(--color-ink-faint)] mt-0.5">
          {collection.metaCount || 0} {collection.metaCount === 1 ? 'meta' : 'metas'}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDelete(collection.id, collection.name)
        }}
        className="opacity-0 group-hover:opacity-100 text-[var(--color-ink-faint)] hover:text-[var(--color-danger)] text-sm transition-all cursor-pointer ml-4"
      >
        &times;
      </button>
    </Link>
  )
}
