import math
import time

def heuristic(a, b):
    """Calculate the heuristic (Manhattan distance) between two points."""
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def get_terrain_cost(grid, costs, position):
    """Get the cost of moving to a position based on terrain type."""
    x, y = position
    terrain_type = str(grid[x][y])  # Convert to string to match legend keys
    terrain_name = map_data['legend'][terrain_type]
    return costs[terrain_name]

def is_valid_move(grid, position):
    """Check if the move is valid (within bounds and not a wall)."""
    x, y = position
    return (0 <= x < len(grid) and 0 <= y < len(grid[0]) and 
            grid[x][y] != 4)  # 4 represents wall

def ida_star(map_data):
    """Perform Iterative Deepening A* search."""
    start_time = time.time()
    start = tuple(map_data['start'])
    goal = tuple(map_data['goal'])
    grid = map_data['grid']
    costs = map_data['costs']
    explored = set()
    
    def search(path, g, threshold):
        node = path[-1]
        f = g + heuristic(node, goal)
        
        if f > threshold:
            return f, None
        if node == goal:
            return "FOUND", list(path)
        
        min_threshold = float('inf')
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:  # Up, Down, Left, Right
            neighbor = (node[0] + dx, node[1] + dy)
            if is_valid_move(grid, neighbor):
                terrain_type = str(grid[neighbor[0]][neighbor[1]])
                terrain_name = map_data['legend'][terrain_type]
                move_cost = costs[terrain_name]
                
                if neighbor not in path:  # Avoid cycles
                    explored.add(neighbor)
                    path.append(neighbor)
                    t, found_path = search(path, g + move_cost, threshold)
                    if t == "FOUND":
                        return "FOUND", found_path
                    if t < min_threshold:
                        min_threshold = t
                    path.pop()
        
        return min_threshold, None

    threshold = heuristic(start, goal)
    final_path = None
    
    while threshold != float('inf'):
        path = [start]
        explored.add(start)
        t, found_path = search(path, 0, threshold)
        if t == "FOUND":
            final_path = found_path
            break
        threshold = t

    end_time = time.time()
    algorithm_time = end_time - start_time

    if final_path is None:
        return {
            "error": "No path found!",
            "algorithmTime": algorithm_time,
            "explored": list(explored)
        }

    return {
        "path": [(x, y) for x, y in final_path],
        "explored": list(explored),
        "algorithmTime": algorithm_time,
        "mapData": map_data
    }