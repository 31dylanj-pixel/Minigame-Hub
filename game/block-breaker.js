/* =========================================================
   BLOCK BREAKER
========================================================= */

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


/* =========================================================
   CANVAS
========================================================= */

const WIDTH = canvas.width;
const HEIGHT = canvas.height;


/* =========================================================
   COLORS
========================================================= */

const BLOCK_COLORS = [
    "#FF3B4A",
    "#FFD700",
    "#32CD32",
    "#4169E1"
];


/* =========================================================
   DOM
========================================================= */

const scoreDisplay =
    document.getElementById("score");

const levelDisplay =
    document.getElementById("level");

const livesDisplay =
    document.getElementById("lives");

const powerupName =
    document.getElementById("powerupName");

const powerupTimer =
    document.getElementById("powerupTimer");

const timerFill =
    document.getElementById("timerFill");

const gameOverlay =
    document.getElementById("gameOverlay");

const finalScore =
    document.getElementById("finalScore");

const restartButton =
    document.getElementById("restartButton");

const levelMessage =
    document.getElementById("levelMessage");


/* =========================================================
   GAME STATE
========================================================= */

let score = 0;

let level = 1;

let lives = 3;

let gameOver = false;

let gameRunning = true;

let levelTransition = false;

let lastTime = 0;

let levelTimer = 0;


/* =========================================================
   INPUT
========================================================= */

const keys = {
    left: false,
    right: false
};


/* =========================================================
   PADDLE
========================================================= */

const paddle = {

    width: 150,

    normalWidth: 150,

    height: 18,

    x: WIDTH / 2 - 75,

    y: HEIGHT - 55,

    targetX: WIDTH / 2 - 75,

    speed: 1000,

    extendActive: false,

    extendDuration: 15000,

    extendRemaining: 0
};


/* =========================================================
   BALLS
========================================================= */

let balls = [];


/* =========================================================
   POWERUPS
========================================================= */

let powerups = [];


/* =========================================================
   PARTICLES
========================================================= */

let particles = [];

/* =========================================================
   COUNTDOWN
========================================================= */

let countdownActive = false;
let countdownValue = 3;

function startCountdown(callback) {

    countdownActive = true;
    countdownValue = 3;

    const countdownInterval = setInterval(() => {

        countdownValue--;

        if (countdownValue <= 0) {

            countdownValue = "GO!";

        }

        if (countdownValue === "GO!") {

            setTimeout(() => {

                clearInterval(countdownInterval);

                countdownActive = false;

                callback();

            }, 450);
        }

    }, 800);
}

/* =========================================================
   BLOCKS
========================================================= */

let blocks = [];

const BLOCK_WIDTH = 105;

const BLOCK_HEIGHT = 32;

const BLOCK_GAP = 10;

const BLOCK_ROWS = 4;

const BLOCK_COLS = 10;

const BLOCK_START_X =
    (WIDTH -
        (
            BLOCK_COLS * BLOCK_WIDTH +
            (BLOCK_COLS - 1) * BLOCK_GAP
        )
    ) / 2;

const BLOCK_START_Y = 70;


/* =========================================================
   BLOCK
========================================================= */

function createBlock(row, col) {

    let armor = 0;

    /*
        Level 3+
        can spawn metallic armor.

        Level 5+
        can spawn 3-hit armor.
    */

    if (level >= 3 && Math.random() < 0.18) {

        armor = 2;

        if (level >= 5 && Math.random() < 0.45) {

            armor = 3;
        }
    }


    let special = null;

    /*
        Special blocks begin appearing
        as the game gets harder.
    */

    if (level >= 2 && Math.random() < 0.12) {

        const roll = Math.random();

        if (roll < 0.34) {

            special = "extend";

        } else if (roll < 0.67) {

            special = "multi";

        } else {

            special = "explosion";
        }
    }


    return {

        row,

        col,

        x:
            BLOCK_START_X +
            col * (BLOCK_WIDTH + BLOCK_GAP),

        y:
            BLOCK_START_Y +
            row * (BLOCK_HEIGHT + BLOCK_GAP),

        width: BLOCK_WIDTH,

        height: BLOCK_HEIGHT,

        color:
            BLOCK_COLORS[
                Math.floor(
                    Math.random() *
                    BLOCK_COLORS.length
                )
            ],

        armor,

        special,

        alive: true
    };
}


