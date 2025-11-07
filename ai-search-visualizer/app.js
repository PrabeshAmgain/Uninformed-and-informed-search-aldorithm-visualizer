// Constants
const GRID_WIDTH = 40;
const GRID_HEIGHT = 30;
const CELL_SIZE = 20;

// Cell States
const STATE = {
    EMPTY: 0,
    WALL: 1,
    START: 2,
    GOAL: 3,
    VISITED: 4,
    FRONTIER: 5,
    PATH: 6,
    CURRENT: 7,
    VISITED_BI_START: 8,
    VISITED_BI_GOAL: 9
};

// Colors
const COLORS = {
    [STATE.EMPTY]: '#FFFFFF',
    [STATE.WALL]: '#000000',
    [STATE.START]: '#00FF00',
    [STATE.GOAL]: '#FF0000',
    [STATE.VISITED]: '#87CEEB',
    [STATE.FRONTIER]: '#FFA500',
    [STATE.PATH]: '#800080',
    [STATE.CURRENT]: '#FFFF00',
    [STATE.VISITED_BI_START]: '#ADD8E6',
    [STATE.VISITED_BI_GOAL]: '#FFB6C1',
    GRID: '#CCCCCC'
};

// Global Variables
let canvas, ctx;
let grid = [];
let startPos = { x: 0, y: 0 };
let goalPos = { x: GRID_WIDTH - 1, y: GRID_HEIGHT - 1 };
let isRunning = false;
let isPaused = false;
let isDrawing = false;
let drawMode = STATE.WALL;
let selectedAlgorithm = 'bfs';
let speed = 50;
let showGridLines = true;
let allowDiagonal = false;
let showCosts = false;
let heuristic = 'manhattan';
let depthLimit = 20;
let weight = 1.5;

// Algorithm State
let frontier = [];
let visited = new Set();
let cameFrom = {};
let costSoFar = {};
let animationFrameId = null;
let startTime = 0;
let currentDepth = 0;

// Statistics
let stats = {
    visited: 0,
    frontier: 0,
    pathLength: 0,
    pathCost: 0,
    time: 0
};

