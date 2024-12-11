import random

def prm_algorithm(map_data, num_samples=100, k=5):
    start = tuple(map_data['start'])
    goal = tuple(map_data['goal'])
    grid = map_data['grid']
    legend = map_data['legend']
    costs = map_data['costs']
    
    def is_valid(pos):
        x, y = pos
        if 0 <= x < len(grid) and 0 <= y < len(grid[0]):
            terrain_type = legend[str(grid[x][y])]
            return costs[terrain_type] != -1
        return False
    
    def distance(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])
    
    def nearest_neighbors(node, nodes, k):
        return sorted(nodes, key=lambda n: distance(node, n))[:k]
    
    nodes = [start, goal]
    while len(nodes) < num_samples:
        x = random.randint(0, len(grid) - 1)
        y = random.randint(0, len(grid[0]) - 1)
        if is_valid((x, y)):
            nodes.append((x, y))
    
    edges = {node: [] for node in nodes}
    for node in nodes:
        neighbors = nearest_neighbors(node, nodes, k)
        for neighbor in neighbors:
            if is_valid(neighbor):
                edges[node].append(neighbor)
    
    def dfs(current, goal, visited, path):
        if current == goal:
            return path
        visited.add(current)
        for neighbor in edges[current]:
            if neighbor not in visited:
                result = dfs(neighbor, goal, visited, path + [neighbor])
                if result:
                    return result
        return None
    
    path = dfs(start, goal, set(), [start])
    if path:
        return {"path": path, "explored": path}
    else:
        return {"error": "No path found", "explored": []} 