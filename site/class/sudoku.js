import * as wasm from "front-end";
import axios from "axios";
import config from "../config.json";

export class Sudoku {
    // The body of the page, to add things in it
    #body = document.querySelector('body');
    // A div that will contain the grid and all the elements we are going to put in the DOM
    #grid_display = document.createElement('div');
    // A text area reserved for the results of the json processing (we create it here to be able to access it anywhere)
    #json_results = document.createElement('p');

    // An empty grid
    #empty_grid = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    // The grid itself, we start with an empty grid
    #grid = this.#empty_grid;

    constructor() {
        // When the class is constructed, we call this function that will add all elements needed
        this._create_grid();
    }

    // This function shall be called only at the class initialization, it puts everything needed in the DOM
    _create_grid() {
        // The button that, when clicked, will call the function to resolve the sudoku
        const resolve_button = document.createElement('button');
        resolve_button.textContent = 'Resolve the grid';
        // We add an event, when clicked the solve_grid function will be called
        resolve_button.addEventListener('click', this.solve_grid);

        this.#grid_display.append(resolve_button);

        this.#grid_display.classList.add("grid");

        // For the BG color of the cells, just for aesthetics
        let blue = 81;

        // We iterate for each of the lines (x)
        for (let x = 1; x <= 9; x++) {
            // We make a new div that will contain all cells of the line
            const div = document.createElement('div');
            div.classList.add("grid-line");
            // We iterate for each of the cells of the line (columns)
            for (let y = 1; y <= 9; y++) {
                // We make a new element that will be an input, representing the cell
                const cell = document.createElement(('input'));
                // We add these classes to later be able to access and edit this input
                cell.classList.add("x" + x);
                cell.classList.add("y" + y);
                // This class is for css
                cell.classList.add("cell");
                // We set the input to type="text"
                cell.type = "text";
                // The input can only be 1 long
                cell.maxLength = 1;
                // Just some calculations to have a beautiful gradient
                cell.style.backgroundColor = `rgb(${x * 28}, ${y * 28}, ${blue * 3})`;
                // We append the div representing the line the cell element we just created
                div.append(cell);

                // Just to have a beautiful gradient
                blue -= 1;
            };
            // We append the grid_display the line we just created
            this.#grid_display.append(div);
        };

        // Create the file input for Json Grids
        const file_input = document.createElement('input'); // Create the input element
        file_input.type = "file"; // Add it the file type
        file_input.addEventListener("change", this._solveJsonGrids); // Add an even listener for change (change of file) that will call the solveJsonGrids method
        this.#grid_display.append(file_input); // Add the file input to the grid display

        // Add the json_results element to the grid_display
        this.#grid_display.append(this.#json_results);

        // Create an element that will provide the expected structure of the json
        const file_instructions = document.createElement('p');
        file_instructions.innerHTML = `
            Enter a json file above containing grids to solve all of them.<br>
            The file is expected to have to following structure : <br>
            [<br>
            &nbsp;&nbsp;[<br>    
            &nbsp;&nbsp;&nbsp;&nbsp;[Line one as array],<br>    
            &nbsp;&nbsp;&nbsp;&nbsp;...Lines in between<br>    
            &nbsp;&nbsp;&nbsp;&nbsp;[Line nine as array]<br>  
            &nbsp;&nbsp;],<br>  
            &nbsp;&nbsp;[<br>    
            &nbsp;&nbsp;&nbsp;&nbsp;Grid two<br>  
            &nbsp;&nbsp;]<br>  
            &nbsp;&nbsp;... as much grids as you wish<br>
            ]<br>
        `
        // Add the file instructions to the grid_display
        this.#grid_display.append(file_instructions);

        // We finally add the grid_display to the body
        this.#body.append(this.#grid_display);
    }

