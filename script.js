// Game configuration and state variables
const GAME_DURATION = 30;    // Game duration in seconds
const DIFFICULTIES = {
  easy: { canInterval: 2000, penaltyStart: 10, goalCans: 10 },
  normal: { canInterval: 1500, penaltyStart: 15, goalCans: 15 },
  hard: { canInterval: 1000, penaltyStart: 20, goalCans: 20 }
};
let currentCans = 0;         // Current number of items collected
let currentGoalCans = DIFFICULTIES.normal.goalCans;
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
  const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
  const difficulty = DIFFICULTIES[selectedDifficulty];
  gameActive = true;
  currentCans = 0;
  currentGoalCans = difficulty.goalCans;
  timeLeft = GAME_DURATION;
  penaltyCanSpawned = false;
  document.getElementById('current-cans').textContent = currentCans;
  document.getElementById('goal-cans').textContent = currentGoalCans;
  document.getElementById('timer').textContent = timeLeft;
  document.getElementById('achievements').textContent = '';
  createGrid(); // Set up the game grid
  spawnWaterCan();
  spawnInterval = setInterval(spawnWaterCan, difficulty.canInterval);
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    document.getElementById('timer').textContent = timeLeft;

    if (timeLeft === difficulty.penaltyStart && !penaltyCanSpawned) {
      spawnPenaltyCan();
      penaltySpawnInterval = setInterval(spawnPenaltyCan, difficulty.canInterval);
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
    currentCans >= currentGoalCans ? 'You win!' : 'You lose!';
}

// Adds a point when the active water can is clicked
document.querySelector('.game-grid').addEventListener('click', (event) => {
  if (!gameActive || !event.target.closest('.water-can')) return;

  const clickedCan = event.target.closest('.water-can');
  currentCans += clickedCan.classList.contains('penalty-can') ? -1 : 1;
  currentCans = Math.max(0, currentCans);
  document.getElementById('current-cans').textContent = currentCans;
  event.target.closest('.grid-cell').innerHTML = '';

  if (currentCans >= currentGoalCans) {
    endGame();
  }
});

// Update the displayed goal when the selected difficulty changes
document.querySelectorAll('input[name="difficulty"]').forEach((input) => {
  input.addEventListener('change', () => {
    if (!gameActive) {
      currentGoalCans = DIFFICULTIES[input.value].goalCans;
      document.getElementById('goal-cans').textContent = currentGoalCans;
    }
  });
});

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);
