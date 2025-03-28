use sudoku::{fill_grid, solve_grid, Grid};
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use serde_wasm_bindgen::{from_value, to_value};
mod sudoku;

#[derive(Serialize, Deserialize)]
struct SudokuGrid([[u8; 9]; 9]);

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}

#[wasm_bindgen]
pub fn solve_sudoku(grid_to_solve: JsValue) -> JsValue {
    let grid_to_solve: SudokuGrid = from_value(grid_to_solve).unwrap();

    let mut grid = Grid::new();
    grid = fill_grid(grid, grid_to_solve.0);

    let (grid, success) = solve_grid(grid);

    let result = if success { grid.to_array() } else { [[0; 9]; 9] };

    to_value(&SudokuGrid(result)).unwrap()
}
