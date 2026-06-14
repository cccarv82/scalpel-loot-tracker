import { useMemo, useState } from 'react'
import { prettyAreaName } from '../lib/area-name'
import { useStore } from '../store'

interface Props {
  divinePrice: number | null
}

export function Chart({ divinePrice }: Props) {
  const { maps, entries, settings } = useStore()
  const [hover, setHover] = useState<{ i: number; x: number } | null>(null)

  const data = useMemo(() => {
    return maps.map((m) => {
      const filtered = m.entryIds
        .map((id) => entries[id])
        .filter((e) => e && e.chaosValue >= settings.minChaosValue)
      const sum = filtered.reduce((s, e) => s + e.chaosValue, 0)
      return {
        label: prettyAreaName(m.zoneKey),
        value: divinePrice ? sum / divinePrice : sum,
        chaos: sum,
        items: filtered.length,
        durationMs: m.exitedAt != null ? m.exitedAt - m.enteredAt : null,
      }
    })
  }, [maps, entries, divinePrice, settings.minChaosValue])

  if (data.length === 0) return null

  const max = Math.max(...data.map((d) => d.value), 0.01)
  const hasValue = data.some((d) => d.value > 0)
  const unit = divinePrice ? 'div' : 'chaos'

  return (
    <div style={{ marginTop: 12, position: 'relative' }}>
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          opacity: 0.6,
          marginBottom: 4,
          color: 'var(--text-muted, rgba(255,255,255,0.55))',
        }}
      >
        Value per map ({unit})
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 4,
          height: 80,
          padding: 6,
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 4,
          overflowX: 'auto',
          position: 'relative',
        }}
        onMouseLeave={() => setHover(null)}
      >
        {!hasValue && (
          <div style={{ width: '100%', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            no value data yet
          </div>
        )}
        {hasValue &&
          data.map((d, i) => {
            const h = Math.max(2, (d.value / max) * 64)
            const active = hover?.i === i
            return (
              <div
                key={`${d.label}-${i}`}
                onMouseEnter={(e) => {
                  const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect()
                  setHover({ i, x: e.currentTarget.getBoundingClientRect().left - rect.left + 6 })
                }}
                style={{
                  width: 12,
                  flexShrink: 0,
                  height: h,
                  background: active ? '#ffc04d' : '#f0a020',
                  borderRadius: 2,
                  opacity: active ? 1 : 0.9,
                  cursor: 'default',
                  transition: 'background 80ms, opacity 80ms',
                }}
              />
            )
          })}
        {hover && data[hover.i] && (
          <div
            style={{
              position: 'absolute',
              bottom: 88,
              left: hover.x,
              transform: 'translateX(-50%)',
              background: 'rgba(20,20,25,0.95)',
              color: 'white',
              padding: '6px 8px',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: 11,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{data[hover.i].label}</div>
            <div>
              {data[hover.i].value.toFixed(2)} {unit}
              {divinePrice && (
                <span style={{ opacity: 0.6 }}> · {data[hover.i].chaos.toFixed(0)} ex</span>
              )}
            </div>
            <div style={{ opacity: 0.6 }}>
              {data[hover.i].items} items
              {data[hover.i].durationMs != null && ` · ${formatMin(data[hover.i].durationMs as number)}`}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatMin(ms: number): string {
  const sec = Math.floor(ms / 1000)
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}
