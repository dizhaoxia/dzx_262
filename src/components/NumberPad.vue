<script setup lang="ts">
import { Eraser, Lightbulb, Undo2, Pause, Play } from 'lucide-vue-next';

interface Props {
  disabled?: boolean;
  hintsRemaining: number;
  canUndo: boolean;
  isPaused: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'number-click', num: number): void;
  (e: 'erase-click'): void;
  (e: 'hint-click'): void;
  (e: 'undo-click'): void;
  (e: 'toggle-pause'): void;
}>();

function handleNumber(num: number): void {
  emit('number-click', num);
}

function handleErase(): void {
  emit('erase-click');
}

function handleHint(): void {
  emit('hint-click');
}

function handleUndo(): void {
  emit('undo-click');
}

function handleTogglePause(): void {
  emit('toggle-pause');
}
</script>

<template>
  <div class="number-pad">
    <div class="utility-row">
      <button
        class="utility-btn pause"
        :class="{ active: isPaused }"
        :disabled="disabled"
        @click="handleTogglePause"
        :title="isPaused ? '继续 (空格)' : '暂停 (空格)'"
      >
        <Pause v-if="!isPaused" :size="18" />
        <Play v-else :size="18" />
        <span>{{ isPaused ? '继续' : '暂停' }}</span>
      </button>
      <button
        class="utility-btn undo"
        :disabled="disabled || !canUndo"
        @click="handleUndo"
        title="撤销 (Ctrl+Z)"
      >
        <Undo2 :size="18" />
        <span>撤销</span>
      </button>
      <button
        class="utility-btn hint"
        :disabled="disabled || hintsRemaining <= 0"
        @click="handleHint"
        :title="`提示（剩余 ${hintsRemaining} 次）`"
      >
        <Lightbulb :size="18" />
        <span>提示 ({{ hintsRemaining }})</span>
      </button>
    </div>
    <div class="number-grid">
      <button
        v-for="num in 9"
        :key="num"
        class="number-btn"
        :disabled="disabled"
        @click="handleNumber(num)"
      >
        {{ num }}
      </button>
    </div>
    <button
      class="erase-btn"
      :disabled="disabled"
      @click="handleErase"
      title="擦除 (Backspace)"
    >
      <Eraser :size="20" />
      <span>擦除</span>
    </button>
  </div>
</template>

<style scoped>
.number-pad {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.utility-row {
  display: flex;
  gap: 8px;
}

.utility-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 42px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.08), -2px -2px 6px rgba(255, 255, 255, 0.8);
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.utility-btn.pause {
  background: linear-gradient(145deg, #e0e7ff, #c7d2fe);
  color: #4338ca;
}

.utility-btn.pause.active {
  background: linear-gradient(145deg, #bbf7d0, #86efac);
  color: #166534;
}

.utility-btn.pause:hover:not(:disabled) {
  background: linear-gradient(145deg, #c7d2fe, #a5b4fc);
  transform: translateY(-2px);
}

.utility-btn.pause.active:hover:not(:disabled) {
  background: linear-gradient(145deg, #86efac, #4ade80);
}

.utility-btn.undo {
  background: linear-gradient(145deg, #fef3c7, #fde68a);
  color: #92400e;
}

.utility-btn.undo:hover:not(:disabled) {
  background: linear-gradient(145deg, #fde68a, #fcd34d);
  transform: translateY(-2px);
}

.utility-btn.hint {
  background: linear-gradient(145deg, #a7f3d0, #6ee7b7);
  color: #065f46;
}

.utility-btn.hint:hover:not(:disabled) {
  background: linear-gradient(145deg, #6ee7b7, #34d399);
  transform: translateY(-2px);
}

.utility-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.1);
}

.utility-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none !important;
}

.number-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.number-btn {
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(145deg, #f0f4f8, #e2e8f0);
  color: #1e3a5f;
  font-size: 22px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.08), -2px -2px 6px rgba(255, 255, 255, 0.8);
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.number-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, #e0eaf5, #cbd5e1);
  transform: translateY(-2px);
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.9);
}

.number-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.1);
}

.number-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.erase-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(145deg, #fef3c7, #fde68a);
  color: #92400e;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.08), -2px -2px 6px rgba(255, 255, 255, 0.8);
}

.erase-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, #fde68a, #fcd34d);
  transform: translateY(-2px);
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.9);
}

.erase-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.1);
}

.erase-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .utility-btn {
    height: 38px;
    font-size: 12px;
    gap: 4px;
  }

  .utility-btn svg {
    width: 16px;
    height: 16px;
  }

  .number-btn {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }

  .erase-btn {
    height: 44px;
    font-size: 14px;
  }
}
</style>
