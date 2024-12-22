from heapq import heappush, heappop

def manhattan_distance(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def get_neighbors(pos, grid):
    rows, cols = len(grid), len(grid[0])
    r, c = pos
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    neighbors = []
    
    for dr, dc in directions:
        new_r, new_c = r + dr, c + dc
        if 0 <= new_r < rows and 0 <= new_c < cols and grid[new_r][new_c] != 4:
            neighbors.append((new_r, new_c))
    
    return neighbors

def calculate_weight(current, goal, initial_weight=2.5, min_weight=1.0):
    """Dynamically calculate weight based on distance to goal"""
    distance = manhattan_distance(current, goal)
    if distance == 0:
        return min_weight
    weight = initial_weight * (distance / (distance + 1))
    return max(weight, min_weight)

def dynamic_weighted_astar_algorithm(map_data):
    grid = map_data['grid']
    start = tuple(map_data['start'])
    goal = tuple(map_data['goal'])
    costs = map_data['costs']
    legend = map_data['legend']
    
    pq = [(0, 0, start, [start])]  # (f_score, g_score, position, path)
    visited = set()
    explored = []
    g_scores = {start: 0}
    
    while pq:
        _, g, current, path = heappop(pq)
        
        if current == goal:
            return {
                'path': path,
                'explored': explored,
                'cost': g
            }
            
        if current in visited:
            continue
            
        visited.add(current)
        explored.append(current)
        
        weight = calculate_weight(current, goal)
        
        for next_pos in get_neighbors(current, grid):
            terrain_type = legend[str(grid[next_pos[0]][next_pos[1]])]
            step_cost = costs[terrain_type]
            tentative_g = g + step_cost
            
            if next_pos not in g_scores or tentative_g < g_scores[next_pos]:
                g_scores[next_pos] = tentative_g
                h_score = manhattan_distance(next_pos, goal)
                f_score = tentative_g + weight * h_score 
                heappush(pq, (f_score, tentative_g, next_pos, path + [next_pos]))
    
    return {'path': [], 'explored': explored, 'cost': float('inf')} 