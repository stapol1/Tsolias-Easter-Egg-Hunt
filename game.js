const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let tsoliasImg = new Image();
let eggImg = new Image();
let acropolisImg = new Image();

let loaded = 0;
function checkStart() {
  loaded++;
  if (loaded === 3) {
    gameLoop();
  }
}

tsoliasImg.onload = checkStart;
eggImg.onload = checkStart;
acropolisImg.onload = checkStart;

tsoliasImg.src = "assets/images/tsolias_clean.png";
eggImg.src = "assets/images/egg_clean.png";
acropolisImg.src = "assets/images/acropolis_clean.png";

const keys = {};
let eggs = [];
let collected = 0;
let timer = 0;
let startTime = null;
let record = localStorage.getItem("personalRecord") || null;

const hero = {
  x: 50,
  y: 500,
  width: 40,
  height: 60,
  dy: 0,
  onGround: false
};

const gravity = 0.6;
const jumpPower = -12;
const groundY = 560;

for (let i = 0; i < 20; i++) {
  eggs.push({
    x: Math.random() * 700 + 50,
    y: Math.random() * 400 + 100,
    collected: false
  });
}

function updateTimer() {
  if (startTime) {
    timer = ((Date.now() - startTime) / 1000).toFixed(2);
    document.getElementById("timer").textContent = timer;
  }
  if (record) {
    document.getElementById("record").textContent = record;
  }
}

function update() {
  if (!startTime) startTime = Date.now();
  updateTimer();

  hero.dy += gravity;
  hero.y += hero.dy;
  if (hero.y > groundY - hero.height) {
    hero.y = groundY - hero.height;
    hero.dy = 0;
    hero.onGround = true;
  }

  if (keys["ArrowUp"] && hero.onGround) {
    hero.dy = jumpPower;
    hero.onGround = false;
  }
  if (keys["ArrowLeft"]) hero.x -= 5;
  if (keys["ArrowRight"]) hero.x += 5;

  eggs.forEach(egg => {
    if (!egg.collected &&
      hero.x < egg.x + 20 &&
      hero.x + hero.width > egg.x &&
      hero.y < egg.y + 20 &&
      hero.y + hero.height > egg.y) {
        egg.collected = true;
        collected++;
    }
  });

  if (collected === eggs.length) {
    if (hero.x > 700 && hero.y < 300) {
      if (!record || parseFloat(timer) < parseFloat(record)) {
        localStorage.setItem("personalRecord", timer);
        record = timer;
      }
      alert("Victory! Time: " + timer + "s");
      window.location.reload();
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(acropolisImg, 700, 240, 100, 100);
  eggs.forEach(egg => {
    if (!egg.collected) ctx.drawImage(eggImg, egg.x, egg.y, 20, 28);
  });
  ctx.drawImage(tsoliasImg, hero.x, hero.y, hero.width, hero.height);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Mobile touch support
function bindTouch(id, key) {
  const el = document.getElementById(id);
  el.addEventListener("touchstart", () => keys[key] = true);
  el.addEventListener("touchend", () => keys[key] = false);
}
bindTouch("left", "ArrowLeft");
bindTouch("right", "ArrowRight");
bindTouch("jump", "ArrowUp");