/* =========================================================
   CREATE LEVEL
========================================================= */

function createLevel() {

    blocks = [];

    for (let row = 0; row < BLOCK_ROWS; row++) {

        for (
            let col = 0;
            col < BLOCK_COLS;
            col++
        ) {

            blocks.push(
                createBlock(row, col)
            );
        }
    }
}


/* =========================================================
   CREATE BALL
========================================================= */

function createBall(
    x = WIDTH / 2,
    y = HEIGHT - 100,
    angle = null,
    color = "#FFFFFF"
) {

    const speed =
        390 +
        (level - 1) * 28;

    if (angle === null) {

        angle =
            (
                Math.random() * 0.9
                + 0.15
            )
            *
            (
                Math.random() > 0.5
                    ? 1
                    : -1
            );
    }

    return {

        x,

        y,

        radius: 8,

        vx:
            Math.sin(angle) *
            speed,

        vy:
            -Math.cos(angle) *
            speed,

        color,

        trail: [],

        active: true
    };
}


/* =========================================================
   RESET BALL
========================================================= */

function resetBall() {

    balls = [
        createBall()
    ];
}


/* =========================================================
   START
========================================================= */

function startGame() {

    score = 0;

    level = 1;

    lives = 3;

    gameOver = false;

    gameRunning = true;

    levelTransition = false;

    countdownActive = false;

    countdownValue = 3;

    paddle.normalWidth = 150;

    paddle.width = 150;

    paddle.extendActive = false;

    paddle.extendRemaining = 0;

    paddle.x =
        WIDTH / 2 -
        paddle.width / 2;

    paddle.targetX =
        paddle.x;

    powerups = [];

    particles = [];

    createLevel();

    resetBall();

    hideOverlay();

    updateHUD();

    showLevelMessage();

    lastTime = performance.now();

    requestAnimationFrame(gameLoop);

    /*
        Start the round with a countdown.
    */

    startCountdown(() => {

        countdownActive = false;

    });
}

/* =========================================================
   GAME OVER
========================================================= */

function endGame() {

    gameOver = true;

    gameRunning = false;

    finalScore.textContent =
        score.toLocaleString();

    gameOverlay.classList.remove(
        "hidden"
    );
}


/* =========================================================
   NEXT LEVEL
========================================================= */

function nextLevel() {

    if (levelTransition) {
        return;
    }

    levelTransition = true;

    level++;

    showLevelMessage();

    setTimeout(() => {

        createLevel();

        balls = [
            createBall(
                WIDTH / 2,
                HEIGHT - 100
            )
        ];

        levelTransition = false;

        /*
            Countdown before the
            new level begins.
        */

        startCountdown(() => {

            countdownActive = false;

        });

    }, 800);
}

/* =========================================================
   LEVEL MESSAGE
========================================================= */

function showLevelMessage() {

    levelMessage.textContent =
        `Level ${level}`;

    levelMessage.classList.add("show");

    setTimeout(() => {

        levelMessage.classList.remove(
            "show"
        );

    }, 900);
}


/* =========================================================
   UPDATE HUD
========================================================= */

function updateHUD() {

    scoreDisplay.textContent =
        score.toLocaleString();

    levelDisplay.textContent =
        level;

    livesDisplay.textContent =
        lives;
}


/* =========================================================
   POWERUP STATUS
========================================================= */

function updatePowerupStatus() {

    if (
        !paddle.extendActive ||
        paddle.extendRemaining <= 0
    ) {

        powerupName.textContent =
            "No Powerup";

        powerupTimer.textContent =
            "";

        timerFill.style.width =
            "0%";

        return;
    }


    const seconds =
        paddle.extendRemaining / 1000;

    powerupName.textContent =
        "Paddle Extend";

    powerupTimer.textContent =
        `${seconds.toFixed(1)}s`;

    const percent =
        (
            paddle.extendRemaining /
            paddle.extendDuration
        ) * 100;

    timerFill.style.width =
        `${percent}%`;
}


