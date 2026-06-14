import { useMemo } from 'react'
import { useStore } from '../store'
import type { LootEntry } from '../types'

interface Props {
  divinePrice: number | null
}

export function TopItems({ divinePrice }: Props) {
  const { entries, settings, toggleStar } = useStore()
  const top = useMemo<LootEntry[]>(() => {
    return Object.values(entries)
      .filter((e) => e.chaosValue >= settings.minChaosValue)
      .sort((a, b) => b.chaosValue - a.chaosValue)
      .slice(0, 10)
  }, [entries, settings.minChaosValue])

  if (top.length === 0) {
    return (
      <div style={{ padding: 16, opacity: 0.6, fontSize: 13 }}>
        No items captured yet. Use the price-check hotkey (Ctrl+D by default) on an item to add it.
      </div>
    )
  }

  return (
    <div>
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          opacity: 0.6,
          marginBottom: 6,
          color: 'var(--text-muted)',
        }}
      >
        Top of session
      </div>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 4 }}>
        {top.map((e, i) => {
          const divine = divinePrice ? e.chaosValue / divinePrice : null
          return (
            <li
              key={e.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto auto',
                gap: 8,
                alignItems: 'center',
                padding: '4px 8px',
                background: 'var(--bg-card, rgba(255,255,255,0.03))',
                borderRadius: 4,
                color: 'var(--text, white)',
                fontSize: 13,
              }}
            >
              <span style={{ width: 18, textAlign: 'right', opacity: 0.5 }}>{i + 1}.</span>
              <span>
                {e.name && e.name !== e.baseType ? `${e.name} ${e.baseType}` : e.baseType || e.name}
                {e.stackSize > 1 && <span style={{ opacity: 0.5 }}> ×{e.stackSize}</span>}
              </span>
              <span style={{ opacity: 0.85, fontVariantNumeric: 'tabular-nums' }}>
                {e.chaosValue <= 0
                  ? '—'
                  : divine != null
                    ? `${divine.toFixed(2)} div`
                    : `${e.chaosValue.toFixed(1)} c`}
              </span>
              <button
                type="button"
                onClick={() => toggleStar(e.id)}
                title={e.starred ? 'Remove star' : 'Star this item'}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: e.starred ? '#fc0' : 'rgba(255,255,255,0.3)',
                  fontSize: 14,
                }}
              >
                ★
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
