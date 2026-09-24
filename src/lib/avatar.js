export const AVATAR_COLORS = [
  '#e53935',
  '#d81b60',
  '#8e24aa',
  '#5e35b1',
  '#3949ab',
  '#1e88e5',
  '#039be5',
  '#00acc1',
  '#00897b',
  '#43a047',
  '#7cb342',
  '#c0ca33',
  '#ffb300',
  '#fb8c00',
  '#f4511e',
  '#6d4c41',
  '#757575',
  '#546e7a',
  '#37474f',
  '#c2185b',
  '#7b1fa2',
  '#283593',
  '#1565c0',
  '#0277bd',
  '#00838f',
  '#00695c',
  '#2e7d32',
  '#558b2f',
  '#9e9d24',
  '#ef6c00',
  '#bf360c',
]

export function randomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}

export function avatarColorFromUsername(username = '') {
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) | 0
  }
  const index = ((hash % AVATAR_COLORS.length) + AVATAR_COLORS.length) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

export function avatarLetter(username = '') {
  return username ? username.charAt(0).toUpperCase() : '\u{1F464}'
}