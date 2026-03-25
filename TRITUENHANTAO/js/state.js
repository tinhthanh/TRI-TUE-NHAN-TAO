// ============================================================
// Map Editor – Shared State & Constants
// All modules access state via window.ME
// ============================================================
'use strict';

window.ME = {
  // ── Constants ──
  TILE_DEFS: [],
  TILE_GROUPS: [],
  CELL: 32,
  DEFAULT_W: 22,
  DEFAULT_H: 13,
  HISTORY_MAX: 50,
  ASSETS: [],

  // ── Map State ──
  mapWidth: 22,
  mapHeight: 13,
  floors: [],
  currentFloorIdx: 0,
  grid: [],
  roomMap: [],
  rooms: [],
  props: [],

  // ── Drawing State ──
  currentTileId: 1,
  brushSize: 1,
  paintValue: 1,
  hoverCol: -1,
  hoverRow: -1,
  needsRedraw: true,
  stairsPulse: 0,
  currentRoomId: null,
  showGrid: true,
  showMiniMap: true,
  zoomLevel: 1.0,

  // ── Tool State ──
  fillMode: false,
  eyedropperMode: false,
  selectMode: false,
  selStart: null,
  selEnd: null,
  clipboard: null,
  pasteMode: false,
  pasteCursor: null,
  stampMode: false,
  isPainting: false,
  previewMode: false,

  // ── Undo/Redo ──
  undoStack: [],
  redoStack: [],
  isUndoRedo: false,
  pendingCommand: null,

  // ── Offscreen Canvas ──
  staticDirty: true,
  _offCanvas: null,
  _offCtx: null,

  // ── Layer System ──
  layerState: {
    walls:  { visible: true, locked: false },
    ground: { visible: true, locked: false },
    props:  { visible: true, locked: false },
    rooms:  { visible: true, locked: false },
    grid:   { visible: true, locked: false },
  },

  // ── Recent Tiles ──
  recentTiles: [],
  MAX_RECENT: 8,

  // ── DOM References (set during init) ──
  canvas: null,
  ctx: null,
  images: {},

  // ── Preview Mode ──
  previewPlayer: { col: 1, row: 1, renderX: 1, renderY: 1, dir: 2, frame: 0, lastAnim: 0 },
  previewPath: [],
  previewMoveAccum: 0,
  previewLastTime: 0,
  previewBanner: null,
  previewFade: { active: false, alpha: 0, dir: 1, label: '', callback: null },
  previewKeysDown: new Set(),
  PREVIEW_MOVE_MS: 80,
  PREVIEW_SPRITE_COLS: 5,
  PREVIEW_SPRITE_ROWS: 4,

  // ── Module registry (functions set by each module) ──
  fn: {},
};

console.log('[ME] State module loaded');
