use crate::sudoku::grid;
use std::collections::HashSet;

fn check_array_dupes (array: &[u8]) -> bool {
    let mut seen = HashSet::new();
    for &value in array.iter() {
        if value != 0 && !seen.insert(value) {
            return false;  // Found a duplicate
        }
    }

    true  // No duplicates
}

fn is_row_valid (grid: &grid::Grid, row_num: usize) -> bool {
    let mut row: [u8; 9] = [0; 9]; 
    for col in 0..9 {
        row[col] = grid.get(row_num, col);
    }

    check_array_dupes(&row)
}

fn is_col_valid (grid: &grid::Grid, col_num: usize) -> bool {
    let mut col: [u8; 9] = [0; 9];
    for row in 0..9 {
        col[row] = grid.get(row, col_num);
    }

    check_array_dupes(&col)
}

fn is_square_valid (grid: &grid::Grid, row_off: usize, col_off: usize) -> bool {
    let mut square: [u8; 9] = [0; 9];
    let mut idx: usize = 0;

    for i in 0..3 {
        for j in 0..3 {
            square[idx] = grid.get(row_off + i, col_off + j);
            idx += 1;
        }
    }

    check_array_dupes(&square)
}

fn check_grid (grid: &grid::Grid) -> bool {
    for i in 0..9 {
        if !is_row_valid(grid, i) || !is_col_valid(grid, i) {
            return false;
        }
    }

    for i in (0..7).step_by(3) {
        for j in (0..7).step_by(3) {
            if !is_square_valid(grid, i, j) {
                return false;
            }
        }
    }

    true
}

fn get_first_element (grid: &grid::Grid) -> (usize, usize) {
    for i in 0..9 {
        for j in 0..9 {
            if grid.get(i, j) == 0 {
                return (i, j);
            }
        }
    }

    (0, 0)
}

pub fn solve_grid (mut grid: grid::Grid) -> (grid::Grid, bool) {
    let (row, col) = get_first_element(&grid);

    for i in 1..10 {
        grid.set(row, col, i);

        let grid_correct = check_grid(&grid);

        if grid_correct {
            let (r_row, r_col) = get_first_element(&grid);

            if r_row == 0 && r_col == 0 {
                return (grid, true);
            }

            let (solved_grid, result) = solve_grid(grid.clone());

            if result {
                return (solved_grid, true);
            }
        }
    }

    (grid, false)
}