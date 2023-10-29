// event listeners
const scoreBoard = document.querySelector('#score');
const livesCounter = document.querySelector('#lives');
const player = document.querySelector('#player');
const alienCell = document.querySelector('#alien');
const gameGrid = document.querySelector('#game-grid');

// variables
const numRows = 10;
const numColumns = 30;
let playerPosition = { row: numRows - 1, col: Math.floor(numColumns / 2) };
let playerPositionX = Math.floor(numColumns / 2); // Example initial position
let playerPositionY = numRows - 1; // Example initial position
let isShooting = false;
let score = 0;
let lives = 3;
let aliens = [];
let bullets = [];

// create game grid:
for (let i = 0; i < numRows; i++) {
  const row = document.createElement('tr');
  for (let j = 0; j < numColumns; j++) {
    const cell = document.createElement('td');
    cell.className = 'cell';
    cell.id = `${i}-${j}`; // Example: 0-0, 0-1, 0-2, etc.
    row.appendChild(cell);
  }
  gameGrid.appendChild(row);
}

// functions
function createAliens() {
  console.log('creating aliens');
  for (let i = 0; i < numColumns - 2; i = i + 2) {
    aliens.push({
      x: i,
      y: 0,
      alive: true,
      direction: 'right',
    });
  }
}

function updateAliens() {
  console.log('updating aliens');
  aliens.forEach((alien) => {
    if (alien.alive) {
      gameGrid.rows[alien.y].cells[alien.x].classList.add('alien');
    }
  });
}

function updateBullets() {
  console.log('updating bullets');
  bullets.forEach((bullet) => {
    gameGrid.rows[bullet.y].cells[bullet.x].classList.add('bullet');
  });
}

function moveAliens() {
  console.log('moving aliens');
  if (aliens.some((alien) => alien.y === numRows - 1)) {
    gameOver();
  } else if (
    aliens.some(
      (alien) => alien.x === numColumns - 1 && alien.direction === 'right'
    )
  ) {
    aliens.forEach((alien) => {
      if (alien.alive) {
        gameGrid.rows[alien.y].cells[alien.x].classList.remove('alien');
        alien.y += 1;
        alien.direction = 'left';
        gameGrid.rows[alien.y].cells[alien.x].classList.add('alien');
      }
    });
  } else if (
    aliens.some((alien) => alien.x === 0 && alien.direction === 'left')
  ) {
    aliens.forEach((alien) => {
      if (alien.alive) {
        gameGrid.rows[alien.y].cells[alien.x].classList.remove('alien');
        alien.y += 1;
        alien.direction = 'right';
        gameGrid.rows[alien.y].cells[alien.x].classList.add('alien');
      }
    });
  } else if (
    aliens.some(
      (alien) => alien.x < numColumns - 1 && alien.direction === 'right'
    )
  ) {
    aliens.forEach((alien) => {
      if (alien.alive) {
        gameGrid.rows[alien.y].cells[alien.x].classList.remove('alien');
        alien.x += 1;
        gameGrid.rows[alien.y].cells[alien.x].classList.add('alien');
      }
    });
  } else if (
    aliens.some((alien) => alien.x > 0 && alien.direction === 'left')
  ) {
    aliens.forEach((alien) => {
      if (alien.alive) {
        gameGrid.rows[alien.y].cells[alien.x].classList.remove('alien');
        alien.x -= 1;
        gameGrid.rows[alien.y].cells[alien.x].classList.add('alien');
      }
    });
  } 
}

function moveBullets() {
  console.log('moving bullets');
  bullets.forEach((bullet) => {
    const cell = gameGrid.rows[bullet.y].cells[bullet.x];
    cell.classList.remove('bullet');
    bullet.y -= 1;
  });
}
function checkCollisions() {
  console.log('checking collisions');
  aliens.forEach((alien) => {
    bullets.forEach((bullet) => {
      if (alien.x === bullet.x && alien.y === bullet.y) {
        alien.alive = false;
        bullet.alive = false;
        score += 1;
      }
    });
  });
}

function updateScore() {
  console.log('updating score: ' + score);
  scoreBoard.innerText = score.toString();
}

function updateLives() {
  console.log('updating lives: ' + lives);
  livesCounter.innerText = lives.toString();
}

function gameOver() {
  console.log('game over');
  clearInterval(gameInterval);
  alert('Game Over');
}

function checkGameOver() {
  console.log('checking game over');
  aliens.forEach((alien) => {
    if (alien.y === numRows) {
      gameOver();
    }
  });
}

function updateGame() {
  console.log('updating game');
  moveAliens();
  moveBullets();
  checkCollisions();
  updateScore();
  updateLives();
  checkGameOver();
  updateAliens();
  updateBullets();
}

function startGame() {
  console.log('starting game');
  createAliens();
  updateAliens();
  updatePlayerPosition();
  gameInterval = setInterval(updateGame, 1000);
}

// event listeners
document.querySelector('#start').addEventListener('click', startGame);

document.addEventListener('keydown', (event) => {
  console.log(event.key);
  if (event.key === 'ArrowLeft' && playerPositionX > 0) {
    playerPositionX--;
  } else if (
    event.key === 'ArrowRight' &&
    playerPositionX < gameGrid.rows[playerPositionY].cells.length - 1
  ) {
    playerPositionX++;
  } else if (event.key === ' ' && !isShooting) {
    console.log('pew pew');
    shootBullet(playerPositionX);
  } else if (event.key === 'ArrowUp' && playerPositionY > 0) {
    playerPositionY--;
    console.log('up');
  } else if (
    event.key === 'ArrowDown' &&
    playerPositionY < gameGrid.rows.length - 1
  ) {
    playerPositionY++;
    console.log('down');
  }

  updatePlayerPosition();
});

function updatePlayerPosition() {
  console.log('updating player position');
  console.log(playerPositionX + ' ' + playerPositionY + ' ' + playerPosition);
  const cells = gameGrid.rows[playerPositionY].cells;
  for (let i = 0; i < cells.length; i++) {
    console.log('removing player class from cell ' + i);
    cells[i].classList.remove('player');
  }

  console.log('adding player class to cell ' + playerPositionX);
  cells[playerPositionX].classList.add('player');
}

function shootBullet(position) {
  console.log('shooting bullet', position);
  if (isShooting) return;

  const bullet = { x: position, y: playerPositionY - 1, alive: true };
  bullets.push(bullet);

  isShooting = true;

  const bulletInterval = setInterval(() => {
    if (!bullet.alive) {
      isShooting = false;
      clearInterval(bulletInterval);
      return;
    }

    const cell = gameGrid.rows[bullet.y].cells[bullet.x];
    cell.classList.remove('bullet');

    bullet.y -= 1;

    if (bullet.y < 0) {
      bullet.alive = false;
    } else {
      const newCell = gameGrid.rows[bullet.y].cells[bullet.x];
      newCell.classList.add('bullet');
    }
  }, 30);
}
