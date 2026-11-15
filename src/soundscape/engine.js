// Ocean soundscape: mixes looping recordings from the curl / divergence / magnitude data.
// Framework-free; the React side creates one engine, feeds it the cursor, and reads updates.
import { CHANNELS, DATA_BIN_URL, DATA_HEADER_URL, FLOOR, GLIDE, RADIUS, TRACKS } from './config.js'

// Gain that brings a recording to a common loudness, so the sliders start balanced
function loudnessTrim(buffer, target = 0.12) {
  let sum = 0
  let n = 0
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const d = buffer.getChannelData(c)
    for (let i = 0; i < d.length; i += 16) { sum += d[i] * d[i]; n++ }
  }
  const rms = Math.sqrt(sum / n) || target
  return Math.max(0.25, Math.min(4, target / rms))
}

export class SoundscapeEngine {
  constructor() {
    this.levels = Object.fromEntries(CHANNELS.map((c) => [c.id, c.level]))
    this.state = { curlLevel: 0, curlTone: 0, divLevel: 0, divTone: 0, mag: 0 }
    this.header = null
    this.grid = null
    this.ctx = null
    this.nodes = null
    this.video = null
    this.cursor = null
    this.lastKey = ''
    this.listeners = new Set()
    this.info = { where: '', step: 0, values: this.state, mix: {} }
    this.raf = 0
    this.dataPromise = null
  }

  // ---------------------------------------------------------------- data
  // uint8 grid [T][Y][X][5] = curl_level, curl_tone, div_level, div_tone, magnitude
  loadData() {
    this.dataPromise ??= Promise.all([
      fetch(DATA_HEADER_URL).then((r) => { if (!r.ok) throw new Error(`${DATA_HEADER_URL}: ${r.status}`); return r.json() }),
      fetch(DATA_BIN_URL).then((r) => { if (!r.ok) throw new Error(`${DATA_BIN_URL}: ${r.status}`); return r.arrayBuffer() }),
    ]).then(([header, buf]) => {
      const [T, Y, X, F] = header.shape
      const grid = new Uint8Array(buf)
      if (grid.length !== T * Y * X * F) throw new Error(`soundscape.bin size mismatch: ${grid.length} vs ${T * Y * X * F}`)
      this.header = header
      this.grid = grid
    })
    return this.dataPromise
  }

  // Each FFT window covers [t*hop, t*hop + window]; use the window centred on now.
  frameIndex(time) {
    const T = this.header.shape[0]
    const t = Math.floor((time - this.header.window_seconds / 2) / this.header.hop_seconds)
    return Math.max(0, Math.min(T - 1, t))
  }

  sample(t, cx, cy) {
    const [, Y, X, F] = this.header.shape
    const out = new Array(F).fill(0)
    let n = 0
    for (let y = Math.max(0, cy - RADIUS); y <= Math.min(Y - 1, cy + RADIUS); y++) {
      for (let x = Math.max(0, cx - RADIUS); x <= Math.min(X - 1, cx + RADIUS); x++) {
        const base = ((t * Y + y) * X + x) * F
        for (let f = 0; f < F; f++) out[f] += this.grid[base + f]
        n++
      }
    }
    return out.map((v) => v / n / 255)
  }

  // ---------------------------------------------------------------- inputs
  attachVideo(video) { this.video = video }

  // x, y in 0..1 over the visible picture, or null when the pointer is off the map
  setCursor(pos) { this.cursor = pos }

  setLevel(id, value) {
    this.levels[id] = value
    this.applyMix()
  }

  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  // ---------------------------------------------------------------- audio
  get running() { return this.ctx?.state === 'running' }

