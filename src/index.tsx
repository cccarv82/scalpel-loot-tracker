import { isTownOrHideout, type PluginActivate, type ScalpelPluginContext } from '@scalpelpoe/plugin-sdk'
import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './components/App'
import { TAB_ICON } from './components/icons'
import { hashItem, makeEntryId } from './lib/item-hash'
import { parseLogLine } from './lib/log-parser'
import { buildIndex, lookupPrice, type PriceIndex } from './lib/price'
import { loadFromStorage, useStore } from './store'
import type { LootEntry } from './types'

const activate: PluginActivate = async (ctx: ScalpelPluginContext) => {
  // 1. Hydrate from storage (or init fresh)
  const initialLeague = ctx.getLeague()
  const initialPoe = ctx.getPoeVersion()
  const persisted = await loadFromStorage(ctx.storage)
  if (persisted.state) {
    useStore.getState().hydrate({
      state: persisted.state,
      settings: persisted.settings ?? undefined,
      history: persisted.history,
    })
    // If saved session is from a different league/version, archive + reset
    const st = useStore.getState()
    if (
      st.settings.autoResetOnLeagueChange &&
      (st.league !== initialLeague || st.poeVersion !== initialPoe)
    ) {
      st.resetSession({ league: initialLeague, poeVersion: initialPoe, archive: true })
    }
  } else {
    useStore.getState().hydrate({
      settings: persisted.settings ?? undefined,
      history: persisted.history,
    })
    useStore.getState().init({ league: initialLeague, poeVersion: initialPoe })
  }

  // 2. Price index for hash lookups happening before App mounts (and for hotkey star)
  let priceIndex: PriceIndex = {
    byName: new Map(),
    divinePrice: null,
    updatedAt: null,
  }
  const refreshPrices = async () => {
    const { prices, updatedAt } = await ctx.prices.getPrices()
    priceIndex = buildIndex(prices, updatedAt)
  }
  void refreshPrices()
  const offPrices = ctx.prices.onChange(refreshPrices)

  // 3. Capture items via onCurrentItem
  const offItem = ctx.onCurrentItem((item) => {
    const hash = hashItem({
      name: item.name,
      baseType: item.baseType,
      itemClass: item.itemClass,
      rarity: item.rarity,
      itemLevel: item.itemLevel,
      quality: item.quality,
      stackSize: item.stackSize,
      sockets: item.sockets,
      corrupted: item.corrupted,
      identified: item.identified,
      explicits: item.explicits,
      implicits: item.implicits,
      enchants: item.enchants,
      imbues: item.imbues,
    })
    const price = lookupPrice(
      {
        name: item.name,
        baseType: item.baseType,
        itemClass: item.itemClass,
        rarity: item.rarity,
        stackSize: item.stackSize,
      },
      priceIndex,
    )
    const zone = ctx.getCurrentZone()
    const entry: LootEntry = {
      id: makeEntryId(),
      hash,
      name: item.name,
      baseType: item.baseType,
      itemClass: item.itemClass,
      rarity: item.rarity,
      stackSize: Math.max(1, item.stackSize),
      itemLevel: item.itemLevel,
      mapTier: item.mapTier,
      chaosValue: price.chaosValue,
      divineValue: price.divineValue,
      starred: false,
      capturedAt: Date.now(),
      zoneKey: zone?.areaCode ?? null,
    }
    useStore.getState().addEntry(entry)
  })

  // 4. Zone tracking - start a new map run on every zone change. Filter
  // hideouts/towns later if needed (SDK exposes isTownOrHideout helper but the
  // areaCode shape is the same string we treat as the key here).
  const offZone = ctx.onCurrentZone((zone) => {
    if (!zone) return
    const poe = ctx.getPoeVersion()
    if (isTownOrHideout(zone.areaCode, poe)) {
      // End any in-progress run; don't start one for towns/hideouts.
      useStore.getState().endCurrentMap(Date.now())
      return
    }
    useStore.getState().startMap(zone.areaCode, zone.areaLevel, Date.now())
  })

  // 5. Optional Client.txt timing (more precise than realtime zone change)
  const offLog = ctx.onLogLine((line) => {
    if (!useStore.getState().settings.showLogTimings) return
    const ev = parseLogLine(line)
    if (!ev) return
    if (ev.kind === 'enter' && ev.zoneName) {
      // Don't double-create a run if Zone change already fired one within 3s
      const st = useStore.getState()
      const last = st.maps[st.maps.length - 1]
      if (last && Math.abs(last.enteredAt - ev.at) < 3000) return
      st.startMap(ev.zoneName, 0, ev.at)
    } else if (ev.kind === 'connecting') {
      useStore.getState().endCurrentMap(ev.at)
    }
  })

  // 6. League change handler
  const offLeague = ctx.onLeagueChange((league) => {
    const st = useStore.getState()
    if (!st.settings.autoResetOnLeagueChange) return
    st.resetSession({ league, poeVersion: ctx.getPoeVersion(), archive: true })
  })

  // 7. Hotkey: star the most recently captured item
  ctx.registerHotkey({ label: 'Star last item' }, () => {
    const entries = Object.values(useStore.getState().entries)
    if (entries.length === 0) return
    const latest = entries.reduce((a, b) => (a.capturedAt >= b.capturedAt ? a : b))
    useStore.getState().toggleStar(latest.id)
  })

  // 8. Register the tab and mount React
  let root: Root | null = null
  ctx.registerTab({
    label: 'Loot Tracker',
    icon: TAB_ICON,
    render: (container) => {
      root = createRoot(container)
      root.render(
        <StrictMode>
          <App ctx={ctx} />
        </StrictMode>,
      )
      return () => {
        root?.unmount()
        root = null
      }
    },
  })

  return () => {
    offItem()
    offZone()
    offLog()
    offLeague()
    offPrices()
    root?.unmount()
  }
}

export default activate
