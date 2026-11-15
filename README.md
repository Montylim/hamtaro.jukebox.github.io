# NASA Earth Information Jukebox

A NASA Space Apps Challenge project that turns the ECCO2 global ocean-current visualization into an interactive soundscape. Play the video and hear the whole ocean, or hover over any spot to hear the currents there.

Video source: [NASA SVS 3912 – ECCO2 ocean surface currents and temperature](https://svs.gsfc.nasa.gov/3912/#media_group_349716)

## How it works

```
ECCO2 video ──► main.ipynb ──► vectors/        optical-flow velocity (u, v) per frame
                                  │
                                  ▼
                vector_to_music.ipynb ──► output/{curl,div,mag}_grid.npz
                                  │       curl & divergence spectra (FFT over 2 s windows),
                                  │       mean current speed, on a 48 × 85 grid every 0.5 s
                                  ▼
                export_soundscape.py ──► output/soundscape.{bin,json}
                                  │       5 mix controls per cell, scaled 0–1
                                  ▼
                React site (src/) ──► Web Audio mix of the recordings in music/
```

| Sound layer | Driven by | What you hear |
|---|---|---|
| Background | Current speed | The team's background track (`nasa-hackathon-audio-main`), which dips when currents are fast |
| Curl (gurgle) | Curl spectrum | Amount of swirling sets the volume; fast swirling blends from `low_curl` to `high_curl` |
| Divergence (flow) | Divergence spectrum | Amount of spreading/converging sets the volume; fast changes blend from `low_divergence` to `high_divergence` |
| Magnitude (turbulence) | Current speed | Louder and brighter turbulence as currents speed up |

Hovering averages a 3 × 3 block of grid cells under the pointer. Off the video, the site plays the ocean-wide average for the current moment. The mixer panel under the video has a slider and level meter for each layer.

## Project layout

| Path | What it is |
|---|---|
| `src/App.jsx`, `src/App.css` | Page layout, accessibility controls, video |
| `src/soundscape/engine.js` | Web Audio engine: loads data and sounds, maps data to the mix |
| `src/soundscape/SoundscapeMixer.jsx` | Mixer panel |
| `src/soundscape/config.js` | File paths, default levels, smoothing settings |
| `main.ipynb` | Video → optical-flow vectors (`vectors/`), reference frame and legend images |
| `vector_to_music.ipynb` | Vectors → curl/divergence/magnitude grids (`output/*.npz`) |
| `export_soundscape.py` | Grids → compact data for the site (`output/soundscape.*`) |
| `music/` | Sound recordings used by the mixer |
| `public/image pack/` | NASA images used on the page |
| `datasets/`, `vectors/` | Source video and vectors (large, not in git) |
| `archive/` | Old or unused files, kept locally only (not in git) |

## Running the site

Needs [Node.js](https://nodejs.org/).

1. Put the ECCO2 video at `datasets/flat_global_ecco2_6840x3420_768p30-a2.mp4`. It is too large for git.
2. Install and start:
   ```bash
   npm install
   npm run dev
   ```
3. Open the address it prints, choose **Start with sound**, then hover over the video.

`npm run dev` serves the video, `music/` and `output/` straight from the project folder. A production build (`npm run build`) does not copy them, so a hosted version needs those files moved into `public/` or served elsewhere (paths are in `src/soundscape/config.js`).

## Rebuilding the data

Needs Python 3 with `numpy`, `scipy`, `opencv-python`, `matplotlib` and `jupyter`.

1. Run `main.ipynb` to extract velocity vectors from the video into `vectors/vectors/`.
2. Run `vector_to_music.ipynb` (the low-memory FFT cell, then the `np.savez` cell) to write `output/curl_grid.npz`, `div_grid.npz` and `mag_grid.npz`.
3. Convert the grids for the site:
   ```bash
   python export_soundscape.py
   ```

To change a sound, replace the file in `music/` or update the path in `src/soundscape/config.js`.

## Credits

- Ocean visualization: NASA Scientific Visualization Studio, ECCO2 / MITgcm
- Page images: NASA (individual credits are shown in the site footer)
- Background track: made by the team (`music/nasa-hackathon-audio-main.mp3`, a stereo mix of the original 5.1 WAV)
- Check the license of each sound in `music/` before publishing