// Algorithm Definitions
const ALGORITHMS = {
    bfs: {
        name: 'Breadth-First Search (BFS)',
        description: 'Explores nodes level by level using a queue. Guarantees shortest path.',
        complete: true,
        optimal: true,
        timeComplexity: 'O(b^d)',
        spaceComplexity: 'O(b^d)',
        pseudocode: `function BFS(start, goal):
    frontier = Queue()
    frontier.enqueue(start)
    visited = Set()
    visited.add(start)
    
    while frontier is not empty:
        current = frontier.dequeue()
        
        if current == goal:
            return reconstruct_path()
        
        for neighbor in neighbors(current):
            if neighbor not in visited:
                visited.add(neighbor)
                frontier.enqueue(neighbor)
                parent[neighbor] = current
    
    return no path found`
    },
    dfs: {
        name: 'Depth-First Search (DFS)',
        description: 'Explores deepest path first using a stack. May not find shortest path.',
        complete: false,
        optimal: false,
        timeComplexity: 'O(b^m)',
        spaceComplexity: 'O(bm)',
        pseudocode: `function DFS(start, goal):
    frontier = Stack()
    frontier.push(start)
    visited = Set()
    
    while frontier is not empty:
        current = frontier.pop()
        
        if current in visited:
            continue
        
        visited.add(current)
        
        if current == goal:
            return reconstruct_path()
        
        for neighbor in neighbors(current):
            if neighbor not in visited:
                frontier.push(neighbor)
                parent[neighbor] = current
    
    return no path found`
    },
    ucs: {
        name: 'Uniform-Cost Search (UCS)',
        description: 'Expands least-cost node first. Optimal for weighted graphs.',
        complete: true,
        optimal: true,
        timeComplexity: 'O(b^(1+⌊C*/ε⌋))',
        spaceComplexity: 'O(b^(1+⌊C*/ε⌋))',
        pseudocode: `function UCS(start, goal):
    frontier = PriorityQueue()
    frontier.push(start, 0)
    visited = Set()
    cost[start] = 0
    
    while frontier is not empty:
        current = frontier.pop()
        
        if current == goal:
            return reconstruct_path()
        
        if current in visited:
            continue
        
        visited.add(current)
        
        for neighbor in neighbors(current):
            new_cost = cost[current] + edge_cost(current, neighbor)
            if neighbor not in cost or new_cost < cost[neighbor]:
                cost[neighbor] = new_cost
                frontier.push(neighbor, new_cost)
                parent[neighbor] = current
    
    return no path found`
    },
    dls: {
        name: 'Depth-Limited Search (DLS)',
        description: 'DFS with maximum depth limit to prevent infinite loops.',
        complete: false,
        optimal: false,
        timeComplexity: 'O(b^l)',
        spaceComplexity: 'O(bl)',
        pseudocode: `function DLS(start, goal, limit):
    frontier = Stack()
    frontier.push((start, 0))
    visited = Set()
    
    while frontier is not empty:
        current, depth = frontier.pop()
        
        if depth > limit:
            continue
        
        if current in visited:
            continue
        
        visited.add(current)
        
        if current == goal:
            return reconstruct_path()
        
        for neighbor in neighbors(current):
            if neighbor not in visited:
                frontier.push((neighbor, depth + 1))
                parent[neighbor] = current
    
    return no path found`
    },
    iddfs: {
        name: 'Iterative Deepening DFS (IDDFS)',
        description: 'Combines BFS completeness with DFS space efficiency.',
        complete: true,
        optimal: true,
        timeComplexity: 'O(b^d)',
        spaceComplexity: 'O(bd)',
        pseudocode: `function IDDFS(start, goal):
    for depth = 0 to infinity:
        result = DLS(start, goal, depth)
        if result != cutoff:
            return result
    
    return no path found

function DLS(node, goal, depth):
    if node == goal:
        return solution
    if depth == 0:
        return cutoff
    
    cutoff_occurred = false
    for neighbor in neighbors(node):
        result = DLS(neighbor, goal, depth - 1)
        if result == cutoff:
            cutoff_occurred = true
        else if result != failure:
            return result
    
    return cutoff if cutoff_occurred else failure`
    },
    greedy: {
        name: 'Greedy Best-First Search',
        description: 'Uses heuristic h(n) to estimate distance to goal. Fast but not optimal.',
        complete: false,
        optimal: false,
        timeComplexity: 'O(b^m)',
        spaceComplexity: 'O(b^m)',
        pseudocode: `function GreedyBestFirst(start, goal):
    frontier = PriorityQueue()
    h = heuristic(start, goal)
    frontier.push(start, h)
    visited = Set()
    
    while frontier is not empty:
        current = frontier.pop()
        
        if current == goal:
            return reconstruct_path()
        
        if current in visited:
            continue
        
        visited.add(current)
        
        for neighbor in neighbors(current):
            if neighbor not in visited:
                h = heuristic(neighbor, goal)
                frontier.push(neighbor, h)
                parent[neighbor] = current
    
    return no path found`
    },
    astar: {
        name: 'A* Search',
        description: 'Uses f(n)=g(n)+h(n). Optimal and complete with admissible heuristic.',
        complete: true,
        optimal: true,
        timeComplexity: 'O(b^d)',
        spaceComplexity: 'O(b^d)',
        pseudocode: `function AStar(start, goal):
    frontier = PriorityQueue()
    frontier.push(start, 0)
    visited = Set()
    g_score[start] = 0
    f_score[start] = heuristic(start, goal)
    
    while frontier is not empty:
        current = frontier.pop()
        
        if current == goal:
            return reconstruct_path()
        
        if current in visited:
            continue
        
        visited.add(current)
        
        for neighbor in neighbors(current):
            tentative_g = g_score[current] + distance(current, neighbor)
            
            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                parent[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score[neighbor] = tentative_g + heuristic(neighbor, goal)
                frontier.push(neighbor, f_score[neighbor])
    
    return no path found`
    },
    'weighted-astar': {
        name: 'Weighted A*',
        description: 'Uses f(n)=g(n)+w*h(n) where w>1. Trades optimality for speed.',
        complete: true,
        optimal: false,
        timeComplexity: 'O(b^d)',
        spaceComplexity: 'O(b^d)',
        pseudocode: `function WeightedAStar(start, goal, weight):
    frontier = PriorityQueue()
    frontier.push(start, 0)
    visited = Set()
    g_score[start] = 0
    
    while frontier is not empty:
        current = frontier.pop()
        
        if current == goal:
            return reconstruct_path()
        
        if current in visited:
            continue
        
        visited.add(current)
        
        for neighbor in neighbors(current):
            tentative_g = g_score[current] + distance(current, neighbor)
            
            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                parent[neighbor] = current
                g_score[neighbor] = tentative_g
                h = heuristic(neighbor, goal)
                f = tentative_g + weight * h
                frontier.push(neighbor, f)
    
    return no path found`
    },
    bidirectional: {
        name: 'Bidirectional Search',
        description: 'Searches from both start and goal simultaneously.',
        complete: true,
        optimal: true,
        timeComplexity: 'O(b^(d/2))',
        spaceComplexity: 'O(b^(d/2))',
        pseudocode: `function BidirectionalSearch(start, goal):
    frontier_start = Queue()
    frontier_goal = Queue()
    frontier_start.enqueue(start)
    frontier_goal.enqueue(goal)
    visited_start = Set([start])
    visited_goal = Set([goal])
    
    while frontier_start and frontier_goal not empty:
        # Expand from start
        current_start = frontier_start.dequeue()
        if current_start in visited_goal:
            return reconstruct_bidirectional_path()
        
        for neighbor in neighbors(current_start):
            if neighbor not in visited_start:
                visited_start.add(neighbor)
                frontier_start.enqueue(neighbor)
                parent_start[neighbor] = current_start
        
        # Expand from goal
        current_goal = frontier_goal.dequeue()
        if current_goal in visited_start:
            return reconstruct_bidirectional_path()
        
        for neighbor in neighbors(current_goal):
            if neighbor not in visited_goal:
                visited_goal.add(neighbor)
                frontier_goal.enqueue(neighbor)
                parent_goal[neighbor] = current_goal
    
    return no path found`
    }
};

