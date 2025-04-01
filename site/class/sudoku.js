import * as wasm from "front-end";
import axios from "axios";
import config from "../config.json";

export class Sudoku {
    // The body of the page, to add things in it
    #body = document.querySelector('body');
    // And div that will contain the grid and all the elements we are going to put in the DOM
    #grid_display = document.createElement('div');

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

    // Which resolver the user chooses
    #resolver = "WASM";

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

        // A radio field that will able the user to choose which solver he wants
        const resolver_radio = document.createElement('fieldset');

        // We add the radio buttons. Using inner HTML can be a security threat if part of what is set can come from a user without being santized. Which is not the case here.
        resolver_radio.innerHTML = `
            <legend>Please select the resolver you want.</legend>
            <div>
                <input type="radio" id="resolve_radio_wasm" name="resolve_radio_element" class="resolve_radio_element" value="WASM" checked />
                <label for="resolve_radio_wasm">WASM</label>
                
                <input type="radio" id="resolve_radio_api" name="resolve_radio_element" class="resolve_radio_element" value="API" />
                <label for="resolve_radio_api">API</label>
            </div>
        `;

        // We get each elements we just created
        const resolve_radio_elements = resolver_radio.querySelectorAll('.resolve_radio_element');
        resolve_radio_elements.forEach((e) => {
            e.addEventListener('click', (event) => {
                // When a radio button is clicked, we switch the #resolver to the value of the button, so we can know later which solver the user wanna use
                this.#resolver = event.target.value;
            });
        })

        this.#grid_display.classList.add("grid");
        resolver_radio.append(resolve_button);
        this.#grid_display.append(resolver_radio);

        // For the BG color of the cells, just for aesthetics
        let blue = 81;

        // We iterate for each of the lines (x)
        for (let x = 1 ; x <= 9 ; x++) {
            // We make a new div that will contain all cells of the line
            const div = document.createElement('div');
            div.classList.add("grid-line");
            // We iterate for each of the cells of the line (columns)
            for (let y = 1 ; y <= 9 ; y++ ) {
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
                const cell_display = document.querySelector(`.x${x + 1}.y${y + 1}`);

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

        // We look at what the #resoler looks like, it is equal to what the user choose in the solver radio above
        if (this.#resolver === "WASM") {

            // We call the wasm.solve_sudoku function with the grid as an argument, and whatever the wasm returned calls the verify_solved_grid function (we call 2 functions in one line, first, the wasm.solve_sudoku, and what is returned by it is the argument for the verify_solved_grid that is then called)
            this._verify_solved_grid(wasm.solve_sudoku(this.#grid));

        } else if (this.#resolver === "API") {

            // We fetch the result from config.api_url
            axios.post(`${config.api_url}/sudoku`, {
                // We put the grid in the body of the request
                grid: this.#grid,
            })
            // 
            .then((r) => {
                this._verify_solved_grid(r.data.solved_grid);
            })
            .catch((e) => {
                if (e.status === 400 || e.status === 422) {
                    // If it is a 400 or 422 error, it means the grid isn't solvable
                    alert("The grid isn't solvable");
                } else {
                    // Else it means there has been an unknown error
                    alert("There has been an error with the API, please try again later");
                }
            })

        } else {

            // It should not be possible to get here without modifying the code, as you can only change #resolver to the values of the radio buttons. But in case there is a bug, or someone modifyies the code, we handle the error
            alert("There has been an error with resolver selection");

        }

        
    }

    // We do a separate function for that cause of the async API request, we cannot put this code just after the conditions, as it will be executed before the grid is resolved for the API option, and we don't want to repeat ourselfs in each condition
    _verify_solved_grid = (solved_grid) => {
        // If we have an empty grid here, it means the grid isn't solvable
        if (solved_grid === this.#empty_grid ) {
            alert("The grid isn't solvable");
        } else {
            // Else, we update #grid to be what the resolver returned
            this.#grid = solved_grid;
        }
        
        // We update #grid_to_display to the solution.
        this._update_grid();
    }
}