const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const keys = {};
const eggs = [];
let collected = 0;
let startTime = null;
let timerInterval;
let personalBest = localStorage.getItem("personalBest");

const timerEl = document.getElementById("timer");
const recordEl = document.getElementById("record");

if (personalBest) {
  recordEl.innerText = `Personal Record: ${parseFloat(personalBest).toFixed(2)}s`;
}

const tsolias = new Image();
tsolias.src = "assets/images/tsolias.png";

const eggImg = new Image();
eggImg.src = "assets/images/egg.png";

const acropolisImg = new Image();
acropolisImg.src = "assets/images/acropolis.png";

let player = {
  x: 50,
  y: canvas.height - 100,
  w: 40,
  h: 60,
  vx: 0,
  vy: 0,
  grounded: false,
  speed: 4,
  jump: -12
};

const gravity = 0.6;

function spawnEggs(count) {
  eggs.length = 0;
  for (let i = 0; i < count; i++) {
    eggs.push({
      x: Math.random() * (canvas.width - 32),
      y: Math.random() * (canvas.height - 150) + 50,
      collected: false
    });
  }
}

let acropolis = {
  x: canvas.width - 120,
  y: canvas.height - 120,
  w: 100,
  h: 100
};

function update() {
  player.vx = 0;
  if (keys["ArrowLeft"]) player.vx = -player.speed;
  if (keys["ArrowRight"]) player.vx = player.speed;

  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;

  if (player.y + player.h > canvas.height) {
    player.y = canvas.height - player.h;
    player.vy = 0;
    player.grounded = true;
  } else {
    player.grounded = false;
  }

  // Collision with eggs
  eggs.forEach(egg => {
    if (!egg.collected &&
        player.x < egg.x + 32 &&
        player.x + player.w > egg.x &&
        player.y < egg.y + 32 &&
        player.y + player.h > egg.y) {
      egg.collected = true;
      collected++;
    }
  });

  // Check for win
  if (collected === eggs.length &&
      player.x < acropolis.x + acropolis.w &&
      player.x + player.w > acropolis.x &&
      player.y < acropolis.y + acropolis.h &&
      player.y + player.h > acropolis.y) {
    clearInterval(timerInterval);
    const timeTaken = (performance.now() - startTime) / 1000;
    if (!personalBest || timeTaken < personalBest) {
      localStorage.setItem("personalBest", timeTaken);
      recordEl.innerText = `Personal Record: ${timeTaken.toFixed(2)}s`;
    }
    alert(`You won in ${timeTaken.toFixed(2)} seconds!`);
    resetGame();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(tsolias, player.x, player.y, player.w, player.h);

  eggs.forEach(egg => {
    if (!egg.collected) {
      ctx.drawImage(eggImg, egg.x, egg.y, 32, 32);
    }
  });

  ctx.drawImage(acropolisImg, acropolis.x, acropolis.y, acropolis.w, acropolis.h);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function startTimer() {
  startTime = performance.now();
  timerInterval = setInterval(() => {
    const current = (performance.now() - startTime) / 1000;
    timerEl.innerText = `Time: ${current.toFixed(2)}s`;
  }, 100);
}

function resetGame() {
  player.x = 50;
  player.y = canvas.height - 100;
  collected = 0;
  spawnEggs(20);
  startTimer();
}

function bindTouch(id, key) {
  const el = document.getElementById(id);
  el.addEventListener("touchstart", e => {
    e.preventDefault();
    keys[key] = true;
  }, { passive: false });

  el.addEventListener("touchend", e => {
    e.preventDefault();
    keys[key] = false;
  }, { passive: false });
}

bindTouch("left", "ArrowLeft");
bindTouch("right", "ArrowRight");
bindTouch("up", "ArrowUp");

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

resetGame();
loop();
