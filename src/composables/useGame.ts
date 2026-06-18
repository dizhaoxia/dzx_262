import { ref, reactive, computed } from 'vue';
import {
  type Difficulty,
  type Cell,
  generatePuzzle,
  createBoardFromPuzzle,
  checkConflicts,
  isBoardComplete,
} from '@/utils/sudoku';

export function useGame() {
  const board = reactive<Cell[][]>([]);
  const selectedRow = ref<number | null>(null);
  const selectedCol = ref<number | null>(null);
  const difficulty = ref<Difficulty | null>(null);
  const isWon = ref(false);
  const isLocked = ref(false);
  const message = ref('');
  const messageType = ref<'info' | 'error' | 'success'>('info');
  const showDifficultySelector = ref(true);
  const initialPuzzle = ref<number[][] | null>(null);

  const selectedCell = computed(() => {
    if (selectedRow.value === null || selectedCol.value === null) return null;
    return board[selectedRow.value]?.[selectedCol.value] || null;
  });

  const hasSelectedCell = computed(() => selectedRow.value !== null && selectedCol.value !== null);

  function isInSameRow(row: number): boolean {
    return selectedRow.value === row;
  }

  function isInSameCol(col: number): boolean {
    return selectedCol.value === col;
  }

  function isInSameBox(row: number, col: number): boolean {
    if (selectedRow.value === null || selectedCol.value === null) return false;
    const boxRow = Math.floor(selectedRow.value / 3);
    const boxCol = Math.floor(selectedCol.value / 3);
    const cellBoxRow = Math.floor(row / 3);
    const cellBoxCol = Math.floor(col / 3);
    return boxRow === cellBoxRow && boxCol === cellBoxCol;
  }

  function selectCell(row: number, col: number): void {
    if (isLocked.value) return;
    selectedRow.value = row;
    selectedCol.value = col;
    clearMessage();
  }

  function clearMessage(): void {
    message.value = '';
    messageType.value = 'info';
  }

  function setMessage(msg: string, type: 'info' | 'error' | 'success' = 'info'): void {
    message.value = msg;
    messageType.value = type;
  }

  function setNumber(num: number): void {
    if (isLocked.value || !hasSelectedCell.value || selectedCell.value?.isFixed) return;

    const row = selectedRow.value!;
    const col = selectedCol.value!;
    const previousValue = board[row][col].value;

    board[row][col].value = num;

    const hasConflict = checkConflicts(board);

    if (hasConflict) {
      setMessage('行/列/宫冲突', 'error');
      board[row][col].value = previousValue;
      checkConflicts(board);
      return;
    }

    clearMessage();

    if (isBoardComplete(board)) {
      isWon.value = true;
      isLocked.value = true;
      setMessage('恭喜你完成了数独！', 'success');
    }
  }

  function eraseCell(): void {
    if (isLocked.value || !hasSelectedCell.value || selectedCell.value?.isFixed) return;

    const row = selectedRow.value!;
    const col = selectedCol.value!;

    board[row][col].value = 0;
    checkConflicts(board);
    clearMessage();
  }

  function startGame(diff: Difficulty): void {
    const { puzzle } = generatePuzzle(diff);
    initialPuzzle.value = puzzle.map(row => [...row]);
    
    board.length = 0;
    const newBoard = createBoardFromPuzzle(puzzle);
    for (let i = 0; i < 9; i++) {
      board.push(newBoard[i]);
    }

    difficulty.value = diff;
    isWon.value = false;
    isLocked.value = false;
    selectedRow.value = null;
    selectedCol.value = null;
    showDifficultySelector.value = false;
    clearMessage();
  }

  function restartGame(): void {
    if (!initialPuzzle.value) return;

    const newBoard = createBoardFromPuzzle(initialPuzzle.value);
    board.length = 0;
    for (let i = 0; i < 9; i++) {
      board.push(newBoard[i]);
    }

    isWon.value = false;
    isLocked.value = false;
    selectedRow.value = null;
    selectedCol.value = null;
    clearMessage();
  }

  function newGame(): void {
    showDifficultySelector.value = true;
    isWon.value = false;
    isLocked.value = false;
    selectedRow.value = null;
    selectedCol.value = null;
    board.length = 0;
    initialPuzzle.value = null;
    difficulty.value = null;
    clearMessage();
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (isLocked.value || showDifficultySelector.value) return;

    const key = event.key;

    if (key >= '1' && key <= '9') {
      setNumber(parseInt(key, 10));
      return;
    }

    if (key === 'Backspace' || key === 'Delete') {
      eraseCell();
      return;
    }

    if (hasSelectedCell.value) {
      const row = selectedRow.value!;
      const col = selectedCol.value!;

      switch (key) {
        case 'ArrowUp':
          if (row > 0) selectCell(row - 1, col);
          break;
        case 'ArrowDown':
          if (row < 8) selectCell(row + 1, col);
          break;
        case 'ArrowLeft':
          if (col > 0) selectCell(row, col - 1);
          break;
        case 'ArrowRight':
          if (col < 8) selectCell(row, col + 1);
          break;
      }
    }
  }

  return {
    board,
    selectedRow,
    selectedCol,
    selectedCell,
    hasSelectedCell,
    difficulty,
    isWon,
    isLocked,
    message,
    messageType,
    showDifficultySelector,
    isInSameRow,
    isInSameCol,
    isInSameBox,
    selectCell,
    setNumber,
    eraseCell,
    startGame,
    restartGame,
    newGame,
    handleKeyDown,
  };
}
