import { useEffect, useState } from 'react'
import { chaosPerHour, chaosToDivine, dropsPerHour, formatDuration, totalChaos } from '../lib/price'
import { useStore } from '../store'

interface Props {
  divinePrice: number | null
  pricesUpdatedAt: number | null
}

export function Stats({ divinePrice, pricesUpdatedAt }: Props) {
  const { entries, maps, startedAt, settings } = useStore()
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5000)
    return () => clearInterval(id)
  }, [])
  void tick

  const list = Object.values(entries)
  const chaos = totalChaos(list, settings.minChaosValue)
  const divine = chaosToDivine(chaos, divinePrice)
  const cph = chaosPerHour(chaos, startedAt)
  const dph = dropsPerHour(list.length, startedAt)
  const duration = formatDuration(Date.now() - startedAt)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 8,
        padding: 12,
        background: 'var(--bg-card, rgba(255,255,255,0.04))',
        borderRadius: 8,
        marginBottom: 12,
      }}
    >
      <Metric label="Sessão" value={duration} />
      <Metric label="Mapas" value={String(maps.length)} />
      <Metric label="Itens" value={String(list.length)} />
      <Metric
        label="Valor total"
        value={
          divine != null
            ? `${divine.toFixed(1)} div`
            : `${Math.round(chaos)} ${baseLabel()}`
        }
        hint={divine != null ? `${Math.round(chaos)} ${baseLabel()}` : undefined}
      />
      <Metric label="Por hora" value={divinePrice ? `${(cph / divinePrice).toFixed(2)} div/h` : `${Math.round(cph)} c/h`} />
      <Metric label="Drops/h" value={dph.toFixed(1)} />
      {pricesUpdatedAt && <Metric label="Ninja" value={timeAgo(pricesUpdatedAt)} dim />}
    </div>
  )
}

function Metric({ label, value, hint, dim }: { label: string; value: string; hint?: string; dim?: boolean }) {
  return (
    <div style={{ opacity: dim ? 0.6 : 1 }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted, rgba(255,255,255,0.55))' }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text, white)' }}>{value}</div>
      {hint && <div style={{ fontSize: 11, color: 'var(--text-muted, rgba(255,255,255,0.55))' }}>{hint}</div>}
    </div>
  )
}

function baseLabel(): string {
  return useStore.getState().poeVersion === 2 ? 'ex' : 'c'
}

function timeAgo(t: number): string {
  const s = Math.floor((Date.now() - t) / 1000)
  if (s < 60) return `${s}s atrás`
  if (s < 3600) return `${Math.floor(s / 60)}m atrás`
  return `${Math.floor(s / 3600)}h atrás`
}
