document.addEventListener("DOMContentLoaded", function () {
    const startGameBtn = document.getElementById("startGameBtn");
    const resetGameBtn = document.getElementById("resetGameBtn");

    // Get query parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const selectedMap = urlParams.get('map');
    const selectedAlgorithm = urlParams.get('algorithm');

    // Set map and algorithm in the game info section
    document.getElementById('map-name').textContent = selectedMap;
    document.getElementById('algorithm-name').textContent = selectedAlgorithm;

    // Initial map render without solving
    fetch(`http://127.0.0.1:5000/game?map=${selectedMap}&algorithm=${selectedAlgorithm}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'same-origin'
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Error:", data.error);
                return;
            }
            // Only render the initial map, don't animate the path
            renderMap(data);
        })
        .catch(error => {
            console.error("Error loading map:", error);
        });

    function startGame() {
        fetch(`http://127.0.0.1:5000/game?map=${selectedMap}&algorithm=${selectedAlgorithm}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'same-origin'
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Error:", data.error);
                    return;
                }
                if (data.path) {
                    animatePath(data.path);
                }
            })
            .catch(error => {
                console.error("Error starting game:", error);
            });
    }

    function animatePath(path) {
        path.forEach((position, index) => {
            setTimeout(() => {
                const [row, col] = position;
                const cell = document.querySelector(`.game-cell[data-row='${row}'][data-col='${col}']`);
                if (cell) {
                    cell.classList.add('path');
                }
            }, index * 500); // 500ms delay between each step
        });
    }

    // Start Game button click handler
    startGameBtn.addEventListener("click", function() {
        startGameBtn.disabled = true;
        startGame();
    });

    // Reset Game button click handler
    resetGameBtn.addEventListener("click", function() {
        const cells = document.querySelectorAll('.game-cell');
        cells.forEach(cell => {
            cell.classList.remove('path');
        });
        startGameBtn.disabled = false;
    });

    // Render the map grid dynamically
    function renderMap(data) {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';

        if (!data.mapData || !data.mapData.grid) {
            console.error('Map data is missing or invalid.');
            return;
        }

        const legend = data.mapData.legend;
        
        // Render the grid using data.mapData.grid
        data.mapData.grid.forEach((row, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('game-row');
            row.forEach((cell, colIndex) => {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('game-cell');
                cellDiv.dataset.row = rowIndex;
                cellDiv.dataset.col = colIndex;
                
                // Add cell type class based on legend
                const cellType = legend[cell.toString()];
                cellDiv.classList.add(cellType);
                
                // Mark start and goal positions
                if (rowIndex === data.mapData.start[0] && colIndex === data.mapData.start[1]) {
                    cellDiv.classList.add('start');
                    cellDiv.innerHTML = '🏃';
                }
                if (rowIndex === data.mapData.goal[0] && colIndex === data.mapData.goal[1]) {
                    cellDiv.classList.add('goal');
                    cellDiv.innerHTML = '🏆';
                }
                
                rowDiv.appendChild(cellDiv);
            });
            gameBoard.appendChild(rowDiv);
        });

        // Highlight the path on the grid
        if (data.path && data.path.length > 0) {
            data.path.forEach(([row, col]) => {
                const cell = document.querySelector(`.game-cell[data-row='${row}'][data-col='${col}']`);
                if (cell) {
                    cell.classList.add('path');
                }
            });
        }
    }
});
