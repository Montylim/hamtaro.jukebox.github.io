import { cpSync, existsSync } from 'node:fs'
import process from 'node:process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Media the site loads at runtime. `npm run dev` serves these from the project
// folder; this plugin copies them into dist/ so the built site has them too.
const RUNTIME_FILES = [
  'media/ocean-currents.mp4',
  'music',
  'output/soundscape.json',
  'output/soundscape.bin',
]

function copyRuntimeFiles() {
  let outDir
  return {
    name: 'copy-runtime-files',
    apply: 'build',
    configResolved(config) { outDir = config.build.outDir },
    closeBundle() {
      for (const path of RUNTIME_FILES) {
        if (!existsSync(path)) throw new Error(`Missing ${path}: the built site needs it`)
        cpSync(path, `${outDir}/${path}`, { recursive: true })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from /<repo-name>/; the deploy workflow sets BASE_PATH
  base: process.env.BASE_PATH || '/',
  plugins: [react(), copyRuntimeFiles()],
})
