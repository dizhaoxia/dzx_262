<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onUnmounted } from 'vue';
import { X, Play, Pause, SkipBack, SkipForward, RotateCcw, Zap, GripVertical } from 'lucide-vue-next';
import type { Cell, SolverStep } from '@/utils/sudoku';
import { solveSudokuWithSteps, cellBoardToNumberBoard } from '@/utils/sudoku';

interface Props {
  visible: boolean;
  board: Cell[][];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const panelPosition = reactive({ x: 20, y: 20 });
const isDragging = ref(false);
const dragOffset = reactive({ x: 0, y: 0 });

const originalBoard = ref<number[][]>([]);
const displayBoard = ref<number[][]>([]);
const solverSteps = ref<SolverStep[]>([]);
const currentStepIndex = ref(-1);
const isPlaying = ref(false);
const isSolved = ref(false);
const speed = ref<'slow' | 'medium' | 'fast'>('medium');
const logContainerRef = ref<HTMLElement | null>(null);

let playInterval: ReturnType<typeof setInterval> | null = null;

const speedMap = {
  slow: 800,
  medium: 400,
  fast: 150,
};

const currentStep = computed(() => {
  if (currentStepIndex.value >= 0 && currentStepIndex.value < solverSteps.value.length) {
    return solverSteps.value[currentStepIndex.value];
  }
  return null;
});

const canPlayForward = computed(() => {
  return currentStepIndex.value < solverSteps.value.length - 1;
});

const canPlayBackward = computed(() => {
  return currentStepIndex.value > 0;
});

const progress = computed(() => {
  if (solverSteps.value.length === 0) return 0;
  return Math.round(((currentStepIndex.value + 1) / solverSteps.value.length) * 100);
});

const logs = computed(() => {
  return solverSteps.value.slice(0, currentStepIndex.value + 1).map((step, index) => ({
    ...step,
    index,
  }));
});

const highlightedCell = computed(() => {
  if (!currentStep.value) return null;
  if (currentStep.value.row < 0 || currentStep.value.col < 0) return null;
  return {
    row: currentStep.value.row,
    col: currentStep.value.col,
    type: currentStep.value.type,
  };
});

watch(() => props.visible, (val) => {
  if (val) {
    resetDemo();
  }
});

watch(currentStepIndex, () => {
  nextTick(() => {
    if (logContainerRef.value) {
      logContainerRef.value.scrollTop = logContainerRef.value.scrollHeight;
    }
  });
});

function startDrag(e: MouseEvent) {
  isDragging.value = true;
  dragOffset.x = e.clientX - panelPosition.x;
  dragOffset.y = e.clientY - panelPosition.y;
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
}

function handleDrag(e: MouseEvent) {
  if (!isDragging.value) return;
  panelPosition.x = e.clientX - dragOffset.x;
  panelPosition.y = e.clientY - dragOffset.y;
}

function stopDrag() {
  isDragging.value = false;
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
}

function resetDemo() {
  stopPlayback();
  originalBoard.value = cellBoardToNumberBoard(props.board);
  displayBoard.value = originalBoard.value.map(row => [...row]);
  solverSteps.value = [];
  currentStepIndex.value = -1;
  isSolved.value = false;
}

function solveInstantly() {
  stopPlayback();
  const result = solveSudokuWithSteps(originalBoard.value);
  solverSteps.value = result.steps;
  if (result.solvable && result.solution) {
    displayBoard.value = result.solution.map(row => [...row]);
    currentStepIndex.value = solverSteps.value.length - 1;
    isSolved.value = true;
  }
}

function prepareSteps() {
  if (solverSteps.value.length === 0) {
    const result = solveSudokuWithSteps(originalBoard.value);
    solverSteps.value = result.steps;
    isSolved.value = result.solvable;
  }
}

function stepForward() {
  prepareSteps();
  if (currentStepIndex.value < solverSteps.value.length - 1) {
    currentStepIndex.value++;
    updateDisplayBoard();
  }
}

function stepBackward() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
    updateDisplayBoard();
  }
}

function updateDisplayBoard() {
  const step = solverSteps.value[currentStepIndex.value];
  if (step) {
    displayBoard.value = step.board.map(row => [...row]);
  }
}

function togglePlayback() {
  if (isPlaying.value) {
    stopPlayback();
  } else {
    startPlayback();
  }
}

function startPlayback() {
  prepareSteps();
  if (currentStepIndex.value >= solverSteps.value.length - 1) {
    currentStepIndex.value = -1;
  }
  isPlaying.value = true;
  playInterval = setInterval(() => {
    if (currentStepIndex.value < solverSteps.value.length - 1) {
      currentStepIndex.value++;
      updateDisplayBoard();
    } else {
      stopPlayback();
    }
  }, speedMap[speed.value]);
}

