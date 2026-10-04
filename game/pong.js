/* =========================================================
   PONG
========================================================= */

const canvas =
    document.getElementById("pongCanvas");

const ctx =
    canvas.getContext("2d");


/* =========================================================
   ELEMENTS
========================================================= */

const playerScoreElement =
    document.getElementById("playerScore");

const aiScoreElement =
    document.getElementById("aiScore");

const leftPlayerLabel =
    document.getElementById("leftPlayerLabel");

const rightPlayerLabel =
    document.getElementById("rightPlayerLabel");

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

const modeSelection =
    document.getElementById("modeSelection");

const difficultySelection =
    document.getElementById("difficultySelection");

const onePlayerButton =
    document.getElementById("onePlayerButton");

const twoPlayerButton =
    document.getElementById("twoPlayerButton");

const backToModes =
    document.getElementById("backToModes");

const leftControls =
    document.getElementById("leftControls");

const rightControls =
    document.getElementById("rightControls");


/* =========================================================
   SETTINGS
========================================================= */

const WIN_SCORE = 5;

const PADDLE_WIDTH = 14;
const PADDLE_HEIGHT = 105;

const PLAYER_SPEED = 9;
const SECOND_PLAYER_SPEED = 9;

const BALL_SIZE = 13;


/* =========================================================
   DIFFICULTIES
========================================================= */

const difficulties = {

    noob: {
        speed: 2.2,
        error: 150,
        reaction: 0.65
    },

    easy: {
        speed: 4,
        error: 75,
        reaction: 0.72
    },

    medium: {
        speed: 6,
        error: 35,
        reaction: 0.84
    },

    hard: {
        speed: 8.5,
        error: 10,
        reaction: 0.94
    },

    impossible: {
        speed: 14,
        error: 0,
        reaction: 1
    }

};


/* =========================================================
   GAME STATE
========================================================= */

let playerScore = 0;
let aiScore = 0;

let gameRunning = false;
let paused = false;

let gameMode = "1p";
let selectedDifficulty = "medium";

let aiTargetY =
    canvas.height / 2;

let aiErrorOffset = 0;


/* =========================================================
   OBJECTS
========================================================= */

const player = {

    x: 35,

    y:
        canvas.height / 2 -
        PADDLE_HEIGHT / 2,

    width: PADDLE_WIDTH,

    height: PADDLE_HEIGHT,

    speed: PLAYER_SPEED

};


const opponent = {

    x:
        canvas.width -
        35 -
        PADDLE_WIDTH,

    y:
        canvas.height / 2 -
        PADDLE_HEIGHT / 2,

    width: PADDLE_WIDTH,

    height: PADDLE_HEIGHT,

    speed: 6

};


const ball = {

    x: canvas.width / 2,

    y: canvas.height / 2,

    size: BALL_SIZE,

    speed: 7,

    velocityX: 7,

    velocityY: 2

};


/* =========================================================
   INPUT
========================================================= */

const keys = {};


document.addEventListener(
    "keydown",
    (event) => {

        keys[event.key.toLowerCase()] = true;

        if (event.code === "Space") {

            event.preventDefault();

            if (gameRunning) {
                togglePause();
            }

        }

    }
);


document.addEventListener(
    "keyup",
    (event) => {

        keys[event.key.toLowerCase()] =
            false;

    }
);


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


    /* Background */

    ctx.fillStyle = "#07111f";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* Center line */

    ctx.strokeStyle =
        "rgba(255,255,255,0.10)";

    ctx.lineWidth = 2;

    ctx.setLineDash([10, 14]);

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


    /* Center circle */

    ctx.strokeStyle =
        "rgba(255,255,255,0.07)";

    ctx.beginPath();

    ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        65,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    /* Paddles */

    ctx.fillStyle = "#dcecff";

    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );

    ctx.fillRect(
        opponent.x,
        opponent.y,
        opponent.width,
        opponent.height
    );


    /* Ball */

    ctx.beginPath();

    ctx.arc(
        ball.x,
        ball.y,
        ball.size / 2,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffffff";

    ctx.fill();

}


/* =========================================================
   RESET
========================================================= */

function resetPositions() {

    player.y =
        canvas.height / 2 -
        player.height / 2;

    opponent.y =
        canvas.height / 2 -
        opponent.height / 2;

}


function resetBall(direction) {

    ball.x =
        canvas.width / 2;

    ball.y =
        canvas.height / 2;

    ball.speed = 7;

    ball.velocityX =
        direction * ball.speed;

    ball.velocityY =
        (Math.random() * 5) - 2.5;

    aiTargetY =
        canvas.height / 2;

}


