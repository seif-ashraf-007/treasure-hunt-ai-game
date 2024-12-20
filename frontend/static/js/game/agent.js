export function createAgent(startPosition) {
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

export function moveAgent(agent, fromPos, toPos) {
    return new Promise(resolve => {
        const toCell = document.querySelector(`.game-cell[data-row='${toPos[0]}'][data-col='${toPos[1]}']`);
        const rect = toCell.getBoundingClientRect();

        agent.style.left = `${rect.left}px`;
        agent.style.top = `${rect.top}px`;

        setTimeout(resolve, 700);
    });
}

export function addAgentMessage(message, type = 'thinking') {
    const chatBox = document.getElementById('agent-chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', `agent-${type}`);
    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
