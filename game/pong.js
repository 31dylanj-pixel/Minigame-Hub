/* =========================================================
   PONG
========================================================= */

const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");


/* =========================================================
   UI
========================================================= */

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");

const modeSelection = document.getElementById("modeSelection");
const difficultySelection = document.getElementById("difficultySelection");

const playerColorSelection =
    document.getElementById("playerColorSelection");

const player2ColorSelection =
    document.getElementById("player2ColorSelection");

const colorGrid =
    document.getElementById("colorGrid");

const player2ColorGrid =
    document.getElementById("player2ColorGrid");

const confirmPlayerColor =
    document.getElementById("confirmPlayerColor");

const startMatchButton =
    document.getElementById("startMatchButton");

const startButton =
    document.getElementById("startButton");

const pauseButton =
    document.getElementById("pauseButton");

const countdownElement =
    document.getElementById("countdown");

const playerScoreElement =
    document.getElementById("playerScore");

const opponentScoreElement =
    document.getElementById("opponentScore");


/* =========================================================
   COLORS
========================================================= */

/*
    15 normal player colors.

    Red is deliberately NOT included here because
    the AI always owns red.
*/

const playerColors = [
    {
        name: "Turquoise",
        value: "#40E0D0"
    },

    {
        name: "Cyan",
        value: "#00FFFF"
    },

    {
        name: "Royal Blue",
        value: "#4169E1"
    },

    {
        name: "Yellow",
        value: "#FFD700"
    },

    {
        name: "Lime",
        value: "#32CD32"
    },

    {
        name: "Orange",
        value: "#FF8C00"
    },

    {
        name: "Pink",
        value: "#FF69B4"
    },

    {
        name: "Purple",
        value: "#A855F7"
    },

    {
        name: "Violet",
        value: "#8A2BE2"
    },

    {
        name: "Sky Blue",
        value: "#38BDF8"
    },

    {
        name: "Emerald",
        value: "#10B981"
    },

    {
        name: "Gold",
        value: "#FACC15"
    },

    {
        name: "Coral",
        value: "#FF7F50"
    },

    {
        name: "Hot Pink",
        value: "#FF1493"
    },

    {
        name: "White",
        value: "#FFFFFF"
    }
];


const redColor = {
    name: "Red",
    value: "#FF3B4A"
};


/*
    2P gets all 16 colors.
*/

const twoPlayerColors = [
    redColor,
    ...playerColors
];


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
        speed: 20,
        error: 0,
        reaction: 1
    }

};


/* =========================================================
   GAME STATE
========================================================= */

let gameMode = null;
let difficulty = null;

let playerColor = playerColors[0].value;
let opponentColor = redColor.value;

let player2Color = null;

let running = false;
let paused = false;
let countingDown = false;

let playerScore = 0;
let opponentScore = 0;


/* =========================================================
   PADDLES
========================================================= */

const paddleWidth = 18;
const paddleHeight = 115;

const player = {

    x: 35,

    y: canvas.height / 2 - paddleHeight / 2,

    width: paddleWidth,

    height: paddleHeight,

    speed: 9,

    color: playerColor

};


const opponent = {

    x: canvas.width - 35 - paddleWidth,

    y: canvas.height / 2 - paddleHeight / 2,

    width: paddleWidth,

    height: paddleHeight,

    speed: 6,

    color: opponentColor

};


/* =========================================================
   BALL
========================================================= */

const ball = {

    x: canvas.width / 2,

    y: canvas.height / 2,

    radius: 10,

    speed: 9,

    velocityX: 0,

    velocityY: 0

};


/* =========================================================
   BALL TRAIL
========================================================= */

const ballTrail = [];

const MAX_TRAIL_LENGTH = 12;


/* =========================================================
   INPUT
========================================================= */

const keys = {};


document.addEventListener("keydown", (event) => {

    keys[event.key.toLowerCase()] = true;


    if (
        event.code === "Space" &&
        running &&
        !countingDown
    ) {

        togglePause();

        event.preventDefault();
    }

});


document.addEventListener("keyup", (event) => {

    keys[event.key.toLowerCase()] = false;

});


/* =========================================================
   COLOR PICKER
========================================================= */

