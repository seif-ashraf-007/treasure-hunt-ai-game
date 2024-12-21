import { renderMap } from './game/map.js';

document.addEventListener("DOMContentLoaded", function () {
  const mapSelect = document.getElementById("mapSelect");
  const algorithmSelect = document.getElementById("algorithmSelect");
  const startGameBtn = document.getElementById("startGameBtn");
  const mapSize = document.getElementById("map-size");
  const mapDifficulty = document.getElementById("map-difficulty");

  // Fetch and populate maps
  fetch("http://127.0.0.1:5000/play/maps")
    .then((response) => response.json())
    .then((data) => {
      if (data.maps) {
        data.maps.forEach((map) => {
          const option = document.createElement("option");
          option.value = map.filename;
          option.textContent = map.name;
          mapSelect.appendChild(option);
        });
      }
    })
    .catch((error) => console.error("Error:", error));

  // Handle map selection change
  mapSelect.addEventListener("change", function() {
    const selectedMap = this.value;
    if (selectedMap) {
      fetch(`http://127.0.0.1:5000/maps/${selectedMap}`)
        .then(response => response.json())
        .then(data => {
          console.log("Received map data:", data); // Debug log
          if (data.success) {
            startGameBtn.style.display = "block"

            // Check if game-board exists
            const gameBoard = document.getElementById('game-board');
            console.log("Game board element:", gameBoard); // Debug log

            // Wrap the map data in the expected format
            const renderData = {
              mapData: data.map
            };
            console.log("Rendering with data:", renderData); // Debug log
            
            renderMap(renderData);
            updateMapDetails(data.map);
          }
        })
        .catch(error => console.error('Error:', error));
    }
  });

  function updateMapDetails(mapData) {
    if (mapSize) {
      mapSize.textContent = `${mapData.size}x${mapData.size}`;
    }
  }

  startGameBtn.addEventListener("click", function () {
    const selectedMap = mapSelect.value;
    const selectedAlgorithm = algorithmSelect.value;

    if (!selectedMap || !selectedAlgorithm) {
      alert("Please select a map and an algorithm to start the game.");
      return;
    }

    window.location.href = `game.html?map=${selectedMap}&algorithm=${selectedAlgorithm}`;
  });
});
