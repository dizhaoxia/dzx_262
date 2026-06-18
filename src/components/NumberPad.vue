<script setup lang="ts">
import { Eraser } from 'lucide-vue-next';

interface Props {
  disabled?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'number-click', num: number): void;
  (e: 'erase-click'): void;
}>();

function handleNumber(num: number): void {
  emit('number-click', num);
}

function handleErase(): void {
  emit('erase-click');
}
</script>

<template>
  <div class="number-pad">
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
