import os
import json
import time
from flask import Flask, jsonify, request
from flask_cors import CORS
from map_handler import load_map, run_algorithm

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

@app.route('/maps/create', methods=['POST'])
def create_map():
    """Endpoint to create and save a new map."""
    try:
        map_data = request.json
        
        # Ensure maps directory exists
        if not os.path.exists(MAPS_DIRECTORY):
            os.makedirs(MAPS_DIRECTORY)
        
        # Save map file
        filename = map_data['filename']
        filepath = os.path.join(MAPS_DIRECTORY, filename)
        
        # Check if file already exists
        if os.path.exists(filepath):
            return jsonify({
                'success': False,
                'error': 'A map with this name already exists'
            }), 400
        
        with open(filepath, 'w') as f:
            json.dump(map_data, f, indent=4)
        
        return jsonify({
            'success': True,
            'message': 'Map saved successfully'
        })
    
    except Exception as e:
        app.logger.error(f"Error creating map: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/maps/<filename>', methods=['GET'])
def get_map(filename):
    """Endpoint to get a specific map by filename."""
    try:
        filepath = os.path.join(MAPS_DIRECTORY, filename)
        if not os.path.exists(filepath):
            return jsonify({
                'success': False,
                'error': 'Map not found'
            }), 404
            
        with open(filepath, 'r') as f:
            map_data = json.load(f)
            
        return jsonify({
            'success': True,
            'map': map_data
        })
        
    except Exception as e:
        app.logger.error(f"Error loading map: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/play/maps', methods=['GET'])
def get_maps():
    """Endpoint to get available map files."""
    try:
        if not os.path.exists(MAPS_DIRECTORY):
            os.makedirs(MAPS_DIRECTORY)
            
        files = os.listdir(MAPS_DIRECTORY)
        maps = []
        for file in files:
            if file.endswith('.json'):
                with open(os.path.join(MAPS_DIRECTORY, file)) as f:
                    map_data = json.load(f)
                    map_name = map_data.get('name', 'Unknown Map')
                    maps.append({'filename': file, 'name': map_name})
        return jsonify({
            'success': True,
            'maps': maps
        })
    except Exception as e:
        app.logger.error(f"Error getting maps: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

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

        # Measure algorithm execution time
        start_time = time.time()
        result = run_algorithm(map_data['mapData'], algorithm_name)
        algorithm_time = (time.time() - start_time) * 1000  # Convert to milliseconds

        # Prepare the response
        response = {
            'mapData': map_data['mapData'],
            'path': result.get('path', []),
            'explored': result.get('explored', []),
            'error': result.get('error', None),
            'algorithmTime': round(algorithm_time, 2)  # Round to 2 decimal places
        }

        return jsonify(response)

    except Exception as e:
        app.logger.error(f"An error occurred: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
