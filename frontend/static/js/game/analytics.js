export function updateAnalytics(terrainCounts, terrain, cost) {
    terrainCounts[terrain] = terrainCounts[terrain] || { count: 0, cost: cost };
    terrainCounts[terrain].count++;

    const tbody = document.getElementById('path-costs-table').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    let totalCost = 0;
    for (const [terrainType, data] of Object.entries(terrainCounts)) {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = terrainType;
        row.insertCell(1).textContent = data.count;
        row.insertCell(2).textContent = data.cost;
        const terrainTotalCost = data.count * data.cost;
        row.insertCell(3).textContent = terrainTotalCost;
        totalCost += terrainTotalCost;
    }

    document.getElementById('total-path-cost').textContent = totalCost;
    document.getElementById('path-length').textContent = totalCost;
}

export function updateGameStatus(status) {
    document.getElementById('game-status').textContent = status;
}

export function updateTimings(algorithmTime, totalTime) {
    document.getElementById('game-time').textContent = `${algorithmTime.toFixed(2)}ms`;
    document.getElementById('real-time').textContent = `${totalTime.toFixed(2)}s`;
}