function createColorButtons(container, colors, selectedColor, onSelect) {

    container.innerHTML = "";


    colors.forEach((color) => {

        const button =
            document.createElement("button");

        button.className = "color-option";

        button.title = color.name;

        button.style.background = color.value;

        button.style.color = color.value;


        if (color.value === selectedColor) {

            button.classList.add("selected");

        }


        button.addEventListener("click", () => {

            onSelect(color.value);

        });


        container.appendChild(button);

    });

}


/* =========================================================
   UPDATE COLOR BUTTON STATES
========================================================= */

function updatePlayerColorPicker() {

    createColorButtons(
        colorGrid,
        playerColors,
        playerColor,
        (color) => {

            playerColor = color;

            player.color = color;

            updatePlayerColorPicker();

        }
    );

}


function updatePlayer2ColorPicker() {

    createColorButtons(
        player2ColorGrid,
        twoPlayerColors,
        player2Color,
        (color) => {

            /*
                Prevent Player 2 from selecting the
                exact same color as Player 1.
            */

            if (color === playerColor) {
                return;
            }

            player2Color = color;

            updatePlayer2ColorPicker();

        }
    );


    /*
        Visually disable Player 1's color.
    */

    [...player2ColorGrid.children].forEach(
        (button, index) => {

            const color =
                twoPlayerColors[index];

            if (color.value === playerColor) {

                button.classList.add("disabled");

            }

        }
    );

}


/* =========================================================
   MODE SELECTION
========================================================= */

document.querySelectorAll("[data-mode]").forEach((button) => {

    button.addEventListener("click", () => {

        gameMode =
            Number(button.dataset.mode);


        modeSelection.classList.add("hidden");


        if (gameMode === 1) {

            difficultySelection.classList.remove("hidden");

            overlayText.textContent =
                "Choose your AI difficulty.";

        }

        else {

            /*
                2P:
                Let Player 1 pick first.
            */

            showPlayer1ColorSelection();

        }

    });

});


/* =========================================================
   DIFFICULTY SELECTION
========================================================= */

document
    .querySelectorAll("[data-difficulty]")
    .forEach((button) => {

        button.addEventListener("click", () => {

            difficulty =
                button.dataset.difficulty;

            difficultySelection.classList.add("hidden");

            /*
                1P:
                Player chooses their color.
                AI will automatically be red.
            */

            showPlayer1ColorSelection();

        });

    });


/* =========================================================
   PLAYER 1 COLOR
========================================================= */

function showPlayer1ColorSelection() {

    playerColorSelection.classList.remove("hidden");

    player2ColorSelection.classList.add("hidden");

    overlayTitle.textContent =
        gameMode === 1
            ? "Choose Your Color"
            : "Player 1 — Choose Your Color";

    overlayText.textContent =
        gameMode === 1
            ? "The AI will always use red."
            : "Pick your paddle color.";

    updatePlayerColorPicker();

}


confirmPlayerColor.addEventListener("click", () => {

    player.color = playerColor;


    if (gameMode === 1) {

        /*
            AI is ALWAYS red.
        */

        opponent.color = redColor.value;

        playerColorSelection.classList.add("hidden");

        startGame();

        return;
    }


    /*
        2P:
        Move to Player 2 selection.
    */

    playerColorSelection.classList.add("hidden");

    player2ColorSelection.classList.remove("hidden");

    overlayTitle.textContent =
        "Player 2";

    overlayText.textContent =
        "Choose a different color.";

    /*
        Default Player 2 color:
        first available color.
    */

    if (!player2Color ||
        player2Color === playerColor) {

        player2Color =
            twoPlayerColors.find(
                color =>
                    color.value !== playerColor
            ).value;

    }

    updatePlayer2ColorPicker();

});


/* =========================================================
   PLAYER 2 START
========================================================= */

startMatchButton.addEventListener("click", () => {

    opponentColor = player2Color;

    opponent.color = player2Color;

    player2ColorSelection.classList.add("hidden");

    startGame();

});


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    playerScore = 0;
    opponentScore = 0;

    playerScoreElement.textContent = "0";
    opponentScoreElement.textContent = "0";


    player.y =
        canvas.height / 2 -
        player.height / 2;


    opponent.y =
        canvas.height / 2 -
        opponent.height / 2;


    player.color = playerColor;


    if (gameMode === 1) {

        opponent.color = redColor.value;

    }

    else {

        opponent.color = player2Color;

    }


    running = true;

    paused = false;

    pauseButton.textContent = "Pause";


    overlay.classList.add("hidden");


    resetBall();


    /*
        Start with a countdown.
    */

    startCountdown();

}


