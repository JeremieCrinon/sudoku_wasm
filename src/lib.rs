use sudoku::{fill_grid, solve_grid, Grid};
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use serde_wasm_bindgen::{from_value, to_value};
mod sudoku;
use js_sys::Date;

#[derive(Serialize, Deserialize)]
struct SudokuGrid([[u8; 9]; 9]);

#[wasm_bindgen]
pub fn solve_sudoku(grid_to_solve: JsValue) -> JsValue { // This function is called by the JS, it will get one grid and solve it by calling the necessary functions
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


#[wasm_bindgen]
pub fn solve_json(data: &[u8]) -> String { // This function is called by the JS, it will get a json file, parse it, solve each grids, then return a json file with the solutions
    let start_total = Date::now();

    let s = match std::str::from_utf8(data) {
        Ok(v) => v,
        Err(e) => return format!("UTF-8 error: {}", e),
    };

    let grids: Vec<SudokuGrid> = match serde_json::from_str(s) {
        Ok(v) => v,
        Err(e) => return format!("JSON parse error: {}", e),
    };

    let mut solved_grids: Vec<SudokuGrid> = Vec::with_capacity(grids.len());

    let start_solving = Date::now();

    for grid_to_solve in grids {
        // We make a new grid object, this object will be easier to manipulate than if we used the 2D array directly
        let mut grid = Grid::new();
        // We call the function fill_grid from ./sudoku/fill.rs with the grid object, and the grid_to_solve that the JS gave us
        grid = fill_grid(grid, grid_to_solve.0);

        // We call the solve_grid function, it returns two elements, the solved grid if it can be solved, and success (true = the grid has been solved and is correct, false = the grid cannot be solved and isn't correct)
        let (grid, success) = solve_grid(grid);

        // If success, we make result the grid object that we turned back into an array, else, we return an empty grid, the JS will then know that the grid isn't correct
        let result = if success { grid.to_array() } else { [[0; 9]; 9] };

        solved_grids.push(SudokuGrid(result));
    }

    let solving_duration = Date::now() - start_solving;
    let total_duration = Date::now() - start_total;

    let avg_duration = solving_duration / solved_grids.len() as f64;

    let output = serde_json::json!({
        "solved_grids": solved_grids,
        "time": {
            "total_ms": total_duration,
            "solving_ms": solving_duration,
            "avg_solve_ms": avg_duration
        },
        "total_grids": solved_grids.len()
    });

    serde_json::to_string(&output).unwrap_or_else(|e| format!("Error serializing output: {}", e))
}

