import { describe, expect, it } from 'vitest'
import { hashItem } from './item-hash'

const base = {
  name: 'Mageblood',
  baseType: 'Heavy Belt',
  itemClass: 'Belts',
  rarity: 'Unique',
  itemLevel: 84,
  quality: 0,
  stackSize: 1,
  sockets: '',
  corrupted: false,
  identified: true,
  explicits: ['+2 to Level of Socketed Gems'],
  implicits: [],
  enchants: [],
  imbues: [],
}

describe('hashItem', () => {
  it('same input -> same hash', () => {
    expect(hashItem(base)).toBe(hashItem({ ...base }))
  })
  it('different mods -> different hash', () => {
    expect(hashItem(base)).not.toBe(hashItem({ ...base, explicits: ['something else'] }))
  })
  it('corruption flips hash', () => {
    expect(hashItem(base)).not.toBe(hashItem({ ...base, corrupted: true }))
  })
  it('stack size flips hash', () => {
    expect(hashItem(base)).not.toBe(hashItem({ ...base, stackSize: 5 }))
  })
})
