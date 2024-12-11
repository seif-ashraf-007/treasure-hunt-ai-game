import heapq

# Greedy Best-First Search Algorithm
def greedy_best_first_algorithm(map_data):
    grid = map_data['grid']
    start = tuple(map_data['start'])
    goal = tuple(map_data['goal'])
    legend = map_data['legend']
    costs = map_data['costs']

    def heuristic(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])

    def get_neighbors(node):
        x, y = node
        neighbors = []
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:  # Up, Down, Left, Right
            nx, ny = x + dx, y + dy
            if (0 <= nx < len(grid) and 0 <= ny < len(grid[0])):
                cell_type = legend[str(grid[nx][ny])]
                if costs[cell_type] != -1:  # Check if not a wall
                    neighbors.append((nx, ny))
        return neighbors

    # Initialize data structures
    open_list = []
    closed_set = set()
    came_from = {}
    g_score = {start: 0}
    f_score = {start: heuristic(start, goal)}
    
    # Track paths
    explored = []  # All nodes we've looked at
    current_path = [start]  # Current path being explored
    attempted_paths = []  # List of all paths attempted

    heapq.heappush(open_list, (f_score[start], start))

    while open_list:
        current_f, current = heapq.heappop(open_list)
        
        # Add to explored list
        if current not in explored:
            explored.append(current)

        # Update current path
        if current not in current_path:
            # Find the last common ancestor
            last_common = start
            for node in current_path:
                if node == came_from.get(current, start):
                    last_common = node
                    break
            
            # If we're backtracking, save the current path as a dead end
            if len(current_path) > 1:
                dead_end = current_path[:]  # Save a copy of the dead end
                if dead_end not in attempted_paths:
                    attempted_paths.append(dead_end)
            
            # Backtrack to last common ancestor
            while current_path and current_path[-1] != last_common:
                current_path.pop()
            
            # Add the current node to the path
            current_path.append(current)

        if current == goal:
            # Save the final successful path
            final_path = []
            curr = current
            while curr in came_from:
                final_path.append(curr)
                curr = came_from[curr]
            final_path.append(start)
            final_path.reverse()
            
            # Add the successful path to attempted paths
            if current_path not in attempted_paths:
                attempted_paths.append(current_path[:])
            
            # Calculate costs
            total_cost = 0
            path_costs = []
            for pos in final_path:
                x, y = pos
                cell_type = legend[str(grid[x][y])]
                cost = costs[cell_type]
                total_cost += cost
                path_costs.append(cost)

            return {
                "status": "success",
                "path": final_path,
                "explored": explored,
                "attempted_paths": attempted_paths,
                "total_cost": total_cost,
                "path_costs": path_costs
            }

        closed_set.add(current)

        # Get neighbors sorted by heuristic value
        neighbors = get_neighbors(current)
        neighbors.sort(key=lambda x: heuristic(x, goal))

        for neighbor in neighbors:
            if neighbor in closed_set:
                continue

            cell_type = legend[str(grid[neighbor[0]][neighbor[1]])]
            tentative_g_score = g_score[current] + costs[cell_type]

            if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g_score
                f_score[neighbor] = heuristic(neighbor, goal)  # Only use heuristic for Greedy
                heapq.heappush(open_list, (f_score[neighbor], neighbor))

    # If no path is found
    return {
        "status": "failure",
        "path": [],
        "explored": explored,
        "attempted_paths": attempted_paths,
        "total_cost": 0,
        "path_costs": []
    }
