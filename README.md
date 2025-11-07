# AI Search Algorithm Visualizer

An interactive web-based visualization tool for understanding and comparing **Uninformed and Informed Search Algorithms** in Artificial Intelligence.

## 🎯 Overview

This project provides a comprehensive, educational platform to visualize how different AI search algorithms work. Built with pure HTML, CSS, and JavaScript, it runs entirely in your browser with no backend required.

## ✨ Features

### 🔍 Search Algorithms Implemented

#### Uninformed Search (Blind Search)
- **Breadth-First Search (BFS)** - Level-by-level exploration
- **Depth-First Search (DFS)** - Deepest path first exploration  
- **Uniform-Cost Search (UCS)** - Least-cost path expansion
- **Depth-Limited Search (DLS)** - DFS with depth constraints
- **Iterative Deepening DFS (IDDFS)** - Memory-efficient complete search

#### Informed Search (Heuristic Search)
- **Greedy Best-First Search** - Heuristic-driven exploration
- **A* Search** - Optimal pathfinding with heuristics
- **Weighted A*** - Faster A* with adjustable weights
- **Bidirectional Search** - Simultaneous forward and backward search

### 🎨 Interactive Features

- **Real-time Visualization**: Watch algorithms explore the search space step-by-step
- **Interactive Grid**: Draw walls, move start/goal nodes with drag-and-drop
- **Speed Control**: Adjust visualization speed from slow to instant
- **Step-by-Step Mode**: Execute one step at a time for detailed analysis
- **Maze Generation**: Create random mazes or patterns automatically
- **Algorithm Comparison**: Run multiple algorithms side-by-side
- **Statistics Dashboard**: Track nodes visited, path length, execution time
- **Educational Info**: View algorithm pseudocode and complexity analysis

### 🎓 Educational Components

- Algorithm complexity information (Time/Space)
- Real-time statistics and metrics
- Color-coded visualization legend
- Heuristic function explanations
- Comparison tables for all algorithms
- Interactive tooltips with node details

## 🚀 Quick Start

### Option 1: Direct Use
1. Download the `index.html` file
2. Open it in any modern web browser
3. Start visualizing!

