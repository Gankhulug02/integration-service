# Camel on Quarkus — Integration Services Course

An interactive learning website (React SPA) that teaches integration service development
with **Quarkus, Java, and Apache Camel**. Nine modules, from a JS/TS-developer primer to
native-image deployment, with syntax-highlighted examples, exercises with collapsible
solutions, a visual learning path, and progress tracking.

## Run it

```bash
npm install
npm run dev        # dev server with hot reload → http://localhost:5173
```

## Build for production

```bash
npm run build      # static output in dist/
npm run preview    # serve the build locally
```

The build uses relative paths and hash routing, so `dist/` can be hosted on any static
server (or subfolder) — opening `dist/index.html` directly from disk also works.

`standalone.html` is the original pre-built single-file version of the same app
(all libraries inlined, no build step needed); it's kept for reference and offline use.

## Project structure

```
src/
├── main.jsx                 # entry: mounts <App/>, loads Prism theme + global CSS
├── App.jsx                  # router, sidebar layout, progress state (localStorage-backed)
├── index.css                # design system (dark theme, CSS variables)
├── components/
│   ├── CodeBlock.jsx        # Prism-highlighted code with copy button
│   ├── Callout.jsx          # tip / warning / info boxes
│   ├── Exercise.jsx         # exercise with collapsible solution
│   ├── Sidebar.jsx          # navigation with completion checkmarks + progress bar
│   └── PathDiagram.jsx      # SVG learning-path (snake layout, clickable nodes)
├── pages/
│   ├── Landing.jsx          # hero, path diagram, feature grid, module list
│   └── ModulePage.jsx       # module chrome: numbering, mark-complete, prev/next pager
└── modules/
    ├── index.js             # course registry (order = numbering + routes)
    └── *.jsx                # one component per module (content lives here)
```

## Adding a module

1. Create `src/modules/MyTopic.jsx` exporting a component (use `CodeBlock`, `Callout`, `Exercise`).
2. Add an entry to `MODULES` in `src/modules/index.js`.
3. Add a node position in `src/components/PathDiagram.jsx` (`POS` array) and, if needed,
   grow the SVG `viewBox`.

Routing, sidebar, numbering, pager, and progress tracking pick the new module up automatically.
