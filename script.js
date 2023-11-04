// event listeners
const scoreBoard = document.querySelector('#score');
const hiScoreBoard = document.querySelector('#hi-score');
const livesCounter = document.querySelector('#lives');
const player = document.querySelector('#player');
const alienCell = document.querySelector('#alien');
const gameGrid = document.querySelector('#game-grid');
const startButton = document.querySelector('#start');

// variables
const numRows = 15;
const numColumns = 30;
const numAliens = 11;
const alienMovementSound = new Audio('../assets/sounds/fastinvader4.wav');
const shootBulletSound = new Audio('../assets/sounds/shoot.wav');
const alienDeathSound = new Audio('../assets/sounds/invaderkilled.wav');

let playerPosition = { row: numRows - 1, col: Math.floor(numColumns / 2) };
let playerPositionX = Math.floor(numColumns / 2);
let playerPositionY = numRows - 1;
let score = 0;
let hiScore = 0;
const scoreMultiplier = [15,14,13,12,11,10,9,8,7,6,5,4,3,2,1]
let lives = 3;
let aliens = [];
let bullets = [];
let isShooting = false;

// event listeners
startButton.addEventListener('click', startGame);

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' && playerPositionX > 0) {
    playerPositionX--;
  } else if (
    event.key === 'ArrowRight' &&
    playerPositionX < gameGrid.rows[playerPositionY].cells.length - 1
  ) {
    playerPositionX++;
  } else if (event.key === ' ' && !isShooting) {
    shootBullet(playerPositionX);
  } else if (event.key === 'ArrowUp' && playerPositionY > 0) {
    playerPositionY--;
  } else if (
    event.key === 'ArrowDown' &&
    playerPositionY < gameGrid.rows.length - 1
  ) {
    playerPositionY++;
  }

  updatePlayerPosition();
});

// create game grid:
for (let i = 0; i < numRows; i++) {
  const row = document.createElement('tr');
  for (let j = 0; j < numColumns; j++) {
    const cell = document.createElement('td');
    cell.className = 'cell';
    cell.id = `${i}-${j}`;
    row.appendChild(cell);
  }
  gameGrid.appendChild(row);
}

