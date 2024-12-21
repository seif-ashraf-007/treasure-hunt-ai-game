import { initializeGame } from './game/init.js';
import { renderMap } from './game/map.js';
import { createAgent } from './game/agent.js';
import { animatePath } from './game/animate.js';

document.addEventListener('DOMContentLoaded', () => {
    const { startGameBtn, resetGameBtn, selectedMap, selectedAlgorithm } = initializeGame();

    const gameAnalytics = document.getElementById('game-analytics');
    const chatBox = document.querySelector('.agent-chat');
    const agentChatBox = document.getElementById('agent-chat-box');
    const pathCostsTable = document.getElementById('path-costs-table').getElementsByTagName('tbody')[0];
    
    let agent = null;
    let currentAnimation = null;

    function resetGame() {
        // Stop any ongoing animation first
        if (currentAnimation && currentAnimation.stop) {
            currentAnimation.stop();
            currentAnimation = null;
        }

        // Clear visual elements
        document.querySelectorAll('.game-cell').forEach(cell => {
            cell.classList.remove('path', 'explored');
        });
        
        // Reset agent if it exists
        if (agent) {
            agent.remove();
            agent = null;
        }

        // Clear chat messages
        agentChatBox.innerHTML = '';
        
        // Reset analytics
        pathCostsTable.innerHTML = '';
        document.getElementById('total-path-cost').textContent = '0';
        document.getElementById('path-length').textContent = '0';
        document.getElementById('explored-path-cost').textContent = '0';
        document.getElementById('game-status').textContent = '';
        document.getElementById('game-time').textContent = '';
        document.getElementById('real-time').textContent = '';

        // Hide analytics and chat
        gameAnalytics.style.display = 'none';
        chatBox.style.display = 'none';

        // Enable start button
        startGameBtn.disabled = false;

        // Re-render initial map
        fetch(`http://127.0.0.1:5000/game?map=${selectedMap}&algorithm=${selectedAlgorithm}`)
            .then(response => response.json())
            .then(data => renderMap(data))
            .catch(error => console.error("Error:", error));
    }

    async function startGame() {
        try {
            // Disable both start and reset buttons while game is running
            startGameBtn.disabled = true;
            resetGameBtn.disabled = true;
            
            // Show analytics and chat
            gameAnalytics.style.display = 'block';
            chatBox.style.display = 'block';

            const startTime = performance.now();
            
            const response = await fetch(`http://127.0.0.1:5000/game?map=${selectedMap}&algorithm=${selectedAlgorithm}`);
            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            if (data.error) {
                // More descriptive error handling for algorithm errors
                const errorMessage = data.error.includes('unsupported operand type')
                    ? 'Algorithm error: Invalid path calculation (check start/goal positions)'
                    : data.error;
                throw new Error(errorMessage);
            }

            // Validate required data
            if (!data.path || !data.explored || !data.mapData) {
                throw new Error('Invalid response data from server');
            }

            const algorithmTime = data.algorithmTime || 0;
            
            // Create new agent
            agent = createAgent(data.mapData.start);

            // Start animation
            currentAnimation = animatePath(agent, data.path, data.explored, data.mapData, algorithmTime, startTime);
            await currentAnimation;

            // Enable reset button after animation completes
            resetGameBtn.disabled = false;

        } catch (error) {
            console.error("Game Error:", error);
            // Show error in UI instead of alert
            document.getElementById('game-status').textContent = `Error: ${error.message}`;
            resetGameBtn.disabled = false;
            startGameBtn.disabled = false;
        }
    }

    startGameBtn.addEventListener('click', startGame);

    resetGameBtn.addEventListener('click', () => {
        resetGame();
    });

    // Initial map render
    fetch(`http://127.0.0.1:5000/game?map=${selectedMap}&algorithm=${selectedAlgorithm}`)
        .then(response => response.json())
        .then(data => renderMap(data))
        .catch(error => console.error("Error:", error));
});
