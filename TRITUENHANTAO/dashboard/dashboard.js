// ============================================
// VetGo Isometric Dashboard
// ============================================
(function () {
  'use strict';

  const CELL = 34; // px per grid cell
  const STORAGE_KEY = 'vetgo_dashboard_v2';
  const MAP_URL = 'vet_clinic_map.json';

  const STATUS_LABELS = {
    available: 'Trống',
    occupied: 'Đang dùng',
    waiting: 'Chờ',
    maintenance: 'Bảo trì',
  };

  const STATUS_COLORS = {
    available: 'rgba(34,197,94,0.25)',
    occupied: 'rgba(239,68,68,0.3)',
    waiting: 'rgba(234,179,8,0.3)',
    maintenance: 'rgba(107,114,128,0.25)',
  };

  // ── State ──
  let mapData = null;
  let activeFloor = 0;
  let roomStates = {};
  let roomBounds = {}; // roomId → { top, left, width, height } in cells
  let modalRoomId = null;
  let modalSelectedStatus = null;

  // ── Init ──
  async function init() {
    await loadMap();
    loadState();
    computeRoomBounds();
    renderDate();
    renderFloorTabs();
    renderIsoFloors();
    renderSidebar();
    updateStats();
    bindModal();
    setInterval(renderDate, 60000);
  }

  // ── Load map JSON ──
  async function loadMap() {
    try {
      const res = await fetch(MAP_URL);
      mapData = await res.json();
    } catch (e) {
      console.error('Failed to load map:', e);
    }
  }

  // ── Compute room bounding boxes from roomMap ──
  function computeRoomBounds() {
    if (!mapData) return;
    roomBounds = {};

    mapData.floors.forEach((floor, fi) => {
      const rm = floor.roomMap;
      if (!rm) return;

      const seen = {};
      for (let r = 0; r < rm.length; r++) {
        for (let c = 0; c < rm[r].length; c++) {
          const id = rm[r][c];
          if (!id) continue;
          const key = fi + ':' + id;
          if (!seen[key]) {
            seen[key] = { minR: r, maxR: r, minC: c, maxC: c, floorIdx: fi, id: id };
          } else {
            seen[key].minR = Math.min(seen[key].minR, r);
            seen[key].maxR = Math.max(seen[key].maxR, r);
            seen[key].minC = Math.min(seen[key].minC, c);
            seen[key].maxC = Math.max(seen[key].maxC, c);
          }
        }
      }

      for (const key in seen) {
        const b = seen[key];
        roomBounds[key] = {
          id: b.id,
          floorIdx: b.floorIdx,
          top: b.minR,
          left: b.minC,
          width: b.maxC - b.minC + 1,
          height: b.maxR - b.minR + 1,
        };
      }
    });
  }

  // ── State persistence ──
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { roomStates = JSON.parse(saved); return; }
    } catch (e) { /* ignore */ }

    // Default all available
    if (!mapData) return;
    mapData.floors.forEach((floor) => {
      if (!floor.rooms) return;
      floor.rooms.forEach(room => {
        if (!roomStates[room.id]) {
          roomStates[room.id] = { status: 'available', petName: '' };
        }
      });
    });
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roomStates));
  }

  // ── Date ──
  function renderDate() {
    const el = document.getElementById('header-date');
    const now = new Date();
    const days = ['CN','T2','T3','T4','T5','T6','T7'];
    const pad = n => String(n).padStart(2, '0');
    el.textContent = days[now.getDay()] + ' ' + pad(now.getDate()) + '/' + pad(now.getMonth()+1) + ' — ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
  }

  // ── Floor Tabs ──
  function renderFloorTabs() {
    const nav = document.getElementById('floor-tabs');
    nav.innerHTML = '';
    if (!mapData) return;

    const icons = ['🏪', '🩺', '📦'];
    mapData.floors.forEach((floor, i) => {
      const btn = document.createElement('button');
      btn.className = 'floor-tab' + (i === activeFloor ? ' active' : '');
      const occ = countFloorOccupied(i);
      btn.innerHTML =
        '<span class="tab-icon">' + (icons[i] || '🏢') + '</span>' +
        '<span class="tab-num">' + (i + 1) + '</span>' +
        '<span class="tab-label">' + (i === 0 ? 'GROUND' : i === 1 ? '2ND FLOOR' : '3RD FLOOR') + '</span>' +
        (occ > 0 ? '<span class="tab-badge">' + occ + '</span>' : '');
      btn.addEventListener('click', () => switchFloor(i));
      nav.appendChild(btn);
    });
  }

  function switchFloor(idx) {
    activeFloor = idx;
    // Update tab active states
    document.querySelectorAll('.floor-tab').forEach((tab, i) => {
      tab.classList.toggle('active', i === idx);
    });
    // Update floor visibility
    document.querySelectorAll('.iso-floor').forEach((el, i) => {
      el.classList.toggle('active', i === idx);
      el.classList.toggle('inactive', i !== idx);
    });
    // Update floor title
    if (mapData) {
      document.getElementById('floor-title').textContent = mapData.floors[idx].name;
    }
    // Update sidebar minimap highlights
    document.querySelectorAll('.mini-floor').forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });
  }

  // ── Isometric Floors ──
  function renderIsoFloors() {
    const container = document.getElementById('iso-container');
    container.innerHTML = '';
    if (!mapData) return;

    const w = mapData.width;
    const h = mapData.height;
    const floorW = w * CELL;
    const floorH = h * CELL;

    // Container size for centering
    const totalFloors = mapData.totalFloors;
    const stackGap = 140;
    container.style.width = floorW + 'px';
    container.style.height = (floorH + stackGap * (totalFloors - 1)) + 'px';

    mapData.floors.forEach((floor, fi) => {
      const floorEl = document.createElement('div');
      floorEl.className = 'iso-floor' + (fi === activeFloor ? ' active' : ' inactive');
      floorEl.style.width = floorW + 'px';
      floorEl.style.height = floorH + 'px';

      // Stack position: bottom floor at bottom, top at top
      const yOffset = (totalFloors - 1 - fi) * stackGap;
      floorEl.style.left = '0px';
      floorEl.style.top = yOffset + 'px';

      // Click on floor background to switch
      floorEl.addEventListener('click', (e) => {
        if (e.target === floorEl || e.target.classList.contains('floor-grid')) {
          switchFloor(fi);
        }
      });

      // Floor grid background
      const gridEl = document.createElement('div');
      gridEl.className = 'floor-grid';
      gridEl.style.width = floorW + 'px';
      gridEl.style.height = floorH + 'px';

      // Draw wall cells
      const grid = floor.grid;
      for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
          if (grid[r] && grid[r][c] === 1) {
            const wallEl = document.createElement('div');
            wallEl.className = 'wall-overlay';
            wallEl.style.left = c * CELL + 'px';
            wallEl.style.top = r * CELL + 'px';
            wallEl.style.width = CELL + 'px';
            wallEl.style.height = CELL + 'px';
            gridEl.appendChild(wallEl);
          }
        }
      }

      // Draw room blocks
      if (floor.rooms) {
        floor.rooms.forEach(room => {
          const key = fi + ':' + room.id;
          const bounds = roomBounds[key];
          if (!bounds) return;

          const state = roomStates[room.id] || { status: 'available', petName: '' };
          const roomEl = createRoomBlock(room, state, bounds);
          gridEl.appendChild(roomEl);
        });
      }

      floorEl.appendChild(gridEl);
      container.appendChild(floorEl);
    });

    // Set floor title
    document.getElementById('floor-title').textContent = mapData.floors[activeFloor].name;
  }

  function createRoomBlock(room, state, bounds) {
    const el = document.createElement('div');
    el.className = 'room-block status-' + state.status;
    el.style.left = bounds.left * CELL + 'px';
    el.style.top = bounds.top * CELL + 'px';
    el.style.width = bounds.width * CELL + 'px';
    el.style.height = bounds.height * CELL + 'px';

    // Room color from JSON as overlay
    if (room.color) {
      el.style.background = room.color;
      // Override with status tint
      const statusBg = STATUS_COLORS[state.status];
      if (state.status !== 'available') {
        el.style.background = statusBg;
      }
    }

    let html = '<div class="room-label">' + escapeHtml(room.name) + '</div>';
    html += '<div class="room-status-line">';
    html += '<span class="stat-dot ' + state.status + '"></span> ';
    html += STATUS_LABELS[state.status];
    html += '</div>';

    if (state.petName && (state.status === 'occupied' || state.status === 'waiting')) {
      html += '<div class="room-pet-name">🐾 ' + escapeHtml(state.petName) + '</div>';
      html += '<span class="room-count-badge">1</span>';
    }

    el.innerHTML = html;
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(room.id);
    });
    return el;
  }

  // ── Sidebar ──
  function renderSidebar() {
    renderMinimap();
    renderSidebarStats();
  }

  function renderMinimap() {
    const container = document.getElementById('sidebar-minimaps');
    container.innerHTML = '';
    if (!mapData) return;

    const miniCell = 3;
    mapData.floors.forEach((floor, fi) => {
      const div = document.createElement('div');
      div.className = 'mini-floor' + (fi === activeFloor ? ' active' : '');
      div.addEventListener('click', () => switchFloor(fi));

      const pct = Math.round(countFloorOccupied(fi) / (floor.rooms ? floor.rooms.length : 1) * 100);
      div.innerHTML =
        '<div class="mini-floor-header">' +
          '<span class="mini-floor-label">🏢 Tầng ' + (fi + 1) + '</span>' +
          '<span class="mini-floor-pct">' + pct + ' %</span>' +
        '</div>';

      // Mini canvas
      const canvas = document.createElement('canvas');
      canvas.className = 'mini-floor-grid';
      canvas.width = mapData.width * miniCell;
      canvas.height = mapData.height * miniCell;
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.display = 'block';

      const ctx = canvas.getContext('2d');
      const grid = floor.grid;
      const rm = floor.roomMap;

      for (let r = 0; r < mapData.height; r++) {
        for (let c = 0; c < mapData.width; c++) {
          const tile = grid[r] ? grid[r][c] : 1;
          const roomId = rm && rm[r] ? rm[r][c] : null;

          if (tile === 1) {
            ctx.fillStyle = '#1a1d2a';
          } else if (roomId) {
            const state = roomStates[roomId];
            if (state && state.status === 'occupied') ctx.fillStyle = 'rgba(239,68,68,0.6)';
            else if (state && state.status === 'waiting') ctx.fillStyle = 'rgba(234,179,8,0.5)';
            else if (state && state.status === 'maintenance') ctx.fillStyle = 'rgba(107,114,128,0.4)';
            else ctx.fillStyle = 'rgba(34,197,94,0.35)';
          } else {
            ctx.fillStyle = '#2a2d3a';
          }
          ctx.fillRect(c * miniCell, r * miniCell, miniCell, miniCell);
        }
      }

      div.appendChild(canvas);
      container.appendChild(div);
    });
  }

  function renderSidebarStats() {
    const container = document.getElementById('sidebar-stats');
    let avail = 0, occ = 0, wait = 0, maint = 0, total = 0;

    if (mapData) {
      mapData.floors.forEach(floor => {
        if (!floor.rooms) return;
        floor.rooms.forEach(room => {
          total++;
          const s = roomStates[room.id];
          if (!s || s.status === 'available') avail++;
          else if (s.status === 'occupied') occ++;
          else if (s.status === 'waiting') wait++;
          else if (s.status === 'maintenance') maint++;
        });
      });
    }

    const used = occ + wait;
    const pct = total > 0 ? Math.round(used / total * 100) : 0;

    container.innerHTML =
      '<div class="stat-row"><span class="stat-dot available"></span> Trống <span class="stat-num">' + avail + '</span></div>' +
      '<div class="stat-row"><span class="stat-dot occupied"></span> Đang dùng <span class="stat-num">' + occ + '</span></div>' +
      '<div class="stat-row"><span class="stat-dot waiting"></span> Chờ/Theo dõi <span class="stat-num">' + wait + '</span></div>' +
      '<div class="stat-row"><span class="stat-dot maintenance"></span> Bảo trì <span class="stat-num">' + maint + '</span></div>' +
      '<div class="stat-bar"><div class="stat-bar-fill" style="width:' + pct + '%;background:var(--accent);"></div></div>' +
      '<div class="stat-label-small">Công suất ' + used + '/' + total + ' (' + pct + '%)</div>';
  }

  function updateStats() {
    let total = 0, used = 0, avail = 0, maint = 0;
    if (mapData) {
      mapData.floors.forEach(floor => {
        if (!floor.rooms) return;
        floor.rooms.forEach(room => {
          total++;
          const s = roomStates[room.id];
          if (!s || s.status === 'available') avail++;
          else if (s.status === 'occupied' || s.status === 'waiting') used++;
          else if (s.status === 'maintenance') maint++;
        });
      });
    }
    document.getElementById('count-used').textContent = used;
    document.getElementById('count-total').textContent = total;
    document.getElementById('count-available').textContent = avail;
    document.getElementById('count-maint').textContent = maint;
  }

  function countFloorOccupied(fi) {
    if (!mapData) return 0;
    const floor = mapData.floors[fi];
    if (!floor || !floor.rooms) return 0;
    let count = 0;
    floor.rooms.forEach(r => {
      const s = roomStates[r.id];
      if (s && (s.status === 'occupied' || s.status === 'waiting')) count++;
    });
    return count;
  }

  // ── Modal ──
  function bindModal() {
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-confirm').addEventListener('click', confirmModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });

    document.querySelectorAll('.status-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.status-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        modalSelectedStatus = btn.dataset.status;

        const petGroup = document.getElementById('pet-input-group');
        if (modalSelectedStatus === 'occupied' || modalSelectedStatus === 'waiting') {
          petGroup.classList.remove('pet-input-hidden');
          document.getElementById('pet-name-input').focus();
        } else {
          petGroup.classList.add('pet-input-hidden');
        }
      });
    });

    document.getElementById('pet-name-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmModal();
    });
  }

  function openModal(roomId) {
    modalRoomId = roomId;
    const room = findRoom(roomId);
    const state = roomStates[roomId] || { status: 'available', petName: '' };

    document.getElementById('modal-room-name').textContent = room ? room.name : roomId;
    document.getElementById('pet-name-input').value = state.petName || '';

    modalSelectedStatus = state.status;
    document.querySelectorAll('.status-opt').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.status === state.status);
    });

    const petGroup = document.getElementById('pet-input-group');
    if (state.status === 'occupied' || state.status === 'waiting') {
      petGroup.classList.remove('pet-input-hidden');
    } else {
      petGroup.classList.add('pet-input-hidden');
    }

    document.getElementById('modal-overlay').classList.remove('modal-hidden');
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.add('modal-hidden');
    modalRoomId = null;
    modalSelectedStatus = null;
  }

  function confirmModal() {
    if (!modalRoomId || !modalSelectedStatus) return;

    const petName = document.getElementById('pet-name-input').value.trim();
    roomStates[modalRoomId] = {
      status: modalSelectedStatus,
      petName: (modalSelectedStatus === 'occupied' || modalSelectedStatus === 'waiting') ? petName : '',
    };

    saveState();
    renderIsoFloors();
    renderFloorTabs();
    renderSidebar();
    updateStats();
    closeModal();
  }

  // ── Helpers ──
  function findRoom(roomId) {
    if (!mapData) return null;
    for (const floor of mapData.floors) {
      if (!floor.rooms) continue;
      for (const room of floor.rooms) {
        if (room.id === roomId) return room;
      }
    }
    return null;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Start ──
  document.addEventListener('DOMContentLoaded', init);
})();