/* =========================================================
   ACTIVATE EXTEND
========================================================= */

function activateExtend() {

    paddle.extendActive = true;

    paddle.extendRemaining =
        paddle.extendDuration;

    paddle.width =
        paddle.normalWidth * 3;

    paddle.x =
        paddle.targetX -
        paddle.width / 2;

    keepPaddleInside();
}


/* =========================================================
   UPDATE EXTEND
========================================================= */

function updateExtend(delta) {

    if (!paddle.extendActive) {
        return;
    }

    paddle.extendRemaining -=
        delta * 1000;

    if (
        paddle.extendRemaining <= 0
    ) {

        paddle.extendRemaining = 0;

        paddle.extendActive = false;

        paddle.width =
            paddle.normalWidth;

        paddle.x =
            paddle.targetX -
            paddle.width / 2;

        keepPaddleInside();
    }

    updatePowerupStatus();
}


/* =========================================================
   MULTI BALL
========================================================= */

function activateMultiBall(
    sourceColor
) {

    /*
        The original ball stays white.

        New balls inherit the color
        of the block that spawned
        the powerup.
    */

    const source =
        balls.find(
            ball => ball.active
        );

    if (!source) {
        return;
    }


    const baseSpeed =
        Math.sqrt(
            source.vx * source.vx +
            source.vy * source.vy
        );


    const angles = [
        -0.55,
        0.55
    ];


    angles.forEach(angle => {

        const ball =
            createBall(
                source.x,
                source.y,
                angle,
                sourceColor
            );

        const direction =
            source.vy < 0
                ? -1
                : 1;

        ball.vy =
            Math.abs(ball.vy) *
            direction;

        ball.vx =
            Math.cos(angle) *
            baseSpeed;

        balls.push(ball);
    });
}


/* =========================================================
   SPAWN POWERUP
========================================================= */

function spawnPowerup(
    block
) {

    if (!block.special) {
        return;
    }


    powerups.push({

        x:
            block.x +
            block.width / 2,

        y:
            block.y +
            block.height / 2,

        width: 34,

        height: 20,

        vy: 150,

        type:
            block.special,

        color:
            block.color,

        active: true
    });
}


/* =========================================================
   POWERUP ICON
========================================================= */

function getPowerupIcon(type) {

    if (type === "extend") {
        return "↔";
    }

    if (type === "multi") {
        return "●●";
    }

    if (type === "explosion") {
        return "💥";
    }

    return "";
}


/* =========================================================
   UPDATE POWERUPS
========================================================= */

function updatePowerups(delta) {

    for (
        let i = powerups.length - 1;
        i >= 0;
        i--
    ) {

        const powerup =
            powerups[i];

        if (!powerup.active) {
            continue;
        }


        powerup.y +=
            powerup.vy * delta;


        /*
            Paddle collision
        */

        if (

            powerup.y +
            powerup.height / 2 >=
            paddle.y &&

            powerup.y -
            powerup.height / 2 <=
            paddle.y +
            paddle.height &&

            powerup.x >=
            paddle.x &&

            powerup.x <=
            paddle.x +
            paddle.width

        ) {

            activatePowerup(
                powerup
            );

            powerup.active = false;

            powerups.splice(i, 1);

            continue;
        }


        /*
            Remove when it falls
            off the screen.
        */

        if (
            powerup.y >
            HEIGHT + 50
        ) {

            powerups.splice(i, 1);
        }
    }
}


/* =========================================================
   ACTIVATE POWERUP
========================================================= */

function activatePowerup(
    powerup
) {

    if (
        powerup.type ===
        "extend"
    ) {

        activateExtend();

    } else if (
        powerup.type ===
        "multi"
    ) {

        activateMultiBall(
            powerup.color
        );

    } else if (
        powerup.type ===
        "explosion"
    ) {

        /*
            Explosion itself is already
            triggered when the special
            block breaks.

            The falling explosion powerup
            is intentionally not needed.
        */
    }
}


