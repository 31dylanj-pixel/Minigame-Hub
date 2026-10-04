/* =========================================================
   PONG
========================================================= */

const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

const playerScoreElement =
    document.getElementById("playerScore");

const aiScoreElement =
    document.getElementById("aiScore");

const overlay =
    document.getElementById("gameOverlay");

const overlayTitle =
    document.getElementById("overlayTitle");

const overlayText =
    document.getElementById("overlayText");

const startButton =
    document.getElementById("startButton");

const pauseButton =
    document.getElementById("pauseButton");


/* =========================================================
   GAME SETTINGS
========================================================= */

const WIN_SCORE = 5;

const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;

const PLAYER_SPEED = 7;
const AI_SPEED = 5;

const BALL_SIZE = 10;


/* =========================================================
   GAME STATE
========================================================= */

let playerScore = 0;
let aiScore = 0;

let gameRunning = false;
let paused = false;

let animationFrame;


/* =========================================================
   OBJECTS
========================================================= */

const player = {

    x: 30,

    y: canvas.height / 2 - PADDLE_HEIGHT / 2,

    width: PADDLE_WIDTH,

    height: PADDLE_HEIGHT,

    speed: PLAYER_SPEED

};


const ai = {

    x: canvas.width - 30 - PADDLE_WIDTH,

    y: canvas.height / 2 - PADDLE_HEIGHT / 2,

    width: PADDLE_WIDTH,

    height: PADDLE_HEIGHT,

    speed: AI_SPEED

};


const ball = {

    x: canvas.width / 2,

    y: canvas.height / 2,

    size: BALL_SIZE,

    speed: 5,

    velocityX: 5,

    velocityY: 2

};


/* =========================================================
   INPUT
========================================================= */

const keys = {};


document.addEventListener("keydown", (event) => {

    keys[event.key.toLowerCase()] = true;


    if (event.code === "Space") {

        event.preventDefault();

        togglePause();

    }

});


document.addEventListener("keyup", (event) => {

    keys[event.key.toLowerCase()] = false;

});


/* =========================================================
   DRAW
========================================================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
        Background
    */

    ctx.fillStyle = "#07111f";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
        Center line
    */

    ctx.strokeStyle =
        "rgba(255,255,255,0.10)";

    ctx.lineWidth = 2;

    ctx.setLineDash([8, 12]);

    ctx.beginPath();

    ctx.moveTo(
        canvas.width / 2,
        0
    );

    ctx.lineTo(
        canvas.width / 2,
        canvas.height
    );

    ctx.stroke();

    ctx.setLineDash([]);


    /*
        Paddles
    */

    ctx.fillStyle = "#dcecff";

    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );

    ctx.fillRect(
        ai.x,
        ai.y,
        ai.width,
        ai.height
    );


    /*
        Ball
    */

    ctx.beginPath();

    ctx.arc(
        ball.x,
        ball.y,
        ball.size / 2,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
        Center dot
    */

    ctx.beginPath();

    ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        3,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(255,255,255,0.25)";

    ctx.fill();

}


/* =========================================================
   RESET BALL
========================================================= */

function resetBall(direction) {

    ball.x = canvas.width / 2;

    ball.y = canvas.height / 2;

    ball.speed = 5;

    ball.velocityX =
        direction * ball.speed;

    ball.velocityY =
        (Math.random() * 4) - 2;

}


/* =========================================================
   RESET POSITIONS
========================================================= */

function resetPositions() {

    player.y =
        canvas.height / 2 -
        player.height / 2;

    ai.y =
        canvas.height / 2 -
        ai.height / 2;

}


/* =========================================================
   PLAYER
========================================================= */

function updatePlayer() {

    if (keys["w"]) {

        player.y -= player.speed;

    }

    if (keys["s"]) {

        player.y += player.speed;

    }


    /*
        Keep paddle inside arena
    */

    player.y = Math.max(
        0,
        Math.min(
            canvas.height - player.height,
            player.y
        )
    );

}


/* =========================================================
   AI
========================================================= */

function updateAI() {

    const target =
        ball.y - ai.height / 2;


    if (ai.y < target) {

        ai.y += ai.speed;

    }

    if (ai.y > target) {

        ai.y -= ai.speed;

    }


    ai.y = Math.max(
        0,
        Math.min(
            canvas.height - ai.height,
            ai.y
        )
    );

}


/* =========================================================
   COLLISION
========================================================= */

function paddleCollision(paddle) {

    return (

        ball.x - ball.size / 2 <
            paddle.x + paddle.width &&

        ball.x + ball.size / 2 >
            paddle.x &&

        ball.y - ball.size / 2 <
            paddle.y + paddle.height &&

        ball.y + ball.size / 2 >
            paddle.y

    );

}


