def iterative_deepening_a_star_algorithm(map_data):
    start = tuple(map_data['start'])
    goal = tuple(map_data['goal'])
    grid = map_data['grid']
    legend = map_data['legend']
    costs = map_data['costs']
    
    def heuristic(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])
    
    def get_neighbors(pos):
        neighbors = []
        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            new_pos = (pos[0] + dx, pos[1] + dy)
            if (0 <= new_pos[0] < len(grid) and 
                0 <= new_pos[1] < len(grid[0])):
                terrain_type = legend[str(grid[new_pos[0]][new_pos[1]])]
                if costs[terrain_type] != -1:
                    neighbors.append(new_pos)
        return neighbors
    
    def search(path, g, bound):
        current = path[-1]
        f = g + heuristic(current, goal)
        if f > bound:
            return f, None
        if current == goal:
            return f, path
        min_bound = float('inf')
        for neighbor in get_neighbors(current):
            if neighbor in path:
                continue
            terrain_type = legend[str(grid[neighbor[0]][neighbor[1]])]
            path.append(neighbor)
            t, result = search(path, g + costs[terrain_type], bound)
            if result is not None:
                return t, result
            if t < min_bound:
                min_bound = t
            path.pop()
        return min_bound, None
    
    bound = heuristic(start, goal)
    path = [start]
    explored = []
    while True:
        t, result = search(path, 0, bound)
        if result is not None:
            return {"path": result, "explored": explored}
        if t == float('inf'):
            return {"error": "No path found", "explored": explored}
        bound = t 