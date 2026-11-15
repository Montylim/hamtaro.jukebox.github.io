# hamtaro.jukebox.io
NASA Space Challenge

# Video Data Reference
https://svs.gsfc.nasa.gov/3912/#media_group_349716

# Prerequisites
Install the following:
- numpy
- fastapi
- scipy
- opencv-python
- matplotlib

# To run, launch the fastapi server that serves the sound file
`fastapi dev api.py`

Then open `index-old.html`. Click on the video to hear the soundscape.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

1. install NPM in your computer
2. install node.js in your computer

run these commands first in vs code:
npm install
npm run dev