document.addEventListener("DOMContentLoaded", () => {
    const gridContainer = document.getElementById('grid');
    const legend = {
        0: 'Empty',
        1: 'Wall',
        2: 'Water',
        3: 'Rock',
        4: 'Forest',
    };
    const gridSize = 7; // Change this to increase grid size
    const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));

    // Initialize grid
    const createGrid = () => {
        gridContainer.innerHTML = '';
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-item';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.setAttribute('draggable', true);
                cell.style.backgroundColor = getCellColor(grid[row][col]);
                gridContainer.appendChild(cell);
            }
        }
    };

    const getCellColor = (type) => {
        return ['#fff', '#444', '#00f', '#777', '#080'][type];
    };

    // Drag and drop handling
    gridContainer.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('type', e.target.dataset.type);
    });

    gridContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    gridContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        const row = e.target.dataset.row;
        const col = e.target.dataset.col;
        const type = document.getElementById('legendSelect').value;
        grid[row][col] = parseInt(type, 10);
        e.target.style.backgroundColor = getCellColor(type);
    });

    // Initialize dropdown for legend selection
    const legendSelect = document.getElementById('legendSelect');
    Object.entries(legend).forEach(([key, value]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = value;
        legendSelect.appendChild(option);
    });

    createGrid();

    // Save map button
    document.getElementById('saveMap').addEventListener('click', () => {
        console.log(JSON.stringify(grid)); // Send this data to the backend
        alert('Map saved successfully!');
    });
});
