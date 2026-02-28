// ============================================
// Người Chăn Cừu - A* Pathfinding Game
// Converted from Java Swing to HTML5 Canvas
// ============================================

(function () {
  'use strict';

  // ============================================
  // MAP DATA (embedded from map files)
  // ============================================
  const MAPS = {
    map7: {
      size: 19,
      data: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
        [1,0,1,1,1,0,1,0,1,1,0,1,1,0,1,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,1],
        [1,0,1,1,1,0,1,0,1,0,1,0,0,0,1,0,1,1,1],
        [1,0,1,0,0,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
        [1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
        [1,0,1,1,1,0,0,0,1,1,0,1,1,1,1,0,1,1,1],
        [1,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1],
        [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,1],
        [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
        [1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,0,1],
        [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,1],
        [1,1,1,0,0,0,1,0,1,1,1,0,1,0,1,0,1,0,1],
        [1,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
      ]
    },
    map1: {
      size: 15,
      data: [
        [0,0,0,0,1,0,1,1,1,0,0,0,0,0,0],
        [0,1,1,0,1,0,0,0,1,0,1,0,0,1,0],
        [0,0,0,0,1,0,1,0,1,0,1,0,1,1,0],
        [0,0,1,0,1,0,1,0,0,0,1,0,1,0,0],
        [0,1,1,0,0,0,1,1,1,0,0,0,0,0,1],
        [0,0,1,1,1,0,1,0,0,0,0,1,1,1,0],
        [1,0,0,0,0,0,1,0,0,1,0,0,0,0,0],
        [1,1,1,0,1,0,0,0,1,1,1,0,1,0,0],
        [0,0,1,0,1,1,1,0,0,0,0,0,1,1,0],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,1,0],
        [1,1,1,1,1,0,0,1,0,1,1,1,0,1,0],
        [1,0,0,0,1,0,0,1,0,0,0,1,0,0,0],
        [0,0,1,0,0,0,1,1,1,0,1,1,0,0,1],
        [0,1,1,0,1,0,0,0,0,0,1,0,0,1,1],
        [0,0,0,0,1,0,0,1,0,0,0,0,0,0,0]
      ]
    },
    map2: {
      size: 15,
      data: [
        [0,0,0,0,1,0,1,1,1,0,0,0,0,0,0],
        [0,1,1,0,1,0,0,0,1,0,1,0,0,1,0],
        [0,0,0,0,1,0,1,0,1,0,1,0,1,1,0],
        [0,0,1,0,0,0,1,0,0,0,1,0,1,0,0],
        [0,1,1,0,0,0,1,1,1,0,0,0,0,0,1],
        [0,0,0,1,1,0,1,0,0,0,0,1,1,1,0],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
        [1,1,1,0,1,0,0,0,1,1,1,0,1,0,0],
        [0,0,1,0,1,1,1,0,0,0,0,0,1,1,0],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,1,0],
        [1,1,1,1,0,0,0,1,0,1,1,1,0,0,0],
        [1,0,0,0,1,0,0,1,0,0,0,1,0,0,0],
        [0,0,1,0,0,0,1,1,1,0,0,1,0,0,1],
        [0,1,1,0,1,0,0,0,0,0,1,0,0,1,1],
        [0,0,0,0,1,0,0,1,0,0,0,0,0,0,0]
      ]
    },
    map3: {
      size: 15,
      data: [
        [0,0,0,0,1,0,1,1,1,0,0,0,0,0,0],
        [0,1,1,0,0,0,0,0,1,0,1,0,0,1,0],
        [0,0,0,0,1,0,1,0,0,0,1,0,1,1,0],
        [0,0,1,0,1,0,1,0,0,0,1,0,1,0,0],
        [0,1,1,0,0,0,1,1,1,0,0,0,0,0,1],
        [0,0,1,1,1,0,0,0,0,0,0,1,1,1,0],
        [1,0,0,0,0,0,1,0,0,1,0,0,0,0,0],
        [1,1,0,0,1,0,0,0,1,1,1,0,1,0,0],
        [0,0,1,0,1,1,1,0,0,0,0,0,1,1,0],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
        [1,1,1,1,1,0,0,1,0,1,1,1,0,1,0],
        [0,0,0,0,1,0,0,1,0,0,0,1,0,0,0],
        [0,0,1,0,0,0,1,1,1,0,1,1,0,0,1],
        [0,1,1,0,1,0,0,0,0,0,1,0,0,1,1],
        [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]
      ]
    },
    map4: {
      size: 15,
      data: [
        [0,0,0,0,1,0,1,1,1,0,0,0,0,0,0],
        [0,1,1,0,1,0,0,0,1,0,1,0,0,1,0],
        [0,0,0,0,0,0,1,0,1,0,1,0,1,1,0],
        [0,0,1,0,1,0,1,0,0,0,1,0,0,0,0],
        [0,1,1,0,0,0,1,1,1,0,0,0,0,0,1],
        [0,0,1,1,1,0,1,0,0,0,0,1,1,0,0],
        [1,0,0,0,0,0,1,0,0,1,0,0,0,0,0],
        [1,1,1,0,1,0,0,0,1,1,0,0,1,0,0],
        [0,0,0,0,1,1,1,0,0,0,0,0,1,1,0],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,1,0],
        [1,1,1,1,1,0,0,1,0,1,1,1,0,1,0],
        [1,0,0,0,0,0,0,1,0,0,0,1,0,0,0],
        [0,0,1,0,0,0,1,1,1,0,1,1,0,0,0],
        [0,1,1,0,1,0,0,0,0,0,1,0,0,1,1],
        [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0]
      ]
    },
    map5: {
      size: 15,
      data: [
        [0,0,0,0,1,0,0,1,1,0,0,0,0,0,0],
        [0,1,1,0,1,0,0,0,1,0,1,0,0,1,0],
        [0,0,0,0,1,0,1,0,1,0,0,0,1,1,0],
        [0,0,1,0,1,0,1,0,0,0,1,0,1,0,0],
        [0,1,0,0,0,0,1,1,1,0,0,0,0,0,1],
        [0,0,1,1,1,0,1,0,0,0,0,1,1,1,0],
        [1,0,0,0,0,0,1,0,0,1,0,0,0,0,0],
        [1,1,1,0,1,0,0,0,1,1,1,0,1,0,0],
        [0,0,1,0,0,1,1,0,0,0,0,0,1,1,0],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,1,0],
        [1,1,1,1,1,0,0,1,0,0,1,1,0,1,0],
        [1,0,0,0,1,0,0,1,0,0,0,1,0,0,0],
        [0,0,1,0,0,0,1,1,1,0,1,1,0,0,1],
        [0,1,1,0,1,0,0,0,0,0,1,0,0,1,0],
        [0,0,0,0,1,0,0,1,0,0,0,0,0,0,0]
      ]
    }
  };

  // ============================================
  // CONSTANTS
  // ============================================
  const CELL_SIZE = 36;
  const WIN_SCORE = 12;
  const AGENT_COUNT = 12;
  const AI_TICK_MS = 500;
  const TARGET_RESPAWN_TICKS = 12; // number of AI ticks before target respawns
  const SPRITE_ANIM_MS = 250;

  // ============================================
  // GLOBAL STATE
  // ============================================
  let canvas, ctx;
  let gameRunning = false;
  let currentMapKey = 'map7';
  let mapData = [];
  let mapSize = 19;

  // Scores
  let scoreTa = 0;
  let scoreDich = 0;

  // Target
  let targetX = -1, targetY = -1;
  let hasTarget = false;
  let targetCooldown = 0;

  // Player
  let player = null;

  // Agents (AI)
  let agents = [];

  // Timers
  let lastAiTick = 0;
  let gameTime = 0;
  let lastFrameTime = 0;
  let aiAccumulator = 0;

  // Effects
  let explosionEffect = null;

  // ============================================
  // ASSET LOADING
  // ============================================
  const images = {};
  const sounds = {};

  const IMAGE_LIST = [
    { key: 'grass', src: 'grass1.png' },
    { key: 'wall', src: 'wall2.png' },
    { key: 'player', src: 'man2.png' },
    { key: 'enemy1', src: 'efect/conma1.png' },
    { key: 'enemy2', src: 'efect/conma2.png' },
    { key: 'enemy3', src: 'efect/conma3.png' },
    { key: 'enemy4', src: 'efect/conma4.png' },
    { key: 'enemy5', src: 'efect/conma5.png' },
    { key: 'enemy6', src: 'efect/conma6.png' },
    { key: 'ally', src: 'efect/ta.png' },
    { key: 'bigbang', src: 'bigbang.png' },
    { key: 'bangdiem', src: 'bangdiem.png' },
    { key: 'angle', src: 'Angle.png' },
  ];

  const SOUND_LIST = [
    { key: 'scoreTa', src: 'media/score.wav' },
    { key: 'scoreDich', src: 'media/score2.wav' },
    { key: 'levelUp', src: 'media/pheta.wav' },
    { key: 'attack', src: 'media/doiban.wav' },
  ];

  function loadAssets() {
    return new Promise((resolve) => {
      let loaded = 0;
      const total = IMAGE_LIST.length + SOUND_LIST.length;

      function check() {
        loaded++;
        if (loaded >= total) resolve();
      }

      IMAGE_LIST.forEach((item) => {
        const img = new Image();
        img.onload = check;
        img.onerror = check;
        img.src = item.src;
        images[item.key] = img;
      });

      SOUND_LIST.forEach((item) => {
        const audio = new Audio();
        audio.addEventListener('canplaythrough', check, { once: true });
        audio.addEventListener('error', check, { once: true });
        audio.src = item.src;
        audio.preload = 'auto';
        sounds[item.key] = audio;
      });

      // Fallback timeout
      setTimeout(resolve, 5000);
    });
  }

  function playSound(key) {
    if (sounds[key]) {
      const s = sounds[key].cloneNode();
      s.volume = 0.5;
      s.play().catch(() => {});
    }
  }

  // ============================================
  // SPRITE ANIMATION
  // ============================================
  class Sprite {
    constructor(imgKey, cols, rows) {
      this.imgKey = imgKey;
      this.cols = cols;
      this.rows = rows;
      this.frameX = 0;
      this.dirRow = 0; // 0=down, 1=left, 2=right, 3=up for player; 0=down,1=left,2=up,3=right for AI
      this.lastAnim = 0;
    }

    get img() { return images[this.imgKey]; }

    get frameW() { return this.img ? this.img.width / this.cols : 0; }
    get frameH() { return this.img ? this.img.height / this.rows : 0; }

    updateAnim(now) {
      if (now - this.lastAnim >= SPRITE_ANIM_MS) {
        this.frameX = (this.frameX + 1) % this.cols;
        this.lastAnim = now;
      }
    }

    draw(ctx, x, y, size) {
      if (!this.img) return;
      const sx = this.frameX * this.frameW;
      const sy = this.dirRow * this.frameH;
      ctx.drawImage(this.img, sx, sy, this.frameW, this.frameH, x, y, size, size);
    }

    setDirection(prevX, prevY, newX, newY, isPlayer) {
      if (newX === prevX && newY === prevY) return;

      if (isPlayer) {
        // Player sprite: row0=up(w), row1=right(d), row2=down(s), row3=left(a)
        if (newY < prevY) this.dirRow = 0;       // up
        else if (newX > prevX) this.dirRow = 1;   // right
        else if (newY > prevY) this.dirRow = 2;   // down
        else if (newX < prevX) this.dirRow = 3;   // left
      } else {
        // AI sprite (3 rows): row0=down, row1=left, row2=up, row3 wraps
        if (newY > prevY) this.dirRow = 0;       // down
        else if (newX < prevX) this.dirRow = 1;   // left
        else if (newY < prevY) this.dirRow = 2;   // up
        else if (newX > prevX) {
          this.dirRow = 2; // right - reuse up row or wrap
        }
      }
    }
  }

  // ============================================
  // A* PATHFINDING
  // ============================================
  function astarFind(startX, startY, goalX, goalY, grid, gridSize) {
    if (startX === goalX && startY === goalY) return [];

    const open = [];
    const closed = new Set();
    const nodes = {};

    function key(x, y) { return x + ',' + y; }

    function heuristic(x, y) {
      return Math.round(Math.sqrt((goalX - x) ** 2 + (goalY - y) ** 2) * 10);
    }

    function getNode(x, y) {
      const k = key(x, y);
      if (!nodes[k]) {
        nodes[k] = { x, y, g: Infinity, h: heuristic(x, y), f: Infinity, parent: null };
      }
      return nodes[k];
    }

    const startNode = getNode(startX, startY);
    startNode.g = 0;
    startNode.f = startNode.h;
    open.push(startNode);

    while (open.length > 0) {
      // Find min F in open
      let minIdx = 0;
      for (let i = 1; i < open.length; i++) {
        if (open[i].f < open[minIdx].f) minIdx = i;
      }
      const current = open.splice(minIdx, 1)[0];
      const ck = key(current.x, current.y);

      if (current.x === goalX && current.y === goalY) {
        // Reconstruct path
        const path = [];
        let n = current;
        while (n.parent) {
          path.unshift({ x: n.x, y: n.y });
          n = n.parent;
        }
        return path;
      }

      closed.add(ck);

      // 4-directional neighbors (no diagonal - matching Java code)
      const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (const [dx, dy] of dirs) {
        const nx = current.x + dx;
        const ny = current.y + dy;

        if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) continue;
        if (grid[ny][nx] === 1) continue; // wall check: grid[row][col] = grid[y][x]

        const nk = key(nx, ny);
        if (closed.has(nk)) continue;

        const neighbor = getNode(nx, ny);
        const tentG = current.g + 200; // Cost 200 for cardinal moves (matching Java)

        if (tentG < neighbor.g) {
          neighbor.g = tentG;
          neighbor.f = tentG + neighbor.h;
          neighbor.parent = current;

          if (!open.includes(neighbor)) {
            open.push(neighbor);
          }
        }
      }
    }

    return []; // No path found
  }

  // ============================================
  // AGENT (AI character)
  // ============================================
  class Agent {
    constructor(x, y, isAlly, imgKey, spriteCols, spriteRows) {
      this.x = x;
      this.y = y;
      this.isAlly = isAlly; // true = sheep (phe ta), false = wolf (phe dich)
      this.active = false;
      this.sprite = new Sprite(imgKey, spriteCols, spriteRows);
      this.path = [];
      this.randomDir = 0; // 1=right,2=down,3=left,4=up
      this.randomSteps = 3 + Math.floor(Math.random() * 5);
      this.levelGhost = 1;
    }

    recalcPath() {
      if (!hasTarget) return;
      this.path = astarFind(this.x, this.y, targetX, targetY, mapData, mapSize);
    }

    moveTowardsTarget() {
      if (this.path.length > 0) {
        const next = this.path.shift();
        const prevX = this.x;
        const prevY = this.y;
        this.x = next.x;
        this.y = next.y;
        this.sprite.setDirection(prevX, prevY, this.x, this.y, false);
      }
    }

    moveRandom() {
      this.randomSteps--;
      if (this.randomSteps <= 0) {
        this.randomDir = findValidDirection(this.x, this.y);
        this.randomSteps = 3 + Math.floor(Math.random() * 5);
      }

      const prevX = this.x;
      const prevY = this.y;

      if (this.randomDir === 1 && this.x < mapSize - 1 && !isWall(this.y, this.x + 1)) {
        this.x++;
      } else if (this.randomDir === 2 && this.y < mapSize - 1 && !isWall(this.y + 1, this.x)) {
        this.y++;
      } else if (this.randomDir === 3 && this.x > 0 && !isWall(this.y, this.x - 1)) {
        this.x--;
      } else if (this.randomDir === 4 && this.y > 0 && !isWall(this.y - 1, this.x)) {
        this.y--;
      }

      this.sprite.setDirection(prevX, prevY, this.x, this.y, false);
    }

    levelUpGhost() {
      this.levelGhost++;
      if (this.levelGhost > 6) this.levelGhost = 6;
      this.sprite.imgKey = 'enemy' + this.levelGhost;
    }
  }

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  function isWall(row, col) {
    if (row < 0 || row >= mapSize || col < 0 || col >= mapSize) return true;
    return mapData[row][col] === 1;
  }

  function findValidDirection(x, y) {
    const dirs = [];
    if (!isWall(y, x + 1)) dirs.push(1); // right
    if (!isWall(y + 1, x)) dirs.push(2); // down
    if (!isWall(y, x - 1)) dirs.push(3); // left
    if (!isWall(y - 1, x)) dirs.push(4); // up
    if (dirs.length === 0) return 0;
    return dirs[Math.floor(Math.random() * dirs.length)];
  }

  function getRandomWalkable() {
    let attempts = 0;
    while (attempts < 1000) {
      const x = Math.floor(Math.random() * mapSize);
      const y = Math.floor(Math.random() * mapSize);
      if (mapData[y][x] === 0) return { x, y };
      attempts++;
    }
    return { x: 1, y: 1 };
  }

  // ============================================
  // EXPLOSION EFFECT
  // ============================================
  class ExplosionEffect {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.frame = 0;
      this.cols = 5;
      this.rows = 5;
      this.totalFrames = 23; // 5x5 minus last 2
      this.lastUpdate = 0;
      this.done = false;
    }

    update(now) {
      if (now - this.lastUpdate > 60) {
        this.frame++;
        this.lastUpdate = now;
        if (this.frame >= this.totalFrames) this.done = true;
      }
    }

    draw(ctx) {
      if (this.done || !images.bigbang) return;
      const img = images.bigbang;
      const fw = img.width / this.cols;
      const fh = img.height / this.rows;
      const col = this.frame % this.cols;
      const row = Math.floor(this.frame / this.cols);
      const drawSize = CELL_SIZE * 2;
      ctx.drawImage(img,
        col * fw, row * fh, fw, fh,
        this.x * CELL_SIZE - drawSize / 4, this.y * CELL_SIZE - drawSize / 4,
        drawSize, drawSize
      );
    }
  }

  // ============================================
  // GAME INITIALIZATION
  // ============================================
  function initGame() {
    const mapInfo = MAPS[currentMapKey];
    mapData = mapInfo.data;
    mapSize = mapInfo.size;

    scoreTa = 0;
    scoreDich = 0;
    hasTarget = true;
    targetCooldown = 0;
    gameTime = 0;
    aiAccumulator = 0;
    explosionEffect = null;

    // Canvas sizing
    canvas.width = mapSize * CELL_SIZE;
    canvas.height = mapSize * CELL_SIZE;

    // Init player at position (1,1)
    player = {
      x: 1, y: 1,
      sprite: new Sprite('player', 5, 4)
    };

    // Generate random positions for agents
    agents = [];
    const usedPositions = new Set();
    usedPositions.add('1,1');

    for (let i = 0; i < AGENT_COUNT; i++) {
      let pos;
      do {
        pos = getRandomWalkable();
      } while (usedPositions.has(pos.x + ',' + pos.y));
      usedPositions.add(pos.x + ',' + pos.y);

      const isAlly = i >= AGENT_COUNT / 2; // first half = enemies, second half = allies
      const imgKey = isAlly ? 'ally' : 'enemy1';
      const agent = new Agent(pos.x, pos.y, isAlly, imgKey, isAlly ? 3 : 3, isAlly ? 4 : 4);

      // Only the first enemy starts active
      if (i === 0) agent.active = true;

      agents.push(agent);
    }

    // Spawn initial target
    spawnTarget();

    // Run initial A* for active agents
    agents.forEach(a => {
      if (a.active) a.recalcPath();
    });

    updateUI();
  }

  function spawnTarget() {
    const pos = getRandomWalkable();
    targetX = pos.x;
    targetY = pos.y;
    hasTarget = true;
    targetCooldown = 0;

    // Recalculate paths for all active agents
    agents.forEach(a => {
      if (a.active) a.recalcPath();
    });

    // Create explosion effect at target
    explosionEffect = new ExplosionEffect(targetX, targetY);

    updateTargetStatus('Hạt đậu tại (' + targetX + ',' + targetY + ')');
  }

  // ============================================
  // INPUT HANDLING
  // ============================================
  const keysDown = {};

  function handleKeyDown(e) {
    if (!gameRunning) return;
    keysDown[e.code] = true;

    let newX = player.x;
    let newY = player.y;
    const prevX = player.x;
    const prevY = player.y;

    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      if (player.x > 0 && !isWall(player.y, player.x - 1)) newX--;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      if (player.x < mapSize - 1 && !isWall(player.y, player.x + 1)) newX++;
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      if (player.y > 0 && !isWall(player.y - 1, player.x)) newY--;
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      if (player.y < mapSize - 1 && !isWall(player.y + 1, player.x)) newY++;
    } else {
      return;
    }

    e.preventDefault();
    player.sprite.setDirection(prevX, prevY, newX, newY, true);
    player.x = newX;
    player.y = newY;

    // Check if player collected target
    checkPlayerCollect();
  }

  function handleKeyUp(e) {
    keysDown[e.code] = false;
  }

  // ============================================
  // GAME LOGIC
  // ============================================
  function checkPlayerCollect() {
    if (!hasTarget) return;
    if (player.x === targetX && player.y === targetY) {
      scoreTa++;
      playSound('scoreTa');

      // Check ally summon (every 3 points)
      if (scoreTa % 3 === 0) {
        summonAlly();
      }

      hasTarget = false;
      targetCooldown = 0;
      explosionEffect = new ExplosionEffect(targetX, targetY);

      if (scoreTa >= WIN_SCORE) {
        endGame(true);
        return;
      }

      updateUI();
    }
  }

  function aiTick() {
    if (!gameRunning) return;

    if (hasTarget) {
      // Move active agents towards target
      agents.forEach(a => {
        if (!a.active) return;
        a.moveTowardsTarget();
      });

      // Check if any agent reached target
      agents.forEach(a => {
        if (!a.active || !hasTarget) return;
        if (a.x === targetX && a.y === targetY) {
          if (a.isAlly) {
            scoreTa++;
            playSound('scoreTa');
            if (scoreTa % 3 === 0) summonAlly();
            if (scoreTa >= WIN_SCORE) { endGame(true); return; }
          } else {
            scoreDich++;
            playSound('scoreDich');
            a.levelUpGhost();
            if (scoreDich % 2 === 0) {
              summonEnemy();
            }
            if (scoreDich >= WIN_SCORE) { endGame(false); return; }
          }
          hasTarget = false;
          targetCooldown = 0;
          explosionEffect = new ExplosionEffect(targetX, targetY);
          updateUI();
        }
      });
    } else {
      // No target - move randomly
      agents.forEach(a => {
        if (!a.active) return;
        a.moveRandom();
      });

      // Target respawn cooldown
      targetCooldown++;
      if (targetCooldown >= TARGET_RESPAWN_TICKS) {
        spawnTarget();
      }
    }

    gameTime += 0.5;
    updateUI();
  }

  function summonAlly() {
    for (let i = 0; i < agents.length; i++) {
      if (!agents[i].active && agents[i].isAlly) {
        agents[i].active = true;
        agents[i].recalcPath();
        playSound('levelUp');
        break;
      }
    }
  }

  function summonEnemy() {
    for (let i = 0; i < agents.length; i++) {
      if (!agents[i].active && !agents[i].isAlly) {
        agents[i].active = true;
        agents[i].recalcPath();
        playSound('attack');
        break;
      }
    }
  }

  // ============================================
  // RENDERING
  // ============================================
  function render(now) {
    if (!gameRunning) return;
    requestAnimationFrame(render);

    const dt = now - lastFrameTime;
    lastFrameTime = now;

    // AI tick accumulator
    aiAccumulator += dt;
    while (aiAccumulator >= AI_TICK_MS) {
      aiTick();
      aiAccumulator -= AI_TICK_MS;
      if (!gameRunning) return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw map
    drawMap();

    // Draw target with pulsing glow
    if (hasTarget) {
      drawTarget(now);
    }

    // Draw explosion effect
    if (explosionEffect && !explosionEffect.done) {
      explosionEffect.update(now);
      explosionEffect.draw(ctx);
    }

    // Draw agents
    agents.forEach(a => {
      if (!a.active) return;
      a.sprite.updateAnim(now);
      a.sprite.draw(ctx, a.x * CELL_SIZE, a.y * CELL_SIZE, CELL_SIZE);
    });

    // Draw player on top
    player.sprite.updateAnim(now);
    player.sprite.draw(ctx, player.x * CELL_SIZE, player.y * CELL_SIZE, CELL_SIZE);

    // Draw A* path visualization (subtle)
    if (hasTarget) {
      drawPathVisualization();
    }

    // Draw sidebar character avatars
    drawSidebarAvatars(now);
  }

  // ============================================
  // SIDEBAR AVATAR RENDERING
  // ============================================
  let avatarAnimFrame = 0;
  let avatarLastAnim = 0;

  function drawSidebarAvatars(now) {
    // Animate avatar frames
    if (now - avatarLastAnim >= SPRITE_ANIM_MS) {
      avatarAnimFrame++;
      avatarLastAnim = now;
    }

    // Player large avatar (64x64)
    drawAvatarCanvas('player-avatar', images.player, 5, 4, avatarAnimFrame, 64);

    // Enemy large avatar (64x64)
    const firstEnemy = agents.find(a => !a.isAlly && a.active);
    const enemyImgKey = firstEnemy ? firstEnemy.sprite.imgKey : 'enemy1';
    drawAvatarCanvas('enemy-avatar', images[enemyImgKey], 3, 4, avatarAnimFrame, 64);

    // Score row small sprites (32x32)
    drawAvatarCanvas('score-player-sprite', images.player, 5, 4, avatarAnimFrame, 32);
    drawAvatarCanvas('score-enemy-sprite', images[enemyImgKey], 3, 4, avatarAnimFrame, 32);
  }

  function drawAvatarCanvas(canvasId, img, cols, rows, frame, size) {
    const cvs = document.getElementById(canvasId);
    if (!cvs || !img) return;
    const actx = cvs.getContext('2d');

    // Ensure canvas size matches
    if (cvs.width !== size || cvs.height !== size) {
      cvs.width = size;
      cvs.height = size;
    }

    actx.clearRect(0, 0, size, size);

    const fw = img.width / cols;
    const fh = img.height / rows;
    const col = (frame % cols);
    const row = 0; // face down (front-facing)

    // Draw sprite centered and scaled to fill canvas
    const padding = Math.floor(size * 0.05);
    const drawSize = size - padding * 2;
    actx.drawImage(img, col * fw, row * fh, fw, fh, padding, padding, drawSize, drawSize);
  }

  function drawMap() {
    for (let row = 0; row < mapSize; row++) {
      for (let col = 0; col < mapSize; col++) {
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;

        // Draw grass background
        if (images.grass) {
          ctx.drawImage(images.grass, x, y, CELL_SIZE, CELL_SIZE);
        } else {
          ctx.fillStyle = '#2d5a1e';
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        }

        // Draw wall
        if (mapData[row][col] === 1) {
          if (images.wall) {
            ctx.drawImage(images.wall, x, y, CELL_SIZE, CELL_SIZE);
          } else {
            ctx.fillStyle = '#5c3a21';
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
          }
        }
      }
    }
  }

  function drawTarget(now) {
    const x = targetX * CELL_SIZE;
    const y = targetY * CELL_SIZE;

    // Pulsing glow
    const pulse = 0.4 + 0.6 * Math.abs(Math.sin(now / 400));
    ctx.save();
    ctx.globalAlpha = pulse * 0.4;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Bean icon (golden circle with sparkle)
    ctx.save();
    const gradient = ctx.createRadialGradient(
      x + CELL_SIZE / 2, y + CELL_SIZE / 2, 2,
      x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE * 0.35
    );
    gradient.addColorStop(0, '#fef3c7');
    gradient.addColorStop(0.5, '#f59e0b');
    gradient.addColorStop(1, '#d97706');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Sparkle
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.arc(x + CELL_SIZE / 2 - 3, y + CELL_SIZE / 2 - 3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Text label
    ctx.save();
    ctx.font = 'bold 10px Inter';
    ctx.fillStyle = '#fef3c7';
    ctx.textAlign = 'center';
    ctx.fillText('🫘', x + CELL_SIZE / 2, y - 2);
    ctx.restore();
  }

  function drawPathVisualization() {
    // Show first enemy's path as subtle dots
    const firstEnemy = agents.find(a => a.active && !a.isAlly && a.path.length > 0);
    if (!firstEnemy) return;

    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#ef4444';
    firstEnemy.path.forEach((p, i) => {
      if (i === 0) return; // skip first
      ctx.beginPath();
      ctx.arc(p.x * CELL_SIZE + CELL_SIZE / 2, p.y * CELL_SIZE + CELL_SIZE / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // ============================================
  // UI UPDATES
  // ============================================
  function updateUI() {
    const scoreTaEl = document.getElementById('score-ta');
    const scoreDichEl = document.getElementById('score-dich');
    const playerBar = document.getElementById('player-bar');
    const allyCount = document.getElementById('ally-count');
    const enemyCount = document.getElementById('enemy-count');
    const gameTimeEl = document.getElementById('game-time');
    const modalScoreTa = document.getElementById('modal-score-ta');
    const modalScoreDich = document.getElementById('modal-score-dich');
    const modalTime = document.getElementById('modal-time');

    if (scoreTaEl) {
      scoreTaEl.textContent = scoreTa;
      scoreTaEl.classList.remove('score-flash');
      void scoreTaEl.offsetWidth; // trigger reflow
      scoreTaEl.classList.add('score-flash');
    }
    if (scoreDichEl) {
      scoreDichEl.textContent = scoreDich;
      scoreDichEl.classList.remove('score-flash');
      void scoreDichEl.offsetWidth;
      scoreDichEl.classList.add('score-flash');
    }

    const total = scoreTa + scoreDich || 1;
    if (playerBar) playerBar.style.width = (scoreTa / total * 100) + '%';

    const activeAllies = agents.filter(a => a.active && a.isAlly).length;
    const activeEnemies = agents.filter(a => a.active && !a.isAlly).length;
    if (allyCount) allyCount.textContent = activeAllies;
    if (enemyCount) enemyCount.textContent = activeEnemies;
    if (gameTimeEl) gameTimeEl.textContent = Math.floor(gameTime) + 's';

    if (modalScoreTa) modalScoreTa.textContent = scoreTa;
    if (modalScoreDich) modalScoreDich.textContent = scoreDich;
    if (modalTime) modalTime.textContent = Math.floor(gameTime) + 's';
  }

  function updateTargetStatus(txt) {
    const el = document.getElementById('target-status');
    if (el) el.textContent = txt;
  }

  // ============================================
  // GAME FLOW
  // ============================================
  function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('modal-overlay').classList.add('hidden');

    initGame();
    gameRunning = true;
    lastFrameTime = performance.now();
    aiAccumulator = 0;
    requestAnimationFrame(render);
  }

  function endGame(won) {
    gameRunning = false;

    const overlay = document.getElementById('modal-overlay');
    const icon = document.getElementById('modal-icon');
    const title = document.getElementById('modal-title');
    const msg = document.getElementById('modal-message');

    if (won) {
      icon.textContent = '🏆';
      title.textContent = 'Bạn đã thắng!';
      title.style.color = '#10b981';
      msg.textContent = 'Chúc mừng! Bạn đã thu thập đủ ' + WIN_SCORE + ' hạt đậu thần trước bầy sói!';
    } else {
      icon.textContent = '💀';
      title.textContent = 'Bạn đã thua!';
      title.style.color = '#ef4444';
      msg.textContent = 'Bầy sói đã thu thập đủ ' + WIN_SCORE + ' hạt đậu thần trước bạn!';
    }

    updateUI();
    overlay.classList.remove('hidden');
  }

  function showStartScreen() {
    gameRunning = false;
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('modal-overlay').classList.add('hidden');
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    // Map selection
    document.querySelectorAll('.map-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        currentMapKey = btn.dataset.map;
      });
    });

    // Start button
    document.getElementById('start-btn').addEventListener('click', async () => {
      document.getElementById('start-btn').querySelector('span').textContent = '⏳ Đang tải...';
      await loadAssets();
      startGame();
      document.getElementById('start-btn').querySelector('span').textContent = '🎮 Bắt Đầu Chơi';
    });

    // Keyboard
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Quit button
    document.getElementById('quit-btn').addEventListener('click', showStartScreen);

    // Replay button
    document.getElementById('replay-btn').addEventListener('click', () => {
      document.getElementById('modal-overlay').classList.add('hidden');
      startGame();
    });

    // Menu button
    document.getElementById('menu-btn').addEventListener('click', showStartScreen);
  }

  // Start
  document.addEventListener('DOMContentLoaded', init);
})();
