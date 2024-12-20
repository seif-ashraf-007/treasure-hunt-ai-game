document.addEventListener("DOMContentLoaded", function () {
  const mapSelect = document.getElementById("mapSelect");
  const algorithmSelect = document.getElementById("algorithmSelect");
  const startGameBtn = document.getElementById("startGameBtn");

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
      } else {
        console.error("No maps found.");
      }
    })
    .catch((error) => {
      console.error("Error fetching maps:", error);
    });

  startGameBtn.addEventListener("click", async function () {
    const selectedMap = mapSelect.value;
    const selectedAlgorithm = algorithmSelect.value;

    if (!selectedMap || !selectedAlgorithm) {
      alert("Please select a map and an algorithm to start the game.");
      return;
    }

    window.location.href = `game.html?map=${selectedMap}&algorithm=${selectedAlgorithm}`;
  });
});
