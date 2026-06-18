<script setup lang="ts">
import { RotateCcw, Sparkles, Clock } from 'lucide-vue-next';

interface Props {
  disabled?: boolean;
  formattedTime: string;
  isPaused: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'restart'): void;
  (e: 'new-game'): void;
}>();

function handleRestart(): void {
  emit('restart');
}

function handleNewGame(): void {
  emit('new-game');
}
</script>

<template>
  <div class="game-controls">
    <div class="timer-display" :class="{ paused: isPaused }">
      <Clock :size="20" />
      <span class="time-value">{{ formattedTime }}</span>
      <span v-if="isPaused" class="paused-badge">已暂停</span>
    </div>
    <div class="buttons-row">
      <button
        class="control-btn restart"
        :disabled="disabled"
        @click="handleRestart"
      >
        <RotateCcw :size="18" />
        <span>重新开始</span>
      </button>
      <button
        class="control-btn new-game"
        :disabled="disabled"
        @click="handleNewGame"
      >
        <Sparkles :size="18" />
        <span>新游戏</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.game-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
}

.timer-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 24px;
  background: linear-gradient(145deg, #1e3a5f, #0f2744);
  border-radius: 12px;
  color: #fbbf24;
  box-shadow: 0 4px 12px rgba(30, 58, 95, 0.3);
}

.timer-display.paused {
  background: linear-gradient(145deg, #78350f, #451a03);
  color: #fbbf24;
}

.timer-display svg {
  filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.5));
}

.time-value {
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 2px;
  text-shadow: 0 0 8px rgba(251, 191, 36, 0.4);
}

.paused-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  background: rgba(251, 191, 36, 0.2);
  border-radius: 6px;
  color: #fcd34d;
}

.buttons-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn.restart {
  background: linear-gradient(145deg, #e2e8f0, #cbd5e1);
  color: #334155;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
}

.control-btn.restart:hover:not(:disabled) {
  background: linear-gradient(145deg, #cbd5e1, #94a3b8);
  transform: translateY(-2px);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.15);
}

.control-btn.new-game {
  background: linear-gradient(145deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 2px 2px 8px rgba(59, 130, 246, 0.4);
}

.control-btn.new-game:hover:not(:disabled) {
  background: linear-gradient(145deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 4px 4px 12px rgba(59, 130, 246, 0.5);
}

.control-btn:active:not(:disabled) {
  transform: translateY(0);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .control-btn {
    padding: 10px 18px;
    font-size: 14px;
  }

  .time-value {
    font-size: 20px;
  }

  .timer-display {
    padding: 12px 18px;
  }
}
</style>