/* =========================================================
   PADDLE INPUT
========================================================= */

function updatePaddle(delta) {

    if (keys.left) {

        paddle.targetX -=
            paddle.speed * delta;
    }

    if (keys.right) {

        paddle.targetX +=
            paddle.speed * delta;
    }


    const desiredX =
        paddle.targetX -
        paddle.width / 2;


    /*
        Smooth movement
    */

    paddle.x +=
        (
            desiredX -
            paddle.x
        ) *
        Math.min(
            1,
            delta * 18
        );


    keepPaddleInside();
}


/* =========================================================
   KEEP PADDLE INSIDE
========================================================= */

function keepPaddleInside() {

    if (paddle.x < 0) {

        paddle.x = 0;
    }

    if (
        paddle.x +
        paddle.width >
        WIDTH
    ) {

        paddle.x =
            WIDTH -
            paddle.width;
    }

    paddle.targetX =
        paddle.x +
        paddle.width / 2;
}


/* =========================================================
   BALL UPDATE
========================================================= */

function updateBalls(delta) {

    for (
        let i = balls.length - 1;
        i >= 0;
        i--
    ) {

        const ball =
            balls[i];


        if (!ball.active) {
            continue;
        }


        /*
            Trail
        */

        ball.trail.push({
            x: ball.x,
            y: ball.y
        });

        if (
            ball.trail.length > 10
        ) {

            ball.trail.shift();
        }


        ball.x +=
            ball.vx * delta;

        ball.y +=
            ball.vy * delta;


        /*
            Left wall
        */

        if (
            ball.x -
            ball.radius <= 0
        ) {

            ball.x =
                ball.radius;

            ball.vx =
                Math.abs(ball.vx);
        }


        /*
            Right wall
        */

        if (
            ball.x +
            ball.radius >=
            WIDTH
        ) {

            ball.x =
                WIDTH -
                ball.radius;

            ball.vx =
                -Math.abs(ball.vx);
        }


        /*
            Top wall
        */

        if (
            ball.y -
            ball.radius <= 0
        ) {

            ball.y =
                ball.radius;

            ball.vy =
                Math.abs(ball.vy);
        }


        /*
            Paddle
        */

        if (
            ball.vy > 0 &&

            ball.y +
            ball.radius >=
            paddle.y &&

            ball.y -
            ball.radius <=
            paddle.y +
            paddle.height &&

            ball.x >=
            paddle.x &&

            ball.x <=
            paddle.x +
            paddle.width
        ) {

            ball.y =
                paddle.y -
                ball.radius;


            /*
                Change bounce angle
                based on where the ball
                hit the paddle.
            */

            const hit =
                (
                    ball.x -
                    (
                        paddle.x +
                        paddle.width / 2
                    )
                )
                /
                (
                    paddle.width / 2
                );


            const angle =
                hit * 1.05;


            const speed =
                Math.sqrt(
                    ball.vx *
                    ball.vx +
                    ball.vy *
                    ball.vy
                );


            ball.vx =
                Math.sin(angle) *
                speed;

            ball.vy =
                -Math.cos(angle) *
                speed;


            createParticles(
                ball.x,
                paddle.y,
                ball.color,
                5
            );
        }


        /*
            Blocks
        */

        checkBlockCollisions(
            ball
        );


        /*
            Bottom
        */

        if (
            ball.y -
            ball.radius >
            HEIGHT
        ) {

            ball.active = false;

            balls.splice(i, 1);

            /*
                IMPORTANT:
                Losing a ball only costs
                a life when it was the
                final active ball.
            */

            if (
                balls.length === 0
            ) {

                loseLife();
            }
        }
    }
}


/* =========================================================
   BLOCK COLLISIONS
========================================================= */

