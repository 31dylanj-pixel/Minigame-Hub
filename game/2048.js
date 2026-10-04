/* =========================================================
   2048
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const tileContainer =
    document.getElementById("tileContainer");

const scoreElement =
    document.getElementById("score");

const bestScoreElement =
    document.getElementById("bestScore");

const newGameButton =
    document.getElementById("newGameButton");

const gameOverOverlay =
    document.getElementById("gameOverOverlay");

const gameOverNewGame =
    document.getElementById("gameOverNewGame");

const finalScore =
    document.getElementById("finalScore");

const winOverlay =
    document.getElementById("winOverlay");

const confirmOverlay =
    document.getElementById("confirmOverlay");

const continueButton =
    document.getElementById("continueButton");

const doneButton =
    document.getElementById("doneButton");

const exitButton =
    document.getElementById("exitButton");

const cancelButton =
    document.getElementById("cancelButton");


/* =========================================================
   GAME STATE
========================================================= */

const SIZE = 4;

let board = [];

let score = 0;

let bestScore =
    Number(
        localStorage.getItem(
            "minigamehub-2048-best"
        )
    ) || 0;


/*
    Prevent the 2048 popup from appearing again
    after the player chooses to continue.
*/

let hasReached2048 = false;

let gameEnded = false;


/* =========================================================
   INITIALIZE
========================================================= */

bestScoreElement.textContent =
    bestScore;


function createEmptyBoard() {

    return Array.from(
        { length: SIZE },
        () => Array(SIZE).fill(0)
    );

}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    board =
        createEmptyBoard();


    score = 0;

    hasReached2048 = false;

    gameEnded = false;


    gameOverOverlay.classList.add("hidden");

    winOverlay.classList.add("hidden");

    confirmOverlay.classList.add("hidden");


    addRandomTile();

    addRandomTile();


    updateDisplay();

}


newGameButton.addEventListener(
    "click",
    startGame
);


gameOverNewGame.addEventListener(
    "click",
    startGame
);


/* =========================================================
   RANDOM TILE
========================================================= */

function addRandomTile() {

    const emptyCells = [];


    for (
        let row = 0;
        row < SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < SIZE;
            col++
        ) {

            if (
                board[row][col] === 0
            ) {

                emptyCells.push({
                    row,
                    col
                });

            }

        }

    }


    if (
        emptyCells.length === 0
    ) {

        return;

    }


    const randomCell =
        emptyCells[
            Math.floor(
                Math.random() *
                emptyCells.length
            )
        ];


    /*
        Classic 2048 odds:
        90% = 2
        10% = 4
    */

    board[randomCell.row][randomCell.col] =
        Math.random() < 0.9
            ? 2
            : 4;

}


/* =========================================================
   DISPLAY
========================================================= */

function updateDisplay() {

    tileContainer.innerHTML = "";


    for (
        let row = 0;
        row < SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < SIZE;
            col++
        ) {

            const value =
                board[row][col];


            if (value === 0) {
                continue;
            }


            const tile =
                document.createElement("div");


            tile.className =
                "tile";


            tile.classList.add(
                getTileClass(value)
            );


            tile.textContent =
                value;


            tile.style.gridRow =
                row + 1;


            tile.style.gridColumn =
                col + 1;


            tileContainer.appendChild(tile);

        }

    }


    scoreElement.textContent =
        score;


    if (
        score > bestScore
    ) {

        bestScore =
            score;


        bestScoreElement.textContent =
            bestScore;


        localStorage.setItem(
            "minigamehub-2048-best",
            bestScore
        );

    }

}


/* =========================================================
   TILE CLASS
========================================================= */

function getTileClass(value) {

    if (
        value <= 2048
    ) {

        return `tile-${value}`;

    }


    return "tile-super";

}


/* =========================================================
   KEYBOARD INPUT
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            gameEnded
        ) {

            return;

        }


        /*
            Don't allow the game to move while
            a modal is open.
        */

        if (
            !winOverlay.classList.contains("hidden") ||
            !confirmOverlay.classList.contains("hidden") ||
            !gameOverOverlay.classList.contains("hidden")
        ) {

            return;

        }


        let direction = null;


        switch (
            event.key.toLowerCase()
        ) {

            case "arrowup":
            case "w":

                direction = "up";

                break;


            case "arrowdown":
            case "s":

                direction = "down";

                break;


            case "arrowleft":
            case "a":

                direction = "left";

                break;


            case "arrowright":
            case "d":

                direction = "right";

                break;

        }


        if (
            direction === null
        ) {

            return;

        }


        event.preventDefault();


        move(direction);

    }
);


/* =========================================================
   MOVE
========================================================= */

function move(direction) {

    let rotatedBoard =
        board;


    /*
        Convert every movement into
        a LEFT movement.

        This keeps the merge logic simple.
    */

    if (direction === "up") {

        rotatedBoard =
            rotateBoard(
                board,
                3
            );

    }

    else if (
        direction === "right"
    ) {

        rotatedBoard =
            rotateBoard(
                board,
                2
            );

    }

    else if (
        direction === "down"
    ) {

        rotatedBoard =
            rotateBoard(
                board,
                1
            );

    }


    let moved = false;

    const newBoard = [];


    for (
        let row = 0;
        row < SIZE;
        row++
    ) {

        const result =
            slideAndMerge(
                rotatedBoard[row]
            );


        newBoard.push(
            result.line
        );


        if (
            result.moved
        ) {

            moved = true;

        }


        score +=
            result.score;

    }


    /*
        Rotate back.
    */

    if (direction === "up") {

        board =
            rotateBoard(
                newBoard,
                1
            );

    }

    else if (
        direction === "right"
    ) {

        board =
            rotateBoard(
                newBoard,
                2
            );

    }

    else if (
        direction === "down"
    ) {

        board =
            rotateBoard(
                newBoard,
                3
            );

    }

    else {

        board =
            newBoard;

    }


    /*
        Nothing happened.
    */

    if (!moved) {

        return;

    }


    addRandomTile();

    updateDisplay();


    /*
        Check whether 2048 was reached.
    */

    if (
        !hasReached2048 &&
        contains2048()
    ) {

        hasReached2048 = true;

        showWinPrompt();

        return;

    }


    /*
        Check for game over.
    */

    if (
        !canMove()
    ) {

        showGameOver();

    }

}


