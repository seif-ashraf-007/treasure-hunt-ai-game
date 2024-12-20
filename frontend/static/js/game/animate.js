import { moveAgent, addAgentMessage } from './agent.js';
import { updateAnalytics, updateGameStatus, updateTimings } from './analytics.js';
import messages from './messages.js';

function getRandomMessage(type, replacements) {
    const messageList = messages[type];
    const template = messageList[Math.floor(Math.random() * messageList.length)];
    return template.replace(/\{(\w+)\}/g, (_, key) => replacements[key]);
}

export async function animatePath(agent, path, explored, mapData, algorithmTime, startTime) {
    let isCancelled = false;
    let terrainCounts = {};
    let exploredPathCost = 0;
    let optimalPathCost = 0;
    let exploredTerrainCounts = {};

    const animation = {
        stop: () => {
            isCancelled = true;
        }
    };

    try {
        updateGameStatus('Exploring...');
        updateTimings(algorithmTime, 0);
        
        for (const pos of explored) {
            if (isCancelled) return;

            const [row, col] = pos;
            const cell = document.querySelector(`.game-cell[data-row='${row}'][data-col='${col}']`);
            if (cell) {
                const terrainValue = mapData.grid[row][col];
                const terrainType = mapData.legend[terrainValue];
                const stepCost = mapData.costs[terrainType];

                if (!exploredTerrainCounts[terrainType]) {
                    exploredTerrainCounts[terrainType] = { count: 0, cost: stepCost };
                }
                exploredTerrainCounts[terrainType].count++;
                
                exploredPathCost += stepCost;
                document.getElementById('explored-path-cost').textContent = exploredPathCost;

                const message = getRandomMessage('exploring', {
                    terrain: terrainType,
                    cost: stepCost
                });
                addAgentMessage(message);
                await moveAgent(agent, [row, col], [row, col]);
                if (!isCancelled) {
                    cell.classList.add('explored');
                }

                const currentTime = (performance.now() - startTime) / 1000;
                updateTimings(algorithmTime, currentTime);
            }
        }

        if (isCancelled) return;

        updateGameStatus('Following optimal path...');
        
        const startCell = document.querySelector(`.game-cell[data-row='${mapData.start[0]}'][data-col='${mapData.start[1]}']`);
        if (startCell) {
            const rect = startCell.getBoundingClientRect();
            agent.style.left = `${rect.left}px`;
            agent.style.top = `${rect.top}px`;
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        for (const [row, col] of path) {
            if (isCancelled) return;

            const cell = document.querySelector(`.game-cell[data-row='${row}'][data-col='${col}']`);
            if (cell) {
                const terrainValue = mapData.grid[row][col];
                const terrainType = mapData.legend[terrainValue];
                const stepCost = mapData.costs[terrainType];

                optimalPathCost += stepCost;
                document.getElementById('path-length').textContent = optimalPathCost;

                if (!isCancelled) {
                    cell.classList.add('path');
                }
                await moveAgent(agent, [row, col], [row, col]);

                updateAnalytics(terrainCounts, terrainType, stepCost);
            }
        }

        if (!isCancelled) {
            updateGameStatus('Complete');
            const completionMessage = getRandomMessage('pathFound', {
                cost: optimalPathCost
            });
            addAgentMessage(completionMessage, "action");
        }
    } catch (error) {
        console.error('Animation error:', error);
        if (!isCancelled) {
            updateGameStatus('Error');
            addAgentMessage('An error occurred during the animation', 'error');
        }
    }

    return animation;
}