function checkBlockCollisions(
    ball
) {

    for (
        let i = 0;
        i < blocks.length;
        i++
    ) {

        const block =
            blocks[i];


        if (!block.alive) {
            continue;
        }


        if (
            ball.x +
            ball.radius <
            block.x ||

            ball.x -
            ball.radius >
            block.x +
            block.width ||

            ball.y +
            ball.radius <
            block.y ||

            ball.y -
            ball.radius >
            block.y +
            block.height
        ) {

            continue;
        }


        /*
            Bounce based on the
            nearest side.
        */

        const overlapLeft =
            ball.x +
            ball.radius -
            block.x;

        const overlapRight =
            block.x +
            block.width -
            (
                ball.x -
                ball.radius
            );

        const overlapTop =
            ball.y +
            ball.radius -
            block.y;

        const overlapBottom =
            block.y +
            block.height -
            (
                ball.y -
                ball.radius
            );


        const minOverlap =
            Math.min(
                overlapLeft,
                overlapRight,
                overlapTop,
                overlapBottom
            );


        if (
            minOverlap ===
            overlapLeft
        ) {

            ball.vx =
                -Math.abs(ball.vx);

        } else if (
            minOverlap ===
            overlapRight
        ) {

            ball.vx =
                Math.abs(ball.vx);

        } else if (
            minOverlap ===
            overlapTop
        ) {

            ball.vy =
                -Math.abs(ball.vy);

        } else {

            ball.vy =
                Math.abs(ball.vy);
        }


        hitBlock(block);

        break;
    }
}


/* =========================================================
   HIT BLOCK
========================================================= */

function hitBlock(block) {

    createParticles(
        block.x +
        block.width / 2,

        block.y +
        block.height / 2,

        block.color,

        7
    );


    /*
        Armor
    */

    if (block.armor > 1) {

        block.armor--;

        score += 5;

        updateHUD();

        return;
    }


    /*
        Block destroyed
    */

    block.alive = false;

    score += 10;


    /*
        Special behavior
    */

    if (
        block.special ===
        "extend"
    ) {

        spawnPowerup(block);

    } else if (
        block.special ===
        "multi"
    ) {

        spawnPowerup(block);

    } else if (
        block.special ===
        "explosion"
    ) {

        explodeAround(block);
    }


    updateHUD();


    /*
        Check if all blocks
        are destroyed.
    */

    if (
        blocks.every(
            block =>
                !block.alive
        )
    ) {

        nextLevel();
    }
}


/* =========================================================
   EXPLOSION
========================================================= */

function explodeAround(
    centerBlock
) {

    createParticles(
        centerBlock.x +
        centerBlock.width / 2,

        centerBlock.y +
        centerBlock.height / 2,

        "#FFD700",

        35
    );


    /*
        Destroy all adjacent
        blocks, including diagonals.

        The center block itself
        is already destroyed.
    */

    for (
        const block of blocks
    ) {

        if (!block.alive) {
            continue;
        }


        const rowDistance =
            Math.abs(
                block.row -
                centerBlock.row
            );

        const colDistance =
            Math.abs(
                block.col -
                centerBlock.col
            );


        if (
            rowDistance <= 1 &&
            colDistance <= 1
        ) {

            block.alive = false;

            score += 10;

            createParticles(
                block.x +
                block.width / 2,

                block.y +
                block.height / 2,

                block.color,

                5
            );
        }
    }


    updateHUD();
}


/* =========================================================
   LOSE LIFE
========================================================= */

function loseLife() {

    lives--;

    updateHUD();


    if (lives <= 0) {

        endGame();

        return;
    }


    /*
        Reset paddle and ball.
    */

    paddle.width =
        paddle.extendActive
            ? paddle.normalWidth * 3
            : paddle.normalWidth;

    paddle.x =
        WIDTH / 2 -
        paddle.width / 2;

    paddle.targetX =
        WIDTH / 2;


    resetBall();
}


/* =========================================================
   PARTICLES
========================================================= */

function createParticles(
    x,
    y,
    color,
    count
) {

    for (
        let i = 0;
        i < count;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI *
            2;

        const speed =
            50 +
            Math.random() *
            180;

        particles.push({

            x,

            y,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            life:
                0.35 +
                Math.random() * 0.3,

            maxLife:
                0.65,

            size:
                2 +
                Math.random() * 3,

            color
        });
    }
}


