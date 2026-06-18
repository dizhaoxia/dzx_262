<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useGame } from '@/composables/useGame';
import SudokuBoard from '@/components/SudokuBoard.vue';
import NumberPad from '@/components/NumberPad.vue';
import DifficultySelector from '@/components/DifficultySelector.vue';
import GameControls from '@/components/GameControls.vue';
import VictoryModal from '@/components/VictoryModal.vue';
import type { Difficulty } from '@/utils/sudoku';

const {
  board,
  selectedRow,
  selectedCol,
  isWon,
  isLocked,
  message,
  messageType,
  showDifficultySelector,
  difficulty,
  selectCell,
  setNumber,
  eraseCell,
  startGame,
  restartGame,
  newGame,
  handleKeyDown,
} = useGame();

const difficultyLabel = computed(() => {
  const labels: Record<Difficulty, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  };
  return difficulty.value ? labels[difficulty.value] : '';
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

function handleRestart(): void {
  restartGame();
}

function handleNewGame(): void {
  newGame();
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="sudoku-game">
    <div class="game-container">
      <h1 class="game-title">数独游戏</h1>

      <div v-if="showDifficultySelector" class="selector-wrapper">
        <DifficultySelector @select="handleSelectDifficulty" />
      </div>

      <template v-else>
        <div class="game-header">
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

        <div class="game-content">
          <div class="board-section">
            <SudokuBoard
              :board="board"
              :selected-row="selectedRow"
              :selected-col="selectedCol"
              :is-locked="isLocked"
              @select-cell="selectCell"
            />
          </div>

          <div class="side-section">
            <NumberPad
              :disabled="isLocked"
              @number-click="handleNumberClick"
              @erase-click="handleEraseClick"
            />
            <GameControls
              :disabled="isLocked"
              @restart="handleRestart"
              @new-game="handleNewGame"
            />
          </div>
        </div>

        <div class="keyboard-hint">
          提示：也可以使用键盘 1-9 输入数字，Delete/Backspace 擦除，方向键移动选择
        </div>
      </template>
    </div>

    <VictoryModal
      :show="isWon"
      @restart="handleRestart"
      @new-game="handleNewGame"
    />
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
  gap: 24px;
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
  gap: 32px;
  align-items: flex-start;
}

.board-section {
  flex-shrink: 0;
}

.side-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.keyboard-hint {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  text-align: center;
  max-width: 400px;
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

@media (max-width: 768px) {
  .game-content {
    flex-direction: column;
    align-items: center;
  }

  .game-title {
    font-size: 36px;
    letter-spacing: 2px;
  }

  .side-section {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .sudoku-game {
    padding: 16px;
  }

  .game-title {
    font-size: 28px;
  }

  .game-content {
    gap: 20px;
  }

  .keyboard-hint {
    font-size: 12px;
  }
}
</style>
