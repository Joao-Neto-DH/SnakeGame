"use strict";
const score = document.querySelectorAll("[data-score]")[0];
const level = document.querySelectorAll("[data-level]")[0];
const canvas = document.getElementById("canvas");
const listScores = document.getElementById("scores");
const ctx = canvas.getContext("2d");
//configurações do jogo
const gameConfig = {
    level: 1,
    scores: [],
    frame: 1000 / 4,
    size: canvas.width / 20,
    lastUpdate: Date.now()
};
//dados da cobra
const snake = {
    head: { x: 0, y: 0 },
    body: []
};
//direção de movimento
let dir = "X";
let dirChanged = false;
let fruit = getFruit();
let power = "";
const skills = {
    x: 0, y: 0,
    attrative() {
        const sx = snake.head.x + gameConfig.size / 2;
        const sy = snake.head.y + gameConfig.size / 2;
        const fx = fruit.x + gameConfig.size / 2;
        const fy = fruit.y + gameConfig.size / 2;
        const d = 2.5;
        return (Math.abs(sx - fx) < gameConfig.size * d && Math.abs(sy - fy) < gameConfig.size * d);
        // if(Math.abs(sx - fx) < SIZE*d && Math.abs(sy - fy) < SIZE*d){
        //     console.log("atrai");
        // }
    }
};
const controls = {
    ArrowUp() {
        (dir !== "Y") && (dir = "Yi");
    },
    ArrowDown() {
        (dir !== "Yi") && (dir = "Y");
    },
    ArrowRight() {
        (dir !== "Xi") && (dir = "X");
    },
    ArrowLeft() {
        (dir !== "X") && (dir = "Xi");
    }
};
window.addEventListener("keyup", ({ code }) => {
    if (dirChanged)
        return;
    const previousDir = dir;
    const action = controls[code];
    action && action();
    dirChanged = previousDir !== dir;
});
function drawGame() {
    if (ctx !== null) {
        //limpa
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawsnake();
        drawFruit();
        gameOver();
        movesnake();
    }
}
function drawsnake() {
    if (!ctx)
        return;
    ctx.fillStyle = "#000";
    ctx.fillRect(snake.head.x, snake.head.y, gameConfig.size, gameConfig.size);
    ctx.fillStyle = "#0f0";
    ctx.strokeStyle = "#000";
    for (const track of snake.body) {
        let x = track.x, y = track.y;
        ctx.fillRect(x, y, gameConfig.size, gameConfig.size);
        ctx.strokeRect(x, y, gameConfig.size, gameConfig.size);
    }
}
function drawFruit() {
    if (!ctx)
        return;
    ctx.fillStyle = "#fc0";
    ctx.fillRect(fruit.x, fruit.y, gameConfig.size, gameConfig.size);
    // ctx.fillRect(fruit.x + skills.x, fruit.y + skills.y, gameConfig.size, gameConfig.size);
}
function movesnake() {
    const vel = gameConfig.size;
    if (Date.now() - gameConfig.lastUpdate > gameConfig.frame) {
        const lastTrack = !snake.body.length ? Object.assign({}, snake.head) : Object.assign({}, snake.body[snake.body.length - 1]);
        moveSnakeBody();
        power && skills[power]();
        if (dir === "X" || dir === "Xi") {
            snake.head.x += dir === "X" ? vel : -vel;
        }
        else if (dir === "Y" || dir === "Yi") {
            snake.head.y += dir === "Y" ? vel : -vel;
        }
        // const newFruitPos = {x: fruit.x + skills.x, y: fruit.y + skills.y};
        // if(power == "attrative" && skills[power]()){
        //     skills.x += (newFruitPos.x - snake.head.x) < 0 ? 3 : -3;
        //     skills.y += (newFruitPos.y - snake.head.y) < 0 ? 3 : -3;
        // }
        if (colide(fruit, snake.head)) {
            fruit = getFruit();
            snake.body.push(lastTrack);
            // skills.y = skills.x = 0;
            updateScore();
        }
        gameConfig.lastUpdate
            = Date.now();
        dirChanged = false;
    }
    if (snake.head.x + gameConfig.size > canvas.width)
        snake.head.x = 0;
    if (snake.head.x < 0)
        snake.head.x = canvas.width - gameConfig.size;
    if (snake.head.y + gameConfig.size > canvas.height)
        snake.head.y = 0;
    if (snake.head.y < 0)
        snake.head.y = canvas.height - gameConfig.size;
    requestAnimationFrame(drawGame);
}
function getFruit() {
    function multSize(max) {
        let ran = Math.round(Math.random() * max);
        ran -= ran % 20;
        return ran;
    }
    let x = Math.abs(multSize(canvas.width) - gameConfig.size);
    let y = Math.abs(multSize(canvas.height) - gameConfig.size);
    for (const track of snake.body) {
        if (colide(fruit, snake.head) || colide(fruit, track)) {
            x = Math.abs(multSize(canvas.width) - gameConfig.size);
            y = Math.abs(multSize(canvas.height) - gameConfig.size);
        }
    }
    return { x, y };
}
function colide(obj1, obj2) {
    const cx1 = obj1.x + gameConfig.size / 2;
    const cy1 = obj1.y + gameConfig.size / 2;
    const cx2 = obj2.x + gameConfig.size / 2;
    const cy2 = obj2.y + gameConfig.size / 2;
    return (Math.abs(cx1 - cx2) < gameConfig.size) && (Math.abs(cy1 - cy2) < gameConfig.size);
}
function moveSnakeBody() {
    let lastTrack = Object.assign({}, snake.head);
    for (let i = 0; i < snake.body.length; i++) {
        const temp = Object.assign({}, snake.body[i]);
        snake.body[i] = Object.assign({}, lastTrack);
        lastTrack = Object.assign({}, temp);
    }
}
function updateScore() {
    let p = Number(score.dataset.score) + 10;
    score.innerHTML = score.dataset.score = p.toString();
    if (p % 100 === 0) {
        if (gameConfig.level < 22) {
            gameConfig.level++;
            gameConfig.frame = 1000 / (gameConfig.level + 3);
            level.innerHTML = gameConfig.level.toString();
        }
        else {
            level.innerHTML = "MAX";
        }
    }
}
function gameOver() {
    for (const track of snake.body) {
        if (colide(track, snake.head)) {
            gameConfig.scores.push(Number(score.dataset.score));
            gameConfig.scores.sort((a, b) => b - a);
            listScores.innerHTML = "";
            gameConfig.level = 1;
            gameConfig.frame = 1000 / (gameConfig.level + 3);
            score.innerHTML = score.dataset.score = "0";
            level.innerHTML = gameConfig.level.toString();
            snake.head.y = snake.head.x = 0;
            snake.body.length = 0;
            fruit = getFruit();
            dir = "X";
            gameConfig.scores.forEach(num => listScores.innerHTML += `<li>${num}</li>`);
            break;
        }
    }
}
drawGame();
// console.log(fruit);
