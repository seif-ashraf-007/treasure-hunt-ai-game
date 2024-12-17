import json
import os
from flask import jsonify
from algorithms.dijkstra import dijkstra_algorithm
from algorithms.hill_climbing import hill_climbing_algorithm
from algorithms.deepening_astar import deepening_astar_algorithm
from algorithms.dfs import dfs_algorithm
from algorithms.greedy_best_first import greedy_best_first_algorithm
from algorithms.astar import astar_algorithm
from algorithms.dynamic_weighted_astar import dynamic_weighted_astar_algorithm
from algorithms.best_first import best_first_algorithm

MAPS_DIRECTORY = './maps'

# Function to load the map from the specified file
def load_map(map_name):
    try:
        map_file_path = os.path.join(MAPS_DIRECTORY, map_name)
        if not os.path.exists(map_file_path):
            return {"error": "Map file not found"}
        
        with open(map_file_path) as f:
            map_data = json.load(f)
        
        # Ensure the structure is correct
        if 'mapData' not in map_data:
            return {"error": "Map data is missing or invalid - LOAD MAP"}
        
        return map_data  # Return the full map data object for later use
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}


# Function to run the selected algorithm
def run_algorithm(map_data, algorithm_name):
    if not map_data or not isinstance(map_data, dict):
        return {"error": "Map data is missing or invalid"}
    
    required_fields = ['start', 'goal', 'grid', 'legend', 'costs']
    if not all(field in map_data for field in required_fields):
        return {"error": "Missing required map data fields"}
    
    algorithms = {
        'dijkstra': dijkstra_algorithm,
        'hill_climbing': hill_climbing_algorithm,
        'deepening_astar': deepening_astar_algorithm,
        'dfs': dfs_algorithm,
        'greedy_best_first': greedy_best_first_algorithm,
        'astar': astar_algorithm,
        'dynamic_weighted_astar': dynamic_weighted_astar_algorithm,
        'best_first': best_first_algorithm
    }
    
    if algorithm_name not in algorithms:
        return {"error": "Algorithm not recognized"}
        
    try:
        return algorithms[algorithm_name](map_data)
    except Exception as e:
        return {"error": f"Error running algorithm: {str(e)}"}
