const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tsoliasImg = new Image();
tsoliasImg.src = "assets/images/tsolias.png";

const eggImg = new Image();
eggImg.src = "assets/images/egg.png";

const acropolisImg = new Image();
acropolisImg.src = "assets/images/acropolis.png";

const bgImg = new Image();
bgImg.src = "assets/images/background.png";

// Game objects
let player = { x: 50, y: 400, width: 40, height: 40, dy: 0, grounded: false };
let eggs = [];
let gravity = 0.8;
let jumpPower = -12;
let score = 0;
let totalEggs = 20;
let moveLeft = false;
let moveRight = false;
let jumpQueued = false;

let platforms = [
  { x: 0, y: 440, width: 800, height: 40 },
  { x: 200, y: 350, width: 100, height: 10 },
  { x: 400, y: 300, width: 120, height: 10 },
  { x: 600, y: 220, width: 100, height: 10 }
];

let acropolis = { x: 700, y: 160, width: 80, height: 80 };

// Timer
let startTime = Date.now();
let finished = false;
let personalRecord = localStorage.getItem("record") || "--";

for (let i = 0; i < totalEggs; i++) {
  eggs.push({
    x: Math.random() * 700 + 20,
    y: Math.random() * 300 + 50,
    collected: false
  });
}

document.getElementById("record").textContent =
  `Personal Record: ${personalRecord === "--" ? "--" : parseFloat(personalRecord).toFixed(2)}s`;

function update() {
  if (finished) return;

  const timeElapsed = (Date.now() - startTime) / 1000;
  document.getElementById("timer").textContent = `Time: ${timeElapsed.toFixed(2)}s`;

  player.dy += gravity;
  player.y += player.dy;

  if (moveLeft) player.x -= 4;
  if (moveRight) player.x += 4;

  player.grounded = false;
  platforms.forEach(p => {
    if (player.x < p.x + p.width &&
        player.x + player.width > p.x &&
        player.y + player.height < p.y + 10 &&
        player.y + player.height + player.dy >= p.y) {
      player.y = p.y - player.height;
      player.dy = 0;
      player.grounded = true;
    }
  });

  if (jumpQueued && player.grounded) {
    player.dy = jumpPower;
    jumpQueued = false;
  }

  eggs.forEach(egg => {
    if (!egg.collected &&
        player.x < egg.x + 20 &&
        player.x + player.width > egg.x &&
        player.y < egg.y + 20 &&
        player.y + player.height > egg.y) {
      egg.collected = true;
      score++;
    }
  });

  if (score === totalEggs &&
      player.x < acropolis.x + acropolis.width &&
      player.x + player.width > acropolis.x &&
      player.y < acropolis.y + acropolis.height &&
      player.y + player.height > acropolis.y) {
    finished = true;
    const endTime = (Date.now() - startTime) / 1000;
    document.getElementById("timer").textContent = `Finished in ${endTime.toFixed(2)}s`;

    if (personalRecord === "--" || endTime < parseFloat(personalRecord)) {
      localStorage.setItem("record", endTime.toFixed(2));
      document.getElementById("record").textContent = `Personal Record: ${endTime.toFixed(2)}s`;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#444";
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

  eggs.forEach(egg => {
    if (!egg.collected) {
      ctx.drawImage(eggImg, egg.x, egg.y, 20, 20);
    }
  });

  ctx.drawImage(tsoliasImg, player.x, player.y, player.width, player.height);

  if (score === totalEggs) {
    ctx.drawImage(acropolisImg, acropolis.x, acropolis.y, acropolis.width, acropolis.height);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Wait for all images to load before starting the game
let imagesLoaded = 0;
[tsoliasImg, eggImg, acropolisImg, bgImg].forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === 4) {
      loop();
    }
  };
});

// Keyboard input
document.addEventListener("keydown", e => {
  if (e.code === "ArrowLeft") moveLeft = true;
  if (e.code === "ArrowRight") moveRight = true;
  if (e.code === "Space") jumpQueued = true;
});
document.addEventListener("keyup", e => {
  if (e.code === "ArrowLeft") moveLeft = false;
  if (e.code === "ArrowRight") moveRight = false;
});

// Touch controls
document.getElementById("leftBtn").addEventListener("touchstart", () => moveLeft = true);
document.getElementById("leftBtn").addEventListener("touchend", () => moveLeft = false);

document.getElementById("rightBtn").addEventListener("touchstart", () => moveRight = true);
document.getElementById("rightBtn").addEventListener("touchend", () => moveRight = false);

document.getElementById("jumpBtn").addEventListener("touchstart", () => jumpQueued = true);
