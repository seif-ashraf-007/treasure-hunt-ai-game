import heapq

def dynamic_weighted_a_star_algorithm(map_data):
    start = tuple(map_data['start'])
    goal = tuple(map_data['goal'])
    grid = map_data['grid']
    legend = map_data['legend']
    costs = map_data['costs']
    
    def heuristic(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])
    
    def get_dynamic_weight(current, goal):
        # Weight decreases as we get closer to the goal
        distance_to_goal = heuristic(current, goal)
        max_distance = len(grid) + len(grid[0])
        return 1 + (distance_to_goal / max_distance)
    
    open_set = []
    closed_set = set()
    came_from = {}
    g_score = {start: 0}
    f_score = {start: 0}
    explored = []
    
    heapq.heappush(open_set, (f_score[start], start))
    
    while open_set:
        _, current = heapq.heappop(open_set)
        
        if current not in explored:
            explored.append(current)
            
        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return {"path": path[::-1], "explored": explored}
            
        closed_set.add(current)
        
        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            neighbor = (current[0] + dx, current[1] + dy)
            
            if not (0 <= neighbor[0] < len(grid) and 0 <= neighbor[1] < len(grid[0])):
                continue
                
            terrain_type = legend[str(grid[neighbor[0]][neighbor[1]])]
            if costs[terrain_type] == -1:
                continue
                
            if neighbor in closed_set:
                continue
                
            tentative_g_score = g_score[current] + costs[terrain_type]
            
            if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g_score
                weight = get_dynamic_weight(neighbor, goal)
                f_score[neighbor] = g_score[neighbor] + weight * heuristic(neighbor, goal)
                heapq.heappush(open_set, (f_score[neighbor], neighbor))
    
    return {"error": "No path found", "explored": explored} 