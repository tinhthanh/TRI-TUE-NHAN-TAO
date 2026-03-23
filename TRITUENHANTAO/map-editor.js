// ============================================================
// Map Editor – Multi-Floor Indoor House Map
// Người Chăn Cừu
// ============================================================
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

  // Walkable tile IDs (anything except WALL=1)
  function isWalkableTile(t) { return t !== 1; }

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

  // ── UNDO / REDO ────────────────────────────────────────────
  const HISTORY_MAX = 50;
  let undoStack = [];  // array of serialized floors snapshots
  let redoStack = [];
  let isUndoRedo = false; // flag to prevent saving during undo/redo

  function snapshotFloors() {
    return JSON.parse(JSON.stringify(floors));
  }

  function saveHistory() {
    if (isUndoRedo) return;
    undoStack.push(snapshotFloors());
    if (undoStack.length > HISTORY_MAX) undoStack.shift();
    redoStack = []; // clear redo on new action
    updateUndoRedoBtns();
  }

  function undo() {
    if (undoStack.length === 0) return;
    isUndoRedo = true;
    redoStack.push(snapshotFloors());
    floors = undoStack.pop();
    switchToFloor(Math.min(currentFloorIdx, floors.length - 1));
    isUndoRedo = false;
    updateUndoRedoBtns();
    showToast('↩ Undo');
  }

  function redo() {
    if (redoStack.length === 0) return;
    isUndoRedo = true;
    undoStack.push(snapshotFloors());
    floors = redoStack.pop();
    switchToFloor(Math.min(currentFloorIdx, floors.length - 1));
    isUndoRedo = false;
    updateUndoRedoBtns();
    showToast('↪ Redo');
  }

  function updateUndoRedoBtns() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    if (undoBtn) undoBtn.disabled = undoStack.length === 0;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;
  }

  window.undo = undo;
  window.redo = redo;

  // ── ZOOM ───────────────────────────────────────────────────
  let zoomLevel = 1.0; // 0.1 to 4.0
  const ZOOM_MIN = 0.25, ZOOM_MAX = 4.0;

  function setZoom(z) {
    zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
    const pct = Math.round(zoomLevel * 100);
    canvas.style.width  = (canvas.width  * zoomLevel) + 'px';
    canvas.style.height = (canvas.height * zoomLevel) + 'px';
    const zoomLabel = document.getElementById('zoom-label');
    if (zoomLabel) zoomLabel.textContent = pct + '%';
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
    const btn = document.getElementById('fill-btn');
    if (btn) btn.classList.toggle('active', fillMode);
    canvas.style.cursor = fillMode ? 'cell' : 'crosshair';
    showToast(fillMode ? '🪣 Fill mode ON' : 'Fill mode OFF');
  };

  function floodFill(startCol, startRow, fillValue) {
    const targetValue = grid[startRow][startCol];
    if (targetValue === fillValue) return;
    saveHistory();
    const stack = [[startRow, startCol]];
    const visited = new Set();
    while (stack.length > 0) {
      const [r, c] = stack.pop();
      if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) continue;
      const key = r * 1000 + c;
      if (visited.has(key)) continue;
      if (grid[r][c] !== targetValue) continue;
      visited.add(key);
      grid[r][c] = fillValue;
      stack.push([r-1,c],[r+1,c],[r,c-1],[r,c+1]);
    }
    updateStats(); validate(); markDirty();
  }

  // ── COPY / PASTE REGION ──────────────────────────────────
  let selectMode = false;   // Ctrl held = selection drag
  let selStart = null;      // {col, row}
  let selEnd   = null;      // {col, row}
  let clipboard = null;     // { grid[][], roomMap[][], w, h }
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
    clipboard = { grid: g, roomMap: rm, w: sel.w, h: sel.h };
    showToast('📋 Đã copy ' + sel.w + '×' + sel.h + ' tiles');
  }

  function cutSelection() {
    const sel = getSelRect();
    if (!sel) return;
    copySelection();
    saveHistory();
    for (let r = sel.r1; r <= sel.r2; r++)
      for (let c = sel.c1; c <= sel.c2; c++) { grid[r][c] = 0; roomMap[r][c] = null; }
    selStart = selEnd = null;
    updateStats(); validate(); markDirty();
    showToast('✂️ Cut ' + sel.w + '×' + sel.h + ' tiles');
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
    saveHistory();
    for (let dr = 0; dr < clipboard.h; dr++) {
      for (let dc = 0; dc < clipboard.w; dc++) {
        const r = row + dr, c = col + dc;
        if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) continue;
        grid[r][c] = clipboard.grid[dr][dc];
        roomMap[r][c] = clipboard.roomMap[dr][dc];
      }
    }
    updateStats(); validate(); markDirty();
    showToast('✅ Đã dán!');
  }

  function cancelPaste() {
    pasteMode = false;
    pasteCursor = null;
    canvas.style.cursor = 'crosshair';
    markDirty();
  }

  window.copyRegion = copySelection;
  window.pasteRegion = startPaste;
  window.cutRegion = cutSelection;

  // Drawing state
  let currentTileId = 1;   // default: wall
  let brushSize = 1;
  let isPainting = false;
  let paintValue = 1;
  let hoverCol = -1, hoverRow = -1;
  let needsRedraw = true;
  let stairsPulse = 0;

  // Room paint mode: when a room tile (7/8/9/5) is placed, we also set roomId
  let currentRoomId = null;   // auto-generated or from room-name-input

  // ── DOM ────────────────────────────────────────────────────
  const canvas = document.getElementById('editor-canvas');
  const ctx    = canvas.getContext('2d');
  const validationBox = document.getElementById('validation-box');

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
    if (!restoreAutoSave()) {
      createInitialFloors();
    }
    bindSliders();
    bindEvents();
    updateFloorTabs();
    switchToFloor(currentFloorIdx);
    resizeCanvas();
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

  function switchToFloor(idx) {
    currentFloorIdx = idx;
    grid    = floors[idx].grid;
    roomMap = floors[idx].roomMap;
    rooms   = floors[idx].rooms;
    props   = floors[idx].props || [];
    if (!floors[idx].props) floors[idx].props = props;
    updateFloorTabs();
    updateStats();
    validate();
    updateRoomList();
    markDirty();
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
        const td = TILE_DEFS.find(t => t.id === id);
        if (!td) return;
        const btn = document.createElement('button');
        btn.className = 'tile-btn' + (td.id === currentTileId ? ' active' : '');
        btn.id = 'tile-btn-' + td.id;
        btn.title = td.name;

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


  window.selectTile = function (id) {
    currentTileId = id;
    document.querySelectorAll('.tile-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('tile-btn-' + id);
    if (btn) btn.classList.add('active');
    // Show room name bar for room tiles
    const isRoomTile = [5, 7, 8, 9].includes(id);
    document.getElementById('room-name-bar').style.display = isRoomTile ? 'flex' : 'none';
    const td = TILE_DEFS.find(t => t.id === id);
    document.getElementById('current-tile-label').textContent = td ? td.name : '?';
    markDirty();
  };

  window.applyRoomSettings = function () {
    const name  = document.getElementById('room-name-input').value.trim() || 'Phòng';
    const color = document.getElementById('room-color-input').value;
    // Create or update room in current floor
    currentRoomId = 'room_' + Date.now();
    floors[currentFloorIdx].rooms.push({ id: currentRoomId, name, color: hexToRgba(color, 0.22) });
    updateRoomList();
    showToast('✓ Đã đặt phòng: ' + name);
  };

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function updateRoomList() {
    const el = document.getElementById('room-list');
    const rs = floors[currentFloorIdx].rooms;
    if (rs.length === 0) {
      el.innerHTML = '<span style="color:var(--text-secondary)">Chưa có phòng nào.</span>';
      return;
    }
    el.innerHTML = rs.map(r =>
      `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <span style="width:12px;height:12px;border-radius:50%;background:${r.color};display:inline-block;"></span>
        ${r.name}
      </div>`
    ).join('');
  }

  // ── SLIDERS ───────────────────────────────────────────────
  function bindSliders() {
    const wSlider = document.getElementById('grid-w-slider');
    const hSlider = document.getElementById('grid-h-slider');
    wSlider.addEventListener('input', () => {
      document.getElementById('grid-width-value').textContent = wSlider.value;
    });
    hSlider.addEventListener('input', () => {
      document.getElementById('grid-height-value').textContent = hSlider.value;
    });
  }

  window.applyGridSize = function () {
    const nw = parseInt(document.getElementById('grid-w-slider').value);
    const nh = parseInt(document.getElementById('grid-h-slider').value);
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
    canvas.addEventListener('mouseleave', () => { hoverCol = -1; hoverRow = -1; markDirty(); });
    window.addEventListener('mouseup',    () => {
      if (isPainting) { isPainting = false; }
      if (selectMode) { selectMode = false; }
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   () => { isPainting = false; });

    // Zoom with scroll wheel
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      if (e.deltaY < 0) zoomIn(); else zoomOut();
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

      // Quick tile select: 1-9
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 9) {
        const quickTiles = [1, 0, 2, 3, 4, 5, 6, 7, 8];
        const tid = quickTiles[num - 1];
        if (tid !== undefined) selectTile(tid);
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

      // Escape: exit fill/eyedropper/paste mode
      if (e.key === 'Escape' && fillMode) { window.toggleFill(); return; }
      if (e.key === 'Escape' && eyedropperMode) { window.toggleEyedropper(); return; }
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
        const td = TILE_DEFS[picked];
        showToast('👁️ ' + (td ? td.name : 'Tile ' + picked));
        if (eyedropperMode) { eyedropperMode = false; const btn = document.getElementById('eyedropper-btn'); if (btn) btn.classList.remove('active'); canvas.style.cursor = 'crosshair'; }
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
    if (col !== hoverCol || row !== hoverRow) { hoverCol = col; hoverRow = row; markDirty(); }
    // Update selection drag
    if (selectMode && selStart) {
      selEnd = { col, row };
      markDirty();
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
    const tileDef = TILE_DEFS[tileId];
    let text = tileDef ? tileDef.emoji + ' ' + tileDef.name : '';
    if (roomId) {
      const room = rooms.find(r => r.id === roomId);
      if (room) text += '  ·  🏠 ' + room.name;
    }
    if (!text) { if (tooltipEl) tooltipEl.style.opacity = '0'; return; }
    const el = getTooltipEl();
    el.textContent = text;
    el.style.left  = (e.clientX + 14) + 'px';
    el.style.top   = (e.clientY - 28) + 'px';
    el.style.opacity = '1';
  }


  function onTouchStart(e) {
    e.preventDefault(); isPainting = true; paintValue = currentTileId;
    const t = e.touches[0];
    const { col, row } = cellAt({ clientX: t.clientX, clientY: t.clientY });
    paintAt(col, row, paintValue);
  }

  function onTouchMove(e) {
    e.preventDefault();
    if (!isPainting) return;
    const t = e.touches[0];
    const { col, row } = cellAt({ clientX: t.clientX, clientY: t.clientY });
    paintAt(col, row, paintValue);
  }

  // ── PAINT ─────────────────────────────────────────────────
  function paintAt(col, row, value) {
    const half = Math.floor(brushSize / 2);
    let changed = false;
    for (let dr = -half; dr < brushSize - half; dr++) {
      for (let dc = -half; dc < brushSize - half; dc++) {
        const r = row + dr, c = col + dc;
        if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) continue;

        // Check if this is a floor tile variant (has floorImage) — paint on ground layer
        const tdCheck = TILE_DEFS.find(t => t.id === value);
        const isFloorVariant = tdCheck && tdCheck.floorImage;

        if (value >= 10 && !isFloorVariant) {
          // Props layer — use find by ID since IDs may have gaps
          const td = tdCheck;
          if (!td || !td.propType) continue;
          const floorProps = floors[currentFloorIdx].props;
          const exIdx = floorProps.findIndex(p => p.r === r && p.c === c);
          if (exIdx >= 0) floorProps.splice(exIdx, 1);
          if (td.propType !== 'clear') {
            floorProps.push({ r, c, type: td.propType });
          }
          changed = true;
        } else {
          // Ground tile layer
          if (grid[r][c] !== value) { grid[r][c] = value; changed = true; }
          // Room assignment
          if (value === 0) {
            roomMap[r][c] = null; // erase clears room too
          } else if ([5, 7, 8, 9].includes(value) && currentRoomId) {
            roomMap[r][c] = currentRoomId;
          }
        }
      }
    }
    if (changed) {
      // Auto stair-link: when STAIRS_UP placed, create STAIRS_DOWN on floor above
      autoLinkStairs(col, row, value);
      updateStats(); validate(); markDirty();
    }
  }

  function autoLinkStairs(col, row, value) {
    const nextFloorIdx = (value === 2) ? currentFloorIdx + 1 : (value === 3 ? currentFloorIdx - 1 : -1);
    if (nextFloorIdx < 0 || nextFloorIdx >= floors.length) return;
    const targetTile = (value === 2) ? 3 : 2; // UP→DOWN on next, DOWN→UP on prev
    const half = Math.floor(brushSize / 2);
    for (let dr = -half; dr < brushSize - half; dr++) {
      for (let dc = -half; dc < brushSize - half; dc++) {
        const r = row + dr, c = col + dc;
        if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) continue;
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
    if (needsRedraw) { render(now); needsRedraw = false; }
    requestAnimationFrame(rafLoop);
  }

  function markDirty() {
    needsRedraw = true;
    scheduleAutoSave();
  }

  // ── GRID TOGGLE ─────────────────────────────────────────
  let showGrid = true;
  window.toggleGrid = function() {
    showGrid = !showGrid;
    const btn = document.getElementById('grid-toggle-btn');
    if (btn) btn.classList.toggle('active', showGrid);
    markDirty();
    showToast(showGrid ? 'Lưới: Bật' : 'Lưới: Tắt');
  };

  // ── AUTO-SAVE ─────────────────────────────────────────
  const AUTO_SAVE_KEY = 'mapEditor_autosave';
  let autoSaveTimer = null;

  function scheduleAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(doAutoSave, 1500);
  }

  function doAutoSave() {
    try {
      const data = JSON.stringify({
        floors: JSON.parse(JSON.stringify(floors)),
        mapWidth, mapHeight, currentFloorIdx,
        savedAt: Date.now()
      });
      localStorage.setItem(AUTO_SAVE_KEY, data);
      const indicator = document.getElementById('autosave-indicator');
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
      mapWidth = data.mapWidth || mapWidth;
      mapHeight = data.mapHeight || mapHeight;
      // Update sliders
      const wSlider = document.getElementById('grid-w-slider');
      const hSlider = document.getElementById('grid-h-slider');
      if (wSlider) { wSlider.value = mapWidth; document.getElementById('grid-width-value').textContent = mapWidth; }
      if (hSlider) { hSlider.value = mapHeight; document.getElementById('grid-height-value').textContent = mapHeight; }
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
    document.getElementById('import-modal').classList.add('open');
    document.getElementById('import-textarea').value = '';
    document.getElementById('import-textarea').focus();
  };
  window.closeImport = function() {
    document.getElementById('import-modal').classList.remove('open');
  };
  window.doImport = function() {
    const raw = document.getElementById('import-textarea').value.trim();
    if (!raw) return;
    try {
      const obj = JSON.parse(raw);
      if (!obj.floors || !Array.isArray(obj.floors)) throw new Error('Invalid format');
      saveHistory();
      mapWidth  = obj.width  || mapWidth;
      mapHeight = obj.height || mapHeight;
      floors = obj.floors.map(f => ({
        name:    f.name    || 'Tầng',
        grid:    f.grid    || [],
        roomMap: f.roomMap || f.grid.map(r => r.map(() => null)),
        rooms:   f.rooms   || [],
        props:   f.props   || []
      }));
      const wSlider = document.getElementById('grid-w-slider');
      const hSlider = document.getElementById('grid-h-slider');
      if (wSlider) { wSlider.value = mapWidth; document.getElementById('grid-width-value').textContent = mapWidth; }
      if (hSlider) { hSlider.value = mapHeight; document.getElementById('grid-height-value').textContent = mapHeight; }
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
    const modal = document.getElementById('import-modal');
    if (modal && e.target === modal) closeImport();
  });

  // ── EYEDROPPER ───────────────────────────────────────────
  let eyedropperMode = false;
  window.toggleEyedropper = function() {
    eyedropperMode = !eyedropperMode;
    const btn = document.getElementById('eyedropper-btn');
    if (btn) btn.classList.toggle('active', eyedropperMode);
    canvas.style.cursor = eyedropperMode ? 'crosshair' : (fillMode ? 'cell' : 'crosshair');
    showToast(eyedropperMode ? '👁️ Eyedropper ON (Alt+click)' : 'Eyedropper OFF');
  };

  // ── MINI-MAP ──────────────────────────────────────────────
  let showMiniMap = true;
  window.toggleMiniMap = function() {
    showMiniMap = !showMiniMap;
    const btn = document.getElementById('minimap-btn');
    if (btn) btn.classList.toggle('active', showMiniMap);
    const mm = document.getElementById('mini-map-canvas');
    if (mm) mm.style.display = showMiniMap ? 'block' : 'none';
    markDirty();
  };

  function drawMiniMap() {
    const mm = document.getElementById('mini-map-canvas');
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
        const td = TILE_DEFS[t];
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

  // ── RENDER ────────────────────────────────────────────────
  function render(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pass 1: Ground tiles + room overlays
    for (let r = 0; r < mapHeight; r++) {
      for (let c = 0; c < mapWidth; c++) {
        drawGroundTile(c * CELL, r * CELL, grid[r][c], roomMap[r][c]);
      }
    }

    // Pass 1.5: Props layer (rendered as PNG images with transparency)
    if (props) {
      props.forEach(p => {
        const x = p.c * CELL;
        const y = p.r * CELL;
        const imgKey = 'prop_' + p.type;
        const propImg = images[imgKey];
        if (propImg && propImg.complete && propImg.naturalWidth > 0) {
          // Draw PNG with transparency — no black background
          ctx.drawImage(propImg, x + 1, y + 1, CELL - 2, CELL - 2);
        } else {
          // Fallback: emoji (no black background)
          ctx.fillStyle = '#fff';
          ctx.font = '20px sans-serif';
          ctx.textAlign = 'center';
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
          ctx.fillText(emj, x + CELL / 2, y + CELL / 2 + 7);
          ctx.textAlign = 'left';
        }
      });
    }

    // Pass 2: Ambient occlusion
    for (let r = 0; r < mapHeight; r++) {
      for (let c = 0; c < mapWidth; c++) {
        if (grid[r][c] !== 1) continue;
        const x = c * CELL, y = r * CELL;
        if (r + 1 < mapHeight && grid[r + 1][c] !== 1) {
          ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(x, y + CELL, CELL, 5);
        }
        if (c + 1 < mapWidth && grid[r][c + 1] !== 1) {
          ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x + CELL, y, 4, CELL);
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
          if (images.wallSide) ctx.drawImage(images.wallSide, x, y + CELL, CELL, 12);
          else { ctx.fillStyle = '#3a2210'; ctx.fillRect(x, y + CELL, CELL, 12); }
          const fg = ctx.createLinearGradient(x, y + CELL, x, y + CELL + 12);
          fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(0,0,0,0.55)');
          ctx.fillStyle = fg; ctx.fillRect(x, y + CELL, CELL, 12);
        }
        if (showRight) {
          ctx.save(); ctx.globalAlpha = 0.65;
          if (images.wallSide) ctx.drawImage(images.wallSide, x + CELL, y, 6, CELL);
          else { ctx.fillStyle = '#251608'; ctx.fillRect(x + CELL, y, 6, CELL); }
          ctx.restore();
          const rg = ctx.createLinearGradient(x + CELL, y, x + CELL + 6, y);
          rg.addColorStop(0, 'rgba(0,0,0,0.48)'); rg.addColorStop(1, 'rgba(0,0,0,0.82)');
          ctx.fillStyle = rg; ctx.fillRect(x + CELL, y, 6, CELL);
        }
      }
    }

    // Pass 4: Wall top faces
    for (let r = 0; r < mapHeight; r++) {
      for (let c = 0; c < mapWidth; c++) {
        if (grid[r][c] !== 1) continue;
        const x = c * CELL, y = r * CELL;
        if (images.wall) ctx.drawImage(images.wall, x, y, CELL, CELL);
        else { ctx.fillStyle = '#7a6a5a'; ctx.fillRect(x, y, CELL, CELL); }
        ctx.fillStyle = 'rgba(255,245,220,0.1)'; ctx.fillRect(x, y, CELL, 2); ctx.fillRect(x, y, 2, CELL);
        ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fillRect(x + CELL - 2, y, 2, CELL); ctx.fillRect(x, y + CELL - 2, CELL, 2);
      }
    }

    // Pass 5: Grid lines
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.5;
      for (let r = 0; r <= mapHeight; r++) {
        ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(mapWidth * CELL, r * CELL); ctx.stroke();
      }
      for (let c = 0; c <= mapWidth; c++) {
        ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, mapHeight * CELL); ctx.stroke();
      }
    }

    // Pass 6: Hover preview (only in editor mode)
    if (!previewMode && hoverCol >= 0 && hoverRow >= 0) drawHoverPreview();

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

    // Pass 6.6: Paste ghost preview
    if (pasteMode && pasteCursor && clipboard) {
      ctx.save();
      ctx.globalAlpha = 0.45;
      for (let dr = 0; dr < clipboard.h; dr++) {
        for (let dc = 0; dc < clipboard.w; dc++) {
          const r = pasteCursor.row + dr, c = pasteCursor.col + dc;
          if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) continue;
          const tileId = clipboard.grid[dr][dc];
          const td = TILE_DEFS[tileId];
          ctx.fillStyle = td ? td.color : '#555';
          ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
        }
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(16,185,129,0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(pasteCursor.col * CELL, pasteCursor.row * CELL,
                     clipboard.w * CELL, clipboard.h * CELL);
      ctx.restore();
    }

    // Pass 7: Preview mode player
    if (previewMode) drawPreviewPlayer();

    // Pass 8: Mini-map overlay
    drawMiniMap();
  }

  // ── GROUND TILE DRAWING ───────────────────────────────────
  function drawGroundTile(x, y, tileId, roomId) {
    switch (tileId) {
      case 1: return; // wall drawn in later passes
      case 6:
        if (images.grass) ctx.drawImage(images.grass, x, y, CELL, CELL);
        else { ctx.fillStyle = '#2d5a1e'; ctx.fillRect(x, y, CELL, CELL); }
        return;
      case 5:
        if (images.balcony) ctx.drawImage(images.balcony, x, y, CELL, CELL);
        else { ctx.fillStyle = '#b0bec5'; ctx.fillRect(x, y, CELL, CELL); }
        return;
      case 4:
        if (images.floorTile) ctx.drawImage(images.floorTile, x, y, CELL, CELL);
        else { ctx.fillStyle = '#e8dcc8'; ctx.fillRect(x, y, CELL, CELL); }
        if (images.door) ctx.drawImage(images.door, x + 2, y + 2, CELL - 4, CELL - 4);
        return;
      case 2:
      case 3: {
        if (images.floorTile) ctx.drawImage(images.floorTile, x, y, CELL, CELL);
        else { ctx.fillStyle = '#c8b89a'; ctx.fillRect(x, y, CELL, CELL); }
        if (images.stairsUp) ctx.drawImage(images.stairsUp, x, y, CELL, CELL);
        const p = 0.4 + 0.4 * Math.abs(Math.sin(stairsPulse / 600));
        ctx.fillStyle = tileId === 2 ? `rgba(6,182,212,${p * 0.45})` : `rgba(139,92,246,${p * 0.45})`;
        ctx.fillRect(x, y, CELL, CELL);
        // Arrow label
        ctx.fillStyle = tileId === 2 ? '#06b6d4' : '#8b5cf6';
        ctx.font = `bold ${Math.round(CELL * 0.5)}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(tileId === 2 ? '↑' : '↓', x + CELL / 2, y + CELL / 2);
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        return;
      }
      default: {
        // Check if this tile has a custom floor image (variants 27-31)
        const tileDef = TILE_DEFS.find(t => t.id === tileId);
        if (tileDef && tileDef.floorImage && images[tileDef.floorImage]) {
          ctx.drawImage(images[tileDef.floorImage], x, y, CELL, CELL);
        } else if (images.floorTile) {
          ctx.drawImage(images.floorTile, x, y, CELL, CELL);
        } else {
          ctx.fillStyle = '#e8dcc8'; ctx.fillRect(x, y, CELL, CELL);
        }
        // Room color overlay
        if (roomId) {
          const room = rooms.find(r => r.id === roomId);
          if (room) { ctx.fillStyle = room.color; ctx.fillRect(x, y, CELL, CELL); }
        } else if (tileId === 7) {
          ctx.fillStyle = 'rgba(13,148,136,0.25)'; ctx.fillRect(x, y, CELL, CELL);
        } else if (tileId === 8) {
          ctx.fillStyle = 'rgba(249,115,22,0.18)'; ctx.fillRect(x, y, CELL, CELL);
        } else if (tileId === 9) {
          ctx.fillStyle = 'rgba(168,85,247,0.18)'; ctx.fillRect(x, y, CELL, CELL);
        }
      }
    }
  }

  // ── HOVER PREVIEW ─────────────────────────────────────────
  function drawHoverPreview() {
    const half = Math.floor(brushSize / 2);
    const td   = TILE_DEFS[currentTileId] || TILE_DEFS[0];

    ctx.save();
    ctx.globalAlpha = 0.48;
    for (let dr = -half; dr < brushSize - half; dr++) {
      for (let dc = -half; dc < brushSize - half; dc++) {
        const r = hoverRow + dr, c = hoverCol + dc;
        if (r < 0 || r >= mapHeight || c < 0 || c >= mapWidth) continue;
        drawGroundTile(c * CELL, r * CELL, currentTileId, null);
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
  function updateStats() {
    let walls = 0, walkable = 0;
    for (let r = 0; r < mapHeight; r++)
      for (let c = 0; c < mapWidth; c++)
        if (grid[r][c] === 1) walls++; else walkable++;
    const total = mapWidth * mapHeight;
    document.getElementById('stat-size').textContent = `${mapWidth}×${mapHeight}`;
    document.getElementById('stat-walk').textContent = walkable;
    document.getElementById('stat-wall').textContent = walls;
    document.getElementById('stat-pct').textContent  = Math.round((walls / total) * 100) + '%';
  }

  // ── VALIDATION ────────────────────────────────────────────
  function validate() {
    const issues = [];
    let walkable = 0;
    for (let r = 0; r < mapHeight; r++)
      for (let c = 0; c < mapWidth; c++)
        if (isWalkableTile(grid[r][c])) walkable++;

    if (walkable < 4) issues.push('Cần ít nhất 4 ô walkable.');

    // BFS connectivity
    const first = findFirstWalkable();
    if (first && walkable >= 4) {
      const reach = bfsCount(first.r, first.c);
      if (reach < 4) issues.push(`Chỉ ${reach} ô liên thông.`);
    }

    if (issues.length === 0) {
      validationBox.className = 'validation-box ok';
      validationBox.textContent = `✅ Tầng hợp lệ! ${walkable} ô walkable.`;
    } else {
      validationBox.className = 'validation-box warn';
      validationBox.innerHTML = '⚠️ ' + issues.join('<br>⚠️ ');
    }
    return issues.length === 0;
  }

  function findFirstWalkable() {
    for (let r = 0; r < mapHeight; r++)
      for (let c = 0; c < mapWidth; c++)
        if (isWalkableTile(grid[r][c])) return { r, c };
    return null;
  }

  function bfsCount(sr, sc) {
    const vis = Array.from({ length: mapHeight }, () => new Array(mapWidth).fill(false));
    const q = [[sr, sc]];
    vis[sr][sc] = true;
    let n = 0;
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    while (q.length) {
      const [r, c] = q.shift(); n++;
      dirs.forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < mapHeight && nc >= 0 && nc < mapWidth && !vis[nr][nc] && isWalkableTile(grid[nr][nc])) {
          vis[nr][nc] = true; q.push([nr, nc]);
        }
      });
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

  // ── ACTIONS ───────────────────────────────────────────────
  window.clearMap = async function () {
    const ok = await showConfirm('Xóa toàn bộ tầng <strong>' + floors[currentFloorIdx].name + '</strong>?');
    if (!ok) return;
    for (let r = 0; r < mapHeight; r++)
      for (let c = 0; c < mapWidth; c++) { grid[r][c] = 0; roomMap[r][c] = null; }
    updateStats(); validate(); markDirty();
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
        if (Math.random() < 0.28) grid[r][c] = 1;
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
    document.getElementById('export-textarea').value = JSON.stringify(obj, null, 2);
    document.getElementById('export-modal').classList.add('open');
  };
  window.closeExport = function () { document.getElementById('export-modal').classList.remove('open'); };
  window.copyExport = function () {
    const ta = document.getElementById('export-textarea'); ta.select();
    try { document.execCommand('copy'); showToast('📎 Đã copy!'); }
    catch { navigator.clipboard.writeText(ta.value).then(() => showToast('📎 Đã copy!')); }
  };
  document.getElementById('export-modal').addEventListener('click', function(e) {
    if (e.target === this) closeExport();
  });

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
      document.getElementById('grid-w-slider').value = mapWidth;
      document.getElementById('grid-h-slider').value = mapHeight;
      document.getElementById('grid-width-value').textContent = mapWidth;
      document.getElementById('grid-height-value').textContent = mapHeight;

      if (data.floors && Array.isArray(data.floors)) {
        floors = data.floors.map(f => ({
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
    const btn = document.getElementById('preview-btn');
    const container = document.querySelector('.canvas-container');

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
      btn.textContent = '✖ Thoát Preview';
      btn.classList.add('active');
      // Add banner
      if (!previewBanner) {
        previewBanner = document.createElement('div');
        previewBanner.className = 'preview-banner';
        previewBanner.textContent = '👁️ PREVIEW – WASD/Arrow di chuyển · Click để đi · ESC thoát';
        container.style.position = 'relative';
        container.appendChild(previewBanner);
      }
      // Bind keyboard
      window.addEventListener('keydown', onPreviewKeyDown);
      window.addEventListener('keyup', onPreviewKeyUp);
      showToast('👁️ Chế độ xem trước – di chuyển nhân vật!');
    } else {
      btn.textContent = '👁️ Xem trước Map';
      btn.classList.remove('active');
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

    // Animate sprite
    if (now - previewPlayer.lastAnim > 200) {
      previewPlayer.frame = (previewPlayer.frame + 1) % PREVIEW_SPRITE_COLS;
      previewPlayer.lastAnim = now;
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

      if ((dc !== 0 || dr !== 0) && isPreviewWalkable(previewPlayer.row + dr, previewPlayer.col + dc)) {
        previewPlayer.col += dc;
        previewPlayer.row += dr;
        previewPath = []; // cancel click path
        checkPreviewStairs();
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
          // Set direction
          if (next.c > previewPlayer.col) previewPlayer.dir = 1;
          else if (next.c < previewPlayer.col) previewPlayer.dir = 3;
          else if (next.r > previewPlayer.row) previewPlayer.dir = 2;
          else if (next.r < previewPlayer.row) previewPlayer.dir = 0;
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
    // Simple BFS pathfinding
    const path = bfsPath(previewPlayer.row, previewPlayer.col, row, col);
    if (path.length > 0) {
      previewPath = path;
    }
  }

  function bfsPath(sr, sc, er, ec) {
    if (sr === er && sc === ec) return [];
    const vis = Array.from({ length: mapHeight }, () => new Array(mapWidth).fill(false));
    const parent = Array.from({ length: mapHeight }, () => new Array(mapWidth).fill(null));
    const q = [[sr, sc]];
    vis[sr][sc] = true;
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    while (q.length) {
      const [r, c] = q.shift();
      if (r === er && c === ec) {
        // Reconstruct
        const path = [];
        let cr = er, cc = ec;
        while (cr !== sr || cc !== sc) {
          path.unshift({ r: cr, c: cc });
          const p = parent[cr][cc];
          cr = p[0]; cc = p[1];
        }
        return path;
      }
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < mapHeight && nc >= 0 && nc < mapWidth && !vis[nr][nc] && isPreviewWalkable(nr, nc)) {
          vis[nr][nc] = true;
          parent[nr][nc] = [r, c];
          q.push([nr, nc]);
        }
      }
    }
    return []; // no path
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

    // Draw path preview dots
    if (previewPath.length > 0) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#06b6d4';
      previewPath.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.c * CELL + CELL / 2, p.r * CELL + CELL / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      });
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
        ctx.roundRect(rx, ry, pw, ph, ph / 2);
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
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  // ── BOOTSTRAP ─────────────────────────────────────────────
  init();
})();
