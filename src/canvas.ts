type Point = {
    x: number,
    y: number
}
type GameConfig = {
    level:number, 
    scores: number[], 
    frame: number, 
    size: number,
    lastUpdate: number
}

const score  = document.querySelectorAll("[data-score]")[0] as HTMLElement;
const lvl    = document.querySelectorAll("[data-level]")[0] as HTMLElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const listScores = document.getElementById("scores") as HTMLElement;
const ctx    = canvas.getContext("2d");

//configurações do jogo
const gameConfig: GameConfig = {
    level: 1,
    scores: [],
    frame: 1000/4,
    size: canvas.width / 20,
    lastUpdate: Date.now()  
}

//dados da cobra
const sneak: {head:Point, body:Point[]} = {
    head: {x: 0, y: 0},
    body: []
}

//direção de movimento
let dir: "X"|"Xi"|"Y"|"Yi" = "X";
let dirChanged = false;

let fruit: Point = getFruit();

let power: "attrative"|"" = "";
const skills = {
    x: 0, y: 0,
    attrative(){
        const sx = sneak.head.x + gameConfig.size / 2;
        const sy = sneak.head.y + gameConfig.size / 2;

        const fx = fruit.x + gameConfig.size / 2;
        const fy = fruit.y + gameConfig.size / 2;

        const d = 2.5;

        return (Math.abs(sx - fx) < gameConfig.size*d && Math.abs(sy - fy) < gameConfig.size*d);
        // if(Math.abs(sx - fx) < SIZE*d && Math.abs(sy - fy) < SIZE*d){
        //     console.log("atrai");
        // }

    }
}

const controls: any = {
    ArrowUp(){
        (dir !== "Y") && (dir = "Yi");
    },
    ArrowDown(){
        (dir !== "Yi") && (dir = "Y");
    },
    ArrowRight(){
        (dir !== "Xi") && (dir = "X");
    },
    ArrowLeft(){
        (dir !== "X") && (dir = "Xi");
    }
}

window.addEventListener("keyup", ({code, preventDefault})=>{

    if(dirChanged) return;

    const previousDir = dir;
    
    const action = controls[code];
    
    action && action();
    
    dirChanged = previousDir !== dir;

});

function drawGame() {

    if(ctx !== null){
        //limpa
        ctx.clearRect(0,0, canvas.width, canvas.height);
        
        drawSneak();

        drawFruit();

        gameOver();
        moveSneak();
    }
}

function drawSneak() {
    if(!ctx) return;
    
    ctx.fillStyle = "#000";
    ctx.fillRect(sneak.head.x, sneak.head.y, gameConfig.size, gameConfig.size);

    ctx.fillStyle = "#0f0";
        ctx.strokeStyle = "#000";
        for(const track of sneak.body){
            let x = track.x, y = track.y;
            ctx.fillRect(x, y, gameConfig.size, gameConfig.size);
            ctx.strokeRect(x, y, gameConfig.size, gameConfig.size);
        }
}

function drawFruit() {
    if(!ctx) return;

    ctx.fillStyle = "#fc0";
    ctx.fillRect(fruit.x + skills.x, fruit.y + skills.y, gameConfig.size, gameConfig.size);
}

function moveSneak() {
    const vel = gameConfig.size;

    if(Date.now() - gameConfig.lastUpdate > gameConfig.frame){

        const lastTrack = !sneak.body.length ? {...sneak.head} : {...sneak.body[sneak.body.length - 1]};
        moveSneakBody();
        power && skills[power]();

        if (dir === "X" || dir === "Xi") {
            sneak.head.x += dir === "X" ? vel : -vel;
        }
        else if (dir === "Y" || dir === "Yi") {
            sneak.head.y += dir === "Y" ? vel : -vel;
        }
        
        const newFruitPos = {x: fruit.x + skills.x, y: fruit.y + skills.y};

        if(power == "attrative" && skills[power]()){
            skills.x += (newFruitPos.x - sneak.head.x) < 0 ? 3 : -3;
            skills.y += (newFruitPos.y - sneak.head.y) < 0 ? 3 : -3;
        }


        if(colide(newFruitPos, sneak.head)){
            fruit = getFruit();
            sneak.body.push(lastTrack);

            skills.y = skills.x = 0;

            updateScore();
        }

        gameConfig.lastUpdate
     = Date.now();
        dirChanged = false;
    }

    if (sneak.head.x + gameConfig.size > canvas.width) sneak.head.x = 0;

    if(sneak.head.x < 0) sneak.head.x = canvas.width - gameConfig.size;

    if (sneak.head.y + gameConfig.size > canvas.height) sneak.head.y = 0;
    
    if(sneak.head.y < 0) sneak.head.y = canvas.height - gameConfig.size;

    requestAnimationFrame(drawGame)
}

function getFruit() : Point {
    function multSize(max: number) {
        let ran = Math.round(Math.random() * max);
        ran -= ran%20;

        return ran;
    }

    let x = Math.abs(multSize(canvas.width) - gameConfig.size);
    let y = Math.abs(multSize(canvas.height) - gameConfig.size);

    for (const track of sneak.body) {
        if(colide(fruit, sneak.head) || colide(fruit, track)){
            x = Math.abs(multSize(canvas.width) - gameConfig.size);
            y = Math.abs(multSize(canvas.height) - gameConfig.size);
        }
    }

    return {x, y}
}

function colide(obj1: Point, obj2: Point) {
    const cx1 = obj1.x + gameConfig.size / 2;
    const cy1 = obj1.y + gameConfig.size / 2;

    const cx2 = obj2.x + gameConfig.size / 2;
    const cy2 = obj2.y + gameConfig.size / 2;    
    
    return (Math.abs(cx1 - cx2) < gameConfig.size) && (Math.abs(cy1 - cy2) < gameConfig.size);
}

function moveSneakBody() {
    let lastTrack = {...sneak.head};

    for (let i = 0; i < sneak.body.length; i++) {
        const temp = {...sneak.body[i]};

        sneak.body[i] = {...lastTrack};
        lastTrack = {...temp};
    }
}

function updateScore() {
    let p = Number(score.dataset.score) + 10;
    score.innerHTML = score.dataset.score = p.toString();

    if(p % 100 === 0){

        if(gameConfig.level < 22){
            gameConfig.level++;
            gameConfig.frame = 1000/(gameConfig.level + 3);
            lvl.innerHTML = gameConfig.level.toString();
        }else{
            lvl.innerHTML = "MAX";
        }
    }
}

function gameOver() {
    for (const track of sneak.body) {
        if(colide(track, sneak.head)){
            gameConfig.scores.push(Number(score.dataset.score));
            gameConfig.scores.sort((a,b)=>b - a);
            listScores.innerHTML = "";

            gameConfig.level = 1;
            gameConfig.frame = 1000 / (gameConfig.level + 3);
            score.innerHTML = score.dataset.score = "0";
            lvl.innerHTML = gameConfig.level.toString();

            sneak.head.y = sneak.head.x = 0;
            sneak.body.length = 0;

            fruit = getFruit();
            dir = "X";

            gameConfig.scores.forEach(num=>listScores.innerHTML += `<li>${num}</li>`); 
            break;
        }
    }
}

drawGame()
// console.log(fruit);