// Initialize
function init() {
    canvas = document.getElementById('gridCanvas');
    ctx = canvas.getContext('2d');
    
    canvas.width = GRID_WIDTH * CELL_SIZE;
    canvas.height = GRID_HEIGHT * CELL_SIZE;
    
    initializeGrid();
    setupEventListeners();
    drawGrid();
    updateAlgorithmInfo();
}

// Initialize Grid
function initializeGrid() {
    grid = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
        grid[y] = [];
        for (let x = 0; x < GRID_WIDTH; x++) {
            grid[y][x] = {
                state: STATE.EMPTY,
                g: Infinity,
                h: 0,
                f: Infinity,
                parent: null
            };
        }
    }
    grid[startPos.y][startPos.x].state = STATE.START;
    grid[goalPos.y][goalPos.x].state = STATE.GOAL;
}

// Setup Event Listeners
function setupEventListeners() {
    // Algorithm selection
    document.getElementById('algorithmSelect').addEventListener('change', (e) => {
        selectedAlgorithm = e.target.value;
        updateAlgorithmInfo();
        showAlgorithmSpecificOptions();
    });
    
    // Control buttons
    document.getElementById('runBtn').addEventListener('click', runAlgorithm);
    document.getElementById('pauseBtn').addEventListener('click', pauseAlgorithm);
    document.getElementById('stepBtn').addEventListener('click', stepAlgorithm);
    document.getElementById('resetBtn').addEventListener('click', resetVisualization);
    
    // Maze generation
    document.getElementById('clearWallsBtn').addEventListener('click', clearWalls);
    document.getElementById('randomMazeBtn').addEventListener('click', generateRandomMaze);
    document.getElementById('recursiveMazeBtn').addEventListener('click', generateRecursiveMaze);
    
    // Options
    document.getElementById('showGridLines').addEventListener('change', (e) => {
        showGridLines = e.target.checked;
        drawGrid();
    });
    
    document.getElementById('allowDiagonal').addEventListener('change', (e) => {
        allowDiagonal = e.target.checked;
    });
    
    document.getElementById('showCosts').addEventListener('change', (e) => {
        showCosts = e.target.checked;
        drawGrid();
    });
    
    document.getElementById('heuristicSelect').addEventListener('change', (e) => {
        heuristic = e.target.value;
    });
    
    document.getElementById('depthLimit').addEventListener('input', (e) => {
        depthLimit = parseInt(e.target.value);
    });
    
    // Speed slider
    const speedSlider = document.getElementById('speedSlider');
    speedSlider.addEventListener('input', (e) => {
        speed = parseInt(e.target.value);
        document.getElementById('speedValue').textContent = speed + 'ms';
    });
    
    // Density slider
    const densitySlider = document.getElementById('densitySlider');
    densitySlider.addEventListener('input', (e) => {
        document.getElementById('densityValue').textContent = e.target.value + '%';
    });
    
    // Weight slider
    const weightSlider = document.getElementById('weightSlider');
    weightSlider.addEventListener('input', (e) => {
        weight = parseFloat(e.target.value);
        document.getElementById('weightValue').textContent = weight.toFixed(1);
    });
    
    // Canvas mouse events
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Show algorithm-specific options
function showAlgorithmSpecificOptions() {
    const heuristicGroup = document.getElementById('heuristicGroup');
    const depthLimitGroup = document.getElementById('depthLimitGroup');
    const weightGroup = document.getElementById('weightGroup');
    
    heuristicGroup.style.display = 'none';
    depthLimitGroup.style.display = 'none';
    weightGroup.style.display = 'none';
    
    if (['greedy', 'astar', 'weighted-astar', 'bidirectional'].includes(selectedAlgorithm)) {
        heuristicGroup.style.display = 'block';
    }
    
    if (selectedAlgorithm === 'dls') {
        depthLimitGroup.style.display = 'block';
    }
    
    if (selectedAlgorithm === 'weighted-astar') {
        weightGroup.style.display = 'block';
    }
}

// Mouse handlers
function handleMouseDown(e) {
    if (isRunning && !isPaused) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return;
    
    isDrawing = true;
    
    if (e.button === 2) {
        drawMode = STATE.EMPTY;
        toggleCell(x, y, STATE.EMPTY);
    } else {
        drawMode = STATE.WALL;
        toggleCell(x, y, STATE.WALL);
    }
}

function handleMouseMove(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return;
    
    toggleCell(x, y, drawMode);
}

function handleMouseUp() {
    isDrawing = false;
}

function toggleCell(x, y, state) {
    if ((x === startPos.x && y === startPos.y) || (x === goalPos.x && y === goalPos.y)) {
        return;
    }
    
    const cell = grid[y][x];
    if (state === STATE.WALL) {
        if (cell.state === STATE.EMPTY) {
            cell.state = STATE.WALL;
        }
    } else if (state === STATE.EMPTY) {
        if (cell.state === STATE.WALL) {
            cell.state = STATE.EMPTY;
        }
    }
    
    drawGrid();
}

// Draw Grid
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const cell = grid[y][x];
            const px = x * CELL_SIZE;
            const py = y * CELL_SIZE;
            
            // Fill cell
            ctx.fillStyle = COLORS[cell.state];
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            
            // Draw grid lines
            if (showGridLines) {
                ctx.strokeStyle = COLORS.GRID;
                ctx.lineWidth = 0.5;
                ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);
            }
            
            // Draw costs
            if (showCosts && ['astar', 'weighted-astar', 'ucs'].includes(selectedAlgorithm)) {
                if (cell.state === STATE.VISITED || cell.state === STATE.FRONTIER) {
                    ctx.fillStyle = '#000';
                    ctx.font = '8px monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    if (selectedAlgorithm === 'ucs') {
                        if (cell.g !== Infinity) {
                            ctx.fillText(cell.g.toFixed(1), px + CELL_SIZE / 2, py + CELL_SIZE / 2);
                        }
                    } else {
                        const g = cell.g === Infinity ? '∞' : cell.g.toFixed(0);
                        const h = cell.h.toFixed(0);
                        const f = cell.f === Infinity ? '∞' : cell.f.toFixed(0);
                        ctx.fillText(`f:${f}`, px + CELL_SIZE / 2, py + CELL_SIZE / 3);
                        ctx.fillText(`g:${g}`, px + CELL_SIZE / 2, py + CELL_SIZE / 2);
                        ctx.fillText(`h:${h}`, px + CELL_SIZE / 2, py + 2 * CELL_SIZE / 3);
                    }
                }
            }
        }
    }
}