/* =========================================================
   UPDATE PARTICLES
========================================================= */

function updateParticles(delta) {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];


        particle.x +=
            particle.vx *
            delta;

        particle.y +=
            particle.vy *
            delta;

        particle.vy +=
            250 *
            delta;

        particle.life -=
            delta;


        if (
            particle.life <= 0
        ) {

            particles.splice(
                i,
                1
            );
        }
    }
}


/* =========================================================
   DRAW BACKGROUND
========================================================= */

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            HEIGHT
        );

    gradient.addColorStop(
        0,
        "#071421"
    );

    gradient.addColorStop(
        1,
        "#03080f"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    /*
        Subtle grid
    */

    ctx.strokeStyle =
        "rgba(255,255,255,0.025)";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x < WIDTH;
        x += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            HEIGHT
        );

        ctx.stroke();
    }


    for (
        let y = 0;
        y < HEIGHT;
        y += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            WIDTH,
            y
        );

        ctx.stroke();
    }
}


/* =========================================================
   DRAW BLOCKS
========================================================= */

function drawBlocks() {

    for (
        const block of blocks
    ) {

        if (!block.alive) {
            continue;
        }


        ctx.save();


        /*
            Base block
        */

        ctx.fillStyle =
            block.color;

        roundRect(
            ctx,
            block.x,
            block.y,
            block.width,
            block.height,
            7
        );

        ctx.fill();


        /*
            Slight glass highlight
        */

        const highlight =
            ctx.createLinearGradient(
                block.x,
                block.y,
                block.x,
                block.y +
                block.height
            );

        highlight.addColorStop(
            0,
            "rgba(255,255,255,0.20)"
        );

        highlight.addColorStop(
            0.45,
            "rgba(255,255,255,0)"
        );

        highlight.addColorStop(
            1,
            "rgba(0,0,0,0.16)"
        );

        ctx.fillStyle =
            highlight;

        roundRect(
            ctx,
            block.x,
            block.y,
            block.width,
            block.height,
            7
        );

        ctx.fill();


        /*
            Metallic armor
        */

        if (
            block.armor >= 2
        ) {

            const metallic =
                ctx.createLinearGradient(
                    block.x,
                    block.y,
                    block.x +
                    block.width,
                    block.y +
                    block.height
                );

            metallic.addColorStop(
                0,
                "rgba(255,255,255,0.55)"
            );

            metallic.addColorStop(
                0.22,
                "rgba(190,200,210,0.30)"
            );

            metallic.addColorStop(
                0.48,
                "rgba(255,255,255,0.08)"
            );

            metallic.addColorStop(
                0.72,
                "rgba(70,80,95,0.35)"
            );

            metallic.addColorStop(
                1,
                "rgba(255,255,255,0.25)"
            );

            ctx.fillStyle =
                metallic;

            roundRect(
                ctx,
                block.x,
                block.y,
                block.width,
                block.height,
                7
            );

            ctx.fill();


            ctx.strokeStyle =
                "rgba(230,240,250,0.65)";

            ctx.lineWidth = 2;

            roundRect(
                ctx,
                block.x + 1,
                block.y + 1,
                block.width - 2,
                block.height - 2,
                6
            );

            ctx.stroke();
        }


        /*
            Diagonal stripes
            = 3-hit armor
        */

        if (
            block.armor >= 3
        ) {

            ctx.save();

            ctx.beginPath();

            ctx.rect(
                block.x,
                block.y,
                block.width,
                block.height
            );

            ctx.clip();

            ctx.strokeStyle =
                "rgba(255,255,255,0.32)";

            ctx.lineWidth = 6;

            for (
                let x =
                    block.x -
                    block.height;

                x <
                    block.x +
                    block.width +
                    block.height;

                x += 15
            ) {

                ctx.beginPath();

                ctx.moveTo(
                    x,
                    block.y +
                    block.height
                );

                ctx.lineTo(
                    x +
                    block.height,
                    block.y
                );

                ctx.stroke();
            }

            ctx.restore();
        }


        /*
            Special icon
        */

        if (block.special) {

            drawPowerupIcon(
                block
            );
        }


        ctx.restore();
    }
}