function stopPlayback() {
  isPlaying.value = false;
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
}

watch(speed, () => {
  if (isPlaying.value) {
    stopPlayback();
    startPlayback();
  }
});

function getCellClass(row: number, col: number, value: number) {
  const classes: string[] = ['solver-cell'];

  if (highlightedCell.value && highlightedCell.value.row === row && highlightedCell.value.col === col) {
    classes.push(`highlight-${highlightedCell.value.type}`);
  }

  if (originalBoard.value[row]?.[col] !== 0) {
    classes.push('original');
  }

  if (col % 3 === 2 && col !== 8) {
    classes.push('border-right-thick');
  }

  if (row % 3 === 2 && row !== 8) {
    classes.push('border-bottom-thick');
  }

  return classes.join(' ');
}

function getStepTypeColor(type: string) {
  switch (type) {
    case 'try': return 'text-blue-400';
    case 'conflict': return 'text-red-400';
    case 'backtrack': return 'text-orange-400';
    case 'confirm': return 'text-green-400';
    case 'complete': return 'text-emerald-400';
    default: return 'text-gray-400';
  }
}

function handleClose() {
  stopPlayback();
  emit('close');
}

onUnmounted(() => {
  stopPlayback();
  stopDrag();
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="solver-lab-overlay"
      :style="{ left: `${panelPosition.x}px`, top: `${panelPosition.y}px` }"
      :class="{ dragging: isDragging }"
    >
      <div class="solver-lab-header" @mousedown="startDrag">
        <div class="header-left">
          <GripVertical :size="16" class="drag-handle" />
          <span class="title">🧠 AI 解题演示器</span>
        </div>
        <button class="close-btn" @click.stop="handleClose">
          <X :size="18" />
        </button>
      </div>

      <div class="solver-lab-body">
        <div class="main-content">
          <div class="mini-board-container">
            <div class="mini-board">
              <div v-for="(row, rowIndex) in displayBoard" :key="rowIndex" class="solver-row">
                <div
                  v-for="(value, colIndex) in row"
                  :key="colIndex"
                  :class="getCellClass(rowIndex, colIndex, value)"
                >
                  <span v-if="value !== 0" class="cell-value">{{ value }}</span>
                </div>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
            </div>
            <div class="progress-text">
              步骤 {{ currentStepIndex + 1 }} / {{ solverSteps.length }}
            </div>
          </div>

          <div class="controls-section">
            <div class="speed-control">
              <span class="control-label">演示速度</span>
              <div class="speed-buttons">
                <button
                  :class="{ active: speed === 'slow' }"
                  @click="speed = 'slow'"
                >慢</button>
                <button
                  :class="{ active: speed === 'medium' }"
                  @click="speed = 'medium'"
                >中</button>
                <button
                  :class="{ active: speed === 'fast' }"
                  @click="speed = 'fast'"
                >快</button>
              </div>
            </div>

            <div class="action-buttons">
              <button class="action-btn solve-btn" @click="solveInstantly">
                <Zap :size="16" />
                <span>立即求解</span>
              </button>
              <button class="action-btn reset-btn" @click="resetDemo">
                <RotateCcw :size="16" />
                <span>重置演示</span>
              </button>
            </div>

            <div class="playback-controls">
              <button
                class="play-btn"
                :disabled="!canPlayBackward"
                @click="stepBackward"
              >
                <SkipBack :size="20" />
              </button>
              <button
                class="play-btn main-play"
                :disabled="solverSteps.length === 0"
                @click="togglePlayback"
              >
                <Play v-if="!isPlaying" :size="24" />
                <Pause v-else :size="24" />
              </button>
              <button
                class="play-btn"
                :disabled="!canPlayForward"
                @click="stepForward"
              >
                <SkipForward :size="20" />
              </button>
            </div>
          </div>
        </div>

        <div class="logs-section">
          <div class="logs-header">
            <span>求解过程日志</span>
          </div>
          <div class="logs-container" ref="logContainerRef">
            <div
              v-for="log in logs"
              :key="log.index"
              class="log-entry"
              :class="{ 'current-log': log.index === currentStepIndex }"
            >
              <span class="log-step">[{{ log.index + 1 }}]</span>
              <span :class="getStepTypeColor(log.type)">{{ log.message }}</span>
            </div>
            <div v-if="logs.length === 0" class="empty-logs">
              点击"立即求解"或"下一步"开始演示
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.solver-lab-overlay {
  position: fixed;
  z-index: 9999;
  width: 780px;
  max-width: 95vw;
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  user-select: none;
}

.solver-lab-overlay.dragging {
  opacity: 0.9;
  cursor: grabbing;
}

.solver-lab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: linear-gradient(145deg, #334155, #1e293b);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: grab;
}

.solver-lab-header:active {
  cursor: grabbing;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drag-handle {
  color: #94a3b8;
  opacity: 0.6;
}

.title {
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.4);
}

.solver-lab-body {
  display: flex;
  gap: 16px;
  padding: 18px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
}

.mini-board-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.mini-board {
  display: flex;
  flex-direction: column;
  border: 2px solid #475569;
  border-radius: 8px;
  overflow: hidden;
  background: #0f172a;
}

.solver-row {
  display: flex;
}

.solver-cell {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #334155;
  background: #1e293b;
  position: relative;
  transition: all 0.2s;
}

.solver-cell.original .cell-value {
  color: #e2e8f0;
  font-weight: 700;
}

.solver-cell:not(.original) .cell-value {
  color: #60a5fa;
  font-weight: 500;
}

.solver-cell.highlight-try {
  background: rgba(59, 130, 246, 0.3) !important;
  box-shadow: inset 0 0 0 2px #3b82f6;
}

.solver-cell.highlight-conflict {
  background: rgba(239, 68, 68, 0.4) !important;
  box-shadow: inset 0 0 0 2px #ef4444;
  animation: pulse-red 0.4s ease;
}

.solver-cell.highlight-backtrack {
  background: rgba(249, 115, 22, 0.3) !important;
  box-shadow: inset 0 0 0 2px #f97316;
}

.solver-cell.highlight-confirm {
  background: rgba(34, 197, 94, 0.3) !important;
  box-shadow: inset 0 0 0 2px #22c55e;
}

.solver-cell.highlight-complete {
  background: rgba(16, 185, 129, 0.2) !important;
}

.solver-cell.border-right-thick {
  border-right: 2px solid #475569;
}

.solver-cell.border-bottom-thick {
  border-bottom: 2px solid #475569;
}

.cell-value {
  font-size: 14px;
  font-family: 'SF Mono', 'Menlo', monospace;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #334155;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  color: #94a3b8;
}

.controls-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.speed-control {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.speed-buttons {
  display: flex;
  gap: 4px;
}

.speed-buttons button {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #475569;
  background: #1e293b;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.speed-buttons button:hover {
  background: #334155;
  color: #e2e8f0;
}

.speed-buttons button.active {
  background: linear-gradient(145deg, #3b82f6, #2563eb);
  color: white;
  border-color: #3b82f6;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.solve-btn {
  background: linear-gradient(145deg, #8b5cf6, #7c3aed);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.solve-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}

.reset-btn {
  background: linear-gradient(145deg, #475569, #334155);
  color: #e2e8f0;
}

.reset-btn:hover {
  background: linear-gradient(145deg, #64748b, #475569);
}

.playback-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.play-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: #334155;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
}

.play-btn:hover:not(:disabled) {
  background: #475569;
  transform: scale(1.05);
}

.play-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.play-btn.main-play {
  width: 56px;
  height: 56px;
  background: linear-gradient(145deg, #22c55e, #16a34a);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.play-btn.main-play:hover:not(:disabled) {
  background: linear-gradient(145deg, #4ade80, #22c55e);
}

.logs-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 240px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 10px;
  overflow: hidden;
}

.logs-header {
  padding: 10px 14px;
  background: rgba(51, 65, 85, 0.5);
  font-size: 12px;
  font-weight: 600;
  color: #cbd5e1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logs-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  max-height: 320px;
}

.logs-container::-webkit-scrollbar {
  width: 6px;
}

.logs-container::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.5);
}

.logs-container::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}

.log-entry {
  display: flex;
  gap: 8px;
  padding: 6px 8px;
  font-size: 11px;
  line-height: 1.5;
  color: #94a3b8;
  border-radius: 4px;
  margin-bottom: 2px;
}

.log-entry.current-log {
  background: rgba(59, 130, 246, 0.15);
}

.log-step {
  color: #64748b;
  font-family: 'SF Mono', 'Menlo', monospace;
  flex-shrink: 0;
}

.empty-logs {
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
  font-size: 12px;
}

@keyframes pulse-red {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@media (max-width: 820px) {
  .solver-lab-overlay {
    width: 95vw;
  }

  .solver-lab-body {
    flex-direction: column;
  }

  .logs-section {
    min-width: unset;
    max-height: 200px;
  }

  .logs-container {
    max-height: 160px;
  }
}
</style>