/* =========================================================
   SLIDE + MERGE
========================================================= */

function slideAndMerge(line) {

    const filtered =
        line.filter(
            value => value !== 0
        );


    const result = [];

    let gainedScore = 0;


    for (
        let i = 0;
        i < filtered.length;
        i++
    ) {

        if (
            filtered[i] ===
            filtered[i + 1]
        ) {

            const merged =
                filtered[i] * 2;


            result.push(
                merged
            );


            gainedScore +=
                merged;


            i++;

        }

        else {

            result.push(
                filtered[i]
            );

        }

    }


    while (
        result.length < SIZE
    ) {

        result.push(0);

    }


    const moved =
        result.some(
            (value, index) =>
                value !== line[index]
        );


    return {
        line: result,
        moved,
        score: gainedScore
    };

}


/* =========================================================
   ROTATE BOARD
========================================================= */

function rotateBoard(
    input,
    times
) {

    let result =
        input.map(
            row => [...row]
        );


    for (
        let rotation = 0;
        rotation < times;
        rotation++
    ) {

        const rotated =
            createEmptyBoard();


        for (
            let row = 0;
            row < SIZE;
            row++
        ) {

            for (
                let col = 0;
                col < SIZE;
                col++
            ) {

                rotated[col][
                    SIZE - 1 - row
                ] =
                    result[row][col];

            }

        }


        result =
            rotated;

    }


    return result;

}


/* =========================================================
   CHECK 2048
========================================================= */

function contains2048() {

    return board.some(
        row =>
            row.includes(2048)
    );

}


/* =========================================================
   CHECK MOVES
========================================================= */

function canMove() {

    /*
        Empty cell = move available.
    */

    for (
        let row = 0;
        row < SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < SIZE;
            col++
        ) {

            if (
                board[row][col] === 0
            ) {

                return true;

            }

        }

    }


    /*
        Check horizontal merges.
    */

    for (
        let row = 0;
        row < SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < SIZE - 1;
            col++
        ) {

            if (
                board[row][col] ===
                board[row][col + 1]
            ) {

                return true;

            }

        }

    }


    /*
        Check vertical merges.
    */

    for (
        let row = 0;
        row < SIZE - 1;
        row++
    ) {

        for (
            let col = 0;
            col < SIZE;
            col++
        ) {

            if (
                board[row][col] ===
                board[row + 1][col]
            ) {

                return true;

            }

        }

    }


    return false;

}


/* =========================================================
   2048 PROMPT
========================================================= */

function showWinPrompt() {

    winOverlay.classList.remove(
        "hidden"
    );

}


/* =========================================================
   KEEP PLAYING
========================================================= */

continueButton.addEventListener(
    "click",
    () => {

        winOverlay.classList.add(
            "hidden"
        );

    }
);


/* =========================================================
   I'M DONE
========================================================= */

doneButton.addEventListener(
    "click",
    () => {

        winOverlay.classList.add(
            "hidden"
        );

        confirmOverlay.classList.remove(
            "hidden"
        );

    }
);


/* =========================================================
   CANCEL EXIT
========================================================= */

cancelButton.addEventListener(
    "click",
    () => {

        confirmOverlay.classList.add(
            "hidden"
        );

    }
);


/* =========================================================
   CONFIRM EXIT
========================================================= */

exitButton.addEventListener(
    "click",
    () => {

        confirmOverlay.classList.add(
            "hidden"
        );


        gameEnded = true;


        finalScore.textContent =
            score;


        gameOverOverlay.classList.remove(
            "hidden"
        );

    }
);


/* =========================================================
   GAME OVER
========================================================= */

function showGameOver() {

    gameEnded = true;


    finalScore.textContent =
        score;


    gameOverOverlay.classList.remove(
        "hidden"
    );

}


/* =========================================================
   MOBILE SWIPE
========================================================= */

let touchStartX = 0;
let touchStartY = 0;


const gameBoard =
    document.getElementById(
        "gameBoard"
    );


gameBoard.addEventListener(
    "touchstart",
    (event) => {

        const touch =
            event.changedTouches[0];


        touchStartX =
            touch.screenX;

        touchStartY =
            touch.screenY;

    },
    {
        passive: true
    }
);


gameBoard.addEventListener(
    "touchend",
    (event) => {

        if (
            gameEnded ||
            !winOverlay.classList.contains("hidden") ||
            !confirmOverlay.classList.contains("hidden")
        ) {

            return;

        }


        const touch =
            event.changedTouches[0];


        const deltaX =
            touch.screenX -
            touchStartX;


        const deltaY =
            touch.screenY -
            touchStartY;


        const minimumSwipe =
            30;


        if (
            Math.abs(deltaX) <
                minimumSwipe &&
            Math.abs(deltaY) <
                minimumSwipe
        ) {

            return;

        }


        if (
            Math.abs(deltaX) >
            Math.abs(deltaY)
        ) {

            move(
                deltaX > 0
                    ? "right"
                    : "left"
            );

        }

        else {

            move(
                deltaY > 0
                    ? "down"
                    : "up"
            );

        }

    },
    {
        passive: true
    }
);


/* =========================================================
   START
========================================================= */

startGame();