  async start() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') await this.ctx.resume()
      return this.ready
    }
    // Create the context synchronously, inside the click that started it
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    this.ctx = ctx
    this.ready = this.build(ctx).catch((err) => { this.dispose(); throw err })
    return this.ready
  }

  async build(ctx) {
    await this.loadData()
    const gain = (v = 0) => { const g = ctx.createGain(); g.gain.value = v; return g }

    const names = Object.keys(TRACKS)
    const buffers = await Promise.all(names.map(async (k) => {
      const res = await fetch(TRACKS[k])
      if (!res.ok) throw new Error(`${TRACKS[k]}: ${res.status}`)
      return ctx.decodeAudioData(await res.arrayBuffer())
    }))
    const bufs = Object.fromEntries(names.map((k, i) => [k, buffers[i]]))

    // Looping track -> loudness trim -> output gain -> dest
    const track = (buffer, dest) => {
      const src = ctx.createBufferSource()
      src.buffer = buffer
      src.loop = true
      src.start(0, Math.random() * buffer.duration) // random offsets so loops don't line up
      const out = gain(0)
      src.connect(gain(loudnessTrim(buffer))).connect(out).connect(dest)
      return { src, out }
    }

    const n = {}
    n.master = gain(this.levels.master)
    n.master.connect(ctx.createDynamicsCompressor()).connect(ctx.destination) // stops stacked layers clipping

    n.bg = track(bufs.background, n.master)

    n.curlBus = gain(0)
    n.curlBus.connect(n.master)
    n.curlLow = track(bufs.curlLow, n.curlBus)
    n.curlHigh = track(bufs.curlHigh, n.curlBus)

    n.flowBus = gain(0)
    n.flowBus.connect(n.master)
    n.divLow = track(bufs.divLow, n.flowBus)
    n.divHigh = track(bufs.divHigh, n.flowBus)

    // Turbulence through a low-pass: slow water = distant rumble, fast = full roar
    n.turbFilter = ctx.createBiquadFilter()
    n.turbFilter.type = 'lowpass'
    n.turbFilter.frequency.value = 400
    n.turbFilter.connect(n.master)
    n.turb = track(bufs.turbulence, n.turbFilter)

    if (this.ctx !== ctx) return // disposed while loading
    this.nodes = n
    this.lastKey = ''
    const tick = () => { this.raf = requestAnimationFrame(tick); this.update() }
    tick()
  }

  async pause() { if (this.ctx?.state === 'running') await this.ctx.suspend() }

  // Stop all audio. The engine can be started again afterwards.
  dispose() {
    cancelAnimationFrame(this.raf)
    if (this.ctx && this.ctx.state !== 'closed') this.ctx.close()
    this.ctx = null
    this.nodes = null
    this.ready = null
  }

  // Cursor / video time -> data -> mix. Runs every animation frame, acts only on change.
  update() {
    if (!this.grid || !this.nodes) return
    const [, Y, X] = this.header.shape
    const t = this.frameIndex(this.video?.currentTime ?? 0)
    let key
    let values
    let where
    if (this.cursor) {
      const gx = Math.min(Math.floor(this.cursor.x * X), X - 1)
      const gy = Math.min(Math.floor(this.cursor.y * Y), Y - 1)
      key = `${t},${gx},${gy}`
      if (key !== this.lastKey) { values = this.sample(t, gx, gy); where = `Cell ${gx}, ${gy}` }
    } else {
      key = `ocean,${t}`
      if (key !== this.lastKey) { values = this.header.ocean_mean[t]; where = 'Whole ocean' }
    }
    if (key === this.lastKey) return
    this.lastKey = key
    const [curlLevel, curlTone, divLevel, divTone, mag] = values
    this.state = { curlLevel, curlTone, divLevel, divTone, mag }
    this.info = { ...this.info, where, step: t }
    this.applyMix()
  }

  // Push data state + slider levels into the graph, then tell listeners
  applyMix() {
    const n = this.nodes
    if (!n) return
    const now = this.ctx.currentTime
    const set = (param, v) => param.setTargetAtTime(v, now, GLIDE)
    const xfade = (lo, hi, x) => { set(lo.out.gain, Math.cos(x * Math.PI / 2)); set(hi.out.gain, Math.sin(x * Math.PI / 2)) }
    const L = this.levels
    const { curlLevel, curlTone, divLevel, divTone, mag } = this.state

    set(n.master.gain, L.master)

    const background = L.background * (1 - 0.4 * mag)
    set(n.bg.out.gain, background)

    const curl = L.curl * (FLOOR + (1 - FLOOR) * curlLevel)
    set(n.curlBus.gain, curl)
    xfade(n.curlLow, n.curlHigh, curlTone)
    const rate = 0.9 + 0.25 * curlTone // faster swirls bubble faster
    set(n.curlLow.src.playbackRate, rate)
    set(n.curlHigh.src.playbackRate, rate)

    const flow = L.flow * (FLOOR + (1 - FLOOR) * divLevel)
    set(n.flowBus.gain, flow)
    xfade(n.divLow, n.divHigh, divTone)

    const turb = L.turb * Math.pow(mag, 1.5)
    set(n.turb.out.gain, turb)
    set(n.turbFilter.frequency, 300 + 9000 * mag * mag)

    this.info = { ...this.info, values: this.state, mix: { master: L.master, background, curl, flow, turb } }
    this.listeners.forEach((fn) => fn(this.info))
  }
}
