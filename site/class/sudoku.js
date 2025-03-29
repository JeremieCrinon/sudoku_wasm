export class Sudoku {
    #body = document.querySelector('body');
    #grid_display = document.createElement('div');
    #grid = [
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

    #resolver = "JS";

    constructor() {
        this._create_grid();
    }

    _create_grid() {
        const resolve_button = document.createElement('button');
        resolve_button.textContent = 'Resolve the grid';
        resolve_button.addEventListener('click', this.solve_grid);

        const resolver_radio = document.createElement('fieldset');

        // Using inner HTML can be a security threat if part of what is set can come from a user without being santized. Which is not the case here.
        resolver_radio.innerHTML = `
            <legend>Please select the resolver you want.</legend>
            <div>
                <input type="radio" id="resolve_radio_js" name="resolve_radio_element" class="resolve_radio_element" value="JS" checked />
                <label for="resolve_radio_js">JS</label>

                <input type="radio" id="resolve_radio_wasm" name="resolve_radio_element" class="resolve_radio_element" value="WASM" />
                <label for="resolve_radio_wasm">WASM</label>
                
                <input type="radio" id="resolve_radio_api" name="resolve_radio_element" class="resolve_radio_element" value="API" />
                <label for="resolve_radio_api">API</label>
            </div>
        `;

        const resolve_radio_elements = resolver_radio.querySelectorAll('.resolve_radio_element');
        resolve_radio_elements.forEach((e) => {
            e.addEventListener('click', (event) => {
                this.#resolver = event.target.value;
            });
        })

        this.#grid_display.classList.add("grid");
        resolver_radio.append(resolve_button);
        this.#grid_display.append(resolver_radio);
        
        this.#body.append(this.#grid_display);
    }

    _update_grid() {
        
    }

    solve_grid = () => {
        alert("Solve grid");
    }
}