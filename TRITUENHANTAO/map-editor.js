// ============================================================
// Map Editor – Multi-Floor Indoor House Map
// Người Chăn Cừu
// ============================================================
(function () {
  'use strict';

  // ── TILE DEFINITIONS ───────────────────────────────────────
  const TILE_DEFS = [
    { id: 0, name: 'Sàn (Floor)',      emoji: '⬜', color: '#e8dcc8', paint: 0 },
    { id: 1, name: 'Tường (Wall)',     emoji: '🧱', color: '#7a6a5a', paint: 1 },
    { id: 2, name: 'Cầu thang ↑',     emoji: '🔼', color: '#06b6d4', paint: 2 },
    { id: 3, name: 'Cầu thang ↓',     emoji: '🔽', color: '#8b5cf6', paint: 3 },
    { id: 4, name: 'Cửa (Door)',       emoji: '🚪', color: '#d97706', paint: 4 },
    { id: 5, name: 'Ban công',         emoji: '🌿', color: '#b0bec5', paint: 5 },
    { id: 6, name: 'Sân ngoài',       emoji: '🌱', color: '#2d6a1e', paint: 6 },
    { id: 7, name: 'WC',              emoji: '🚽', color: '#0d9488', paint: 7 },
    { id: 8, name: 'Bếp/Giặt/Phòng', emoji: '🏠', color: '#f97316', paint: 8 },
    { id: 9, name: 'Phòng ngủ',       emoji: '🛏',  color: '#a855f7', paint: 9 },
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

  // Rooms: user defines name+color per room tile they paint
  // roomMap[row][col] = roomId (string) or null
  // rooms = [{id, name, color}]

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
    createInitialFloors();
    bindSliders();
    bindEvents();
    updateFloorTabs();
    switchToFloor(0);
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
    return { name, grid: g, roomMap: rm, rooms: [] };
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
  function buildTilePalette() {
    const container = document.getElementById('tile-palette');
    container.innerHTML = '';
    TILE_DEFS.forEach(td => {
      const btn = document.createElement('button');
      btn.className = 'tile-btn' + (td.id === currentTileId ? ' active' : '');
      btn.id = 'tile-btn-' + td.id;
      btn.title = td.name;
      btn.innerHTML = `<span class="tile-emoji">${td.emoji}</span><span class="tile-name">${td.name}</span>`;
      btn.style.setProperty('--tile-color', td.color);
      btn.onclick = () => selectTile(td.id);
      container.appendChild(btn);
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
    document.getElementById('current-tile-label').textContent = TILE_DEFS[id]?.name || '?';
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
    window.addEventListener('mouseup',    () => { isPainting = false; });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   () => { isPainting = false; });
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
    isPainting = true;
    paintValue = (e.button === 2 || e.shiftKey) ? 0 : currentTileId;
    const { col, row } = cellAt(e);
    paintAt(col, row, paintValue);
  }

  function onMouseMove(e) {
    const { col, row } = cellAt(e);
    if (col !== hoverCol || row !== hoverRow) { hoverCol = col; hoverRow = row; markDirty(); }
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
        if (grid[r][c] !== value) { grid[r][c] = value; changed = true; }
        // Room assignment
        if (value === 0) {
          roomMap[r][c] = null; // erase clears room too
        } else if ([5, 7, 8, 9].includes(value) && currentRoomId) {
          roomMap[r][c] = currentRoomId;
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
    if (needsRedraw) { render(now); needsRedraw = false; }
    requestAnimationFrame(rafLoop);
  }

  function markDirty() { needsRedraw = true; }

  // ── RENDER ────────────────────────────────────────────────
  function render(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pass 1: Ground tiles + room overlays
    for (let r = 0; r < mapHeight; r++) {
      for (let c = 0; c < mapWidth; c++) {
        drawGroundTile(c * CELL, r * CELL, grid[r][c], roomMap[r][c]);
      }
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
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.5;
    for (let r = 0; r <= mapHeight; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(mapWidth * CELL, r * CELL); ctx.stroke();
    }
    for (let c = 0; c <= mapWidth; c++) {
      ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, mapHeight * CELL); ctx.stroke();
    }

    // Pass 6: Hover preview
    if (hoverCol >= 0 && hoverRow >= 0) drawHoverPreview();
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
        // Floor tiles (0, 7, 8, 9 = room types)
        if (images.floorTile) ctx.drawImage(images.floorTile, x, y, CELL, CELL);
        else { ctx.fillStyle = '#e8dcc8'; ctx.fillRect(x, y, CELL, CELL); }
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

  // ── ACTIONS ───────────────────────────────────────────────
  window.clearMap = function () {
    if (!confirm('Xóa toàn bộ tầng ' + floors[currentFloorIdx].name + '?')) return;
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
