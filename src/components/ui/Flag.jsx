import { WORLD } from '../../lib/regions'

export default function Flag({ code, size = 'text-base' }) {
  if (code === WORLD.code) {
    return <span className={`${size} leading-none shrink-0`}>{'\u{1F30D}'}</span>
  }
  return <span className={`fi fi-${code.toLowerCase()} ${size} leading-none shrink-0 rounded-[2px]`} />
}