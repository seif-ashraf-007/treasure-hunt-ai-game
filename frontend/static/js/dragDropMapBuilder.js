document.addEventListener("DOMContentLoaded", () => {
    const gridContainer = document.getElementById("grid");
    const legend = {
        0: { name: "Empty", image: "../assets/empty.png" },
        1: { name: "Wall", image: "../assets/wall.png" },
        2: { name: "Water", image: "../assets/water.png" },
        3: { name: "Rock", image: "../assets/rock.png" },
        4: { name: "Forest", image: "../assets/forest.png" },
    };

    const rows = 7; // Number of rows
    const cols = 6; // Number of columns
    const grid = Array.from({ length: rows }, () => Array(cols).fill(0));

    // Initialize grid
    const createGrid = () => {
        gridContainer.innerHTML = "";
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 55px)`;
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 55px)`;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement("div");
                cell.className = "grid-item";
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.style.backgroundImage = `url('${legend[grid[row][col]].image}')`;
                cell.style.backgroundSize = "cover";
                gridContainer.appendChild(cell);
            }
        }
    };

    // Update cell background based on type
    const updateCell = (row, col, type) => {
        const cell = document.querySelector(
            `.grid-item[data-row="${row}"][data-col="${col}"]`
        );
        grid[row][col] = parseInt(type, 10);
        cell.style.backgroundImage = `url('${legend[type].image}')`;
    };

    // Drag and drop handling
    gridContainer.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("type", e.target.dataset.type);
    });

    gridContainer.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    gridContainer.addEventListener("drop", (e) => {
        e.preventDefault();
        const row = e.target.dataset.row;
        const col = e.target.dataset.col;
        const type = document.getElementById("legendSelect").value;
        updateCell(row, col, type);
    });

    // Initialize dropdown for legend selection
    const legendSelect = document.getElementById("legendSelect");
    Object.entries(legend).forEach(([key, value]) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = value.name;
        legendSelect.appendChild(option);
    });

    createGrid();

    // Save map button
    document.getElementById("saveMap").addEventListener("click", async () => {
        const mapName = document.getElementById("mapName").value.trim();
        const errorMessage = document.getElementById("error-message");

        // Validate map name
        if (mapName === "") {
            errorMessage.textContent = "Map name cannot be empty!";
            errorMessage.style.display = "block";
            return;
        } else {
            errorMessage.style.display = "none";
        }

        // Prepare map data
        const mapData = {
            name: mapName,
            mapData: {
                grid: grid,
                start: [0, 0], // Set default start position; update as needed
                goal: [5, 6], // Set default goal position; update as needed
                legend: {
                    0: "empty",
                    1: "wall",
                    2: "water",
                    3: "rock",
                    4: "forest",
                },
                costs: {
                    empty: 1,
                    wall: -1,
                    water: 5,
                    rock: 3,
                    forest: 10,
                },
            },
        };

        // Send map data to backend
        try {
            const response = await fetch("http://127.0.0.1:5000/save_map", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(mapData),
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error("Error saving map:", error);
            alert("Failed to save the map. Please try again.");
        }
    });
});
