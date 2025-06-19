import Grid from "./grid.js";
import Tile from "./tile.js";

const gameBoard = document.getElementById("game-board");

const grid = new Grid(gameBoard)                        // getting Grid class
grid.randomEmptyCell().tile = new Tile(gameBoard);      // generate random tile while refresh
grid.randomEmptyCell().tile = new Tile(gameBoard);
setupInput()                                            // calling function
// console.log(grid.cellsByColumn)

// to handle user interaction
function setupInput(){
    window.addEventListener("keydown", handleInput, { once: true })  // run event listener once, then remove listener (ultimately, waits for all animation to complete)
}

async function handleInput(e) {
    // console.log(e.key)
    switch (e.key) {
        // move functions will handle tile movements
        // all of these movements are promises
        case "ArrowUp":
            if (!canMoveUp()){
                setupInput()
                return
            }
            await moveUp()
            break
        case "ArrowDown":
            if (!canMoveDown()){
                setupInput()
                return
            }
            await moveDown()
            break
        case "ArrowLeft":
            if (!canMoveLeft()){
                setupInput()
                return
            }
            await moveLeft()
            break
        case "ArrowRight":
            if (!canMoveRight()){
                setupInput()
                return
            }
            await moveRight()
            break
        default:
            setupInput()          // we call this function to add listener, because we didn't move a tile by clicking.
            return                // And exiting handleInput immediately if no arrow keys are pressed, by 'return'.
    }
    // calling merging of tiles, but it will wait until movements are finished.
    grid.cells.forEach(cell => cell.mergeTiles())

    // adding new tile after every movement
    const newTile = new Tile(gameBoard)
    grid.randomEmptyCell().tile = newTile

    // ending condition if no movement
    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()){
        // when the animation is finished, raise an alert.
        newTile.waitForTransition(true).then(() => {
            alert("You lose");
        })
        return
    }

    setupInput()                                     // to reset up our input, regardless of the key been pressed.
}
// Note: Internally all keyboard keys as a name, specifically a string. For Example, "Up arrow key" it is "ArrowUp"

function moveUp() {
    return slideTiles(grid.cellsByColumn)            // orienting all of the cells in grid by column
    // this allows us to check the cells(it's value) below since we are moving up.
}

function moveDown() {
    return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))      // orienting all of the cells in grid by column in a reverse manner.
    // since the reverse() changes the underlying array, to avoid that we are spreading the column in brand new array, then using the reversed value.
    // this allows us to check the cells(it's value) below since we are moving down.
}

function moveLeft() {
    return slideTiles(grid.cellsByRow)               // orienting all of the cells in grid by row
    // this allows us to check the cells(it's value) below since we are moving left.
}

function moveRight() {
    return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))               // orienting all of the cells in grid by row in a reverse manner
    // this allows us to check the cells(it's value) below since we are moving right.
}

function slideTiles(cells){
    // loop through each one of the cells by a group(column or row)
    // if it is column, then arrow UP or DOWN is used
    // if it is row, then arrow LEFT or RIGHT is used

    // this will return an array of promises
    return Promise.all(
        // like normal map, it will flatten out result into 1D array.
        cells.flatMap(group => {
            const promises = []                                                              // creating new promise
            for (let i = 1; i < group.length; i++) {
                const cell = group[i];
                if (cell.tile == null) continue                                              // if the null tile is trying to be moved, ignore the below code
                let lastValidCell                                                            // equal to NULL

                // for loop to loop through all the remaining tiles in that column or row
                for (let j = i - 1; j>=0; j--){
                    const moveToCell = group[j]                                              // new location for the cell
                    if(!moveToCell.canAccept(cell.tile)) break                               // if it cannot accept that cell.tile position we are trying to move, exit from loop (i.e, unable to move)
                    lastValidCell = moveToCell                                               // this the last position of cell if "IF statement" breaks
                }
                
                // if it's value is not null
                if (lastValidCell != null){   
                    // Simply every time there is movement, save or add that animation in promises 
                    promises.push(cell.tile.waitForTransition())                             // add the promise or array, thus tells to wait for animation to finish (i.e, promise is resolved).

                    // if it currently as a tile
                    if (lastValidCell.tile != null){ 
                        lastValidCell.mergeTile = cell.tile                                  // merge the tile as one & store the value
                    } else {
                        lastValidCell.tile = cell.tile                                       // if no tile already, just set the current tile
                    }
                    cell.tile = null                                                         // In the end, delete the tile & value = NULL
                }
            }
            return promises                                                                  // returning the array
        })
    )
}

// functions similar to slide tiles
function canMoveUp() {
    return canMove(grid.cellsByColumn)
}
function canMoveDown() {
    return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}
function canMoveLeft() {
    return canMove(grid.cellsByRow)
}
function canMoveRight() {
    return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}

// checking is it possible for that cell to move
function canMove(cells) {
    // return that cell group
    return cells.some(group => {
        // from that group return the cell index
        return group.some((cell, index) => {
            if (index === 0) return false                      // 0th index means top cell, so we can't move cell.
            if (cell.tile == null) return false                // if there is no tile
            // check the cell currently above the cell canAccept the tile we are moving, return true.
            const moveToCell = group[index - 1]
            return moveToCell.canAccept(cell.tile) 
        })
    })
}
// Note: At any point, any of the cell at all in that cell array return TRUE, the entire function will return TRUE.