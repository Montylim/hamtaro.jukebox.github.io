// Where the soundscape finds its files. These paths are served straight from the
// project folder by `npm run dev` (Vite serves any file under the project root).

export const VIDEO_URL = '/datasets/flat_global_ecco2_6840x3420_768p30-a2.mp4'

// Written by export_soundscape.py
export const DATA_HEADER_URL = '/output/soundscape.json'
export const DATA_BIN_URL = '/output/soundscape.bin'

export const TRACKS = {
  background: '/music/nasa-hackathon-audio-main.mp3',
  curlLow: '/music/low_curl.mp3',
  curlHigh: '/music/high_curl.mp3',
  divLow: '/music/low_divergence.mp3',
  divHigh: '/music/high_divergence.mp3',
  turbulence: '/music/high_magnitude.mp3',
}

export const GLIDE = 0.3   // seconds; how smoothly layers follow the data
export const RADIUS = 1    // average a (2R+1)x(2R+1) block of cells around the cursor
export const FLOOR = 0.15  // curl/flow never fully vanish – keeps the bed alive

export const CHANNELS = [
  { id: 'master', name: 'Master', level: 0.5,
    desc: 'Turns everything up or down at once.' },
  { id: 'background', name: 'Background', level: 0.8,
    desc: 'Our music track. It gets a little quieter over fast currents so you can hear the water.' },
  { id: 'curl', name: 'Curl', level: 0.2,
    desc: 'Gurgling for water that swirls. More swirling makes it louder, and quick swirls sound higher and bubblier.' },
  { id: 'flow', name: 'Divergence', level: 0.2,
    desc: 'Running water where the current spreads apart or squeezes together. The faster that happens, the brighter it sounds.' },
  { id: 'turb', name: 'Magnitude', level: 0.2,
    desc: 'Rushing water that follows the current speed. Slow water is a distant rumble, and fast water roars.' },
]

// Shown from the info icon next to the mixer heading
export const MIXER_HELP =
  'Every sound follows the ocean data under your cursor. Hover over the video to listen to one spot, ' +
  'or move off it to hear the whole ocean. The sliders set your own mix.'
