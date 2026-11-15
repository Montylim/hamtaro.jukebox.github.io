import { useState, useEffect, useRef } from 'react'
import ecco2Video from './assets/video assets/flat_global_ecco2_6840x3420_768p30-a2.mp4'
import ecco2ColorBar from './assets/video assets/sst_ecco2_cbar.png'
import waterSound from './assets/video assets/nasa-hackathon-audio-main.wav'
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
  const audioRef = useRef(null)
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

  const playWaterSound = () => {
    const audio = audioRef.current
    const video = videoRef.current
    if (!audio || !video) {
      setSoundStatus('The water sound is unavailable. Please try reloading the page.')
      return
    }

    audio.currentTime = video.currentTime
    const playback = audio.play()
    if (playback) {
      playback.then(() => {
        setSoundEnabled(true)
        setSoundStatus('Water sound is on.')
      }).catch(() => {
        setSoundEnabled(false)
        setSoundStatus('Water sound could not start. Check your device volume and try again.')
      })
    } else {
      setSoundEnabled(true)
      setSoundStatus('Water sound is on.')
    }
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
      const audio = audioRef.current
      if (audio) audio.pause()
      setSoundEnabled(false)
      setSoundStatus('Water sound is off.')
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
          Choose "Start with sound" to play the instrumental track alongside the video, or click anywhere on the video to have a targetted experience. 
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
                onPause={() => {
                  if (audioRef.current) audioRef.current.pause()
                }}
                onPlay={() => {
                  if (soundEnabled) playWaterSound()
                }}
                onEnded={() => {
                  if (audioRef.current) audioRef.current.pause()
                }}
              >
                <source src={ecco2Video} type="video/mp4" />
                Your browser does not support MP4 video.
              </video>
            </div>
            <audio
              ref={audioRef}
              className="water-audio"
              src={waterSound}
              preload="none"
              loop
              aria-hidden="true"
            />
            {/* download in case the video doesn't play*/}
            <p className="video-download-help">
              Having trouble playing the video in your browser?{' '}
              <a href={ecco2Video} download>Download the MP4</a>.
            </p>

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

            {/* music mixing explanation */}
            <section className="sound-explainer" aria-labelledby="sound-explainer-title">
              <div>
                <p className="wide-panel-kicker">What's this melody?</p>
                <h2 id="sound-explainer-title">The feelings behind the sound</h2>
              </div>
              <p>
                The track blends flowing-water sounds with melodic harp instruments
                to portray the ocean’s currents and changing temperatures through music.
              </p>
            </section>
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

        {/* ocean explainer - explains why currents form*/}
        <div className="ocean-info-panels">
          <section className="ocean-explainer" aria-labelledby="ocean-explainer-title">
            <div className="ocean-explainer-heading">
              <p className="wide-panel-kicker">Let's break it down</p>
              <h2 id="ocean-explainer-title">How do ocean currents form, and what's heating them up?</h2>
            </div>
            <div className="explanation-grid">
              <article className="explanation-card"> {/* currents explaainer */}
                <h3>Something in the... water</h3>
                <p>
                  The currents are mainly formed from wind pushing against the surface water, while Earth’s rotation bends its path.
                  Differences in temperature and saltiness also help move water below the surface.
                </p>
              </article>
              <article className="explanation-card"> {/* temperature explainer */}
                <h3>Because you're hot and you're cold...</h3>
                <p>
                  Sunlight warms the ocean unevenly. Currents carry heat to new places,
                  while seasons and location affect how warm the water gets.
                </p>
              </article>
            </div>
          </section>
        </div>

        {/* other resources - points to other pages from NASA*/}
        <section className="other-resources" aria-labelledby="other-resources-title">
          <div className="other-resources-header">
            <h2 id="other-resources-title">Other resources</h2>
            {/*item #1 - link to NASA EIC*/}
            <a
              className="resources-arrow"
              href="https://science.nasa.gov/earth/earth-information-center/"
              target="_blank"
              rel="noreferrer"
              aria-label="Open NASA Earth Information Center dashboard in a new tab"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h15m-6-6 6 6-6 6" />
              </svg>
            </a>
          </div>
          {/* item #2 - link to NASA worldview */}
          <div className="resource-grid">
            <a className="resource-card" href="https://worldview.earthdata.nasa.gov/" target="_blank" rel="noreferrer">
              <img
                src="/image%20pack/alaska-kachemakbay-oli-20240920-lrg-michala.webp"
                alt="Satellite image of Alaska’s Kachemak Bay, glaciers, and surrounding land"
              />
              <div className="resource-card-copy">
                <h3>NASA Worldview</h3>
                <p>Explore global satellite imagery and view recent changes across Earth.</p>
              </div>
            </a>
            {/* item #3 - link to NASA earth observatory */}
            <a className="resource-card" href="https://earthobservatory.nasa.gov/" target="_blank" rel="noreferrer">
              <img
                src="/image%20pack/iss063e107777-lrg-nasa.webp"
                alt="Satellite view of a river winding past forests and developed areas"
              />
              <div className="resource-card-copy">
                <h3>Earth Observatory</h3>
                <p>Discover NASA images and stories about our planet’s changing systems.</p>
              </div>
            </a>
            {/* item #4 - link to NASA eyes on earth */}
            <a className="resource-card" href="https://eyes.nasa.gov/apps/earth/" target="_blank" rel="noreferrer">
              <img
                src="/image%20pack/iss070e000820orig-nasa.webp"
                alt="Earth’s blue atmosphere and the Moon as seen from orbit"
              />
              <div className="resource-card-copy">
                <h3>Eyes on Earth</h3>
                <p>Explore Earth observations and the missions that gather them.</p>
              </div>
            </a>
            {/* item #5 - link to NASA climate change */}
            <a className="resource-card" href="https://science.nasa.gov/climate-change/" target="_blank" rel="noreferrer">
              <img
                src="/image%20pack/space-view-nyc-55534901810-95d2f06788-o-jessica.webp"
                alt="Nighttime city lights along Earth’s horizon from the International Space Station"
              />
              <div className="resource-card-copy">
                <h3>Climate Change</h3>
                <p>Learn how NASA studies a changing climate and its effects.</p>
              </div>
            </a>
          </div>
        </section>

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
          <p className="image-credit">
            Resource thumbnail images:{' '}
            <a href="https://images.nasa.gov/" target="_blank" rel="noreferrer">NASA</a>
          </p>
        </footer>
      </main>

    </div>
  )
}

export default App