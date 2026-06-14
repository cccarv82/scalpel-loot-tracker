export type ItemRarity = 'Normal' | 'Magic' | 'Rare' | 'Unique' | 'Currency' | 'Gem' | 'DivinationCard' | string

export interface LootEntry {
  id: string
  hash: string
  name: string
  baseType: string
  itemClass: string
  rarity: ItemRarity
  stackSize: number
  itemLevel: number
  mapTier: number
  chaosValue: number
  divineValue: number | null
  starred: boolean
  capturedAt: number
  zoneKey: string | null
}

export interface MapRun {
  id: string
  zoneKey: string
  zoneAreaLevel: number
  enteredAt: number
  exitedAt: number | null
  entryIds: string[]
}

export interface SessionState {
  startedAt: number
  league: string
  poeVersion: 1 | 2
  entries: Record<string, LootEntry>
  maps: MapRun[]
  currentMapId: string | null
}

export interface Settings {
  minChaosValue: number
  autoResetOnLeagueChange: boolean
  showLogTimings: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  minChaosValue: 0,
  autoResetOnLeagueChange: true,
  showLogTimings: false,
}

export interface SavedSession {
  state: SessionState
  endedAt: number
  totalChaos: number
  itemCount: number
  mapCount: number
}
