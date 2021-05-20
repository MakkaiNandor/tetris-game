// Constants
const ROWS = 20, COLS = 10;
const COLORS = [ "green-box", "red-box", "blue-box", "yellow-box", "orange-box" ];
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
const MAP = [...Array(ROWS)].map(_ => Array(COLS).fill(0));
const ELEMENTS = [...Array(ROWS)].map(_ => [...Array(COLS)].map(_ => document.createElement("DIV")));
var GAME_RUNNING = false;
var GAME_OVER = false;

// Classes
class Shape {
    constructor(pattern, color, position) {
        this.pattern = pattern;
        this.color = color;
        this.height = this.pattern.length;
        this.width = this.pattern[0].length;
        if(position + this.width >= COLS) {
            position = COLS - this.width;
        }
        this.row = 0;
        this.col = position;
    }

    rotate() {
        var rotated = this.pattern[0].map((_, idx) => this.pattern.map(row => row[idx]).reverse());
        if(this.col + rotated[0].length > COLS || this.row + rotated.length > ROWS) {
            return;
        }
        for(var r = 0 ; r < rotated.length ; ++r) {
            for(var c = 0 ; c < rotated[0].length ; ++c) {
                if(rotated[r][c] > 0 && MAP[this.row+r][this.col+c] > 0) {
                    return;
                }
            }
        }
        this.pattern = rotated;
        this.height = this.pattern.length;
        this.width = this.pattern[0].length;
    }

    moveRight() {
        for(var r = 0 ; r < this.height ; ++r) {
            for(var c = 0 ; c < this.width ; ++c) {
                if(this.pattern[r][c] > 0 && MAP[this.row+r][this.col+c+1] > 0) {
                    return;
                }
            }
        }
        if(this.col + this.width < COLS) {
            ++this.col;
        }
    }

    moveLeft() {
        for(var r = 0 ; r < this.height ; ++r) {
            for(var c = 0 ; c < this.width ; ++c) {
                if(this.pattern[r][c] > 0 && MAP[this.row+r][this.col+c-1] > 0) {
                    return;
                }
            }
        }
        if(this.col > 0) {
            --this.col;
        }
    }

    draw() {
        for(var row = 0 ; row < this.height ; ++row) {
            for(var col = 0 ; col < this.width ; ++col) {
                if(this.pattern[row][col] === 1) {
                    MAP[this.row + row][this.col + col] = this.color;
                }
            }
        }
    }

    clear() {
        for(var row = 0 ; row < this.height ; ++row) {
            for(var col = 0 ; col < this.width ; ++col) {
                if(this.pattern[row][col] > 0) {
                    MAP[this.row + row][this.col + col] = 0;
                }
            }
        }
    }

    fall() {
        if(this.row + this.height === ROWS) {
            return false;
        }
        for(var r = 0 ; r < this.height ; ++r) {
            for(var c = 0 ; c < this.width ; ++c) {
                if(this.pattern[r][c] > 0 && MAP[this.row+r+1][this.col+c] > 0) {
                    return false;
                }
            }
        }
        ++this.row;
        return true;
    }
}

// Functions
function _id(id) {
    return document.getElementById(id);
}

function generateNewShape() {
    var pattern = PATTERNS[Math.floor(Math.random() * 100) % PATTERNS.length];
    var color = Math.floor(Math.random() * 100) % COLORS.length + 1;
    var position = Math.floor(Math.random() * 100) % COLS;

    return new Shape(pattern, color, position);
}

function updateMap() {
    for(var row = 0 ; row < ROWS ; ++row) {
        for(var col = 0 ; col < COLS ; ++col) {
            if(MAP[row][col] > 0) {
                ELEMENTS[row][col].className = COLORS[MAP[row][col] - 1];
            }
            else {
                ELEMENTS[row][col].className = "default-box";
            }
        }
    }
}

// Event handlers

function onButtonClicked(button) {
    if(!GAME_RUNNING) {
        button.innerHTML = "Pause";

        fallingShape.draw();
        updateMap();

        fallingInterval = setInterval(game, 500);

        GAME_RUNNING = true;
    }
    else {
        button.innerHTML = "Start";
        clearInterval(fallingInterval);
        GAME_RUNNING = false;
    }
}

document.addEventListener("keydown", (e) => {
    if(!GAME_RUNNING || GAME_OVER) {
        return;
    }
    switch(e.key) {
        case "ArrowLeft":
            fallingShape.clear();
            fallingShape.moveLeft();
            fallingShape.draw();
            updateMap();
            break;
        case "ArrowRight":
            fallingShape.clear();
            fallingShape.moveRight();
            fallingShape.draw();
            updateMap();
            break;
        case "ArrowUp":
            fallingShape.clear();
            fallingShape.rotate();
            fallingShape.draw();
            updateMap();
            break;
        case "ArrowDown":
            fallingShape.clear();
            fallingShape.fall();
            fallingShape.draw();
            updateMap();
            break;
        default: break;
    }
});

// Main
var fallingShape = generateNewShape();
var nextShape = generateNewShape();
var updateInterval = null;
var fallingInterval = null;

window.onload = () => {
    var playground = _id("playground");
    var startPauseButton = _id("start-puase-btn");

    // Add elements to HTML
    for(var r = 0; r < ROWS; ++r) {
        var row = document.createElement("DIV");
        for(var c = 0; c < COLS; ++c) {
            ELEMENTS[r][c].classList.add("default-box");
            row.appendChild(ELEMENTS[r][c]);
        }
        playground.appendChild(row);
    }

    startPauseButton.addEventListener("click", (e) => {
        onButtonClicked(e.target);
    }, false);
}

function game() {
    fallingShape.clear();
    if(!fallingShape.fall()) {
        fallingShape.draw();
        deleteCompleteLines(fallingShape.row, fallingShape.height);
        fallingShape = nextShape;
        nextShape = generateNewShape();
    }
    fallingShape.draw();
    updateMap();
}

function deleteCompleteLines(row, height) {
    console.log("Start deleting!");
    for(var r = row ; r < row + height ; ++r) {
        var canDelete = true;
        for(var c = 0 ; c < COLS ; ++c) {
            if(MAP[r][c] === 0) {
                canDelete = false;
            }
        }
        if(canDelete) {
            console.log("Delete:", MAP.splice(r, 1));
            MAP.unshift(Array(COLS).fill(0));
        }
    }
    console.log("End deleting!");
}