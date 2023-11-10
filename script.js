// event listeners
const scoreBoard = document.querySelector('#score');
const hiScoreBoard = document.querySelector('#hi-score');
const livesCounter = document.querySelector('#lives');
const levelCounter = document.querySelector('#level');
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
const saucerDeathSound = new Audio('../assets/sounds/explosion.wav');
const saucerMovementSound = new Audio('../assets/sounds/ufo_lowpitch.wav');
const scoreMultiplier = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

let playerPosition = { row: numRows - 1, col: Math.floor(numColumns / 2) };
let playerPositionX = Math.floor(numColumns / 2);
let playerPositionY = numRows - 1;
let score = 0;
let hiScore = 0;
let lives = 3;
let aliens = [];
let bullets = [];
let isShooting = false;
let levelInterval = 800;
let level = 1;
let saucer = null;
let isGameOver = false;

// event listeners
startButton.addEventListener('click', startGame);

document.addEventListener('keydown', (event) => {
  if (isGameOver) return;
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
    const cell = gameGrid.rows[bullet.y]?.cells[bullet.x];
    if (cell) {
      cell.classList.remove('bullet');
    }

    if (bullet.y > 0) {
      bullet.y -= 1;
      const newCell = gameGrid.rows[bullet.y]?.cells[bullet.x];
      if (newCell) {
        newCell.classList.add('bullet');
      }
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

          score += 10 * scoreMultiplier[alien.y];
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

function updateHiScore() {
  hiScoreBoard.innerText = hiScore.toString();
}

function getHiScore() {
  const storedHiScore = localStorage.getItem('hiScore');
  hiScore = storedHiScore ? parseInt(storedHiScore) : 0;
  updateHiScore();
}

function updateScore() {
  scoreBoard.innerText = score.toString();

  // Check if the current score surpasses the high score
  if (score > hiScore) {
    hiScore = score;
    updateHiScore();
    localStorage.setItem('hiScore', hiScore);
  }
}

function updateLives() {
  livesCounter.innerText = lives.toString();
}

function updateLevel() {
  levelCounter.innerText = level.toString();
}

function gameOver() {
  clearInterval(gameInterval);
  levelInterval = 800;
  level = 1;
  startButton.style.opacity = 1;
  startButton.innerText = 'Game over! \nPlay Again?';
  isGameOver = true;
}

function gameWon() {
  clearInterval(gameInterval);
  levelUp();
  updateLevel();
  startButton.style.opacity = 0.8;
  startButton.style.backgroundColor = 'blue';
  startButton.innerText = `Get Ready for level ${level}!`;
  setTimeout(function () {
    startGame();
  }, 2500);
}

function checkGameOver() {
  aliens.forEach((alien) => {
    if (alien.y === numRows) {
      gameOver();
      aliens = [];
      bullets = [];
      score = 0;
      lives = 3;
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

    // Check if the bullet has reached the top of the grid
    if (bullet.y < 0) {
      bullet.alive = false;
    }

    // Get the cell based on the bullet's current position
    const cell = gameGrid.rows[bullet.y]?.cells[bullet.x];

    // Check if the cell exists and contains the "bullet" class
    if (cell && cell.classList.contains('bullet')) {
      cell.classList.remove('bullet');
    }

    // Move the bullet up
    bullet.y -= 1;

    // Check if the bullet is still alive (it might have been destroyed while moving)
    if (bullet.alive) {
      const newCell = gameGrid.rows[bullet.y]?.cells[bullet.x];
      if (newCell) {
        newCell.classList.add('bullet');
      }
    }
  }, 200);
}

function levelUp() {
  level++;
  levelInterval -= 50;
}

function checkWin() {
  if (aliens.every((alien) => alien.alive === false)) {
    gameWon();
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

function createSaucer() {
  const randomX = Math.floor(Math.random() * numColumns);
  saucer = {
    x: randomX,
    y: 0,
    alive: true,
  };
}

async function moveSaucer() {
  if (saucer === null && Math.random() < 0.02) {
    createSaucer();
  } else if (saucer !== null) {
    let saucerCell = gameGrid.rows[saucer.y].cells[saucer.x];
    if (saucerCell) {
      saucerCell.classList.remove('saucer');
    }
    if (saucer.x > 0) {
      saucer.x -= 1;
      saucerCell = gameGrid.rows[saucer.y]?.cells[saucer.x];
      saucerCell?.classList.add('saucer');
      saucerMovementSound.play();
    } else {
      saucer = null;
    }
  }
}

function checkSaucerCollision() {

  if (saucer !== null) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      if (bullet && saucer.alive && bullet.alive) {
        if (saucer.x === bullet.x && saucer.y === bullet.y) {
          saucer.alive = false;
          bullet.alive = false;
          saucerDeathSound.play();

          // Remove the saucer class when a collision occurs
          const saucerCell = gameGrid.rows[saucer.y]?.cells[saucer.x];
          if (saucerCell && saucerCell.classList.contains('saucer')) {
            saucerCell.classList.remove('saucer');
          }

          // Increase the score when the saucer is shot down
          score += 1000;
          updateScore(score);
          saucer = null;
        }
      }
    }
  }
}

// actual game invocation and updating happens here below
async function updateGame() {
  if (isGameOver) return;
  await moveAliens();
  // await sleep(50);
  checkCollisions();
  moveBullets();
  moveSaucer();
  checkSaucerCollision();
  checkCollisions();
  updateScore();
  updateLives();
  checkGameOver();
  checkWin();
}

function startGame() {
  isGameOver = false;
  startButton.style.opacity = 0;
  clearAliens();
  bullets = [];
  createAliens();
  updatePlayerPosition();
  updateLevel();
  gameInterval = setInterval(updateGame, levelInterval);
}

getHiScore();
