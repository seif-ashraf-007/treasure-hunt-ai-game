import heapq

# Greedy Best-First Search Algorithm
def greedy_best_first_algorithm(map_data):
    grid = map_data['grid']
    start = map_data['start']
    goal = map_data['goal']

    def heuristic(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])

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
    f_score = {start: heuristic(start, goal)}

    heapq.heappush(open_list, (f_score[start], start))

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
            if neighbor in closed_list:
                continue

            if neighbor not in f_score:
                f_score[neighbor] = heuristic(neighbor, goal)
                came_from[neighbor] = current
                heapq.heappush(open_list, (f_score[neighbor], neighbor))

    return {"status": "failure", "path": []}
