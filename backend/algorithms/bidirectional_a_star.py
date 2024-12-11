import heapq

def bidirectional_a_star_algorithm(map_data):
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
    
    # Forward search from start
    f_open = [(0, start)]
    f_closed = set()
    f_came_from = {}
    f_g_score = {start: 0}
    
    # Backward search from goal
    b_open = [(0, goal)]
    b_closed = set()
    b_came_from = {}
    b_g_score = {goal: 0}
    
    explored = []
    meeting_point = None
    
    while f_open and b_open and not meeting_point:
        # Forward search step
        _, f_current = heapq.heappop(f_open)
        if f_current not in explored:
            explored.append(f_current)
        
        if f_current in b_closed:
            meeting_point = f_current
            break
            
        f_closed.add(f_current)
        
        for neighbor in get_neighbors(f_current):
            if neighbor in f_closed:
                continue
                
            terrain_type = legend[str(grid[neighbor[0]][neighbor[1]])]
            tentative_g = f_g_score[f_current] + costs[terrain_type]
            
            if neighbor not in f_g_score or tentative_g < f_g_score[neighbor]:
                f_came_from[neighbor] = f_current
                f_g_score[neighbor] = tentative_g
                f_score = tentative_g + heuristic(neighbor, goal)
                heapq.heappush(f_open, (f_score, neighbor))
        
        # Backward search step
        _, b_current = heapq.heappop(b_open)
        if b_current not in explored:
            explored.append(b_current)
        
        if b_current in f_closed:
            meeting_point = b_current
            break
            
        b_closed.add(b_current)
        
        for neighbor in get_neighbors(b_current):
            if neighbor in b_closed:
                continue
                
            terrain_type = legend[str(grid[neighbor[0]][neighbor[1]])]
            tentative_g = b_g_score[b_current] + costs[terrain_type]
            
            if neighbor not in b_g_score or tentative_g < b_g_score[neighbor]:
                b_came_from[neighbor] = b_current
                b_g_score[neighbor] = tentative_g
                b_score = tentative_g + heuristic(neighbor, start)
                heapq.heappush(b_open, (b_score, neighbor))
    
    if meeting_point:
        # Reconstruct path
        path = []
        current = meeting_point
        while current in f_came_from:
            path.append(current)
            current = f_came_from[current]
        path.append(start)
        path = path[::-1]
        
        current = meeting_point
        while current in b_came_from:
            current = b_came_from[current]
            path.append(current)
        
        return {"path": path, "explored": explored}
    
    return {"error": "No path found", "explored": explored} 