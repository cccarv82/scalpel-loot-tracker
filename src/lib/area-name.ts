// Scalpel's Zone.areaCode is the raw PoE area id (e.g. "MapOrnateChambers",
// "IncursionHubEndgame"). Split camelCase to get readable display strings
// without bundling a giant area-name table.

const KNOWN_PREFIXES = ['Map', 'Hideout', 'Incursion', 'Town', 'Sanctum', 'Sanctum2', 'Heist', 'Delve']

export function prettyAreaName(code: string): string {
  if (!code) return ''
  let stripped = code
  let prefix = ''
  for (const p of KNOWN_PREFIXES) {
    if (stripped.startsWith(p) && stripped.length > p.length && /[A-Z0-9]/.test(stripped[p.length])) {
      prefix = p
      stripped = stripped.slice(p.length)
      break
    }
  }
  const words = stripped
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim()
  if (!prefix) return words
  switch (prefix) {
    case 'Map':
      return `${words} Map`
    case 'Hideout':
      return `${words} Hideout`
    default:
      return `${prefix} · ${words}`
  }
}