/* =========================================================
   COUNTDOWN
========================================================= */

async function startCountdown() {

    countingDown = true;

    ball.velocityX = 0;
    ball.velocityY = 0;


    const numbers = [
        "3",
        "2",
        "1",
        "GO!"
    ];


    for (const number of numbers) {

        if (!running || paused) {
            return;
        }


        countdownElement.textContent = number;

        countdownElement.classList.remove("hidden");


        /*
            Restart animation.
        */

        countdownElement.style.animation = "none";

        void countdownElement.offsetWidth;

        countdownElement.style.animation =
            "countdownPop 0.7s ease both";


        await wait(700);

    }


    countdownElement.classList.add("hidden");


    if (!running || paused) {
        return;
    }


    countingDown = false;


    serveBall();

}


function wait(ms) {

    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );

}


/* =========================================================
   RESET BALL
========================================================= */

function resetBall() {

    ball.x =
        canvas.width / 2;

    ball.y =
        canvas.height / 2;


    ball.velocityX = 0;
    ball.velocityY = 0;


    ballTrail.length = 0;

}


/* =========================================================
   SERVE BALL
========================================================= */

function serveBall() {

    ball.x =
        canvas.width / 2;

    ball.y =
        canvas.height / 2;


    ball.speed = 9;


    /*
        Random starting direction.
    */

    const direction =
        Math.random() < 0.5
            ? -1
            : 1;


    const angle =
        (Math.random() * 0.8 - 0.4);


    ball.velocityX =
        direction *
        ball.speed *
        Math.cos(angle);


    ball.velocityY =
        ball.speed *
        Math.sin(angle);


    ballTrail.length = 0;

}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function updatePlayer() {

    if (keys["w"]) {

        player.y -= player.speed;

    }


    if (keys["s"]) {

        player.y += player.speed;

    }


    player.y =
        Math.max(
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

    if (gameMode !== 1) {
        return;
    }


    const settings =
        difficulties[difficulty];


    /*
        IMPOSSIBLE AI

        Predict exactly where the ball will hit
        the AI paddle.

        The paddle is placed directly at the
        predicted collision point.

        This makes Impossible genuinely impossible
        to score against through normal ball movement.
    */

    if (difficulty === "impossible") {

        if (ball.velocityX > 0) {

            const distance =
                opponent.x - ball.x;


            const time =
                distance / ball.velocityX;


            let predictedY =
                ball.y +
                ball.velocityY * time;


            /*
                Reflect the predicted position
                against the top/bottom walls.
            */

            const usableHeight =
                canvas.height;


            while (
                predictedY < 0 ||
                predictedY > usableHeight
            ) {

                if (predictedY < 0) {

                    predictedY =
                        -predictedY;

                }

                else if (
                    predictedY > usableHeight
                ) {

                    predictedY =
                        usableHeight -
                        (predictedY - usableHeight);

                }

            }


            opponent.y =
                predictedY -
                opponent.height / 2;

        }

        else {

            /*
                When the ball is traveling away,
                return toward center.
            */

            opponent.y +=
                (
                    canvas.height / 2 -
                    opponent.height / 2 -
                    opponent.y
                ) * 0.08;

        }


        opponent.y =
            Math.max(
                0,
                Math.min(
                    canvas.height - opponent.height,
                    opponent.y
                )
            );


        return;

    }


    /*
        Normal AI.
    */

    let target =
        ball.y -
        opponent.height / 2;


    /*
        Add intentional error.
    */

    if (ball.velocityX > 0) {

        target +=
            Math.sin(
                ball.x * 0.01
            ) *
            settings.error;

    }


    /*
        Reaction factor.
    */

    const difference =
        target - opponent.y;


    opponent.y +=
        difference *
        0.055 *
        settings.reaction;


    /*
        Maximum AI movement speed.
    */

    if (
        Math.abs(difference) >
        settings.speed
    ) {

        opponent.y +=
            Math.sign(difference) *
            settings.speed;

    }


    opponent.y =
        Math.max(
            0,
            Math.min(
                canvas.height - opponent.height,
                opponent.y
            )
        );

}


/* =========================================================
   BALL TRAIL
========================================================= */

function updateTrail() {

    ballTrail.unshift({

        x: ball.x,

        y: ball.y,

        radius: ball.radius

    });


    if (
        ballTrail.length >
        MAX_TRAIL_LENGTH
    ) {

        ballTrail.pop();

    }

}


/* =========================================================
   DRAW TRAIL
========================================================= */

function drawTrail() {

    for (
        let i = ballTrail.length - 1;
        i >= 0;
        i--
    ) {

        const point =
            ballTrail[i];


        const progress =
            1 -
            i / ballTrail.length;


        const alpha =
            progress * 0.12;


        const radius =
            point.radius *
            (0.45 + progress * 0.45);


        ctx.beginPath();

        ctx.arc(
            point.x,
            point.y,
            radius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            `rgba(255,255,255,${alpha})`;

        ctx.fill();

    }

}


/* =========================================================
   BALL MOVEMENT
========================================================= */

function updateBall() {

    ball.x += ball.velocityX;

    ball.y += ball.velocityY;


    /*
        Top / bottom bounce.
    */

    if (
        ball.y - ball.radius <= 0 ||
        ball.y + ball.radius >= canvas.height
    ) {

        ball.velocityY *= -1;

        ball.y =
            Math.max(
                ball.radius,
                Math.min(
                    canvas.height - ball.radius,
                    ball.y
                )
            );

    }


    /*
        Player paddle collision.
    */

    if (
        ball.velocityX < 0 &&
        ball.x - ball.radius <=
            player.x + player.width &&
        ball.x + ball.radius >=
            player.x &&
        ball.y >= player.y &&
        ball.y <=
            player.y + player.height
    ) {

        hitPaddle(player, 1);

    }


    /*
        Opponent paddle collision.
    */

    if (
        ball.velocityX > 0 &&
        ball.x + ball.radius >=
            opponent.x &&
        ball.x - ball.radius <=
            opponent.x + opponent.width &&
        ball.y >= opponent.y &&
        ball.y <=
            opponent.y + opponent.height
    ) {

        hitPaddle(opponent, -1);

    }


    /*
        Player missed.
    */

    if (ball.x < -30) {

        opponentScore++;

        opponentScoreElement.textContent =
            opponentScore;

        nextPoint(-1);

    }


    /*
        Opponent missed.
    */

    if (
        ball.x >
        canvas.width + 30
    ) {

        playerScore++;

        playerScoreElement.textContent =
            playerScore;

        nextPoint(1);

    }

}


/* =========================================================
   PADDLE HIT
========================================================= */

function hitPaddle(paddle, direction) {

    /*
        Where on the paddle was the ball hit?

        -1 = top
         0 = center
         1 = bottom
    */

    const relativeHit =
        (
            ball.y -
            (
                paddle.y +
                paddle.height / 2
            )
        ) /
        (
            paddle.height / 2
        );


    const maxAngle =
        Math.PI / 3;


    const angle =
        relativeHit *
        maxAngle;


    ball.speed =
        Math.min(
            ball.speed + 0.45,
            18
        );


    ball.velocityX =
        direction *
        ball.speed *
        Math.cos(angle);


    ball.velocityY =
        ball.speed *
        Math.sin(angle);


    /*
        Prevent the ball from getting stuck
        inside the paddle.
    */

    if (direction === 1) {

        ball.x =
            paddle.x +
            paddle.width +
            ball.radius;

    }

    else {

        ball.x =
            paddle.x -
            ball.radius;

    }

}


/* =========================================================
   NEXT POINT
========================================================= */

async function nextPoint(direction) {

    if (playerScore >= 5) {

        endGame("You Win!");

        return;

    }


    if (opponentScore >= 5) {

        endGame(
            gameMode === 1
                ? "AI Wins!"
                : "Player 2 Wins!"
        );

        return;

    }


    resetBall();


    /*
        Small pause before the next serve.
    */

    await wait(500);


    if (!running || paused) {
        return;
    }


    startCountdown();

}


/* =========================================================
   DRAW BACKGROUND
========================================================= */

function drawCourt() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
        Court background.
    */

    const gradient =
        ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            50,
            canvas.width / 2,
            canvas.height / 2,
            canvas.width
        );


    gradient.addColorStop(
        0,
        "#10253b"
    );

    gradient.addColorStop(
        1,
        "#030911"
    );


    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
        Center line.
    */

    ctx.setLineDash([
        12,
        18
    ]);

    ctx.strokeStyle =
        "rgba(255,255,255,0.12)";

    ctx.lineWidth = 3;

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
        Center circle.
    */

    ctx.beginPath();

    ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        75,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        "rgba(255,255,255,0.08)";

    ctx.lineWidth = 3;

    ctx.stroke();

}


