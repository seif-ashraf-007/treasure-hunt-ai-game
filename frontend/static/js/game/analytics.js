export function updateAnalytics(terrainCounts, terrain, cost) {
    // Initialize or update terrain count and cost
    if (!terrainCounts[terrain]) {
        terrainCounts[terrain] = { count: 0, cost: cost };
    }
    terrainCounts[terrain].count++;

    const tbody = document.getElementById('path-costs-table').getElementsByTagName('tbody')[0];
    if (!tbody) return;

    // Clear existing rows
    tbody.innerHTML = '';

    // Calculate and display statistics
    let totalCost = 0;
    let totalCells = 0;

    // Sort terrain types alphabetically
    const sortedTerrains = Object.entries(terrainCounts).sort((a, b) => a[0].localeCompare(b[0]));

    for (const [terrainType, data] of sortedTerrains) {
        const row = tbody.insertRow();
        
        // Terrain type
        const typeCell = row.insertCell(0);
        typeCell.textContent = terrainType.charAt(0).toUpperCase() + terrainType.slice(1);
        
        // Count
        const countCell = row.insertCell(1);
        countCell.textContent = data.count;
        totalCells += data.count;
        
        // Individual cost
        const costCell = row.insertCell(2);
        costCell.textContent = data.cost;
        
        // Total cost for this terrain
        const terrainTotalCost = data.count * data.cost;
        const totalCostCell = row.insertCell(3);
        totalCostCell.textContent = terrainTotalCost;
        
        totalCost += terrainTotalCost;
    }

    // Add summary row
    const summaryRow = tbody.insertRow();
    summaryRow.classList.add('summary-row');
    summaryRow.insertCell(0).textContent = 'Total';
    summaryRow.insertCell(1).textContent = totalCells;
    summaryRow.insertCell(2).textContent = '-';
    summaryRow.insertCell(3).textContent = totalCost;

    // Update summary statistics
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

    // Format algorithm time (milliseconds)
    if (gameTimeElement) {
        gameTimeElement.textContent = algorithmTime ? 
            `${algorithmTime.toFixed(2)}ms` : 
            '0.00ms';
    }

    // Format total time (seconds)
    if (realTimeElement) {
        realTimeElement.textContent = totalTime ? 
            `${totalTime.toFixed(2)}s` : 
            '0.00s';
    }
}
