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
   GAME SETTINGS
========================================================= */

const SIZE = 4;


/*
    Animation length.

    Keep this short so the game feels responsive.
*/

const MOVE_TIME = 145;


/* =========================================================
   GAME STATE
========================================================= */

let board = [];

let score = 0;

let bestScore =
    Number(
        localStorage.getItem(
            "minigamehub-2048-best"
        )
    ) || 0;


let hasReached2048 = false;

let gameEnded = false;

let isAnimating = false;


bestScoreElement.textContent =
    bestScore;


/* =========================================================
   BOARD
========================================================= */

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

    isAnimating = false;


    gameOverOverlay.classList.add(
        "hidden"
    );

    winOverlay.classList.add(
        "hidden"
    );

    confirmOverlay.classList.add(
        "hidden"
    );


    addRandomTile();

    addRandomTile();


    renderBoard();

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


    board[randomCell.row][randomCell.col] =
        Math.random() < 0.9
            ? 2
            : 4;

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
   GET TILE POSITION
========================================================= */

function getTilePosition(row, col) {

    return {
        row,
        col
    };

}


/* =========================================================
   CREATE TILE
========================================================= */

function createTile(
    value,
    row,
    col
) {

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


    tile.dataset.row =
        row;


    tile.dataset.col =
        col;


    return tile;

}


/* =========================================================
   RENDER BOARD
========================================================= */

function renderBoard(
    previousPositions = null,
    newTile = null,
    mergedTiles = []
) {

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


            if (
                value === 0
            ) {

                continue;

            }


            const tile =
                createTile(
                    value,
                    row,
                    col
                );


            /*
                New tile.

                Let CSS handle the spawn animation.
            */

            if (
                newTile &&
                newTile.row === row &&
                newTile.col === col
            ) {

                tile.classList.add(
                    "new-tile"
                );

            }


            /*
                Merged tile.
            */

            if (
                mergedTiles.some(
                    position =>
                        position.row === row &&
                        position.col === col
                )
            ) {

                tile.classList.add(
                    "merged"
                );

            }


            /*
                If this tile existed before,
                start it at its old position.
            */

            if (
                previousPositions
            ) {

                const oldPosition =
                    previousPositions.find(
                        position =>
                            position.id ===
                            getTileId(
                                row,
                                col
                            )
                    );


                if (
                    oldPosition
                ) {

                    const rowDifference =
                        oldPosition.row -
                        row;

                    const colDifference =
                        oldPosition.col -
                        col;


                    /*
                        CSS transform starts
                        the tile at its old position.
                    */

                    tile.style.transform =
                        `
                        translate(
                            ${colDifference * 100}%,
                            ${rowDifference * 100}%
                        )
                        `;


                    /*
                        Force the browser to
                        register the starting
                        position before moving.
                    */

                    tile.offsetHeight;


                    requestAnimationFrame(() => {

                        tile.style.transition =
                            `
                            transform
                            ${MOVE_TIME}ms
                            cubic-bezier(
                                0.22,
                                1,
                                0.36,
                                1
                            )
                            `;


                        tile.style.transform =
                            "translate(0, 0)";

                    });

                }

            }


            tileContainer.appendChild(
                tile
            );

        }

    }


    scoreElement.textContent =
        score;


    updateBestScore();

}


/* =========================================================
   TILE ID
========================================================= */

function getTileId(
    row,
    col
) {

    return `${row}-${col}`;

}


/* =========================================================
   BEST SCORE
========================================================= */

