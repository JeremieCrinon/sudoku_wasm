use crate::sudoku::grid;

pub fn fill_grid(mut grid: grid::Grid, grid_to_fill: [[u8; 9]; 9]) -> grid::Grid {
    for row in 0..9 {
        for col in 0..9 {
            let value = grid_to_fill[row][col];
            grid.set(row, col, value);
        }
    }

    grid
}