/* =========================================================
   PLAYER 1
========================================================= */

function updatePlayer() {

    if (keys["w"]) {

        player.y -= player.speed;

    }

    if (keys["s"]) {

        player.y += player.speed;

    }

    clampPaddle(player);

}


/* =========================================================
   PLAYER 2
========================================================= */

function updateSecondPlayer() {

    if (keys["arrowup"]) {

        opponent.y -=
            SECOND_PLAYER_SPEED;

    }

    if (keys["arrowdown"]) {

        opponent.y +=
            SECOND_PLAYER_SPEED;

    }

    clampPaddle(opponent);

}


/* =========================================================
   AI
========================================================= */

function updateAI() {

    const settings =
        difficulties[selectedDifficulty];


    /*
        Impossible tracks the ball
        perfectly.
    */

    if (
        selectedDifficulty ===
        "impossible"
    ) {

        aiTargetY =
            ball.y -
            opponent.height / 2;

    }

    else {

        /*
            Only update the target when
            the ball is moving toward AI.
        */

        if (ball.velocityX > 0) {

            const target =
                ball.y -
                opponent.height / 2;

            aiTargetY =
                target +
                aiErrorOffset;

        }

        else {

            aiTargetY =
                canvas.height / 2 -
                opponent.height / 2;

        }

    }


    const difference =
        aiTargetY -
        opponent.y;


    const movement =
        Math.sign(difference) *
        Math.min(
            Math.abs(difference),
            settings.speed
        );


    /*
        Reaction factor makes lower
        difficulties respond less accurately.
    */

    opponent.y +=
        movement *
        settings.reaction;


    clampPaddle(opponent);


    /*
        Occasionally create a new
        prediction error.
    */

    if (
        selectedDifficulty !==
        "impossible" &&
        Math.random() < 0.015
    ) {

        aiErrorOffset =
            (
                Math.random() * 2 - 1
            ) *
            settings.error;

    }

}


/* =========================================================
   CLAMP PADDLE
========================================================= */

function clampPaddle(paddle) {

    paddle.y = Math.max(
        0,
        Math.min(
            canvas.height -
                paddle.height,
            paddle.y
        )
    );

}


/* =========================================================
   COLLISION
========================================================= */

function paddleCollision(paddle) {

    return (

        ball.x - ball.size / 2 <
            paddle.x +
            paddle.width &&

        ball.x + ball.size / 2 >
            paddle.x &&

        ball.y - ball.size / 2 <
            paddle.y +
            paddle.height &&

        ball.y + ball.size / 2 >
            paddle.y

    );

}


/* =========================================================
   BOUNCE
========================================================= */

function bounceFromPaddle(paddle) {

    const center =
        paddle.y +
        paddle.height / 2;

    const difference =
        ball.y - center;

    const normalized =
        difference /
        (paddle.height / 2);

    const maxAngle =
        Math.PI / 3;

    const angle =
        normalized * maxAngle;


    ball.speed =
        Math.min(
            ball.speed + 0.45,
            18
        );


    const direction =
        ball.velocityX > 0
            ? -1
            : 1;


    ball.velocityX =
        Math.cos(angle) *
        ball.speed *
        direction;

    ball.velocityY =
        Math.sin(angle) *
        ball.speed;

}


/* =========================================================
   BALL
========================================================= */

function updateBall() {

    ball.x += ball.velocityX;

    ball.y += ball.velocityY;


    /* Top / bottom */

    if (
        ball.y -
            ball.size / 2 <= 0 ||

        ball.y +
            ball.size / 2 >=
            canvas.height
    ) {

        ball.velocityY *= -1;

    }


    /* Player */

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


    /* Opponent */

    if (
        ball.velocityX > 0 &&
        paddleCollision(opponent)
    ) {

        ball.x =
            opponent.x -
            ball.size / 2;

        bounceFromPaddle(opponent);

    }


    /* Left score */

    if (ball.x < -ball.size) {

        aiScore++;

        updateScore();

        if (checkWinner()) {
            return;
        }

        resetBall(1);

    }


    /* Right score */

    if (
        ball.x >
        canvas.width + ball.size
    ) {

        playerScore++;

        updateScore();

        if (checkWinner()) {
            return;
        }

        resetBall(-1);

    }

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

    if (
        playerScore >= WIN_SCORE ||
        aiScore >= WIN_SCORE
    ) {

        endGame(
            playerScore >= WIN_SCORE
                ? "You Win!"
                : (
                    gameMode === "2p"
                        ? "Player 2 Wins!"
                        : "AI Wins!"
                )
        );

        return true;

    }

    return false;

}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop() {

    if (
        gameRunning &&
        !paused
    ) {

        updatePlayer();

        if (gameMode === "1p") {

            updateAI();

        }

        else {

            updateSecondPlayer();

        }

        updateBall();

    }

    draw();

    requestAnimationFrame(gameLoop);

}


