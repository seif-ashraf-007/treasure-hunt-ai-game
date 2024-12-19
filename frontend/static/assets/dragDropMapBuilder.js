document.addEventListener("DOMContentLoaded", () => {
    const gridContainer = document.getElementById('grid');
    const legend = {
        0: { name: 'Empty', image: '../assets/empty.png' },
        1: { name: 'Wall', image: '../assets/wall.png' },
        2: { name: 'Water', image: '../assets/water.png' },
        3: { name: 'Rock', image: '../assets/rock.png' },
        4: { name: 'Forest', image: '../assets/forest.png' },
    };

    const rows = 7; // Number of rows
    const cols = 6; // Number of columns
    const grid = Array.from({ length: rows }, () => Array(cols).fill(0));

    // Initialize grid
    const createGrid = () => {
        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 55px)`;
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 55px)`;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-item';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.setAttribute('draggable', true);
                cell.style.backgroundImage = `url('${legend[grid[row][col]].image}')`;
                cell.style.backgroundSize = 'cover';
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
        option.textContent = value.name;
        legendSelect.appendChild(option);
    });

    createGrid();

    // Save map button
    document.getElementById('saveMap').addEventListener('click', () => {
        console.log(JSON.stringify(grid)); // Send this data to the backend
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.getElementById('saveMap');
    const mapNameInput = document.getElementById('mapName');
    const errorMessage = document.getElementById('error-message');

    // Save map button click event
    saveButton.addEventListener('click', () => {
        // Check if the map name is empty
        if (mapNameInput.value.trim() === "") {
            // Show the error message
            errorMessage.style.display = 'block';
        } else {
            // Hide the error message if the map name is provided
            errorMessage.style.display = 'none';

            // Proceed with saving the map (replace with your actual saving logic)
            console.log(JSON.stringify(grid)); // Send the grid data to the backend
            alert('Map saved successfully!');
        }
    });
});