/* =========================================================
   DRAW POWERUP ICON
========================================================= */

function drawPowerupIcon(
    block
) {

    const icon =
        getPowerupIcon(
            block.special
        );


    /*
        IMPORTANT:
        The icon is centered
        directly inside the block.
    */

    const centerX =
        block.x +
        block.width / 2;

    const centerY =
        block.y +
        block.height / 2;


    ctx.save();

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.font =
        block.special === "multi"
            ? "700 15px Montserrat"
            : "700 20px Montserrat";


    ctx.shadowColor =
        "rgba(0,0,0,0.5)";

    ctx.shadowBlur = 4;

    ctx.fillStyle =
        "#FFFFFF";

    ctx.fillText(
        icon,
        centerX,
        centerY
    );

    ctx.restore();
}


/* =========================================================
   DRAW POWERUPS
========================================================= */

function drawPowerups() {

    for (
        const powerup of powerups
    ) {

        ctx.save();


        ctx.translate(
            powerup.x,
            powerup.y
        );


        ctx.fillStyle =
            powerup.color;

        ctx.shadowColor =
            powerup.color;

        ctx.shadowBlur = 14;


        roundRect(
            ctx,
            -17,
            -10,
            34,
            20,
            7
        );

        ctx.fill();


        ctx.shadowBlur = 0;

        ctx.fillStyle =
            "#FFFFFF";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.font =
            powerup.type === "multi"
                ? "700 13px Montserrat"
                : "700 17px Montserrat";

        ctx.fillText(
            getPowerupIcon(
                powerup.type
            ),
            0,
            1
        );


        ctx.restore();
    }
}


/* =========================================================
   DRAW PADDLE
========================================================= */

function drawPaddle() {

    ctx.save();


    const gradient =
        ctx.createLinearGradient(
            paddle.x,
            paddle.y,
            paddle.x +
            paddle.width,
            paddle.y
        );

    gradient.addColorStop(
        0,
        "#38BDF8"
    );

    gradient.addColorStop(
        0.5,
        "#FFFFFF"
    );

    gradient.addColorStop(
        1,
        "#4169E1"
    );


    ctx.fillStyle =
        gradient;

    ctx.shadowColor =
        "rgba(56,189,248,0.5)";

    ctx.shadowBlur =
        paddle.extendActive
            ? 22
            : 12;


    roundRect(
        ctx,
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height,
        9
    );

    ctx.fill();


    ctx.restore();
}


/* =========================================================
   DRAW BALLS
========================================================= */