    // This function put the content of #grid to #grid_display
    _update_grid() {
        // We iterate on the first array, the lines
        this.#grid.forEach((line, x) => {
            // We iterate on each lines, which are arrays too
            line.forEach((cell, y) => {
                // We get the cell using the class we gave it before
                const cell_display = document.querySelector(`.x${x + 1}.y${y + 1}`);

                // We make his value the value of the cell in #grid. If it is 0, it means it's empty.
                cell_display.value = cell === 0 ? " " : cell.toString();
            })
        })
    }

    // This function gets the grid_display, and puts the value in #grid
    _get_grid() {
        // We iterate on the first array, the lines
        this.#grid.forEach((line, x) => {
            // We iterate on each lines, which are arrays too
            line.forEach((cell, y) => {
                // We get the cell using the class we gave it before
                const cell_display = this.#grid_display.querySelector(`.x${x + 1}.y${y + 1}`);

                // The value we are putting is 0, if the value in the cell is valid, we will update it
                let value_to_add = 0;

                // The value of the cell input turned into an integer
                const cell_value = parseInt(cell_display.value);

                // If the cell value is a number, and it is between 1 and 9...
                if (!isNaN(cell_value) && cell_value >= 1 && cell_value <= 9) {
                    // We make value_to_add the value of the cell
                    value_to_add = cell_value;
                }
                // Else, either the cell is empty, or it is not valid, in that case, we just let cell_value as it was, 0, so, empty cell

                // We cannot edit directly cell as it is a copy, not a reference
                this.#grid[x][y] = value_to_add
            })
        })
    }

    // This function does not directly solves the grid, it calls something else (WASM function or an API) to solve the grid.
    solve_grid = () => {
        // We first update #grid to what the user put in #grid_to_display
        this._get_grid();

        // We call the wasm.solve_sudoku function with the grid as an argument, it will returned the solved grid or an empty grid if the grid isn't solvable 
        this.#grid = wasm.solve_sudoku(this.#grid);

        // Call the updated_grid function to update the grid in the DOM to the newly solved grid
        this._update_grid();
    }

    // We do a separate function for that cause of the async API request, we cannot put this code just after the conditions, as it will be executed before the grid is resolved for the API option, and we don't want to repeat ourselfs in each condition
    _verify_solved_grid = (solved_grid) => {
        // If we have an empty grid here, it means the grid isn't solvable
        if (solved_grid === this.#empty_grid) {
            alert("The grid isn't solvable");
        } else {
            // Else, we update #grid to be what the resolver returned
            this.#grid = solved_grid;
        }

        // We update #grid_to_display to the solution.
        this._update_grid();
    }

    // This function gets the files uploaded, parse them, solve all grids and send the result to the user
    _solveJsonGrids = async (e) => {
        const file = e.target.files[0]; // Get the file that should contain the grids 
        if (!file) return; // If there is not file, we just return and do nothing (this function might get triggered if we remove a file)

        const buffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);

        let result = wasm.solve_json(uint8Array); // Call the solve_json function from the WASM that will parse and solve the json

        if (result == "error_json") { // If the result is just "error_json"
            this.#json_results.innerHTML = `Error : incorrect json format.`; // Display an error
            return; // Return so we don't continue execution after
        }

        // If we get here, it should have worked and we should have a valid result

        result = JSON.parse(result); // Parse the json returned by the WASM

        // Display the stats
        this.#json_results.innerHTML = `
            Total time spent solving the grids (including parsing json) : ${result.time.total_ms / 1000}s<br>
            Time spent actually solving the grids : ${result.time.solving_ms / 1000}s<br>
            Average time spent per grid : ${result.time.avg_solve_ms / 1000}s<br>
            Number of grids : ${result.total_grids}
        `
        // Make the user download the grids
        const gridsJson = JSON.stringify(result.solved_grids, null, 2); // Convert to a json string
        const blob = new Blob([gridsJson], { type: "application/json" });

        // Create a temporary link that we will make the user click automatically
        const url = URL.createObjectURL(blob); // Create a URL object
        const a = document.createElement("a"); // Create an actual link element
        a.href = url; // Make the link point to the URL object
        a.download = "solved_grids.json"; // Choose file name
        a.click(); // Simulate a click on the link
        URL.revokeObjectURL(url); // Delete the Url object we created

    }
}
