// Stable hash for an item. PoeItem has no native id, so derive one from fields
// that identify "the same item the user already inspected this session" without
// counting two genuinely different items as one. Mods/sockets are included so
// rerolling counts as new.

interface HashableItem {
  name: string
  baseType: string
  itemClass: string
  rarity: string
  itemLevel: number
  quality: number
  stackSize: number
  sockets: string
  corrupted: boolean
  identified: boolean
  explicits: string[]
  implicits: string[]
  enchants: string[]
  imbues: string[]
}

export function hashItem(item: HashableItem): string {
  const parts = [
    item.name,
    item.baseType,
    item.itemClass,
    item.rarity,
    item.itemLevel,
    item.quality,
    item.stackSize,
    item.sockets,
    item.corrupted ? 'c' : '',
    item.identified ? 'i' : '',
    item.explicits.join('|'),
    item.implicits.join('|'),
    item.enchants.join('|'),
    item.imbues.join('|'),
  ]
  return djb2(parts.join('\x1f'))
}

function djb2(str: string): string {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i)
  }
  return (h >>> 0).toString(36)
}

export function makeEntryId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
