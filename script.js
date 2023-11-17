// event listeners
const scoreBoard = document.querySelector('#score');
const hiScoreBoard = document.querySelector('#hi-score');
const livesCounter = document.querySelector('#lives');
const levelCounter = document.querySelector('#level');
const player = document.querySelector('#player');
const alienCell = document.querySelector('#alien');
const gameGrid = document.querySelector('#game-grid');
const startButton = document.querySelector('#start');
const rulesModal = document.getElementById('rulesModal');
const rulesButton = document.getElementById('rulesButton');
const closeModal = document.getElementById('closeModal');

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
let alienBullets = [];
let isPlayerShooting = false;
let isAlienShooting = false;
let levelInterval = 800;
let level = 1;
let saucer = null;
let isGameOver = false;
let lastLifeScore = 0;

// event listeners
startButton.addEventListener('click', startGame);
rulesButton.addEventListener('click', () => {
  rulesModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
  rulesModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target === rulesModal) {
    rulesModal.style.display = 'none';
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && rulesModal.style.display === 'block') {
    rulesModal.style.display = 'none';
  }
});

document.addEventListener('keydown', (event) => {
  if (isGameOver) return;
  if ((event.key === 'ArrowLeft' || event.key === 'a') && playerPositionX > 0) {
    playerPositionX--;
  } else if (
    (event.key === 'ArrowRight' || event.key === 'd') &&
    playerPositionX < gameGrid.rows[playerPositionY].cells.length - 1
  ) {
    playerPositionX++;
  } else if (event.key === ' ' && !isPlayerShooting) {
    shootBullet(playerPositionX, playerPositionY);
  } else if (
    (event.key === 'ArrowUp' || event.key === 'w') &&
    playerPositionY > 0
  ) {
    playerPositionY--;
  } else if (
    (event.key === 'ArrowDown' || event.key === 's') &&
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
  for (let j = 0; j < 5; j++) {
    for (let i = 0; i <= numAliens * 2; i = i + 2) {
      let varient;
      if (j === 0) {
        varient = 'alien1';
      } else if (j > 0 && j <= 2) {
        varient = 'alien2';
      } else if (j > 2 && j <= 4) {
        varient = 'alien3';
      }
      aliens.push({
        x: i,
        y: j,
        alive: true,
        direction: 'right',
        varient: varient,
      });
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function moveAliens() {
  if (aliens.some((alien) => alien.y === numRows - 1)) {
    clearInterval(gameInterval);
    gameOver();
    return;
  }

  if (aliens.every((alien) => alien.alive === false)) {
    clearInterval(gameInterval);
    gameWon();
    return;
  }

  const aliensToMove = aliens.filter((alien) => alien.alive);

  // Clear all aliens first
  aliensToMove.forEach((alien) => {
    const cell = gameGrid.rows[alien.y].cells[alien.x];
    if (cell) {
      cell.classList.remove.apply(
        cell.classList,
        Array.from(cell.classList).filter((v) => v.startsWith('alien'))
      );
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
    aliensToMove.some(
      (alien) =>
        ((alien.x >= 0 && alien.direction === 'right') ||
          (alien.x !== 0 && alien.direction === 'left')) &&
        ((alien.x !== numColumns - 1 && alien.direction === 'right') ||
          (alien.x <= numColumns - 1 && alien.direction === 'left'))
    )
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
      cell.classList.add(alien.varient);
    }
  });
}

function checkPlayerCollision() {
  const playerCell = gameGrid.rows[playerPositionY].cells[playerPositionX];

  // Check if the player collides with any alive alien
  const collidedAlien = aliens.find((alien) => {
    return (
      alien.alive && alien.x === playerPositionX && alien.y === playerPositionY
    );
  });

  if (collidedAlien) {
    // Player collided with an alien
    playerHit();
  }
}

function playerHit() {
  // Player hit logic
  lives--;

  if (lives <= 0) {
    // Game over logic
    gameOver();
  } else {
    // Reset player to the bottom
    playerPositionY = numRows - 1;
    playerPositionX = Math.floor(numColumns / 2);
    updatePlayerPosition();
    updateLives();
  }
}

function addLifeIfNeeded() {
  const scoreThreshold = 10000;

  if (score >= lastLifeScore + scoreThreshold) {
    lives++;
    lastLifeScore = score;
    updateLives();
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
  rulesButton.style.opacity = 1;
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
      lastLifeScore = 0;
      playerPosition = { row: numRows - 1, col: Math.floor(numColumns / 2) };
      playerPositionX = Math.floor(numColumns / 2);
      playerPositionY = numRows - 1;
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

function shootBullet(positionX, positionY) {
  if (isPlayerShooting) return;

  shootBulletSound.play();

  const bullet = { x: positionX, y: positionY, alive: true };
  bullets.push(bullet);

  const bulletInterval = setInterval(() => {
    if (!bullet.alive) {
      isPlayerShooting = false;
      clearInterval(bulletInterval);
      return;
    }

    // Get the cell based on the bullet's current position
    const cell = gameGrid.rows[bullet.y]?.cells[bullet.x];

    // Check if the cell exists and contains the "bullet" class
    if (cell && cell.classList.contains('bullet')) {
      cell.classList.remove('bullet');
    }

    bullet.y -= 1; // Move the bullet up for player, down for alien

    // Check if the bullet is still alive (it might have been destroyed while moving)
    if (bullet.alive && bullet.y >= 0) {
      const newCell = gameGrid.rows[bullet.y]?.cells[bullet.x];
      const newCellClasslist = Array.from(newCell.classList).filter((v) =>
        v.startsWith('alien')
      );
      if (
        newCell &&
        !newCellClasslist.length > 0 &&
        !newCell.classList.contains('saucer')
      ) {
        newCell.classList.add('bullet');
      } else if (
        newCell &&
        newCellClasslist.length > 0 &&
        !newCell.classList.contains('saucer')
      ) {
        bullet.alive = false;
        newCell.classList.remove('bullet');
        newCell.classList.remove.apply(
          newCell.classList,
          Array.from(newCell.classList).filter((v) => v.startsWith('alien'))
        );
        aliens.forEach((alien) => {
          if (alien.x === bullet.x && alien.y === bullet.y) {
            alien.alive = false;
          }
        });
        score += 10 * scoreMultiplier[bullet.y];
        updateScore(score);
        clearInterval(bulletInterval);
        alienDeathSound.play();
      } else if (newCell && newCell.classList.contains('saucer')) {
        bullet.alive = false;
        newCell.classList.remove('bullet');
        newCell.classList.remove('saucer');
        saucer.alive = false;
        saucer = null;
        score += 1000;
        updateScore(score);
        clearInterval(bulletInterval);
        saucerDeathSound.play();
      }
    } else if (bullet.y < 0 && bullet.alive) {
      bullet.alive = false;
    }
  }, 250);
}

function shootAlienBullet(positionX, positionY) {
  if (isAlienShooting) return;
  shootBulletSound.play();
  const bullet = { x: positionX, y: positionY, alive: true };
  alienBullets.push(bullet);
  isAlienShooting = true;
  const alienBulletInterval = setInterval(() => {
    if (!bullet.alive) {
      isAlienShooting = false;
      clearInterval(alienBulletInterval);
      return;
    }

    // Get the cell based on the bullet's current position
    const cell = gameGrid.rows[bullet.y]?.cells[bullet.x];

    // Check if the cell exists and contains the "bullet" class
    if (cell && cell.classList.contains('bullet-alien')) {
      cell.classList.remove('bullet-alien');
    }

    bullet.y += 1; // Move the bullet down for alien

    // Check if the bullet is still alive (it might have been destroyed while moving)
    if (bullet.alive && bullet.y < numRows) {
      const newCell = gameGrid.rows[bullet.y]?.cells[bullet.x];
      if (newCell && !newCell.classList.contains('player')) {
        newCell.classList.add('bullet-alien');
      } else if (newCell && newCell.classList.contains('player')) {
        bullet.alive = false;
        isAlienShooting = false;
        newCell.classList.remove('bullet-alien');
        playerHit();
      }
    } else if (bullet.y >= numRows && bullet.alive) {
      bullet.alive = false;
      isAlienShooting = false;
    }
  }, 200);
}

function alienShoot() {
  const shootingAliens = aliens.filter((alien) => alien.alive);
  if (shootingAliens.length > 0) {
    const randomIndex = Math.floor(Math.random() * shootingAliens.length);
    const randomAlien = shootingAliens[randomIndex];
    shootAlienBullet(randomAlien.x, randomAlien.y);
  }
}

function playerHit() {
  lives--;
  updateLives();
  // Reset player position to default
  playerPositionX = Math.floor(numColumns / 2);
  playerPositionY = numRows - 1;
  updatePlayerPosition();
  if (lives === 0) {
    gameOver();
  }
}

function levelUp() {
  level++;
  levelInterval -= 50;
}

function clearAliens() {
  aliens.forEach((alien) => {
    if (alien.alive) {
      const cell = gameGrid.rows[alien.y].cells[alien.x];
      if (
        cell.classList.contains.apply(
          cell.classList,
          Array.from(cell.classList).filter((v) => v.startsWith('alien'))
        )
      ) {
        cell.classList.remove.apply(
          cell.classList,
          Array.from(cell.classList).filter((v) => v.startsWith('alien'))
        );
      }
    }
  });
  aliens = [];
}

function createSaucer() {
  saucer = {
    x: 30,
    y: 0,
    alive: true,
  };
}

function moveSaucer() {
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
      if (
        !saucerCell.classList.contains('saucer') &&
        !saucerCell.classList.contains('bullet')
      ) {
        saucerCell.classList.add('saucer');
        saucerMovementSound.play();
      } else if (saucerCell.classList.contains('bullet')) {
        saucer.alive = false;
        saucerCell.classList.remove('saucer');
        saucerCell.classList.remove('bullet');
        bullets.forEach((bullet) => {
          if (bullet.x === saucer.x && bullet.y === saucer.y) {
            bullet.alive = false;
          }
        });
        score += 1000;
        updateScore(score);
        saucer = null;
        saucerDeathSound.play();
      }
    } else if (saucer.x === 0) {
      saucer.alive = false;
      saucerCell.classList.remove('saucer');
      saucer = null;
    } else {
      saucer = null;
    }
  }
}

// actual game invocation and updating happens here below
function updateGame() {
  if (isGameOver) return;
  moveAliens();
  checkPlayerCollision();
  moveSaucer();
  if (!isAlienShooting && level > 2) {
    // Set timeout for alien to shoot that increases with number of aliens killed and decreases as level increases
    const timeout =
      5 -
      level * 2 +
      (aliens.length - aliens.filter((alien) => alien.alive).length) * 2;
    setTimeout(() => alienShoot(), timeout);
  }
  updateScore();
  updateLives();
  addLifeIfNeeded();
  checkGameOver();
}

function startGame() {
  isGameOver = false;
  startButton.style.opacity = 0;
  rulesButton.style.opacity = 0;
  clearAliens();
  bullets = [];
  createAliens();
  updatePlayerPosition();
  updateLevel();
  gameInterval = setInterval(updateGame, levelInterval);
}

getHiScore();
