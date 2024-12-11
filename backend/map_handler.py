import json
import os
from flask import jsonify

MAPS_DIRECTORY = './maps'

# Function to load the map from the specified file
def load_map(map_name):
    try:
        map_file_path = os.path.join(MAPS_DIRECTORY, map_name)
        if not os.path.exists(map_file_path):
            return {"error": "Map file not found"}
        
        with open(map_file_path) as f:
            map_data = json.load(f)
            print(f"Loaded map: {map_data}")  # Log the full map data
        
        # Ensure the structure is correct
        if 'mapData' not in map_data:
            return {"error": "Map data is missing or invalid - LOAD MAP"}
        
        return map_data  # Return the full map data object for later use
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}


# Function to run the selected algorithm
def run_algorithm(map_data, algorithm_name):
    print(f"Map data received in run_algorithm: {map_data}")
    
    if not map_data or not isinstance(map_data, dict):
        return {"error": "Map data is missing or invalid - RUN"}
    
    # Check if all required data is present
    required_fields = ['start', 'goal', 'grid', 'legend', 'costs']
    if not all(field in map_data for field in required_fields):
        return {"error": "Missing required map data fields"}
    
    start = map_data['start']
    goal = map_data['goal']
    
    # Running the selected algorithm
    algorithms = {
        "A*": "a_star",
        "Greedy Best-First Search": "greedy_best_first",
        "Dijkstra": "dijkstra",
        "Weighted A*": "weighted_a_star",
        "Depth-First Search": "depth_first_search",
        "Dynamic Weighted A*": "dynamic_weighted_a_star",
        "Iterative Deepening A*": "iterative_deepening_a_star",
        "Bidirectional A*": "bidirectional_a_star",
        "Probabilistic Roadmap": "prm",
        "Best-First Search": "best_first_search"
    }
    
    if algorithm_name not in algorithms:
        return {"error": "Algorithm not recognized"}
        
    try:
        module = __import__(f"algorithms.{algorithms[algorithm_name]}", fromlist=["*"])
        algorithm_function = getattr(module, f"{algorithms[algorithm_name]}_algorithm")
        return algorithm_function(map_data)
    except Exception as e:
        return {"error": f"Error running algorithm: {str(e)}"}