// Clear walls
function clearWalls() {
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (grid[y][x].state === STATE.WALL) {
                grid[y][x].state = STATE.EMPTY;
            }
        }
    }
    drawGrid();
}

// Generate random maze
function generateRandomMaze() {
    clearWalls();
    const density = parseInt(document.getElementById('densitySlider').value) / 100;
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if ((x === startPos.x && y === startPos.y) || (x === goalPos.x && y === goalPos.y)) {
                continue;
            }
            if (Math.random() < density) {
                grid[y][x].state = STATE.WALL;
            }
        }
    }
    drawGrid();
}

// Generate recursive division maze
function generateRecursiveMaze() {
    clearWalls();
    
    function divide(x, y, width, height, horizontal) {
        if (width < 2 || height < 2) return;
        
        if (horizontal) {
            const wy = y + Math.floor(Math.random() * height);
            const passage = x + Math.floor(Math.random() * width);
            
            for (let wx = x; wx < x + width; wx++) {
                if (wx === passage) continue;
                if ((wx === startPos.x && wy === startPos.y) || (wx === goalPos.x && wy === goalPos.y)) continue;
                if (wy >= 0 && wy < GRID_HEIGHT && wx >= 0 && wx < GRID_WIDTH) {
                    grid[wy][wx].state = STATE.WALL;
                }
            }
            
            divide(x, y, width, wy - y, !horizontal);
            divide(x, wy + 1, width, y + height - wy - 1, !horizontal);
        } else {
            const wx = x + Math.floor(Math.random() * width);
            const passage = y + Math.floor(Math.random() * height);
            
            for (let wy = y; wy < y + height; wy++) {
                if (wy === passage) continue;
                if ((wx === startPos.x && wy === startPos.y) || (wx === goalPos.x && wy === goalPos.y)) continue;
                if (wy >= 0 && wy < GRID_HEIGHT && wx >= 0 && wx < GRID_WIDTH) {
                    grid[wy][wx].state = STATE.WALL;
                }
            }
            
            divide(x, y, wx - x, height, !horizontal);
            divide(wx + 1, y, x + width - wx - 1, height, !horizontal);
        }
    }
    
    divide(0, 0, GRID_WIDTH, GRID_HEIGHT, Math.random() > 0.5);
    drawGrid();
}

// Get neighbors
function getNeighbors(x, y) {
    const neighbors = [];
    const directions = [
        { dx: 0, dy: -1, cost: 1 },  // Up
        { dx: 1, dy: 0, cost: 1 },   // Right
        { dx: 0, dy: 1, cost: 1 },   // Down
        { dx: -1, dy: 0, cost: 1 }   // Left
    ];
    
    if (allowDiagonal) {
        directions.push(
            { dx: 1, dy: -1, cost: 1.414 },  // Up-Right
            { dx: 1, dy: 1, cost: 1.414 },   // Down-Right
            { dx: -1, dy: 1, cost: 1.414 },  // Down-Left
            { dx: -1, dy: -1, cost: 1.414 }  // Up-Left
        );
    }
    
    for (const dir of directions) {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        
        if (nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT) {
            if (grid[ny][nx].state !== STATE.WALL) {
                neighbors.push({ x: nx, y: ny, cost: dir.cost });
            }
        }
    }
    
    return neighbors;
}