// functions
function createAliens() {
  for (let j = 0; j <= 5; j++) {
    for (let i = 0; i <= numAliens * 2; i = i + 2) {
      aliens.push({
        x: i,
        y: j,
        alive: true,
        direction: 'right',
      });
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function moveAliens() {
  if (aliens.some((alien) => alien.y === numRows - 1)) {
    clearInterval(gameInterval); // Game over when aliens reach the bottom
    gameOver();
    return;
  }

  if (aliens.every((alien) => alien.alive === false)) {
    clearInterval(gameInterval); // Game over when aliens reach the bottom
    gameWon();
    return;
  }

  const aliensToMove = aliens.filter((alien) => alien.alive); // Only move alive aliens

  // Clear all aliens first
  aliensToMove.forEach((alien) => {
    const cell = gameGrid.rows[alien.y].cells[alien.x];
    if (cell) {
      cell.classList.remove('alien');
    }
  });

  if (
    aliensToMove.some(
      (alien) => alien.x === numColumns - 1 && alien.direction === 'right'
    )
  ) {
    aliensToMove.forEach((alien) => {
      alien.y += 1;
      alien.direction = 'left';
      alienMovementSound.play();
    });
  } else if (
    aliensToMove.some((alien) => alien.x === 0 && alien.direction === 'left')
  ) {
    aliensToMove.forEach((alien) => {
      alien.y += 1;
      alien.direction = 'right';
      alienMovementSound.play();
    });
  } else if (
    aliensToMove.some((alien) => alien.x !== 0 && alien.x !== numColumns - 1)
  ) {
    // Move all aliens (left or right) once
    aliensToMove.forEach((alien) => {
      if (alien.direction === 'right') {
        alien.x += 1;
      } else {
        alien.x -= 1;
      }
      alienMovementSound.play();
    });
  }
  // Update the positions of live aliens
  aliensToMove.forEach((alien) => {
    const cell = gameGrid.rows[alien.y].cells[alien.x];
    if (cell) {
      cell.classList.add('alien');
    }
  });
}

function moveBullets() {
  bullets.forEach((bullet, index) => {
    if (bullet.alive === false) {
      bullets.splice(index, 1);
      return;
    }
    const cell = gameGrid.rows[bullet.y].cells[bullet.x];
    cell.classList.remove('bullet');
    if (bullet.y > 0) {
      bullet.y -= 1;
      cell.classList.add('bullet');
    } else {
      bullet.alive = false;
    }
  });
  checkCollisions();
}

function checkCollisions() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    for (let j = aliens.length - 1; j >= 0; j--) {
      const alien = aliens[j];
      if (alien.alive && bullet.alive) {
        if (alien.x === bullet.x && alien.y === bullet.y) {
          alien.alive = false;
          bullet.alive = false;

          // Remove the classes and green color when a collision occurs
          const alienCell = gameGrid.rows[alien.y].cells[alien.x];
          if (alienCell.classList.contains('alien')) {
            alienCell.classList.remove('alien');
          }

          const bulletCell = gameGrid.rows[bullet.y].cells[bullet.x];
          if (bulletCell.classList.contains('bullet')) {
            bulletCell.classList.remove('bullet');
          }

          score += 10*scoreMultiplier[alien.y];
          updateScore(score);
          alienDeathSound.play();
        }
      }
    }

    // Remove the bullet here for any missed collisions
    if (!bullet.alive) {
      bullets.splice(i, 1);
    }
  }
}

function getHiScore() {
  const storedHiScore = localStorage.getItem('hiScore');
  hiScore = storedHiScore ? parseInt(storedHiScore) : 0;
  updateHiScore(); // Update the displayed high score
}

function updateScore() {
  scoreBoard.innerText = score.toString();

  // Check if the current score surpasses the high score
  if (score > hiScore) {
    hiScore = score;
    updateHiScore(); // Update the displayed high score
    localStorage.setItem('hiScore', hiScore); // Store the high score in local storage
  }
}

function updateHiScore() {
  hiScoreBoard.innerText = hiScore.toString();
}

function updateLives() {
  livesCounter.innerText = lives.toString();
}

function gameOver() {
  clearInterval(gameInterval);
  startButton.style.opacity = 1;
  startButton.innerText = 'Game over! \nPlay Again?';
}
function gameWon() {
  clearInterval(gameInterval);
  startButton.style.opacity = 1;
  startButton.style.backgroundColor = 'blue';
  startButton.innerText = 'You won! \nPlay Again?';
}

function checkGameOver() {
  aliens.forEach((alien) => {
    if (alien.y === numRows) {
      gameOver();
      aliens = [];
      bullets = [];
    }
  });
}

function updatePlayerPosition() {
  const gridRows = gameGrid.rows;
  for (let i = 0; i < gridRows.length; i++) {
    let gridCells = gridRows[i].cells;
    for (let j = 0; j < gridCells.length; j++) {
      gridCells[j].classList.remove('player');
    }
  }
  gameGrid.rows[playerPositionY].cells[playerPositionX].classList.add('player');
}

function shootBullet(position) {
  shootBulletSound.play();
  if (isShooting) return;

  const bullet = { x: position, y: playerPositionY - 1, alive: true };
  bullets.push(bullet);

  const bulletInterval = setInterval(() => {
    if (!bullet.alive) {
      isShooting = false;
      clearInterval(bulletInterval);
      return;
    }

    // Get the cell based on the bullet's current position
    const cell = gameGrid.rows[bullet.y].cells[bullet.x];

    // Check if the cell exists and contains the "bullet" class
    if (cell && cell.classList.contains('bullet')) {
      cell.classList.remove('bullet');
    }

    bullet.y -= 1; // Move the bullet up

    // Check if the bullet is still alive (it might have been destroyed while moving)
    if (bullet.alive) {
      const newCell = gameGrid.rows[bullet.y].cells[bullet.x];
      if (newCell) {
        newCell.classList.add('bullet');
      }
    }
  }, 200);
}

function checkWin() {
  if (!aliens.some((alien) => alien.alive)) {
    clearInterval(gameInterval); // Stop the game loop
    startButton.style.opacity = .8;
    startButton.innerText = 'You Win! \nPlay Again?';
  }
}

function clearAliens() {
  aliens.forEach((alien) => {
    if (alien.alive) {
      const cell = gameGrid.rows[alien.y].cells[alien.x];
      if (cell.classList.contains('alien')) {
        cell.classList.remove('alien');
      }
    }
  });
  aliens = [];
}

async function updateGame() {
  await moveAliens();
  // await sleep(50);
  checkCollisions();
  moveBullets();
  checkCollisions();
  updateScore();
  updateLives();
  checkGameOver();
  checkWin(); // Add this line to check for the win condition
}

function startGame() {
  startButton.style.opacity = 0;
  score = 0;
  lives = 3;
  clearAliens(); // Add this line to clear aliens from the previous game
  bullets = [];
  createAliens();
  updatePlayerPosition();
  gameInterval = setInterval(updateGame, 800);
}

getHiScore();
