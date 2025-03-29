import * as wasm from "front-end";
import { Sudoku } from './class/sudoku';

let grids = [];

const grid_to_solve = [
    [0, 7, 0, 0, 3, 0, 2, 0, 0],
    [0, 0, 5, 0, 0, 2, 9, 0, 0],
    [4, 0, 0, 9, 0, 0, 0, 0, 0],
    [0, 0, 4, 2, 0, 5, 0, 9, 0],
    [0, 1, 0, 3, 9, 0, 7, 0, 6],
    [2, 0, 0, 0, 0, 0, 0, 0, 5],
    [1, 9, 2, 7, 0, 0, 0, 3, 0],
    [0, 4, 7, 5, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 3, 0, 0, 0]
];


const solved_grid = wasm.solve_sudoku(grid_to_solve);

console.log(solved_grid);

grids.push(new Sudoku());