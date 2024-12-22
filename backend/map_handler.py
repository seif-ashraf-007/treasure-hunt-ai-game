import json
import os
from flask import jsonify
from algorithms.dijkstra import dijkstra_algorithm
from algorithms.hill_climbing import hill_climbing_algorithm
from algorithms.dfs import dfs_algorithm
from algorithms.greedy_best_first import greedy_best_first_algorithm
from algorithms.astar import astar_algorithm
from algorithms.dynamic_weighted_astar import dynamic_weighted_astar_algorithm
from algorithms.ida_star import ida_star

MAPS_DIRECTORY = './maps'

def load_map(map_name):
    """Load map data from a JSON file."""
    try:
        map_path = os.path.join('./maps', map_name)
        with open(map_path, 'r') as f:
            map_data = json.load(f)
            return {'mapData': map_data}
    except Exception as e:
        print(f"Error loading map: {str(e)}")
        return None


def run_algorithm(map_data, algorithm_name):
    if not map_data or not isinstance(map_data, dict):
        return {"error": "Map data is missing or invalid"}
    
    required_fields = ['start', 'goal', 'grid', 'legend', 'costs']
    if not all(field in map_data for field in required_fields):
        return {"error": "Missing required map data fields"}
    
    algorithms = {
        'dijkstra': dijkstra_algorithm,
        'hill_climbing': hill_climbing_algorithm,
        'dfs': dfs_algorithm,
        'greedy_best_first': greedy_best_first_algorithm,
        'astar': astar_algorithm,
        'dynamic_weighted_astar': dynamic_weighted_astar_algorithm,
        'ida_star': ida_star
    }
    
    if algorithm_name not in algorithms:
        return {"error": "Algorithm not recognized"}
        
    try:
        return algorithms[algorithm_name](map_data)
    except Exception as e:
        print(f"Error running {algorithm_name}: {str(e)}")
        return {"error": f"Error running algorithm: {str(e)}"}
