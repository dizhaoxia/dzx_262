import { ref, reactive, computed, watch, onUnmounted } from 'vue';
import {
  type Difficulty,
  type Cell,
  generatePuzzle,
  createBoardFromPuzzle,
  checkConflicts,
  isBoardComplete,
  getHintLimit,
  cloneBoard,
  countNumbers,
  getFilledCount,
} from '@/utils/sudoku';

interface HistoryEntry {
  type: 'fill' | 'erase' | 'hint';
  row: number;
  col: number;
  oldValue: number;
  newValue: number;
  oldIsHint: boolean;
  newIsHint: boolean;
}

interface SavedGame {
  initialPuzzle: number[][];
  solution: number[][];
  boardState: Cell[][];
  difficulty: Difficulty;
  elapsedSeconds: number;
  hintsRemaining: number;
  history: HistoryEntry[];
  timestamp: number;
}

const STORAGE_KEY = 'sudoku_save_v1';

let timerInterval: ReturnType<typeof setInterval> | null = null;

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
  const solution = ref<number[][] | null>(null);

  const elapsedSeconds = ref(0);
  const isPaused = ref(false);

  const hintsRemaining = ref(0);

  const history = reactive<HistoryEntry[]>([]);

  const showRestoreModal = ref(false);
  const savedGameData = ref<SavedGame | null>(null);

  const shakeCellKey = ref(0);

  const selectedCell = computed(() => {
    if (selectedRow.value === null || selectedCol.value === null) return null;
    return board[selectedRow.value]?.[selectedCol.value] || null;
  });

  const hasSelectedCell = computed(() => selectedRow.value !== null && selectedCol.value !== null);

  const numberCounts = computed(() =>
    board && board.length > 0
      ? countNumbers(board)
      : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }
  );

  const filledCount = computed(() =>
    board && board.length > 0 ? getFilledCount(board) : 0
  );
  const completionPercent = computed(() =>
    board && board.length > 0 ? Math.round((filledCount.value / 81) * 100) : 0
  );

  const canUndo = computed(() => history.length > 0 && !isWon.value);

  const formattedTime = computed(() => {
    const total = elapsedSeconds.value;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  });

  function startTimer(): void {
    stopTimer();
    timerInterval = setInterval(() => {
      if (!isPaused.value && !isWon.value) {
        elapsedSeconds.value++;
      }
    }, 1000);
  }

  function stopTimer(): void {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function togglePause(): void {
    if (isWon.value) return;
    isPaused.value = !isPaused.value;
    isLocked.value = isPaused.value;
    saveGame();
  }

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

  function isSameNumber(row: number, col: number): boolean {
    if (selectedRow.value === null || selectedCol.value === null) return false;
    const selectedVal = board[selectedRow.value][selectedCol.value].value;
    if (selectedVal === 0) return false;
    return board[row][col].value === selectedVal;
  }

  function selectCell(row: number, col: number): void {
    if (isLocked.value) return;
    selectedRow.value = row;
    selectedCol.value = col;
    clearMessage();
  }

  function clearSelection(): void {
    selectedRow.value = null;
    selectedCol.value = null;
  }

  function clearMessage(): void {
    message.value = '';
    messageType.value = 'info';
  }

  function setMessage(msg: string, type: 'info' | 'error' | 'success' = 'info'): void {
    message.value = msg;
    messageType.value = type;
  }

  function triggerShake(): void {
    shakeCellKey.value++;
  }

  function setNumber(num: number): void {
    if (isLocked.value || !hasSelectedCell.value || selectedCell.value?.isFixed) return;

    const row = selectedRow.value!;
    const col = selectedCol.value!;
    const previousValue = board[row][col].value;
    const previousIsHint = !!board[row][col].isHint;

    board[row][col].value = num;
    board[row][col].isHint = false;

    const hasConflict = checkConflicts(board);

    if (hasConflict) {
      setMessage('行/列/宫冲突', 'error');
      board[row][col].value = previousValue;
      board[row][col].isHint = previousIsHint;
      checkConflicts(board);
      triggerShake();
      return;
    }

    history.push({
      type: 'fill',
      row,
      col,
      oldValue: previousValue,
      newValue: num,
      oldIsHint: previousIsHint,
      newIsHint: false,
    });

    clearMessage();
    saveGame();

    if (isBoardComplete(board)) {
      handleVictory();
    }
  }

  function eraseCell(): void {
    if (isLocked.value || !hasSelectedCell.value || selectedCell.value?.isFixed) return;

    const row = selectedRow.value!;
    const col = selectedCol.value!;
    const previousValue = board[row][col].value;
    const previousIsHint = !!board[row][col].isHint;

    if (previousValue === 0) return;

    board[row][col].value = 0;
    board[row][col].isHint = false;
    checkConflicts(board);

    history.push({
      type: 'erase',
      row,
      col,
      oldValue: previousValue,
      newValue: 0,
      oldIsHint: previousIsHint,
      newIsHint: false,
    });

    clearMessage();
    saveGame();
  }

  function useHint(): void {
    if (isLocked.value || !hasSelectedCell.value || selectedCell.value?.isFixed) return;
    if (!solution.value) return;
    if (hintsRemaining.value <= 0) {
      setMessage('提示次数已用尽', 'error');
      return;
    }

    const row = selectedRow.value!;
    const col = selectedCol.value!;
    const previousValue = board[row][col].value;
    const previousIsHint = !!board[row][col].isHint;
    const correctValue = solution.value[row][col];

    if (previousValue === correctValue && previousIsHint) {
      setMessage('该格已是正确答案', 'info');
      return;
    }

    board[row][col].value = correctValue;
    board[row][col].isHint = true;
    checkConflicts(board);

    history.push({
      type: 'hint',
      row,
      col,
      oldValue: previousValue,
      newValue: correctValue,
      oldIsHint: previousIsHint,
      newIsHint: true,
    });

    hintsRemaining.value--;
    setMessage(`已使用提示，剩余 ${hintsRemaining.value} 次`, 'success');
    saveGame();

    if (isBoardComplete(board)) {
      handleVictory();
    }
  }

  function undo(): void {
    if (!canUndo.value) return;

    const last = history.pop()!;
    board[last.row][last.col].value = last.oldValue;
    board[last.row][last.col].isHint = last.oldIsHint;
    checkConflicts(board);

    if (last.type === 'hint') {
      hintsRemaining.value++;
    }

    selectedRow.value = last.row;
    selectedCol.value = last.col;
    clearMessage();
    saveGame();
  }

  function handleVictory(): void {
    isWon.value = true;
    isLocked.value = true;
    stopTimer();
    setMessage('恭喜你完成了数独！', 'success');
    clearSavedGame();
  }

  function startGame(diff: Difficulty, fromRestore = false, restoreData?: SavedGame): void {
    stopTimer();

    let puzzleData: { puzzle: number[][]; solution: number[][] };
    if (fromRestore && restoreData) {
      puzzleData = { puzzle: restoreData.initialPuzzle, solution: restoreData.solution };
    } else {
      puzzleData = generatePuzzle(diff);
    }

    initialPuzzle.value = puzzleData.puzzle.map(row => [...row]);
    solution.value = puzzleData.solution.map(row => [...row]);

    board.length = 0;
    const newBoard = fromRestore && restoreData
      ? restoreData.boardState.map(row => row.map(cell => ({ ...cell })))
      : createBoardFromPuzzle(puzzleData.puzzle);
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

    hintsRemaining.value = fromRestore && restoreData ? restoreData.hintsRemaining : getHintLimit(diff);
    history.length = 0;
    if (fromRestore && restoreData) {
      for (const entry of restoreData.history) {
        history.push({ ...entry });
      }
    }

    elapsedSeconds.value = fromRestore && restoreData ? restoreData.elapsedSeconds : 0;
    isPaused.value = false;
    startTimer();

    if (fromRestore) {
      checkConflicts(board);
    }
    saveGame();
  }

  function restartGame(): void {
    if (!initialPuzzle.value || !solution.value) return;

    stopTimer();

    const newBoard = createBoardFromPuzzle(initialPuzzle.value);
    board.length = 0;
    for (let i = 0; i < 9; i++) {
      board.push(newBoard[i]);
    }

    isWon.value = false;
    isLocked.value = false;
    isPaused.value = false;
    selectedRow.value = null;
    selectedCol.value = null;
    clearMessage();

    hintsRemaining.value = difficulty.value ? getHintLimit(difficulty.value) : 0;
    history.length = 0;
    elapsedSeconds.value = 0;
    startTimer();
    saveGame();
  }

  function newGame(): void {
    stopTimer();
    clearSavedGame();
    showDifficultySelector.value = true;
    isWon.value = false;
    isLocked.value = false;
    isPaused.value = false;
    selectedRow.value = null;
    selectedCol.value = null;
    board.length = 0;
    initialPuzzle.value = null;
    solution.value = null;
    difficulty.value = null;
    hintsRemaining.value = 0;
    history.length = 0;
    elapsedSeconds.value = 0;
    clearMessage();
  }

  function saveGame(): void {
    if (showDifficultySelector.value || isWon.value || !difficulty.value || !initialPuzzle.value || !solution.value) {
      return;
    }
    const data: SavedGame = {
      initialPuzzle: initialPuzzle.value.map(row => [...row]),
      solution: solution.value.map(row => [...row]),
      boardState: cloneBoard(board),
      difficulty: difficulty.value,
      elapsedSeconds: elapsedSeconds.value,
      hintsRemaining: hintsRemaining.value,
      history: [...history],
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save game:', e);
    }
  }

  function clearSavedGame(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear save:', e);
    }
  }

  function loadSavedGame(): SavedGame | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SavedGame;
      if (!parsed.initialPuzzle || !parsed.solution || !parsed.difficulty) return null;
      return parsed;
    } catch (e) {
      console.warn('Failed to load save:', e);
      return null;
    }
  }

  function checkForSavedGame(): void {
    const saved = loadSavedGame();
    if (saved) {
      savedGameData.value = saved;
      showRestoreModal.value = true;
    }
  }

  function restoreGame(): void {
    if (!savedGameData.value) return;
    const data = savedGameData.value;
    showRestoreModal.value = false;
    startGame(data.difficulty, true, data);
    savedGameData.value = null;
  }

  function discardSavedGame(): void {
    showRestoreModal.value = false;
    clearSavedGame();
    savedGameData.value = null;
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (showRestoreModal.value) return;

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      undo();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      clearSelection();
      return;
    }

    if (event.key === ' ') {
      event.preventDefault();
      togglePause();
      return;
    }

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
          event.preventDefault();
          if (row > 0) selectCell(row - 1, col);
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (row < 8) selectCell(row + 1, col);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (col > 0) selectCell(row, col - 1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (col < 8) selectCell(row, col + 1);
          break;
      }
    } else {
      if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
        event.preventDefault();
        selectCell(0, 0);
      }
    }
  }

  onUnmounted(() => {
    stopTimer();
  });

  watch(elapsedSeconds, () => {
    if (!showDifficultySelector.value && !isWon.value) {
      saveGame();
    }
  });

  return {
    board,
    selectedRow,
    selectedCol,
    selectedCell,
    hasSelectedCell,
    difficulty,
    isWon,
    isLocked,
    isPaused,
    message,
    messageType,
    showDifficultySelector,
    elapsedSeconds,
    formattedTime,
    hintsRemaining,
    history,
    numberCounts,
    completionPercent,
    canUndo,
    showRestoreModal,
    savedGameData,
    shakeCellKey,
    isInSameRow,
    isInSameCol,
    isInSameBox,
    isSameNumber,
    selectCell,
    clearSelection,
    setNumber,
    eraseCell,
    useHint,
    undo,
    togglePause,
    startGame,
    restartGame,
    newGame,
    handleKeyDown,
    checkForSavedGame,
    restoreGame,
    discardSavedGame,
  };
}
