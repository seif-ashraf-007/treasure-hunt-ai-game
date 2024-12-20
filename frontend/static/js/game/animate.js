import { moveAgent, addAgentMessage } from './agent.js';
import { updateAnalytics, updateGameStatus, updateTimings } from './analytics.js';

export async function animatePath(agent, path, explored, mapData, algorithmTime, startTime) {
    let terrainCounts = {};
    let exploredPathCost = 0;
    let optimalPathCost = 0;

    updateGameStatus('Exploring...');
    
    // Exploring phase
    for (const pos of explored) {
        const [row, col] = pos;
        const cell = document.querySelector(`.game-cell[data-row='${row}'][data-col='${col}']`);
        if (cell) {
            const terrainValue = mapData.grid[row][col];
            const terrainType = mapData.legend[terrainValue];
            const stepCost = mapData.costs[terrainType];

            exploredPathCost += stepCost;
            document.getElementById('explored-path-cost').textContent = exploredPathCost;

            addAgentMessage(`Exploring ${terrainType}, cost: ${stepCost}`);
            await moveAgent(agent, [row, col], [row, col]);
            cell.classList.add('explored');

            const currentTime = (performance.now() - startTime) / 1000;
            updateTimings(algorithmTime, currentTime);
        }
    }

    const finalExplorationTime = (performance.now() - startTime) / 1000;
    updateTimings(algorithmTime, finalExplorationTime);
    
    updateGameStatus('Following optimal path...');
    
    // Move agent back to start position before following optimal path
    const startCell = document.querySelector(`.game-cell[data-row='${mapData.start[0]}'][data-col='${mapData.start[1]}']`);
    if (startCell) {
        const rect = startCell.getBoundingClientRect();
        agent.style.left = `${rect.left}px`;
        agent.style.top = `${rect.top}px`;
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Optimal path phase
    for (let i = 0; i < path.length; i++) {
        const [row, col] = path[i];
        const cell = document.querySelector(`.game-cell[data-row='${row}'][data-col='${col}']`);
        if (cell) {
            const terrainValue = mapData.grid[row][col];
            const terrainType = mapData.legend[terrainValue];
            const stepCost = mapData.costs[terrainType];

            optimalPathCost += stepCost;
            document.getElementById('path-length').textContent = optimalPathCost;

            cell.classList.add('path');
            // Move agent to current position
            await moveAgent(agent, path[i], path[i]);

            updateAnalytics(terrainCounts, terrainType, stepCost);
        }
    }

    updateGameStatus('Complete');
    addAgentMessage(`Exploration complete! Path cost: ${optimalPathCost}`, "action");
}
