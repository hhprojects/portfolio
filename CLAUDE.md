# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite, localhost:5173)
npm run build      # Production build to dist/
npm run lint       # ESLint
npm run preview    # Preview production build locally
npm run deploy     # Build + deploy to GitHub Pages (gh-pages branch)
```

No test suite exists — use `npm run build` to verify there are no compile errors.

## Architecture

React + Vite SPA deployed to GitHub Pages at `https://hhprojects.github.io/portfolio`. The `base` in `vite.config.js` is set to `/portfolio/`.

### Page structure

`src/App.jsx` is the root. It renders a single-page layout with sections stacked vertically:

```
LoadingScreen → Navbar → Hero → About → Skills → Blog → Projects → Contact → Footer
```

`GameMode` is overlaid on top when activated from the Hero section. App preserves scroll position (`scrollPosRef`) so it restores correctly on exit.

### Game mode (`src/components/game/`)

A 2.5D canvas-based RPG overlay triggered by a "Play" button in Hero:

- **`GameMode.jsx`** — top-level component; manages transition states (`entering`/`playing`/`exiting`), keyboard input, camera lerp, interact zone detection, and popup dispatch
- **`useGameLoop.js`** — fixed-timestep game loop using `requestAnimationFrame`
- **`physics.js`** — WASD/arrow key movement, axis-split AABB collision against room walls
- **`renderer.js`** — canvas 2D draw calls with Y-sorting and camera offset
- **`sprites.js`** — pixel art player sprite drawing
- **`rooms.js`** — defines 4 rooms (Living Room, Workshop, Gallery, Contact); each room has `walls`, `objects`, and `interactZones`; rooms are laid out horizontally at 800px intervals in a 3200x600 world
- **`GameOverlay.jsx`** — React UI overlay for interact prompts (`[W] label`) and popup cards (triggered by interact zones, dispatched via `action` string)

Interact zones use the `action` string (e.g. `'about'`, `'skills'`, `'project1'`) to determine what popup content to show.

### Blog system

Posts live in `src/posts/*.md` with YAML frontmatter (`title`, `date`, `tags`, `summary`). The `usePosts` hook (`src/hooks/usePosts.js`) uses Vite's `import.meta.glob` for eager static imports, parses frontmatter with `gray-matter`, and renders markdown with `marked`. No backend required.

Post filename convention: `YYYY-MM-DD-slug.md`

### Styling

Each component has a co-located `.css` file. Global styles in `src/index.css` and `src/App.css`. No CSS framework — plain CSS with custom properties.
