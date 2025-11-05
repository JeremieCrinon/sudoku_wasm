# sudoku_wasm
A sudoku resolver has a JS class with 2 ways of resolving :
- Using WASM written in Rust
- Using an API written in Rust (link here : [https://github.com/JeremieCrinon/sudoku_rust_api](https://github.com/JeremieCrinon/sudoku_rust_api))
The code in both this repository and the API are line-by-line commented.


This is the WASM part, it also contains the front-end that calls either the WASM or the API. The site can be found in the site directory. The entry file of the WASM is in src/lib.rs.
