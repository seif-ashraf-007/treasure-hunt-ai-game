export function initializeGame() {
    const startGameBtn = document.getElementById("startGameBtn");
    const resetGameBtn = document.getElementById("resetGameBtn");

    const urlParams = new URLSearchParams(window.location.search);
    const selectedMap = urlParams.get('map');
    const selectedAlgorithm = urlParams.get('algorithm');

    if (!selectedMap || !selectedAlgorithm) {
        window.location.href = 'play.html';
        return {};
    }

    document.getElementById('map-name').textContent = selectedMap;
    document.getElementById('algorithm-name').textContent = selectedAlgorithm;

    const gameAnalytics = document.getElementById('game-analytics');
    const chatBox = document.querySelector('.agent-chat');
    if (gameAnalytics) gameAnalytics.style.display = 'none';
    if (chatBox) chatBox.style.display = 'none';

    return { startGameBtn, resetGameBtn, selectedMap, selectedAlgorithm };
}
