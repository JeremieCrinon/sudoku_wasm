use sudoku::{fill_grid, solve_grid, Grid};
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use serde_wasm_bindgen::{from_value, to_value};
mod sudoku;

#[derive(Serialize, Deserialize)]
struct SudokuGrid([[u8; 9]; 9]);

#[wasm_bindgen]
pub fn solve_sudoku(grid_to_solve: JsValue) -> JsValue { // This function is the one the JS calls, it will then call the necessary functions to solve the grid
    // We get from the JsValue the grid
    let grid_to_solve: SudokuGrid = from_value(grid_to_solve).unwrap();

    // We make a new grid object, this object will be easier to manipulate than if we used the 2D array directly
    let mut grid = Grid::new();
    // We call the function fill_grid from ./sudoku/fill.rs with the grid object, and the grid_to_solve that the JS gave us
    grid = fill_grid(grid, grid_to_solve.0);

    // We call the solve_grid function, it returns two elements, the solved grid if it can be solved, and success (true = the grid has been solved and is correct, false = the grid cannot be solved and isn't correct)
    let (grid, success) = solve_grid(grid);

    // If success, we make result the grid object that we turned back into an array, else, we return an empty grid, the JS will then know that the grid isn't correct
    let result = if success { grid.to_array() } else { [[0; 9]; 9] };

    // We return the grid
    to_value(&SudokuGrid(result)).unwrap()
}
