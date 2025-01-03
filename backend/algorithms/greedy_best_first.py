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
        if 0 <= new_r < rows and 0 <= new_c < cols and grid[new_r][new_c] != 1:
            neighbors.append((new_r, new_c))
    
    return neighbors

def greedy_best_first_algorithm(map_data):
    grid = map_data['grid']
    start = tuple(map_data['start'])
    goal = tuple(map_data['goal'])
    costs = map_data['costs']
    legend = map_data['legend']
    
    pq = [(manhattan_distance(start, goal), start, [start], 0)]
    visited = set()
    explored = []
    
    while pq:
        _, current, path, cost = heappop(pq)
        
        if current == goal:
            return {
                'path': path,
                'explored': explored,
                'cost': cost
            }
            
        if current in visited:
            continue
            
        visited.add(current)
        explored.append(current)
        
        for next_pos in get_neighbors(current, grid):
            if next_pos not in visited:
                terrain_type = legend[str(grid[next_pos[0]][next_pos[1]])]
                step_cost = costs[terrain_type]
                new_cost = cost + step_cost
                heappush(pq, (manhattan_distance(next_pos, goal), next_pos, path + [next_pos], new_cost))
    
    return {'path': [], 'explored': explored, 'cost': float('inf')} 