import heapq

# Dijkstra's Algorithm
def dijkstra_algorithm(map_data):
    grid = map_data['grid']
    start = tuple(map_data['start'])
    goal = tuple(map_data['goal'])
    legend = map_data['legend']
    costs = map_data['costs']

    def get_neighbors(node):
        x, y = node
        neighbors = []
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < len(grid) and 0 <= ny < len(grid[0]):
                terrain_type = legend[str(grid[nx][ny])]
                if costs[terrain_type] != -1:
                    neighbors.append((nx, ny))
        return neighbors

    open_list = []
    closed_list = set()
    came_from = {}
    g_score = {start: 0}
    explored = []

    heapq.heappush(open_list, (g_score[start], start))

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
            path.reverse()
            return {"status": "found", "path": path, "explored": explored}

        closed_list.add(current)

        for neighbor in get_neighbors(current):
            terrain_type = legend[str(grid[neighbor[0]][neighbor[1]])]
            move_cost = costs[terrain_type]
            
            tentative_g_score = g_score[current] + move_cost
            if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g_score
                heapq.heappush(open_list, (g_score[neighbor], neighbor))

    return {"status": "failure", "path": [], "explored": explored}
