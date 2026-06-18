<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useGame } from '@/composables/useGame';
import SudokuBoard from '@/components/SudokuBoard.vue';
import NumberPad from '@/components/NumberPad.vue';
import DifficultySelector from '@/components/DifficultySelector.vue';
import GameControls from '@/components/GameControls.vue';
import VictoryModal from '@/components/VictoryModal.vue';
import RestoreGameModal from '@/components/RestoreGameModal.vue';
import NumberStats from '@/components/NumberStats.vue';
import type { Difficulty } from '@/utils/sudoku';

const {
  board,
  selectedRow,
  selectedCol,
  isWon,
  isLocked,
  isPaused,
  message,
  messageType,
  showDifficultySelector,
  difficulty,
  formattedTime,
  hintsRemaining,
  canUndo,
  numberCounts,
  completionPercent,
  showRestoreModal,
  savedGameData,
  shakeCellKey,
  selectCell,
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
} = useGame();

const difficultyLabel = computed(() => {
  const labels: Record<Difficulty, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  };
  return difficulty.value ? labels[difficulty.value] : '';
});

const savedFormattedTime = computed(() => {
  if (!savedGameData.value) return '00:00:00';
  const total = savedGameData.value.elapsedSeconds;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
});

const savedCompletionPercent = computed(() => {
  if (!savedGameData.value) return 0;
  let filled = 0;
  for (const row of savedGameData.value.boardState) {
    for (const cell of row) {
      if (cell.value !== 0) filled++;
    }
  }
  return Math.round((filled / 81) * 100);
});

const savedHintsRemaining = computed(() => {
  return savedGameData.value?.hintsRemaining ?? 0;
});

function handleSelectDifficulty(diff: Difficulty): void {
  startGame(diff);
}

function handleNumberClick(num: number): void {
  setNumber(num);
}

function handleEraseClick(): void {
  eraseCell();
}

function handleHintClick(): void {
  useHint();
}

function handleUndoClick(): void {
  undo();
}

function handleTogglePause(): void {
  togglePause();
}

function handleRestart(): void {
  restartGame();
}

function handleNewGame(): void {
  newGame();
}

function handleRestore(): void {
  restoreGame();
}

function handleDiscard(): void {
  discardSavedGame();
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  checkForSavedGame();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="sudoku-game">
    <div class="game-container">
      <h1 class="game-title">数独游戏</h1>

      <div v-if="showDifficultySelector && !showRestoreModal" class="selector-wrapper">
        <DifficultySelector @select="handleSelectDifficulty" />
      </div>

      <template v-else-if="!showRestoreModal">
        <div class="game-header">
          <div class="header-row">
            <div class="difficulty-badge" :class="difficulty">
              {{ difficultyLabel }}模式
            </div>
            <div
              class="message"
              :class="messageType"
              v-if="message && !isWon"
            >
              {{ message }}
            </div>
          </div>
        </div>

        <div class="game-content">
          <div class="board-section">
            <SudokuBoard
              :board="board"
              :selected-row="selectedRow"
              :selected-col="selectedCol"
              :is-locked="isLocked"
              :is-paused="isPaused"
              :shake-key="shakeCellKey"
              @select-cell="selectCell"
            />
            <div class="stats-section">
              <NumberStats
                :number-counts="numberCounts"
                :completion-percent="completionPercent"
              />
            </div>
          </div>

          <div class="side-section">
            <NumberPad
              :disabled="isLocked"
              :hints-remaining="hintsRemaining"
              :can-undo="canUndo"
              :is-paused="isPaused"
              @number-click="handleNumberClick"
              @erase-click="handleEraseClick"
              @hint-click="handleHintClick"
              @undo-click="handleUndoClick"
              @toggle-pause="handleTogglePause"
            />
            <GameControls
              :disabled="isWon"
              :formatted-time="formattedTime"
              :is-paused="isPaused"
              @restart="handleRestart"
              @new-game="handleNewGame"
            />
          </div>
        </div>

        <div class="keyboard-hint">
          <span class="hint-item">↑↓←→ 移动</span>
          <span class="hint-sep">·</span>
          <span class="hint-item">1-9 填数</span>
          <span class="hint-sep">·</span>
          <span class="hint-item">Backspace 擦除</span>
          <span class="hint-sep">·</span>
          <span class="hint-item">Ctrl+Z 撤销</span>
          <span class="hint-sep">·</span>
          <span class="hint-item">空格 暂停</span>
          <span class="hint-sep">·</span>
          <span class="hint-item">Esc 取消选中</span>
        </div>
      </template>

      <VictoryModal
        :show="isWon"
        :formatted-time="formattedTime"
        :completion-percent="completionPercent"
        @restart="handleRestart"
        @new-game="handleNewGame"
      />

      <RestoreGameModal
        :show="showRestoreModal"
        :formatted-time="savedFormattedTime"
        :difficulty="savedGameData?.difficulty ?? null"
        :completion-percent="savedCompletionPercent"
        :hints-remaining="savedHintsRemaining"
        @restore="handleRestore"
        @discard="handleDiscard"
      />
    </div>
  </div>
</template>

<style scoped>
.sudoku-game {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.sudoku-game::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
  animation: float 20s ease-in-out infinite;
}

.game-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.game-title {
  font-size: 48px;
  font-weight: 800;
  color: white;
  margin: 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  letter-spacing: 4px;
}

.selector-wrapper {
  margin-top: 20px;
}

.game-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.difficulty-badge {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  backdrop-filter: blur(10px);
}

.difficulty-badge.easy {
  background: rgba(16, 185, 129, 0.8);
}

.difficulty-badge.medium {
  background: rgba(245, 158, 11, 0.8);
}

.difficulty-badge.hard {
  background: rgba(239, 68, 68, 0.8);
}

.message {
  font-size: 16px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  min-height: 20px;
}

.message.info {
  color: rgba(255, 255, 255, 0.8);
}

.message.error {
  background: rgba(239, 68, 68, 0.9);
  color: white;
  animation: shake 0.4s ease-in-out;
}

.message.success {
  background: rgba(16, 185, 129, 0.9);
  color: white;
}

.game-content {
  display: flex;
  gap: 28px;
  align-items: flex-start;
}

.board-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.stats-section {
  width: 100%;
  display: flex;
  justify-content: center;
}

.side-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.keyboard-hint {
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
  text-align: center;
  max-width: 600px;
  line-height: 1.8;
}

.hint-item {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin: 2px 0;
}

.hint-sep {
  color: rgba(255, 255, 255, 0.3);
  margin: 0 4px;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(30px, -30px) rotate(5deg); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

@media (max-width: 900px) {
  .game-content {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 768px) {
  .game-title {
    font-size: 36px;
    letter-spacing: 2px;
  }

  .side-section {
    flex-direction: column;
    align-items: center;
  }

  .keyboard-hint {
    font-size: 11px;
    padding: 0 8px;
  }
}

@media (max-width: 480px) {
  .sudoku-game {
    padding: 16px 8px;
  }

  .game-title {
    font-size: 28px;
  }

  .game-content {
    gap: 20px;
  }

  .keyboard-hint {
    font-size: 10px;
  }
}
</style>
