// ============================================
// Map Editor – Người Chăn Cừu
// Real game textures + hover preview
// ============================================

(function () {
  'use strict';

  // ── State ──────────────────────────────────
  let gridSize = 15;
  let grid = [];           // grid[row][col]: 0=walk, 1=wall
  let currentTool = 'wall';
  let brushSize = 1;
  let isPainting = false;
  let paintValue = 1;

  // Hover state
  let hoverCol = -1;
  let hoverRow = -1;
  let needsRedraw = true;

  // ── Constants ──────────────────────────────
  const CELL = 36;          // match game CELL_SIZE exactly
  const WALL_DEPTH = 14;    // front-face strip height (matches game)
  const WALL_DEPTH_SIDE = 7; // right-face strip width
  const GRID_LINE = 'rgba(255,255,255,0.07)';

  // ── Assets ─────────────────────────────────
  const images = {};
  const ASSET_LIST = [
    { key: 'grass',    src: 'grass_new.png' },
    { key: 'wall',     src: 'wall_top.png'  },
    { key: 'wallSide', src: 'wall_side.png' },
  ];

  function loadEditorAssets() {
    return new Promise((resolve) => {
      let loaded = 0;
      const total = ASSET_LIST.length;
      function check() { if (++loaded >= total) resolve(); }
      ASSET_LIST.forEach(({ key, src }) => {
        const img = new Image();
        img.onload  = check;
        img.onerror = check; // graceful fallback
        img.src = src;
        images[key] = img;
      });
      setTimeout(resolve, 4000); // safety timeout
    });
  }

  // ── DOM refs ───────────────────────────────
  const canvas = document.getElementById('editor-canvas');
  const ctx = canvas.getContext('2d');
  const sizeSlider = document.getElementById('grid-size-slider');
  const sizeValue  = document.getElementById('grid-size-value');
  const validationBox = document.getElementById('validation-box');

  // ── Init ───────────────────────────────────
  async function init() {
    // Show loading on canvas
    showCanvasLoading();

    await loadEditorAssets();

    createGrid(gridSize);
    bindEvents();
    updateSliderLabel();
    updateStats();
    validate();

    // Start rAF loop
    requestAnimationFrame(rafLoop);
  }

  function showCanvasLoading() {
    canvas.width  = gridSize * CELL;
    canvas.height = gridSize * CELL;
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Đang tải đồ họa...', canvas.width / 2, canvas.height / 2);
    ctx.textAlign = 'left';
  }

  function createGrid(size) {
    gridSize = size;
    grid = [];
    for (let r = 0; r < size; r++) {
      grid.push(new Array(size).fill(0));
    }
    resizeCanvas();
    needsRedraw = true;
  }

  function resizeCanvas() {
    canvas.width  = gridSize * CELL;
    canvas.height = gridSize * CELL;
  }

  // ── rAF Loop ───────────────────────────────
  function rafLoop() {
    if (needsRedraw) {
      render();
      needsRedraw = false;
    }
    requestAnimationFrame(rafLoop);
  }

  function markDirty() { needsRedraw = true; }

  // ── Slider ────────────────────────────────
  sizeSlider.addEventListener('input', updateSliderLabel);

  function updateSliderLabel() {
    const v = parseInt(sizeSlider.value);
    sizeValue.textContent = `${v}×${v}`;
  }

  window.applyGridSize = function () {
    const newSize = parseInt(sizeSlider.value);
    if (newSize === gridSize) return;
    const oldGrid = grid;
    const oldSize = gridSize;
    gridSize = newSize;
    grid = [];
    for (let r = 0; r < newSize; r++) {
      const row = [];
      for (let c = 0; c < newSize; c++) {
        row.push((r < oldSize && c < oldSize) ? oldGrid[r][c] : 0);
      }
      grid.push(row);
    }
    resizeCanvas();
    updateStats();
    validate();
    markDirty();
    showToast(`Đã đổi sang ${newSize}×${newSize}`);
  };

  // ── Tool / Brush ───────────────────────────
  window.setTool = function (tool) {
    currentTool = tool;
    document.getElementById('btn-wall').classList.toggle('active', tool === 'wall');
    document.getElementById('btn-erase').classList.toggle('active', tool === 'erase');
    markDirty();
  };

  window.setBrush = function (size) {
    brushSize = size;
    document.querySelectorAll('.brush-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`brush-${size}`).classList.add('active');
    markDirty();
  };

  // ── Cell coordinate helper ─────────────────
  function cellFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top)  * scaleY;
    return {
      col: Math.floor(px / CELL),
      row: Math.floor(py / CELL)
    };
  }

  // ── Paint ──────────────────────────────────
  function paintAt(col, row, value) {
    const half = Math.floor(brushSize / 2);
    let changed = false;
    for (let dr = -half; dr < brushSize - half; dr++) {
      for (let dc = -half; dc < brushSize - half; dc++) {
        const r = row + dr, c = col + dc;
        if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
          if (grid[r][c] !== value) {
            grid[r][c] = value;
            changed = true;
          }
        }
      }
    }
    if (changed) { updateStats(); validate(); markDirty(); }
  }

  // ── Mouse events ───────────────────────────
  function bindEvents() {
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mouseup', () => { isPainting = false; });
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    // Touch
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   () => { isPainting = false; });

    // Shift = temp erase cursor
    window.addEventListener('keydown', e => {
      if (e.shiftKey && !e.repeat) { canvas.style.cursor = 'cell'; markDirty(); }
    });
    window.addEventListener('keyup', e => {
      if (!e.shiftKey) { canvas.style.cursor = 'crosshair'; markDirty(); }
    });
  }

  function onMouseDown(e) {
    isPainting = true;
    paintValue = (e.button === 2 || e.shiftKey)
      ? 0
      : (currentTool === 'wall' ? 1 : 0);
    const { col, row } = cellFromEvent(e);
    paintAt(col, row, paintValue);
  }

  function onMouseMove(e) {
    const { col, row } = cellFromEvent(e);
    // Update hover
    if (col !== hoverCol || row !== hoverRow) {
      hoverCol = col; hoverRow = row;
      markDirty();
    }
    // Paint if button held
    if (isPainting) paintAt(col, row, paintValue);
  }

  function onMouseLeave() {
    hoverCol = -1; hoverRow = -1;
    markDirty();
  }

  function onTouchStart(e) {
    e.preventDefault();
    isPainting = true;
    paintValue = currentTool === 'wall' ? 1 : 0;
    const t = e.touches[0];
    const { col, row } = cellFromEvent({ clientX: t.clientX, clientY: t.clientY });
    paintAt(col, row, paintValue);
  }

  function onTouchMove(e) {
    e.preventDefault();
    if (!isPainting) return;
    const t = e.touches[0];
    const { col, row } = cellFromEvent({ clientX: t.clientX, clientY: t.clientY });
    paintAt(col, row, paintValue);
  }

  // ── RENDER ─────────────────────────────────
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ── Pass 1: Ground tiles ─────────────────
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        drawGrassCell(c * CELL, r * CELL);
      }
    }

    // ── Pass 2: Ambient occlusion shadows ────
    ctx.save();
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] !== 1) continue;
        const x = c * CELL, y = r * CELL;
        const belowOpen = (r + 1 < gridSize) && grid[r + 1][c] === 0;
        const rightOpen = (c + 1 < gridSize) && grid[r][c + 1] === 0;
        if (belowOpen) {
          ctx.fillStyle = 'rgba(0,0,0,0.22)';
          ctx.fillRect(x, y + CELL, CELL, 6);
        }
        if (rightOpen) {
          ctx.fillStyle = 'rgba(0,0,0,0.13)';
          ctx.fillRect(x + CELL, y, 5, CELL);
        }
      }
    }
    ctx.restore();

    // ── Pass 3: Wall front + right faces ─────
    for (let r = gridSize - 1; r >= 0; r--) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] !== 1) continue;
        const x = c * CELL, y = r * CELL;
        const showFront = (r + 1 >= gridSize || grid[r + 1][c] === 0);
        const showRight = (c + 1 >= gridSize || grid[r][c + 1] === 0);

        if (showFront) {
          if (images.wallSide && images.wallSide.complete && images.wallSide.naturalWidth > 0) {
            ctx.drawImage(images.wallSide, x, y + CELL, CELL, WALL_DEPTH);
          } else {
            ctx.fillStyle = '#3a2210'; ctx.fillRect(x, y + CELL, CELL, WALL_DEPTH);
          }
          // Shadow gradient on front face
          const fg = ctx.createLinearGradient(x, y + CELL, x, y + CELL + WALL_DEPTH);
          fg.addColorStop(0, 'rgba(0,0,0,0.0)');
          fg.addColorStop(1, 'rgba(0,0,0,0.5)');
          ctx.fillStyle = fg;
          ctx.fillRect(x, y + CELL, CELL, WALL_DEPTH);
        }

        if (showRight) {
          ctx.save();
          if (images.wallSide && images.wallSide.complete && images.wallSide.naturalWidth > 0) {
            ctx.globalAlpha = 0.65;
            ctx.drawImage(images.wallSide, x + CELL, y, WALL_DEPTH_SIDE, CELL);
          } else {
            ctx.fillStyle = '#251608';
            ctx.fillRect(x + CELL, y, WALL_DEPTH_SIDE, CELL);
          }
          ctx.restore();
          const rg = ctx.createLinearGradient(x + CELL, y, x + CELL + WALL_DEPTH_SIDE, y);
          rg.addColorStop(0, 'rgba(0,0,0,0.48)');
          rg.addColorStop(1, 'rgba(0,0,0,0.82)');
          ctx.fillStyle = rg;
          ctx.fillRect(x + CELL, y, WALL_DEPTH_SIDE, CELL);
        }
      }
    }

    // ── Pass 4: Wall top faces ────────────────
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] !== 1) continue;
        drawWallTopFace(c * CELL, r * CELL);
      }
    }

    // ── Pass 5: Grid lines ───────────────────
    ctx.strokeStyle = GRID_LINE;
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= gridSize; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL);
      ctx.lineTo(gridSize * CELL, r * CELL);
      ctx.stroke();
    }
    for (let c = 0; c <= gridSize; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL, 0);
      ctx.lineTo(c * CELL, gridSize * CELL);
      ctx.stroke();
    }

    // ── Pass 6: Hover preview ────────────────
    if (hoverCol >= 0 && hoverRow >= 0) {
      drawHoverPreview();
    }
  }

  // ── Cell drawing primitives ────────────────
  function drawGrassCell(x, y) {
    if (images.grass && images.grass.complete && images.grass.naturalWidth > 0) {
      ctx.drawImage(images.grass, x, y, CELL, CELL);
    } else {
      ctx.fillStyle = '#2d6a1e'; ctx.fillRect(x, y, CELL, CELL);
    }
  }

  function drawWallTopFace(x, y) {
    if (images.wall && images.wall.complete && images.wall.naturalWidth > 0) {
      ctx.drawImage(images.wall, x, y, CELL, CELL);
    } else {
      ctx.fillStyle = '#7a6a5a'; ctx.fillRect(x, y, CELL, CELL);
    }
    // Highlight edges
    ctx.fillStyle = 'rgba(255,245,220,0.10)';
    ctx.fillRect(x, y, CELL, 2);
    ctx.fillRect(x, y, 2, CELL);
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.fillRect(x + CELL - 2, y, 2, CELL);
    ctx.fillRect(x, y + CELL - 2, CELL, 2);
  }

  // ── Hover Preview ─────────────────────────
  function drawHoverPreview() {
    const half   = Math.floor(brushSize / 2);
    const isWall = currentTool === 'wall';

    // Decide preview alpha: painting walls → show wall preview; erasing → show grass preview
    const PREVIEW_ALPHA = 0.52;

    ctx.save();
    ctx.globalAlpha = PREVIEW_ALPHA;

    for (let dr = -half; dr < brushSize - half; dr++) {
      for (let dc = -half; dc < brushSize - half; dc++) {
        const r = hoverRow + dr;
        const c = hoverCol + dc;
        if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) continue;

        // Skip cells that already have the target value (no change)
        const alreadyCorrect = (isWall && grid[r][c] === 1) || (!isWall && grid[r][c] === 0);

        const x = c * CELL, y = r * CELL;

        if (isWall) {
          // Preview: draw wall top face semi-transparent
          drawWallTopFace(x, y);
        } else {
          // Erase preview: draw grass semi-transparent over wall
          drawGrassCell(x, y);
        }

        // Dim already-correct cells more so only "changes" pop
        if (alreadyCorrect) {
          ctx.globalAlpha = PREVIEW_ALPHA * 0.2;
          ctx.fillStyle = 'rgba(0,0,0,0)'; // transparent (just lower alpha)
          ctx.globalAlpha = PREVIEW_ALPHA;
        }
      }
    }

    ctx.restore();

    // ── Brush outline highlight ──────────────
    ctx.save();
    const outlineColor = isWall
      ? 'rgba(245, 158,  11, 0.9)'   // amber for wall
      : 'rgba( 52, 211, 153, 0.9)';  // emerald for erase

    const bx = (hoverCol - half) * CELL;
    const by = (hoverRow - half) * CELL;
    const bw = brushSize * CELL;
    const bh = brushSize * CELL;

    // Outer glow
    ctx.strokeStyle = outlineColor.replace('0.9', '0.25');
    ctx.lineWidth = 4;
    ctx.strokeRect(bx - 2, by - 2, bw + 4, bh + 4);

    // Inner sharp border
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, bw, bh);

    // Corner brackets for extra clarity
    const brkLen = Math.min(10, CELL * 0.4);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = outlineColor;
    const corners = [
      [bx,       by],
      [bx + bw,  by],
      [bx + bw,  by + bh],
      [bx,       by + bh],
    ];
    corners.forEach(([cx, cy], i) => {
      const hx = (i === 0 || i === 3) ?  brkLen : -brkLen;
      const vy = (i === 0 || i === 1) ?  brkLen : -brkLen;
      ctx.beginPath();
      ctx.moveTo(cx + hx, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + vy);
      ctx.stroke();
    });

    ctx.restore();
  }

  // ── Stats ──────────────────────────────────
  function updateStats() {
    let walls = 0;
    for (let r = 0; r < gridSize; r++)
      for (let c = 0; c < gridSize; c++)
        if (grid[r][c] === 1) walls++;

    const total = gridSize * gridSize;
    const walk  = total - walls;
    document.getElementById('stat-size').textContent = gridSize;
    document.getElementById('stat-walk').textContent = walk;
    document.getElementById('stat-wall').textContent = walls;
    document.getElementById('stat-pct').textContent  = Math.round((walls / total) * 100) + '%';
  }

  // ── Validation ─────────────────────────────
  function validate() {
    const issues = [];
    let walls = 0;
    for (let r = 0; r < gridSize; r++)
      for (let c = 0; c < gridSize; c++)
        if (grid[r][c] === 1) walls++;

    const total = gridSize * gridSize;
    const walk  = total - walls;

    if (walk < 4)            issues.push('Cần ít nhất 4 ô trống để đặt nhân vật & mục tiêu.');
    if (walls / total > 0.75) issues.push('Quá nhiều tường (>75%) — AI có thể không tìm đường.');

    const firstWalk = findFirstWalkable();
    if (firstWalk && walk >= 4) {
      const reachable = bfsCount(firstWalk.r, firstWalk.c);
      if (reachable < 4) {
        issues.push(`Chỉ có ${reachable} ô liên thông — bản đồ bị cô lập.`);
      } else if (reachable < walk * 0.5) {
        issues.push(`Vùng bị cô lập (${reachable}/${walk} ô liên thông) — giảm tường.`);
      }
    }

    if (issues.length === 0) {
      validationBox.className = 'validation-box ok';
      validationBox.textContent = `✅ Hợp lệ! ${walk} ô walkable, sẵn sàng chơi.`;
    } else {
      validationBox.className = 'validation-box warn';
      validationBox.innerHTML  = '⚠️ ' + issues.join('<br>⚠️ ');
    }
    return issues.length === 0;
  }

  function findFirstWalkable() {
    for (let r = 0; r < gridSize; r++)
      for (let c = 0; c < gridSize; c++)
        if (grid[r][c] === 0) return { r, c };
    return null;
  }

  function bfsCount(startR, startC) {
    const vis = Array.from({ length: gridSize }, () => new Array(gridSize).fill(false));
    const q   = [[startR, startC]];
    vis[startR][startC] = true;
    let count = 0;
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) { void dr; } // jshint
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    while (q.length > 0) {
      const [r, c] = q.shift(); count++;
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && !vis[nr][nc] && grid[nr][nc] === 0) {
          vis[nr][nc] = true; q.push([nr, nc]);
        }
      }
    }
    return count;
  }

  // ── Actions ────────────────────────────────
  window.clearMap = function () {
    if (!confirm('Xóa toàn bộ bản đồ?')) return;
    for (let r = 0; r < gridSize; r++)
      for (let c = 0; c < gridSize; c++)
        grid[r][c] = 0;
    updateStats(); validate(); markDirty();
    showToast('Đã xóa toàn bộ bản đồ');
  };

  window.fillBorder = function () {
    for (let r = 0; r < gridSize; r++) {
      grid[r][0] = 1; grid[r][gridSize - 1] = 1;
    }
    for (let c = 0; c < gridSize; c++) {
      grid[0][c] = 1; grid[gridSize - 1][c] = 1;
    }
    updateStats(); validate(); markDirty();
    showToast('Đã thêm viền tường');
  };

  window.invertMap = function () {
    for (let r = 0; r < gridSize; r++)
      for (let c = 0; c < gridSize; c++)
        grid[r][c] = grid[r][c] === 0 ? 1 : 0;
    updateStats(); validate(); markDirty();
    showToast('Đã đảo ngược bản đồ');
  };

  window.generateRandom = function () {
    for (let r = 0; r < gridSize; r++)
      for (let c = 0; c < gridSize; c++)
        grid[r][c] = 0;

    for (let r = 0; r < gridSize; r++) { grid[r][0] = 1; grid[r][gridSize - 1] = 1; }
    for (let c = 0; c < gridSize; c++) { grid[0][c] = 1; grid[gridSize - 1][c] = 1; }

    const density = 0.28;
    for (let r = 1; r < gridSize - 1; r++)
      for (let c = 1; c < gridSize - 1; c++)
        if (Math.random() < density) grid[r][c] = 1;

    // Keep start area clear
    grid[1][1] = 0; grid[1][2] = 0;
    grid[2][1] = 0; grid[2][2] = 0;

    updateStats(); validate(); markDirty();
    showToast('Đã tạo bản đồ ngẫu nhiên!');
  };

  // ── Save & Play ────────────────────────────
  window.saveAndPlay = function () {
    if (!validate()) { showToast('⚠️ Bản đồ chưa hợp lệ, sửa trước!'); return; }
    const mapObj = { size: gridSize, data: grid.map(row => [...row]) };
    try {
      localStorage.setItem('customMap', JSON.stringify(mapObj));
      showToast('✅ Đã lưu! Đang chuyển sang game...');
      setTimeout(() => { window.location.href = 'index.html?map=custom'; }, 800);
    } catch { showToast('❌ Không thể lưu (localStorage bị tắt?)'); }
  };

  // ── Export ─────────────────────────────────
  window.openExport = function () {
    const mapObj = { size: gridSize, data: grid.map(row => [...row]) };
    document.getElementById('export-textarea').value = JSON.stringify(mapObj, null, 2);
    document.getElementById('export-modal').classList.add('open');
  };
  window.closeExport = function () {
    document.getElementById('export-modal').classList.remove('open');
  };
  window.copyExport = function () {
    const ta = document.getElementById('export-textarea');
    ta.select();
    try { document.execCommand('copy'); showToast('📎 Đã copy JSON!'); }
    catch { navigator.clipboard.writeText(ta.value).then(() => showToast('📎 Đã copy JSON!')).catch(() => showToast('Chọn text và copy thủ công')); }
  };
  document.getElementById('export-modal').addEventListener('click', function (e) {
    if (e.target === this) closeExport();
  });

  // ── Back ───────────────────────────────────
  window.goBack = function () { window.location.href = 'index.html'; };

  // ── Toast ──────────────────────────────────
  let toastTimer;
  function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  // ── Start ──────────────────────────────────
  init();
})();
