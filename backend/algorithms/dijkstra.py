import heapq

# Dijkstra's Algorithm
def dijkstra_algorithm(map_data):
    grid = map_data['grid']
    start = map_data['start']
    goal = map_data['goal']

    def get_neighbors(node):
        x, y = node
        neighbors = []
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < len(grid) and 0 <= ny < len(grid[0]) and grid[nx][ny] != 'wall':
                neighbors.append((nx, ny))
        return neighbors

    open_list = []
    closed_list = set()
    came_from = {}
    g_score = {start: 0}

    heapq.heappush(open_list, (g_score[start], start))

    while open_list:
        _, current = heapq.heappop(open_list)

        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.reverse()
            return {"status": "found", "path": path}

        closed_list.add(current)

        for neighbor in get_neighbors(current):
            tentative_g_score = g_score[current] + 1
            if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g_score
                heapq.heappush(open_list, (g_score[neighbor], neighbor))

    return {"status": "failure", "path": []}
