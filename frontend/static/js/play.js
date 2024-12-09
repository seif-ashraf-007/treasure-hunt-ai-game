document.addEventListener("DOMContentLoaded", function () {
  const mapSelect = document.getElementById("mapSelect");
  const algorithmSelect = document.getElementById("algorithmSelect");
  const startGameBtn = document.getElementById("startGameBtn");

  // Fetch map data from the Flask backend
  fetch("http://127.0.0.1:5000/play/maps")  // Corrected URL to the backend route
    .then((response) => response.json())
    .then((data) => {
      if (data.maps) {
        // Populate the map selection dropdown with the map files
        data.maps.forEach((map) => {
          const option = document.createElement("option");
          option.value = map.filename;  // Use map filename as the value (not map object)
          option.textContent = map.name;  // Display map name
          mapSelect.appendChild(option);
        });
      } else {
        console.error("No maps found.");
      }
    })
    .catch((error) => {
      console.error("Error fetching maps:", error);
    });

  // Handle the "Start Game" button click
  startGameBtn.addEventListener("click", async function () {
    const selectedMap = mapSelect.value;  // This will be a string (filename)
    const selectedAlgorithm = algorithmSelect.value;

    if (!selectedMap || !selectedAlgorithm) {
      alert("Please select a map and an algorithm to start the game.");
      return;
    }

    // Redirect to the game page with selected map and algorithm as query parameters
    window.location.href = `game.html?map=${selectedMap}&algorithm=${selectedAlgorithm}`;  // Corrected URL to game page
  });
});
