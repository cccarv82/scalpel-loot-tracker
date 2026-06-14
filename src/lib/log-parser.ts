// Client.txt line shapes Scalpel forwards via onLogLine.
// Examples:
//   2024/03/12 21:14:58 1234567890 abc [INFO Client 3220] : You have entered Crimson Township.
//   2024/03/12 21:25:11 1234567890 abc [INFO Client 3220] : Connecting to instance server at 1.2.3.4:6112
// We treat "You have entered X" as a zone-enter marker. Scalpel's
// onCurrentZone already gives the structured zone; the log only adds wall-clock
// timing for map runs.

const ENTERED_RE = /You have entered (.+?)\.$/
const CONNECTING_RE = /Connecting to instance server at /
const LOG_TS_RE = /^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})/

export interface ParsedLogEvent {
  kind: 'enter' | 'connecting'
  at: number
  zoneName?: string
}

export function parseLogLine(line: string): ParsedLogEvent | null {
  const ts = extractTimestamp(line)
  if (CONNECTING_RE.test(line)) {
    return { kind: 'connecting', at: ts ?? Date.now() }
  }
  const m = line.match(ENTERED_RE)
  if (m) {
    return { kind: 'enter', at: ts ?? Date.now(), zoneName: m[1].trim() }
  }
  return null
}

function extractTimestamp(line: string): number | null {
  const m = line.match(LOG_TS_RE)
  if (!m) return null
  const [, y, mo, d, h, mi, s] = m
  return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s)).getTime()
}
