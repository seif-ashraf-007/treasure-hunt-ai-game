import { initializeGame } from './game/init.js';
import { renderMap } from './game/map.js';
import { createAgent } from './game/agent.js';
import { animatePath } from './game/animate.js';

document.addEventListener('DOMContentLoaded', () => {
    const { startGameBtn, resetGameBtn, selectedMap, selectedAlgorithm } = initializeGame();

    let agent = null;

    startGameBtn.addEventListener('click', () => {
        fetch(`http://127.0.0.1:5000/game?map=${selectedMap}&algorithm=${selectedAlgorithm}`)
            .then(response => response.json())
            .then(async data => {
                agent = createAgent(data.mapData.start);
                await animatePath(agent, data.path, data.explored, data.mapData);
            })
            .catch(error => console.error("Error:", error));
    });

    resetGameBtn.addEventListener('click', () => {
        document.querySelectorAll('.game-cell').forEach(cell => cell.classList.remove('path', 'explored'));
        document.getElementById('agent-chat-box').innerHTML = '';
    });

    fetch(`http://127.0.0.1:5000/game?map=${selectedMap}&algorithm=${selectedAlgorithm}`)
        .then(response => response.json())
        .then(data => renderMap(data))
        .catch(error => console.error("Error:", error));
});
