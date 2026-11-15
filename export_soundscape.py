"""Turn the curl / divergence FFT grids and magnitude grid into mix controls.

Reads   output/curl_grid.npz, output/div_grid.npz  -> (T, Y, X, F) temporal spectra
        output/mag_grid.npz                         -> (T, Y, X)    mean speed
Writes  output/soundscape.bin   uint8, shape (T, Y, X, 5), values 0..255 -> 0..1
        output/soundscape.json  header (shape, hop, feature names, per-frame ocean averages)

Features per cell (all scaled 0..1 against the whole dataset):
  curl_level  how much rotational activity there is   -> volume of the gurgle layer
  curl_tone   share of fast (high-frequency) swirling -> low_curl vs high_curl crossfade
  div_level   how much spreading/converging there is  -> volume of the flow layer
  div_tone    share of fast spreading/converging      -> low_divergence vs high_divergence crossfade
  magnitude   current speed                           -> volume/brightness of turbulence

Run:  python export_soundscape.py
"""
import json
import numpy as np
import scipy.fft

FPS = 30.0
WIN_T = 60            # must match the notebook's FFT window
HOP_T = 15            # must match the notebook's hop
SPLIT_HZ = 3.0        # oscillations above this count as "fast" (high tone)
FEATURES = ["curl_level", "curl_tone", "div_level", "div_tone", "magnitude"]


def scale(x, lo_pct=2, hi_pct=98):
    """Map the lo..hi percentile of x onto 0..1 (clipped)."""
    lo, hi = np.percentile(x, [lo_pct, hi_pct])
    return np.clip((x - lo) / max(hi - lo, 1e-12), 0, 1)


def spectrum_features(spec, freqs):
    ac = spec[..., 1:]                      # drop 0 Hz: the constant part isn't motion
    f = freqs[1:]
    energy = ac.sum(-1)
    high = ac[..., f >= SPLIT_HZ].sum(-1)
    level = scale(np.log1p(energy))         # log: energy spans orders of magnitude
    tone = scale(high / np.maximum(energy, 1e-12), 5, 95)
    return level, tone


def main():
    curl = np.load("output/curl_grid.npz")["arr_0"]
    div = np.load("output/div_grid.npz")["arr_0"]
    mag = np.load("output/mag_grid.npz")["arr_0"]
    freqs = scipy.fft.rfftfreq(WIN_T, d=1 / FPS)
    assert curl.shape[-1] == len(freqs), f"expected {len(freqs)} bins, got {curl.shape[-1]}"

    curl_level, curl_tone = spectrum_features(curl, freqs)
    div_level, div_tone = spectrum_features(div, freqs)
    magnitude = np.sqrt(scale(mag, 2, 99))  # sqrt: lift the many slow cells a little

    feats = np.stack([curl_level, curl_tone, div_level, div_tone, magnitude], axis=-1)
    q = np.round(feats * 255).astype(np.uint8)
    q.tofile("output/soundscape.bin")

    T, Y, X, _ = q.shape
    header = {
        "shape": [T, Y, X, len(FEATURES)],
        "features": FEATURES,
        "hop_seconds": HOP_T / FPS,
        "window_seconds": WIN_T / FPS,
        # Whole-ocean average per time step, used when the cursor is off the map
        "ocean_mean": np.round(feats.mean(axis=(1, 2)), 3).tolist(),
    }
    with open("output/soundscape.json", "w") as f:
        json.dump(header, f)

    print(f"wrote output/soundscape.bin {q.shape} ({q.nbytes / 1e6:.1f} MB)")
    for i, name in enumerate(FEATURES):
        per_t = feats[..., i].mean(axis=(1, 2))
        print(f"  {name:11s} mean {feats[..., i].mean():.2f}  per-step mean min/max {per_t.min():.2f}/{per_t.max():.2f}")


if __name__ == "__main__":
    main()
