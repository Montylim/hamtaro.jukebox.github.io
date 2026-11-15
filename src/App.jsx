import { useState, useEffect, useRef } from 'react'
import ecco2ColorBar from './assets/video assets/sst_ecco2_cbar.png'
import { VIDEO_URL as ecco2Video } from './soundscape/config.js'
import { SoundscapeEngine } from './soundscape/engine.js'
import SoundscapeMixer from './soundscape/SoundscapeMixer.jsx'
import './App.css'

// main application page
function App(){

  // accessibility preferences for blind/low-visionn users
  const [theme, setTheme] = useState('dark')
  const [textSize, setTextSize] = useState('normal')
  const [welcomeOpen, setWelcomeOpen] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [soundStatus, setSoundStatus] = useState('')
  const welcomeDialogRef = useRef(null)
  const videoRef = useRef(null)
  const [engine] = useState(() => new SoundscapeEngine())
  const headerImageSource = theme === 'light'
    ? {
        label: 'NASA/Jessica Meir, ISS075-E-0102764',
        href: 'https://www.flickr.com/photos/nasa2explore/55534901810/',
      }
    : {
        label: 'NASA/JSC, ISS070-E-000820',
        href: 'https://images.nasa.gov/details/iss070e000820',
      }
  const mainImageSource = theme === 'light'
    ? {
        label: 'NASA/JPL-Caltech, PIA26728',
        href: 'https://science.nasa.gov/photojournal/',
      }
    : {
        label: 'NASA/JSC, S84-27018',
        href: 'https://images.nasa.gov/details/S84-27018',
      }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-text-size', textSize)
  }, [theme, textSize])

  useEffect(() => {
    const dialog = welcomeDialogRef.current
    if (!dialog) return

    if (welcomeOpen && !dialog.open) dialog.showModal()
    if (!welcomeOpen && dialog.open) dialog.close()
  }, [welcomeOpen])

  // soundscape follows the video's time; load its data early, stop audio on unmount
  useEffect(() => {
    engine.attachVideo(videoRef.current)
    engine.loadData().catch((err) => {
      setSoundStatus(`Soundscape data could not load (${err.message}). Run export_soundscape.py and reload.`)
    })
    return () => engine.dispose()
  }, [engine])

  const playWaterSound = () => {
    engine.start().then(() => {
      setSoundEnabled(true)
      setSoundStatus('Ocean soundscape is on.')
    }).catch((err) => {
      setSoundEnabled(false)
      setSoundStatus(`The soundscape could not start (${err.message}). Check your device volume and try again.`)
    })
  }

  // map the pointer onto the visible picture (the video is letterboxed by object-fit: contain)
  const listenAt = (event) => {
    const video = event.currentTarget
    const rect = video.getBoundingClientRect()
    const vw = video.videoWidth || 2
    const vh = video.videoHeight || 1
    const scale = Math.min(rect.width / vw, rect.height / vh)
    const width = vw * scale
    const height = vh * scale
    const x = (event.clientX - rect.left - (rect.width - width) / 2) / width
    const y = (event.clientY - rect.top - (rect.height - height) / 2) / height
    engine.setCursor(x >= 0 && x <= 1 && y >= 0 && y <= 1 ? { x, y } : null)
  }

  const startExperience = () => {
    setWelcomeOpen(false)
    const video = videoRef.current
    if (video) {
      const playback = video.play()
      if (playback) {
        playback.catch(() => setSoundStatus('Video could not start. Press Play on the video to begin.'))
      }
    }
    playWaterSound()
  }

  const toggleWaterSound = () => {
    if (soundEnabled) {
      engine.pause()
      setSoundEnabled(false)
      setSoundStatus('Ocean soundscape is off.')
      return
    }

    playWaterSound()
  }

  return (
    <div className="website">

      {/* welcome dialog */}
      <dialog
        ref={welcomeDialogRef}
        className="audio-welcome"
        aria-labelledby="audio-welcome-title"
        aria-describedby="audio-welcome-description"
        onCancel={() => setWelcomeOpen(false)}
      >
        <p className="audio-welcome-kicker">Interactive Ocean Experience</p>
        <h2 id="audio-welcome-title">Feel the power of the currents, right at home</h2>
        <p id="audio-welcome-description" style={{marginTop: '1rem'}}>
          Choose "Start with sound" to hear the whole ocean as the video plays, then hover over any spot on the video to listen to the currents there.
        </p>
        <p id="audio-welcome-description" style={{marginTop: '1rem'}}>
          Enjoy your exploration of the ocean currents and temperatures!
        </p>

        {/* welcome dialog buttons */}
        <div className="audio-welcome-actions">
          <button type="button" className="audio-welcome-primary" autoFocus onClick={startExperience}>
            Start with sound
          </button>
          <button type="button" className="audio-welcome-secondary" onClick={() => setWelcomeOpen(false)}>
            Continue muted
          </button>
        </div>
      </dialog>

      <header className="top-header">
        
        {/* Jukebox header */}
        <div className="brand-section">
          <img src="/image%20pack/nasa-logo.png" alt="NASA Logo" className="website-logo" />
            <div className="brand-text">
              <h1>NASA Earth Information Jukebox</h1> {/* title */}
              <p>Explore the forces and intensity of nature through music</p> {/* subtitle */}
            </div> 
        </div>
      </header>

      <main className="main-content">
        <div className="main-intro">
          <div className="main-utilities">

            {/* accessibility controls*/}
            <div className="display-controls">
              <label className="theme-toggle">
              <input
                type="checkbox"
                role="switch"
                aria-label="Dark mode"
                checked={theme === 'dark'}
                onChange={(event) => setTheme(event.target.checked ? 'dark' : 'light')}
              />
                <span aria-hidden="true">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
              </label>
              <div className="text-size-controls" role="group" aria-label="Text size">
                <button
                  type="button"
                  className="text-size-small"
                  aria-label="Small text"
                  aria-pressed={textSize === 'small'}
                  onClick={() => setTextSize('small')}
                >
                  A
                </button>
                <button
                  type="button"
                  className="text-size-normal"
                  aria-label="Normal text"
                  aria-pressed={textSize === 'normal'}
                  onClick={() => setTextSize('normal')}
                >
                  A
                </button>
                <button
                  type="button"
                  className="text-size-large"
                  aria-label="Large text"
                  aria-pressed={textSize === 'large'}
                  onClick={() => setTextSize('large')}
                >
                  A
                </button>
              </div>
              <button
                type="button"
                className={`audio-icon-toggle ${soundEnabled ? 'is-on' : 'is-off'}`}
                aria-label={soundEnabled ? 'Turn water sound off' : 'Turn water sound on'}
                aria-pressed={soundEnabled}
                onClick={toggleWaterSound}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 10v4h4l5 4V6l-5 4H4Z" />
                  {soundEnabled ? (
                    <>
                      <path d="M16 9a5 5 0 0 1 0 6" />
                      <path d="M18.5 6.5a9 9 0 0 1 0 11" />
                    </>
                  ) : (
                    <path d="m17 9 5 6m0-6-5 6" />
                  )}
                </svg>
              </button>
              <span className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
                {soundStatus}
              </span>
            </div>
          </div>

          {/* title and subtitle */}
          <div className="title-block">
            <p className="title-eyebrow">NASA Ocean Visualization</p>
            <h2 id="video-title" className="main-title">Global Ocean Surface Currents and Temperature</h2>
          </div>
        </div>
        
        {/* video of ocean currents */}
        <div className="video-layout">
          <section className="video-section" aria-labelledby="video-title">
            <div className="video-player">
              <video
                ref={videoRef}
                autoPlay
                controls
                muted
                playsInline
                loop
                preload="none"
                onClick={() => {
                  if (!soundEnabled && videoRef.current && !videoRef.current.paused) {
                    playWaterSound()
                  }
                }}
                onPointerMove={listenAt}
                onPointerLeave={() => engine.setCursor(null)}
                onPause={() => engine.pause()}
                onPlay={() => {
                  if (soundEnabled) playWaterSound()
                }}
                onEnded={() => engine.pause()}
              >
                <source src={ecco2Video} type="video/mp4" />
                Your browser does not support MP4 video.
              </video>
            </div>
            {/* download in case the video doesn't play*/}
            <p className="video-download-help">
              Having trouble playing the video in your browser?{' '}
              <a href={ecco2Video} download>Download the MP4</a>.
            </p>

            {/* live soundscape controls */}
            <SoundscapeMixer engine={engine} active={soundEnabled} status={soundStatus} />

            {/* video legend */}
            <div className="video-caption content-panel">
              <figure className="temperature-legend">
                <img
                  src={ecco2ColorBar}
                  alt="Ocean surface temperature scale in degrees Celsius, from 0 to 32 degrees"
                />
                <figcaption>Ocean surface temperature color guide (°C)</figcaption>
                <ul className="temperature-key" aria-label="Temperature ranges by color">
                  <li className="temperature-key-item">
                    <span className="temperature-swatch temperature-blue" aria-hidden="true" />
                    <span><strong>0°C</strong><small>Blue</small></span>
                  </li>
                  <li className="temperature-key-item">
                    <span className="temperature-swatch temperature-green" aria-hidden="true" />
                    <span><strong>10-20°C</strong><small>Green</small></span>
                  </li>
                  <li className="temperature-key-item">
                    <span className="temperature-swatch temperature-yellow" aria-hidden="true" />
                    <span><strong>~25°C</strong><small>Yellow</small></span>
                  </li>
                  <li className="temperature-key-item">
                    <span className="temperature-swatch temperature-red" aria-hidden="true" />
                    <span><strong>32°C</strong><small>Red</small></span>
                  </li>
                </ul>
              </figure>
            </div>
          </section>
          
          {/* video description - contains infornation about model used and video details */}
          <aside className="video-description content-panel" aria-labelledby="description-title">
            <p className="description-kicker">Global ocean model</p>
            <h2 id="description-title" style={{ fontStyle: 'italic' }}>Just the waves passing by...</h2>
            <p className="description-summary">
              Moving lines show surface currents, colored by ocean-surface temperature.
            </p>

            <dl className="description-facts">
              <div className="description-fact">
                <dt>Flow layer</dt>
                <dd style={{ fontSize: '0.85em' }}>Surface currents</dd>
              </div>
              <div className="description-fact">
                <dt>Color data</dt>
                <dd>Ocean-surface temperature</dd>
              </div>
              <div className="description-fact">
                <dt>Model</dt>
                <dd style={{ fontSize: '0.85em' }}>ECCO2 / MITgcm</dd>
              </div>
              <div className="description-fact">
                <dt>Scale</dt>
                <dd>Global view</dd>
              </div>
            </dl>
            
            {/* ECCO2 model description */}
            <section className="description-method" aria-labelledby="about-ecco2-title">
              <h3 id="about-ecco2-title" style={{ fontStyle: 'italic' }}>About ECCO2</h3>
              <p style={{ fontSize: '0.85em' }}>
                ECCO2 combines satellite and ocean measurements with a computer model
                to estimate conditions across the global ocean and sea ice. The model
                simulates water movement at all depths; this visualization focuses on
                surface currents and eddies that transport heat and carbon.
              </p>
            </section>
              
            {/* video metadata and source link */}
            <div className="description-attribution">
              <dl className="description-metadata">
                <div>
                  <dt>Location</dt>
                  <dd>Global ocean</dd>
                </div>
                <div>
                  <dt>Data period</dt>
                  <dd>
                    <time dateTime="2007-03-25T12:00:00Z">Mar 25, 2007, 12:00 UTC</time>
                    {' – '}
                    <time dateTime="2008-03-03T12:00:00Z">Mar 3, 2008, 12:00 UTC</time>
                  </dd>
                </div>
              </dl>
              <p className="description-source">
                <a href="https://svs.gsfc.nasa.gov/3912/" target="_blank" rel="noreferrer">Visualization details</a>
              </p>
            </div>
          </aside>
        </div>


        {/* image credits */}
        <footer className="image-credits" aria-label="Image credits">
          <p className="image-credit">
            Header image:{' '}
            <a href={headerImageSource.href} target="_blank" rel="noreferrer">
              {headerImageSource.label}
            </a>
          </p>
          <p className="image-credit">
            Main background:{' '}
            <a href={mainImageSource.href} target="_blank" rel="noreferrer">
              {mainImageSource.label}
            </a>
          </p>
        </footer>
      </main>

    </div>
  )
}

export default App