/* =========================================================
   BALL
========================================================= */

function updateBall() {

    ball.x += ball.velocityX;

    ball.y += ball.velocityY;


    /*
        Top / bottom
    */

    if (
        ball.y - ball.size / 2 <= 0 ||
        ball.y + ball.size / 2 >= canvas.height
    ) {

        ball.velocityY *= -1;

    }


    /*
        Player collision
    */

    if (
        ball.velocityX < 0 &&
        paddleCollision(player)
    ) {

        ball.x =
            player.x +
            player.width +
            ball.size / 2;

        bounceFromPaddle(player);

    }


    /*
        AI collision
    */

    if (
        ball.velocityX > 0 &&
        paddleCollision(ai)
    ) {

        ball.x =
            ai.x -
            ball.size / 2;

        bounceFromPaddle(ai);

    }


    /*
        Score
    */

    if (ball.x < 0) {

        aiScore++;

        updateScore();

        checkWinner();

        if (gameRunning) {

            resetBall(1);

        }

    }


    if (ball.x > canvas.width) {

        playerScore++;

        updateScore();

        checkWinner();

        if (gameRunning) {

            resetBall(-1);

        }

    }

}


/* =========================================================
   PADDLE BOUNCE
========================================================= */

function bounceFromPaddle(paddle) {

    const paddleCenter =
        paddle.y + paddle.height / 2;

    const difference =
        ball.y - paddleCenter;

    const normalized =
        difference / (paddle.height / 2);


    const maxAngle =
        Math.PI / 3;

    const angle =
        normalized * maxAngle;


    ball.speed =
        Math.min(
            ball.speed + 0.35,
            12
        );


    const direction =
        ball.velocityX > 0 ? -1 : 1;


    ball.velocityX =
        Math.cos(angle) *
        ball.speed *
        direction;

    ball.velocityY =
        Math.sin(angle) *
        ball.speed;

}


/* =========================================================
   SCORE
========================================================= */

function updateScore() {

    playerScoreElement.textContent =
        playerScore;

    aiScoreElement.textContent =
        aiScore;

}


/* =========================================================
   WINNER
========================================================= */

function checkWinner() {

    if (playerScore >= WIN_SCORE) {

        endGame("You Win!");

    }

    else if (aiScore >= WIN_SCORE) {

        endGame("AI Wins!");

    }

}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop() {

    if (gameRunning && !paused) {

        updatePlayer();

        updateAI();

        updateBall();

    }


    draw();

    animationFrame =
        requestAnimationFrame(gameLoop);

}


/* =========================================================
   START
========================================================= */

function startGame() {

    playerScore = 0;

    aiScore = 0;

    updateScore();

    resetPositions();

    resetBall(
        Math.random() > 0.5 ? 1 : -1
    );

    gameRunning = true;

    paused = false;

    pauseButton.textContent =
        "Pause";

    overlay.style.display =
        "none";

}


/* =========================================================
   END
========================================================= */

function endGame(message) {

    gameRunning = false;

    paused = false;

    overlayTitle.textContent =
        message;

    overlayText.textContent =
        `${playerScore} — ${aiScore}`;

    startButton.textContent =
        "Play Again";

    overlay.style.display =
        "grid";

}


/* =========================================================
   PAUSE
========================================================= */

function togglePause() {

    if (!gameRunning) {
        return;
    }


    paused = !paused;


    if (paused) {

        pauseButton.textContent =
            "Resume";

        overlayTitle.textContent =
            "Paused";

        overlayText.textContent =
            "Take a break.";

        startButton.textContent =
            "Resume";

        overlay.style.display =
            "grid";

    }

    else {

        pauseButton.textContent =
            "Pause";

        overlay.style.display =
            "none";

    }

}


/* =========================================================
   BUTTONS
========================================================= */

startButton.addEventListener(
    "click",
    () => {

        if (paused) {

            togglePause();

        }

        else {

            startGame();

        }

    }
);


pauseButton.addEventListener(
    "click",
    togglePause
);


/* =========================================================
   MOBILE CONTROLS
========================================================= */

const upButton =
    document.getElementById("upButton");

const downButton =
    document.getElementById("downButton");


function movePlayer(amount) {

    player.y += amount;

    player.y = Math.max(
        0,
        Math.min(
            canvas.height - player.height,
            player.y
        )
    );

}


upButton.addEventListener(
    "pointerdown",
    () => movePlayer(-35)
);


downButton.addEventListener(
    "pointerdown",
    () => movePlayer(35)
);


/* =========================================================
   INITIALIZE
========================================================= */

resetPositions();

resetBall(1);

draw();

gameLoop();
