// ============================================================
// Map Editor – Public API Reference
// ============================================================
// All functions exposed on `window` for HTML onclick handlers
// and cross-module communication.
//
// ── UNDO/REDO ──
// window.undo()                    - Undo last action
// window.redo()                    - Redo last undone action
//
// ── ZOOM ──
// window.zoomIn()                  - Zoom in 25%
// window.zoomOut()                 - Zoom out 25%
// window.zoomReset()               - Reset to 100%
//
// ── TOOLS ──
// window.toggleFill()              - Toggle flood fill mode (F)
// window.toggleEyedropper()        - Toggle eyedropper mode (E)
// window.setBrush(size)            - Set brush size 1-3
// window.toggleStamp()             - Toggle stamp tool (S)
//
// ── TILE SELECTION ──
// window.selectTile(id)            - Select tile by ID
//
// ── CLIPBOARD ──
// window.copyRegion()              - Copy selected region (Ctrl+C)
// window.cutRegion()               - Cut selected region (Ctrl+X)
// window.pasteRegion()             - Enter paste mode (Ctrl+V)
// window.rotateClipboard()         - Rotate clipboard 90° CW (R)
// window.flipClipboardH()          - Flip clipboard horizontal (H)
// window.flipClipboardV()          - Flip clipboard vertical (V)
//
// ── LAYERS ──
// window.toggleLayerVis(name)      - Toggle layer visibility
// window.toggleLayerLock(name)     - Toggle layer lock
// window.toggleGrid()              - Toggle grid overlay (G)
// window.toggleMiniMap()           - Toggle mini-map
//   Layer names: 'walls', 'ground', 'props', 'rooms', 'grid'
//
// ── FLOOR MANAGEMENT ──
// window.addFloor()                - Add new floor
// window.switchToFloor(idx)        - Switch to floor by index (internal)
//
// ── ROOM EDITOR ──
// window.applyRoomSettings()       - Apply room name/color from inputs
// window.selectRoom(roomId)        - Select room in palette
// window.renameRoom(roomId)        - Rename room via prompt
// window.recolorRoom(roomId, hex)  - Change room color
// window.deleteRoom(roomId)        - Delete room
// window.addRoomDirect()           - Quick-add new room
//
// ── ACTIONS ──
// window.clearMap()                - Clear current floor (with confirm)
// window.fillBorder()              - Fill border with walls
// window.invertMap()               - Invert wall/floor
// window.generateRandom()          - Generate random map
// window.applyGridSize()           - Apply grid size from sliders
//
// ── EXPORT/IMPORT ──
// window.openExport() / closeExport() / copyExport()
// window.openImport() / closeImport() / doImport()
// window.exportPNG()               - Export current floor as PNG
// window.exportAllFloorsPNG()      - Export all floors as single PNG
// window.saveAndPlay()             - Save to localStorage & redirect
// window.loadSampleMap(filename)   - Load a sample map JSON
//
// ── PREVIEW MODE ──
// window.togglePreview()           - Enter/exit preview mode
//
// ── NAVIGATION ──
// window.goBack()                  - Return to index.html
//
// ── KEYBOARD SHORTCUTS ──
// Z          Undo          |  Shift+Z     Redo
// F          Fill tool     |  E           Eyedropper
// G          Grid toggle   |  R           Rotate clipboard
// H          Flip horiz    |  V           Flip vertical
// S          Stamp tool    |  1-8         Recent tiles
// 9          Eraser        |  [ ]         Brush size
// +/-        Zoom          |  0           Zoom reset
// Ctrl+C/X/V Copy/Cut/Paste|  Escape      Cancel tool
// WASD/Arrow Move preview  |  Click       A* pathfind
// ============================================================
