export function createAgent(startPosition) {
    // Remove any existing agents first
    const existingAgents = document.querySelectorAll('.agent');
    existingAgents.forEach(agent => agent.remove());

    const agentElement = document.createElement('div');
    agentElement.classList.add('agent');
    
    // Create agent character with multiple parts
    const agentCharacter = document.createElement('div');
    agentCharacter.classList.add('agent-character');
    
    // Add agent body parts
    const hat = document.createElement('div');
    hat.classList.add('agent-hat');
    
    const head = document.createElement('div');
    head.classList.add('agent-head');
    
    const body = document.createElement('div');
    body.classList.add('agent-body');
    
    agentCharacter.appendChild(hat);
    agentCharacter.appendChild(head);
    agentCharacter.appendChild(body);
    agentElement.appendChild(agentCharacter);

    // Create shadow effect
    const agentShadow = document.createElement('div');
    agentShadow.classList.add('agent-shadow');
    agentElement.appendChild(agentShadow);

    const startCell = document.querySelector(`.game-cell[data-row='${startPosition[0]}'][data-col='${startPosition[1]}']`);
    if (startCell) {
        const rect = startCell.getBoundingClientRect();
        agentElement.style.left = `${rect.left}px`;
        agentElement.style.top = `${rect.top}px`;
        document.body.appendChild(agentElement);
    }

    return agentElement;
}

export function removeAgent(agent) {
    if (agent && agent.parentNode) {
        agent.parentNode.removeChild(agent);
    }
}

export function moveAgent(agent, fromPos, toPos) {
    return new Promise(resolve => {
        const toCell = document.querySelector(`.game-cell[data-row='${toPos[0]}'][data-col='${toPos[1]}']`);
        const rect = toCell.getBoundingClientRect();

        // Add moving class for animation
        agent.classList.add('moving');

        // Calculate movement direction
        const dx = toPos[1] - fromPos[1];
        if (dx > 0) {
            agent.classList.add('moving-right');
        } else if (dx < 0) {
            agent.classList.add('moving-left');
        }

        // Apply smooth movement
        agent.style.transition = 'all 0.5s ease-in-out';
        agent.style.left = `${rect.left}px`;
        agent.style.top = `${rect.top}px`;

        // Add bounce effect
        const character = agent.querySelector('.agent-character');
        character.style.animation = 'bounce 0.5s ease-in-out';

        setTimeout(() => {
            // Remove movement classes
            agent.classList.remove('moving', 'moving-right', 'moving-left');
            character.style.animation = '';
            resolve();
        }, 500);
    });
}

export function addAgentMessage(message, type = 'thinking') {
    const chatBox = document.getElementById('agent-chat-box');
    if (!chatBox) return;

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', `agent-${type}`);
    messageDiv.textContent = message;
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Show chat box if hidden
    const chatContainer = document.querySelector('.agent-chat');
    if (chatContainer) {
        chatContainer.style.display = 'flex';
    }
}
