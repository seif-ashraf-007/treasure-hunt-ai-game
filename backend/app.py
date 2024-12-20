import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from map_handler import load_map, run_algorithm  # Ensure these functions are correctly implemented in map_handler.py

app = Flask(__name__)

# CORS configuration
CORS(app, resources={
    r"/*": {
        "origins": ["http://127.0.0.1:5500", "http://localhost:5500"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
        "supports_credentials": True
    }
})

# Directory containing map files
MAPS_DIRECTORY = './maps'

@app.after_request
def after_request(response):
    """Set headers for CORS and HTTP method support."""
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/play/maps', methods=['GET'])
def get_maps():
    """Endpoint to get available map files."""
    try:
        files = os.listdir(MAPS_DIRECTORY)
        maps = []
        for file in files:
            if file.endswith('.json'):
                with open(os.path.join(MAPS_DIRECTORY, file)) as f:
                    map_data = json.load(f)
                    map_name = map_data.get('name', 'Unknown Map')
                    maps.append({'filename': file, 'name': map_name})
        return jsonify({'maps': maps})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/game', methods=['GET'])
def play_game():
    """Endpoint to play the game by running the selected algorithm on a map."""
    try:
        # Extract query parameters
        map_name = request.args.get('map')
        algorithm_name = request.args.get('algorithm')

        # Log received parameters
        app.logger.debug(f"Received map: {map_name}, algorithm: {algorithm_name}")

        # Validate parameters
        if not map_name:
            return jsonify({'error': 'Map parameter is missing'}), 400
        if not algorithm_name:
            return jsonify({'error': 'Algorithm parameter is missing'}), 400

        # Load map and validate map data
        map_data = load_map(map_name)
        if not map_data or 'mapData' not in map_data:
            return jsonify({'error': 'Invalid map data'}), 400

        # Run the selected algorithm
        result = run_algorithm(map_data['mapData'], algorithm_name)

        # Prepare the response
        response = {
            'mapData': map_data['mapData'],  # Include the map data
            'path': result.get('path', []),  # Include the algorithm result, e.g., the path
            'explored': result.get('explored', []),  # Include the explored nodes
            'error': result.get('error', None)  # Include any errors from the algorithm
        }

        return jsonify(response)

    except Exception as e:
        app.logger.error(f"An error occurred: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
