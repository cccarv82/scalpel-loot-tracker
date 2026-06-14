import type { PriceEntry } from '@scalpelpoe/plugin-sdk'
import type { LootEntry } from '../types'

export interface PriceIndex {
  byName: Map<string, PriceEntry>
  divinePrice: number | null
  updatedAt: number | null
}

export function buildIndex(prices: PriceEntry[], updatedAt: number | null): PriceIndex {
  const byName = new Map<string, PriceEntry>()
  let divine: number | null = null
  for (const p of prices) {
    byName.set(p.name.toLowerCase(), p)
    if (!divine && /^divine orb$/i.test(p.name) && p.chaosValue > 0) divine = p.chaosValue
  }
  return { byName, divinePrice: divine, updatedAt }
}

interface PriceableItem {
  name: string
  baseType: string
  itemClass: string
  rarity: string
  stackSize: number
}

export function lookupPrice(
  item: PriceableItem,
  index: PriceIndex,
): { chaosValue: number; divineValue: number | null } {
  const candidates = [item.name, item.baseType, `${item.name} ${item.baseType}`.trim()].filter(Boolean)
  let entry: PriceEntry | undefined
  for (const c of candidates) {
    entry = index.byName.get(c.toLowerCase())
    if (entry) break
  }
  if (!entry) return { chaosValue: 0, divineValue: null }
  const stack = Math.max(1, item.stackSize)
  const chaos = entry.chaosValue * stack
  const divine = entry.divineValue != null ? entry.divineValue * stack : null
  return { chaosValue: chaos, divineValue: divine }
}

export function chaosToDivine(chaos: number, divinePrice: number | null): number | null {
  if (!divinePrice || divinePrice <= 0) return null
  return chaos / divinePrice
}

export function totalChaos(entries: LootEntry[], minChaos = 0): number {
  let t = 0
  for (const e of entries) if (e.chaosValue >= minChaos) t += e.chaosValue
  return t
}

export function dropsPerHour(count: number, startedAt: number, now = Date.now()): number {
  const hours = (now - startedAt) / 3_600_000
  if (hours <= 0) return 0
  return count / hours
}

export function chaosPerHour(chaos: number, startedAt: number, now = Date.now()): number {
  const hours = (now - startedAt) / 3_600_000
  if (hours <= 0) return 0
  return chaos / hours
}

export function formatDuration(ms: number): string {
  const sec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}
