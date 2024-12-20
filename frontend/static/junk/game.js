document.addEventListener("DOMContentLoaded", function () {
    const startGameBtn = document.getElementById("startGameBtn");
    const resetGameBtn = document.getElementById("resetGameBtn");
    let startTime;
    let realStartTime;
    let timerInterval;
    let currentPathCost = 0;
    let terrainCounts = {};
    let agent = null;
    let exploredPathCost = 0;
    let optimalPathCost = 0;

    const urlParams = new URLSearchParams(window.location.search);
    const selectedMap = urlParams.get('map');
    const selectedAlgorithm = urlParams.get('algorithm');

    document.getElementById('map-name').textContent = selectedMap;
    document.getElementById('algorithm-name').textContent = selectedAlgorithm;

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

    fetch(`http://127.0.0.1:5000/game?map=${selectedMap}&algorithm=${selectedAlgorithm}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Error:", data.error);
                return;
            }
            renderMap(data);
        })
        .catch(error => {
            console.error("Error loading map:", error);
        });

    function updateRealTimeCounter() {
        requestAnimationFrame(() => {
            const realTimeElement = document.getElementById('real-time');
            if (!realTimeElement) return;

            const currentTime = performance.now();
            const realTime = ((currentTime - realStartTime) / 1000).toFixed(2);
            realTimeElement.textContent = `${realTime} seconds`;
        });
    }

    function updatePathCostsTable(terrain, cost) {
        if (Object.keys(terrainCounts).length === 0) {
            terrainCounts = {};
            document.getElementById('total-path-cost').textContent = '0';
            document.getElementById('path-length').textContent = '0';
            const tbody = document.getElementById('path-costs-table').getElementsByTagName('tbody')[0];
            tbody.innerHTML = '';
        }

        terrainCounts[terrain] = terrainCounts[terrain] || { count: 0, cost: cost };
        terrainCounts[terrain].count++;
        
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

    function createAgent(startPosition) {
        const agentElement = document.createElement('div');
        agentElement.classList.add('agent');
        agentElement.innerHTML = '🤖';
        agentElement.style.position = 'absolute';
        
        const startCell = document.querySelector(`.game-cell[data-row='${startPosition[0]}'][data-col='${startPosition[1]}']`);
        const rect = startCell.getBoundingClientRect();
        
        agentElement.style.left = `${rect.left}px`;
        agentElement.style.top = `${rect.top}px`;
        
        document.body.appendChild(agentElement);
        return agentElement;
    }

    function moveAgent(agent, fromPos, toPos) {
        return new Promise(resolve => {
            const toCell = document.querySelector(`.game-cell[data-row='${toPos[0]}'][data-col='${toPos[1]}']`);
            const rect = toCell.getBoundingClientRect();
            
            agent.style.left = `${rect.left}px`;
            agent.style.top = `${rect.top}px`;
            
            setTimeout(resolve, 300);
        });
    }

    function addAgentMessage(message, type = 'thinking') {
        const chatBox = document.getElementById('agent-chat-box');
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', `agent-${type}`);
        messageDiv.textContent = message;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function animatePath(path, explored, mapData) {
        currentPathCost = 0;
        terrainCounts = {};
        exploredPathCost = 0;
        optimalPathCost = 0;
        
        explored = explored || [];
        
        if (!path || path.length === 0) {
            addAgentMessage("I've analyzed all possible routes, but I can't find a valid path to the goal. 😕", "action");
            clearInterval(timerInterval);
            return;
        }

        if (!agent) {
            agent = createAgent(mapData.start);
            const greetings = [
                "Hello! I'm your pathfinding robot! Let's find that treasure! 🗺️",
                "Beep boop! Time to hunt for treasure! 🤖",
                "Adventure awaits! Let me guide you to the treasure! ✨",
                "Systems online! Target: Treasure. Mission: Find the optimal path! 🎯"
            ];
            addAgentMessage(greetings[Math.floor(Math.random() * greetings.length)], "action");
        }

        for (const pos of explored) {
            const [row, col] = pos;
            const cell = document.querySelector(`.game-cell[data-row='${row}'][data-col='${col}']`);
            
            if (cell && !cell.classList.contains('start') && !cell.classList.contains('goal')) {
                const terrainValue = mapData.grid[row][col];
                const terrainType = mapData.legend[terrainValue];
                const stepCost = mapData.costs[terrainType];
                
                exploredPathCost += stepCost;
                document.getElementById('explored-path-cost').textContent = exploredPathCost;

                const messages = {
                    water: [
                        `Splash! This ${terrainType} will slow us down... Cost: ${stepCost} 💧`,
                        `Water ahead! My circuits don't like this... Cost: ${stepCost} 🌊`,
                        `Need to be careful with water... Energy cost: ${stepCost} 🚣`
                    ],
                    forest: [
                        `Dense forest here! Might need to find another way... Cost: ${stepCost} 🌳`,
                        `These trees are making it tricky! Energy cost: ${stepCost} 🌲`,
                        `Forest terrain detected! Navigation cost: ${stepCost} 🍃`
                    ],
                    rock: [
                        `Rocky terrain ahead! This'll be tough... Cost: ${stepCost} 🪨`,
                        `These rocks are not making it easy! Cost: ${stepCost} ⛰️`,
                        `Climbing over rocks... Energy required: ${stepCost} 🏔️`
                    ],
                    empty: [
                        `Clear path here! Nice and easy with cost ${stepCost} ✨`,
                        `Smooth terrain ahead! Energy cost: ${stepCost} 🌟`,
                        `This looks promising! Cost: ${stepCost} ⭐`
                    ]
                };

                const terrainMessages = messages[terrainType] || [`Analyzing ${terrainType} terrain... Cost: ${stepCost}`];
                addAgentMessage(terrainMessages[Math.floor(Math.random() * terrainMessages.length)]);
                
                await moveAgent(agent, [row, col], [row, col]);
                cell.classList.add('explored');
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        clearInterval(timerInterval);

        addAgentMessage(`Exploration complete! Total cost of exploration: ${exploredPathCost}. Now following the optimal path! 🎯`, "action");
        
        for (let i = 0; i < path.length; i++) {
            const pos = path[i];
            const [row, col] = pos;
            const cell = document.querySelector(`.game-cell[data-row='${row}'][data-col='${col}']`);
            
            if (cell) {
                const terrainValue = mapData.grid[row][col];
                const terrainType = mapData.legend[terrainValue];
                const stepCost = mapData.costs[terrainType];
                
                optimalPathCost += stepCost;
                document.getElementById('path-length').textContent = optimalPathCost;
                
                cell.classList.remove('explored');
                cell.classList.add('path');
                
                if (i === path.length - 1) {
                    await moveAgent(agent, [row, col], mapData.goal);
                } else {
                    await moveAgent(agent, [row, col], [row, col]);
                }
                
                updatePathCostsTable(terrainType, stepCost);
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        const successMessages = [
            `Mission accomplished! �� Explored cost: ${exploredPathCost}, Optimal path cost: ${optimalPathCost}!`,
            `Beep boop! Found the treasure! 🌟 We explored paths costing ${exploredPathCost} to find a path costing ${optimalPathCost}!`,
            `Target reached! 💪 Total exploration: ${exploredPathCost}, Best path: ${optimalPathCost}!`,
            `Success! 🏆 Explored ${exploredPathCost} worth of paths to find the optimal ${optimalPathCost} path!`,
            `Treasure located! 🎯 Exploration cost: ${exploredPathCost}, Final path cost: ${optimalPathCost}!`
        ];
        addAgentMessage(successMessages[Math.floor(Math.random() * successMessages.length)], "action");
    }

    function startGame() {
        const chatBox = document.querySelector('.agent-chat');
        chatBox.style.display = 'block';
        
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

    startGameBtn.addEventListener("click", function() {
        startGameBtn.disabled = true;
        startGame();
    });

    resetGameBtn.addEventListener("click", function() {
        const cells = document.querySelectorAll('.game-cell');
        cells.forEach(cell => {
            cell.classList.remove('path', 'explored');
        });
        
        document.querySelector('.agent-chat').style.display = 'none';
        
        document.getElementById('agent-chat-box').innerHTML = '';
        
        clearInterval(timerInterval);
        
        document.getElementById('game-analytics').style.display = 'none';
        startGameBtn.textContent = 'Start Game';
        startGameBtn.disabled = false;
        
        currentPathCost = 0;
        terrainCounts = {};
        document.getElementById('path-length').textContent = '0';
        document.getElementById('total-path-cost').textContent = '0';
        const tbody = document.getElementById('path-costs-table').getElementsByTagName('tbody')[0];
        tbody.innerHTML = '';
        exploredPathCost = 0;
        optimalPathCost = 0;
        document.getElementById('explored-path-cost').textContent = '0';
    });
});