import { moveAgent, addAgentMessage } from './agent.js';
import { updatePathCostsTable } from './utils.js';

export async function animatePath(agent, path, explored, mapData) {
    let exploredPathCost = 0;
    let optimalPathCost = 0;

    // Exploring phase
    for (const pos of explored) {
        const [row, col] = pos;
        const cell = document.querySelector(`.game-cell[data-row='${row}'][data-col='${col}']`);

        if (cell && !cell.classList.contains('start') && !cell.classList.contains('goal')) {
            const terrainValue = mapData.grid[row][col];
            const terrainType = mapData.legend[terrainValue];
            const stepCost = mapData.costs[terrainType];

            exploredPathCost += stepCost;
            document.getElementById('explored-path-cost').textContent = exploredPathCost;

            addAgentMessage(`Exploring ${terrainType}, cost: ${stepCost}`);
            await moveAgent(agent, [row, col], [row, col]);
            cell.classList.add('explored');
        }
    }

    // Optimal path phase
    for (const pos of path) {
        const [row, col] = pos;
        const cell = document.querySelector(`.game-cell[data-row='${row}'][data-col='${col}']`);

        if (cell) {
            const terrainValue = mapData.grid[row][col];
            const terrainType = mapData.legend[terrainValue];
            const stepCost = mapData.costs[terrainType];

            optimalPathCost += stepCost;
            document.getElementById('path-length').textContent = optimalPathCost;

            cell.classList.add('path');
            await moveAgent(agent, [row, col], mapData.goal);

            updatePathCostsTable(terrainType, stepCost);
        }
    }

    addAgentMessage(`Exploration complete! Path cost: ${optimalPathCost}`, "action");
}
