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

def dfs_algorithm(map_data):
    grid = map_data['grid']
    start = tuple(map_data['start'])
    goal = tuple(map_data['goal'])
    
    stack = [(start, [start])]
    visited = set()
    explored = []
    
    while stack:
        current, path = stack.pop()
        
        if current == goal:
            return {
                'path': path,
                'explored': explored,
                'cost': len(path) - 1  # Simple cost for DFS
            }
            
        if current not in visited:
            visited.add(current)
            explored.append(current)
            
            for neighbor in get_neighbors(current, grid):
                if neighbor not in visited:
                    stack.append((neighbor, path + [neighbor]))
    
    return {'path': [], 'explored': explored, 'cost': float('inf')} 