function updateBestScore() {

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
   GET BOARD POSITIONS
========================================================= */

function getBoardPositions() {

    const positions = [];


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
                board[row][col] !== 0
            ) {

                positions.push({

                    id:
                        getTileId(
                            row,
                            col
                        ),

                    row,

                    col

                });

            }

        }

    }


    return positions;

}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            gameEnded ||
            isAnimating
        ) {

            return;

        }


        if (
            !winOverlay.classList.contains(
                "hidden"
            ) ||
            !confirmOverlay.classList.contains(
                "hidden"
            ) ||
            !gameOverOverlay.classList.contains(
                "hidden"
            )
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

    if (
        isAnimating
    ) {

        return;

    }


    const previousBoard =
        board.map(
            row => [...row]
        );


    const previousPositions =
        getBoardPositions();


    let rotatedBoard =
        board;


    /*
        Convert movement into LEFT.
    */

    if (
        direction === "up"
    ) {

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

    let gainedScore = 0;


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


        gainedScore +=
            result.score;

    }


    if (
        !moved
    ) {

        return;

    }


    /*
        Rotate back.
    */

    if (
        direction === "up"
    ) {

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


    score +=
        gainedScore;


    /*
        Find where the new random tile
        will be placed.
    */

    addRandomTile();


    /*
        Identify the newly created tile.
    */

    const newTile =
        findNewTile(
            previousBoard,
            board
        );


    /*
        Identify merged tiles.
    */

    const mergedTiles =
        findMergedTiles(
            previousBoard,
            board
        );


    isAnimating = true;


    /*
        Render the board with movement.
    */

    renderBoard(
        createMovementPositions(
            previousBoard,
            board
        ),
        newTile,
        mergedTiles
    );


    /*
        Wait for movement to finish
        before allowing another move.
    */

    setTimeout(
        () => {

            isAnimating = false;


            /*
                Check for 2048.
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

        },
        MOVE_TIME + 25
    );

}


/* =========================================================
   CREATE MOVEMENT POSITIONS
========================================================= */

function createMovementPositions(
    oldBoard,
    newBoard
) {

    const positions = [];


    /*
        For every tile in the new board,
        try to find the same value from
        the previous board.

        This creates a convincing movement
        trail without needing a huge animation
        framework.
    */

    const used = new Set();


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
                newBoard[row][col];


            if (
                value === 0
            ) {

                continue;

            }


            let found = null;


            for (
                let oldRow = 0;
                oldRow < SIZE;
                oldRow++
            ) {

                for (
                    let oldCol = 0;
                    oldCol < SIZE;
                    oldCol++
                ) {

                    const key =
                        `${oldRow}-${oldCol}`;


                    if (
                        used.has(key)
                    ) {

                        continue;

                    }


                    if (
                        oldBoard[oldRow][oldCol] ===
                        value
                    ) {

                        found = {

                            id:
                                getTileId(
                                    row,
                                    col
                                ),

                            row: oldRow,

                            col: oldCol

                        };


                        used.add(key);

                        break;

                    }

                }


                if (
                    found
                ) {

                    break;

                }

            }


            if (
                found
            ) {

                positions.push(
                    found
                );

            }

        }

    }


    return positions;

}


/* =========================================================
   FIND NEW TILE
========================================================= */

function findNewTile(
    oldBoard,
    newBoard
) {

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
                oldBoard[row][col] === 0 &&
                newBoard[row][col] !== 0
            ) {

                return {

                    row,

                    col

                };

            }

        }

    }


    return null;

}


/* =========================================================
   FIND MERGES
========================================================= */

function findMergedTiles(
    oldBoard,
    newBoard
) {

    const merged = [];


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
                newBoard[row][col];


            if (
                value === 0
            ) {

                continue;

            }


            /*
                If the new tile is a value that
                could have been produced by merging
                two identical old tiles, give it
                the merge animation.
            */

            const half =
                value / 2;


            if (
                Number.isInteger(half) &&
                half >= 2
            ) {

                let found = 0;


                /*
                    Horizontal.
                */

                if (
                    col > 0 &&
                    oldBoard[row][col - 1] === half
                ) {

                    found++;

                }


                if (
                    col < SIZE - 1 &&
                    oldBoard[row][col + 1] === half
                ) {

                    found++;

                }


                /*
                    Vertical.
                */

                if (
                    row > 0 &&
                    oldBoard[row - 1][col] === half
                ) {

                    found++;

                }


                if (
                    row < SIZE - 1 &&
                    oldBoard[row + 1][col] === half
                ) {

                    found++;

                }


                if (
                    found >= 2
                ) {

                    merged.push({

                        row,

                        col

                    });

                }

            }

        }

    }


    return merged;

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
   CHECK AVAILABLE MOVES
========================================================= */

function canMove() {

    /*
        Empty tile.
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
        Horizontal merges.
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
        Vertical merges.
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
   CANCEL
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
   EXIT
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
            isAnimating ||
            !winOverlay.classList.contains(
                "hidden"
            ) ||
            !confirmOverlay.classList.contains(
                "hidden"
            )
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
