export function renderMap(data) {
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard) return;

    gameBoard.innerHTML = '';
    if (!data.mapData || !data.mapData.grid) {
        console.error('Map data is missing or invalid.');
        return;
    }

    const legend = data.mapData.legend;

    data.mapData.grid.forEach((row, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('game-row');
        row.forEach((cell, colIndex) => {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('game-cell');
            cellDiv.dataset.row = rowIndex;
            cellDiv.dataset.col = colIndex;

            const cellType = legend[cell.toString()];
            cellDiv.classList.add(cellType);

            if (rowIndex === data.mapData.start[0] && colIndex === data.mapData.start[1]) {
                cellDiv.classList.add('start');
                cellDiv.innerHTML = 'A';
                cellDiv.style.fontSize = '2rem';
                cellDiv.style.color = 'red';
            }
            if (rowIndex === data.mapData.goal[0] && colIndex === data.mapData.goal[1]) {
                cellDiv.classList.add('goal');
                cellDiv.innerHTML = 'B';
                cellDiv.style.fontSize = '2rem';
                cellDiv.style.color = 'blue';
            }

            rowDiv.appendChild(cellDiv);
        });
        gameBoard.appendChild(rowDiv);
    });
}
