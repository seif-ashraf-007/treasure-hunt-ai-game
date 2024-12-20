document.addEventListener('DOMContentLoaded', function() {
    const mapSelect = document.getElementById('map-select');
    const mapDisplay = document.getElementById('map-display');
    const playButton = document.getElementById('play-button');
    const mapSize = document.getElementById('map-size');
    const mapDifficulty = document.getElementById('map-difficulty');

    // Fetch available maps
    fetch('http://127.0.0.1:5000/play/maps')
        .then(response => response.json())
        .then(data => {
            if (data.maps) {
                data.maps.forEach(map => {
                    const option = document.createElement('option');
                    option.value = map.filename;
                    option.textContent = map.name;
                    mapSelect.appendChild(option);
                });
            }
        })
        .catch(error => console.error('Error fetching maps:', error));

    // Handle map selection
    mapSelect.addEventListener('change', function() {
        const selectedMap = this.value;
        if (selectedMap) {
            loadMap(selectedMap);
            playButton.href = `play.html?map=${selectedMap}`;
            playButton.style.display = 'inline-block';
        } else {
            mapDisplay.innerHTML = '<p>Please select a map to view.</p>';
            playButton.style.display = 'none';
        }
    });

    // Load and render map
    function loadMap(mapName) {
        fetch(`http://127.0.0.1:5000/game?map=${mapName}&algorithm=dijkstra`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    mapDisplay.innerHTML = `<p>Error loading map: ${data.error}</p>`;
                    return;
                }
                renderMap(data.mapData);
                updateMapStats(data.mapData);
            })
            .catch(error => {
                console.error('Error loading map:', error);
                mapDisplay.innerHTML = '<p>Error loading map. Please try again.</p>';
            });
    }

    // Render map using your game's style
    function renderMap(mapData) {
        mapDisplay.innerHTML = '';
        
        mapData.grid.forEach((row, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'game-row';
            
            row.forEach((cell, colIndex) => {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'game-cell';
                
                // Add terrain type
                const terrainType = mapData.legend[cell.toString()];
                cellDiv.classList.add(terrainType);
                
                // Mark start and goal positions
                if (rowIndex === mapData.start[0] && colIndex === mapData.start[1]) {
                    cellDiv.innerHTML = 'A';
                    cellDiv.style.color = 'red';
                } else if (rowIndex === mapData.goal[0] && colIndex === mapData.goal[1]) {
                    cellDiv.innerHTML = 'B';
                    cellDiv.style.color = 'blue';
                }
                
                rowDiv.appendChild(cellDiv);
            });
            
            mapDisplay.appendChild(rowDiv);
        });
    }

    // Update map statistics
    function updateMapStats(mapData) {
        // Calculate map size
        const rows = mapData.grid.length;
        const cols = mapData.grid[0].length;
        mapSize.textContent = `${rows}x${cols}`;

        // Calculate difficulty
        let difficulty = calculateDifficulty(mapData);
        mapDifficulty.textContent = difficulty;
    }

    // Calculate map difficulty based on terrain distribution
    function calculateDifficulty(mapData) {
        let totalCells = 0;
        let weightedSum = 0;
        const weights = {
            'empty': 1,
            'forest': 2,
            'water': 3,
            'rock': 4
        };

        mapData.grid.forEach(row => {
            row.forEach(cell => {
                const terrainType = mapData.legend[cell.toString()];
                if (weights[terrainType]) {
                    weightedSum += weights[terrainType];
                    totalCells++;
                }
            });
        });

        const averageDifficulty = weightedSum / totalCells;
        
        if (averageDifficulty <= 1.5) return 'Easy';
        if (averageDifficulty <= 2.5) return 'Medium';
        return 'Hard';
    }
});