function drawBalls() {

    for (
        const ball of balls
    ) {

        if (!ball.active) {
            continue;
        }


        /*
            Trail
        */

        for (
            let i = 0;
            i < ball.trail.length;
            i++
        ) {

            const point =
                ball.trail[i];

            const alpha =
                (
                    i /
                    ball.trail.length
                ) * 0.22;

            const size =
                ball.radius *
                (
                    0.35 +
                    i /
                    ball.trail.length *
                    0.45
                );


            ctx.beginPath();

            ctx.arc(
                point.x,
                point.y,
                size,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                ball.color === "#FFFFFF"
                    ? `rgba(255,255,255,${alpha})`
                    : hexToRGBA(
                        ball.color,
                        alpha
                    );

            ctx.fill();
        }


        /*
            Ball glow
        */

        ctx.beginPath();

        ctx.arc(
            ball.x,
            ball.y,
            ball.radius,
            0,
            Math.PI * 2
        );

        ctx.shadowColor =
            ball.color;

        ctx.shadowBlur = 18;

        ctx.fillStyle =
            ball.color;

        ctx.fill();


        ctx.shadowBlur = 0;
    }
}


/* =========================================================
   DRAW PARTICLES
========================================================= */

function drawParticles() {

    for (
        const particle of particles
    ) {

        const alpha =
            Math.max(
                0,
                particle.life /
                particle.maxLife
            );


        ctx.globalAlpha =
            alpha;

        ctx.fillStyle =
            particle.color;

        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.globalAlpha = 1;
}


/* =========================================================
   ROUND RECT
========================================================= */

function roundRect(
    context,
    x,
    y,
    width,
    height,
    radius
) {

    context.beginPath();

    context.roundRect(
        x,
        y,
        width,
        height,
        radius
    );
}


/* =========================================================
   HEX → RGBA
========================================================= */

function hexToRGBA(
    hex,
    alpha
) {

    const value =
        hex.replace(
            "#",
            ""
        );

    const r =
        parseInt(
            value.substring(0, 2),
            16
        );

    const g =
        parseInt(
            value.substring(2, 4),
            16
        );

    const b =
        parseInt(
            value.substring(4, 6),
            16
        );

    return `
        rgba(
            ${r},
            ${g},
            ${b},
            ${alpha}
        )
    `;
}


/* =========================================================
   DRAW
========================================================= */

function draw() {

    drawBackground();

    drawBlocks();

    drawPowerups();

    drawPaddle();

    drawBalls();

    drawParticles();


    /*
        COUNTDOWN OVERLAY
    */

    if (countdownActive) {

        ctx.save();

        /*
            Darken the game slightly
            while counting down.
        */

        ctx.fillStyle =
            "rgba(0, 0, 0, 0.42)";

        ctx.fillRect(
            0,
            0,
            WIDTH,
            HEIGHT
        );


        /*
            Countdown number
        */

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.font =
            '900 110px "Montserrat", sans-serif';

        ctx.fillStyle =
            "#FFFFFF";

        ctx.shadowColor =
            "rgba(255,255,255,0.55)";

        ctx.shadowBlur =
            30;


        ctx.fillText(
            countdownValue,
            WIDTH / 2,
            HEIGHT / 2
        );


        ctx.restore();
    }
}

/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(timestamp) {

    if (
        gameOver
    ) {

        draw();

        return;
    }


    const delta =
        Math.min(
            0.025,
            (timestamp - lastTime) /
            1000
        );

    lastTime =
        timestamp;


    updatePaddle(
       delta
    );
   
    updateExtend(
       delta
    );
   
    if (!countdownActive) {
   
       updateBalls(
           delta
       );
   
       updatePowerups(
           delta
       );
    }
   
   updateParticles(
       delta
   );

    draw();


    requestAnimationFrame(
        gameLoop
    );
}


/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            keys.left = true;

            event.preventDefault();
        }


        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            keys.right = true;

            event.preventDefault();
        }
    }
);


window.addEventListener(
    "keyup",
    event => {

        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            keys.left = false;
        }


        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            keys.right = false;
        }
    }
);


/* =========================================================
   MOUSE
========================================================= */

canvas.addEventListener(
    "mousemove",
    event => {

        const rect =
            canvas.getBoundingClientRect();

        const scaleX =
            WIDTH /
            rect.width;

        const mouseX =
            (
                event.clientX -
                rect.left
            ) *
            scaleX;


        paddle.targetX =
            mouseX;
    }
);


/* =========================================================
   TOUCH
========================================================= */

canvas.addEventListener(
    "touchmove",
    event => {

        event.preventDefault();

        const rect =
            canvas.getBoundingClientRect();

        const scaleX =
            WIDTH /
            rect.width;

        const touchX =
            (
                event.touches[0].clientX -
                rect.left
            ) *
            scaleX;


        paddle.targetX =
            touchX;

    },
    {
        passive: false
    }
);


/* =========================================================
   RESTART
========================================================= */

restartButton.addEventListener(
    "click",
    () => {

        startGame();
    }
);


/* =========================================================
   OVERLAY
========================================================= */

function hideOverlay() {

    gameOverlay.classList.add(
        "hidden"
    );
}


/* =========================================================
   INITIALIZE
========================================================= */

startGame();
