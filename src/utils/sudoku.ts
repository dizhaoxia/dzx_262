export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Cell {
  value: number;
  isFixed: boolean;
  isConflict: boolean;
  isHint?: boolean;
}

export type SolverStepType = 'try' | 'conflict' | 'backtrack' | 'confirm' | 'complete';

export interface SolverStep {
  type: SolverStepType;
  row: number;
  col: number;
  value: number;
  board: number[][];
  message: string;
}

export interface SolverResult {
  solvable: boolean;
  solution: number[][] | null;
  steps: SolverStep[];
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

export function getHintLimit(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 10;
    case 'medium':
      return 8;
    case 'hard':
      return 5;
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

export function getCandidates(board: Cell[][], row: number, col: number): number[] {
  if (!board || board.length === 0 || !board[row] || !board[row][col]) return [];
  if (board[row][col].value !== 0) return [];
  
  const used = new Set<number>();
  
  for (let i = 0; i < 9; i++) {
    if (board[row][i].value !== 0) used.add(board[row][i].value);
  }
  
  for (let i = 0; i < 9; i++) {
    if (board[i][col].value !== 0) used.add(board[i][col].value);
  }
  
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const val = board[boxRow + i][boxCol + j].value;
      if (val !== 0) used.add(val);
    }
  }
  
  const candidates: number[] = [];
  for (let num = 1; num <= 9; num++) {
    if (!used.has(num)) candidates.push(num);
  }
  return candidates;
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
      isHint: false,
    }))
  );
}

export function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map(row =>
    row.map(cell => ({ ...cell }))
  );
}

export function countNumbers(board: Cell[][]): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  if (!board || board.length === 0) return counts;
  for (let row = 0; row < 9; row++) {
    const r = board[row];
    if (!r) continue;
    for (let col = 0; col < 9; col++) {
      const cell = r[col];
      if (!cell) continue;
      const val = cell.value;
      if (val !== 0) counts[val]++;
    }
  }
  return counts;
}

export function getFilledCount(board: Cell[][]): number {
  let count = 0;
  if (!board || board.length === 0) return 0;
  for (let row = 0; row < 9; row++) {
    const r = board[row];
    if (!r) continue;
    for (let col = 0; col < 9; col++) {
      const cell = r[col];
      if (cell && cell.value !== 0) count++;
    }
  }
  return count;
}

function isValidForSolver(board: number[][], row: number, col: number, num: number): boolean {
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

function cloneNumberBoard(board: number[][]): number[][] {
  return board.map(row => [...row]);
}

function findEmptyCell(board: number[][]): [number, number] | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) return [row, col];
    }
  }
  return null;
}

function solveWithSteps(
  board: number[][],
  steps: SolverStep[]
): boolean {
  const empty = findEmptyCell(board);
  if (!empty) {
    steps.push({
      type: 'complete',
      row: -1,
      col: -1,
      value: 0,
      board: cloneNumberBoard(board),
      message: '🎉 求解完成！所有格子已填满',
    });
    return true;
  }

  const [row, col] = empty;

  for (let num = 1; num <= 9; num++) {
    steps.push({
      type: 'try',
      row,
      col,
      value: num,
      board: cloneNumberBoard(board),
      message: `第${row + 1}行第${col + 1}列尝试数字 ${num}`,
    });

    if (isValidForSolver(board, row, col, num)) {
      board[row][col] = num;

      steps.push({
        type: 'confirm',
        row,
        col,
        value: num,
        board: cloneNumberBoard(board),
        message: `第${row + 1}行第${col + 1}列确定数字 ${num}`,
      });

      if (solveWithSteps(board, steps)) {
        return true;
      }

      steps.push({
        type: 'backtrack',
        row,
        col,
        value: num,
        board: cloneNumberBoard(board),
        message: `第${row + 1}行第${col + 1}列回溯，撤销数字 ${num}`,
      });

      board[row][col] = 0;
    } else {
      steps.push({
        type: 'conflict',
        row,
        col,
        value: num,
        board: cloneNumberBoard(board),
        message: `第${row + 1}行第${col + 1}列尝试数字 ${num} → 冲突（行/列/宫重复）→ 跳过`,
      });
    }
  }

  return false;
}

export function solveSudokuWithSteps(inputBoard: number[][]): SolverResult {
  const board = cloneNumberBoard(inputBoard);
  const steps: SolverStep[] = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== 0) {
        const val = board[row][col];
        board[row][col] = 0;
        if (!isValidForSolver(board, row, col, val)) {
          return {
            solvable: false,
            solution: null,
            steps: [{
              type: 'conflict',
              row,
              col,
              value: val,
              board: cloneNumberBoard(inputBoard),
              message: `❌ 输入盘面无效：第${row + 1}行第${col + 1}列的数字 ${val} 存在冲突`,
            }],
          };
        }
        board[row][col] = val;
      }
    }
  }

  const solvable = solveWithSteps(board, steps);

  return {
    solvable,
    solution: solvable ? board : null,
    steps,
  };
}

export function cellBoardToNumberBoard(board: Cell[][]): number[][] {
  return board.map(row => row.map(cell => cell.value));
}
