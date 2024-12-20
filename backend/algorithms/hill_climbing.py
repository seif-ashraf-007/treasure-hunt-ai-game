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

def manhattan_distance(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def hill_climbing_algorithm(map_data):
    grid = map_data['grid']
    start = tuple(map_data['start'])
    goal = tuple(map_data['goal'])
    costs = map_data['costs']
    legend = map_data['legend']
    
    current = start
    path = [current]
    explored = [current]
    total_cost = 0
    
    while current != goal:
        neighbors = get_neighbors(current, grid)
        if not neighbors:
            break
            
        best_neighbor = None
        best_distance = float('inf')
        
        for neighbor in neighbors:
            if neighbor not in path: 
                distance = manhattan_distance(neighbor, goal)
                if distance < best_distance:
                    best_distance = distance
                    best_neighbor = neighbor
        
        if best_neighbor is None or manhattan_distance(best_neighbor, goal) >= manhattan_distance(current, goal):
            break
            
        current = best_neighbor
        terrain_type = legend[str(grid[current[0]][current[1]])]
        total_cost += costs[terrain_type]
        path.append(current)
        explored.append(current)
    
    if current == goal:
        return {
            'path': path,
            'explored': explored,
            'cost': total_cost
        }
    
    return {'path': [], 'explored': explored, 'cost': float('inf')} 