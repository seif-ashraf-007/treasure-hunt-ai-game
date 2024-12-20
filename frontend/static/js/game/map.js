import { createAgent } from './agent.js';

export function renderMap(data) {
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard || !data.mapData) return;

    gameBoard.innerHTML = '';
    const grid = data.mapData.grid;
    
    const calculateCellSize = () => {
        if (window.innerWidth <= 400) return 28;
        if (window.innerWidth <= 600) return 32;
        if (window.innerWidth <= 900) return 36;
        if (window.innerWidth <= 1200) return 40;
        return 48;
    };

    const cellSize = calculateCellSize();
    const columns = grid[0].length;
    
    gameBoard.style.gridTemplateColumns = `repeat(${columns}, ${cellSize}px)`;
    
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const cell = document.createElement('div');
            cell.classList.add('game-cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            const terrainType = data.mapData.legend[grid[i][j].toString()];
            cell.classList.add(terrainType);
            
            if (i === data.mapData.start[0] && j === data.mapData.start[1]) {
                cell.classList.add('start');
            }
            if (i === data.mapData.goal[0] && j === data.mapData.goal[1]) {
                cell.classList.add('goal');
            }
            
            gameBoard.appendChild(cell);
        }
    }

    if (data.mapData.start) {
        createAgent(data.mapData.start);
    }

    window.addEventListener('resize', () => {
        const newCellSize = calculateCellSize();
        gameBoard.style.gridTemplateColumns = `repeat(${columns}, ${newCellSize}px)`;
    });
}