### Option 2: Local Server
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Visit http://localhost:8000
```

### Option 3: Deploy Online
Deploy to any static hosting platform:
- **Vercel**: `vercel`
- **Netlify**: Drag-and-drop to netlify.com/drop
- **GitHub Pages**: Push to repository and enable Pages
- **Surge**: `surge`

See [deployment-guide.md](deployment-guide.md) for detailed instructions.

## 🎮 How to Use

### Basic Usage

1. **Select Algorithm**: Choose from the dropdown menu
2. **Create Obstacles**: Click or drag on grid to draw walls
3. **Generate Maze**: Use maze generation buttons for complex patterns
4. **Adjust Speed**: Use the speed slider to control animation speed
5. **Run**: Click "Play" to start the visualization
6. **Observe**: Watch the algorithm explore and find the path

### Advanced Features

- **Move Start/Goal**: Drag the green (start) or red (goal) nodes
- **Clear Walls**: Remove all obstacles while keeping the grid
- **Reset**: Clear exploration but keep walls
- **Step Mode**: Execute one iteration at a time
- **Comparison Mode**: Compare two algorithms simultaneously
- **Show Costs**: Display g(n), h(n), f(n) values for informed searches
- **Diagonal Movement**: Toggle diagonal movement allowance

## 🎨 Color Legend

- 🟢 **Green**: Start node
- 🔴 **Red**: Goal/target node
- ⬛ **Black**: Walls/obstacles
- 🟨 **Yellow**: Current node being explored
- 🟧 **Orange**: Nodes in frontier/queue
- 🔵 **Light Blue**: Visited/explored nodes
- 🟣 **Purple**: Final path solution

## 📊 Algorithm Comparison

| Algorithm | Complete | Optimal | Time Complexity | Space Complexity |
|-----------|----------|---------|-----------------|------------------|
| BFS | ✅ | ✅ | O(b^d) | O(b^d) |
| DFS | ❌ | ❌ | O(b^m) | O(bm) |
| UCS | ✅ | ✅ | O(b^⌈C*/ε⌉) | O(b^⌈C*/ε⌉) |
| DLS | ❌ | ❌ | O(b^l) | O(bl) |
| IDDFS | ✅ | ✅ | O(b^d) | O(bd) |
| Greedy | ❌ | ❌ | O(b^m) | O(b^m) |
| A* | ✅ | ✅* | O(b^d) | O(b^d) |
| Weighted A* | ✅ | ❌ | O(b^d) | O(b^d) |
| Bidirectional | ✅ | ✅ | O(b^(d/2)) | O(b^(d/2)) |

*A* is optimal when heuristic is admissible

## 🔧 Technical Details

### Technologies Used
- **HTML5 Canvas** for grid rendering
- **Vanilla JavaScript** for algorithm implementation
- **CSS3** for styling and animations
- **No external dependencies**

### Browser Compatibility
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ⚠️ IE 11+ (limited support)

### Performance
- Handles grids up to 100x100 cells
- Optimized rendering with canvas
- Efficient data structures (priority queues, hash sets)
- Maximum 50,000 iterations to prevent freezing

## 📚 Algorithms Explained

### Breadth-First Search (BFS)
Explores all nodes at the current depth before moving to nodes at the next depth level. Uses a queue (FIFO) data structure. Guarantees shortest path in unweighted graphs.

### Depth-First Search (DFS)
Explores as far as possible along each branch before backtracking. Uses a stack (LIFO) data structure. Memory efficient but doesn't guarantee optimal path.

### A* Search
Combines actual cost g(n) and heuristic estimate h(n) using f(n) = g(n) + h(n). With an admissible heuristic, A* is both complete and optimal.

### Greedy Best-First
Uses only heuristic h(n) to guide search. Fast but not optimal. Prioritizes nodes that appear closest to goal.

For detailed explanations of all algorithms, see the info panel in the application.

## 🎓 Educational Use

Perfect for:
- **Students** learning AI and search algorithms
- **Teachers** demonstrating algorithm concepts
- **Self-learners** exploring pathfinding
- **Interview preparation** for algorithm questions
- **Game developers** understanding pathfinding

## 🤝 Contributing

This is an open educational tool. Feel free to:
- Report bugs or issues
- Suggest new features
- Improve documentation
- Add more algorithms
- Enhance visualizations

## 📖 Learning Resources

### Recommended Reading
- "Artificial Intelligence: A Modern Approach" by Russell & Norvig
- "Introduction to Algorithms" by Cormen et al.
- Online courses on AI and algorithms

### Related Topics
- Graph Theory
- Heuristic Functions
- Optimization Problems
- Pathfinding in Games
- Route Planning

## 🌟 Use Cases

### Game Development
- Character pathfinding
- Enemy AI navigation
- Procedural maze generation

### Robotics
- Robot navigation
- Path planning
- Obstacle avoidance

### Geographic Information Systems
- Route optimization
- Map navigation
- Terrain analysis

### Puzzle Solving
- Sliding puzzles
- Maze solving
- State space search

## 📝 Algorithm Pseudocode

The application includes interactive pseudocode display for each algorithm, highlighting the current execution step during visualization.

## 🔬 Advanced Features

### Heuristic Options
- **Manhattan Distance**: Best for 4-directional movement
- **Euclidean Distance**: Best for diagonal movement
- **Chebyshev Distance**: Alternative for diagonal with equal cost

### Maze Patterns
- **Random Walls**: Configurable density (10-50%)
- **Recursive Division**: Procedurally generated mazes
- **Custom Patterns**: Spiral, rooms, corridors

### Export/Import
- Save maze configurations as JSON
- Load saved mazes
- Share via URL (coming soon)

## 🐛 Known Limitations

- Maximum grid size: 100x100 (browser performance)
- No path smoothing for diagonal movements
- Some older browsers may have performance issues
- Mobile touch controls may be less precise

## 🚀 Future Enhancements

- [ ] 3D visualization mode
- [ ] More search algorithms (IDA*, Jump Point Search)
- [ ] Custom heuristic functions
- [ ] Path smoothing algorithms
- [ ] Performance benchmarking
- [ ] Multi-goal pathfinding
- [ ] Animated agent movement
- [ ] Save/load functionality
- [ ] Tutorial mode with guided steps

## 📜 License

This project is created for educational purposes. Feel free to use, modify, and distribute for learning and teaching.

## 🙏 Acknowledgments

Built with inspiration from:
- Classical AI textbooks and papers
- Online algorithm visualization tools
- Educational content from Stanford, MIT, Berkeley
- The AI research community

## 📞 Contact & Support

For questions, suggestions, or issues:
- Check the Help section in the application
- Review the documentation
- Experiment with different settings
- Try different algorithms and compare results

## 💡 Tips for Best Experience

1. **Start Simple**: Begin with BFS on a small grid
2. **Compare Algorithms**: Run different algorithms on same maze
3. **Experiment**: Try different heuristics and weights
4. **Use Step Mode**: Understand each iteration in detail
5. **Generate Mazes**: Test on complex procedurally generated patterns
6. **Adjust Speed**: Slow down to learn, speed up for demonstrations
7. **Read Info Panels**: Learn about complexity and guarantees

## 🎯 Learning Objectives

After using this visualizer, you should understand:
- How different search strategies work
- Trade-offs between algorithms
- Impact of heuristics on performance
- Difference between complete and optimal algorithms
- Time and space complexity implications
- When to use which algorithm

---

**Made with ❤️ for AI Education**

Start exploring AI search algorithms today! 🚀

Visit the live demo or deploy your own instance following the deployment guide.

Happy Learning! 🎓
