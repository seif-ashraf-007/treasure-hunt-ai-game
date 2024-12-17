import heapq

def best_first_search_algorithm(map_data):
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
    
    open_list = []
    closed_set = set()
    came_from = {}
    explored = []
    
    heapq.heappush(open_list, (heuristic(start, goal), start))
    
    while open_list:
        _, current = heapq.heappop(open_list)
        
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
        
        for neighbor in get_neighbors(current):
            if neighbor in closed_set:
                continue
            
            if neighbor not in came_from:
                came_from[neighbor] = current
                heapq.heappush(open_list, (heuristic(neighbor, goal), neighbor))
    
    return {"error": "No path found", "explored": explored} 