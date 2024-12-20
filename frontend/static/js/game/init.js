export function initializeGame() {
    const startGameBtn = document.getElementById("startGameBtn");
    const resetGameBtn = document.getElementById("resetGameBtn");

    const urlParams = new URLSearchParams(window.location.search);
    const selectedMap = urlParams.get('map');
    const selectedAlgorithm = urlParams.get('algorithm');

    document.getElementById('map-name').textContent = selectedMap;
    document.getElementById('algorithm-name').textContent = selectedAlgorithm;

    return { startGameBtn, resetGameBtn, selectedMap, selectedAlgorithm };
}
