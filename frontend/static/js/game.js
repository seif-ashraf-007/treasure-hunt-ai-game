document.addEventListener("DOMContentLoaded", function () {
    
    let startTime;
    let realStartTime;
    let timerInterval;
    let currentPathCost = 0;
    let terrainCounts = {};
    const gameStartSound = document.getElementById("gameStartSound");

    // Get query parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const selectedMap = urlParams.get('map');
    const selectedAlgorithm = urlParams.get('algorithm');

    // Set map and algorithm in the game info section
    document.getElementById('map-name').textContent = selectedMap;
    document.getElementById('algorithm-name').textContent = selectedAlgorithm;

    // Function to render the map
    function renderMap(data) {
        const gameBoard = document.getElementById('game-board');
        if (!gameBoard) return;
        
        gameBoard.innerHTML = '';

        if (!data.mapData || !data.mapData.grid) {
            console.error('Map data is missing or invalid.');
            return;
        }

        const legend = data.mapData.legend;
        
        data.mapData.grid.forEach((row, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('game-row');
            row.forEach((cell, colIndex) => {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('game-cell');
                cellDiv.dataset.row = rowIndex;
                cellDiv.dataset.col = colIndex;
                
                const cellType = legend[cell.toString()];
                cellDiv.classList.add(cellType);
                
                if (rowIndex === data.mapData.start[0] && colIndex === data.mapData.start[1]) {
                    cellDiv.classList.add('start');
                    cellDiv.innerHTML = 'A';
                    cellDiv.style.fontSize = '2rem';
                    cellDiv.style.color = 'red';
                }
                if (rowIndex === data.mapData.goal[0] && colIndex === data.mapData.goal[1]) {
                    cellDiv.classList.add('goal');
                    cellDiv.innerHTML = 'B';
                    cellDiv.style.fontSize = '2rem';
                    cellDiv.style.color = 'blue';
                }
                
                rowDiv.appendChild(cellDiv);
            });
            gameBoard.appendChild(rowDiv);
        });
    }

    // Initial map render without solving
    fetch(`http://127.0.0.1:5000/game?map=${selectedMap}&algorithm=${selectedAlgorithm}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Error:", data.error);
                return;
            }
            // Only render the initial map
            renderMap(data);
        })
        .catch(error => {
            console.error("Error loading map:", error);
        });

    function updateRealTimeCounter() {
        const realTimeElement = document.getElementById('real-time');
        if (!realTimeElement) return;

        const currentTime = performance.now();
        const realTime = ((currentTime - realStartTime) / 1000).toFixed(2);
        realTimeElement.textContent = `${realTime} seconds`;
    }

    function updatePathCostsTable(terrain, cost) {
        // Reset counts if this is the first update
        if (Object.keys(terrainCounts).length === 0) {
            terrainCounts = {};
            document.getElementById('total-path-cost').textContent = '0';
            document.getElementById('path-length').textContent = '0';
            const tbody = document.getElementById('path-costs-table').getElementsByTagName('tbody')[0];
            tbody.innerHTML = '';
        }

        terrainCounts[terrain] = terrainCounts[terrain] || { count: 0, cost: cost };
        terrainCounts[terrain].count++;
        
        // Update the table
        const tbody = document.getElementById('path-costs-table').getElementsByTagName('tbody')[0];
        tbody.innerHTML = '';
        
        let totalCost = 0;
        for (const [terrainType, data] of Object.entries(terrainCounts)) {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = terrainType;
            row.insertCell(1).textContent = data.count;
            row.insertCell(2).textContent = data.cost;
            const terrainTotalCost = data.count * data.cost;
            row.insertCell(3).textContent = terrainTotalCost;
            totalCost += terrainTotalCost;
        }
        document.getElementById('total-path-cost').textContent = totalCost;
        document.getElementById('path-length').textContent = totalCost;
    }













    function animatePath(path, explored, mapData) {
        return new Promise((resolve) => {
            // Reset calculations
            currentPathCost = 0;
            terrainCounts = {};
            
            // // Ensure explored is an array
            explored = explored || [];
            
            if (!path || path.length === 0) {
                document.getElementById('game-status').textContent = 'No Path Found! Dead End';
                document.getElementById('path-length').textContent = '0';
                
                // Add some analytics even when no path is found
                const tbody = document.querySelector('#path-costs-table tbody');
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; color: #D2691E;">
                            No path could be found from start to goal.
                            <br>
                            The algorithm explored all possible routes but encountered dead ends.
                        </td>
                    </tr>
                `;
                
                document.getElementById('total-path-cost').textContent = '0';
                clearInterval(timerInterval);
                resolve();
                return;
            }

            // Start animations immediately
            // First, animate explored paths in red
            explored.forEach((position, index) => {
                setTimeout(() => {
                    const [row, col] = position;
                    const cell = document.querySelector(`.game-cell[data-row='${row}'][data-col='${col}']`);
                    if (cell && !cell.classList.contains('start') && !cell.classList.contains('goal')) {
                        cell.classList.add('explored');
                    }
                }, index * 100); // Delay for better visibility
            });

            // Then, animate the final path in green
            setTimeout(() => {
                path.forEach((position, index) => {
                    setTimeout(() => {
                        const [row, col] = position;
                        const cell = document.querySelector(`.game-cell[data-row='${row}'][data-col='${col}']`);
                        if (cell) {
                            cell.classList.remove('explored');
                            cell.classList.add('path');
                            
                            const terrainValue = mapData.grid[row][col];
                            const terrainType = mapData.legend[terrainValue];
                            const stepCost = mapData.costs[terrainType];
                            
                            updatePathCostsTable(terrainType, stepCost);
                        }
                        
                        if (index === path.length - 1) {
                            clearInterval(timerInterval);
                            resolve();
                        }
                    }, index * 200); // Delay for better visibility
                });
            }, explored.length * 100); // Delay based on explored animation
        });
    }











    function animateUnavailablePath(path, explored, mapData) {
        return new Promise((resolve) => {
            // Ensure explored is an array
            explored = explored || [];
    
            // Start the agent trying to explore impassable paths
            let retries = 0;
            const maxRetries = 10; // Limit retries to avoid infinite loops
    
            // Function to try and explore paths
            function tryExploringPaths() {
                retries++;
                let foundValidPath = false;
    
                // Check for all paths the agent can try
                explored.forEach((position, index) => {
                    const [row, col] = position;
                    const terrainValue = mapData.grid[row][col];
                    const terrainType = mapData.legend[terrainValue];
                    const stepCost = mapData.costs[terrainType];
    
                    // If the cost is impassable or too high, mark it as red
                    if (stepCost === -1 || stepCost > 5) { // high cost or impassable terrains
                        const cell = document.querySelector(`.game-cell[data-row='${row}'][data-col='${col}']`);
                        if (cell && !cell.classList.contains('start') && !cell.classList.contains('goal')) {
                            cell.classList.add('unavailable'); // Mark the cell in red
                        }
                    } else {
                        // If it's a valid path, mark it green and stop retries
                        const cell = document.querySelector(`.game-cell[data-row='${row}'][data-col='${col}']`);
                        if (cell && !cell.classList.contains('start') && !cell.classList.contains('goal')) {
                            cell.classList.add('path'); // Mark the cell as part of the path
                            foundValidPath = true;
                        }
                    }
                });
    
                // If valid path found, resolve
                if (foundValidPath) {
                    resolve();
                } else if (retries < maxRetries) {
                    // Retry again after a short delay
                    setTimeout(() => {
                        tryExploringPaths(); // Recursive retry
                    }, 1000);
                } else {
                    // If max retries exceeded, stop searching
                    document.getElementById('game-status').textContent = 'No valid path found after multiple attempts!';
                    resolve();
                }
            }
    
            // Start the exploration process
            tryExploringPaths();
        });
    }
    
    




    




    
    function startGame() {
    startTime = Date.now();
    realStartTime = performance.now();
    
    startGameBtn.textContent = 'Solving...';
    startGameBtn.disabled = true;

    const cells = document.querySelectorAll('.game-cell');
    cells.forEach(cell => {
        cell.classList.remove('path', 'explored');
    });
    terrainCounts = {};
    currentPathCost = 0;

    gameStartSound.play();  // Play the sound at the beginning

    // Show analytics immediately
    document.getElementById('game-analytics').style.display = 'block';
    document.getElementById('game-status').textContent = 'Solving...';
    document.getElementById('game-time').textContent = 'Calculating...';
    document.getElementById('real-time').textContent = '0.00 seconds';
    document.getElementById('path-length').textContent = 'Calculating...';

    timerInterval = setInterval(updateRealTimeCounter, 10);

    fetch(`http://127.0.0.1:5000/game?map=${selectedMap}&algorithm=${selectedAlgorithm}`)
        .then(response => response.json())
        .then(async data => {
            const endTime = Date.now();
            const algorithmTime = ((endTime - startTime) / 1000).toFixed(2);
            document.getElementById('game-time').textContent = `${algorithmTime} seconds`;

            if (data.error) {
                document.getElementById('game-status').textContent = 'Error: ' + data.error;
                startGameBtn.textContent = 'Start Game';
                startGameBtn.disabled = false;
                clearInterval(timerInterval);
                return;
            } else {
                document.getElementById('game-status').textContent = 'Path Found! Animating...';
                await animatePath(data.path, data.explored, data.mapData);
                document.getElementById('game-status').textContent = 'Solved!';
            }

            startGameBtn.textContent = 'Start Game';
            startGameBtn.disabled = false;
        })
        .catch(error => {
            console.error("Error starting game:", error);
            document.getElementById('game-status').textContent = 'Error occurred while solving';
            startGameBtn.textContent = 'Start Game';
            startGameBtn.disabled = false;
            clearInterval(timerInterval);
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
        clearInterval(timerInterval);
        document.getElementById('game-analytics').style.display = 'none';
        startGameBtn.textContent = 'Start Game';
        startGameBtn.disabled = false;
        
        // Reset path costs
        currentPathCost = 0;
        terrainCounts = {};
        document.getElementById('path-length').textContent = '0';
        document.getElementById('total-path-cost').textContent = '0';
        const tbody = document.getElementById('path-costs-table').getElementsByTagName('tbody')[0];
        tbody.innerHTML = '';
    });
});