import { useStore } from '../store'

export function SettingsPanel() {
  const { settings, updateSettings } = useStore()
  return (
    <div
      style={{
        display: 'grid',
        gap: 8,
        padding: 12,
        background: 'var(--bg-card, rgba(255,255,255,0.04))',
        borderRadius: 6,
        marginTop: 12,
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          opacity: 0.6,
          color: 'var(--text-muted)',
        }}
      >
        Settings
      </div>
      <label style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
        <span>Minimum value (chaos/ex) to count</span>
        <input
          type="number"
          min={0}
          step={0.1}
          value={settings.minChaosValue}
          onChange={(e) => updateSettings({ minChaosValue: Math.max(0, Number(e.target.value) || 0) })}
          style={inputStyle}
        />
      </label>
      <label style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
        <span>Auto-reset on league change</span>
        <input
          type="checkbox"
          checked={settings.autoResetOnLeagueChange}
          onChange={(e) => updateSettings({ autoResetOnLeagueChange: e.target.checked })}
        />
      </label>
      <label style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
        <span>Use Client.txt timestamps (more precise)</span>
        <input
          type="checkbox"
          checked={settings.showLogTimings}
          onChange={(e) => updateSettings({ showLogTimings: e.target.checked })}
        />
      </label>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: 80,
  padding: '2px 6px',
  background: 'var(--bg, rgba(0,0,0,0.3))',
  color: 'var(--text, white)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 4,
}