// Heuristic functions
function calculateHeuristic(x1, y1, x2, y2) {
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);
    
    switch (heuristic) {
        case 'manhattan':
            return dx + dy;
        case 'euclidean':
            return Math.sqrt(dx * dx + dy * dy);
        case 'chebyshev':
            return Math.max(dx, dy);
        default:
            return dx + dy;
    }
}

// Priority Queue implementation
class PriorityQueue {
    constructor() {
        this.items = [];
    }
    
    enqueue(item, priority) {
        this.items.push({ item, priority });
        this.items.sort((a, b) => a.priority - b.priority);
    }
    
    dequeue() {
        return this.items.shift()?.item;
    }
    
    isEmpty() {
        return this.items.length === 0;
    }
    
    size() {
        return this.items.length;
    }
}

// Reset visualization
function resetVisualization() {
    if (animationFrameId) {
        clearTimeout(animationFrameId);
        animationFrameId = null;
    }
    
    isRunning = false;
    isPaused = false;
    frontier = [];
    visited = new Set();
    cameFrom = {};
    costSoFar = {};
    currentDepth = 0;
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const cell = grid[y][x];
            if (cell.state !== STATE.WALL && cell.state !== STATE.START && cell.state !== STATE.GOAL) {
                cell.state = STATE.EMPTY;
            }
            cell.g = Infinity;
            cell.h = 0;
            cell.f = Infinity;
            cell.parent = null;
        }
    }
    
    stats = { visited: 0, frontier: 0, pathLength: 0, pathCost: 0, time: 0 };
    updateStats();
    updateStatus('Ready');
    drawGrid();
    
    document.getElementById('runBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('statsPanel').classList.remove('running');
}

// Update statistics
function updateStats() {
    document.getElementById('statVisited').textContent = stats.visited;
    document.getElementById('statFrontier').textContent = stats.frontier;
    document.getElementById('statPathLength').textContent = stats.pathLength || '-';
    document.getElementById('statPathCost').textContent = stats.pathCost ? stats.pathCost.toFixed(2) : '-';
    document.getElementById('statTime').textContent = stats.time + 'ms';
}

function updateStatus(status) {
    document.getElementById('statStatus').textContent = status;
}

// Update algorithm info
function updateAlgorithmInfo() {
    const algo = ALGORITHMS[selectedAlgorithm];
    document.getElementById('statAlgorithm').textContent = algo.name.split('(')[0].trim();
    
    const detailsDiv = document.getElementById('algorithmDetails');
    detailsDiv.innerHTML = `
        <p><strong>${algo.name}</strong></p>
        <p>${algo.description}</p>
        <p><strong>Complete:</strong> ${algo.complete ? '✓ Yes' : '✗ No'}</p>
        <p><strong>Optimal:</strong> ${algo.optimal ? '✓ Yes' : '✗ No'}</p>
        <p><strong>Time:</strong> ${algo.timeComplexity}</p>
        <p><strong>Space:</strong> ${algo.spaceComplexity}</p>
    `;
    
    document.getElementById('pseudocodeDisplay').textContent = algo.pseudocode;
}

