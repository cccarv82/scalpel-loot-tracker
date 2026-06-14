import { describe, expect, it } from 'vitest'
import { parseLogLine } from './log-parser'

describe('parseLogLine', () => {
  it('extracts zone enter', () => {
    const line = '2024/03/12 21:14:58 1234 abc [INFO Client 3220] : You have entered Crimson Township.'
    const ev = parseLogLine(line)
    expect(ev?.kind).toBe('enter')
    expect(ev?.zoneName).toBe('Crimson Township')
  })
  it('extracts connecting', () => {
    const line = '2024/03/12 21:25:11 1234 abc [INFO Client 3220] : Connecting to instance server at 1.2.3.4:6112'
    expect(parseLogLine(line)?.kind).toBe('connecting')
  })
  it('returns null for chat', () => {
    expect(parseLogLine('2024/03/12 21:14:58 1234 abc [INFO Client 3220] #Player: hi')).toBeNull()
  })
})