/* =========================================================
   DRAW PADDLE
========================================================= */

function drawPaddle(paddle) {

    /*
        Soft glow.
    */

    ctx.shadowColor =
        paddle.color;

    ctx.shadowBlur = 18;


    /*
        Main paddle.
    */

    ctx.fillStyle =
        paddle.color;


    ctx.beginPath();

    ctx.roundRect(
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height,
        9
    );

    ctx.fill();


    /*
        Reset shadow.
    */

    ctx.shadowBlur = 0;

}


/* =========================================================
   DRAW BALL
========================================================= */

function drawBall() {

    ctx.shadowColor =
        "rgba(255,255,255,0.8)";

    ctx.shadowBlur = 18;


    ctx.beginPath();

    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );


    ctx.fillStyle = "#FFFFFF";

    ctx.fill();


    ctx.shadowBlur = 0;

}


/* =========================================================
   DRAW
========================================================= */

function draw() {

    drawCourt();

    drawTrail();

    drawPaddle(player);

    drawPaddle(opponent);

    drawBall();

}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop() {

    if (
        running &&
        !paused &&
        !countingDown
    ) {

        updatePlayer();

        updateAI();

        updateBall();

        updateTrail();

    }


    draw();


    requestAnimationFrame(gameLoop);

}


/* =========================================================
   PAUSE
========================================================= */

