import { useEffect, useState } from 'react'
import { CHANNELS, MIXER_HELP } from './config.js'

const pct = (v) => `${Math.round((v ?? 0) * 100)}%`

// What each strip shows under its meter
function detail(id, info, levels) {
  const v = info.values ?? {}
  switch (id) {
    case 'master': return pct(levels.master)
    case 'background': return pct(info.mix?.background)
    case 'curl': return `Amount ${pct(v.curlLevel)} · high ${pct(v.curlTone)}`
    case 'flow': return `Amount ${pct(v.divLevel)} · high ${pct(v.divTone)}`
    case 'turb': return `Speed ${pct(v.mag)}`
    default: return ''
  }
}

// Small "i" button; its text appears on hover, keyboard focus or tap
function InfoTip({ id, label, text }) {
  return (
    <span className="info-tip">
      <button type="button" className="info-tip-button" aria-label={`About ${label}`} aria-describedby={id}>
        i
      </button>
      <span role="tooltip" id={id} className="info-tip-text">{text}</span>
    </span>
  )
}

// Mixer panel: one slider and live level meter per layer
export default function SoundscapeMixer({ engine, active, status }) {
  const [levels, setLevels] = useState(() => Object.fromEntries(CHANNELS.map((c) => [c.id, c.level])))
  const [info, setInfo] = useState({ where: '', step: 0, values: {}, mix: {} })

  useEffect(() => engine?.subscribe(setInfo), [engine])

  const change = (id, value) => {
    setLevels((prev) => ({ ...prev, [id]: value }))
    engine?.setLevel(id, value)
  }

  let readout = 'Sound is off.'
  if (active && info.where) readout = `${info.where} · step ${info.step} · speed ${pct(info.values.mag)}`
  else if (status && !status.endsWith('is off.')) readout = status

  return (
    <section className="soundscape-mixer content-panel" aria-labelledby="soundscape-mixer-title">
      <div className="soundscape-mixer-heading">
        <div>
          <p className="wide-panel-kicker">Soundscape mixer</p>
          <div className="soundscape-title-row">
            <h2 id="soundscape-mixer-title">Listen to the currents</h2>
            <InfoTip id="mix-help" label="the soundscape mixer" text={MIXER_HELP} />
          </div>
        </div>
        <p className="soundscape-readout">{readout}</p>
      </div>

      <div className="soundscape-strips">
        {CHANNELS.map((ch) => {
          const level = ch.id === 'master' ? levels.master : info.mix?.[ch.id] ?? 0
          return (
            <div className="soundscape-strip" key={ch.id}>
              <div className="soundscape-strip-label">
                <label htmlFor={`mix-${ch.id}`}>{ch.name}</label>
                <InfoTip id={`mix-${ch.id}-help`} label={ch.name} text={ch.desc} />
              </div>
              <input
                id={`mix-${ch.id}`}
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={levels[ch.id]}
                aria-valuetext={pct(levels[ch.id])}
                onChange={(e) => change(ch.id, parseFloat(e.target.value))}
              />
              <div className="soundscape-meter" aria-hidden="true">
                <div style={{ width: `${Math.min(100, (active ? level : 0) * 100)}%` }} />
              </div>
              <span className="soundscape-value">{active ? detail(ch.id, info, levels) : '–'}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
