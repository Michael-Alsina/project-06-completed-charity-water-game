// Game configuration and state variables
const GOAL_CANS = 20;        // Total items needed to collect
const GAME_DURATION = 30;    // Game duration in seconds
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;          // Holds the interval for spawning items
let penaltySpawnInterval;    // Holds the interval for spawning penalty items
let timerInterval;           // Holds the interval for the countdown
let timeLeft = GAME_DURATION;
let penaltyCanSpawned = false;

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive) return; // Stop if the game is not active
  const cells = document.querySelectorAll('.grid-cell');
  
  // Keep the penalty can on the board once it has appeared
  cells.forEach(cell => {
    if (!cell.querySelector('.penalty-can')) {
      cell.innerHTML = '';
    }
  });

  // Select an empty cell from the grid to place the water can
  const emptyCells = [...cells].filter(cell => !cell.firstElementChild);
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  if (!randomCell) return;

  // Use a template literal to create the wrapper and water-can element
  randomCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="water-can"></div>
    </div>
  `;
}

// Spawns a can that subtracts a point when clicked
function spawnPenaltyCan() {
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => {
    if (cell.querySelector('.penalty-can')) {
      cell.innerHTML = '';
    }
  });

  const emptyCells = [...cells].filter(cell => !cell.firstElementChild);
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  if (!randomCell) return;

  randomCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="water-can penalty-can"></div>
    </div>
  `;
  penaltyCanSpawned = true;
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active
  gameActive = true;
  currentCans = 0;
  timeLeft = GAME_DURATION;
  penaltyCanSpawned = false;
  document.getElementById('current-cans').textContent = currentCans;
  document.getElementById('timer').textContent = timeLeft;
  document.getElementById('achievements').textContent = '';
  createGrid(); // Set up the game grid
  spawnWaterCan();
  spawnInterval = setInterval(spawnWaterCan, 1000); // Spawn water cans every second
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    document.getElementById('timer').textContent = timeLeft;

    if (timeLeft === 15 && !penaltyCanSpawned) {
      spawnPenaltyCan();
      penaltySpawnInterval = setInterval(spawnPenaltyCan, 1000);
    }

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameActive = false; // Mark the game as inactive
  clearInterval(spawnInterval); // Stop spawning water cans
  clearInterval(penaltySpawnInterval); // Stop spawning penalty cans
  clearInterval(timerInterval); // Stop the countdown
  document.getElementById('achievements').textContent =
    currentCans >= GOAL_CANS ? 'You win!' : 'You lose!';
}

// Adds a point when the active water can is clicked
document.querySelector('.game-grid').addEventListener('click', (event) => {
  if (!gameActive || !event.target.closest('.water-can')) return;

  const clickedCan = event.target.closest('.water-can');
  currentCans += clickedCan.classList.contains('penalty-can') ? -1 : 1;
  currentCans = Math.max(0, currentCans);
  document.getElementById('current-cans').textContent = currentCans;
  event.target.closest('.grid-cell').innerHTML = '';

  if (currentCans >= GOAL_CANS) {
    endGame();
  }
});

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);