// Run algorithm
function runAlgorithm() {
    if (isRunning && !isPaused) return;
    
    if (!isRunning) {
        resetVisualization();
        startTime = Date.now();
        isRunning = true;
        document.getElementById('runBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('statsPanel').classList.add('running');
        updateStatus('Running');
        
        // Initialize algorithm
        initializeAlgorithm();
    }
    
    isPaused = false;
    runStep();
}

function pauseAlgorithm() {
    isPaused = true;
    if (animationFrameId) {
        clearTimeout(animationFrameId);
        animationFrameId = null;
    }
    updateStatus('Paused');
}

function stepAlgorithm() {
    if (!isRunning) {
        resetVisualization();
        startTime = Date.now();
        isRunning = true;
        isPaused = true;
        initializeAlgorithm();
    }
    
    executeStep();
}

// Initialize algorithm-specific data structures
function initializeAlgorithm() {
    const startKey = `${startPos.x},${startPos.y}`;
    
    switch (selectedAlgorithm) {
        case 'bfs':
            frontier = [{ x: startPos.x, y: startPos.y }];
            visited.add(startKey);
            break;
            
        case 'dfs':
            frontier = [{ x: startPos.x, y: startPos.y }];
            break;
            
        case 'ucs':
        case 'astar':
        case 'weighted-astar':
        case 'greedy':
            frontier = new PriorityQueue();
            grid[startPos.y][startPos.x].g = 0;
            grid[startPos.y][startPos.x].h = calculateHeuristic(startPos.x, startPos.y, goalPos.x, goalPos.y);
            grid[startPos.y][startPos.x].f = grid[startPos.y][startPos.x].g + grid[startPos.y][startPos.x].h;
            
            if (selectedAlgorithm === 'greedy') {
                frontier.enqueue({ x: startPos.x, y: startPos.y }, grid[startPos.y][startPos.x].h);
            } else {
                frontier.enqueue({ x: startPos.x, y: startPos.y }, grid[startPos.y][startPos.x].f);
            }
            break;
            
        case 'dls':
            frontier = [{ x: startPos.x, y: startPos.y, depth: 0 }];
            break;
            
        case 'iddfs':
            currentDepth = 0;
            frontier = [{ x: startPos.x, y: startPos.y, depth: 0 }];
            break;
            
        case 'bidirectional':
            frontier = {
                start: [{ x: startPos.x, y: startPos.y }],
                goal: [{ x: goalPos.x, y: goalPos.y }]
            };
            visited = {
                start: new Set([startKey]),
                goal: new Set([`${goalPos.x},${goalPos.y}`])
            };
            cameFrom = {
                start: {},
                goal: {}
            };
            break;
    }
}

// Execute one step
function executeStep() {
    if (selectedAlgorithm === 'bidirectional') {
        return executeBidirectionalStep();
    }
    
    if (selectedAlgorithm === 'iddfs') {
        return executeIDDFSStep();
    }
    
    // Check if frontier is empty
    const isEmpty = Array.isArray(frontier) ? frontier.length === 0 : frontier.isEmpty();
    if (isEmpty) {
        finishSearch(false);
        return false;
    }
    
    // Get current node
    let current;
    if (selectedAlgorithm === 'dfs' || selectedAlgorithm === 'dls') {
        current = frontier.pop();  // Stack behavior
    } else if (Array.isArray(frontier)) {
        current = frontier.shift();  // Queue behavior
    } else {
        current = frontier.dequeue();  // Priority queue
    }
    
    if (!current) {
        finishSearch(false);
        return false;
    }
    
    const currentKey = `${current.x},${current.y}`;
    
    // For DFS and DLS, check if already visited
    if ((selectedAlgorithm === 'dfs' || selectedAlgorithm === 'dls') && visited.has(currentKey)) {
        return true;
    }
    
    // For DLS, check depth limit
    if (selectedAlgorithm === 'dls' && current.depth > depthLimit) {
        return true;
    }
    
    // Mark as visited
    if (!visited.has(currentKey)) {
        visited.add(currentKey);
        stats.visited++;
        
        if (grid[current.y][current.x].state !== STATE.START && grid[current.y][current.x].state !== STATE.GOAL) {
            grid[current.y][current.x].state = STATE.CURRENT;
        }
    }
    
    // Check if goal reached
    if (current.x === goalPos.x && current.y === goalPos.y) {
        reconstructPath(current);
        finishSearch(true);
        return false;
    }
    
    // Explore neighbors
    const neighbors = getNeighbors(current.x, current.y);
    for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        
        if (selectedAlgorithm === 'bfs') {
            if (!visited.has(neighborKey)) {
                visited.add(neighborKey);
                frontier.push(neighbor);
                grid[neighbor.y][neighbor.x].parent = current;
                
                if (grid[neighbor.y][neighbor.x].state !== STATE.GOAL) {
                    grid[neighbor.y][neighbor.x].state = STATE.FRONTIER;
                }
            }
        } else if (selectedAlgorithm === 'dfs') {
            if (!visited.has(neighborKey)) {
                frontier.push(neighbor);
                grid[neighbor.y][neighbor.x].parent = current;
                
                if (grid[neighbor.y][neighbor.x].state !== STATE.GOAL) {
                    grid[neighbor.y][neighbor.x].state = STATE.FRONTIER;
                }
            }
        } else if (selectedAlgorithm === 'dls') {
            if (!visited.has(neighborKey)) {
                frontier.push({ ...neighbor, depth: current.depth + 1 });
                grid[neighbor.y][neighbor.x].parent = current;
                
                if (grid[neighbor.y][neighbor.x].state !== STATE.GOAL) {
                    grid[neighbor.y][neighbor.x].state = STATE.FRONTIER;
                }
            }
        } else if (selectedAlgorithm === 'ucs') {
            const newCost = grid[current.y][current.x].g + neighbor.cost;
            
            if (newCost < grid[neighbor.y][neighbor.x].g) {
                grid[neighbor.y][neighbor.x].g = newCost;
                grid[neighbor.y][neighbor.x].parent = current;
                frontier.enqueue(neighbor, newCost);
                
                if (grid[neighbor.y][neighbor.x].state !== STATE.GOAL && !visited.has(neighborKey)) {
                    grid[neighbor.y][neighbor.x].state = STATE.FRONTIER;
                }
            }
        } else if (selectedAlgorithm === 'greedy') {
            if (!visited.has(neighborKey)) {
                const h = calculateHeuristic(neighbor.x, neighbor.y, goalPos.x, goalPos.y);
                grid[neighbor.y][neighbor.x].h = h;
                grid[neighbor.y][neighbor.x].parent = current;
                frontier.enqueue(neighbor, h);
                
                if (grid[neighbor.y][neighbor.x].state !== STATE.GOAL) {
                    grid[neighbor.y][neighbor.x].state = STATE.FRONTIER;
                }
            }
        } else if (selectedAlgorithm === 'astar' || selectedAlgorithm === 'weighted-astar') {
            const newG = grid[current.y][current.x].g + neighbor.cost;
            
            if (newG < grid[neighbor.y][neighbor.x].g) {
                grid[neighbor.y][neighbor.x].g = newG;
                const h = calculateHeuristic(neighbor.x, neighbor.y, goalPos.x, goalPos.y);
                grid[neighbor.y][neighbor.x].h = h;
                
                const w = selectedAlgorithm === 'weighted-astar' ? weight : 1;
                grid[neighbor.y][neighbor.x].f = newG + w * h;
                grid[neighbor.y][neighbor.x].parent = current;
                frontier.enqueue(neighbor, grid[neighbor.y][neighbor.x].f);
                
                if (grid[neighbor.y][neighbor.x].state !== STATE.GOAL && !visited.has(neighborKey)) {
                    grid[neighbor.y][neighbor.x].state = STATE.FRONTIER;
                }
            }
        }
    }
    
    // Update current to visited
    if (grid[current.y][current.x].state === STATE.CURRENT) {
        grid[current.y][current.x].state = STATE.VISITED;
    }
    
    // Update stats
    stats.frontier = Array.isArray(frontier) ? frontier.length : frontier.size();
    stats.time = Date.now() - startTime;
    updateStats();
    drawGrid();
    
    return true;
}

