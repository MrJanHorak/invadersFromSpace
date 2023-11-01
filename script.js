// event listeners
const scoreBoard = document.querySelector('#score');
const livesCounter = document.querySelector('#lives');
const player = document.querySelector('#player');
const alienCell = document.querySelector('#alien');
const gameGrid = document.querySelector('#game-grid');

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
let lives = 3;
let aliens = [];
let bullets = [];
let isShooting = false;

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

function moveAliens() {
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
        alienMovementSound.play();
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
        alienMovementSound.play();
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
        alienMovementSound.play();
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
        alienMovementSound.play();
      }
    });
  }
}

function moveBullets() {
  console.log('moving bullets');
  console.log(bullets);
  bullets.forEach((bullet, index) => {
    console.log('moving bullet: ' + bullet);
    if (bullet.alive === false) {
      console.log('removing bullet');
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
          gameGrid.rows[alien.y].cells[alien.x].classList.remove('alien');
          gameGrid.rows[bullet.y].cells[bullet.x].classList.remove('bullet');
          score += 1;
          alienDeathSound.play();
          aliens.splice(j, 1);
        }
      }
    }
  }
}
function updateScore() {
  scoreBoard.innerText = score.toString();
}

function updateLives() {
  livesCounter.innerText = lives.toString();
}

function gameOver() {
  clearInterval(gameInterval);
  alert('Game Over');
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

// event listeners
document.querySelector('#start').addEventListener('click', startGame);

document.addEventListener('keydown', (event) => {
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
  } else if (
    event.key === 'ArrowDown' &&
    playerPositionY < gameGrid.rows.length - 1
  ) {
    playerPositionY++;
  }

  updatePlayerPosition();
});

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
  console.log('shooting bullet', position);
  shootBulletSound.play();
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

function updateGame() {
  moveAliens();
  moveBullets();
  checkCollisions();
  updateScore();
  updateLives();
  checkGameOver();
}

function startGame() {
  score = 0;
  lives = 3;
  aliens = [];
  bullets = [];
  createAliens();
  updatePlayerPosition();
  gameInterval = setInterval(updateGame, 1000);
}
