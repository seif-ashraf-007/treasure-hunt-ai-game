document.addEventListener('DOMContentLoaded', () => {
    const mapGrid = document.getElementById('mapGrid');
    const mapSizeSelect = document.getElementById('mapSize');
    const createMapBtn = document.getElementById('createMapBtn');
    const saveMapBtn = document.getElementById('saveMapBtn');
    const clearMapBtn = document.getElementById('clearMapBtn');
    const mapNameInput = document.getElementById('mapName');

    let startPlaced = false;
    let goalPlaced = false;
    let currentMapSize = 8;

    function createGrid(size) {
        mapGrid.innerHTML = '';
        
        const maxSize = 600;
        const cellSize = Math.min(48, Math.floor(maxSize / size));
        
        mapGrid.style.display = 'grid';
        mapGrid.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
        mapGrid.style.gridTemplateRows = `repeat(${size}, ${cellSize}px)`;
        mapGrid.style.gap = '';
        mapGrid.style.width = 'min-content';
        mapGrid.style.margin = '0 auto';
        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell', 'empty');
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.dataset.terrain = 'empty';
                
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                
                cell.addEventListener('dragover', handleDragOver);
                cell.addEventListener('drop', handleDrop);
                cell.addEventListener('dragenter', handleDragEnter);
                cell.addEventListener('dragleave', handleDragLeave);
                
                mapGrid.appendChild(cell);
            }
        }
        currentMapSize = size;
    }

    mapSizeSelect.addEventListener('change', () => {
        const newSize = parseInt(mapSizeSelect.value);
        if (confirm('Changing the map size will clear the current map. Continue?')) {
            createGrid(newSize);
            startPlaced = false;
            goalPlaced = false;
        } else {
            mapSizeSelect.value = currentMapSize;
        }
    });

    document.querySelectorAll('.terrain-item').forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });

    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.terrain);
        e.target.classList.add('dragging');
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDragEnter(e) {
        e.preventDefault();
        e.target.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.target.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        const cell = e.target;
        
        const targetCell = cell.classList.contains('grid-cell') ? cell : cell.closest('.grid-cell');
        if (!targetCell) return;
        
        targetCell.classList.remove('drag-over');
        
        const terrain = e.dataTransfer.getData('text/plain');
        
        if (terrain === 'start') {
            if (startPlaced && targetCell.dataset.terrain !== 'start') {
                alert('Start position already exists!');
                return;
            }
            if (targetCell.dataset.terrain === 'start') {
                startPlaced = false;
            } else {
                startPlaced = true;
            }
        }
        
        if (terrain === 'goal') {
            if (goalPlaced && targetCell.dataset.terrain !== 'goal') {
                alert('Goal position already exists!');
                return;
            }
            if (targetCell.dataset.terrain === 'goal') {
                goalPlaced = false;
            } else {
                goalPlaced = true;
            }
        }

        targetCell.classList.remove('empty', 'water', 'forest', 'rock', 'wall', 'start', 'goal');
        
        targetCell.classList.add(terrain);
        targetCell.dataset.terrain = terrain;
    }

    createMapBtn.addEventListener('click', () => {
        createGrid(parseInt(mapSizeSelect.value));
        startPlaced = false;
        goalPlaced = false;
    });

    clearMapBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the map?')) {
            createGrid(currentMapSize);
            startPlaced = false;
            goalPlaced = false;
        }
    });

    saveMapBtn.addEventListener('click', async () => {
        const mapName = mapNameInput.value.trim();
        if (!mapName) {
            alert('Please enter a map name');
            return;
        }

        if (!startPlaced || !goalPlaced) {
            alert('Please place both start and goal positions');
            return;
        }

        const mapData = {
            name: mapName,
            filename: mapName.toLowerCase().replace(/\s+/g, '_') + '.json',
            size: currentMapSize,
            grid: [],
            start: null,
            goal: null,
            costs: {
                "empty": 1,
                "water": 3,
                "forest": 2,
                "rock": 4,
                "wall": Infinity
            },
            legend: {
                "0": "empty",
                "1": "water",
                "2": "forest",
                "3": "rock",
                "4": "wall"
            }
        };

        const terrainValues = {
            'empty': 0,
            'water': 1,
            'forest': 2,
            'rock': 3,
            'wall': 4
        };

        for (let i = 0; i < currentMapSize; i++) {
            const row = [];
            for (let j = 0; j < currentMapSize; j++) {
                const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                const terrain = cell.dataset.terrain;
                
                if (terrain === 'start') {
                    mapData.start = [i, j];
                    row.push(0);
                } else if (terrain === 'goal') {
                    mapData.goal = [i, j];
                    row.push(0);
                } else {
                    row.push(terrainValues[terrain]);
                }
            }
            mapData.grid.push(row);
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/maps/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mapData)
            });

            const result = await response.json();
            if (result.success) {
                alert('Map saved successfully!');
                window.location.href = 'play.html';
            } else {
                alert('Error saving map: ' + result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error saving map. Please try again.');
        }
    });

    createGrid(parseInt(mapSizeSelect.value));
}); 