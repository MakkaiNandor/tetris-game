// Constants
const ROWS = 20, COLS = 10;
const MAP = [...Array(ROWS)].map(_ => Array(COLS).fill(0));
const ELEMENTS = [...Array(ROWS)].map(_ => [...Array(COLS)].map(_ => document.createElement("DIV")));
const PATTERNS = [
    [[1, 1, 1],
     [0, 0, 1]],
    [[0, 1, 0],
     [1, 1, 1]],
    [[0, 1, 1],
     [1, 1, 0]],
    [[1, 1],
     [1, 1]],
    [[1, 1, 0],
     [0, 1, 1]],
    [[1, 1, 1, 1]],
    [[1, 1, 1],
     [1, 0, 0]]
];

// Tetris shapes' class
class Shape {
    constructor() {
        this.pattern = PATTERNS[Math.floor(Math.random() * 100) % PATTERNS.length];
        this.row = 0;
        this.col = Math.floor(COLS / 2 - this.pattern[0].length / 2);
    }

    canDraw() {
        for(var i = 0 ; i < this.pattern.length ; ++i) {
            for(var j = 0 ; j < this.pattern[0].length ; ++j) {
                if(this.pattern[i][j] > 0 && MAP[this.row+i][this.col+j] > 0) {
                    return false;
                }
            }
        }
        return true;
    }

    draw() {
        if(getTopRowId() == 0 || !this.canDraw()) {
            gameOver();
            return;
        }
        for(var i = 0 ; i < this.pattern.length ; ++i){
            for(var j = 0 ; j < this.pattern[0].length ; ++j){
                if(this.pattern[i][j] > 0) {
                    ELEMENTS[this.row+i][this.col+j].className = "full";
                }
            }
        }
    }

    clear() {
        for(var i = 0 ; i < this.pattern.length ; ++i){
            for(var j = 0 ; j < this.pattern[0].length ; ++j){
                if(this.pattern[i][j] > 0) {
                    ELEMENTS[this.row+i][this.col+j].className = "empty";
                }
            }
        }
    }

    fall() {
        if(this.row + this.pattern.length === ROWS) {
            return false;
        }
        for(var i = 0 ; i < this.pattern.length ; ++i) {
            for(var j = 0 ; j < this.pattern[0].length ; ++j) {
                if(this.pattern[i][j] > 0 && MAP[this.row+i+1][this.col+j] > 0) {
                    return false;
                }
            }
        }
        this.clear();
        ++this.row;
        this.draw();
        return true;
    }

    rotate() {
        var rotated = this.pattern[0].map((_, idx) => this.pattern.map(row => row[idx]).reverse());
        if(this.col + rotated[0].length > COLS || this.row + rotated.length > ROWS) {
            return;
        }
        for(var i = 0 ; i < rotated.length ; ++i) {
            for(var j = 0 ; j < rotated[0].length ; ++j) {
                if(rotated[i][j] > 0 && MAP[this.row+i][this.col+j] > 0) {
                    return;
                }
            }
        }
        this.clear();
        this.pattern = rotated;
        this.draw();
    }

    moveRight() {
        for(var i = 0 ; i < this.pattern.length ; ++i) {
            for(var j = 0 ; j < this.pattern[0].length ; ++j) {
                if(this.pattern[i][j] > 0 && MAP[this.row+i][this.col+j+1] > 0) {
                    return;
                }
            }
        }
        if(this.col + this.pattern[0].length < COLS) {
            this.clear();
            ++this.col;
            this.draw();
        }
    }

    moveLeft() {
        for(var i = 0 ; i < this.pattern.length ; ++i) {
            for(var j = 0 ; j < this.pattern[0].length ; ++j) {
                if(this.pattern[i][j] > 0 && MAP[this.row+i][this.col+j-1] > 0) {
                    return;
                }
            }
        }
        if(this.col > 0) {
            this.clear();
            --this.col;
            this.draw();
        }
    }

    saveToMap() {
        for(var i = 0 ; i < this.pattern.length ; ++i) {
            for(var j = 0 ; j < this.pattern[0].length ; ++j) {
                if(this.pattern[i][j] > 0) {
                    MAP[this.row+i][this.col+j] = this.pattern[i][j];
                }
            }
        }
    }
}

// HTML elements
var playground, startButton, resetButton, scoreDisplay, gameOverOverlay, nextShapeDisplay;
// Objects and variables
var fallingShape;
var nextShape;
var gameIsRunning = false;
var level = 1;
var score = 0;

