export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Cell {
  value: number;
  isFixed: boolean;
  isConflict: boolean;
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function isValid(board: number[][], row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
  }
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }
  return true;
}

function fillBoard(board: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of numbers) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function countSolutions(board: number[][], count: { value: number }): void {
  if (count.value > 1) return;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            countSolutions(board, count);
            board[row][col] = 0;
          }
        }
        return;
      }
    }
  }
  count.value++;
}

function hasUniqueSolution(board: number[][]): boolean {
  const copy = board.map(row => [...row]);
  const count = { value: 0 };
  countSolutions(copy, count);
  return count.value === 1;
}

export function generateFullBoard(): number[][] {
  const board: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));
  fillBoard(board);
  return board;
}

function getDifficultyRange(difficulty: Difficulty): [number, number] {
  switch (difficulty) {
    case 'easy':
      return [30, 35];
    case 'medium':
      return [40, 45];
    case 'hard':
      return [50, 55];
  }
}

export function generatePuzzle(difficulty: Difficulty): { puzzle: number[][]; solution: number[][] } {
  const solution = generateFullBoard();
  const puzzle = solution.map(row => [...row]);
  const [min, max] = getDifficultyRange(difficulty);
  const targetHoles = min + Math.floor(Math.random() * (max - min + 1));
  
  const positions: [number, number][] = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      positions.push([i, j]);
    }
  }
  const shuffledPositions = shuffle(positions);
  
  let holes = 0;
  for (const [row, col] of shuffledPositions) {
    if (holes >= targetHoles) break;
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;
    if (hasUniqueSolution(puzzle)) {
      holes++;
    } else {
      puzzle[row][col] = backup;
    }
  }
  
  return { puzzle, solution };
}

export function checkConflicts(board: Cell[][]): boolean {
  let hasConflict = false;
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      board[row][col].isConflict = false;
    }
  }
  
  for (let row = 0; row < 9; row++) {
    const seen = new Map<number, number[]>();
    for (let col = 0; col < 9; col++) {
      const val = board[row][col].value;
      if (val !== 0) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(col);
      }
    }
    for (const cols of seen.values()) {
      if (cols.length > 1) {
        for (const col of cols) {
          board[row][col].isConflict = true;
          hasConflict = true;
        }
      }
    }
  }
  
  for (let col = 0; col < 9; col++) {
    const seen = new Map<number, number[]>();
    for (let row = 0; row < 9; row++) {
      const val = board[row][col].value;
      if (val !== 0) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(row);
      }
    }
    for (const rows of seen.values()) {
      if (rows.length > 1) {
        for (const row of rows) {
          board[row][col].isConflict = true;
          hasConflict = true;
        }
      }
    }
  }
  
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Map<number, [number, number][]>();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const row = boxRow * 3 + i;
          const col = boxCol * 3 + j;
          const val = board[row][col].value;
          if (val !== 0) {
            if (!seen.has(val)) seen.set(val, []);
            seen.get(val)!.push([row, col]);
          }
        }
      }
      for (const cells of seen.values()) {
        if (cells.length > 1) {
          for (const [row, col] of cells) {
            board[row][col].isConflict = true;
            hasConflict = true;
          }
        }
      }
    }
  }
  
  return hasConflict;
}

export function isBoardComplete(board: Cell[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col].value === 0 || board[row][col].isConflict) {
        return false;
      }
    }
  }
  return true;
}

export function createBoardFromPuzzle(puzzle: number[][]): Cell[][] {
  return puzzle.map(row =>
    row.map(value => ({
      value,
      isFixed: value !== 0,
      isConflict: false,
    }))
  );
}
