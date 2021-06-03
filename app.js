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

class Shape {
    constructor() {
        this.pattern = PATTERNS[Math.floor(Math.random() * 100) % PATTERNS.length];
        this.row = 0;
        this.col = Math.floor(COLS / 2 - this.pattern[0].length / 2);
    }

    draw() {
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

var fallingShape;
var nextShape;
var gameIsRunning = false;

function gameLoop() {
    if(!gameIsRunning) return;
    if(!fallingShape.fall()) {
        fallingShape.saveToMap();
        deleteCompleteLines(fallingShape.row, fallingShape.pattern.length);
        delete fallingShape;
        fallingShape = nextShape;
        fallingShape.draw();
        nextShape = new Shape();
    }
    setTimeout(gameLoop, 1000);
}

function deleteCompleteLines(startRow, length) {
    for(var row = startRow ; row < startRow + length ; ++row) {
        if(MAP[row].every(v => v === 1)) {
            MAP.splice(row, 1);
            MAP.unshift(Array(COLS).fill(0));
        }
    }
    for(var row = 0 ; row < ROWS ; ++row) {
        for(var col = 0 ; col < COLS ; ++col) {
            ELEMENTS[row][col].className = MAP[row][col] > 0 ? "full" : "empty";
        }
    }
}

window.onkeydown = (e) => {
    switch (e.key) {
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
    var playground = document.getElementById("playground");
    var startButton = document.getElementById("start-btn");
    var resetButton = document.getElementById("reset-btn");

    startButton.addEventListener("click", (e) => {
        fallingShape = new Shape();
        nextShape = new Shape();
        gameIsRunning = true;
        fallingShape.draw();
        setTimeout(gameLoop, 1000);
        startButton.classList.toggle("invisible");
        resetButton.classList.toggle("invisible");
    });

    resetButton.addEventListener("click", (e) => {
        gameIsRunning = false;
        for(var row = 0 ; row < ROWS ; ++row) {
            for(var col = 0 ; col < COLS ; ++col) {
                MAP[row][col] = 0;
                ELEMENTS[row][col].className = "empty";
            }
        }
        delete fallingShape;
        delete nextShape;
        startButton.classList.toggle("invisible");
        resetButton.classList.toggle("invisible");
    });

    for(var row = 0 ; row < ROWS ; ++row){
        for(var col = 0 ; col < COLS ; ++col){
            ELEMENTS[row][col].className = "empty";
            playground.appendChild(ELEMENTS[row][col]);
        }
    }
}