function addScore(lines) {
    switch(lines) {
        case 1:
            score += 40 * level;
            break;
        case 2:
            score += 100 * level;
            break;
        case 3:
            score += 300 * level;
            break;
        case 4:
            score += 1200 * level;
            break;
        default:
            break;
    }
    document.getElementById("score").innerHTML = "" + score;
}

function gameLoop() {
    if(!gameIsRunning) return;
    if(!fallingShape.fall()) {
        fallingShape.saveToMap();
        deleteCompleteLines(fallingShape.row, fallingShape.pattern.length);
        delete fallingShape;
        fallingShape = nextShape;
        fallingShape.draw();
        nextShape = new Shape();
        showNextShape();
    }
    if(gameIsRunning) setTimeout(gameLoop, 1000 / level);
}

function gameOver() {
    gameIsRunning = false;
    gameOverOverlay.classList.toggle("invisible");
}

function showNextShape() {
    nextShapeDisplay.innerHTML = "";
    nextShapeDisplay.style.height = nextShape.pattern.length * 30 + "px";
    nextShapeDisplay.style.width = nextShape.pattern[0].length * 30 + "px";
    for(var i = 0 ; i < nextShape.pattern.length ; ++i) {
        for(var j = 0 ; j < nextShape.pattern[0].length ; ++j) {
            nextShapeDisplay.innerHTML += nextShape.pattern[i][j] > 0 ? "<div class='block bg-dark'></div>" : "<div class='block'></div>";
        }
    }
}

function deleteCompleteLines(startRow, length) {
    var lines = 0;
    for(var row = startRow ; row < startRow + length ; ++row) {
        if(MAP[row].every(v => v === 1)) {
            ++lines;
            MAP.splice(row, 1);
            MAP.unshift(Array(COLS).fill(0));
        }
    }
    for(var row = 0 ; row < ROWS ; ++row) {
        for(var col = 0 ; col < COLS ; ++col) {
            ELEMENTS[row][col].className = MAP[row][col] > 0 ? "full" : "empty";
        }
    }
    addScore(lines);
}

function getTopRowId() {
    var rowId = -1;
    for(var i = 0 ; i < ROWS ; ++i) {
        if(MAP[i].includes(1)) {
            rowId = i;
            break;
        }
    }
    return rowId;
}

// Handle key events
window.onkeydown = (e) => {
    if(!gameIsRunning) return;
    switch(e.key) {
        case "ArrowUp":
            fallingShape.rotate();
            break;
        case "ArrowLeft":
            fallingShape.moveLeft();
            break;
        case "ArrowRight":
            fallingShape.moveRight();
            break;
        case "ArrowDown":
            fallingShape.fall();
            break;
        default:
            break;
    }
}

window.onload = () => {
    playground = document.getElementById("playground");
    startButton = document.getElementById("start-btn");
    resetButton = document.getElementById("reset-btn");
    scoreDisplay = document.getElementById("score");
    gameOverOverlay = document.getElementById("game-over-message");
    nextShapeDisplay = document.getElementById("next-shape");

    startButton.addEventListener("click", (e) => {
        // Create objects
        fallingShape = new Shape();
        nextShape = new Shape();
        showNextShape();
        // Startign the game
        gameIsRunning = true;
        fallingShape.draw();
        setTimeout(gameLoop, 1000 / level);
        // Change buttons
        startButton.classList.toggle("invisible");
        resetButton.classList.toggle("invisible");
    });

    resetButton.addEventListener("click", (e) => {
        // Set default values
        if(gameIsRunning) {
            gameIsRunning = false;
        }
        else {
            gameOverOverlay.classList.toggle("invisible");
        }
        level = 1;
        score = 0;
        scoreDisplay.innerHTML = "0";
        for(var row = 0 ; row < ROWS ; ++row) {
            for(var col = 0 ; col < COLS ; ++col) {
                MAP[row][col] = 0;
                ELEMENTS[row][col].className = "empty";
            }
        }
        nextShapeDisplay.innerHTML = "";
        // Delete objects
        delete fallingShape;
        delete nextShape;
        // Change buttons
        startButton.classList.toggle("invisible");
        resetButton.classList.toggle("invisible");
    });

    // Create the playground
    for(var row = 0 ; row < ROWS ; ++row){
        for(var col = 0 ; col < COLS ; ++col){
            ELEMENTS[row][col].className = "empty";
            playground.appendChild(ELEMENTS[row][col]);
        }
    }
}