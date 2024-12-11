def depth_first_search_algorithm(map_data):
    start = tuple(map_data['start'])
    goal = tuple(map_data['goal'])
    grid = map_data['grid']
    legend = map_data['legend']
    rows = len(grid)
    cols = len(grid[0])
    
    # Keep track of visited cells and path
    visited = set()
    path = []
    explored = []  # Track exploration order
    
    def is_valid_move(pos):
        row, col = pos
        if not (0 <= row < rows and 0 <= col < cols):
            return False
        # Check if the cell is not a wall
        cell_type = legend[str(grid[row][col])]
        return map_data['costs'][cell_type] != -1
    
    def dfs(current):
        if current == goal:
            return True
            
        # Add to explored list for visualization
        if current not in explored:
            explored.append(current)
            
        # Try all four directions: right, down, left, up
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
        
        for dx, dy in directions:
            next_pos = (current[0] + dx, current[1] + dy)
            
            if (is_valid_move(next_pos) and 
                next_pos not in visited):
                
                visited.add(next_pos)
                path.append(next_pos)
                
                if dfs(next_pos):
                    return True
                    
                path.pop()
        
        return False
    
    # Start DFS from the starting position
    visited.add(start)
    path.append(start)
    
    if dfs(start):
        return {
            "status": "success",
            "path": path,
            "explored": explored
        }
    else:
        return {
            "status": "failure",
            "path": [],
            "explored": explored
        } 