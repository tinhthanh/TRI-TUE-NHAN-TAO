// ============================================================
// Map Editor – Multi-Floor Indoor House Map
// Người Chăn Cừu
// ============================================================
//
// ── MODULE INDEX ──────────────────────────────────────────
// This file is organized into logical modules. Each section
// is self-contained and clearly separated.
//
// LINE  MODULE              DESCRIPTION
// ────  ──────────────────  ──────────────────────────────
//   43  TILE_DEFS           Tile definitions, groups, assets
//   83  MULTI-FLOOR STATE   Map dimensions, floors, grid refs
//  101  UNDO/REDO           Command pattern (delta-based)
//  260  ZOOM                Zoom controls
//  281  FILL TOOL           Flood fill algorithm
//  313  COPY/PASTE          Selection, copy, cut, paste
//  448  CLIPBOARD XFORM     Rotate, flip, stamp tool
//  530  OFFSCREEN LAYER     Static canvas cache + dirty flags
//  560  DOM                 Canvas, images, asset loading
//  615  INIT                Bootstrap, floor creation
//  643  FLOOR MANAGEMENT    Add/delete/switch floors
//  715  TILE PALETTE        Build palette UI, tile groups
//  800  RECENT TILES        Recent tiles panel + shortcuts
//  865  ROOM EDITOR         Room name/color/assignment
//  915  SLIDERS             Grid size sliders
//  960  BRUSH               Brush size controls
//  968  EVENTS              Mouse/keyboard handlers
// 1130  HOVER TOOLTIP       Tile info on hover
// 1190  PAINT               paintAt() with layer lock
// 1260  RAF LOOP            requestAnimationFrame loop
// 1285  GRID TOGGLE         Show/hide grid
// 1300  LAYER SYSTEM        5-layer show/hide + lock
// 1360  AUTO-SAVE           localStorage auto-save
// 1415  IMPORT JSON         JSON import modal
// 1465  EYEDROPPER          Pick tile from canvas
// 1475  MINI-MAP            Mini-map rendering
// 1515  RENDER              Offscreen static + dynamic overlay
// 1735  GROUND TILE         drawGroundTile() per-tile renderer
// 1795  HOVER PREVIEW       Brush preview on canvas
// 1835  STATS               Walkable/wall counters
// 1850  VALIDATION          Map validation checks
// 1900  CONFIRM MODAL       Custom confirm dialog
// 1950  ACTIONS             Clear, fill border, invert, random
// 1990  SAVE & PLAY         Export + redirect to game
// 2015  EXPORT JSON         JSON export modal
// 2060  EXPORT PNG           PNG export (single + all floors)
// 2190  BACK                Navigate back
// 2195  LOAD SAMPLE MAP     Load demo maps from JSON
// 2235  PREVIEW MODE        A* pathfinding, 8-dir movement
// 2615  TOAST               Toast notifications
// 2625  BOOTSTRAP           init() call
// ────────────────────────────────────────────────────────────
(function () {
  'use strict';

  // ── TILE DEFINITIONS ───────────────────────────────────────
  const TILE_DEFS = [
    { id: 0, name: 'Sàn (Floor)',      icon: 'crop_square',         color: '#e8dcc8', paint: 0 },
    { id: 1, name: 'Tường (Wall)',     icon: 'border_all',          color: '#7a6a5a', paint: 1 },
    { id: 2, name: 'Cầu thang ↑',     icon: 'arrow_upward',        color: '#06b6d4', paint: 2 },
    { id: 3, name: 'Cầu thang ↓',     icon: 'arrow_downward',      color: '#8b5cf6', paint: 3 },
    { id: 4, name: 'Cửa (Door)',       icon: 'door_front',          color: '#d97706', paint: 4 },
    { id: 5, name: 'Ban công',         icon: 'deck',                color: '#b0bec5', paint: 5 },
    { id: 6, name: 'Sân ngoài',       icon: 'park',                color: '#2d6a1e', paint: 6 },
    { id: 7, name: 'WC',              icon: 'wc',                  color: '#0d9488', paint: 7 },
    { id: 8, name: 'Bếp/Giặt/Phòng', icon: 'kitchen',             color: '#f97316', paint: 8 },
    { id: 9, name: 'Phòng ngủ',       icon: 'bed',                 color: '#a855f7', paint: 9 },
    { id: 10, name: 'Giường',        icon: 'bed',                  color: 'rgba(0,0,0,0)', paint: 10, propType: 'bed' },
    { id: 11, name: 'Ghế Sofa',      icon: 'chair',                color: 'rgba(0,0,0,0)', paint: 11, propType: 'sofa' },
    { id: 12, name: 'Chậu cây',      icon: 'potted_plant',         color: 'rgba(0,0,0,0)', paint: 12, propType: 'plant' },
    { id: 13, name: 'Bàn ăn',        icon: 'table_restaurant',     color: 'rgba(0,0,0,0)', paint: 13, propType: 'table' },
    { id: 14, name: 'Bàn khám Vet',  icon: 'medical_services',     color: 'rgba(0,0,0,0)', paint: 14, propType: 'vet_table' },
    { id: 15, name: 'Lồng Pet',      icon: 'pets',                 color: 'rgba(0,0,0,0)', paint: 15, propType: 'vet_cage' },
    { id: 16, name: 'Máy X-Quang',   icon: 'radiology',            color: 'rgba(0,0,0,0)', paint: 16, propType: 'vet_xray' },
    { id: 17, name: 'Tủ thuốc Vet',  icon: 'medication',           color: 'rgba(0,0,0,0)', paint: 17, propType: 'vet_cabinet' },
    { id: 19, name: 'Quầy Lễ Tân',   icon: 'point_of_sale',        color: 'rgba(0,0,0,0)', paint: 19, propType: 'reception_desk' },
    { id: 20, name: 'Ghế chờ',       icon: 'chair_alt',            color: 'rgba(0,0,0,0)', paint: 20, propType: 'waiting_chair' },
    { id: 21, name: 'Kính hiển vi',   icon: 'biotech',              color: 'rgba(0,0,0,0)', paint: 21, propType: 'microscope' },
    { id: 22, name: 'Truyền dịch',   icon: 'vaccines',             color: 'rgba(0,0,0,0)', paint: 22, propType: 'iv_stand' },
    { id: 23, name: 'Bàn Grooming',  icon: 'content_cut',          color: 'rgba(0,0,0,0)', paint: 23, propType: 'grooming_table' },
    { id: 24, name: 'Bồn rửa tay',   icon: 'wash',                 color: 'rgba(0,0,0,0)', paint: 24, propType: 'surgical_sink' },
    { id: 25, name: 'Siêu âm',       icon: 'monitor_heart',        color: 'rgba(0,0,0,0)', paint: 25, propType: 'ultrasound' },
    { id: 26, name: 'Tủ vaccine',    icon: 'vaccines',             color: 'rgba(0,0,0,0)', paint: 26, propType: 'vaccine_fridge' },
    { id: 18, name: 'Xoá Đồ vật',    icon: 'delete',               color: 'rgba(0,0,0,0)', paint: 18, propType: 'clear' },
    // Floor tile variants
    { id: 27, name: 'Gạch Phòng khám', icon: 'local_hospital',     color: '#c4d4d0', paint: 27, floorImage: 'floorClinic' },
    { id: 28, name: 'Gạch Grooming',   icon: 'content_cut',        color: '#d4c8a8', paint: 28, floorImage: 'floorGrooming' },
    { id: 29, name: 'Gạch Retro',      icon: 'style',              color: '#b8a090', paint: 29, floorImage: 'floorRetro' },
    { id: 30, name: 'Gạch Phẫu thuật', icon: 'medical_services',   color: '#b0c8c0', paint: 30, floorImage: 'floorSurgery' },
    { id: 31, name: 'Sàn gỗ',         icon: 'texture',             color: '#a0784c', paint: 31, floorImage: 'floorWood' },
  ];

  // O(1) lookup by tile ID — replaces all TILE_DEFS[id] and TILE_DEFS.find(t=>t.id===id)
  const TILE_MAP = new Map(TILE_DEFS.map(t => [t.id, t]));
  function getTile(id) { return TILE_MAP.get(id); }

  // Walkable tile IDs (anything except WALL=1)
  function isWalkableTile(t) { return t !== 1; }

  // ── HOUSE TEMPLATES ──────────────────────────────────────────
  const ROOM_TYPES = [
    { key: 'living',  label: 'Phòng khách', tile: 0, color: 'rgba(59,130,246,0.22)' },
    { key: 'bedroom', label: 'Phòng ngủ',   tile: 9, color: 'rgba(168,85,247,0.22)' },
    { key: 'wc',      label: 'WC',          tile: 7, color: 'rgba(13,148,136,0.22)' },
    { key: 'kitchen',  label: 'Bếp',         tile: 8, color: 'rgba(249,115,22,0.22)' },
    { key: 'balcony', label: 'Ban công',     tile: 5, color: 'rgba(176,190,197,0.22)' },
  ];

  const HOUSE_TEMPLATES = [
    { key: 'scratch', name: 'Tự tạo từ đầu', icon: 'edit', w: 0, h: 0, data: null },
    {
      key: 'house2br', name: 'Nhà 2 phòng ngủ', icon: 'house', w: 10, h: 8,
      data: {
        // 8 rows × 10 cols: 1=wall, 0=floor, 4=door
        grid: [
          [1,1,1,1,1,1,1,1,1,1],
          [1,0,0,0,1,0,0,0,0,1],
          [1,0,0,0,1,0,0,0,0,1],
          [1,0,0,0,4,0,0,0,0,1],
          [1,1,4,1,1,1,4,1,1,1],
          [1,0,0,0,0,1,0,0,0,1],
          [1,0,0,0,0,1,0,0,0,1],
          [1,1,1,4,1,1,1,4,1,1],
        ],
        rooms: [
          { id: 'r_lv', name: 'Phòng khách', color: 'rgba(59,130,246,0.22)' },
          { id: 'r_b1', name: 'Phòng ngủ 1', color: 'rgba(168,85,247,0.22)' },
          { id: 'r_b2', name: 'Phòng ngủ 2', color: 'rgba(139,92,246,0.22)' },
          { id: 'r_kt', name: 'Bếp',         color: 'rgba(249,115,22,0.22)' },
          { id: 'r_wc', name: 'WC',          color: 'rgba(13,148,136,0.22)' },
        ],
        // roomMap: assigns room IDs to interior cells (null = no room)
        roomMap: [
          [null,null,null,null,null,null,null,null,null,null],
          [null,'r_lv','r_lv','r_lv',null,'r_b1','r_b1','r_b1','r_b1',null],
          [null,'r_lv','r_lv','r_lv',null,'r_b1','r_b1','r_b1','r_b1',null],
          [null,'r_lv','r_lv','r_lv',null,'r_b1','r_b1','r_b1','r_b1',null],
          [null,null,null,null,null,null,null,null,null,null],
          [null,'r_kt','r_kt','r_kt','r_kt',null,'r_wc','r_wc','r_wc',null],
          [null,'r_kt','r_kt','r_kt','r_kt',null,'r_wc','r_wc','r_wc',null],
          [null,null,null,null,null,null,null,null,null,null],
        ],
      }
    },
    {
      key: 'apt1br', name: 'Căn hộ 1 phòng ngủ', icon: 'apartment', w: 8, h: 6,
      data: {
        grid: [
          [1,1,1,1,1,1,1,1],
          [1,0,0,0,1,0,0,1],
          [1,0,0,0,4,0,0,1],
          [1,1,4,1,1,1,4,1],
          [1,0,0,0,0,0,0,1],
          [1,1,1,1,4,1,1,1],
        ],
        rooms: [
          { id: 'r_bd', name: 'Phòng ngủ', color: 'rgba(168,85,247,0.22)' },
          { id: 'r_wc', name: 'WC',        color: 'rgba(13,148,136,0.22)' },
          { id: 'r_lv', name: 'Phòng khách + Bếp', color: 'rgba(59,130,246,0.22)' },
        ],
        roomMap: [
          [null,null,null,null,null,null,null,null],
          [null,'r_bd','r_bd','r_bd',null,'r_wc','r_wc',null],
          [null,'r_bd','r_bd','r_bd',null,'r_wc','r_wc',null],
          [null,null,null,null,null,null,null,null],
          [null,'r_lv','r_lv','r_lv','r_lv','r_lv','r_lv',null],
          [null,null,null,null,null,null,null,null],
        ],
      }
    },
    {
      key: 'clinic', name: 'Phòng khám thú y', icon: 'local_hospital', w: 12, h: 10,
      data: null // will use from-scratch with bigger size
    },
  ];

  // ── NAMED CONSTANTS (extracted from magic numbers) ─────────
  const WALL_TILE_ID     = 1;        // tile id for wall
  const WALL_FRONT_H     = 12;       // wall front face height (px)
  const WALL_SIDE_W      = 6;        // wall side face width (px)
  const AO_BOTTOM_H      = 5;        // ambient occlusion shadow (px)
  const AO_RIGHT_W       = 4;        // ambient occlusion right shadow (px)
  const STAIR_PULSE_DIV  = 600;      // stair pulse animation speed divisor
  const RANDOM_WALL_PROB = 0.28;     // probability of wall in random gen
  const ZOOM_MIN         = 0.25;
  const ZOOM_MAX         = 2.0;
  const EXPORT_SCALE     = 2;        // PNG export scale factor
  const AUTOSAVE_DELAY   = 1500;     // ms before auto-save triggers

  // ── MULTI-FLOOR STATE ──────────────────────────────────────
  const DEFAULT_W = 22;
  const DEFAULT_H = 13;
  const CELL = 32;

  let mapWidth  = DEFAULT_W;
  let mapHeight = DEFAULT_H;

  // Each floor: { grid: number[][], roomMap: string[][], rooms: {id,name,color}[] }
  let floors = [];
  let currentFloorIdx = 0;

  // Current floor shortcuts (updated by switchToFloor)
  let grid    = [];
  let roomMap = [];
  let rooms   = [];
  let props   = [];

  // ── UNDO / REDO (Command Pattern — delta-based) ────────────
  const HISTORY_MAX = 50;
  let undoStack = [];  // array of Command objects
  let redoStack = [];
  let isUndoRedo = false;
  let pendingCommand = null; // accumulates cell changes within a single stroke

  // Command: stores only the changed cells (delta), not entire map
  // { floorIdx, changes: Map<key, delta>, propsChanges: [{ floorIdx, old[], new[] }] }
  const _clone = typeof structuredClone === 'function'
    ? structuredClone
    : obj => JSON.parse(JSON.stringify(obj));

  function createCommand(floorIdx) {
    return {
      floorIdx,
      _cellMap: new Map(),  // key → { floorIdx, r, c, layer, old, new } (dedup by cell+layer)
      propsChanges: [],
      _propsBefore: {}
    };
  }

  // Record a cell change — deduplicates: keeps first old value, updates latest new value
  function recordCell(cmd, floorIdx, r, c, layer, oldVal, newVal) {
    if (oldVal === newVal) return;
    const key = floorIdx * 1000000 + r * 1000 + c + (layer === 'roomMap' ? 500000000 : 0);
    const existing = cmd._cellMap.get(key);
    if (existing) {
      existing.new = newVal;  // update to latest value, keep original old
    } else {
      cmd._cellMap.set(key, { floorIdx, r, c, layer, old: oldVal, new: newVal });
    }
  }

  // Snapshot props before mutation — only once per floor per command
  function recordPropsBefore(cmd, floorIdx) {
    if (cmd._propsBefore[floorIdx] !== undefined) return;
    cmd._propsBefore[floorIdx] = _clone(floors[floorIdx].props || []);
  }

  // Finalize: convert Map to array, snapshot props "after"
  function finalizeCommand(cmd) {
    // Convert cell map to compact array & remove no-ops (old === new after full stroke)
    cmd.changes = [];
    for (const delta of cmd._cellMap.values()) {
      if (delta.old !== delta.new) cmd.changes.push(delta);
    }
    delete cmd._cellMap;
    // Props snapshots
    for (const fi of Object.keys(cmd._propsBefore)) {
      const idx = Number(fi);
      cmd.propsChanges.push({
        floorIdx: idx,
        old: cmd._propsBefore[idx],
        new: _clone(floors[idx].props || [])
      });
    }
    delete cmd._propsBefore;
    return cmd;
  }

  function commandIsEmpty(cmd) {
    return cmd.changes.length === 0 && cmd.propsChanges.length === 0;
  }

  // Begin a new undoable action (call before paint stroke / fill / paste / etc.)
  function saveHistory() {
    if (isUndoRedo) return;
    pendingCommand = createCommand(currentFloorIdx);
  }

  // Commit the pending command to the undo stack (call after action done)
  function commitHistory() {
    if (!pendingCommand || isUndoRedo) return;
    finalizeCommand(pendingCommand);
    if (commandIsEmpty(pendingCommand)) { pendingCommand = null; return; }
    undoStack.push(pendingCommand);
    if (undoStack.length > HISTORY_MAX) undoStack.shift();
    redoStack = [];
    pendingCommand = null;
    updateUndoRedoBtns();
  }

  // For operations that are atomic (fill, paste, cut, import) — begin + commit wrapper
  function saveHistoryAtomic() {
    if (isUndoRedo) return;
    // commit any pending stroke first
    if (pendingCommand) commitHistory();
    pendingCommand = createCommand(currentFloorIdx);
  }

  function applyCommand(cmd, forward) {
    // Special snapshot command (used by import)
    if (cmd.type === 'snapshot') {
      const snap = forward ? cmd.new : cmd.old;
      floors = JSON.parse(JSON.stringify(snap.floors));
      mapWidth = snap.mapWidth;
      mapHeight = snap.mapHeight;
      const wSlider = $('grid-w-slider');
      const hSlider = $('grid-h-slider');
      if (wSlider) { wSlider.value = mapWidth; $('grid-width-value').textContent = mapWidth; }
      if (hSlider) { hSlider.value = mapHeight; $('grid-height-value').textContent = mapHeight; }
      resizeCanvas();
      return;
    }
    // Delta command
    const changes = cmd.changes;
    for (let i = 0; i < changes.length; i++) {
      const ch = changes[i];
      const val = forward ? ch.new : ch.old;
      if (ch.layer === 'grid') {
        floors[ch.floorIdx].grid[ch.r][ch.c] = val;
      } else if (ch.layer === 'roomMap') {
        floors[ch.floorIdx].roomMap[ch.r][ch.c] = val;
      }
    }
    // Restore props snapshots
    const pc = cmd.propsChanges;
    for (let i = 0; i < pc.length; i++) {
      floors[pc[i].floorIdx].props = _clone(forward ? pc[i].new : pc[i].old);
    }
  }

  function undo() {
    // commit any uncommitted stroke
    if (pendingCommand) commitHistory();
    if (undoStack.length === 0) return;
    isUndoRedo = true;
    const cmd = undoStack.pop();
    applyCommand(cmd, false);
    redoStack.push(cmd);
    switchToFloor(Math.min(currentFloorIdx, floors.length - 1));
    isUndoRedo = false;
    updateUndoRedoBtns();
    showToast('↩ Undo');
  }

  function redo() {
    if (redoStack.length === 0) return;
    isUndoRedo = true;
    const cmd = redoStack.pop();
    applyCommand(cmd, true);
    undoStack.push(cmd);
    switchToFloor(Math.min(currentFloorIdx, floors.length - 1));
    isUndoRedo = false;
    updateUndoRedoBtns();
    showToast('↪ Redo');
  }

  function updateUndoRedoBtns() {
    const undoBtn = $('undo-btn');
    const redoBtn = $('redo-btn');
    if (undoBtn) undoBtn.disabled = undoStack.length === 0;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;
  }

  window.undo = undo;
  window.redo = redo;

  // ── ZOOM (persisted in sessionStorage) ─────────────────────
  const ZOOM_STORAGE_KEY = 'mapEditor_zoom';
  let zoomLevel = parseFloat(sessionStorage.getItem(ZOOM_STORAGE_KEY)) || 1.0;

  function setZoom(z) {
    zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
    const pct = Math.round(zoomLevel * 100);
    canvas.style.width  = (canvas.width  * zoomLevel) + 'px';
    canvas.style.height = (canvas.height * zoomLevel) + 'px';
    const zoomLabel = $('zoom-label');
    if (zoomLabel) zoomLabel.textContent = pct + '%';
    try { sessionStorage.setItem(ZOOM_STORAGE_KEY, zoomLevel); } catch(e) {}
  }

  function zoomIn()  { setZoom(zoomLevel * 1.25); }
  function zoomOut() { setZoom(zoomLevel / 1.25); }
  function zoomReset() { setZoom(1.0); }

  window.zoomIn    = zoomIn;
  window.zoomOut   = zoomOut;
  window.zoomReset = zoomReset;

  // ── FILL TOOL ──────────────────────────────────────────────
  let fillMode = false;

  window.toggleFill = function() {
    fillMode = !fillMode;
    const btn = $('fill-btn');
    if (btn) btn.classList.toggle('active', fillMode);
    canvas.style.cursor = fillMode ? 'cell' : 'crosshair';
    showToast(fillMode ? '🪣 Fill mode ON' : 'Fill mode OFF');
  };

  function floodFill(startCol, startRow, fillValue) {
    const targetValue = grid[startRow][startCol];
    if (targetValue === fillValue) return;
    saveHistoryAtomic();
    const stack = [[startRow, startCol]];
    const visited = new Set();
    while (stack.length > 0) {
      const [r, c] = stack.pop();
      if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) continue;
      const key = r * 1000 + c;
      if (visited.has(key)) continue;
      if (grid[r][c] !== targetValue) continue;
      visited.add(key);
      recordCell(pendingCommand, currentFloorIdx, r, c, 'grid', grid[r][c], fillValue);
      grid[r][c] = fillValue;
      stack.push([r-1,c],[r+1,c],[r,c-1],[r,c+1]);
    }
    commitHistory();
    updateStats(); validate(); markDirty();
  }

  // ── COPY / PASTE REGION ──────────────────────────────────
  let selectMode = false;   // Ctrl held = selection drag
  let selStart = null;      // {col, row}
  let selEnd   = null;      // {col, row}
  let clipboard = null;     // { grid[][], roomMap[][], props[], w, h, srcFloor }
  let pasteMode = false;    // waiting for click to place
  let pasteCursor = null;   // {col, row} current paste ghost position

  function getSelRect() {
    if (!selStart || !selEnd) return null;
    const c1 = Math.max(0, Math.min(selStart.col, selEnd.col));
    const r1 = Math.max(0, Math.min(selStart.row, selEnd.row));
    const c2 = Math.min(mapWidth  - 1, Math.max(selStart.col, selEnd.col));
    const r2 = Math.min(mapHeight - 1, Math.max(selStart.row, selEnd.row));
    return { c1, r1, c2, r2, w: c2 - c1 + 1, h: r2 - r1 + 1 };
  }

  function copySelection() {
    const sel = getSelRect();
    if (!sel) { showToast('Chọn vùng trước (Ctrl+drag)'); return; }
    const g = [], rm = [];
    for (let r = sel.r1; r <= sel.r2; r++) {
      const gr = [], rr = [];
      for (let c = sel.c1; c <= sel.c2; c++) {
        gr.push(grid[r][c]);
        rr.push(roomMap[r][c]);
      }
      g.push(gr); rm.push(rr);
    }
    // Capture props inside selection (relative coords)
    const selProps = (props || [])
      .filter(p => p.r >= sel.r1 && p.r <= sel.r2 && p.c >= sel.c1 && p.c <= sel.c2)
      .map(p => ({ r: p.r - sel.r1, c: p.c - sel.c1, type: p.type }));
    clipboard = { grid: g, roomMap: rm, props: selProps, w: sel.w, h: sel.h, srcFloor: currentFloorIdx };
    updateClipboardToolsVis();
    const floorName = floors[currentFloorIdx].name || ('Tầng ' + (currentFloorIdx + 1));
    showToast('📋 Đã copy ' + sel.w + '×' + sel.h + ' tiles (từ ' + floorName + ', ' + selProps.length + ' vật dụng)');
  }

  function cutSelection() {
    const sel = getSelRect();
    if (!sel) return;
    copySelection();
    saveHistoryAtomic();
    recordPropsBefore(pendingCommand, currentFloorIdx);
    for (let r = sel.r1; r <= sel.r2; r++)
      for (let c = sel.c1; c <= sel.c2; c++) {
        recordCell(pendingCommand, currentFloorIdx, r, c, 'grid', grid[r][c], 0);
        recordCell(pendingCommand, currentFloorIdx, r, c, 'roomMap', roomMap[r][c], null);
        grid[r][c] = 0; roomMap[r][c] = null;
      }
    // Remove props in selection
    const floorProps = floors[currentFloorIdx].props;
    for (let i = floorProps.length - 1; i >= 0; i--) {
      const p = floorProps[i];
      if (p.r >= sel.r1 && p.r <= sel.r2 && p.c >= sel.c1 && p.c <= sel.c2) {
        floorProps.splice(i, 1);
      }
    }
    commitHistory();
    selStart = selEnd = null;
    updateStats(); validate(); markDirty();
    showToast('✂️ Cut ' + sel.w + '×' + sel.h + ' tiles (+ vật dụng)');
  }

  function startPaste() {
    if (!clipboard) { showToast('Chưa copy vùng nào'); return; }
    pasteMode = true;
    selStart = selEnd = null;
    canvas.style.cursor = 'copy';
    showToast('📋 Click để dán · Esc để hủy');
    markDirty();
  }

  function doStampPaste(col, row) {
    if (!clipboard) return;
    saveHistoryAtomic();
    // Record props before for undo
    if (clipboard.props && clipboard.props.length > 0) {
      recordPropsBefore(pendingCommand, currentFloorIdx);
    }
    for (let dr = 0; dr < clipboard.h; dr++) {
      for (let dc = 0; dc < clipboard.w; dc++) {
        const r = row + dr, c = col + dc;
        if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) continue;
        recordCell(pendingCommand, currentFloorIdx, r, c, 'grid', grid[r][c], clipboard.grid[dr][dc]);
        recordCell(pendingCommand, currentFloorIdx, r, c, 'roomMap', roomMap[r][c], clipboard.roomMap[dr][dc]);
        grid[r][c] = clipboard.grid[dr][dc];
        roomMap[r][c] = clipboard.roomMap[dr][dc];
      }
    }
    // Paste props
    if (clipboard.props && clipboard.props.length > 0) {
      const floorProps = floors[currentFloorIdx].props;
      // Remove existing props in paste area
      for (let dr = 0; dr < clipboard.h; dr++) {
        for (let dc = 0; dc < clipboard.w; dc++) {
          const r = row + dr, c = col + dc;
          const idx = floorProps.findIndex(p => p.r === r && p.c === c);
          if (idx >= 0) floorProps.splice(idx, 1);
        }
      }
      // Add clipboard props at new position
      clipboard.props.forEach(p => {
        const r = row + p.r, c = col + p.c;
        if (r >= 0 && r < mapHeight && c >= 0 && c < mapWidth) {
          floorProps.push({ r, c, type: p.type });
        }
      });
    }
    commitHistory();
    updateStats(); validate(); markDirty();
    // Stamp mode: stay in paste mode for multiple stamps
    if (!stampMode) {
      pasteMode = false;
      pasteCursor = null;
      canvas.style.cursor = 'crosshair';
    }
    const isCrossFloor = clipboard.srcFloor !== undefined && clipboard.srcFloor !== currentFloorIdx;
    const label = stampMode
      ? '🔨 Đóng dấu! (tiếp tục click...)'
      : isCrossFloor
        ? '✅ Đã dán từ ' + (floors[clipboard.srcFloor].name || 'Tầng ' + (clipboard.srcFloor + 1)) + '!'
        : '✅ Đã dán!';
    showToast(label);
  }

  function cancelPaste() {
    pasteMode = false;
    pasteCursor = null;
    stampMode = false;
    canvas.style.cursor = 'crosshair';
    markDirty();
  }

  // ── CLIPBOARD TRANSFORMS (rotate / flip) ──────────────────
  function rotateClipboardCW() {
    if (!clipboard) { showToast('Chưa copy vùng nào'); return; }
    const { grid: g, roomMap: rm, props: p, w, h } = clipboard;
    // Rotate 90° clockwise: new[c][h-1-r] = old[r][c]
    const ng = [], nrm = [];
    for (let c = 0; c < w; c++) {
      const gr = [], rr = [];
      for (let r = h - 1; r >= 0; r--) {
        gr.push(g[r][c]);
        rr.push(rm[r][c]);
      }
      ng.push(gr); nrm.push(rr);
    }
    // Rotate props: (r,c) → (c, h-1-r)
    const np = (p || []).map(pp => ({ r: pp.c, c: h - 1 - pp.r, type: pp.type }));
    clipboard.grid = ng;
    clipboard.roomMap = nrm;
    clipboard.props = np;
    clipboard.w = h;
    clipboard.h = w;
    markDirty();
    showToast('🔄 Xoay 90° · ' + clipboard.w + '×' + clipboard.h);
  }

  function flipClipboardH() {
    if (!clipboard) { showToast('Chưa copy vùng nào'); return; }
    const { grid: g, roomMap: rm, props: p, w, h } = clipboard;
    // Flip horizontal: reverse each row
    for (let r = 0; r < h; r++) {
      g[r].reverse();
      rm[r].reverse();
    }
    // Flip props
    if (p) p.forEach(pp => { pp.c = w - 1 - pp.c; });
    markDirty();
    showToast('↔️ Lật ngang');
  }

  function flipClipboardV() {
    if (!clipboard) { showToast('Chưa copy vùng nào'); return; }
    const { grid: g, roomMap: rm, props: p, w, h } = clipboard;
    // Flip vertical: reverse row order
    g.reverse();
    rm.reverse();
    // Flip props
    if (p) p.forEach(pp => { pp.r = h - 1 - pp.r; });
    markDirty();
    showToast('↕️ Lật dọc');
  }

  // Stamp tool: paste multiple times without exiting paste mode
  let stampMode = false;

  // ── HOUSE WIZARD STATE ────────────────────────────────────
  let wizardActive = false;
  let wizardStep = 0;          // 1=size/template, 3=design mode
  let wizardOverlay = null;    // modal DOM element
  let wizardFloating = null;   // floating toolbar DOM during design mode
  let wizardRoomPopup = null;  // room name/type popup DOM
  let wizardDragStart = null;  // {col,row} for room/wall drag
  let wizardDragEnd = null;
  let wizardRooms = [];        // [{r1,c1,r2,c2,name,type,color,roomId}]
  let wizardTemplate = null;   // selected template key or null
  let wizardSnapshotBefore = null; // for full undo on cancel
  let designTool = 'room';    // 'room' | 'wall' | 'door'

  function toggleStamp() {
    if (!clipboard) { showToast('Copy vùng trước, rồi bật Stamp'); return; }
    stampMode = !stampMode;
    if (stampMode) {
      pasteMode = true;
      canvas.style.cursor = 'copy';
      showToast('🔨 Stamp ON — click nhiều lần để đóng dấu · Esc tắt');
    } else {
      showToast('🔨 Stamp OFF');
    }
    markDirty();
  }

  window.copyRegion = copySelection;
  window.pasteRegion = startPaste;
  window.cutRegion = cutSelection;
  window.rotateClipboard = rotateClipboardCW;
  window.flipClipboardH = flipClipboardH;
  window.flipClipboardV = flipClipboardV;
  window.toggleStamp = toggleStamp;

  // Drawing state
  let currentTileId = 1;   // default: wall
  let brushSize = 1;
  let isPainting = false;
  let paintValue = 1;
  let hoverCol = -1, hoverRow = -1;
  let needsRedraw = true;
  let stairsPulse = 0;

  // ── OFFSCREEN STATIC LAYER ──────────────────────────────────
  // Static layers (ground, props, AO, walls) are cached in an offscreen canvas.
  // Only redrawn when map data changes (staticDirty=true).
  // Dynamic layers (hover, selection, paste ghost, player, minimap) draw on top each frame.
  let staticDirty = true;              // rebuild offscreen when map mutates
  let _offCanvas = null;               // lazily created offscreen canvas
  let _offCtx    = null;

  function getOffscreenCanvas() {
    if (!_offCanvas) {
      _offCanvas = document.createElement('canvas');
      _offCtx    = _offCanvas.getContext('2d');
    }
    if (_offCanvas.width !== canvas.width || _offCanvas.height !== canvas.height) {
      _offCanvas.width  = canvas.width;
      _offCanvas.height = canvas.height;
      staticDirty = true; // size changed → must redraw
    }
    return { cv: _offCanvas, cx: _offCtx };
  }

  function invalidateStatic() { staticDirty = true; needsRedraw = true; }
  // Light redraw — only dynamic overlay (hover, selection, etc.), reuse cached static
  function markOverlayDirty() { needsRedraw = true; }

  // Room paint mode: when a room tile (7/8/9/5) is placed, we also set roomId
  let currentRoomId = null;   // auto-generated or from room-name-input

  // ── DOM (cached references — avoid repeated getElementById) ──
  const canvas = document.getElementById('editor-canvas');
  const ctx    = canvas.getContext('2d');
  const validationBox = document.getElementById('validation-box');

  // Frequently accessed DOM elements — cached once at load
  const $cache = {};
  function $(id) {
    if (!$cache[id]) $cache[id] = document.getElementById(id);
    return $cache[id];
  }

  // ── IMAGES ────────────────────────────────────────────────
  const images = {};
  const ASSETS = [
    { key: 'grass',     src: 'grass_new.png'  },
    { key: 'wall',      src: 'wall_top.png'   },
    { key: 'wallSide',  src: 'wall_side.png'  },
    { key: 'floorTile', src: 'floor_tile.png' },
    { key: 'stairsUp',  src: 'stairs_up.png'  },
    { key: 'door',      src: 'door.png'        },
    { key: 'balcony',   src: 'balcony.png'     },
    // Floor tile variants
    { key: 'floorClinic',   src: 'floor_clinic.png' },
    { key: 'floorGrooming', src: 'floor_grooming.png' },
    { key: 'floorRetro',    src: 'floor_retro.png' },
    { key: 'floorSurgery',  src: 'floor_surgery.png' },
    { key: 'floorWood',     src: 'floor_wood.png' },
    // Prop images
    { key: 'prop_bed',            src: 'prop_bed.png' },
    { key: 'prop_sofa',           src: 'prop_sofa.png' },
    { key: 'prop_plant',          src: 'prop_plant.png' },
    { key: 'prop_table',          src: 'prop_table.png' },
    { key: 'prop_vet_table',      src: 'prop_vet_table.png' },
    { key: 'prop_vet_cage',       src: 'prop_vet_cage.png' },
    { key: 'prop_vet_xray',       src: 'prop_vet_xray.png' },
    { key: 'prop_vet_cabinet',    src: 'prop_vet_cabinet.png' },
    { key: 'prop_reception_desk', src: 'prop_reception_desk.png' },
    { key: 'prop_waiting_chair',  src: 'prop_waiting_chair.png' },
    { key: 'prop_microscope',     src: 'prop_microscope.png' },
    { key: 'prop_iv_stand',       src: 'prop_iv_stand.png' },
    { key: 'prop_grooming_table', src: 'prop_grooming_table.png' },
    { key: 'prop_surgical_sink',  src: 'prop_surgical_sink.png' },
    { key: 'prop_ultrasound',     src: 'prop_ultrasound.png' },
    { key: 'prop_vaccine_fridge', src: 'prop_vaccine_fridge.png' },
    // Player sprite for preview mode
    { key: 'player', src: 'man2.png' },
  ];

  function loadAssets() {
    return new Promise(resolve => {
      let n = 0;
      ASSETS.forEach(({ key, src }) => {
        const img = new Image();
        img.onload = img.onerror = () => { if (++n >= ASSETS.length) resolve(); };
        img.src = src;
        images[key] = img;
      });
      setTimeout(resolve, 4000);
    });
  }

  // ── INIT ──────────────────────────────────────────────────
  async function init() {
    showLoadingCanvas();
    await loadAssets();
    buildTilePalette();
    buildToolbarDropdowns();
    if (!restoreAutoSave()) {
      createInitialFloors();
    }
    bindSliders();
    bindEvents();
    updateFloorTabs();
    switchToFloor(currentFloorIdx);
    resizeCanvas();
    // Restore persisted zoom level
    if (zoomLevel !== 1.0) setZoom(zoomLevel);
    requestAnimationFrame(rafLoop);
  }

  function showLoadingCanvas() {
    canvas.width = DEFAULT_W * CELL;
    canvas.height = DEFAULT_H * CELL;
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Đang tải đồ họa...', canvas.width / 2, canvas.height / 2);
    ctx.textAlign = 'left';
  }

  // ── FLOOR MANAGEMENT ──────────────────────────────────────
  function makeEmptyFloor(name) {
    const g = [];
    const rm = [];
    for (let r = 0; r < mapHeight; r++) {
      g.push(new Array(mapWidth).fill(0));
      rm.push(new Array(mapWidth).fill(null));
    }
    return { name, grid: g, roomMap: rm, rooms: [], props: [] };
  }

  function createInitialFloors() {
    floors = [
      makeEmptyFloor('Tầng 1'),
      makeEmptyFloor('Tầng 2'),
      makeEmptyFloor('Tầng 3'),
    ];
  }

  // Ensure every floor has all required arrays (fixes imported/old maps)
  function ensureFloorStructure(floor) {
    if (!Array.isArray(floor.rooms)) floor.rooms = [];
    if (!Array.isArray(floor.props)) floor.props = [];
    if (!Array.isArray(floor.grid))  floor.grid  = [];
    if (!Array.isArray(floor.roomMap)) floor.roomMap = [];
    return floor;
  }

  function switchToFloor(idx) {
    currentFloorIdx = idx;
    ensureFloorStructure(floors[idx]);
    grid    = floors[idx].grid;
    roomMap = floors[idx].roomMap;
    rooms   = floors[idx].rooms;
    props   = floors[idx].props;
    updateFloorTabs();
    updateStats();
    validate();
    updateRoomList();
    markDirty();
    // Hint about cross-floor paste
    if (pasteMode && clipboard) {
      const srcName = floors[clipboard.srcFloor]?.name || ('Tầng ' + (clipboard.srcFloor + 1));
      const dstName = floors[idx].name || ('Tầng ' + (idx + 1));
      if (clipboard.srcFloor !== idx) {
        showToast('📋 Paste mode: dán từ ' + srcName + ' → ' + dstName + ' · Click để dán');
      }
    }
  }

  window.addFloor = function () {
    floors.push(makeEmptyFloor('Tầng ' + (floors.length + 1)));
    updateFloorTabs();
    switchToFloor(floors.length - 1);
    showToast('Đã thêm tầng mới!');
  };

  function updateFloorTabs() {
    const bar = document.getElementById('floor-tab-bar');
    // Remove old tabs (keep the + button last)
    const addBtn = bar.querySelector('.floor-add-btn');
    bar.innerHTML = '';
    floors.forEach((f, i) => {
      const btn = document.createElement('button');
      btn.className = 'floor-tab-btn' + (i === currentFloorIdx ? ' active' : '');
      btn.textContent = f.name;
      btn.onclick = () => switchToFloor(i);
      btn.ondblclick = () => renameFloor(i, btn);
      bar.appendChild(btn);
    });
    bar.appendChild(addBtn);
  }

  function renameFloor(idx, btn) {
    const newName = prompt('Tên tầng:', floors[idx].name);
    if (newName && newName.trim()) {
      floors[idx].name = newName.trim();
      updateFloorTabs();
    }
  }

  // ── TILE PALETTE ──────────────────────────────────────────
  const TILE_GROUPS = [
    { icon: 'border_all', label: 'Nền',      ids: [1, 2, 3, 4, 5, 6], collapsed: false },
    { icon: 'grid_view',  label: 'Gạch nền', ids: [0, 27, 28, 29, 30, 31], collapsed: false },
    { icon: 'home',       label: 'Phòng',    ids: [7, 8, 9], collapsed: false },
    { icon: 'chair',      label: 'Đồ vật',   ids: [10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24, 25, 26, 18], collapsed: true },
  ];

  function buildTilePalette() {
    const container = document.getElementById('tile-palette');
    container.innerHTML = '';
    TILE_GROUPS.forEach((group, gi) => {
      // Group header
      const header = document.createElement('button');
      header.className = 'tile-group-header' + (group.collapsed ? ' collapsed' : '');
      // Build header content with proper iconify-icon element
      const arrowSpan = document.createElement('span');
      arrowSpan.className = 'group-arrow';
      arrowSpan.textContent = '▼';
      header.appendChild(arrowSpan);
      if (group.icon) {
        const iconEl = document.createElement('span');
        iconEl.className = 'ms-icon';
        iconEl.textContent = group.icon;
        iconEl.style.marginLeft = '4px';
        iconEl.style.fontSize = '16px';
        header.appendChild(iconEl);
      }
      const labelText = document.createTextNode(' ' + group.label);
      header.appendChild(labelText);
      const itemsDiv = document.createElement('div');
      itemsDiv.className = 'tile-group-items' + (group.collapsed ? ' collapsed' : '');
      header.onclick = () => {
        group.collapsed = !group.collapsed;
        header.classList.toggle('collapsed', group.collapsed);
        itemsDiv.classList.toggle('collapsed', group.collapsed);
      };
      container.appendChild(header);

      // Tile buttons in this group
      group.ids.forEach(id => {
        const td = getTile(id);
        if (!td) return;
        const btn = document.createElement('button');
        btn.className = 'tile-btn' + (td.id === currentTileId ? ' active' : '');
        btn.id = 'tile-btn-' + td.id;
        btn.title = td.name + (td.id === 1 ? ' (phím 1 mặc định)' : td.id === 0 ? ' (phím 9 = xóa)' : '');

        // Build icon element
        const iconSpan = document.createElement('span');
        iconSpan.className = 'tile-icon';

        // For floor tile variants, show texture preview image
        if (td.floorImage && images[td.floorImage]) {
          const img = document.createElement('img');
          img.src = images[td.floorImage].src;
          img.style.cssText = 'width:20px;height:20px;border-radius:3px;image-rendering:pixelated;flex-shrink:0;';
          iconSpan.appendChild(img);
        } else if (td.id === 0 && images.floorTile) {
          const img = document.createElement('img');
          img.src = images.floorTile.src;
          img.style.cssText = 'width:20px;height:20px;border-radius:3px;image-rendering:pixelated;flex-shrink:0;';
          iconSpan.appendChild(img);
        } else {
          // Use Material Symbols font icon
          const iconEl = document.createElement('span');
          iconEl.className = 'ms-icon';
          iconEl.textContent = td.icon;
          iconSpan.appendChild(iconEl);
        }

        const nameSpan = document.createElement('span');
        nameSpan.className = 'tile-name';
        nameSpan.textContent = td.name;

        btn.appendChild(iconSpan);
        btn.appendChild(nameSpan);
        btn.style.setProperty('--tile-color', td.color);
        btn.onclick = () => selectTile(td.id);
        itemsDiv.appendChild(btn);
      });
      container.appendChild(itemsDiv);
    });
  }


  // ── TOOLBAR DROPDOWNS (Nền + Đồ vật) ────────────────────
  const GROUND_TILE_IDS = [1, 0, 2, 3, 4, 5, 6, 27, 28, 29, 30, 31, 7, 8, 9];
  const PROP_TILE_IDS = [10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24, 25, 26, 18];

  function buildToolbarDropdowns() {
    buildDropdown('tb-ground-grid', GROUND_TILE_IDS);
    buildDropdown('tb-props-grid', PROP_TILE_IDS);

    // Toggle open/close
    document.querySelectorAll('.tb-dropdown').forEach(dd => {
      const btn = dd.querySelector('.tb-btn');
      btn.addEventListener('click', () => {
        const wasOpen = dd.classList.contains('open');
        // Close all dropdowns first
        document.querySelectorAll('.tb-dropdown').forEach(d => d.classList.remove('open'));
        if (!wasOpen) dd.classList.add('open');
      });
    });

    // Close on click outside
    document.addEventListener('click', e => {
      if (!e.target.closest('.tb-dropdown')) {
        document.querySelectorAll('.tb-dropdown').forEach(d => d.classList.remove('open'));
      }
    });

    // Close "more" menu on item click
    document.querySelectorAll('.tb-dropdown-right .tb-dd-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.tb-dropdown').forEach(d => d.classList.remove('open'));
      });
    });
  }

  function buildDropdown(gridId, tileIds) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '';
    tileIds.forEach(id => {
      const td = getTile(id);
      if (!td) return;
      const item = document.createElement('div');
      item.className = 'tb-dd-item' + (id === currentTileId ? ' active' : '');
      item.dataset.tileId = id;

      // Icon
      if (td.floorImage && images[td.floorImage]) {
        item.innerHTML = `<img src="${images[td.floorImage].src}"><span>${td.name}</span>`;
      } else if (id === 0 && images.floorTile) {
        item.innerHTML = `<img src="${images.floorTile.src}"><span>${td.name}</span>`;
      } else {
        item.innerHTML = `<span class="ms-icon">${td.icon}</span><span>${td.name}</span>`;
      }

      item.onclick = (e) => {
        e.stopPropagation();
        selectTile(id);
        // Update active state in all dropdowns
        document.querySelectorAll('.tb-dd-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        // Close dropdown
        document.querySelectorAll('.tb-dropdown').forEach(d => d.classList.remove('open'));
      };
      grid.appendChild(item);
    });
  }

  // Update brush hint buttons
  const _origSetBrush = window.setBrush;
  window.setBrush = function(size) {
    _origSetBrush(size);
    document.querySelectorAll('.brush-hint-btn').forEach(b => b.classList.remove('active'));
    const hBtn = document.getElementById('brush-h' + size);
    if (hBtn) hBtn.classList.add('active');
  };

  // ── RECENT TILES ────────────────────────────────────────
  const MAX_RECENT = 8;
  let recentTiles = [];  // ordered: most recent first

  function addToRecent(tileId) {
    recentTiles = recentTiles.filter(id => id !== tileId);
    recentTiles.unshift(tileId);
    if (recentTiles.length > MAX_RECENT) recentTiles.pop();
    renderRecentTiles();
  }

  function renderRecentTiles() {
    const container = document.getElementById('recent-tiles');
    const card = document.getElementById('recent-tiles-card');
    if (!container || !card) return;
    if (recentTiles.length === 0) { card.style.display = 'none'; return; }
    card.style.display = '';
    container.innerHTML = '';
    recentTiles.forEach((tileId, idx) => {
      const td = getTile(tileId);
      if (!td) return;
      const btn = document.createElement('button');
      btn.className = 'recent-tile-btn' + (tileId === currentTileId ? ' active' : '');
      // Shortcut badge (1-8)
      const shortcutKey = idx + 1;
      btn.title = `${td.name} (phím ${shortcutKey})`;

      // Icon content
      if (td.floorImage && images[td.floorImage]) {
        const img = document.createElement('img');
        img.src = images[td.floorImage].src;
        btn.appendChild(img);
      } else if (td.id === 0 && images.floorTile) {
        const img = document.createElement('img');
        img.src = images.floorTile.src;
        btn.appendChild(img);
      } else {
        const icon = document.createElement('span');
        icon.className = 'ms-icon';
        icon.textContent = td.icon;
        btn.appendChild(icon);
      }

      // Shortcut number badge
      if (shortcutKey <= 9) {
        const badge = document.createElement('span');
        badge.className = 'shortcut-badge';
        badge.textContent = shortcutKey;
        btn.appendChild(badge);
      }

      btn.onclick = () => selectTile(tileId);
      container.appendChild(btn);
    });
  }

  let _activeTileBtn = null; // track last active button — avoids querySelectorAll scan

  window.selectTile = function (id) {
    currentTileId = id;
    addToRecent(id);
    if (_activeTileBtn) _activeTileBtn.classList.remove('active');
    const btn = document.getElementById('tile-btn-' + id);
    if (btn) btn.classList.add('active');
    _activeTileBtn = btn;
    const td = getTile(id);
    $('current-tile-label').textContent = td ? td.name : '?';
    markDirty();
  };

  // applyRoomSettings removed — replaced by draw-room popup

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // Count tiles assigned to each room
  function countRoomTiles(roomId) {
    let count = 0;
    for (let r = 0; r < mapHeight; r++)
      for (let c = 0; c < mapWidth; c++)
        if (roomMap[r][c] === roomId) count++;
    return count;
  }

  function updateRoomList() {
    const el = $('room-list');
    const rs = floors[currentFloorIdx].rooms;
    if (rs.length === 0) {
      el.innerHTML = '<span style="color:var(--text-secondary); font-size:12px;">Chưa có phòng nào.</span>';
      return;
    }
    el.innerHTML = rs.map(r => {
      const count = countRoomTiles(r.id);
      const isActive = currentRoomId === r.id;
      const swatchColor = r.color.replace(/[\d.]+\)$/, '1)');
      return `<div class="room-item${isActive ? ' active' : ''}" onclick="selectRoom('${r.id}')">
        <span class="room-swatch-dot" style="background:${swatchColor};"></span>
        <div class="room-info">
          <div class="room-name">${r.name}</div>
          <div class="room-meta">${count} ô · ${(count * CELL * CELL / 10000).toFixed(1)}m²</div>
        </div>
        <button class="btn-del" onclick="event.stopPropagation(); deleteRoom('${r.id}')" title="Xóa phòng"><span class="ms-icon">delete</span></button>
      </div>`;
    }).join('');
    updateMobileRoomCount();
  }

  // Convert rgba(r,g,b,a) to hex for color picker
  function rgbaToHex(rgba) {
    const m = rgba.match(/(\d+)/g);
    if (!m || m.length < 3) return '#3b82f6';
    return '#' + [m[0], m[1], m[2]].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
  }

  // Select a room for painting
  let highlightedRoomId = null;
  let highlightedRoomTimer = null;

  window.selectRoom = function(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    currentRoomId = roomId;
    // Highlight room on canvas (flash for 3 seconds)
    highlightedRoomId = roomId;
    clearTimeout(highlightedRoomTimer);
    highlightedRoomTimer = setTimeout(() => { highlightedRoomId = null; markOverlayDirty(); }, 3000);
    // Scroll canvas to room center
    const bounds = calcRoomBounds(roomId);
    if (bounds) {
      const container = document.querySelector('.canvas-container');
      if (container) {
        const cx = ((bounds.c1 + bounds.c2 + 1) / 2) * CELL * zoomLevel;
        const cy = ((bounds.r1 + bounds.r2 + 1) / 2) * CELL * zoomLevel;
        container.scrollLeft = cx - container.clientWidth / 2;
        container.scrollTop = cy - container.clientHeight / 2;
      }
    }
    updateRoomList();
    markOverlayDirty();
    showToast(`📍 ${room.name} — ${bounds ? bounds.cells + ' ô' : ''}`);
  };


  // Delete room — reset area + surrounding walls to default floor tile
  window.deleteRoom = function(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    saveHistoryAtomic();
    // Find bounding box of room cells
    let minR = mapHeight, maxR = 0, minC = mapWidth, maxC = 0;
    for (let r = 0; r < mapHeight; r++) {
      for (let c = 0; c < mapWidth; c++) {
        if (roomMap[r][c] === roomId) {
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (c < minC) minC = c;
          if (c > maxC) maxC = c;
        }
      }
    }
    // Expand bbox by 1 to include surrounding walls
    const er1 = Math.max(0, minR - 1);
    const ec1 = Math.max(0, minC - 1);
    const er2 = Math.min(mapHeight - 1, maxR + 1);
    const ec2 = Math.min(mapWidth - 1, maxC + 1);
    // Reset all cells in expanded bbox to floor (walls + room interior + doors)
    for (let r = er1; r <= er2; r++) {
      for (let c = ec1; c <= ec2; c++) {
        const isRoomCell = roomMap[r][c] === roomId;
        const isWallOrDoor = grid[r][c] === WALL_TILE_ID || grid[r][c] === 4;
        if (isRoomCell || isWallOrDoor) {
          if (pendingCommand) recordCell(pendingCommand, currentFloorIdx, r, c, 'grid', grid[r][c], 0);
          grid[r][c] = 0;
        }
        if (roomMap[r][c] === roomId) {
          if (pendingCommand) recordCell(pendingCommand, currentFloorIdx, r, c, 'roomMap', roomId, null);
          roomMap[r][c] = null;
        }
      }
    }
    // Remove props in the area
    if (pendingCommand) recordPropsBefore(pendingCommand, currentFloorIdx);
    const floorProps = floors[currentFloorIdx].props;
    for (let i = floorProps.length - 1; i >= 0; i--) {
      const p = floorProps[i];
      if (p.r >= er1 && p.r <= er2 && p.c >= ec1 && p.c <= ec2) {
        floorProps.splice(i, 1);
      }
    }
    // Remove from rooms array
    const idx = rooms.findIndex(r => r.id === roomId);
    if (idx >= 0) rooms.splice(idx, 1);
    if (currentRoomId === roomId) currentRoomId = null;
    commitHistory();
    switchToFloor(currentFloorIdx); // refresh props ref
    updateRoomList(); updateStats(); validate(); markDirty();
    showToast(`🗑 Đã xóa phòng: ${room.name}`);
  };

  // Add room directly (without needing to select a room tile first)
  // ── DRAW ROOM MODE ──────────────────────────────────────
  let drawRoomMode = false;
  let drawRoomStart = null;
  let drawRoomEnd = null;

  window.addRoomDirect = function() {
    // Enter draw-room mode — disable painting
    drawRoomMode = true;
    isPainting = false;
    drawRoomStart = drawRoomEnd = null;
    canvas.style.cursor = 'crosshair';
    showToast('🏠 Kéo chuột trên canvas để vẽ vùng phòng');
  };

  function finishDrawRoom() {
    if (!drawRoomStart || !drawRoomEnd) { drawRoomMode = false; return; }
    const r1 = Math.min(drawRoomStart.row, drawRoomEnd.row);
    const c1 = Math.min(drawRoomStart.col, drawRoomEnd.col);
    const r2 = Math.max(drawRoomStart.row, drawRoomEnd.row);
    const c2 = Math.max(drawRoomStart.col, drawRoomEnd.col);
    const w = c2 - c1 + 1, h = r2 - r1 + 1;
    if (w < 2 || h < 2) {
      drawRoomStart = drawRoomEnd = null;
      showToast('⚠️ Phòng phải ít nhất 2×2');
      return;
    }
    // Show room popup
    showDrawRoomPopup(r1, c1, r2, c2);
  }

  function showDrawRoomPopup(r1, c1, r2, c2) {
    if (wizardRoomPopup) wizardRoomPopup.remove();
    const w = c2 - c1 + 1, h = r2 - r1 + 1;
    const interior = Math.max(0, w - 2) * Math.max(0, h - 2);
    const rect = canvas.getBoundingClientRect();

    const popup = document.createElement('div');
    popup.className = 'wiz-room-popup';
    // Position fixed — not clipped by canvas-container overflow
    popup.style.position = 'fixed';
    popup.style.zIndex = '10000';
    const popupLeft = Math.min(window.innerWidth - 280, rect.left + (c2 + 1) * CELL * zoomLevel + 10);
    const popupTop = Math.max(60, rect.top + r1 * CELL * zoomLevel);
    popup.style.left = popupLeft + 'px';
    popup.style.top = popupTop + 'px';

    const defaultName = 'Phòng ' + (rooms.length + 1);
    const colorIdx = rooms.length % ROOM_COLORS.length;

    popup.innerHTML = `
      <div class="wrp-header"><span class="ms-icon" style="color:var(--accent-teal);">home</span> Phòng mới <span style="color:#888;font-size:11px;margin-left:auto;">${w}×${h} · ${interior}m²</span></div>
      <label>Tên phòng:</label>
      <input type="text" id="drp-name" value="${defaultName}" autofocus>
      <label>Nền sàn:</label>
      <div class="floor-picker" id="drp-floor-picker"></div>
      <div style="display:flex;gap:8px;margin-top:10px;">
        <button class="wiz-btn" onclick="cancelDrawRoom()" style="flex:1;">✕ Hủy</button>
        <button class="wiz-btn primary" onclick="confirmDrawRoom(${r1},${c1},${r2},${c2})" style="flex:1;">✓ Tạo phòng</button>
      </div>
    `;

    document.body.appendChild(popup);
    wizardRoomPopup = popup;

    // Build floor picker
    const FLOOR_OPTIONS = [
      { id: 0, name: 'Sàn', key: 'floorTile' },
      { id: 27, name: 'Y tế', key: 'floorClinic' },
      { id: 28, name: 'Grooming', key: 'floorGrooming' },
      { id: 29, name: 'Retro', key: 'floorRetro' },
      { id: 30, name: 'Phẫu thuật', key: 'floorSurgery' },
      { id: 31, name: 'Sàn gỗ', key: 'floorWood' },
      { id: 6, name: 'Sân cỏ', key: 'grass' },
      { id: 5, name: 'Ban công', key: 'balcony' },
    ];
    const picker = popup.querySelector('#drp-floor-picker');
    FLOOR_OPTIONS.forEach((opt, i) => {
      const btn = document.createElement('div');
      btn.className = 'floor-pick' + (i === 0 ? ' active' : '');
      btn.dataset.floorId = opt.id;
      const img = images[opt.key];
      if (img && img.complete && img.naturalWidth > 0) {
        btn.innerHTML = `<img src="${img.src}" style="width:24px;height:24px;border-radius:4px;image-rendering:pixelated;"><span style="font-size:8px;margin-top:1px;">${opt.name}</span>`;
      } else {
        btn.innerHTML = `<span class="ms-icon" style="font-size:20px;">crop_square</span><span style="font-size:8px;">${opt.name}</span>`;
      }
      btn.onclick = () => {
        picker.querySelectorAll('.floor-pick').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
      picker.appendChild(btn);
    });

    // Focus name input
    setTimeout(() => popup.querySelector('#drp-name')?.select(), 100);
  }

  window.cancelDrawRoom = function() {
    if (wizardRoomPopup) { wizardRoomPopup.remove(); wizardRoomPopup = null; }
    drawRoomStart = drawRoomEnd = null;
    drawRoomMode = false;
    canvas.style.cursor = 'crosshair';
    markOverlayDirty();
  };

  window.confirmDrawRoom = function(r1, c1, r2, c2) {
    const nameInput = document.getElementById('drp-name');
    const name = nameInput ? nameInput.value.trim() : 'Phòng';
    const activePick = wizardRoomPopup?.querySelector('.floor-pick.active');
    const floorTileId = activePick ? parseInt(activePick.dataset.floorId) : 0;
    const colorIdx = rooms.length % ROOM_COLORS.length;
    const roomId = 'room_' + Date.now();
    const color = hexToRgba(ROOM_COLORS[colorIdx], 0.22);

    // Create room
    floors[currentFloorIdx].rooms.push({ id: roomId, name, color });

    // Paint walls on border, floor inside, assign roomMap
    // Smart walls: skip if adjacent cell already has a wall (avoid double walls)
    saveHistoryAtomic();
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        const isBorder = r === r1 || r === r2 || c === c1 || c === c2;
        if (isBorder) {
          const existing = grid[r][c];
          // Skip if already a wall or door — reuse existing wall
          if (existing === WALL_TILE_ID || existing === 4) continue;
          if (pendingCommand) recordCell(pendingCommand, currentFloorIdx, r, c, 'grid', existing, WALL_TILE_ID);
          grid[r][c] = WALL_TILE_ID;
        } else {
          // Interior: set floor + room
          if (pendingCommand) recordCell(pendingCommand, currentFloorIdx, r, c, 'grid', grid[r][c], floorTileId);
          grid[r][c] = floorTileId;
          if (pendingCommand) recordCell(pendingCommand, currentFloorIdx, r, c, 'roomMap', roomMap[r][c], roomId);
          roomMap[r][c] = roomId;
        }
      }
    }
    // Auto-place door: find best spot on border (prefer shared wall, else bottom center)
    let doorPlaced = false;
    // Try bottom wall center first
    const doorC = Math.floor((c1 + c2) / 2);
    if (doorC > c1 && doorC < c2 && grid[r2][doorC] === WALL_TILE_ID) {
      if (pendingCommand) recordCell(pendingCommand, currentFloorIdx, r2, doorC, 'grid', WALL_TILE_ID, 4);
      grid[r2][doorC] = 4;
      doorPlaced = true;
    }
    // If bottom center already a door or couldn't place, try other spots
    if (!doorPlaced) {
      const trySpots = [
        [r1, Math.floor((c1+c2)/2)], // top center
        [Math.floor((r1+r2)/2), c2],  // right center
        [Math.floor((r1+r2)/2), c1],  // left center
      ];
      for (const [tr, tc] of trySpots) {
        if (tr > r1 && tr < r2 && tc > c1 && tc < c2) continue; // skip interior
        if (grid[tr][tc] === WALL_TILE_ID) {
          if (pendingCommand) recordCell(pendingCommand, currentFloorIdx, tr, tc, 'grid', WALL_TILE_ID, 4);
          grid[tr][tc] = 4;
          break;
        }
      }
    }
    commitHistory();

    // Cleanup
    if (wizardRoomPopup) { wizardRoomPopup.remove(); wizardRoomPopup = null; }
    drawRoomStart = drawRoomEnd = null;
    drawRoomMode = false;
    canvas.style.cursor = 'crosshair';

    switchToFloor(currentFloorIdx); // refresh refs
    updateRoomList(); updateStats(); validate(); markDirty();
    showToast(`✓ Đã tạo phòng: ${name}`);
  };

  const ROOM_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#f97316'];

  // ── SLIDERS ───────────────────────────────────────────────
  function bindSliders() {
    const wSlider = $('grid-w-slider');
    const hSlider = $('grid-h-slider');
    wSlider.addEventListener('input', () => {
      $('grid-width-value').textContent = wSlider.value;
    });
    hSlider.addEventListener('input', () => {
      $('grid-height-value').textContent = hSlider.value;
    });
  }

  window.applyGridSize = function () {
    const nw = parseInt($('grid-w-slider').value);
    const nh = parseInt($('grid-h-slider').value);
    if (nw === mapWidth && nh === mapHeight) return;
    const oldW = mapWidth, oldH = mapHeight;
    mapWidth = nw; mapHeight = nh;
    // Resize all floors
    floors.forEach(f => {
      const newG  = [];
      const newRm = [];
      for (let r = 0; r < mapHeight; r++) {
        const gr = [], rr = [];
        for (let c = 0; c < mapWidth; c++) {
          gr.push((r < oldH && c < oldW) ? f.grid[r][c]    : 0);
          rr.push((r < oldH && c < oldW) ? f.roomMap[r][c] : null);
        }
        newG.push(gr); newRm.push(rr);
      }
      f.grid    = newG;
      f.roomMap = newRm;
    });
    switchToFloor(currentFloorIdx);
    resizeCanvas();
    showToast(`Đã đổi sang ${nw}×${nh}`);
  };

  function resizeCanvas() {
    canvas.width  = mapWidth  * CELL;
    canvas.height = mapHeight * CELL;
    // Re-apply zoom so CSS size matches new canvas resolution
    setZoom(zoomLevel);
    markDirty();
  }

  // ── BRUSH ─────────────────────────────────────────────────
  window.setBrush = function (size) {
    brushSize = size;
    document.querySelectorAll('.brush-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('brush-' + size).classList.add('active');
    markDirty();
  };

  // ── EVENTS ────────────────────────────────────────────────
  function bindEvents() {
    canvas.addEventListener('mousedown',  onMouseDown);
    canvas.addEventListener('mousemove',  onMouseMove);
    canvas.addEventListener('mouseleave', () => { hoverCol = -1; hoverRow = -1; markOverlayDirty(); });
    window.addEventListener('mouseup',    (e) => {
      // Wizard step 3: finish room/wall drag (skip if popup is open or click was on popup)
      if (wizardActive && wizardStep === 3 && wizardDragStart && !wizardRoomPopup) {
        // Don't trigger if click landed on a UI element (not canvas)
        if (e.target === canvas || canvas.contains(e.target)) {
          wizardFinishRoomDrag();
          return;
        }
        // Click was outside canvas — cancel drag
        wizardDragStart = wizardDragEnd = null;
        markOverlayDirty();
        return;
      }
      if (isPainting) { isPainting = false; commitHistory(); }
      if (selectMode) { selectMode = false; }
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   () => { isPainting = false; commitHistory(); });

    // Zoom: Ctrl+scroll or pinch (trackpad sends ctrlKey=true for pinch)
    // Normal scroll = pan canvas (default browser behavior)
    canvas.addEventListener('wheel', e => {
      if (!e.ctrlKey && !e.metaKey) return; // let normal scroll pass through
      e.preventDefault();
      // Pinch/Ctrl+scroll: smooth zoom toward cursor
      const rect = canvas.getBoundingClientRect();
      const cursorX = (e.clientX - rect.left) / zoomLevel;
      const cursorY = (e.clientY - rect.top) / zoomLevel;
      const container = document.querySelector('.canvas-container');
      const oldZoom = zoomLevel;
      const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      setZoom(zoomLevel * factor);
      // Keep cursor position stable after zoom
      if (container) {
        const ratio = zoomLevel / oldZoom;
        container.scrollLeft += cursorX * (ratio - 1) * oldZoom;
        container.scrollTop  += cursorY * (ratio - 1) * oldZoom;
      }
    }, { passive: false });

    // Keyboard shortcuts
    window.addEventListener('keydown', e => {
      // Don't fire when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Undo: Ctrl+Z or Z
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); return; }
      if (!e.ctrlKey && !e.metaKey && e.key === 'z') { undo(); return; }

      // Redo: Ctrl+Shift+Z or Ctrl+Y or Shift+Z
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') { e.preventDefault(); redo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); return; }
      if (!e.ctrlKey && !e.metaKey && e.key === 'Z') { redo(); return; }

      // Zoom: + / -
      if (e.key === '=' || e.key === '+') { zoomIn(); return; }
      if (e.key === '-' || e.key === '_') { zoomOut(); return; }
      if (e.key === '0') { zoomReset(); return; }

      // Brush size: [ and ]
      if (e.key === '[') { const s = Math.max(1, brushSize - 1); window.setBrush(s); return; }
      if (e.key === ']') { const s = Math.min(3, brushSize + 1); window.setBrush(s); return; }

      // Fill mode: F
      if (e.key === 'f' || e.key === 'F') { window.toggleFill(); return; }

      // Quick tile select: 1-8 → recent tiles, 9 = eraser (tile 0)
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 9) {
        if (num === 9) { selectTile(0); return; }
        if (recentTiles.length > 0 && num <= recentTiles.length) {
          selectTile(recentTiles[num - 1]);
        } else {
          // Fallback: default quick tiles if no recent history
          const quickTiles = [1, 0, 2, 3, 4, 5, 6, 7];
          const tid = quickTiles[num - 1];
          if (tid !== undefined) selectTile(tid);
        }
        return;
      }

      // Escape: exit fill mode
      // Eyedropper: E
      if (e.key === 'e' || e.key === 'E') { window.toggleEyedropper(); return; }

      // Grid toggle: G
      if (e.key === 'g' || e.key === 'G') { window.toggleGrid(); return; }

      // Copy/Cut/Paste: Ctrl+C, Ctrl+X, Ctrl+V
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') { e.preventDefault(); copySelection(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') { e.preventDefault(); cutSelection(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') { e.preventDefault(); startPaste(); return; }

      // Clipboard transforms (while clipboard exists)
      if (clipboard && (e.key === 'r' || e.key === 'R') && !e.ctrlKey) { rotateClipboardCW(); return; }
      if (clipboard && (e.key === 'h' || e.key === 'H') && !e.ctrlKey) { flipClipboardH(); return; }
      if (clipboard && e.key === 'v' && !e.ctrlKey && !e.metaKey) { flipClipboardV(); return; }
      // Stamp tool: S
      if (e.key === 's' && !e.ctrlKey && !e.metaKey) { toggleStamp(); return; }

      // Escape: exit fill/eyedropper/paste mode
      if (e.key === 'Escape' && fillMode) { window.toggleFill(); return; }
      if (e.key === 'Escape' && eyedropperMode) { window.toggleEyedropper(); return; }
      if (e.key === 'Escape' && drawRoomMode) { cancelDrawRoom(); return; }
      if (e.key === 'Escape' && pasteMode) { cancelPaste(); return; }
      if (e.key === 'Escape' && (selStart || selEnd)) { selStart = selEnd = null; markDirty(); return; }

    });
  }

  function cellAt(e) {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    return {
      col: Math.floor(((e.clientX - rect.left) * sx) / CELL),
      row: Math.floor(((e.clientY - rect.top)  * sy) / CELL),
    };
  }

  function onMouseDown(e) {
    // Draw room mode: click-click (not drag)
    if (drawRoomMode && !wizardRoomPopup) {
      const { col, row } = cellAt(e);
      if (!drawRoomStart) {
        // First click: set start point
        drawRoomStart = { col, row };
        drawRoomEnd = { col, row };
        showToast('📍 Điểm 1 đã đặt — di chuột rồi click lần nữa');
      } else {
        // Second click: finalize rectangle
        drawRoomEnd = { col, row };
        finishDrawRoom();
      }
      return;
    }
    // Design mode tools
    if (wizardActive && wizardStep === 3 && !wizardRoomPopup) {
      const { col, row } = cellAt(e);
      if (designTool === 'door') {
        handleDoorToggle(row, col);
        return;
      }
      // Room or Wall tool: start drag
      wizardDragStart = { col, row };
      wizardDragEnd = { col, row };
      return;
    }
    if (previewMode) {
      const { col, row } = cellAt(e);
      previewClickMove(col, row);
      return;
    }
    // Paste mode: click to stamp
    if (pasteMode) {
      const { col, row } = cellAt(e);
      doStampPaste(col, row);
      return;
    }
    // Eyedropper: Alt+click or eyedropper mode
    if (e.altKey || eyedropperMode) {
      const { col, row } = cellAt(e);
      if (col >= 0 && col < mapWidth && row >= 0 && row < mapHeight) {
        const picked = grid[row][col];
        selectTile(picked);
        const td = getTile(picked);
        showToast('👁️ ' + (td ? td.name : 'Tile ' + picked));
        if (eyedropperMode) { eyedropperMode = false; const btn = $('eyedropper-btn'); if (btn) btn.classList.remove('active'); canvas.style.cursor = 'crosshair'; }
      }
      return;
    }
    // Ctrl+drag: selection mode
    if (e.ctrlKey || e.metaKey) {
      const { col, row } = cellAt(e);
      selectMode = true;
      selStart = { col, row };
      selEnd   = { col, row };
      markDirty();
      return;
    }
    // Fill mode
    if (fillMode) {
      const { col, row } = cellAt(e);
      if (col >= 0 && col < mapWidth && row >= 0 && row < mapHeight) {
        floodFill(col, row, currentTileId);
      }
      return;
    }
    isPainting = true;
    paintValue = (e.button === 2 || e.shiftKey) ? 0 : currentTileId;
    const { col, row } = cellAt(e);
    saveHistory();
    paintAt(col, row, paintValue);
  }

  function onMouseMove(e) {
    if (previewMode) return;
    const { col, row } = cellAt(e);
    // Draw room mode: update drag end
    if (drawRoomMode && drawRoomStart) {
      drawRoomEnd = { col, row };
      markOverlayDirty();
      return;
    }
    // Wizard step 3: drag tracking
    if (wizardActive && wizardStep === 3 && wizardDragStart) {
      wizardDragEnd = { col, row };
      markOverlayDirty();
      return;
    }
    if (col !== hoverCol || row !== hoverRow) { hoverCol = col; hoverRow = row; markOverlayDirty(); }
    // Update selection drag
    if (selectMode && selStart) {
      selEnd = { col, row };
      markOverlayDirty();
    }
    // Update paste ghost
    if (pasteMode) {
      pasteCursor = { col, row };
      markDirty();
    }
    if (isPainting) paintAt(col, row, paintValue);
    showHoverTooltip(e, col, row);
  }

  // ── Hover tooltip ───────────────────────────────────────────
  let tooltipEl = null;
  function getTooltipEl() {
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'editor-tooltip';
      tooltipEl.style.cssText = `
        position:fixed; background:rgba(17,24,39,0.92); backdrop-filter:blur(8px);
        border:1px solid rgba(255,255,255,0.12); border-radius:8px;
        padding:5px 10px; font-size:11px; font-family:'Inter',sans-serif;
        color:#e5e7eb; pointer-events:none; z-index:500; white-space:nowrap;
        transition:opacity 0.15s ease; box-shadow:0 4px 16px rgba(0,0,0,0.4);
      `;
      document.body.appendChild(tooltipEl);
    }
    return tooltipEl;
  }

  function showHoverTooltip(e, col, row) {
    if (col < 0 || col >= mapWidth || row < 0 || row >= mapHeight) {
      if (tooltipEl) tooltipEl.style.opacity = '0'; return;
    }
    const tileId  = grid[row][col];
    const roomId  = roomMap[row][col];
    const tileDef = getTile(tileId);
    let text = tileDef ? tileDef.name : '';
    if (roomId) {
      const room = rooms.find(r => r.id === roomId);
      if (room) text += '  ·  🏠 ' + room.name;
    }
    if (!text) { if (tooltipEl) tooltipEl.style.opacity = '0'; return; }
    const el = getTooltipEl();
    el.textContent = text;
    // Hide tooltip on mobile (touch devices don't need hover tooltip)
    if (window.innerWidth <= 768) { el.style.opacity = '0'; return; }
    el.style.left  = (e.clientX + 14) + 'px';
    el.style.top   = (e.clientY + 18) + 'px'; // below cursor, not above
    el.style.opacity = '1';
  }


  function onTouchStart(e) {
    e.preventDefault();
    const t = e.touches[0];
    const fakeE = { clientX: t.clientX, clientY: t.clientY, button: 0, target: canvas };
    const { col, row } = cellAt(fakeE);

    // Draw room mode: first tap = set start point
    if (drawRoomMode && !wizardRoomPopup) {
      if (!drawRoomStart) {
        drawRoomStart = { col, row };
        drawRoomEnd = { col, row };
      } else {
        // Second tap = finish
        drawRoomEnd = { col, row };
        finishDrawRoom();
      }
      return;
    }

    isPainting = true; paintValue = currentTileId;
    saveHistory();
    paintAt(col, row, paintValue);
  }

  function onTouchMove(e) {
    e.preventDefault();
    const t = e.touches[0];
    const { col, row } = cellAt({ clientX: t.clientX, clientY: t.clientY });

    // Draw room mode: update preview
    if (drawRoomMode && drawRoomStart) {
      drawRoomEnd = { col, row };
      markOverlayDirty();
      return;
    }

    if (!isPainting) return;
    paintAt(col, row, paintValue);
  }

  // ── AUTO-EXPAND CANVAS ──────────────────────────────────
  // When painting near the edge (within 1 cell), expand by EXPAND_SIZE cells
  const EXPAND_SIZE = 2;
  const EXPAND_MAX = 80; // safety limit

  function autoExpandIfNeeded(col, row) {
    const half = Math.floor(brushSize / 2);
    const maxC = col + (brushSize - half - 1);
    const maxR = row + (brushSize - half - 1);
    const minC = col - half;
    const minR = row - half;

    let expandTop = 0, expandBottom = 0, expandLeft = 0, expandRight = 0;
    if (minR <= 0 && mapHeight < EXPAND_MAX) expandTop = EXPAND_SIZE;
    if (maxR >= mapHeight - 1 && mapHeight < EXPAND_MAX) expandBottom = EXPAND_SIZE;
    if (minC <= 0 && mapWidth < EXPAND_MAX) expandLeft = EXPAND_SIZE;
    if (maxC >= mapWidth - 1 && mapWidth < EXPAND_MAX) expandRight = EXPAND_SIZE;

    if (expandTop + expandBottom + expandLeft + expandRight === 0) return null;

    const newW = mapWidth + expandLeft + expandRight;
    const newH = mapHeight + expandTop + expandBottom;

    // Expand all floors
    floors.forEach(floor => {
      ensureFloorStructure(floor);
      // Expand grid
      const oldGrid = floor.grid;
      const oldRoom = floor.roomMap;
      const newGrid = [];
      const newRoom = [];
      for (let r = 0; r < newH; r++) {
        const gr = new Array(newW).fill(0);
        const rr = new Array(newW).fill(null);
        const srcR = r - expandTop;
        if (srcR >= 0 && srcR < mapHeight) {
          for (let c = 0; c < mapWidth; c++) {
            gr[c + expandLeft] = oldGrid[srcR][c];
            rr[c + expandLeft] = oldRoom[srcR] ? oldRoom[srcR][c] : null;
          }
        }
        newGrid.push(gr);
        newRoom.push(rr);
      }
      floor.grid = newGrid;
      floor.roomMap = newRoom;
      // Shift props
      if (floor.props) {
        floor.props.forEach(p => { p.r += expandTop; p.c += expandLeft; });
      }
    });

    mapWidth = newW;
    mapHeight = newH;
    // Re-bind current floor refs
    grid    = floors[currentFloorIdx].grid;
    roomMap = floors[currentFloorIdx].roomMap;
    rooms   = floors[currentFloorIdx].rooms;
    props   = floors[currentFloorIdx].props;

    // Update sliders
    const ws = $('grid-w-slider'), hs = $('grid-h-slider');
    if (ws) { ws.value = Math.min(newW, parseInt(ws.max)); $('grid-width-value').textContent = newW; }
    if (hs) { hs.value = Math.min(newH, parseInt(hs.max)); $('grid-height-value').textContent = newH; }
    resizeCanvas();
    setZoom(zoomLevel); // refresh zoom

    // Notify user about expansion
    const dirs = [];
    if (expandTop)    dirs.push('↑ trên');
    if (expandBottom) dirs.push('↓ dưới');
    if (expandLeft)   dirs.push('← trái');
    if (expandRight)  dirs.push('→ phải');
    showToast('📐 Canvas mở rộng ' + dirs.join(', ') + ' (+' + EXPAND_SIZE + ' ô) — ' + newW + '×' + newH);

    return { shiftCol: expandLeft, shiftRow: expandTop };
  }

  // ── PAINT ─────────────────────────────────────────────────
  function paintAt(col, row, value) {
    // Auto-expand canvas if painting near edge
    const shift = autoExpandIfNeeded(col, row);
    if (shift) {
      col += shift.shiftCol;
      row += shift.shiftRow;
    }

    const half = Math.floor(brushSize / 2);
    let changed = false;
    const cmd = pendingCommand;

    // Layer lock check
    const tdCheck = getTile(value);
    const isFloorVariant = tdCheck && tdCheck.floorImage;
    const isProp = value >= 10 && !isFloorVariant;
    if (isProp && layerState.props.locked) { showToast('🔒 Lớp Vật dụng đang bị khóa'); return; }
    if (!isProp && value === 1 && layerState.walls.locked) { showToast('🔒 Lớp Tường đang bị khóa'); return; }
    if (!isProp && value !== 1 && layerState.ground.locked) { showToast('🔒 Lớp Sàn đang bị khóa'); return; }

    for (let dr = -half; dr < brushSize - half; dr++) {
      for (let dc = -half; dc < brushSize - half; dc++) {
        const r = row + dr, c = col + dc;
        if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) continue;

        if (isProp) {
          // Props layer — use find by ID since IDs may have gaps
          const td = tdCheck;
          if (!td || !td.propType) continue;
          if (cmd) recordPropsBefore(cmd, currentFloorIdx);
          const floorProps = floors[currentFloorIdx].props;
          const exIdx = floorProps.findIndex(p => p.r === r && p.c === c);
          if (exIdx >= 0) floorProps.splice(exIdx, 1);
          if (td.propType !== 'clear') {
            floorProps.push({ r, c, type: td.propType });
          }
          changed = true;
        } else {
          // Ground tile layer
          if (grid[r][c] !== value) {
            if (cmd) recordCell(cmd, currentFloorIdx, r, c, 'grid', grid[r][c], value);
            grid[r][c] = value; changed = true;
          }
          // Room assignment
          if (value === 0) {
            const oldRoom = roomMap[r][c];
            if (oldRoom !== null && cmd) recordCell(cmd, currentFloorIdx, r, c, 'roomMap', oldRoom, null);
            roomMap[r][c] = null;
          } else if ([5, 7, 8, 9].includes(value) && currentRoomId) {
            const oldRoom = roomMap[r][c];
            if (oldRoom !== currentRoomId && cmd) recordCell(cmd, currentFloorIdx, r, c, 'roomMap', oldRoom, currentRoomId);
            roomMap[r][c] = currentRoomId;
          }
        }
      }
    }
    if (changed) {
      autoLinkStairs(col, row, value);
      updateStats(); validate(); markDirty();
    }
  }

  function autoLinkStairs(col, row, value) {
    const nextFloorIdx = (value === 2) ? currentFloorIdx + 1 : (value === 3 ? currentFloorIdx - 1 : -1);
    if (nextFloorIdx < 0 || nextFloorIdx >= floors.length) return;
    const targetTile = (value === 2) ? 3 : 2; // UP→DOWN on next, DOWN→UP on prev
    const half = Math.floor(brushSize / 2);
    const cmd = pendingCommand;
    for (let dr = -half; dr < brushSize - half; dr++) {
      for (let dc = -half; dc < brushSize - half; dc++) {
        const r = row + dr, c = col + dc;
        if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) continue;
        if (cmd) recordCell(cmd, nextFloorIdx, r, c, 'grid', floors[nextFloorIdx].grid[r][c], targetTile);
        floors[nextFloorIdx].grid[r][c] = targetTile;
      }
    }
    showToast(value === 2 ? '↑ Đã nối cầu thang lên tầng ' + (nextFloorIdx + 1) : '↓ Đã nối cầu thang xuống tầng ' + (nextFloorIdx + 1));
  }

  // ── RAF LOOP ──────────────────────────────────────────────
  function rafLoop(now) {
    stairsPulse = now;
    // In preview mode, continuously redraw for smooth animation
    if (previewMode) {
      updatePreviewPlayer(now);
      needsRedraw = true;
    }
    // Stairs pulse animation requires overlay redraw (not static rebuild)
    if (!previewMode && !needsRedraw) {
      // Only request overlay redraw ~15fps for stairs animation (cheap)
      if (now - (rafLoop._lastStairs || 0) > 66) {
        rafLoop._lastStairs = now;
        needsRedraw = true;
      }
    }
    if (needsRedraw) { render(now); needsRedraw = false; }
    requestAnimationFrame(rafLoop);
  }

  function markDirty() {
    invalidateStatic();
    scheduleAutoSave();
  }

  // ── GRID TOGGLE ─────────────────────────────────────────
  let showGrid = true;
  window.toggleGrid = function() {
    showGrid = !showGrid;
    layerState.grid.visible = showGrid;
    const btn = $('grid-toggle-btn');
    if (btn) btn.classList.toggle('active', showGrid);
    syncLayerUI();
    markDirty();
    showToast(showGrid ? 'Lưới: Bật' : 'Lưới: Tắt');
  };

  // ── LAYER SYSTEM ──────────────────────────────────────────
  const layerState = {
    walls:  { visible: true, locked: false },
    ground: { visible: true, locked: false },
    props:  { visible: true, locked: false },
    rooms:  { visible: true, locked: false },
    grid:   { visible: true, locked: false },
  };

  function syncLayerUI() {
    for (const [name, state] of Object.entries(layerState)) {
      const item = document.querySelector(`.layer-item[data-layer="${name}"]`);
      if (!item) continue;
      const visBtn  = item.querySelector('.layer-vis');
      const lockBtn = item.querySelector('.layer-lock');
      item.classList.toggle('hidden', !state.visible);
      item.classList.toggle('locked', state.locked);
      if (visBtn) {
        visBtn.classList.toggle('active', state.visible);
        visBtn.querySelector('.ms-icon').textContent = state.visible ? 'visibility' : 'visibility_off';
      }
      if (lockBtn) {
        lockBtn.classList.toggle('locked', state.locked);
        lockBtn.querySelector('.ms-icon').textContent = state.locked ? 'lock' : 'lock_open';
      }
    }
  }

  window.toggleLayerVis = function(name) {
    const s = layerState[name];
    if (!s) return;
    s.visible = !s.visible;
    // Sync built-in toggles
    if (name === 'grid') showGrid = s.visible;
    syncLayerUI();
    markDirty();
    const labels = { walls:'Tường', ground:'Sàn', props:'Vật dụng', rooms:'Phòng', grid:'Lưới' };
    showToast(`${labels[name]}: ${s.visible ? 'Hiện' : 'Ẩn'}`);
  };

  window.toggleLayerLock = function(name) {
    const s = layerState[name];
    if (!s) return;
    s.locked = !s.locked;
    syncLayerUI();
    const labels = { walls:'Tường', ground:'Sàn', props:'Vật dụng', rooms:'Phòng', grid:'Lưới' };
    showToast(`${labels[name]}: ${s.locked ? '🔒 Đã khóa' : '🔓 Đã mở khóa'}`);
  };

  // Check if painting is allowed on a layer
  function isLayerEditable(tileId) {
    // Wall tile
    if (tileId === 1 && layerState.walls.locked) return false;
    // Props (handled separately, not via tileId)
    // Ground/room tiles
    if (tileId !== 1 && layerState.ground.locked) return false;
    return true;
  }
  function isPropsEditable() { return !layerState.props.locked; }

  // ── AUTO-SAVE ─────────────────────────────────────────
  const AUTO_SAVE_KEY = 'mapEditor_autosave';
  let autoSaveTimer = null;

  function scheduleAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(doAutoSave, AUTOSAVE_DELAY);
  }

  function doAutoSave() {
    try {
      const data = JSON.stringify({
        floors: JSON.parse(JSON.stringify(floors)),
        mapWidth, mapHeight, currentFloorIdx,
        savedAt: Date.now()
      });
      localStorage.setItem(AUTO_SAVE_KEY, data);
      const indicator = $('autosave-indicator');
      if (indicator) {
        indicator.textContent = '✓ Đã lưu';
        indicator.style.opacity = '1';
        clearTimeout(indicator._t);
        indicator._t = setTimeout(() => { indicator.style.opacity = '0'; }, 2000);
      }
    } catch(e) { /* storage full or disabled */ }
  }

  function restoreAutoSave() {
    try {
      const raw = localStorage.getItem(AUTO_SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data.floors || !data.floors.length) return false;
      floors = data.floors;
      floors.forEach(ensureFloorStructure);
      mapWidth = data.mapWidth || mapWidth;
      mapHeight = data.mapHeight || mapHeight;
      // Update sliders
      const wSlider = $('grid-w-slider');
      const hSlider = $('grid-h-slider');
      if (wSlider) { wSlider.value = mapWidth; $('grid-width-value').textContent = mapWidth; }
      if (hSlider) { hSlider.value = mapHeight; $('grid-height-value').textContent = mapHeight; }
      switchToFloor(Math.min(data.currentFloorIdx || 0, floors.length - 1));
      resizeCanvas();
      const age = Math.round((Date.now() - data.savedAt) / 60000);
      showToast('↩ Đã khôi phục bản lưu (' + age + ' phút trước)');
      return true;
    } catch(e) { return false; }
  }

  window.clearAutoSave = function() {
    localStorage.removeItem(AUTO_SAVE_KEY);
    showToast('Đã xóa bản lưu tự động');
  };

  // ── IMPORT JSON ────────────────────────────────────────
  window.openImport = function() {
    $('import-modal').classList.add('open');
    $('import-textarea').value = '';
    $('import-textarea').focus();
  };
  window.closeImport = function() {
    $('import-modal').classList.remove('open');
  };
  window.doImport = function() {
    const raw = $('import-textarea').value.trim();
    if (!raw) return;
    try {
      const obj = JSON.parse(raw);
      if (!obj.floors || !Array.isArray(obj.floors)) throw new Error('Invalid format');
      // Import replaces everything — use snapshot command
      const snapshotBefore = JSON.parse(JSON.stringify({ floors, mapWidth, mapHeight }));
      mapWidth  = obj.width  || mapWidth;
      mapHeight = obj.height || mapHeight;
      floors = obj.floors.map(f => ensureFloorStructure({
        name:    f.name    || 'Tầng',
        grid:    f.grid    || [],
        roomMap: f.roomMap || (f.grid ? f.grid.map(r => r.map(() => null)) : []),
        rooms:   f.rooms   || [],
        props:   f.props   || []
      }));
      const snapshotAfter = JSON.parse(JSON.stringify({ floors, mapWidth, mapHeight }));
      // Push a special snapshot command for import (full replacement)
      undoStack.push({ type: 'snapshot', old: snapshotBefore, new: snapshotAfter });
      if (undoStack.length > HISTORY_MAX) undoStack.shift();
      redoStack = [];
      updateUndoRedoBtns();
      const wSlider = $('grid-w-slider');
      const hSlider = $('grid-h-slider');
      if (wSlider) { wSlider.value = mapWidth; $('grid-width-value').textContent = mapWidth; }
      if (hSlider) { hSlider.value = mapHeight; $('grid-height-value').textContent = mapHeight; }
      switchToFloor(0);
      resizeCanvas();
      closeImport();
      showToast('✅ Import thành công!');
    } catch(e) {
      showToast('❌ JSON không hợp lệ: ' + e.message);
    }
  };
  // Close import modal on backdrop click
  document.addEventListener('click', e => {
    const modal = $('import-modal');
    if (modal && e.target === modal) closeImport();
  });

  // ── EYEDROPPER ───────────────────────────────────────────
  let eyedropperMode = false;
  window.toggleEyedropper = function() {
    eyedropperMode = !eyedropperMode;
    const btn = $('eyedropper-btn');
    if (btn) btn.classList.toggle('active', eyedropperMode);
    canvas.style.cursor = eyedropperMode ? 'crosshair' : (fillMode ? 'cell' : 'crosshair');
    showToast(eyedropperMode ? '👁️ Eyedropper ON (Alt+click)' : 'Eyedropper OFF');
  };

  // ── TOOLBAR MORE MENU ──────────────────────────────────────
  window.toggleToolbarMore = function() {
    const menu = $('tb-more-menu');
    if (!menu) return;
    const isOpen = menu.style.display === 'block';
    menu.style.display = isOpen ? 'none' : 'block';
  };
  // Close more menu on click outside
  document.addEventListener('click', e => {
    const menu = $('tb-more-menu');
    if (!menu || menu.style.display !== 'block') return;
    if (!e.target.closest('.tb-more-wrap')) menu.style.display = 'none';
  });
  // Show/hide clipboard tools based on clipboard content
  function updateClipboardToolsVis() {
    const el = $('clipboard-tools');
    if (el) el.style.display = clipboard ? '' : 'none';
  }

  // ── MINI-MAP ──────────────────────────────────────────────
  let showMiniMap = true;
  window.toggleMiniMap = function() {
    showMiniMap = !showMiniMap;
    const btn = $('minimap-btn');
    if (btn) btn.classList.toggle('active', showMiniMap);
    const mm = $('mini-map-canvas');
    if (mm) mm.style.display = showMiniMap ? 'block' : 'none';
    markDirty();
  };

  function drawMiniMap() {
    const mm = $('mini-map-canvas');
    if (!mm || !showMiniMap) return;
    const mmCtx = mm.getContext('2d');
    const W = mm.width, H = mm.height;
    const cellW = W / mapWidth, cellH = H / mapHeight;
    mmCtx.clearRect(0, 0, W, H);
    mmCtx.fillStyle = '#0d1120';
    mmCtx.fillRect(0, 0, W, H);
    for (let r = 0; r < mapHeight; r++) {
      for (let c = 0; c < mapWidth; c++) {
        const t = grid[r][c];
        const td = getTile(t);
        mmCtx.fillStyle = td ? td.color : '#0d1120';
        mmCtx.fillRect(Math.floor(c * cellW), Math.floor(r * cellH),
                       Math.ceil(cellW) + 1, Math.ceil(cellH) + 1);
      }
    }
    // Viewport indicator
    const container = document.querySelector('.canvas-container');
    if (container) {
      const vx = container.scrollLeft / (canvas.width * zoomLevel);
      const vy = container.scrollTop  / (canvas.height * zoomLevel);
      const vw = container.clientWidth  / (canvas.width * zoomLevel);
      const vh = container.clientHeight / (canvas.height * zoomLevel);
      mmCtx.strokeStyle = 'rgba(6,182,212,0.8)';
      mmCtx.lineWidth = 1;
      mmCtx.strokeRect(vx * W, vy * H, vw * W, vh * H);
    }
  }

  // ── RENDER (offscreen-cached static + dynamic overlay) ────
  // Static passes (ground, props, AO, walls, grid lines) are expensive
  // and only need redrawing when map data changes. They are cached in an
  // offscreen canvas and stamped onto the visible canvas each frame.
  // Dynamic passes (hover, selection, paste ghost, player, minimap) are
  // drawn on top every frame — these are cheap.

  function renderStaticLayers(cx, now) {
    cx.clearRect(0, 0, canvas.width, canvas.height);

    // Pass 1: Ground tiles + room overlays
    if (layerState.ground.visible) {
      for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
          const tileId = grid[r][c];
          const rid = layerState.rooms.visible ? roomMap[r][c] : null;
          if (tileId !== 1) drawGroundTile(cx, c * CELL, r * CELL, tileId, rid);
        }
      }
    }

    // Pass 1.5: Props layer
    if (props && layerState.props.visible) {
      props.forEach(p => {
        const x = p.c * CELL;
        const y = p.r * CELL;
        const imgKey = 'prop_' + p.type;
        const propImg = images[imgKey];
        if (propImg && propImg.complete && propImg.naturalWidth > 0) {
          cx.drawImage(propImg, x + 1, y + 1, CELL - 2, CELL - 2);
        } else {
          cx.fillStyle = '#fff';
          cx.font = '20px sans-serif';
          cx.textAlign = 'center';
          let emj = '📦';
          if (p.type === 'bed') emj = '🛌';
          if (p.type === 'sofa') emj = '🛋';
          if (p.type === 'plant') emj = '🪴';
          if (p.type === 'table') emj = '🪑';
          if (p.type === 'vet_table') emj = '🩺';
          if (p.type === 'vet_cage') emj = '🐾';
          if (p.type === 'vet_xray') emj = '🩻';
          if (p.type === 'vet_cabinet') emj = '💊';
          if (p.type === 'reception_desk') emj = '🖥';
          if (p.type === 'waiting_chair') emj = '💺';
          if (p.type === 'microscope') emj = '🔬';
          if (p.type === 'iv_stand') emj = '💉';
          if (p.type === 'grooming_table') emj = '🪥';
          if (p.type === 'surgical_sink') emj = '🧼';
          if (p.type === 'ultrasound') emj = '📡';
          if (p.type === 'vaccine_fridge') emj = '🧊';
          cx.fillText(emj, x + CELL / 2, y + CELL / 2 + 7);
          cx.textAlign = 'left';
        }
      });
    }

    // Passes 2-4: Walls (AO, front/side faces, top faces) — skip if walls hidden
    if (layerState.walls.visible) {
      // Pass 2: Ambient occlusion
      for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
          if (grid[r][c] !== 1) continue;
          const x = c * CELL, y = r * CELL;
          if (r + 1 < mapHeight && grid[r + 1][c] !== 1) {
            cx.fillStyle = 'rgba(0,0,0,0.22)'; cx.fillRect(x, y + CELL, CELL, 5);
          }
          if (c + 1 < mapWidth && grid[r][c + 1] !== 1) {
            cx.fillStyle = 'rgba(0,0,0,0.12)'; cx.fillRect(x + CELL, y, 4, CELL);
          }
        }
      }

      // Pass 3: Wall front + side faces (bottom-up)
      for (let r = mapHeight - 1; r >= 0; r--) {
        for (let c = 0; c < mapWidth; c++) {
          if (grid[r][c] !== 1) continue;
          const x = c * CELL, y = r * CELL;
          const showFront = r + 1 >= mapHeight || grid[r + 1][c] !== 1;
          const showRight = c + 1 >= mapWidth  || grid[r][c + 1] !== 1;
          if (showFront) {
            if (images.wallSide) cx.drawImage(images.wallSide, x, y + CELL, CELL, 12);
            else { cx.fillStyle = '#3a2210'; cx.fillRect(x, y + CELL, CELL, 12); }
            const fg = cx.createLinearGradient(x, y + CELL, x, y + CELL + 12);
            fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(0,0,0,0.55)');
            cx.fillStyle = fg; cx.fillRect(x, y + CELL, CELL, 12);
          }
          if (showRight) {
            cx.save(); cx.globalAlpha = 0.65;
            if (images.wallSide) cx.drawImage(images.wallSide, x + CELL, y, 6, CELL);
            else { cx.fillStyle = '#251608'; cx.fillRect(x + CELL, y, 6, CELL); }
            cx.restore();
            const rg = cx.createLinearGradient(x + CELL, y, x + CELL + 6, y);
            rg.addColorStop(0, 'rgba(0,0,0,0.48)'); rg.addColorStop(1, 'rgba(0,0,0,0.82)');
            cx.fillStyle = rg; cx.fillRect(x + CELL, y, 6, CELL);
          }
        }
      }

      // Pass 4: Wall top faces
      for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
          if (grid[r][c] !== 1) continue;
          const x = c * CELL, y = r * CELL;
          if (images.wall) cx.drawImage(images.wall, x, y, CELL, CELL);
          else { cx.fillStyle = '#7a6a5a'; cx.fillRect(x, y, CELL, CELL); }
          cx.fillStyle = 'rgba(255,245,220,0.1)'; cx.fillRect(x, y, CELL, 2); cx.fillRect(x, y, 2, CELL);
          cx.fillStyle = 'rgba(0,0,0,0.16)'; cx.fillRect(x + CELL - 2, y, 2, CELL); cx.fillRect(x, y + CELL - 2, CELL, 2);
        }
      }
    } // end walls visible

    // Pass 5: Grid lines
    if (showGrid) {
      cx.strokeStyle = 'rgba(255,255,255,0.15)'; cx.lineWidth = 0.5;
      for (let r = 0; r <= mapHeight; r++) {
        cx.beginPath(); cx.moveTo(0, r * CELL); cx.lineTo(mapWidth * CELL, r * CELL); cx.stroke();
      }
      for (let c = 0; c <= mapWidth; c++) {
        cx.beginPath(); cx.moveTo(c * CELL, 0); cx.lineTo(c * CELL, mapHeight * CELL); cx.stroke();
      }
    }
  }

  function render(now) {
    // Rebuild static cache if map data changed
    const { cv, cx } = getOffscreenCanvas();
    if (staticDirty) {
      renderStaticLayers(cx, now);
      staticDirty = false;
    }

    // Stamp cached static layers onto visible canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(cv, 0, 0);

    // ── Dynamic overlays (drawn every frame, cheap) ──

    // Stairs pulse animation (needs continuous redraw when stairs exist)
    // Re-render stairs cells on main ctx with current pulse
    if (!previewMode) {
      for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
          const t = grid[r][c];
          if (t === 2 || t === 3) {
            drawGroundTile(ctx, c * CELL, r * CELL, t, roomMap[r][c]);
          }
        }
      }
    }

    // Pass 5.9: Edge expand glow — hint user can expand canvas
    if (!previewMode && hoverCol >= 0 && hoverRow >= 0) {
      const half = Math.floor(brushSize / 2);
      const pulse = 0.25 + 0.2 * Math.sin(now / 400);
      const cw = canvas.width, ch = canvas.height;
      const nearTop    = (hoverRow - half) <= 0;
      const nearBottom = (hoverRow + brushSize - half - 1) >= mapHeight - 1;
      const nearLeft   = (hoverCol - half) <= 0;
      const nearRight  = (hoverCol + brushSize - half - 1) >= mapWidth - 1;
      if (nearTop || nearBottom || nearLeft || nearRight) {
        ctx.save();
        const glow = 6;
        if (nearTop) {
          const g = ctx.createLinearGradient(0, 0, 0, glow * CELL);
          g.addColorStop(0, `rgba(6,182,212,${pulse})`); g.addColorStop(1, 'transparent');
          ctx.fillStyle = g; ctx.fillRect(0, 0, cw, glow * CELL);
        }
        if (nearBottom) {
          const g = ctx.createLinearGradient(0, ch, 0, ch - glow * CELL);
          g.addColorStop(0, `rgba(6,182,212,${pulse})`); g.addColorStop(1, 'transparent');
          ctx.fillStyle = g; ctx.fillRect(0, ch - glow * CELL, cw, glow * CELL);
        }
        if (nearLeft) {
          const g = ctx.createLinearGradient(0, 0, glow * CELL, 0);
          g.addColorStop(0, `rgba(6,182,212,${pulse})`); g.addColorStop(1, 'transparent');
          ctx.fillStyle = g; ctx.fillRect(0, 0, glow * CELL, ch);
        }
        if (nearRight) {
          const g = ctx.createLinearGradient(cw, 0, cw - glow * CELL, 0);
          g.addColorStop(0, `rgba(6,182,212,${pulse})`); g.addColorStop(1, 'transparent');
          ctx.fillStyle = g; ctx.fillRect(cw - glow * CELL, 0, glow * CELL, ch);
        }
        // Arrow hint text
        ctx.fillStyle = `rgba(6,182,212,${pulse + 0.15})`;
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        if (nearRight) ctx.fillText('⊕ mở rộng →', cw - 40, ch / 2);
        if (nearBottom) { ctx.save(); ctx.fillText('⊕ mở rộng ↓', cw / 2, ch - 8); ctx.restore(); }
        if (nearLeft) ctx.fillText('← ⊕', 30, ch / 2);
        if (nearTop) ctx.fillText('⊕ ↑', cw / 2, 14);
        ctx.restore();
        needsRedraw = true; // keep animating glow
      }
    }

    // Pass 6: Hover preview (only in editor mode)
    if (!previewMode && hoverCol >= 0 && hoverRow >= 0) drawHoverPreview();

    // Pass 6.3: Highlighted room overlay (when clicking room in list)
    if (highlightedRoomId) {
      ctx.save();
      const pulse = 0.15 + 0.1 * Math.sin(Date.now() / 200); // pulsing effect
      ctx.fillStyle = `rgba(6,182,212,${pulse})`;
      ctx.strokeStyle = 'rgba(6,182,212,0.8)';
      ctx.lineWidth = 2;
      let hrMinR = mapHeight, hrMaxR = 0, hrMinC = mapWidth, hrMaxC = 0;
      for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
          if (roomMap[r][c] === highlightedRoomId) {
            ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
            if (r < hrMinR) hrMinR = r;
            if (r > hrMaxR) hrMaxR = r;
            if (c < hrMinC) hrMinC = c;
            if (c > hrMaxC) hrMaxC = c;
          }
        }
      }
      // Border around bounding box (expanded by 1 for walls)
      if (hrMinR <= hrMaxR) {
        const bx = Math.max(0, hrMinC - 1) * CELL;
        const by = Math.max(0, hrMinR - 1) * CELL;
        const bw = (Math.min(mapWidth, hrMaxC + 2) - Math.max(0, hrMinC - 1)) * CELL;
        const bh = (Math.min(mapHeight, hrMaxR + 2) - Math.max(0, hrMinR - 1)) * CELL;
        ctx.setLineDash([6, 3]);
        ctx.strokeRect(bx, by, bw, bh);
        ctx.setLineDash([]);
        // Room name label
        const room = rooms.find(rm => rm.id === highlightedRoomId);
        if (room) {
          const lx = bx + bw / 2, ly = by - 8;
          ctx.fillStyle = 'rgba(6,182,212,0.9)';
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(room.name, lx, ly);
        }
      }
      ctx.restore();
      needsRedraw = true; // keep animating pulse
    }

    // Pass 6.4: Draw room rectangle preview
    if (drawRoomMode && drawRoomStart && drawRoomEnd) {
      const dr1 = Math.min(drawRoomStart.row, drawRoomEnd.row);
      const dc1 = Math.min(drawRoomStart.col, drawRoomEnd.col);
      const dr2 = Math.max(drawRoomStart.row, drawRoomEnd.row);
      const dc2 = Math.max(drawRoomStart.col, drawRoomEnd.col);
      const dw = dc2 - dc1 + 1, dh = dr2 - dr1 + 1;
      const ok = dw >= 2 && dh >= 2;
      ctx.save();
      ctx.fillStyle = ok ? 'rgba(16,185,129,0.15)' : 'rgba(248,113,113,0.15)';
      ctx.fillRect(dc1 * CELL, dr1 * CELL, dw * CELL, dh * CELL);
      ctx.strokeStyle = ok ? 'rgba(16,185,129,0.8)' : 'rgba(248,113,113,0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(dc1 * CELL, dr1 * CELL, dw * CELL, dh * CELL);
      ctx.setLineDash([]);
      // Size label
      const interior = Math.max(0, dw - 2) * Math.max(0, dh - 2);
      const label = ok ? `${dw}×${dh}  (${interior}m²)` : `${dw}×${dh} — quá nhỏ`;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      const lx = (dc1 + dw / 2) * CELL, ly = (dr1 + dh / 2) * CELL;
      const tw = ctx.measureText(label).width + 16;
      ctx.fillRect(lx - tw / 2, ly - 10, tw, 22);
      ctx.fillStyle = ok ? '#10b981' : '#f87171';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, lx, ly);
      ctx.textBaseline = 'alphabetic';
      ctx.restore();
    }

    // Pass 6.5: Selection rectangle
    const sel = getSelRect();
    if (sel) {
      ctx.save();
      ctx.strokeStyle = 'rgba(6,182,212,0.9)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(sel.c1 * CELL, sel.r1 * CELL, sel.w * CELL, sel.h * CELL);
      ctx.fillStyle = 'rgba(6,182,212,0.08)';
      ctx.fillRect(sel.c1 * CELL, sel.r1 * CELL, sel.w * CELL, sel.h * CELL);
      ctx.restore();
    }

    // Pass 6.6: Paste ghost preview (tiles + props)
    if (pasteMode && pasteCursor && clipboard) {
      ctx.save();
      ctx.globalAlpha = 0.45;
      for (let dr = 0; dr < clipboard.h; dr++) {
        for (let dc = 0; dc < clipboard.w; dc++) {
          const r = pasteCursor.row + dr, c = pasteCursor.col + dc;
          if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) continue;
          const tileId = clipboard.grid[dr][dc];
          const td = getTile(tileId);
          ctx.fillStyle = td ? td.color : '#555';
          ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
        }
      }
      // Ghost props
      if (clipboard.props) {
        ctx.globalAlpha = 0.55;
        clipboard.props.forEach(p => {
          const r = pasteCursor.row + p.r, c = pasteCursor.col + p.c;
          if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) return;
          const imgKey = 'prop_' + p.type;
          const propImg = images[imgKey];
          if (propImg && propImg.complete) {
            ctx.drawImage(propImg, c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
          }
        });
      }
      ctx.globalAlpha = 1;
      // Border + cross-floor indicator
      const isCross = clipboard.srcFloor !== undefined && clipboard.srcFloor !== currentFloorIdx;
      ctx.strokeStyle = isCross ? 'rgba(251,191,36,0.9)' : 'rgba(16,185,129,0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(pasteCursor.col * CELL, pasteCursor.row * CELL,
                     clipboard.w * CELL, clipboard.h * CELL);
      // Cross-floor label
      if (isCross) {
        const srcName = floors[clipboard.srcFloor]?.name || ('T' + (clipboard.srcFloor + 1));
        ctx.setLineDash([]);
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = 'rgba(251,191,36,0.95)';
        ctx.fillText('📋 ' + srcName, pasteCursor.col * CELL + 4, pasteCursor.row * CELL - 4);
      }
      ctx.restore();
    }

    // Pass 6.7: Design mode drag preview
    if (wizardActive && wizardStep === 3 && wizardDragStart && wizardDragEnd) {
      const wr1 = Math.min(wizardDragStart.row, wizardDragEnd.row);
      const wc1 = Math.min(wizardDragStart.col, wizardDragEnd.col);
      const wr2 = Math.max(wizardDragStart.row, wizardDragEnd.row);
      const wc2 = Math.max(wizardDragStart.col, wizardDragEnd.col);
      const ww = wc2 - wc1 + 1, wh = wr2 - wr1 + 1;
      ctx.save();
      if (designTool === 'wall') {
        // Wall tool: draw line preview (snap H/V)
        const dr = wizardDragEnd.row - wizardDragStart.row;
        const dc = wizardDragEnd.col - wizardDragStart.col;
        ctx.strokeStyle = 'rgba(122,106,90,0.9)';
        ctx.lineWidth = CELL * 0.8;
        ctx.setLineDash([]);
        ctx.beginPath();
        if (Math.abs(dc) >= Math.abs(dr)) {
          // Horizontal
          const y = wizardDragStart.row * CELL + CELL / 2;
          ctx.moveTo(Math.min(wizardDragStart.col, wizardDragEnd.col) * CELL + CELL/2, y);
          ctx.lineTo(Math.max(wizardDragStart.col, wizardDragEnd.col) * CELL + CELL/2, y);
        } else {
          // Vertical
          const x = wizardDragStart.col * CELL + CELL / 2;
          ctx.moveTo(x, Math.min(wizardDragStart.row, wizardDragEnd.row) * CELL + CELL/2);
          ctx.lineTo(x, Math.max(wizardDragStart.row, wizardDragEnd.row) * CELL + CELL/2);
        }
        ctx.stroke();
      } else {
        // Room tool: filled rectangle
        const ok = ww >= 2 && wh >= 2;
        ctx.fillStyle = ok ? 'rgba(16,185,129,0.12)' : 'rgba(248,113,113,0.12)';
        ctx.fillRect(wc1 * CELL, wr1 * CELL, ww * CELL, wh * CELL);
        ctx.strokeStyle = ok ? 'rgba(16,185,129,0.8)' : 'rgba(248,113,113,0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(wc1 * CELL, wr1 * CELL, ww * CELL, wh * CELL);
        // Size + m² label
        ctx.setLineDash([]);
        const interior = Math.max(0, ww - 2) * Math.max(0, wh - 2);
        const label = ok ? `${ww}×${wh}  (${interior}m²)` : `${ww}×${wh}`;
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        const tw = ctx.measureText ? 100 : 100;
        ctx.fillRect((wc1 + ww/2) * CELL - 50, (wr1 + wh/2) * CELL - 10, 100, 22);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, (wc1 + ww/2) * CELL, (wr1 + wh/2) * CELL);
        ctx.textBaseline = 'alphabetic';
      }
      ctx.restore();
    }

    // Pass 6.8: Room labels (design mode — show name + m² on each room)
    if (wizardActive && wizardStep === 3 && layerState.rooms.visible) {
      renderRoomLabels(ctx);
    }

    // Pass 7: Preview mode player
    if (previewMode) drawPreviewPlayer();

    // Pass 8: Mini-map overlay
    drawMiniMap();
  }

  // ── GROUND TILE DRAWING ───────────────────────────────────
  function drawGroundTile(dc, x, y, tileId, roomId) {
    switch (tileId) {
      case 1: return; // wall drawn in later passes
      case 6:
        if (images.grass) dc.drawImage(images.grass, x, y, CELL, CELL);
        else { dc.fillStyle = '#2d5a1e'; dc.fillRect(x, y, CELL, CELL); }
        return;
      case 5:
        if (images.balcony) dc.drawImage(images.balcony, x, y, CELL, CELL);
        else { dc.fillStyle = '#b0bec5'; dc.fillRect(x, y, CELL, CELL); }
        return;
      case 4:
        if (images.floorTile) dc.drawImage(images.floorTile, x, y, CELL, CELL);
        else { dc.fillStyle = '#e8dcc8'; dc.fillRect(x, y, CELL, CELL); }
        if (images.door) dc.drawImage(images.door, x + 2, y + 2, CELL - 4, CELL - 4);
        return;
      case 2:
      case 3: {
        if (images.floorTile) dc.drawImage(images.floorTile, x, y, CELL, CELL);
        else { dc.fillStyle = '#c8b89a'; dc.fillRect(x, y, CELL, CELL); }
        if (images.stairsUp) dc.drawImage(images.stairsUp, x, y, CELL, CELL);
        const p = 0.4 + 0.4 * Math.abs(Math.sin(stairsPulse / STAIR_PULSE_DIV));
        dc.fillStyle = tileId === 2 ? `rgba(6,182,212,${p * 0.45})` : `rgba(139,92,246,${p * 0.45})`;
        dc.fillRect(x, y, CELL, CELL);
        // Arrow label
        dc.fillStyle = tileId === 2 ? '#06b6d4' : '#8b5cf6';
        dc.font = `bold ${Math.round(CELL * 0.5)}px sans-serif`;
        dc.textAlign = 'center'; dc.textBaseline = 'middle';
        dc.fillText(tileId === 2 ? '↑' : '↓', x + CELL / 2, y + CELL / 2);
        dc.textAlign = 'left'; dc.textBaseline = 'alphabetic';
        return;
      }
      default: {
        // Check if this tile has a custom floor image (variants 27-31)
        const tileDef = getTile(tileId);
        if (tileDef && tileDef.floorImage && images[tileDef.floorImage]) {
          dc.drawImage(images[tileDef.floorImage], x, y, CELL, CELL);
        } else if (images.floorTile) {
          dc.drawImage(images.floorTile, x, y, CELL, CELL);
        } else {
          dc.fillStyle = '#e8dcc8'; dc.fillRect(x, y, CELL, CELL);
        }
        // Room color overlay
        if (roomId) {
          const room = rooms.find(r => r.id === roomId);
          if (room) { dc.fillStyle = room.color; dc.fillRect(x, y, CELL, CELL); }
        } else if (tileId === 7) {
          dc.fillStyle = 'rgba(13,148,136,0.25)'; dc.fillRect(x, y, CELL, CELL);
        } else if (tileId === 8) {
          dc.fillStyle = 'rgba(249,115,22,0.18)'; dc.fillRect(x, y, CELL, CELL);
        } else if (tileId === 9) {
          dc.fillStyle = 'rgba(168,85,247,0.18)'; dc.fillRect(x, y, CELL, CELL);
        }
      }
    }
  }

  // ── HOVER PREVIEW ─────────────────────────────────────────
  function drawHoverPreview() {
    const half = Math.floor(brushSize / 2);
    const td   = getTile(currentTileId) || getTile(0);

    ctx.save();
    ctx.globalAlpha = 0.48;
    for (let dr = -half; dr < brushSize - half; dr++) {
      for (let dc = -half; dc < brushSize - half; dc++) {
        const r = hoverRow + dr, c = hoverCol + dc;
        if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) continue;
        drawGroundTile(ctx, c * CELL, r * CELL, currentTileId, null);
      }
    }
    ctx.restore();

    // Brush outline
    const color = td.color;
    const bx = (hoverCol - half) * CELL;
    const by = (hoverRow - half) * CELL;
    const bw = brushSize * CELL;
    const bh = brushSize * CELL;
    ctx.save();
    ctx.strokeStyle = color + 'aa';
    ctx.lineWidth = 3;
    ctx.strokeRect(bx - 1, by - 1, bw + 2, bh + 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, bw, bh);
    // Corner brackets
    const brkLen = Math.min(9, CELL * 0.35);
    ctx.lineWidth = 2.5;
    [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]].forEach(([cx, cy], i) => {
      const hx = (i === 0 || i === 3) ? brkLen : -brkLen;
      const vy = (i === 0 || i === 1) ? brkLen : -brkLen;
      ctx.beginPath(); ctx.moveTo(cx + hx, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + vy); ctx.stroke();
    });
    ctx.restore();
  }

  // ── STATS ─────────────────────────────────────────────────
  // ── STATS + VALIDATION (single pass) ──────────────────────
  // Combined into one grid scan for better cache locality
  let _lastScanWalls = 0, _lastScanWalkable = 0, _lastFirstWalkable = null;

  function scanGrid() {
    let walls = 0, walkable = 0, first = null;
    for (let r = 0; r < mapHeight; r++) {
      for (let c = 0; c < mapWidth; c++) {
        if (grid[r][c] === WALL_TILE_ID) { walls++; }
        else {
          walkable++;
          if (!first) first = { r, c };
        }
      }
    }
    _lastScanWalls = walls;
    _lastScanWalkable = walkable;
    _lastFirstWalkable = first;
  }

  function updateStats() {
    scanGrid();
    const total = mapWidth * mapHeight;
    const sizeEl = $('stat-size'); if (sizeEl) sizeEl.textContent = `${mapWidth}×${mapHeight}`;
    const walkEl = $('stat-walk'); if (walkEl) walkEl.textContent = _lastScanWalkable;
    const wallEl = $('stat-wall'); if (wallEl) wallEl.textContent = _lastScanWalls;
    const pctEl  = $('stat-pct');  if (pctEl)  pctEl.textContent  = Math.round((_lastScanWalls / total) * 100) + '%';
    // Status bar compact
    const barSize = $('stat-bar-size'); if (barSize) barSize.textContent = `${mapWidth}×${mapHeight}`;
  }

  function validate() {
    // Uses cached values from last scanGrid() (called by updateStats)
    const walkable = _lastScanWalkable;
    const first = _lastFirstWalkable;
    const issues = [];

    if (walkable < 4) issues.push('Cần ít nhất 4 ô walkable.');

    // BFS connectivity
    if (first && walkable >= 4) {
      const reach = bfsCount(first.r, first.c);
      if (reach < 4) issues.push(`Chỉ ${reach} ô liên thông.`);
    }

    const barStatus = $('stat-bar-status');
    if (issues.length === 0) {
      if (validationBox) { validationBox.className = 'validation-box ok'; validationBox.textContent = `✅ Tầng hợp lệ! ${walkable} ô walkable.`; }
      if (barStatus) barStatus.textContent = `✅ ${walkable} walkable`;
    } else {
      if (validationBox) { validationBox.className = 'validation-box warn'; validationBox.innerHTML = '⚠️ ' + issues.join('<br>⚠️ '); }
      if (barStatus) barStatus.textContent = '⚠️ ' + issues[0];
    }
    return issues.length === 0;
  }

  // Reusable flat visited buffer — avoids allocating 2D array every call
  let _bfsVis = null;
  let _bfsVisSize = 0;

  function bfsCount(sr, sc) {
    const sz = mapWidth * mapHeight;
    if (!_bfsVis || _bfsVisSize < sz) { _bfsVis = new Uint8Array(sz); _bfsVisSize = sz; }
    else _bfsVis.fill(0);

    // Use array-based queue with head pointer (avoids O(n) shift)
    const q = new Int32Array(sz * 2); // [r0,c0, r1,c1, ...]
    let head = 0, tail = 0;
    _bfsVis[sr * mapWidth + sc] = 1;
    q[tail++] = sr; q[tail++] = sc;
    let n = 0;
    while (head < tail) {
      const r = q[head++], c = q[head++];
      n++;
      // 4 directions: up, down, left, right
      if (r > 0)             { const k = (r-1)*mapWidth+c; if (!_bfsVis[k] && isWalkableTile(grid[r-1][c])) { _bfsVis[k]=1; q[tail++]=r-1; q[tail++]=c; }}
      if (r < mapHeight - 1) { const k = (r+1)*mapWidth+c; if (!_bfsVis[k] && isWalkableTile(grid[r+1][c])) { _bfsVis[k]=1; q[tail++]=r+1; q[tail++]=c; }}
      if (c > 0)             { const k = r*mapWidth+(c-1); if (!_bfsVis[k] && isWalkableTile(grid[r][c-1])) { _bfsVis[k]=1; q[tail++]=r; q[tail++]=c-1; }}
      if (c < mapWidth - 1)  { const k = r*mapWidth+(c+1); if (!_bfsVis[k] && isWalkableTile(grid[r][c+1])) { _bfsVis[k]=1; q[tail++]=r; q[tail++]=c+1; }}
    }
    return n;
  }

  // ── CUSTOM CONFIRM MODAL ─────────────────────────────────
  function showConfirm(message) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed; inset:0; background:rgba(0,0,0,0.65);
        backdrop-filter:blur(6px); display:flex; align-items:center;
        justify-content:center; z-index:200;
      `;
      const dialog = document.createElement('div');
      dialog.style.cssText = `
        background:var(--bg-secondary); border:1px solid var(--glass-border);
        border-radius:20px; padding:28px 32px; max-width:400px; width:90%;
        box-shadow:0 20px 60px rgba(0,0,0,0.5);
        animation:modalPop 0.3s cubic-bezier(0.34,1.56,0.64,1);
        text-align:center;
      `;
      dialog.innerHTML = `
        <div style="font-size:36px; margin-bottom:12px;">⚠️</div>
        <p style="font-size:14px; color:var(--text-primary); margin-bottom:20px; line-height:1.6;">${message}</p>
        <div style="display:flex; gap:10px; justify-content:center;">
          <button id="confirm-cancel" style="
            padding:10px 24px; border-radius:10px; border:2px solid var(--glass-border);
            background:var(--glass); color:var(--text-secondary);
            font-family:'Inter',sans-serif; font-size:14px; font-weight:600;
            cursor:pointer; transition:all 0.2s;
          ">Hủy</button>
          <button id="confirm-ok" style="
            padding:10px 24px; border-radius:10px; border:2px solid transparent;
            background:linear-gradient(135deg, var(--accent-green), #059669);
            color:white; font-family:'Inter',sans-serif; font-size:14px; font-weight:700;
            cursor:pointer; transition:all 0.2s;
            box-shadow:0 4px 16px rgba(16,185,129,0.3);
          ">Đồng ý</button>
        </div>
      `;
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      function close(result) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.2s ease';
        setTimeout(() => overlay.remove(), 200);
        resolve(result);
      }

      dialog.querySelector('#confirm-ok').onclick = () => close(true);
      dialog.querySelector('#confirm-cancel').onclick = () => close(false);
      overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
    });
  }

  // ── HOUSE WIZARD ───────────────────────────────────────────

  function wizardStepDots(current) {
    const labels = ['Kích thước','Viền tường','Chia phòng','Hoàn tất'];
    return labels.map((l, i) => {
      const n = i + 1;
      const cls = n < current ? 'done' : n === current ? 'active' : '';
      const line = i < labels.length - 1 ? `<span class="wiz-line ${n < current ? 'done' : ''}"></span>` : '';
      return `<span class="wiz-dot ${cls}">${n}</span>${line}`;
    }).join('');
  }

  // ── FORM-BASED HOUSE WIZARD ──────────────────────────────
  // Simple flow: Modal with form to add rooms → auto-layout on map
  window.openHouseWizard = function() {
    if (wizardActive) return;
    wizardActive = true;
    wizardStep = 1;
    wizardRooms = [];
    wizardTemplate = 'scratch';
    wizardSnapshotBefore = JSON.parse(JSON.stringify({ floors, mapWidth, mapHeight, currentFloorIdx }));
    showRoomFormWizard();
  };

  // ── STEP 1: Nhập kích thước nền nhà ──
  function showRoomFormWizard() {
    if (wizardOverlay) wizardOverlay.remove();
    const inputStyle = 'width:70px;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#fff;font-size:15px;text-align:center;font-weight:700;';

    const overlay = document.createElement('div');
    overlay.className = 'wiz-overlay';
    overlay.innerHTML = `
      <div class="wiz-modal" style="max-width:400px;">
        <div class="wiz-header">
          <span class="ms-icon" style="font-size:22px;">home</span>
          <span style="flex:1;">Bước 1: Kích thước nhà</span>
          <button class="wiz-btn" id="wiz-cancel-btn" style="padding:4px 12px;font-size:11px;">✕ Hủy</button>
        </div>
        <p style="color:#aaa;font-size:12px;margin-bottom:12px;">Nhập kích thước tổng thể của ngôi nhà (tính theo ô). Tường bao quanh sẽ tự tạo.</p>
        <div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:16px;">
          <div style="text-align:center;">
            <label style="font-size:11px;color:#888;display:block;margin-bottom:4px;">Rộng</label>
            <input type="number" id="wiz-house-w" value="15" min="6" max="40" style="${inputStyle}">
          </div>
          <span style="color:#666;font-size:20px;font-weight:700;">×</span>
          <div style="text-align:center;">
            <label style="font-size:11px;color:#888;display:block;margin-bottom:4px;">Dài</label>
            <input type="number" id="wiz-house-h" value="10" min="6" max="40" style="${inputStyle}">
          </div>
          <span id="wiz-house-area" style="color:var(--accent-teal);font-size:15px;font-weight:700;">= 104m²</span>
        </div>
        <button class="wiz-btn primary" id="wiz-draw-floor" style="width:100%;padding:10px;font-size:14px;">
          <span class="ms-icon" style="font-size:18px;vertical-align:middle;">draw</span>
          Vẽ nền nhà →
        </button>
      </div>
    `;
    document.body.appendChild(overlay);
    wizardOverlay = overlay;

    const wI = overlay.querySelector('#wiz-house-w');
    const hI = overlay.querySelector('#wiz-house-h');
    const areaL = overlay.querySelector('#wiz-house-area');
    function updArea() {
      const w = parseInt(wI.value)||6, h = parseInt(hI.value)||6;
      areaL.textContent = `= ${Math.max(0,w-2)*Math.max(0,h-2)}m²`;
    }
    wI.addEventListener('input', updArea);
    hI.addEventListener('input', updArea);
    updArea();

    overlay.querySelector('#wiz-cancel-btn').onclick = () => wizardCancel();
    overlay.addEventListener('click', e => { if (e.target === overlay) wizardCancel(); });

    overlay.querySelector('#wiz-draw-floor').onclick = () => {
      const houseW = Math.max(6, Math.min(40, parseInt(wI.value)||15));
      const houseH = Math.max(6, Math.min(40, parseInt(hI.value)||10));
      drawHouseFloor(houseW, houseH);
    };
    wI.focus();
  }

  // Draw the house floor on canvas (reset map, add border walls)
  function drawHouseFloor(w, h) {
    mapWidth = w; mapHeight = h;
    const floor = floors[currentFloorIdx];
    floor.grid = []; floor.roomMap = []; floor.rooms = []; floor.props = [];
    for (let r = 0; r < h; r++) {
      floor.grid.push(new Array(w).fill(0));
      floor.roomMap.push(new Array(w).fill(null));
    }
    ensureFloorStructure(floor);
    switchToFloor(currentFloorIdx);
    // Border walls
    for (let c = 0; c < w; c++) { grid[0][c] = WALL_TILE_ID; grid[h-1][c] = WALL_TILE_ID; }
    for (let r = 0; r < h; r++) { grid[r][0] = WALL_TILE_ID; grid[r][w-1] = WALL_TILE_ID; }
    // Update sliders
    const ws = $('grid-w-slider'), hs = $('grid-h-slider');
    if (ws) { ws.value = Math.min(w, parseInt(ws.max)); $('grid-width-value').textContent = w; }
    if (hs) { hs.value = Math.min(h, parseInt(hs.max)); $('grid-height-value').textContent = h; }
    resizeCanvas();
    markDirty();
    // Go to step 2
    showRoomAddStep(w, h);
  }

  // ── STEP 2: Thêm phòng vào nền nhà ──
  function showRoomAddStep(houseW, houseH) {
    if (wizardOverlay) wizardOverlay.remove();

    const overlay = document.createElement('div');
    overlay.className = 'wiz-overlay';
    overlay.style.pointerEvents = 'none'; // let canvas be visible behind
    const modal = document.createElement('div');
    modal.className = 'wiz-modal';
    modal.style.cssText = 'max-width:420px;max-height:80vh;overflow-y:auto;pointer-events:auto;position:absolute;right:20px;top:20px;';
    modal.innerHTML = `
      <div class="wiz-header">
        <span class="ms-icon" style="font-size:22px;">meeting_room</span>
        <span style="flex:1;">Bước 2: Thêm phòng</span>
        <span style="font-size:11px;color:#888;">Nền: ${houseW}×${houseH}</span>
      </div>
      <p style="color:#aaa;font-size:11px;margin-bottom:10px;">Thêm phòng bên dưới. Hệ thống tự xếp vào nền nhà.</p>

      <div style="background:rgba(6,182,212,0.05);border:1px solid rgba(6,182,212,0.15);border-radius:12px;padding:12px;margin-bottom:10px;">
        <div style="display:flex;gap:8px;margin-bottom:8px;">
          <div style="flex:1;">
            <label style="font-size:11px;color:#888;">Tên phòng</label>
            <input type="text" id="wiz-f-name" value="Phòng khách" maxlength="32" style="width:100%;padding:7px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#fff;font-size:13px;">
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:8px;align-items:end;">
          <div>
            <label style="font-size:11px;color:#888;">Rộng</label>
            <input type="number" id="wiz-f-w" value="5" min="3" max="${houseW-1}" style="width:55px;padding:6px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#fff;font-size:13px;text-align:center;">
          </div>
          <span style="color:#666;padding-bottom:6px;">×</span>
          <div>
            <label style="font-size:11px;color:#888;">Dài</label>
            <input type="number" id="wiz-f-h" value="4" min="3" max="${houseH-1}" style="width:55px;padding:6px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#fff;font-size:13px;text-align:center;">
          </div>
          <span id="wiz-f-area" style="color:var(--accent-teal);font-size:12px;font-weight:700;padding-bottom:6px;">= 6m²</span>
        </div>
        <div style="margin-bottom:8px;">
          <label style="font-size:11px;color:#888;display:block;margin-bottom:3px;">Nền sàn</label>
          <div class="floor-picker" id="wiz-f-floor"></div>
        </div>
        <button class="wiz-btn primary" id="wiz-f-add" style="width:100%;padding:7px;font-size:12px;">+ Thêm phòng</button>
      </div>

      <div id="wiz-room-list" style="margin-bottom:10px;"></div>
      <div id="wiz-summary" style="font-size:12px;color:#888;margin-bottom:10px;"></div>

      <div style="display:flex;gap:8px;">
        <button class="wiz-btn" id="wiz-back-btn" style="flex:1;padding:8px;">← Quay lại</button>
        <button class="wiz-btn primary" id="wiz-finish-btn" style="flex:2;padding:8px;font-size:13px;" disabled>
          ✓ Tạo nhà
        </button>
      </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    wizardOverlay = overlay;

    // Build floor picker
    const fpContainer = modal.querySelector('#wiz-f-floor');
    FLOOR_SURFACES.forEach((s, i) => {
      const imgSrc = images[s.imgKey] ? images[s.imgKey].src : '';
      const btn = document.createElement('button');
      btn.className = 'floor-pick' + (i === 0 ? ' active' : '');
      btn.dataset.tile = s.tile;
      btn.title = s.label;
      btn.innerHTML = imgSrc
        ? `<img src="${imgSrc}" style="width:22px;height:22px;image-rendering:pixelated;border-radius:3px;"><span style="font-size:7px;margin-top:1px;">${s.label}</span>`
        : `<span class="ms-icon" style="font-size:16px;">${s.icon}</span><span style="font-size:7px;">${s.label}</span>`;
      btn.onclick = () => {
        fpContainer.querySelectorAll('.floor-pick').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
      fpContainer.appendChild(btn);
    });

    // Area calc
    const wInput = modal.querySelector('#wiz-f-w');
    const hInput = modal.querySelector('#wiz-f-h');
    const areaLabel = modal.querySelector('#wiz-f-area');
    function updateArea() {
      const w = parseInt(wInput.value) || 3, h = parseInt(hInput.value) || 3;
      areaLabel.textContent = `= ${Math.max(0, w-2) * Math.max(0, h-2)}m²`;
    }
    wInput.addEventListener('input', updateArea);
    hInput.addEventListener('input', updateArea);
    updateArea();

    // Add room
    modal.querySelector('#wiz-f-add').onclick = () => {
      const name = modal.querySelector('#wiz-f-name').value.trim() || 'Phòng ' + (wizardRooms.length + 1);
      const w = Math.max(3, Math.min(houseW, parseInt(wInput.value) || 5));
      const h = Math.max(3, Math.min(houseH, parseInt(hInput.value) || 4));
      const activeSurface = fpContainer.querySelector('.floor-pick.active');
      const floorTile = activeSurface ? parseInt(activeSurface.dataset.tile) : 0;
      const rt = autoPickRoomType(name);
      wizardRooms.push({ name, w, h, floorTile, color: rt.color, type: rt.key });
      // Auto-layout preview on canvas
      autoLayoutRoomsInHouse(houseW, houseH);
      refreshRoomList(modal);
      const suggestions = ['Phòng ngủ', 'WC', 'Bếp', 'Phòng ngủ 2', 'Ban công', 'Hành lang'];
      const nextName = suggestions[wizardRooms.length - 1] || 'Phòng ' + (wizardRooms.length + 1);
      modal.querySelector('#wiz-f-name').value = nextName;
      modal.querySelector('#wiz-f-name').select();
      showToast(`✓ ${name} (${w}×${h})`);
    };

    modal.querySelector('#wiz-f-name').addEventListener('keydown', e => {
      if (e.key === 'Enter') modal.querySelector('#wiz-f-add').click();
    });

    // Back to step 1
    modal.querySelector('#wiz-back-btn').onclick = () => {
      wizardRooms = [];
      showRoomFormWizard();
    };

    // Finish
    modal.querySelector('#wiz-finish-btn').onclick = () => {
      if (wizardRooms.length === 0) return;
      autoLayoutRoomsInHouse(houseW, houseH);
      if (wizardOverlay) { wizardOverlay.remove(); wizardOverlay = null; }
      wizardActive = false; wizardStep = 0; wizardSnapshotBefore = null;
      updateRoomList(); updateStats(); validate(); markDirty();
      showToast('🎉 Nhà đã tạo xong! ' + wizardRooms.length + ' phòng.');
      wizardRooms = [];
    };

    modal.querySelector('#wiz-f-name').focus();
    refreshRoomList(modal);
  }

  function autoPickRoomType(name) {
    const n = name.toLowerCase();
    if (n.includes('wc') || n.includes('toilet') || n.includes('vệ sinh')) return ROOM_TYPES.find(r => r.key === 'wc');
    if (n.includes('bếp') || n.includes('kitchen')) return ROOM_TYPES.find(r => r.key === 'kitchen');
    if (n.includes('ngủ') || n.includes('bed')) return ROOM_TYPES.find(r => r.key === 'bedroom');
    if (n.includes('ban công') || n.includes('balcon')) return ROOM_TYPES.find(r => r.key === 'balcony');
    return ROOM_TYPES.find(r => r.key === 'living');
  }

  function refreshRoomList(overlay) {
    const listEl = overlay.querySelector('#wiz-room-list');
    const summaryEl = overlay.querySelector('#wiz-summary');
    const finishBtn = overlay.querySelector('#wiz-finish-btn');

    if (wizardRooms.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;color:#555;font-size:12px;padding:20px;">Chưa có phòng nào. Thêm phòng bên trên!</div>';
      summaryEl.innerHTML = '';
      finishBtn.disabled = true;
      return;
    }

    finishBtn.disabled = false;
    let totalArea = 0;
    let html = '<div style="font-weight:700;font-size:12px;color:#aaa;margin-bottom:6px;">📋 Danh sách phòng:</div>';
    wizardRooms.forEach((rm, i) => {
      const area = Math.max(0, rm.w - 2) * Math.max(0, rm.h - 2);
      totalArea += area;
      html += `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:4px;">
        <span style="width:10px;height:10px;border-radius:3px;background:${rm.color};flex-shrink:0;"></span>
        <span style="flex:1;font-size:13px;color:#ddd;font-weight:600;">${rm.name}</span>
        <span style="font-size:11px;color:#888;">${rm.w}×${rm.h}</span>
        <span style="font-size:11px;color:var(--accent-teal);font-weight:700;">${area}m²</span>
        <button onclick="wizardRemoveRoom(${i})" style="background:none;border:none;color:#f87171;cursor:pointer;font-size:14px;padding:2px;" title="Xóa">🗑</button>
      </div>`;
    });
    listEl.innerHTML = html;
    summaryEl.innerHTML = `<strong style="color:var(--accent-teal);">${wizardRooms.length}</strong> phòng · <strong style="color:var(--accent-teal);">${totalArea}m²</strong> tổng diện tích`;
  }

  window.wizardRemoveRoom = function(idx) {
    const removed = wizardRooms.splice(idx, 1);
    if (removed.length) showToast(`Đã xóa "${removed[0].name}"`);
    refreshRoomList(wizardOverlay);
  };

  // ── AUTO-LAYOUT: Pack rooms into map ──────────────────────
  function autoLayoutRooms() {
    // Calculate minimum map size to fit all rooms
    const totalW = wizardRooms.reduce((s, r) => s + r.w, 0);
    const maxH = Math.max(...wizardRooms.map(r => r.h));
    // Simple row-based packing: place rooms left-to-right, wrap when exceeds width
    const targetW = Math.max(15, Math.ceil(Math.sqrt(totalW * maxH) * 1.3));
    let curX = 0, curY = 0, rowH = 0;
    const placements = [];

    // Sort rooms: largest first for better packing
    const sorted = wizardRooms.map((r, i) => ({ ...r, idx: i })).sort((a, b) => (b.w * b.h) - (a.w * a.h));

    sorted.forEach(rm => {
      if (curX + rm.w > targetW) {
        curX = 0;
        curY += rowH;
        rowH = 0;
      }
      placements.push({ ...rm, px: curX, py: curY });
      curX += rm.w;
      rowH = Math.max(rowH, rm.h);
    });

    // Determine final map size (add 1 border)
    const finalW = Math.max(targetW, ...placements.map(p => p.px + p.w));
    const finalH = curY + rowH;

    // Resize map
    mapWidth = finalW; mapHeight = finalH;
    const floor = floors[currentFloorIdx];
    floor.grid = []; floor.roomMap = []; floor.rooms = []; floor.props = [];
    for (let r = 0; r < finalH; r++) {
      floor.grid.push(new Array(finalW).fill(0));
      floor.roomMap.push(new Array(finalW).fill(null));
    }
    ensureFloorStructure(floor);
    switchToFloor(currentFloorIdx);

    const ws = $('grid-w-slider'), hs = $('grid-h-slider');
    if (ws) { ws.value = Math.min(finalW, parseInt(ws.max)); $('grid-width-value').textContent = finalW; }
    if (hs) { hs.value = Math.min(finalH, parseInt(hs.max)); $('grid-height-value').textContent = finalH; }
    resizeCanvas();

    // Place each room
    placements.forEach(rm => {
      const r1 = rm.py, c1 = rm.px, r2 = rm.py + rm.h - 1, c2 = rm.px + rm.w - 1;
      const roomId = 'auto_' + Date.now() + '_' + rm.idx;
      const rt = autoPickRoomType(rm.name);

      // Register room
      rooms.push({ id: roomId, name: rm.name, color: rm.color || rt.color });

      // Walls around perimeter
      for (let c = c1; c <= c2; c++) {
        if (r1 < finalH) grid[r1][c] = WALL_TILE_ID;
        if (r2 < finalH) grid[r2][c] = WALL_TILE_ID;
      }
      for (let r = r1; r <= r2; r++) {
        if (c1 < finalW) grid[r][c1] = WALL_TILE_ID;
        if (c2 < finalW) grid[r][c2] = WALL_TILE_ID;
      }

      // Interior: floor tile + room assignment
      const tileFill = rm.floorTile || 0;
      for (let r = r1 + 1; r < r2; r++) {
        for (let c = c1 + 1; c < c2; c++) {
          grid[r][c] = tileFill;
          roomMap[r][c] = roomId;
        }
      }

      // Auto door: bottom wall center
      const doorC = c1 + Math.floor(rm.w / 2);
      if (r2 < finalH && doorC > c1 && doorC < c2) {
        grid[r2][doorC] = 4; // door
      }
    });

    markDirty();
  }

  // ── AUTO-LAYOUT INSIDE HOUSE: Pack rooms into existing floor ──
  function autoLayoutRoomsInHouse(houseW, houseH) {
    // Reset floor (keep border walls)
    const floor = floors[currentFloorIdx];
    floor.rooms = [];
    for (let r = 0; r < houseH; r++) {
      for (let c = 0; c < houseW; c++) {
        grid[r][c] = (r === 0 || r === houseH-1 || c === 0 || c === houseW-1) ? WALL_TILE_ID : 0;
        roomMap[r][c] = null;
      }
    }
    rooms = floor.rooms;

    // Pack rooms left→right, top→bottom within house interior (1-cell border)
    const innerW = houseW; // rooms include their own walls
    let curX = 0, curY = 0, rowH = 0;
    const placements = [];

    wizardRooms.forEach((rm, i) => {
      if (curX + rm.w > innerW) {
        curX = 0;
        curY += rowH;
        rowH = 0;
      }
      placements.push({ ...rm, idx: i, px: curX, py: curY });
      curX += rm.w;
      rowH = Math.max(rowH, rm.h);
    });

    // Place rooms
    placements.forEach(rm => {
      const r1 = rm.py, c1 = rm.px;
      const r2 = r1 + rm.h - 1, c2 = c1 + rm.w - 1;
      if (r2 >= houseH || c2 >= houseW) return; // doesn't fit
      const roomId = 'auto_' + Date.now() + '_' + rm.idx;
      const rt = autoPickRoomType(rm.name);
      rooms.push({ id: roomId, name: rm.name, color: rm.color || rt.color });

      // Walls
      for (let c = c1; c <= c2; c++) {
        if (r1 < houseH) grid[r1][c] = WALL_TILE_ID;
        if (r2 < houseH) grid[r2][c] = WALL_TILE_ID;
      }
      for (let r = r1; r <= r2; r++) {
        if (c1 < houseW) grid[r][c1] = WALL_TILE_ID;
        if (c2 < houseW) grid[r][c2] = WALL_TILE_ID;
      }
      // Interior
      const tileFill = rm.floorTile || 0;
      for (let r = r1+1; r < r2; r++) {
        for (let c = c1+1; c < c2; c++) {
          if (r < houseH && c < houseW) {
            grid[r][c] = tileFill;
            roomMap[r][c] = roomId;
          }
        }
      }
      // Door
      const doorC = c1 + Math.floor(rm.w / 2);
      if (r2 < houseH && doorC > c1 && doorC < c2) grid[r2][doorC] = 4;
    });

    markDirty();
  }

  // (Old drag-based wizard removed — replaced by Form List wizard above)

  // Stub old functions referenced elsewhere (no-ops)
  function renderWizardModal() {}
  function enterDesignMode() {}
  function wizardFinishRoomDrag() {}
  function handleDoorToggle() {}
  window.setDesignTool = function() {};
  window.exitDesignMode = function() {};

  // ── PRESERVED UTILITY FUNCTIONS ──────────────────────────

  // Floor surfaces for room form
  const FLOOR_SURFACES = [
    { key: 'floor',    tile: 0,  label: 'Gạch',    icon: 'crop_square',    imgKey: 'floorTile' },
    { key: 'wood',     tile: 31, label: 'Sàn gỗ',  icon: 'texture',        imgKey: 'floorWood' },
    { key: 'clinic',   tile: 27, label: 'Y tế',     icon: 'local_hospital', imgKey: 'floorClinic' },
    { key: 'grooming', tile: 28, label: 'Grooming', icon: 'content_cut',    imgKey: 'floorGrooming' },
    { key: 'retro',    tile: 29, label: 'Retro',    icon: 'style',          imgKey: 'floorRetro' },
    { key: 'surgery',  tile: 30, label: 'Phẫu thuật', icon: 'medical_services', imgKey: 'floorSurgery' },
    { key: 'grass',    tile: 6,  label: 'Sân cỏ',  icon: 'park',           imgKey: 'grass' },
    { key: 'balcony',  tile: 5,  label: 'Ban công', icon: 'deck',           imgKey: 'balcony' },
  ];

  // Stub old design-mode mouse handlers (no longer used)
  function wizardFinishRoomDrag() {}
  function handleDoorToggle() {}

  /* OLD WIZARD UI REMOVED — START
    const dialog = document.createElement('div');
    dialog.className = 'wiz-dialog';

    const title = `<div class="wiz-title"><span class="ms-icon">home</span> Tạo Nhà</div>`;
    const dots = `<div class="wiz-steps">${wizardStepDots(step)}</div>`;
    const content = `<div class="wiz-content" id="wiz-content"></div>`;
    const footer = `<div class="wiz-footer" id="wiz-footer"></div>`;

    dialog.innerHTML = title + dots + content + footer;
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    wizardOverlay = overlay;

    overlay.addEventListener('click', e => { if (e.target === overlay) wizardCancel(); });

    if (step === 1) renderStep1();
  }

  // ── STEP 1: Size + Template ──
  function renderStep1() {
    const c = wizardOverlay.querySelector('#wiz-content');
    const selTpl = HOUSE_TEMPLATES.find(t => t.key === wizardTemplate) || HOUSE_TEMPLATES[0];
    const initW = selTpl.w || mapWidth;
    const initH = selTpl.h || mapHeight;

    c.innerHTML = `
      <div style="margin-bottom:14px;">
        <div class="wiz-slider-row">
          <label>Rộng:</label>
          <input type="range" id="wiz-w" min="6" max="30" value="${initW}">
          <span class="wiz-val" id="wiz-w-val">${initW}</span>
        </div>
        <div class="wiz-slider-row">
          <label>Cao:</label>
          <input type="range" id="wiz-h" min="6" max="25" value="${initH}">
          <span class="wiz-val" id="wiz-h-val">${initH}</span>
        </div>
      </div>
      <div style="font-size:12px;color:#888;margin-bottom:8px;">Hoặc chọn template:</div>
      <div class="wiz-templates" id="wiz-tpl-grid"></div>
    `;

    // Sliders
    const ws = c.querySelector('#wiz-w'), hs = c.querySelector('#wiz-h');
    const wv = c.querySelector('#wiz-w-val'), hv = c.querySelector('#wiz-h-val');
    ws.oninput = () => { wv.textContent = ws.value; wizardTemplate = 'scratch'; updateTplSelection(); };
    hs.oninput = () => { hv.textContent = hs.value; wizardTemplate = 'scratch'; updateTplSelection(); };

    // Template cards
    const tplGrid = c.querySelector('#wiz-tpl-grid');
    HOUSE_TEMPLATES.forEach(t => {
      const card = document.createElement('div');
      card.className = 'wiz-tpl' + (t.key === wizardTemplate ? ' selected' : '');
      card.dataset.key = t.key;
      card.innerHTML = `<span class="ms-icon">${t.icon}</span><div class="wiz-tpl-name">${t.name}</div>` +
        (t.w ? `<div class="wiz-tpl-size">${t.w}×${t.h}</div>` : '<div class="wiz-tpl-size">Tùy chọn</div>');
      card.onclick = () => {
        wizardTemplate = t.key;
        if (t.w) { ws.value = t.w; wv.textContent = t.w; hs.value = t.h; hv.textContent = t.h; }
        updateTplSelection();
      };
      tplGrid.appendChild(card);
    });

    function updateTplSelection() {
      tplGrid.querySelectorAll('.wiz-tpl').forEach(el => {
        el.classList.toggle('selected', el.dataset.key === wizardTemplate);
      });
    }

    // Footer
    const f = wizardOverlay.querySelector('#wiz-footer');
    f.innerHTML = `<button class="wiz-btn danger" onclick="wizardCancel()">Hủy</button>
                   <button class="wiz-btn primary" id="wiz-next1">Tiếp tục →</button>`;
    f.querySelector('#wiz-next1').onclick = () => {
      const w = parseInt(ws.value), h = parseInt(hs.value);
      wizardApplySize(w, h);
    };
  }

  function wizardApplySize(w, h) {
    // Resize current floor
    mapWidth = w; mapHeight = h;
    // Rebuild floor grid
    const tpl = HOUSE_TEMPLATES.find(t => t.key === wizardTemplate);
    const floor = floors[currentFloorIdx];

    if (tpl && tpl.data) {
      // Apply template
      floor.grid = tpl.data.grid.map(r => [...r]);
      floor.roomMap = tpl.data.roomMap.map(r => [...r]);
      floor.rooms = _clone(tpl.data.rooms);
      floor.props = [];
    } else {
      // From scratch: empty floor + border
      floor.grid = [];
      floor.roomMap = [];
      for (let r = 0; r < h; r++) {
        floor.grid.push(new Array(w).fill(0));
        floor.roomMap.push(new Array(w).fill(null));
      }
      floor.rooms = [];
      floor.props = [];
    }
    ensureFloorStructure(floor);
    switchToFloor(currentFloorIdx);

    // Update sliders
    const ws = $('grid-w-slider'), hs = $('grid-h-slider');
    if (ws) { ws.value = w; $('grid-width-value').textContent = w; }
    if (hs) { hs.value = h; $('grid-height-value').textContent = h; }
    resizeCanvas();

    // Auto fill border if from scratch
    if (!tpl || !tpl.data) {
      for (let c = 0; c < mapWidth; c++) { grid[0][c] = WALL_TILE_ID; grid[mapHeight-1][c] = WALL_TILE_ID; }
      for (let r = 0; r < mapHeight; r++) { grid[r][0] = WALL_TILE_ID; grid[r][mapWidth-1] = WALL_TILE_ID; }
    }
    markDirty();

    // Skip step 2 — go directly to design mode
    if (wizardOverlay) { wizardOverlay.remove(); wizardOverlay = null; }
    enterDesignMode();
  }

  // ── DESIGN MODE (Live Canvas Editor) ──────────────────────

  function enterDesignMode() {
    wizardStep = 3;
    designTool = 'room';
    if (wizardOverlay) { wizardOverlay.remove(); wizardOverlay = null; }

    const container = document.querySelector('.canvas-container');
    container.style.position = 'relative';

    const tb = document.createElement('div');
    tb.className = 'design-toolbar';
    tb.innerHTML = `
      <div class="design-tb-title"><span class="ms-icon" style="font-size:18px;">home</span> THIẾT KẾ NHÀ</div>
      <div class="design-tb-tools">
        <button class="design-tool-btn active" data-tool="room" onclick="setDesignTool('room')" title="Kéo tạo phòng">
          <span class="ms-icon">meeting_room</span> Phòng
        </button>
        <button class="design-tool-btn" data-tool="wall" onclick="setDesignTool('wall')" title="Kéo vẽ tường">
          <span class="ms-icon">border_all</span> Tường
        </button>
        <button class="design-tool-btn" data-tool="door" onclick="setDesignTool('door')" title="Click đặt cửa">
          <span class="ms-icon">door_front</span> Cửa
        </button>
        <span class="design-tb-sep"></span>
        <button class="design-tool-btn design-done" onclick="exitDesignMode()">
          <span class="ms-icon">check_circle</span> Xong
        </button>
        <button class="design-tool-btn design-cancel" onclick="wizardCancel()">
          <span class="ms-icon">close</span>
        </button>
      </div>
      <div class="design-tb-info">
        <span id="design-tool-label">Tool: Phòng</span>
        <span class="design-tb-sep"></span>
        <span><strong id="design-room-count">${wizardRooms.length}</strong> phòng</span>
        <span class="design-tb-sep"></span>
        <span id="design-area-label">${mapWidth}×${mapHeight}</span>
      </div>
    `;
    container.appendChild(tb);
    wizardFloating = tb;
    canvas.style.cursor = 'crosshair';
    markDirty();
    showToast('🏠 Chế độ thiết kế — chọn tool rồi vẽ trên canvas');
  }

  window.setDesignTool = function(tool) {
    designTool = tool;
    if (wizardFloating) {
      wizardFloating.querySelectorAll('.design-tool-btn[data-tool]').forEach(b => {
        b.classList.toggle('active', b.dataset.tool === tool);
      });
    }
    const labels = { room: 'Tool: Phòng', wall: 'Tool: Tường', door: 'Tool: Cửa' };
    const el = document.getElementById('design-tool-label');
    if (el) el.textContent = labels[tool] || '';
    canvas.style.cursor = tool === 'door' ? 'pointer' : 'crosshair';
    // Close any open popup
    if (wizardRoomPopup) { wizardRoomPopup.remove(); wizardRoomPopup = null; }
    wizardDragStart = wizardDragEnd = null;
    markOverlayDirty();
  };

  window.exitDesignMode = function() {
    if (wizardOverlay) { wizardOverlay.remove(); wizardOverlay = null; }
    if (wizardFloating) { wizardFloating.remove(); wizardFloating = null; }
    if (wizardRoomPopup) { wizardRoomPopup.remove(); wizardRoomPopup = null; }
    wizardActive = false;
    wizardStep = 0;
    wizardSnapshotBefore = null;
    canvas.style.cursor = 'crosshair';
    updateRoomList(); updateStats(); validate(); markDirty();
    showToast('🎉 Thiết kế hoàn tất! ' + wizardRooms.length + ' phòng.');
    wizardRooms = [];
  };
  OLD WIZARD UI REMOVED — END */

  // ── ROOM LABELS (render name + m² on canvas) ──────────────
  function calcRoomBounds(roomId) {
    let minR = mapHeight, maxR = 0, minC = mapWidth, maxC = 0, count = 0;
    for (let r = 0; r < mapHeight; r++) {
      for (let c = 0; c < mapWidth; c++) {
        if (roomMap[r][c] === roomId) {
          if (r < minR) minR = r; if (r > maxR) maxR = r;
          if (c < minC) minC = c; if (c > maxC) maxC = c;
          count++;
        }
      }
    }
    if (count === 0) return null;
    return { r1: minR, c1: minC, r2: maxR, c2: maxC, cells: count };
  }

  function renderRoomLabels(dc) {
    if (!rooms || rooms.length === 0) return;
    dc.save();
    const drawn = new Set();
    rooms.forEach(room => {
      if (drawn.has(room.id)) return;
      drawn.add(room.id);
      const bounds = calcRoomBounds(room.id);
      if (!bounds) return;
      const cx = (bounds.c1 + bounds.c2 + 1) / 2 * CELL;
      const cy = (bounds.r1 + bounds.r2 + 1) / 2 * CELL;
      const name = room.name || '?';
      const area = bounds.cells + 'm²';

      // Background pill
      dc.font = 'bold 10px Inter, sans-serif';
      const tw = Math.max(dc.measureText(name).width, dc.measureText(area).width) + 14;
      const th = 28;
      dc.fillStyle = 'rgba(0,0,0,0.55)';
      dc.beginPath();
      const rx = cx - tw/2, ry = cy - th/2, rad = 6;
      if (dc.roundRect) dc.roundRect(rx, ry, tw, th, rad);
      else { dc.moveTo(rx+rad,ry); dc.arcTo(rx+tw,ry,rx+tw,ry+th,rad); dc.arcTo(rx+tw,ry+th,rx,ry+th,rad); dc.arcTo(rx,ry+th,rx,ry,rad); dc.arcTo(rx,ry,rx+tw,ry,rad); dc.closePath(); }
      dc.fill();

      // Room name
      dc.fillStyle = '#fff';
      dc.textAlign = 'center';
      dc.textBaseline = 'middle';
      dc.fillText(name, cx, cy - 6);

      // Area
      dc.fillStyle = 'rgba(6,182,212,0.9)';
      dc.font = '9px Inter, sans-serif';
      dc.fillText(area, cx, cy + 7);
    });
    dc.restore();
  }

  /* OLD DESIGN-MODE CODE REMOVED — START
  function _old_wizardFinishRoomDrag() {
    if (!wizardDragStart || !wizardDragEnd) return;
    const r1 = Math.min(wizardDragStart.row, wizardDragEnd.row);
    const c1 = Math.min(wizardDragStart.col, wizardDragEnd.col);
    const r2 = Math.max(wizardDragStart.row, wizardDragEnd.row);
    const c2 = Math.max(wizardDragStart.col, wizardDragEnd.col);

    if (designTool === 'wall') {
      // Wall draw: snap to horizontal or vertical line
      handleWallDraw(wizardDragStart, wizardDragEnd);
      wizardDragStart = wizardDragEnd = null;
      return;
    }

    // Room tool: need at least 2×2
    const w = c2 - c1 + 1, h = r2 - r1 + 1;
    if (w < 2 || h < 2) { wizardDragStart = wizardDragEnd = null; return; }

    // Show room popup near the rectangle
    showWizardRoomPopup(r1, c1, r2, c2);
  }

  // ── WALL DRAW TOOL ──
  function handleWallDraw(start, end) {
    const dr = end.row - start.row, dc = end.col - start.col;
    // Snap: if more horizontal → horizontal line, else vertical
    const isErasing = false; // could add shift-key support later
    const tileVal = isErasing ? 0 : WALL_TILE_ID;
    saveHistoryAtomic();
    if (Math.abs(dc) >= Math.abs(dr)) {
      // Horizontal wall line
      const r = start.row;
      const cMin = Math.max(0, Math.min(start.col, end.col));
      const cMax = Math.min(mapWidth - 1, Math.max(start.col, end.col));
      for (let c = cMin; c <= cMax; c++) {
        if (r >= 0 && r < mapHeight) {
          recordCell(pendingCommand, currentFloorIdx, r, c, 'grid', grid[r][c], tileVal);
          grid[r][c] = tileVal;
        }
      }
    } else {
      // Vertical wall line
      const c = start.col;
      const rMin = Math.max(0, Math.min(start.row, end.row));
      const rMax = Math.min(mapHeight - 1, Math.max(start.row, end.row));
      for (let r = rMin; r <= rMax; r++) {
        if (c >= 0 && c < mapWidth) {
          recordCell(pendingCommand, currentFloorIdx, r, c, 'grid', grid[r][c], tileVal);
          grid[r][c] = tileVal;
        }
      }
    }
    commitHistory();
    updateStats(); markDirty();
  }

  // ── DOOR TOGGLE TOOL ──
  function handleDoorToggle(row, col) {
    if (row < 0 || row >= mapHeight || col < 0 || col >= mapWidth) return;
    const current = grid[row][col];
    let newTile;
    if (current === WALL_TILE_ID) newTile = 4; // wall → door
    else if (current === 4) newTile = WALL_TILE_ID; // door → wall
    else return; // only works on walls/doors
    saveHistoryAtomic();
    recordCell(pendingCommand, currentFloorIdx, row, col, 'grid', current, newTile);
    grid[row][col] = newTile;
    commitHistory();
    markDirty();
    showToast(newTile === 4 ? '🚪 Cửa đã đặt' : '🧱 Đã thay bằng tường');
  }

  // Floor surface options for room popup (visual picker)
  const FLOOR_SURFACES = [
    { key: 'floor',    tile: 0,  label: 'Gạch',    icon: 'crop_square',    imgKey: 'floorTile' },
    { key: 'wood',     tile: 31, label: 'Sàn gỗ',  icon: 'texture',        imgKey: 'floorWood' },
    { key: 'clinic',   tile: 27, label: 'Y tế',     icon: 'local_hospital', imgKey: 'floorClinic' },
    { key: 'grooming', tile: 28, label: 'Grooming', icon: 'content_cut',    imgKey: 'floorGrooming' },
    { key: 'retro',    tile: 29, label: 'Retro',    icon: 'style',          imgKey: 'floorRetro' },
    { key: 'surgery',  tile: 30, label: 'Phẫu thuật', icon: 'medical_services', imgKey: 'floorSurgery' },
    { key: 'grass',    tile: 6,  label: 'Sân cỏ',  icon: 'park',           imgKey: 'grass' },
    { key: 'balcony',  tile: 5,  label: 'Ban công', icon: 'deck',           imgKey: 'balcony' },
  ];

  function showWizardRoomPopup(r1, c1, r2, c2) {
    if (wizardRoomPopup) wizardRoomPopup.remove();

    const container = document.querySelector('.canvas-container');
    const popup = document.createElement('div');
    popup.className = 'wiz-room-popup';
    // Position near the rectangle (fixed viewport coords, clamped to screen)
    const canvasRect = canvas.getBoundingClientRect();
    const POPUP_W = 260, POPUP_H = 360;
    // Try right side of rectangle
    let px = canvasRect.left + (c2 + 1) * CELL * zoomLevel + 12;
    let py = canvasRect.top + r1 * CELL * zoomLevel;
    // If overflows right, place left of rect
    if (px + POPUP_W > window.innerWidth - 10) px = canvasRect.left + c1 * CELL * zoomLevel - POPUP_W - 12;
    // Clamp to viewport
    px = Math.max(10, Math.min(px, window.innerWidth - POPUP_W - 10));
    py = Math.max(10, Math.min(py, window.innerHeight - POPUP_H - 10));
    popup.style.left = px + 'px';
    popup.style.top = py + 'px';

    const roomNum = wizardRooms.length + 1;
    const w = c2 - c1 + 1, h = r2 - r1 + 1;
    const interior = Math.max(0, w - 2) * Math.max(0, h - 2);

    // Build floor surface grid
    let surfaceHTML = '';
    FLOOR_SURFACES.forEach((s, i) => {
      const imgSrc = images[s.imgKey] ? images[s.imgKey].src : '';
      const active = i === 0 ? ' active' : '';
      surfaceHTML += `<button class="floor-pick${active}" data-floor="${s.key}" data-tile="${s.tile}" title="${s.label}">
        ${imgSrc ? `<img src="${imgSrc}" style="width:28px;height:28px;image-rendering:pixelated;border-radius:4px;">` : `<span class="ms-icon" style="font-size:22px;">${s.icon}</span>`}
        <span style="font-size:9px;margin-top:1px;">${s.label}</span>
      </button>`;
    });

    popup.innerHTML = `
      <div class="wrp-header">
        <span class="ms-icon" style="color:var(--accent-teal);">home</span>
        <span>Phòng mới</span>
        <span style="color:#666;font-size:11px;margin-left:auto;">${w}×${h} · ${interior}m²</span>
      </div>
      <label>Tên phòng:</label>
      <input type="text" id="wiz-rname" value="Phòng ${roomNum}" maxlength="32" autofocus>
      <label>Nền sàn:</label>
      <div class="floor-picker" id="wiz-floor-picker">${surfaceHTML}</div>
      <label>Loại phòng:</label>
      <select id="wiz-rtype">
        ${ROOM_TYPES.map(rt => `<option value="${rt.key}">${rt.label}</option>`).join('')}
      </select>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="wiz-btn" id="wiz-rpop-cancel" style="flex:1;padding:7px;">✕ Hủy</button>
        <button class="wiz-btn primary" id="wiz-rpop-ok" style="flex:1;padding:7px;">✓ Tạo phòng</button>
      </div>
    `;
    document.body.appendChild(popup);
    wizardRoomPopup = popup;

    // Floor picker click handler
    popup.querySelectorAll('.floor-pick').forEach(btn => {
      btn.onclick = () => {
        popup.querySelectorAll('.floor-pick').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
    });

    // Auto-guess type
    if (roomNum <= 1) popup.querySelector('#wiz-rtype').value = 'living';
    else if (roomNum <= 3) popup.querySelector('#wiz-rtype').value = 'bedroom';

    // Prevent popup clicks from leaking to canvas/window handlers
    popup.addEventListener('mousedown', e => e.stopPropagation());
    popup.addEventListener('mouseup', e => e.stopPropagation());

    popup.querySelector('#wiz-rname').focus();
    popup.querySelector('#wiz-rname').select();

    function closePopup() {
      if (popup.parentElement) popup.remove();
      wizardRoomPopup = null;
      wizardDragStart = wizardDragEnd = null;
    }

    popup.querySelector('#wiz-rpop-cancel').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      closePopup();
      markOverlayDirty();
    });

    popup.querySelector('#wiz-rpop-ok').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const name = popup.querySelector('#wiz-rname').value.trim() || 'Phòng ' + roomNum;
      const typeKey = popup.querySelector('#wiz-rtype').value;
      const rt = ROOM_TYPES.find(r => r.key === typeKey) || ROOM_TYPES[0];
      // Get selected floor tile
      const activeSurface = popup.querySelector('.floor-pick.active');
      const floorTile = activeSurface ? parseInt(activeSurface.dataset.tile) : 0;
      wizardCreateRoom(r1, c1, r2, c2, name, rt, floorTile);
      closePopup();
      markDirty();
      // Update design toolbar count
      const countEl = document.getElementById('design-room-count');
      if (countEl) countEl.textContent = wizardRooms.length;
    });

    // Enter to confirm
    popup.querySelector('#wiz-rname').addEventListener('keydown', e => {
      if (e.key === 'Enter') popup.querySelector('#wiz-rpop-ok').click();
    });
  }

  function wizardCreateRoom(r1, c1, r2, c2, name, roomType, floorTile) {
    saveHistoryAtomic();
    const roomId = 'wiz_' + Date.now() + '_' + wizardRooms.length;
    const color = roomType.color;
    const tileId = (floorTile !== undefined && floorTile !== null) ? floorTile : (roomType.tile || 0);

    // Fill walls around perimeter
    for (let c = c1; c <= c2; c++) {
      if (r1 >= 0 && r1 < mapHeight) { recordCell(pendingCommand, currentFloorIdx, r1, c, 'grid', grid[r1][c], WALL_TILE_ID); grid[r1][c] = WALL_TILE_ID; }
      if (r2 >= 0 && r2 < mapHeight) { recordCell(pendingCommand, currentFloorIdx, r2, c, 'grid', grid[r2][c], WALL_TILE_ID); grid[r2][c] = WALL_TILE_ID; }
    }
    for (let r = r1; r <= r2; r++) {
      if (c1 >= 0 && c1 < mapWidth) { recordCell(pendingCommand, currentFloorIdx, r, c1, 'grid', grid[r][c1], WALL_TILE_ID); grid[r][c1] = WALL_TILE_ID; }
      if (c2 >= 0 && c2 < mapWidth) { recordCell(pendingCommand, currentFloorIdx, r, c2, 'grid', grid[r][c2], WALL_TILE_ID); grid[r][c2] = WALL_TILE_ID; }
    }

    // Fill interior with floor tile + room assignment
    for (let r = r1 + 1; r < r2; r++) {
      for (let c = c1 + 1; c < c2; c++) {
        if (r >= 0 && r < mapHeight && c >= 0 && c < mapWidth) {
          const oldTile = grid[r][c];
          // Always fill interior with chosen floor tile
          if (oldTile !== tileId) {
            recordCell(pendingCommand, currentFloorIdx, r, c, 'grid', oldTile, tileId);
            grid[r][c] = tileId;
          }
          const oldRoom = roomMap[r][c];
          recordCell(pendingCommand, currentFloorIdx, r, c, 'roomMap', oldRoom, roomId);
          roomMap[r][c] = roomId;
        }
      }
    }

    // Auto place door on longest interior side
    const w = c2 - c1, h = r2 - r1;
    let doorR, doorC;
    if (w >= h) {
      // Door on bottom wall (center)
      doorR = r2; doorC = c1 + Math.floor(w / 2);
    } else {
      // Door on right wall (center)
      doorR = r1 + Math.floor(h / 2); doorC = c2;
    }
    if (doorR >= 0 && doorR < mapHeight && doorC >= 0 && doorC < mapWidth) {
      recordCell(pendingCommand, currentFloorIdx, doorR, doorC, 'grid', grid[doorR][doorC], 4); // door
      grid[doorR][doorC] = 4;
    }

    // Add room metadata
    rooms.push({ id: roomId, name, color });
    wizardRooms.push({ r1, c1, r2, c2, name, type: roomType.key, color, roomId });

    commitHistory();
    updateRoomList();
    updateStats();

    // Update floating counter
    const counter = document.getElementById('wiz-room-count');
    if (counter) counter.textContent = wizardRooms.length;

    showToast('✅ ' + name + ' đã được tạo!');
  }
  OLD DESIGN-MODE CODE REMOVED — END */

  window.wizardCancel = async function() {
    const ok = await showConfirm('Hủy wizard? Mọi thay đổi sẽ được hoàn tác.');
    if (!ok) return;
    if (wizardOverlay) { wizardOverlay.remove(); wizardOverlay = null; }
    if (wizardFloating) { wizardFloating.remove(); wizardFloating = null; }
    if (wizardRoomPopup) { wizardRoomPopup.remove(); wizardRoomPopup = null; }
    // Restore snapshot
    if (wizardSnapshotBefore) {
      const snap = wizardSnapshotBefore;
      floors = JSON.parse(JSON.stringify(snap.floors));
      mapWidth = snap.mapWidth; mapHeight = snap.mapHeight;
      const ws = $('grid-w-slider'), hs = $('grid-h-slider');
      if (ws) { ws.value = mapWidth; $('grid-width-value').textContent = mapWidth; }
      if (hs) { hs.value = mapHeight; $('grid-height-value').textContent = mapHeight; }
      switchToFloor(snap.currentFloorIdx);
      resizeCanvas();
      // Clear undo stack entries from wizard
      undoStack = []; redoStack = [];
      updateUndoRedoBtns();
    }
    wizardActive = false; wizardStep = 0; wizardSnapshotBefore = null; wizardRooms = [];
    markDirty();
    showToast('↩ Wizard đã hủy');
  };

  // ── ACTIONS ───────────────────────────────────────────────
  window.clearMap = async function () {
    const ok = await showConfirm('Xóa toàn bộ tầng <strong>' + floors[currentFloorIdx].name + '</strong>?');
    if (!ok) return;
    for (let r = 0; r < mapHeight; r++)
      for (let c = 0; c < mapWidth; c++) { grid[r][c] = 0; roomMap[r][c] = null; }
    // Clear rooms + props
    floors[currentFloorIdx].rooms = [];
    floors[currentFloorIdx].props = [];
    rooms = floors[currentFloorIdx].rooms;
    props = floors[currentFloorIdx].props;
    currentRoomId = null;
    updateRoomList(); updateStats(); validate(); markDirty();
    showToast('Đã xóa tầng này');
  };

  window.fillBorder = function () {
    for (let r = 0; r < mapHeight; r++) { grid[r][0] = 1; grid[r][mapWidth - 1] = 1; }
    for (let c = 0; c < mapWidth; c++) { grid[0][c] = 1; grid[mapHeight - 1][c] = 1; }
    updateStats(); validate(); markDirty(); showToast('Đã thêm viền tường');
  };

  window.invertMap = function () {
    for (let r = 0; r < mapHeight; r++)
      for (let c = 0; c < mapWidth; c++)
        grid[r][c] = grid[r][c] === 1 ? 0 : 1;
    updateStats(); validate(); markDirty(); showToast('Đã đảo ngược bản đồ');
  };

  window.generateRandom = function () {
    for (let r = 0; r < mapHeight; r++) for (let c = 0; c < mapWidth; c++) grid[r][c] = 0;
    for (let r = 0; r < mapHeight; r++) { grid[r][0] = 1; grid[r][mapWidth - 1] = 1; }
    for (let c = 0; c < mapWidth; c++) { grid[0][c] = 1; grid[mapHeight - 1][c] = 1; }
    for (let r = 1; r < mapHeight - 1; r++)
      for (let c = 1; c < mapWidth - 1; c++)
        if (Math.random() < RANDOM_WALL_PROB) grid[r][c] = WALL_TILE_ID;
    grid[1][1] = 0; grid[1][2] = 0; grid[2][1] = 0;
    updateStats(); validate(); markDirty(); showToast('Random map!');
  };

  // ── SAVE & PLAY ───────────────────────────────────────────
  window.saveAndPlay = function () {
    // Validate all floors have at least some walkable
    for (let i = 0; i < floors.length; i++) {
      let ok = false;
      for (let r = 0; r < mapHeight; r++)
        for (let c = 0; c < mapWidth; c++)
          if (isWalkableTile(floors[i].grid[r][c])) { ok = true; break; }
      if (!ok) { showToast('⚠️ Tầng ' + (i + 1) + ' không có ô walkable!'); return; }
    }

    // Build house_map.json-compatible object
    const mapObj = buildExportObject();

    try {
      localStorage.setItem('customMap', JSON.stringify({
        type: 'house',
        width: mapWidth,
        height: mapHeight,
        floors: mapObj.floors
      }));
      showToast('✅ Đã lưu! Đang chuyển sang game...');
      setTimeout(() => { window.location.href = 'index.html?map=custom'; }, 800);
    } catch {
      showToast('❌ Lưu thất bại');
    }
  };

  // ── EXPORT ────────────────────────────────────────────────
  function buildExportObject() {
    return {
      name: 'Custom Map',
      width: mapWidth,
      height: mapHeight,
      totalFloors: floors.length,
      floors: floors.map((f, i) => ({
        id: i + 1,
        name: f.name,
        rooms: f.rooms,
        grid: f.grid.map(row => [...row]),
        roomMap: f.roomMap.map(row => [...row]),
        props: f.props ? [...f.props] : [],
        stairs: extractStairs(f, i)
      }))
    };
  }

  function extractStairs(floor, floorIdx) {
    const list = [];
    for (let r = 0; r < mapHeight; r++) {
      for (let c = 0; c < mapWidth; c++) {
        const t = floor.grid[r][c];
        if (t === 2) list.push({ fromCell: [c, r], toFloor: floorIdx + 2, toCell: [c, r], direction: 'up' });
        if (t === 3) list.push({ fromCell: [c, r], toFloor: floorIdx,     toCell: [c, r], direction: 'down' });
      }
    }
    return list;
  }

  window.openExport = function () {
    const obj = buildExportObject();
    $('export-textarea').value = JSON.stringify(obj, null, 2);
    $('export-modal').classList.add('open');
  };
  window.closeExport = function () { $('export-modal').classList.remove('open'); };
  window.copyExport = function () {
    const ta = $('export-textarea'); ta.select();
    try { document.execCommand('copy'); showToast('📎 Đã copy!'); }
    catch { navigator.clipboard.writeText(ta.value).then(() => showToast('📎 Đã copy!')); }
  };
  $('export-modal').addEventListener('click', function(e) {
    if (e.target === this) closeExport();
  });

  // ── EXPORT PNG / SVG ─────────────────────────────────────
  window.exportPNG = function () {
    // Render all floors or current floor to a high-res PNG
    const scale = 2; // 2x resolution
    const expCanvas = document.createElement('canvas');
    const expCtx = expCanvas.getContext('2d');
    expCanvas.width  = mapWidth * CELL * scale;
    expCanvas.height = mapHeight * CELL * scale;
    expCtx.scale(scale, scale);

    // Save current layer state, force all visible
    const savedLayers = {};
    for (const [k, v] of Object.entries(layerState)) {
      savedLayers[k] = v.visible;
      v.visible = true;
    }
    const savedGrid = showGrid;
    showGrid = false; // export without grid lines for clean image

    // Re-render static layers on export canvas
    renderStaticLayers(expCtx, performance.now());

    // Draw props on top
    if (props) {
      props.forEach(p => {
        const x = p.c * CELL, y = p.r * CELL;
        const imgKey = 'prop_' + p.type;
        const propImg = images[imgKey];
        if (propImg && propImg.complete && propImg.naturalWidth > 0) {
          expCtx.drawImage(propImg, x + 1, y + 1, CELL - 2, CELL - 2);
        }
      });
    }

    // Restore layer state
    for (const [k, v] of Object.entries(savedLayers)) {
      layerState[k].visible = v;
    }
    showGrid = savedGrid;

    // Download
    const link = document.createElement('a');
    const floorName = floors[currentFloorIdx].name || ('Tầng_' + (currentFloorIdx + 1));
    link.download = 'map_' + floorName.replace(/\s/g, '_') + '_' + Date.now() + '.png';
    link.href = expCanvas.toDataURL('image/png');
    link.click();
    showToast('📸 Đã xuất PNG (' + (mapWidth * CELL * scale) + '×' + (mapHeight * CELL * scale) + 'px)');
  };

  window.exportAllFloorsPNG = function () {
    const scale = 2;
    const padding = 20;
    const labelH = 30;
    const floorW = mapWidth * CELL;
    const floorH = mapHeight * CELL;
    const cols = Math.min(floors.length, 3);
    const rows = Math.ceil(floors.length / cols);
    const totalW = cols * floorW + (cols - 1) * padding;
    const totalH = rows * (floorH + labelH) + (rows - 1) * padding;

    const expCanvas = document.createElement('canvas');
    const expCtx = expCanvas.getContext('2d');
    expCanvas.width  = totalW * scale;
    expCanvas.height = totalH * scale;
    expCtx.scale(scale, scale);
    expCtx.fillStyle = '#111827';
    expCtx.fillRect(0, 0, totalW, totalH);

    // Save & force all layers visible; use try/finally to guarantee state restoration
    const savedLayers = {};
    for (const [k, v] of Object.entries(layerState)) {
      savedLayers[k] = v.visible;
      v.visible = true;
    }
    const savedGrid = showGrid;
    showGrid = false;
    const savedFloor = currentFloorIdx;

    try {
      floors.forEach((floor, fi) => {
        const col = fi % cols;
        const row = Math.floor(fi / cols);
        const ox = col * (floorW + padding);
        const oy = row * (floorH + labelH + padding);

        // Use local refs — render functions read from module-level grid/roomMap/rooms/props
        ensureFloorStructure(floor);
        grid = floor.grid;
        roomMap = floor.roomMap;
        rooms = floor.rooms;
        props = floor.props;

        // Floor label
        expCtx.fillStyle = '#9ca3af';
        expCtx.font = 'bold 14px Inter, sans-serif';
        expCtx.textAlign = 'center';
        expCtx.fillText(floor.name || ('Tầng ' + (fi + 1)), ox + floorW / 2, oy + 18);
        expCtx.textAlign = 'left';

        // Render floor
        expCtx.save();
        expCtx.translate(ox, oy + labelH);
        renderStaticLayers(expCtx, performance.now());
        // Props
        props.forEach(p => {
          const x = p.c * CELL, y = p.r * CELL;
          const imgKey = 'prop_' + p.type;
          const propImg = images[imgKey];
          if (propImg && propImg.complete && propImg.naturalWidth > 0) {
            expCtx.drawImage(propImg, x + 1, y + 1, CELL - 2, CELL - 2);
          }
        });
        expCtx.restore();
      });
    } finally {
      // Always restore state, even if rendering throws
      for (const [k, v] of Object.entries(savedLayers)) {
        layerState[k].visible = v;
      }
      showGrid = savedGrid;
      switchToFloor(savedFloor);
    }

    // Download
    const link = document.createElement('a');
    link.download = 'map_all_floors_' + Date.now() + '.png';
    link.href = expCanvas.toDataURL('image/png');
    link.click();
    showToast('📸 Đã xuất tất cả ' + floors.length + ' tầng!');
  };

  // ── BACK ──────────────────────────────────────────────────
  window.goBack = function () { window.location.href = 'index.html'; };

  // ── LOAD SAMPLE MAP ───────────────────────────────────────
  window.loadSampleMap = async function(filename) {
    const ok = await showConfirm('Tải map mẫu sẽ <strong>xóa dữ liệu</strong> hiện tại đang vẽ.<br>Bạn có chắc chắn?');
    if (!ok) return;
    try {
      const resp = await fetch(filename);
      if (!resp.ok) throw new Error('Không tìm thấy ' + filename);
      const data = await resp.json();
      
      mapWidth = data.width || 22;
      mapHeight = data.height || 13;
      $('grid-w-slider').value = mapWidth;
      $('grid-h-slider').value = mapHeight;
      $('grid-width-value').textContent = mapWidth;
      $('grid-height-value').textContent = mapHeight;

      if (data.floors && Array.isArray(data.floors)) {
        floors = data.floors.map(f => ensureFloorStructure({
          name: f.name || 'Tầng ' + f.id,
          grid: f.grid,
          roomMap: f.roomMap || Array(mapHeight).fill(null).map(() => Array(mapWidth).fill(null)),
          rooms: f.rooms || [],
          props: f.props || []
        }));
      } else if (data.data) {
        floors = [{
          name: 'Tầng 1',
          grid: data.data,
          roomMap: Array(mapHeight).fill(null).map(() => Array(mapWidth).fill(null)),
          rooms: [], props: []
        }];
      }

      updateFloorTabs();
      switchToFloor(0);
      resizeCanvas();
      showToast('✅ Đã tải ' + (data.name || filename));
    } catch (e) {
      showToast('❌ Lỗi tải map: ' + e.message);
    }
  };

  // ── PREVIEW MODE ──────────────────────────────────────────
  let previewMode = false;
  let previewPlayer = { col: 1, row: 1, renderX: 1, renderY: 1, dir: 2, frame: 0, lastAnim: 0 };
  let previewPath = [];
  let previewMoveAccum = 0;
  let previewLastTime = 0;
  let previewBanner = null;
  // Floor transition fade
  let previewFade = { active: false, alpha: 0, dir: 1, label: '', callback: null };
  const PREVIEW_MOVE_MS = 80;
  const PREVIEW_SPRITE_COLS = 5;
  const PREVIEW_SPRITE_ROWS = 4;

  // Directions: 0=up, 1=right, 2=down, 3=left
  const previewKeysDown = new Set();

  function isPreviewWalkable(r, c) {
    if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) return false;
    if (grid[r][c] === 1) return false; // wall
    // Check props collision
    if (props && props.some(p => p.r === r && p.c === c)) return false;
    return true;
  }

  window.togglePreview = function () {
    previewMode = !previewMode;
    const btn = $('preview-btn');
    const container = document.querySelector('.canvas-container');
    const panelLeft = document.querySelector('.panel-left');
    const panelRight = document.querySelector('.panel-right');
    const toolbar = document.querySelector('.floating-toolbar');
    const floorTabs = document.querySelector('.floor-tab-bar');
    const header = document.querySelector('.editor-header');
    const canvasHint = document.querySelector('.canvas-hint');
    const editorMain = document.querySelector('.editor-main');
    const mobileToggles = document.querySelector('.mobile-panel-toggles');
    const miniMap = document.querySelector('.mini-map-fixed');

    if (previewMode) {
      // Find first walkable cell for player
      let placed = false;
      for (let r = 1; r < mapHeight - 1 && !placed; r++) {
        for (let c = 1; c < mapWidth - 1 && !placed; c++) {
          if (isPreviewWalkable(r, c)) {
            previewPlayer.col = c; previewPlayer.row = r;
            previewPlayer.renderX = c; previewPlayer.renderY = r;
            previewPlayer.dir = 2; previewPlayer.frame = 0;
            placed = true;
          }
        }
      }
      previewPath = [];
      previewMoveAccum = 0;
      previewLastTime = performance.now();

      // ── Hide all UI, canvas fullscreen via CSS class ──
      document.body.classList.add('preview-active');

      // Auto-fit zoom to fill viewport
      window._previewSavedZoom = zoomLevel;
      const vw = window.innerWidth, vh = window.innerHeight - 50; // 50px for banner
      const fitZoom = Math.min(vw / canvas.width, vh / canvas.height, 3);
      setZoom(Math.max(0.25, fitZoom));

      // Center scroll
      if (container) {
        setTimeout(() => {
          container.scrollLeft = (canvas.width * zoomLevel - container.clientWidth) / 2;
          container.scrollTop = (canvas.height * zoomLevel - container.clientHeight) / 2;
        }, 50);
      }

      // Add banner with exit button
      if (!previewBanner) {
        previewBanner = document.createElement('div');
        previewBanner.className = 'preview-banner';
        previewBanner.innerHTML = `
          <span>👁️ WASD di chuyển · Click pathfind · ESC thoát</span>
          <button class="preview-exit-btn" onclick="togglePreview()">✖ Thoát</button>
        `;
        container.style.position = container.style.position || 'relative';
        container.appendChild(previewBanner);
      }

      // Bind keyboard
      window.removeEventListener('keydown', onPreviewKeyDown);
      window.removeEventListener('keyup', onPreviewKeyUp);
      window.addEventListener('keydown', onPreviewKeyDown);
      window.addEventListener('keyup', onPreviewKeyUp);
      showToast('👁️ Chế độ xem trước – di chuyển nhân vật!');
    } else {
      // ── Restore all UI ──
      document.body.classList.remove('preview-active');
      // Restore zoom
      if (window._previewSavedZoom) { setZoom(window._previewSavedZoom); window._previewSavedZoom = null; }

      if (previewBanner) { previewBanner.remove(); previewBanner = null; }
      window.removeEventListener('keydown', onPreviewKeyDown);
      window.removeEventListener('keyup', onPreviewKeyUp);
      previewKeysDown.clear();
      showToast('✏️ Quay lại chế độ vẽ');
    }
    markDirty();
  };

  function onPreviewKeyDown(e) {
    if (e.key === 'Escape') { togglePreview(); return; }
    const k = e.key.toLowerCase();
    if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)) {
      e.preventDefault();
      previewKeysDown.add(k);
    }
  }

  function onPreviewKeyUp(e) {
    previewKeysDown.delete(e.key.toLowerCase());
  }

  function updatePreviewPlayer(now) {
    const dt = now - previewLastTime;
    previewLastTime = now;

    // Advance floor transition fade
    if (previewFade.active) {
      previewFade.alpha += previewFade.dir * (dt / 200); // 200ms per phase
      if (previewFade.dir === 1 && previewFade.alpha >= 1) {
        previewFade.alpha = 1;
        if (previewFade.callback) { previewFade.callback(); previewFade.callback = null; }
        previewFade.dir = -1; // start fade-in
      } else if (previewFade.dir === -1 && previewFade.alpha <= 0) {
        previewFade.alpha = 0;
        previewFade.active = false;
      }
      return; // freeze player movement during transition
    }

    // Animate sprite — only cycle frames when actually moving
    const isMoving = previewKeysDown.size > 0 || previewPath.length > 0 ||
      Math.abs(previewPlayer.renderX - previewPlayer.col) > 0.05 ||
      Math.abs(previewPlayer.renderY - previewPlayer.row) > 0.05;
    if (isMoving) {
      if (now - previewPlayer.lastAnim > 200) {
        previewPlayer.frame = (previewPlayer.frame + 1) % PREVIEW_SPRITE_COLS;
        previewPlayer.lastAnim = now;
      }
    } else {
      previewPlayer.frame = 0; // idle: reset to standing frame
    }

    // Smooth render position interpolation
    const speed = 16; // cells per second for smooth lerp
    const lerpAmt = Math.min(1, (dt / 1000) * speed);
    previewPlayer.renderX += (previewPlayer.col - previewPlayer.renderX) * lerpAmt;
    previewPlayer.renderY += (previewPlayer.row - previewPlayer.renderY) * lerpAmt;

    // Keyboard movement
    previewMoveAccum += dt;
    if (previewMoveAccum >= PREVIEW_MOVE_MS) {
      previewMoveAccum = 0;
      let dc = 0, dr = 0;
      if (previewKeysDown.has('w') || previewKeysDown.has('arrowup'))    { dr = -1; previewPlayer.dir = 0; }
      if (previewKeysDown.has('s') || previewKeysDown.has('arrowdown'))  { dr =  1; previewPlayer.dir = 2; }
      if (previewKeysDown.has('a') || previewKeysDown.has('arrowleft'))  { dc = -1; previewPlayer.dir = 3; }
      if (previewKeysDown.has('d') || previewKeysDown.has('arrowright')) { dc =  1; previewPlayer.dir = 1; }

      // 8-direction: allow diagonal when both keys pressed
      if (dc !== 0 || dr !== 0) {
        const nr = previewPlayer.row + dr, nc = previewPlayer.col + dc;
        // For diagonal, check that both axis cells are also walkable (no corner cutting)
        const isDiag = dc !== 0 && dr !== 0;
        const canMove = isPreviewWalkable(nr, nc) &&
          (!isDiag || (isPreviewWalkable(previewPlayer.row + dr, previewPlayer.col) &&
                       isPreviewWalkable(previewPlayer.row, previewPlayer.col + dc)));
        if (canMove) {
          previewPlayer.col = nc;
          previewPlayer.row = nr;
          // Set facing direction (use closest 4-dir for sprite)
          if (dr < 0 && dc === 0) previewPlayer.dir = 0;       // up
          else if (dr > 0 && dc === 0) previewPlayer.dir = 2;   // down
          else if (dc < 0) previewPlayer.dir = 3;               // left (incl diag)
          else if (dc > 0) previewPlayer.dir = 1;               // right (incl diag)
          previewPath = []; // cancel click path
          checkPreviewStairs();
        }
      }
    }

    // Click-to-move path following
    if (previewPath.length > 0 && previewKeysDown.size === 0) {
      // Check if close enough to current position
      const distX = Math.abs(previewPlayer.renderX - previewPlayer.col);
      const distY = Math.abs(previewPlayer.renderY - previewPlayer.row);
      if (distX < 0.15 && distY < 0.15) {
        const next = previewPath.shift();
        if (next) {
          // Set direction (use closest cardinal for sprite)
          const dc = next.c - previewPlayer.col;
          const dr = next.r - previewPlayer.row;
          if (Math.abs(dc) >= Math.abs(dr)) {
            previewPlayer.dir = dc > 0 ? 1 : 3; // right or left
          } else {
            previewPlayer.dir = dr > 0 ? 2 : 0; // down or up
          }
          previewPlayer.col = next.c;
          previewPlayer.row = next.r;
          checkPreviewStairs();
        }
      }
    }
  }

  function checkPreviewStairs() {
    if (previewFade.active) return;
    const tile = grid[previewPlayer.row]?.[previewPlayer.col];
    let targetFloor = -1, emoji = '';
    if (tile === 2 && currentFloorIdx < floors.length - 1) {
      targetFloor = currentFloorIdx + 1; emoji = '⬆️';
    } else if (tile === 3 && currentFloorIdx > 0) {
      targetFloor = currentFloorIdx - 1; emoji = '⬇️';
    }
    if (targetFloor < 0) return;
    const floorName = floors[targetFloor].name;
    previewFade.active = true;
    previewFade.alpha = 0;
    previewFade.dir = 1;
    previewFade.label = emoji + ' ' + floorName;
    previewFade.callback = () => {
      switchToFloor(targetFloor);
      previewPlayer.renderX = previewPlayer.col;
      previewPlayer.renderY = previewPlayer.row;
      previewPath = [];
    };
  }

  function previewClickMove(col, row) {
    if (col < 0 || col >= mapWidth || row < 0 || row >= mapHeight) return;
    if (!isPreviewWalkable(row, col)) return;
    // A* pathfinding (8-direction, diagonal support)
    const path = astarPath(previewPlayer.row, previewPlayer.col, row, col);
    if (path.length > 0) {
      previewPath = path;
    }
  }

  // A* pathfinding with 8-direction support (diagonal cost √2 ≈ 1.41)
  // Uses binary heap for O(n log n) performance
  function astarPath(sr, sc, er, ec) {
    if (sr === er && sc === ec) return [];
    const W = mapWidth, H = mapHeight;
    // Flat index
    const idx = (r, c) => r * W + c;
    const gScore = new Float32Array(H * W).fill(Infinity);
    const parent = new Int32Array(H * W).fill(-1);
    const closed = new Uint8Array(H * W);

    // Octile distance heuristic (consistent for 8-dir with √2 diagonal cost)
    const heuristic = (r, c) => {
      const dx = Math.abs(c - ec), dy = Math.abs(r - er);
      return dx + dy + (1.4142 - 2) * Math.min(dx, dy); // octile
    };

    // Binary min-heap on fScore
    const heap = [];
    const pushHeap = (r, c, f) => {
      heap.push({ r, c, f });
      let i = heap.length - 1;
      while (i > 0) {
        const pi = (i - 1) >> 1;
        if (heap[pi].f <= heap[i].f) break;
        [heap[pi], heap[i]] = [heap[i], heap[pi]];
        i = pi;
      }
    };
    const popHeap = () => {
      const top = heap[0];
      const last = heap.pop();
      if (heap.length > 0) {
        heap[0] = last;
        let i = 0;
        while (true) {
          let s = i, l = 2*i+1, ri = 2*i+2;
          if (l < heap.length && heap[l].f < heap[s].f) s = l;
          if (ri < heap.length && heap[ri].f < heap[s].f) s = ri;
          if (s === i) break;
          [heap[s], heap[i]] = [heap[i], heap[s]];
          i = s;
        }
      }
      return top;
    };

    // 8 directions: 4 cardinal + 4 diagonal
    const dirs = [
      [-1, 0, 1], [1, 0, 1], [0, -1, 1], [0, 1, 1],             // cardinal
      [-1, -1, 1.4142], [-1, 1, 1.4142], [1, -1, 1.4142], [1, 1, 1.4142]  // diagonal
    ];

    gScore[idx(sr, sc)] = 0;
    pushHeap(sr, sc, heuristic(sr, sc));

    while (heap.length > 0) {
      const { r, c } = popHeap();
      const ci = idx(r, c);
      if (closed[ci]) continue;
      closed[ci] = 1;

      if (r === er && c === ec) {
        // Reconstruct path
        const path = [];
        let cur = ci;
        while (cur !== idx(sr, sc)) {
          path.unshift({ r: Math.floor(cur / W), c: cur % W });
          cur = parent[cur];
        }
        return path;
      }

      const cg = gScore[ci];
      for (const [dr, dc, cost] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
        const ni = idx(nr, nc);
        if (closed[ni]) continue;
        if (!isPreviewWalkable(nr, nc)) continue;
        // Diagonal: prevent corner-cutting through walls
        if (dr !== 0 && dc !== 0) {
          if (!isPreviewWalkable(r + dr, c) || !isPreviewWalkable(r, c + dc)) continue;
        }
        const ng = cg + cost;
        if (ng < gScore[ni]) {
          gScore[ni] = ng;
          parent[ni] = ci;
          pushHeap(nr, nc, ng + heuristic(nr, nc));
        }
      }
    }
    return []; // no path found
  }

  function drawPreviewPlayer() {
    const img = images.player;
    if (!img || !img.complete) return;

    const frameW = img.width / PREVIEW_SPRITE_COLS;
    const frameH = img.height / PREVIEW_SPRITE_ROWS;
    const sx = previewPlayer.frame * frameW;
    const sy = previewPlayer.dir * frameH;
    const px = previewPlayer.renderX * CELL;
    const py = previewPlayer.renderY * CELL;

    // Draw player slightly larger than cell for visibility
    const size = CELL + 4;
    ctx.drawImage(img, sx, sy, frameW, frameH, px - 2, py - 2, size, size);

    // Draw path preview (connected line + dots)
    if (previewPath.length > 0) {
      ctx.save();
      // Draw line connecting path
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(previewPlayer.renderX * CELL + CELL / 2, previewPlayer.renderY * CELL + CELL / 2);
      previewPath.forEach(p => {
        ctx.lineTo(p.c * CELL + CELL / 2, p.r * CELL + CELL / 2);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      // Draw dots with fade based on distance
      previewPath.forEach((p, i) => {
        const t = 1 - i / previewPath.length; // fade from 1→0
        ctx.globalAlpha = 0.15 + 0.35 * t;
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(p.c * CELL + CELL / 2, p.r * CELL + CELL / 2, 2 + 2 * t, 0, Math.PI * 2);
        ctx.fill();
      });
      // Target marker
      const last = previewPath[previewPath.length - 1];
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(last.c * CELL + 4, last.r * CELL + 4, CELL - 8, CELL - 8);
      ctx.restore();
    }

    // Floor transition fade overlay
    if (previewFade.active && previewFade.alpha > 0) {
      ctx.save();
      ctx.globalAlpha = previewFade.alpha;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Floor name label
      if (previewFade.alpha > 0.5) {
        ctx.globalAlpha = (previewFade.alpha - 0.5) * 2;
        const cw = canvas.width, ch = canvas.height;
        // Background pill
        const label = previewFade.label;
        ctx.font = `bold ${Math.round(CELL * 0.7)}px 'Baloo 2', cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const tw = ctx.measureText(label).width;
        const pw = tw + 40, ph = CELL * 1.2;
        const rx = cw / 2 - pw / 2, ry = ch / 2 - ph / 2;
        ctx.fillStyle = 'rgba(6,182,212,0.25)';
        ctx.beginPath();
        if (ctx.roundRect) { ctx.roundRect(rx, ry, pw, ph, ph / 2); }
        else { /* fallback for older browsers */
          const rad = ph / 2;
          ctx.moveTo(rx + rad, ry);
          ctx.arcTo(rx + pw, ry, rx + pw, ry + ph, rad);
          ctx.arcTo(rx + pw, ry + ph, rx, ry + ph, rad);
          ctx.arcTo(rx, ry + ph, rx, ry, rad);
          ctx.arcTo(rx, ry, rx + pw, ry, rad);
          ctx.closePath();
        }
        ctx.fill();
        ctx.strokeStyle = 'rgba(6,182,212,0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#06b6d4';
        ctx.fillText(label, cw / 2, ch / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
      }
      ctx.restore();
    }
  }

  // ── TOAST ─────────────────────────────────────────────────
  let toastTimer;
  function showToast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  // ── MOBILE PANEL TOGGLE ──────────────────────────────────
  window.toggleMobilePanel = function(side) {
    const left = document.querySelector('.panel-left');
    const right = document.querySelector('.panel-right');
    const btnL = $('mobile-toggle-left');
    const btnR = $('mobile-toggle-right');

    if (side === 'left') {
      const show = !left.classList.contains('mobile-show');
      left.classList.toggle('mobile-show', show);
      right.classList.remove('mobile-show');
      if (btnL) btnL.classList.toggle('active', show);
      if (btnR) btnR.classList.remove('active');
    } else {
      const show = !right.classList.contains('mobile-show');
      right.classList.toggle('mobile-show', show);
      left.classList.remove('mobile-show');
      if (btnR) btnR.classList.toggle('active', show);
      if (btnL) btnL.classList.remove('active');
    }
  };

  // Mobile room panel toggle (floating button)
  window.toggleMobileRooms = function() {
    const right = document.querySelector('.panel-right');
    const btn = $('mobile-room-toggle');
    if (!right) return;
    const isOpen = right.classList.contains('mobile-open');
    right.classList.toggle('mobile-open', !isOpen);
    if (btn) btn.classList.toggle('active', !isOpen);
  };

  // Update mobile room count badge
  function updateMobileRoomCount() {
    const badge = $('mobile-room-count');
    if (badge) badge.textContent = rooms ? rooms.length : 0;
  }

  // Show mobile toggles on small screens
  function checkMobile() {
    const toggles = $('mobile-toggles');
    if (toggles) toggles.style.display = window.innerWidth <= 480 ? 'flex' : 'none';
  }
  window.addEventListener('resize', checkMobile);
  setTimeout(checkMobile, 100);

  // ── BOOTSTRAP ─────────────────────────────────────────────
  init();
})();
