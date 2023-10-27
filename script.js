const player = document.querySelector('#player');
const alienCell = document.querySelector('#alien');
const gameGrid = document.querySelector('#game-grid');
console.log(gameGrid.rows[7]);

let playerPositionX = 13; // Example initial position
let playerPositionY = 7; // Example initial position
let isShooting = false;

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
  const cells = gameGrid.rows[playerPositionY].cells;
  for (let i = 0; i < cells.length; i++) {
    cells[i].classList.remove('player');
  }
  
  cells[playerPositionX].classList.add('player');
}

function shootBullet(position) {
  console.log('shooting bullet', position);
  let top = playerPositionY - 1;
  const bullet = document.createElement('div');
  bullet.classList.add('bullet');
  gameGrid.rows[playerPositionY - 1].cells[playerPositionX].classList.add(
    'bullet'
  );
  console.log('pow pow');
  isShooting = true;

  const bulletInterval = setInterval(() => {
    if (top < 0) {
      isShooting = false;
      clearInterval(bulletInterval);
    } else if (isShooting) {
      gameGrid.rows[top].cells[playerPositionX].classList.remove('bullet');
      top -= 1;
      if (top >= 0)
        gameGrid.rows[top].cells[playerPositionX].classList.add('bullet');
    }
    // bullet.style.top = top + 'px';
  }, 30);
}
