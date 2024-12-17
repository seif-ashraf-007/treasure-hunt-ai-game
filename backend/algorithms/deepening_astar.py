def manhattan_distance(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def get_neighbors(pos, grid):
    rows, cols = len(grid), len(grid[0])
    r, c = pos
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    neighbors = []
    
    for dr, dc in directions:
        new_r, new_c = r + dr, c + dc
        if 0 <= new_r < rows and 0 <= new_c < cols and grid[new_r][new_c] != 1:
            neighbors.append((new_r, new_c))
    
    return neighbors

def ida_star_search(start, goal, grid, costs, legend, f_limit, explored):
    stack = [(start, [start], 0)]
    min_f = float('inf')
    best_path = None
    
    while stack:
        node, path, g = stack.pop()
        
        if node not in explored:
            explored.append(node)
            
        f = g + manhattan_distance(node, goal)
        
        if f > f_limit:
            min_f = min(min_f, f)
            continue
            
        if node == goal:
            return path, g, min_f, True
            
        neighbors = get_neighbors(node, grid)
        for neighbor in reversed(neighbors):
            if neighbor not in path:
                terrain_type = legend[str(grid[neighbor[0]][neighbor[1]])]
                new_g = g + costs[terrain_type]
                stack.append((neighbor, path + [neighbor], new_g))
    
    return None, 0, min_f, False

def deepening_astar_algorithm(map_data):
    grid = map_data['grid']
    start = tuple(map_data['start'])
    goal = tuple(map_data['goal'])
    costs = map_data['costs']
    legend = map_data['legend']
    
    f_limit = manhattan_distance(start, goal)
    explored = []
    
    while True:
        path, cost, min_f, found = ida_star_search(start, goal, grid, costs, legend, f_limit, explored)
        
        if found:
            return {
                'path': path,
                'explored': explored,
                'cost': cost
            }
            
        if min_f == float('inf'):
            return {
                'path': [],
                'explored': explored,
                'cost': float('inf')
            }
            
        f_limit = min_f 