function togglePause() {

    if (!running || countingDown) {
        return;
    }


    paused = !paused;


    if (paused) {

        pauseButton.textContent =
            "Resume";


        overlay.classList.remove("hidden");

        overlayTitle.textContent =
            "Paused";

        overlayText.textContent =
            "Take a breather.";

        modeSelection.classList.add("hidden");

        difficultySelection.classList.add("hidden");

        playerColorSelection.classList.add("hidden");

        player2ColorSelection.classList.add("hidden");

        startButton.classList.remove("hidden");

        startButton.textContent =
            "Resume";

    }

    else {

        overlay.classList.add("hidden");

        startButton.classList.add("hidden");

        pauseButton.textContent =
            "Pause";

    }

}


pauseButton.addEventListener(
    "click",
    togglePause
);


/* =========================================================
   END GAME
========================================================= */

function endGame(message) {

    running = false;

    paused = false;

    countingDown = false;


    countdownElement.classList.add("hidden");


    overlay.classList.remove("hidden");


    overlayTitle.textContent =
        message;


    overlayText.textContent =
        `Final Score: ${playerScore} - ${opponentScore}`;


    modeSelection.classList.add("hidden");

    difficultySelection.classList.add("hidden");

    playerColorSelection.classList.add("hidden");

    player2ColorSelection.classList.add("hidden");


    startButton.classList.remove("hidden");

    startButton.textContent =
        "Play Again";


    pauseButton.textContent =
        "Pause";

}


/* =========================================================
   PLAY AGAIN
========================================================= */

startButton.addEventListener("click", () => {

    /*
        If this is actually the pause screen,
        resume instead of reopening setup.
    */

    if (paused) {

        paused = false;

        overlay.classList.add("hidden");

        startButton.classList.add("hidden");

        pauseButton.textContent =
            "Pause";

        return;

    }


    startButton.classList.add("hidden");

    modeSelection.classList.remove("hidden");

    difficultySelection.classList.add("hidden");

    playerColorSelection.classList.add("hidden");

    player2ColorSelection.classList.add("hidden");


    overlayTitle.textContent =
        "Pong";

    overlayText.textContent =
        "Choose how you want to play.";

});


/* =========================================================
   INITIALIZE
========================================================= */

player.color =
    playerColor;

opponent.color =
    redColor.value;

draw();

gameLoop();
