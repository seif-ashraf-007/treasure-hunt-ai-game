document.addEventListener('DOMContentLoaded', function() {
    const mapSelect = document.getElementById('map-select');
    const mapDisplay = document.getElementById('map-display');
    const playButton = document.getElementById('play-button');
    const mapSize = document.getElementById('map-size');
    const mapDifficulty = document.getElementById('map-difficulty');
    
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
        .catch(error => console.error('Error loading maps:', error));
    
    mapSelect.addEventListener('change', function() {
        const selectedMap = this.value;
        if (selectedMap) {
            playButton.style.display = 'inline-block';
            playButton.href = `game.html?map=${selectedMap}`;
            
            fetch(`http://127.0.0.1:5000/maps/${selectedMap}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        renderMapPreview(data.map);
                        updateMapDetails(data.map);
                    }
                })
                .catch(error => console.error('Error:', error));
        } else {
            playButton.style.display = 'none';
        }
    });

    function renderMapPreview(mapData) {
        mapDisplay.innerHTML = '';
        const grid = mapData.grid;
        
        const maxSize = 600;
        const cellSize = Math.min(48, Math.floor(maxSize / mapData.size));
        
        mapDisplay.style.display = 'grid';
        mapDisplay.style.gridTemplateColumns = `repeat(${mapData.size}, ${cellSize}px)`;
        mapDisplay.style.gridTemplateRows = `repeat(${mapData.size}, ${cellSize}px)`;
        mapDisplay.style.gap = '0px';
        mapDisplay.style.width = 'min-content';
        mapDisplay.style.margin = '0 auto';
        
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('game-cell');
                
                cellDiv.style.width = `${cellSize}px`;
                cellDiv.style.height = `${cellSize}px`;
                
                const terrainType = mapData.legend[grid[i][j].toString()];
                cellDiv.classList.add(terrainType);
                
                if (i === mapData.start[0] && j === mapData.start[1]) {
                    cellDiv.classList.add('start');
                }
                if (i === mapData.goal[0] && j === mapData.goal[1]) {
                    cellDiv.classList.add('goal');
                }
                
                mapDisplay.appendChild(cellDiv);
            }
        }
    }

    function updateMapDetails(mapData) {
        if (mapSize) {
            mapSize.textContent = `${mapData.size}x${mapData.size}`;
        }
        
        if (mapDifficulty) {
            let difficulty = calculateDifficulty(mapData);
            mapDifficulty.textContent = difficulty;
        }
    }

    function calculateDifficulty(mapData) {
        let totalCost = 0;
        let cells = 0;
        
        mapData.grid.forEach(row => {
            row.forEach(cell => {
                const terrainType = mapData.legend[cell.toString()];
                totalCost += mapData.costs[terrainType];
                cells++;
            });
        });
        
        const avgCost = totalCost / cells;
        
        if (avgCost <= 1.5) return 'Easy';
        if (avgCost <= 2.5) return 'Medium';
        return 'Hard';
    }
});