// Execute IDDFS step
function executeIDDFSStep() {
    if (frontier.length === 0) {
        // Reset for next depth
        currentDepth++;
        if (currentDepth > 50) {
            finishSearch(false);
            return false;
        }
        
        // Clear visited and frontier
        visited.clear();
        frontier = [{ x: startPos.x, y: startPos.y, depth: 0 }];
        
        // Clear grid visualization
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const cell = grid[y][x];
                if (cell.state !== STATE.WALL && cell.state !== STATE.START && cell.state !== STATE.GOAL) {
                    cell.state = STATE.EMPTY;
                    cell.parent = null;
                }
            }
        }
        
        updateStatus(`Running (Depth: ${currentDepth})`);
        return true;
    }
    
    const current = frontier.pop();
    const currentKey = `${current.x},${current.y}`;
    
    if (visited.has(currentKey)) {
        return true;
    }
    
    if (current.depth > currentDepth) {
        return true;
    }
    
    visited.add(currentKey);
    stats.visited++;
    
    if (grid[current.y][current.x].state !== STATE.START && grid[current.y][current.x].state !== STATE.GOAL) {
        grid[current.y][current.x].state = STATE.CURRENT;
    }
    
    if (current.x === goalPos.x && current.y === goalPos.y) {
        reconstructPath(current);
        finishSearch(true);
        return false;
    }
    
    const neighbors = getNeighbors(current.x, current.y);
    for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        if (!visited.has(neighborKey)) {
            frontier.push({ ...neighbor, depth: current.depth + 1 });
            grid[neighbor.y][neighbor.x].parent = current;
            
            if (grid[neighbor.y][neighbor.x].state !== STATE.GOAL) {
                grid[neighbor.y][neighbor.x].state = STATE.FRONTIER;
            }
        }
    }
    
    if (grid[current.y][current.x].state === STATE.CURRENT) {
        grid[current.y][current.x].state = STATE.VISITED;
    }
    
    stats.frontier = frontier.length;
    stats.time = Date.now() - startTime;
    updateStats();
    drawGrid();
    
    return true;
}

