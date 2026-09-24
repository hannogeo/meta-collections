import RegionSelect from './RegionSelect'

const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export default function CollectionSettings({ skillLevel, onSkillLevelChange, region, onRegionChange, required }) {
  return (
    <div className="border border-[var(--color-border)] rounded-md p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">
          Collection details
        </span>
        {required && (
          <span className="text-[10px] text-[var(--color-danger)] font-medium">
            Required
          </span>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1.5">
          Skill level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SKILL_LEVELS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onSkillLevelChange(skillLevel === s.value ? null : s.value)}
              className={`px-2 py-2 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                skillLevel === s.value
                  ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-surface)]'
                  : 'border-[var(--color-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-ink)]'
              } ${required && !skillLevel ? 'border-[var(--color-danger)]/40' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1.5">
          Region
        </label>
        <RegionSelect value={region} onChange={onRegionChange} clearable={!required} />
      </div>

      {required && (
        <p className="text-xs text-[var(--color-ink-faint)]">
          Choose a skill level and region so others can find your collection.
        </p>
      )}
    </div>
  )
}