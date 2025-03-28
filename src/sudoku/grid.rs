#[derive(Debug, Clone)]
pub struct Grid {
    cells: [[u8; 9]; 9],
}

impl Grid {
    pub fn new() -> Self {
        Grid { cells: [[0; 9]; 9] }
    }

    pub fn set(&mut self, row: usize, col: usize, value: u8) {
        self.cells[row][col] = value;
    }

    pub fn get(&self, row: usize, col: usize) -> u8 {
        self.cells[row][col]
    }

    pub fn to_array(&self) -> [[u8; 9]; 9] {
        self.cells
    }
}