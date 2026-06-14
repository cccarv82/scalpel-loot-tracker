import type { PluginStorage } from '@scalpelpoe/plugin-sdk'
import { create } from 'zustand'
import { DEFAULT_SETTINGS, type LootEntry, type MapRun, type SavedSession, type SessionState, type Settings } from './types'

const STORAGE_KEYS = {
  session: 'session',
  settings: 'settings',
  history: 'history',
} as const

interface Store extends SessionState {
  settings: Settings
  savedHistory: SavedSession[]
  ready: boolean

  init(initial: { league: string; poeVersion: 1 | 2 }): SessionState
  hydrate(payload: { state?: SessionState; settings?: Settings; history?: SavedSession[] }): void

  addEntry(entry: LootEntry): { added: boolean; entry: LootEntry; existingId?: string }
  toggleStar(entryId: string): void
  startMap(zoneKey: string, zoneAreaLevel: number, enteredAt: number): MapRun
  endCurrentMap(at: number): void
  resetSession(opts: { league: string; poeVersion: 1 | 2; archive?: boolean }): void

  updateSettings(patch: Partial<Settings>): void
}

const blankSession = (league: string, poeVersion: 1 | 2): SessionState => ({
  startedAt: Date.now(),
  league,
  poeVersion,
  entries: {},
  maps: [],
  currentMapId: null,
})

export const useStore = create<Store>((set, get) => ({
  ...blankSession('', 1),
  settings: DEFAULT_SETTINGS,
  savedHistory: [],
  ready: false,

  init(initial) {
    const cur = get()
    if (cur.ready && cur.league) return cur
    const fresh = blankSession(initial.league, initial.poeVersion)
    set({ ...fresh, ready: true })
    return fresh
  },

  hydrate({ state, settings, history }) {
    set((prev) => ({
      ...prev,
      ...(state ?? {}),
      settings: { ...DEFAULT_SETTINGS, ...(settings ?? {}) },
      savedHistory: history ?? [],
      ready: true,
    }))
  },

  addEntry(entry) {
    const s = get()
    const existing = Object.values(s.entries).find((e) => e.hash === entry.hash)
    if (existing) {
      // dedupe — bump capturedAt so it floats up in "recent" without double counting
      const updated: LootEntry = { ...existing, capturedAt: entry.capturedAt }
      set({ entries: { ...s.entries, [updated.id]: updated } })
      return { added: false, entry: updated, existingId: existing.id }
    }
    set({ entries: { ...s.entries, [entry.id]: entry } })
    if (s.currentMapId) {
      const idx = s.maps.findIndex((m) => m.id === s.currentMapId)
      if (idx >= 0) {
        const maps = s.maps.slice()
        maps[idx] = { ...maps[idx], entryIds: [...maps[idx].entryIds, entry.id] }
        set({ maps })
      }
    }
    return { added: true, entry }
  },

  toggleStar(entryId) {
    const s = get()
    const e = s.entries[entryId]
    if (!e) return
    set({ entries: { ...s.entries, [entryId]: { ...e, starred: !e.starred } } })
  },

  startMap(zoneKey, zoneAreaLevel, enteredAt) {
    const s = get()
    const ended = s.currentMapId ? endMapAt(s.maps, s.currentMapId, enteredAt) : s.maps
    const run: MapRun = {
      id: `m-${enteredAt.toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      zoneKey,
      zoneAreaLevel,
      enteredAt,
      exitedAt: null,
      entryIds: [],
    }
    set({ maps: [...ended, run], currentMapId: run.id })
    return run
  },

  endCurrentMap(at) {
    const s = get()
    if (!s.currentMapId) return
    set({ maps: endMapAt(s.maps, s.currentMapId, at), currentMapId: null })
  },

  resetSession({ league, poeVersion, archive }) {
    const s = get()
    const history = archive ? [...s.savedHistory, snapshot(s)] : s.savedHistory
    const fresh = blankSession(league, poeVersion)
    set({ ...fresh, settings: s.settings, savedHistory: history, ready: true })
  },

  updateSettings(patch) {
    set((s) => ({ settings: { ...s.settings, ...patch } }))
  },
}))

function endMapAt(maps: MapRun[], id: string, at: number): MapRun[] {
  return maps.map((m) => (m.id === id && m.exitedAt == null ? { ...m, exitedAt: at } : m))
}

function snapshot(s: SessionState): SavedSession {
  const entries = Object.values(s.entries)
  return {
    state: { ...s, entries: { ...s.entries }, maps: [...s.maps] },
    endedAt: Date.now(),
    totalChaos: entries.reduce((sum, e) => sum + e.chaosValue, 0),
    itemCount: entries.length,
    mapCount: s.maps.length,
  }
}

export async function loadFromStorage(storage: PluginStorage): Promise<{
  state: SessionState | null
  settings: Settings | null
  history: SavedSession[]
}> {
  const [state, settings, history] = await Promise.all([
    storage.get<SessionState>(STORAGE_KEYS.session),
    storage.get<Settings>(STORAGE_KEYS.settings),
    storage.get<SavedSession[]>(STORAGE_KEYS.history),
  ])
  return { state, settings, history: history ?? [] }
}

export async function persistState(storage: PluginStorage, s: Store): Promise<void> {
  const payload: SessionState = {
    startedAt: s.startedAt,
    league: s.league,
    poeVersion: s.poeVersion,
    entries: s.entries,
    maps: s.maps,
    currentMapId: s.currentMapId,
  }
  await storage.set(STORAGE_KEYS.session, payload)
}

export async function persistSettings(storage: PluginStorage, settings: Settings): Promise<void> {
  await storage.set(STORAGE_KEYS.settings, settings)
}

export async function persistHistory(storage: PluginStorage, history: SavedSession[]): Promise<void> {
  await storage.set(STORAGE_KEYS.history, history)
}
