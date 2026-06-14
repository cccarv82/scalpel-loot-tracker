import { useMemo } from 'react'
import { prettyAreaName } from '../lib/area-name'
import { formatDuration } from '../lib/price'
import { useStore } from '../store'
import type { LootEntry } from '../types'

export function MapList() {
  const { maps, entries, currentMapId, settings } = useStore()
  const items = useMemo(() => {
    return maps
      .slice()
      .reverse()
      .map((m) => {
        const list = m.entryIds.map((id) => entries[id]).filter(Boolean) as LootEntry[]
        const filtered = list.filter((e) => e.chaosValue >= settings.minChaosValue)
        const sum = filtered.reduce((s, e) => s + e.chaosValue, 0)
        return { run: m, list: filtered, sum, isCurrent: m.id === currentMapId }
      })
  }, [maps, entries, currentMapId, settings.minChaosValue])

  if (items.length === 0) {
    return (
      <div style={{ padding: 16, opacity: 0.6, fontSize: 13 }}>
        Sem mapas registrados ainda. Entre num mapa pra começar.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map(({ run, list, sum, isCurrent }) => (
        <div
          key={run.id}
          style={{
            border: `1px solid ${isCurrent ? 'var(--accent, #6cf)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 6,
            padding: 8,
            background: 'var(--bg-card, rgba(255,255,255,0.03))',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <div>
              <strong style={{ color: 'var(--text, white)' }}>{prettyAreaName(run.zoneKey)}</strong>
              {run.zoneAreaLevel > 0 && (
                <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 11 }}>iLvl {run.zoneAreaLevel}</span>
              )}
              {isCurrent && (
                <span style={{ marginLeft: 6, color: 'var(--accent, #6cf)', fontSize: 11 }}>● live</span>
              )}
            </div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              {list.length} itens · {Math.round(sum)} {baseLabel()}
              {run.exitedAt && (
                <span style={{ marginLeft: 6 }}>· {formatDuration(run.exitedAt - run.enteredAt)}</span>
              )}
            </div>
          </div>
          {list.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0', display: 'grid', gap: 2 }}>
              {list
                .slice()
                .sort((a, b) => b.chaosValue - a.chaosValue)
                .slice(0, 6)
                .map((e) => (
                  <li
                    key={e.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      padding: '2px 4px',
                      color: 'var(--text, white)',
                    }}
                  >
                    <span>
                      {e.starred && '⭐ '}
                      <span style={{ color: rarityColor(e.rarity) }}>{displayName(e)}</span>
                      {e.stackSize > 1 && <span style={{ opacity: 0.6 }}> ×{e.stackSize}</span>}
                    </span>
                    <span style={{ opacity: 0.8 }}>{e.chaosValue > 0 ? e.chaosValue.toFixed(1) : '—'}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

function displayName(e: LootEntry): string {
  if (e.name && e.name !== e.baseType) return `${e.name} ${e.baseType}`.trim()
  return e.baseType || e.name || '(unknown)'
}

function rarityColor(r: string): string {
  switch (r) {
    case 'Unique':
      return '#af6025'
    case 'Rare':
      return '#ff7'
    case 'Magic':
      return '#88f'
    case 'Currency':
      return '#aa9e82'
    case 'Gem':
      return '#1ba29b'
    case 'DivinationCard':
      return '#0ebaff'
    default:
      return 'var(--text, white)'
  }
}

function baseLabel(): string {
  return useStore.getState().poeVersion === 2 ? 'ex' : 'c'
}
