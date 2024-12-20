import { initializeGame } from './game/init.js';
import { renderMap } from './game/map.js';
import { createAgent } from './game/agent.js';
import { animatePath } from './game/animate.js';

document.addEventListener('DOMContentLoaded', () => {
    const { startGameBtn, resetGameBtn, selectedMap, selectedAlgorithm } = initializeGame();

    const gameAnalytics = document.getElementById('game-analytics');
    const chatBox = document.querySelector('.agent-chat');

    let agent = null;

    startGameBtn.addEventListener('click', () => {
        gameAnalytics.style.display = 'block';
        chatBox.style.display = 'block';

        const startTime = performance.now();
        
        fetch(`http://127.0.0.1:5000/game?map=${selectedMap}&algorithm=${selectedAlgorithm}`)
            .then(response => response.json())
            .then(async data => {
                const algorithmTime = performance.now() - startTime;
                agent = createAgent(data.mapData.start);
                await animatePath(agent, data.path, data.explored, data.mapData, algorithmTime, startTime);
            })
            .catch(error => console.error("Error:", error));
    });

    resetGameBtn.addEventListener('click', () => {
        document.querySelectorAll('.game-cell').forEach(cell => cell.classList.remove('path', 'explored'));
        document.getElementById('agent-chat-box').innerHTML = '';
        document.getElementById('path-costs-table').getElementsByTagName('tbody')[0].innerHTML = '';
        document.getElementById('total-path-cost').textContent = '0';
        document.getElementById('path-length').textContent = '0';
        document.getElementById('explored-path-cost').textContent = '0';
        document.getElementById('game-status').textContent = '';
        document.getElementById('game-time').textContent = '';
        document.getElementById('real-time').textContent = '';
    });

    fetch(`http://127.0.0.1:5000/game?map=${selectedMap}&algorithm=${selectedAlgorithm}`)
        .then(response => response.json())
        .then(data => renderMap(data))
        .catch(error => console.error("Error:", error));
});