// Execute bidirectional step
function executeBidirectionalStep() {
    if (frontier.start.length === 0 && frontier.goal.length === 0) {
        finishSearch(false);
        return false;
    }
    
    // Expand from start
    if (frontier.start.length > 0) {
        const current = frontier.start.shift();
        const currentKey = `${current.x},${current.y}`;
        
        // Check if we've met the other search
        if (visited.goal.has(currentKey)) {
            reconstructBidirectionalPath(current, 'start');
            finishSearch(true);
            return false;
        }
        
        if (grid[current.y][current.x].state !== STATE.START) {
            grid[current.y][current.x].state = STATE.VISITED_BI_START;
        }
        
        const neighbors = getNeighbors(current.x, current.y);
        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.x},${neighbor.y}`;
            if (!visited.start.has(neighborKey)) {
                visited.start.add(neighborKey);
                frontier.start.push(neighbor);
                cameFrom.start[neighborKey] = current;
                
                if (grid[neighbor.y][neighbor.x].state === STATE.EMPTY) {
                    grid[neighbor.y][neighbor.x].state = STATE.FRONTIER;
                }
            }
        }
    }
    
    // Expand from goal
    if (frontier.goal.length > 0) {
        const current = frontier.goal.shift();
        const currentKey = `${current.x},${current.y}`;
        
        // Check if we've met the other search
        if (visited.start.has(currentKey)) {
            reconstructBidirectionalPath(current, 'goal');
            finishSearch(true);
            return false;
        }
        
        if (grid[current.y][current.x].state !== STATE.GOAL) {
            grid[current.y][current.x].state = STATE.VISITED_BI_GOAL;
        }
        
        const neighbors = getNeighbors(current.x, current.y);
        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.x},${neighbor.y}`;
            if (!visited.goal.has(neighborKey)) {
                visited.goal.add(neighborKey);
                frontier.goal.push(neighbor);
                cameFrom.goal[neighborKey] = current;
                
                if (grid[neighbor.y][neighbor.x].state === STATE.EMPTY) {
                    grid[neighbor.y][neighbor.x].state = STATE.FRONTIER;
                }
            }
        }
    }
    
    stats.visited = visited.start.size + visited.goal.size;
    stats.frontier = frontier.start.length + frontier.goal.length;
    stats.time = Date.now() - startTime;
    updateStats();
    drawGrid();
    
    return true;
}

// Reconstruct path
function reconstructPath(endNode) {
    const path = [];
    let current = endNode;
    let cost = 0;
    
    while (current) {
        path.unshift(current);
        const cell = grid[current.y][current.x];
        if (cell.parent) {
            const dx = Math.abs(current.x - cell.parent.x);
            const dy = Math.abs(current.y - cell.parent.y);
            cost += (dx + dy > 1) ? 1.414 : 1;
        }
        current = cell.parent;
    }
    
    // Draw path
    for (const node of path) {
        if (grid[node.y][node.x].state !== STATE.START && grid[node.y][node.x].state !== STATE.GOAL) {
            grid[node.y][node.x].state = STATE.PATH;
        }
    }
    
    stats.pathLength = path.length;
    stats.pathCost = cost;
}

// Reconstruct bidirectional path
function reconstructBidirectionalPath(meetNode, meetDirection) {
    const path = [];
    
    // Reconstruct from start to meet point
    let current = meetNode;
    const meetKey = `${meetNode.x},${meetNode.y}`;
    
    if (meetDirection === 'start') {
        while (current) {
            path.unshift(current);
            const key = `${current.x},${current.y}`;
            current = cameFrom.start[key];
        }
        
        // Reconstruct from meet point to goal
        current = cameFrom.goal[meetKey];
        while (current) {
            path.push(current);
            const key = `${current.x},${current.y}`;
            current = cameFrom.goal[key];
        }
    } else {
        // Start from goal side
        while (current) {
            path.push(current);
            const key = `${current.x},${current.y}`;
            current = cameFrom.goal[key];
        }
        path.reverse();
        
        // Add start side
        current = cameFrom.start[meetKey];
        while (current) {
            path.unshift(current);
            const key = `${current.x},${current.y}`;
            current = cameFrom.start[key];
        }
    }
    
    // Draw path
    let cost = 0;
    for (let i = 0; i < path.length; i++) {
        const node = path[i];
        if (grid[node.y][node.x].state !== STATE.START && grid[node.y][node.x].state !== STATE.GOAL) {
            grid[node.y][node.x].state = STATE.PATH;
        }
        if (i > 0) {
            const prev = path[i - 1];
            const dx = Math.abs(node.x - prev.x);
            const dy = Math.abs(node.y - prev.y);
            cost += (dx + dy > 1) ? 1.414 : 1;
        }
    }
    
    stats.pathLength = path.length;
    stats.pathCost = cost;
}

// Finish search
function finishSearch(found) {
    isRunning = false;
    isPaused = false;
    
    if (animationFrameId) {
        clearTimeout(animationFrameId);
        animationFrameId = null;
    }
    
    updateStatus(found ? 'Path Found!' : 'No Path');
    document.getElementById('runBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('statsPanel').classList.remove('running');
    
    stats.time = Date.now() - startTime;
    updateStats();
    drawGrid();
}

// Run step with animation
function runStep() {
    if (!isRunning || isPaused) return;
    
    const shouldContinue = executeStep();
    
    if (shouldContinue && isRunning && !isPaused) {
        animationFrameId = setTimeout(runStep, speed);
    }
}

// Toggle collapsible
function toggleCollapsible(header) {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('span:last-child');
    
    if (content.classList.contains('active')) {
        content.classList.remove('active');
        arrow.textContent = '▼';
    } else {
        content.classList.add('active');
        arrow.textContent = '▲';
    }
}

// Initialize on load
window.addEventListener('load', init);