/* =========================================================
   MODE SELECTION
========================================================= */

onePlayerButton.addEventListener(
    "click",
    () => {

        gameMode = "1p";

        modeSelection.classList.add(
            "hidden"
        );

        difficultySelection.classList.remove(
            "hidden"
        );

        overlayTitle.textContent =
            "Choose Difficulty";

        overlayText.textContent =
            "How good should the AI be?";

    }
);


twoPlayerButton.addEventListener(
    "click",
    () => {

        gameMode = "2p";

        setupTwoPlayer();

        beginGame();

    }
);


backToModes.addEventListener(
    "click",
    () => {

        difficultySelection.classList.add(
            "hidden"
        );

        modeSelection.classList.remove(
            "hidden"
        );

        overlayTitle.textContent =
            "Pong";

        overlayText.textContent =
            "Choose how you want to play.";

    }
);


/* =========================================================
   DIFFICULTY SELECTION
========================================================= */

document
    .querySelectorAll(".difficulty-button")
    .forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                selectedDifficulty =
                    button.dataset.difficulty;

                setupOnePlayer();

                beginGame();

            }
        );

    });


/* =========================================================
   MODE SETUP
========================================================= */

function setupOnePlayer() {

    leftPlayerLabel.textContent =
        "YOU";

    rightPlayerLabel.textContent =
        "AI";

    leftControls.classList.remove(
        "hidden-control"
    );

    rightControls.classList.add(
        "hidden-control"
    );

}


function setupTwoPlayer() {

    leftPlayerLabel.textContent =
        "PLAYER 1";

    rightPlayerLabel.textContent =
        "PLAYER 2";

    leftControls.classList.remove(
        "hidden-control"
    );

    rightControls.classList.remove(
        "hidden-control"
    );

}


/* =========================================================
   BEGIN GAME
========================================================= */

function beginGame() {

    playerScore = 0;

    aiScore = 0;

    updateScore();

    resetPositions();

    resetBall(
        Math.random() > 0.5
            ? 1
            : -1
    );

    gameRunning = true;

    paused = false;

    pauseButton.textContent =
        "Pause";

    overlay.style.display =
        "none";

}


/* =========================================================
   END GAME
========================================================= */

function endGame(message) {

    gameRunning = false;

    paused = false;

    overlayTitle.textContent =
        message;

    overlayText.textContent =
        `${playerScore} — ${aiScore}`;

    modeSelection.classList.add(
        "hidden"
    );

    difficultySelection.classList.add(
        "hidden"
    );

    startButton.classList.remove(
        "hidden"
    );

    startButton.textContent =
        "Play Again";

    overlay.style.display =
        "grid";

}


/* =========================================================
   START BUTTON
========================================================= */

startButton.addEventListener(
    "click",
    () => {

        startButton.classList.add(
            "hidden"
        );

        modeSelection.classList.remove(
            "hidden"
        );

        overlayTitle.textContent =
            "Pong";

        overlayText.textContent =
            "Choose how you want to play.";

    }
);


/* =========================================================
   PAUSE
========================================================= */

function togglePause() {

    if (!gameRunning) {
        return;
    }

    paused = !paused;


    if (paused) {

        overlayTitle.textContent =
            "Paused";

        overlayText.textContent =
            "The game is paused.";

        modeSelection.classList.add(
            "hidden"
        );

        difficultySelection.classList.add(
            "hidden"
        );

        startButton.classList.remove(
            "hidden"
        );

        startButton.textContent =
            "Resume";

        overlay.style.display =
            "grid";

        return;

    }


    overlay.style.display =
        "none";

    startButton.classList.add(
        "hidden"
    );

}


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

    clampPaddle(player);

}


upButton.addEventListener(
    "pointerdown",
    () => movePlayer(-45)
);


downButton.addEventListener(
    "pointerdown",
    () => movePlayer(45)
);


/* =========================================================
   INITIALIZE
========================================================= */

setupOnePlayer();

resetPositions();

resetBall(1);

draw();

gameLoop();
