import heapq

# A* Algorithm
def get_tile_cost(map_data, position):
    row, col = position
    tile_value = str(map_data['grid'][row][col])  # Convert to string to match legend keys
    tile_type = map_data['legend'][tile_value]    # Get tile type from legend
    return map_data['costs'][tile_type]           # Get cost for this tile type

def a_star_algorithm(map_data):
    start = tuple(map_data['start'])
    goal = tuple(map_data['goal'])
    rows = len(map_data['grid'])
    cols = len(map_data['grid'][0])
    
    # Initialize data structures
    open_set = {start}
    came_from = {}
    g_score = {start: 0}
    f_score = {start: heuristic(start, goal)}
    
    while open_set:
        current = min(open_set, key=lambda pos: f_score.get(pos, float('inf')))
        
        if current == goal:
            return {'path': reconstruct_path(came_from, current)}
            
        open_set.remove(current)
        
        # Check all neighbors
        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:  # 4-directional movement
            next_row, next_col = current[0] + dx, current[1] + dy
            neighbor = (next_row, next_col)
            
            # Check if neighbor is within bounds
            if not (0 <= next_row < rows and 0 <= next_col < cols):
                continue
                
            # Get the cost of moving to this tile
            tile_cost = get_tile_cost(map_data, neighbor)
            
            # Skip if tile is a wall (cost = -1)
            if tile_cost == -1:
                continue
                
            # Calculate tentative g_score
            tentative_g_score = g_score[current] + tile_cost
            
            if tentative_g_score < g_score.get(neighbor, float('inf')):
                # This path is better than any previous one
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g_score
                f_score[neighbor] = g_score[neighbor] + heuristic(neighbor, goal)
                open_set.add(neighbor)
    
    return {'error': 'No path found'}

def heuristic(a, b):
    # Manhattan distance
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def reconstruct_path(came_from, current):
    path = [current]
    while current in came_from:
        current = came_from[current]
        path.append(current)
    return path[::-1]  # Reverse path to get start-to-goal order
