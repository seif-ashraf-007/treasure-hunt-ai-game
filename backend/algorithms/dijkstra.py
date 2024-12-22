from heapq import heappush, heappop

def get_neighbors(pos, grid):
    rows, cols = len(grid), len(grid[0])
    r, c = pos
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]  # right, down, left, up
    neighbors = []
    
    for dr, dc in directions:
        new_r, new_c = r + dr, c + dc
        if (0 <= new_r < rows and 
            0 <= new_c < cols and 
            grid[new_r][new_c] != 4):  # 4 represents a wall
            neighbors.append((new_r, new_c))
    
    return neighbors

def dijkstra_algorithm(map_data):
    grid = map_data['grid']
    start = tuple(map_data['start'])
    goal = tuple(map_data['goal'])
    costs = map_data['costs']
    legend = map_data['legend']
    
    pq = [(0, start, [start])]
    visited = set()
    explored = []
    
    while pq:
        cost, current, path = heappop(pq)
        
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
                heappush(pq, (new_cost, next_pos, path + [next_pos]))
    
    return {'path': [], 'explored': explored, 'cost': float('inf')} 