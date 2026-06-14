import { useEffect, useState } from 'react'
import type { ScalpelPluginContext } from '@scalpelpoe/plugin-sdk'
import { downloadText, exportCSV, exportJSON } from '../lib/export'
import { buildIndex, type PriceIndex } from '../lib/price'
import { persistHistory, persistSettings, persistState, useStore } from '../store'
import { Chart } from './Chart'
import { MapList } from './MapList'
import { SettingsPanel } from './Settings'
import { Stats } from './Stats'
import { TopItems } from './TopItems'

interface Props {
  ctx: ScalpelPluginContext
}

export function App({ ctx }: Props) {
  const store = useStore()
  const [priceIndex, setPriceIndex] = useState<PriceIndex>({
    byName: new Map(),
    divinePrice: null,
    updatedAt: null,
  })
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    let cancelled = false
    const refresh = async () => {
      const { prices, updatedAt } = await ctx.prices.getPrices()
      if (cancelled) return
      setPriceIndex(buildIndex(prices, updatedAt))
    }
    void refresh()
    const off = ctx.prices.onChange(refresh)
    return () => {
      cancelled = true
      off()
    }
  }, [ctx])

  useEffect(() => {
    void persistState(ctx.storage, store)
  }, [ctx, store.entries, store.maps, store.currentMapId, store.startedAt, store.league, store.poeVersion])

  useEffect(() => {
    void persistSettings(ctx.storage, store.settings)
  }, [ctx, store.settings])

  useEffect(() => {
    void persistHistory(ctx.storage, store.savedHistory)
  }, [ctx, store.savedHistory])

  const onReset = () => {
    if (!confirm('Resetar sessão atual? (mantém histórico)')) return
    store.resetSession({ league: ctx.getLeague(), poeVersion: ctx.getPoeVersion(), archive: true })
  }

  const onExportJSON = () => {
    downloadText(`scalpel-loot-${Date.now()}.json`, exportJSON(snapState(store)), 'application/json')
  }
  const onExportCSV = () => {
    downloadText(`scalpel-loot-${Date.now()}.csv`, exportCSV(snapState(store)), 'text/csv')
  }

  return (
    <div style={{ padding: 12, color: 'var(--text, white)', fontFamily: 'inherit', minHeight: '100%' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
        }}
      >
        <div>
          <strong style={{ fontSize: 16 }}>Loot Tracker</strong>
          <span style={{ marginLeft: 8, opacity: 0.6, fontSize: 12 }}>
            PoE{ctx.getPoeVersion()} · {ctx.getLeague() || '—'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" onClick={onReset} style={btnStyle}>
            Reset
          </button>
          <button type="button" onClick={onExportJSON} style={btnStyle}>
            JSON
          </button>
          <button type="button" onClick={onExportCSV} style={btnStyle}>
            CSV
          </button>
          <button type="button" onClick={() => setShowSettings((v) => !v)} style={btnStyle}>
            {showSettings ? 'Fechar' : 'Settings'}
          </button>
        </div>
      </header>

      <Stats divinePrice={priceIndex.divinePrice} pricesUpdatedAt={priceIndex.updatedAt} />
      <Chart divinePrice={priceIndex.divinePrice} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
        <section>
          <div
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              opacity: 0.6,
              marginBottom: 6,
              color: 'var(--text-muted)',
            }}
          >
            Mapas
          </div>
          <MapList />
        </section>
        <section>
          <TopItems divinePrice={priceIndex.divinePrice} />
        </section>
      </div>

      {showSettings && <SettingsPanel />}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: 'var(--bg-card, rgba(255,255,255,0.06))',
  color: 'var(--text, white)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 4,
  padding: '4px 10px',
  fontSize: 12,
  cursor: 'pointer',
}

function snapState(store: ReturnType<typeof useStore.getState>) {
  return {
    startedAt: store.startedAt,
    league: store.league,
    poeVersion: store.poeVersion,
    entries: store.entries,
    maps: store.maps,
    currentMapId: store.currentMapId,
  }
}
