// ============================================================
// Map Editor – ES Module Entry Point (for future migration)
// ============================================================
// Usage: <script type="module" src="js/modules.js"></script>
//
// This file re-exports the monolithic map-editor.js organized
// into logical namespaces. When ready to fully modularize,
// extract each section into its own file.
//
// Current architecture:
//   map-editor.js (IIFE, ~2700 lines) ← works NOW
//   js/modules.js (this file)         ← future ES module entry
//
// Migration path:
//   1. Extract TILE_DEFS → js/tiles.js
//   2. Extract undo/redo → js/history.js
//   3. Extract render    → js/render.js
//   4. Extract preview   → js/preview.js
//   5. Extract tools     → js/tools.js
//   6. Extract editor    → js/editor.js
//   7. Update HTML to use <script type="module">
//
// Each module should:
//   - import { state } from './state.js'
//   - export its public functions
//   - NOT use window.* for internal communication
// ============================================================

// For now, this file documents the module boundaries
// found in map-editor.js (see MODULE INDEX at top of that file)

export const MODULE_MAP = {
  'tiles':     { lines: '57-95',    desc: 'TILE_DEFS, TILE_GROUPS, ASSETS' },
  'state':     { lines: '97-114',   desc: 'Map dimensions, floors, grid refs' },
  'history':   { lines: '116-274',  desc: 'Command pattern undo/redo' },
  'zoom':      { lines: '276-294',  desc: 'Zoom controls' },
  'fill':      { lines: '296-328',  desc: 'Flood fill algorithm' },
  'clipboard': { lines: '330-510',  desc: 'Copy/paste/cut + transforms' },
  'layers':    { lines: '530-560',  desc: 'Offscreen canvas cache' },
  'dom':       { lines: '562-612',  desc: 'Canvas, images, asset loading' },
  'floors':    { lines: '643-726',  desc: 'Floor management + tabs' },
  'palette':   { lines: '728-860',  desc: 'Tile palette + recent tiles' },
  'rooms':     { lines: '862-914',  desc: 'Room editor' },
  'events':    { lines: '968-1190', desc: 'Mouse/keyboard event handlers' },
  'paint':     { lines: '1190-1260', desc: 'paintAt() with layer lock' },
  'render':    { lines: '1515-1730', desc: 'Static + dynamic rendering' },
  'preview':   { lines: '2235-2615', desc: 'A* pathfinding, 8-dir movement' },
  'export':    { lines: '2060-2190', desc: 'PNG/JSON export' },
};

console.log('[ME] Module map loaded. See map-editor.js MODULE INDEX for details.');
