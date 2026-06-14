import type { LootEntry, MapRun, SessionState } from '../types'

export function exportJSON(state: SessionState): string {
  return JSON.stringify(state, null, 2)
}

export function exportCSV(state: SessionState): string {
  const header = [
    'capturedAt',
    'name',
    'baseType',
    'rarity',
    'itemClass',
    'stackSize',
    'itemLevel',
    'mapTier',
    'chaosValue',
    'divineValue',
    'starred',
    'zoneKey',
  ].join(',')
  const rows = Object.values(state.entries).map((e) => csvRow(e))
  return [header, ...rows].join('\n')
}

function csvRow(e: LootEntry): string {
  return [
    new Date(e.capturedAt).toISOString(),
    csvCell(e.name),
    csvCell(e.baseType),
    csvCell(e.rarity),
    csvCell(e.itemClass),
    e.stackSize,
    e.itemLevel,
    e.mapTier,
    e.chaosValue.toFixed(2),
    e.divineValue?.toFixed(4) ?? '',
    e.starred ? '1' : '0',
    csvCell(e.zoneKey ?? ''),
  ].join(',')
}

function csvCell(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`
  return v
}

export function downloadText(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export interface CompactMapSummary {
  zoneKey: string
  zoneAreaLevel: number
  durationMs: number | null
  itemCount: number
  totalChaos: number
}

export function summarizeMaps(state: SessionState): CompactMapSummary[] {
  return state.maps.map((m: MapRun) => {
    const entries = m.entryIds.map((id) => state.entries[id]).filter(Boolean)
    return {
      zoneKey: m.zoneKey,
      zoneAreaLevel: m.zoneAreaLevel,
      durationMs: m.exitedAt != null ? m.exitedAt - m.enteredAt : null,
      itemCount: entries.length,
      totalChaos: entries.reduce((s, e) => s + e.chaosValue, 0),
    }
  })
}
