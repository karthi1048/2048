// we create this 3 variables here to access grid to determine what cell is in what position.
const GRID_SIZE = 4;
const CELL_SIZE = 20;
const CELL_GAP  = 2

export default class Grid {
    // declaring private variable outside constructor
    // this private variable can only be accessed inside the Grid class
    // benefit of using "cells" as private variable is that it allows to access individual elements inside of it instead of all the cells at once.
    // this also makes sure that we can't overwrite all the cells in grid class, from outside the grid class

    #cells

    constructor(gridElement){
        // creating css variables from js
        gridElement.style.setProperty('--grid-size', GRID_SIZE)
        gridElement.style.setProperty('--cell-size', `${CELL_SIZE}vmin`)
        gridElement.style.setProperty('--cell-gap', `${CELL_GAP}vmin`)

        // uses the values of array(cells) to create new Cell object
        this.#cells = createCellElements(gridElement).map((cellElement, index) => {
            return new Cell(cellElement, index % GRID_SIZE, Math.floor(index / GRID_SIZE))   // (index % GRID_SIZE) = x position, (index / GRID_SIZE) = y position
        })
        // console.log(this.cells);
    }

    get cells(){
        return this.#cells
    }

    // get the normal cells, return as new array organized by column. So that each array represent each column in grid.
    // cell.x = row & cell.y = column

    get cellsByRow(){
        return this.#cells.reduce((cellGrid, cell) => {
            cellGrid[cell.y] = cellGrid[cell.y] || []                            // if there is no array already for that column, add an array.
            cellGrid[cell.y][cell.x] = cell                                      // so values assigned will be as 'x' for row & 'y' for column
            return cellGrid
        }, [])                                                                   // By default start as an empty array
    }

    get cellsByColumn(){
        return this.#cells.reduce((cellGrid, cell) => {
            cellGrid[cell.x] = cellGrid[cell.x] || []                            // if there is no array already for that row, add an array.
            cellGrid[cell.x][cell.y] = cell                                      // so values assigned will be as 'x' for row & 'y' for column
            return cellGrid
        }, [])                                                                   // By default start as an empty array
    }

    // private getter to get all empty cells, by checking which don't have a tile
    get #emptyCells(){
        return this.#cells.filter(cell => cell.tile == null)
    }

    // return whichever cell is empty, at a random basis
    randomEmptyCell() {
        const randomIndex = Math.floor(Math.random() * this.#emptyCells.length)   // return a random b/w 0 & its length
        return this.#emptyCells[randomIndex]
    }
}

class Cell {
    // declaring 5 private variables
    #cellElement
    #x
    #y
    #tile
    #mergeTile

    constructor(cellElement, x, y){
        this.#cellElement = cellElement
        this.#x = x
        this.#y = y
    }

    // getter to get x, y, tile, mergeTile values
    get x(){
        return this.#x
    }

    get y(){
        return this.#y
    }

    get tile(){
        return this.#tile
    }

    get mergeTile(){
        return this.#mergeTile
    }

    set tile(value){
        this.#tile = value;
        if (value == null) return      // if value of tile is null, remove the tile
        // if it is not a null, we set position of tile, moving #tile x & y position into new #x & #y position
        this.#tile.x = this.#x;
        this.#tile.y = this.#y;
    }

    set mergeTile(value){
        this.#mergeTile = value
        if (value == null) return
        this.#mergeTile.x = this.#x;
        this.#mergeTile.y = this.#y;
    }

    canAccept(tile){
        // Compare if there is no tile (i.e. null) with the 
        // if we haven't done merge already & (current tile value = value of tile we are trying to accept)
        // then YES we can merge the tiles.
        return (
            this.tile == null || 
            (this.mergeTile == null && this.tile.value === tile.value)
        )
    }
    //NOTE: we only merge tiles by one step only.

    mergeTiles(){
        if(this.tile == null || this.mergeTile == null) return                               // checking if it's as tile for merging
        // otherwise, if there is a tile for merging, add the tile & mergeTile value
        this.tile.value = this.tile.value + this.mergeTile.value
        this.mergeTile.remove()                                                              // remove the tile from DOM
        this.mergeTile = null                                                                // set the mergeTile on cell to null
    }
}

// create cells on grid depending on GRID_SIZE
function createCellElements(gridElement) {
    const cells = []
    for(let i=0; i < GRID_SIZE * GRID_SIZE; i++){
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cells.push(cell)                                                                     // pushing the created cell into 'cells' array.
        gridElement.append(cell)                                                             // adding the element with class = cell into the grid
    }
    return cells
}