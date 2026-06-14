import { describe, expect, it } from 'vitest'
import { prettyAreaName } from './area-name'

describe('prettyAreaName', () => {
  it('handles Map prefix', () => {
    expect(prettyAreaName('MapOrnateChambers')).toBe('Ornate Chambers Map')
  })
  it('handles Hideout prefix', () => {
    expect(prettyAreaName('HideoutShoreline')).toBe('Shoreline Hideout')
  })
  it('keeps incursion as prefix', () => {
    expect(prettyAreaName('IncursionHubEndgame')).toBe('Incursion · Hub Endgame')
  })
  it('plain camelCase passes through', () => {
    expect(prettyAreaName('CrimsonTownship')).toBe('Crimson Township')
  })
  it('empty returns empty', () => {
    expect(prettyAreaName('')).toBe('')
  })
})
