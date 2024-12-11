import heapq

def get_tile_cost(map_data, position):
    row, col = position
    tile_value = str(map_data['grid'][row][col])
    tile_type = map_data['legend'][tile_value]
    return map_data['costs'][tile_type]

def weighted_a_star_algorithm(map_data, weight=1.2):
    start = tuple(map_data['start'])
    goal = tuple(map_data['goal'])
    rows = len(map_data['grid'])
    cols = len(map_data['grid'][0])
    
    open_set = {start}
    came_from = {}
    g_score = {start: 0}
    f_score = {start: heuristic(start, goal) * weight}
    
    while open_set:
        current = min(open_set, key=lambda pos: f_score.get(pos, float('inf')))
        
        if current == goal:
            return {'path': reconstruct_path(came_from, current)}
            
        open_set.remove(current)
        
        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            next_row, next_col = current[0] + dx, current[1] + dy
            neighbor = (next_row, next_col)
            
            if not (0 <= next_row < rows and 0 <= next_col < cols):
                continue
                
            tile_cost = get_tile_cost(map_data, neighbor)
            
            if tile_cost == -1:
                continue
                
            tentative_g_score = g_score[current] + tile_cost
            
            if tentative_g_score < g_score.get(neighbor, float('inf')):
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g_score
                f_score[neighbor] = g_score[neighbor] + heuristic(neighbor, goal) * weight
                open_set.add(neighbor)
    
    return {'error': 'No path found'}

def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def reconstruct_path(came_from, current):
    path = [current]
    while current in came_from:
        current = came_from[current]
        path.append(current)
    return path[::-1] 