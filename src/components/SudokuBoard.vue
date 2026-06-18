<script setup lang="ts">
import type { Cell } from '@/utils/sudoku';

interface Props {
  board: Cell[][];
  selectedRow: number | null;
  selectedCol: number | null;
  isLocked: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'select-cell', row: number, col: number): void;
}>();

function isInSameRow(row: number): boolean {
  return props.selectedRow === row;
}

function isInSameCol(col: number): boolean {
  return props.selectedCol === col;
}

function isInSameBox(row: number, col: number): boolean {
  if (props.selectedRow === null || props.selectedCol === null) return false;
  const boxRow = Math.floor(props.selectedRow / 3);
  const boxCol = Math.floor(props.selectedCol / 3);
  const cellBoxRow = Math.floor(row / 3);
  const cellBoxCol = Math.floor(col / 3);
  return boxRow === cellBoxRow && boxCol === cellBoxCol;
}

function isSelected(row: number, col: number): boolean {
  return props.selectedRow === row && props.selectedCol === col;
}

function handleClick(row: number, col: number): void {
  emit('select-cell', row, col);
}

function getCellClass(row: number, col: number, cell: Cell): string {
  const classes: string[] = ['sudoku-cell'];

  if (isSelected(row, col)) {
    classes.push('selected');
  } else if (isInSameRow(row) || isInSameCol(col) || isInSameBox(row, col)) {
    classes.push('highlighted');
  }

  if (cell.isFixed) {
    classes.push('fixed');
  }

  if (cell.isConflict) {
    classes.push('conflict');
  }

  if (col % 3 === 2 && col !== 8) {
    classes.push('border-right-thick');
  }

  if (row % 3 === 2 && row !== 8) {
    classes.push('border-bottom-thick');
  }

  return classes.join(' ');
}
</script>

<template>
  <div class="sudoku-board">
    <div v-for="(row, rowIndex) in board" :key="rowIndex" class="sudoku-row">
      <div
        v-for="(cell, colIndex) in row"
        :key="colIndex"
        :class="getCellClass(rowIndex, colIndex, cell)"
        @click="handleClick(rowIndex, colIndex)"
      >
        <span v-if="cell.value !== 0" class="cell-value">
          {{ cell.value }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sudoku-board {
  display: flex;
  flex-direction: column;
  border: 3px solid #1e3a5f;
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: 0 10px 40px rgba(30, 58, 95, 0.2);
  user-select: none;
}

.sudoku-row {
  display: flex;
}

.sudoku-cell {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #cbd5e1;
  cursor: pointer;
  transition: all 0.15s ease;
  background-color: #ffffff;
}

.sudoku-cell:hover {
  background-color: #f0f7ff;
}

.sudoku-cell.highlighted {
  background-color: #e8f2ff;
}

.sudoku-cell.selected {
  background-color: #bfdbfe;
}

.sudoku-cell.selected:hover {
  background-color: #93c5fd;
}

.sudoku-cell.fixed .cell-value {
  font-weight: 700;
  color: #1e3a5f;
}

.sudoku-cell:not(.fixed) .cell-value {
  color: #3b82f6;
  font-weight: 500;
}

.sudoku-cell.conflict {
  background-color: #fee2e2 !important;
  animation: shake 0.3s ease-in-out;
}

.sudoku-cell.conflict .cell-value {
  color: #ef4444 !important;
  font-weight: 700;
}

.sudoku-cell.border-right-thick {
  border-right: 2px solid #1e3a5f;
}

.sudoku-cell.border-bottom-thick {
  border-bottom: 2px solid #1e3a5f;
}

.cell-value {
  font-size: 22px;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

@media (max-width: 480px) {
  .sudoku-cell {
    width: 36px;
    height: 36px;
  }

  .cell-value {
    font-size: 18px;
  }
}
</style>
