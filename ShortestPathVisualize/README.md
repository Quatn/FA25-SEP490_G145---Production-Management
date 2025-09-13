# Shortest Path Visualize
## Overview
This project implements a **grid-based pathfinding system** in Java using the **A* search algorithm**.  
The system models a two-dimensional square board, where each cell can either be **traversable** or **blocked**.  
Users can interact with the graphical interface to define **source** and **destination** nodes and observe how the algorithm computes the optimal path.

The implementation is designed for **educational and experimental purposes**, offering a clear demonstration of fundamental pathfinding concepts, heuristic search, and GUI-based visualization.

---

## Features
- **Interactive Grid**  
  - Left-click to select destination and source cells (in order).  
  - The system prevents invalid selections (e.g., blocked or out-of-bounds cells).  

- **Pathfinding Algorithm (A*)**  
  - Supports 8-directional movement (orthogonal and diagonal).  
  - Uses **Euclidean distance** as the heuristic function.  
  - Employs a **priority queue** to efficiently expand the most promising nodes.  

- **Visualization**  
  - Source node displayed in **blue**.  
  - Destination node displayed in **red**.  
  - Path is traced in **yellow cells** on the board and also printed to the console.  
  - Optional cell highlighting to show interaction feedback.  

- **Controls**  
  - `Find Path (A*)`: Executes the A* search from the defined source to destination.  
  - `Reset src/des`: Clears both source and destination selections.  

---

## System Architecture
### Core Components
- **`SquareBoardMap`**  
  Responsible for rendering the board, handling mouse interactions, and executing the A* algorithm.  

- **`Cell`**  
  Stores pathfinding metadata:  
  - `f`: total estimated cost (`f = g + h`)  
  - `g`: cost from source to current node  
  - `h`: heuristic cost to destination  
  - `(parent_i, parent_j)`: backtracking reference for path reconstruction  

- **`Node`**  
  Lightweight structure for maintaining nodes in the **open list** priority queue, ordered by `f` value.  

---

## Algorithms
### A* Search
1. Initialize all cells with infinite cost values.  
2. Insert the source into the **open list** with cost `f = 0`.  
3. Expand nodes iteratively:  
   - Select the node with the lowest `f` value.  
   - Generate its 8 neighbors (N, S, E, W, NE, NW, SE, SW).  
   - Compute `g`, `h`, and `f` values for each neighbor.  
   - Update neighbor information if a shorter path is found.  
4. Continue until:  
   - Destination is reached (path found), or  
   - Open list is empty (no path exists).  

### Heuristic Function
- **Euclidean distance (any directions)**: h(x, y) = sqrt((x_curr - x_dest)^2 + (y_curr - y_dest)^2)

- **Manhattan Distance (4 directions only)**:
h(x, y) = abs(x_curr - x_dest) + abs(y_curr - y_dest)

---
## Pseudocode: A* Algorithm
```pseudocode
FUNCTION AStar(start, goal, board):
    openSet = PriorityQueue()
    openSet.INSERT(start, priority = 0)

    cameFrom = EMPTY_MAP()
    gScore = MAP_WITH_DEFAULT(∞)
    fScore = MAP_WITH_DEFAULT(∞)

    gScore[start] = 0
    fScore[start] = Heuristic(start, goal)

    WHILE openSet IS NOT EMPTY:
        current = openSet.POP_LOWEST_F()

        IF current == goal:
            RETURN ReconstructPath(cameFrom, current)
        END IF

        FOR EACH neighbor IN GetNeighbors(current, board):
            tentative_gScore = gScore[current] + Distance(current, neighbor)

            IF tentative_gScore < gScore[neighbor]:
                cameFrom[neighbor] = current
                gScore[neighbor] = tentative_gScore
                fScore[neighbor] = tentative_gScore + Heuristic(neighbor, goal)

                IF neighbor NOT IN openSet:
                    openSet.INSERT(neighbor, priority = fScore[neighbor])
                END IF
            END IF
        END FOR
    END WHILE

    RETURN FAILURE
END FUNCTION


FUNCTION Heuristic(node, goal):
    dx = goal.x - node.x
    dy = goal.y - node.y
    RETURN SQRT(dx^2 + dy^2)
END FUNCTION


FUNCTION GetNeighbors(node, board):
    neighbors = EMPTY_LIST()
    FOR EACH direction IN {N, NE, E, SE, S, SW, W, NW}:
        candidate = node + direction
        IF candidate IS INSIDE board AND NOT BLOCKED:
            APPEND neighbors, candidate
        END IF
    END FOR
    RETURN neighbors
END FUNCTION


FUNCTION ReconstructPath(cameFrom, current):
    path = [current]
    WHILE current IN cameFrom:
        current = cameFrom[current]
        INSERT_AT_BEGINNING(path, current)
    END WHILE
    RETURN path
END FUNCTION

```
---
## Installation and Execution
### Requirements
- Java 17+ (recommended)  
- Swing (included in JDK)  

### Steps
1. Save the source code as `SquareBoardMap.java`.  
2. Compile the program:  
   ```bash
   javac SquareBoardMap.java

---
## Usage Example
1. Launch the program → a **10×10** grid appears.

2. Click a cell → sets the **destination** (red).

3. Click another cell → sets the source (blue).

4. Click ***Find Path (A*)** → algorithm computes and prints the path in console.
```bash
The destination cell is found
The Path is 
-> (0, 0) -> (1, 0) -> (2, 0) -> (2, 1) -> (3, 2) -> ...
```
---
## References
<a id="1">[1]</a> 
GeeksforGeeks. (2025, July 23). A* search algorithm. <https://www.geeksforgeeks.org/dsa/a-search-algorithm/> 
