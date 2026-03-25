# Map Editor – Module Structure

## Architecture
All modules share state via `window.ME` (Map Editor global).
Functions are registered on `ME.fn` for cross-module access.

## Files
| File | Lines | Description |
|------|-------|-------------|
| `state.js` | ~90 | Shared state, constants, DOM refs |
| `tiles.js` | ~100 | TILE_DEFS, TILE_GROUPS, ASSETS |
| `history.js` | ~170 | Undo/redo command pattern |
| `tools.js` | ~250 | Fill, eyedropper, copy/paste, transforms |
| `layers.js` | ~80 | Layer visibility/lock system |
| `render.js` | ~300 | Offscreen canvas, static/dynamic render, minimap |
| `preview.js` | ~400 | Preview mode, A* pathfinding, player |
| `editor.js` | ~500 | Init, events, palette, sliders, paint, export |
| `main.js` | ~10 | Bootstrap: calls init() |

## Load Order (in HTML)
1. state.js
2. tiles.js
3. history.js
4. tools.js
5. layers.js
6. render.js
7. preview.js
8. editor.js
9. main.js
