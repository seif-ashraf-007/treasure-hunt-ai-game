export function updateAnalytics(terrainCounts, terrain, cost) {
    if (!terrainCounts[terrain]) {
        terrainCounts[terrain] = { count: 0, cost: cost };
    }
    terrainCounts[terrain].count++;

    const tbody = document.getElementById('path-costs-table').getElementsByTagName('tbody')[0];
    if (!tbody) return;

    tbody.innerHTML = '';

    let totalCost = 0;
    let totalCells = 0;

    const sortedTerrains = Object.entries(terrainCounts).sort((a, b) => a[0].localeCompare(b[0]));

    for (const [terrainType, data] of sortedTerrains) {
        const row = tbody.insertRow();
        
        const typeCell = row.insertCell(0);
        typeCell.textContent = terrainType.charAt(0).toUpperCase() + terrainType.slice(1);
        
        const countCell = row.insertCell(1);
        countCell.textContent = data.count;
        totalCells += data.count;
        
        const costCell = row.insertCell(2);
        costCell.textContent = data.cost;
        
        const terrainTotalCost = data.count * data.cost;
        const totalCostCell = row.insertCell(3);
        totalCostCell.textContent = terrainTotalCost;
        
        totalCost += terrainTotalCost;
    }

    const summaryRow = tbody.insertRow();
    summaryRow.classList.add('summary-row');
    summaryRow.insertCell(0).textContent = 'Total';
    summaryRow.insertCell(1).textContent = totalCells;
    summaryRow.insertCell(2).textContent = '-';
    summaryRow.insertCell(3).textContent = totalCost;

    updateSummaryStatistics(totalCost, totalCells);
}

function updateSummaryStatistics(totalCost, pathLength) {
    const elements = {
        'total-path-cost': totalCost,
        'path-length': pathLength,
    };

    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
}

export function updateGameStatus(status) {
    const statusElement = document.getElementById('game-status');
    if (statusElement) {
        statusElement.textContent = status;
        statusElement.className = `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
    }
}

export function updateTimings(algorithmTime, totalTime) {
    const gameTimeElement = document.getElementById('game-time');
    const realTimeElement = document.getElementById('real-time');

    if (gameTimeElement) {
        gameTimeElement.textContent = algorithmTime ? 
            `${algorithmTime.toFixed(2)}ms` : 
            '0.00ms';
    }

    if (realTimeElement) {
        realTimeElement.textContent = totalTime ? 
            `${totalTime.toFixed(2)}s` : 
            '0.00s';
    }
}
