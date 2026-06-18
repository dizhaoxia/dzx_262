<script setup lang="ts">
import { Trophy, RotateCcw, Sparkles } from 'lucide-vue-next';

interface Props {
  show: boolean;
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
  <Teleport to="body">
    <div v-if="show" class="modal-overlay">
      <div class="modal-content">
        <div class="trophy-icon">
          <Trophy :size="64" />
        </div>
        <h2 class="title">恭喜通关！</h2>
        <p class="message">你成功完成了数独谜题</p>
        <div class="confetti">
          <span v-for="i in 12" :key="i" class="confetti-piece" :style="{ '--delay': `${i * 0.1}s`, '--color': ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][i % 6] }"></span>
        </div>
        <div class="buttons">
          <button class="btn restart" @click="handleRestart">
            <RotateCcw :size="18" />
            <span>再来一次</span>
          </button>
          <button class="btn new-game" @click="handleNewGame">
            <Sparkles :size="18" />
            <span>新游戏</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 24px;
  padding: 48px 56px;
  text-align: center;
  position: relative;
  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  max-width: 90vw;
  overflow: hidden;
}

.trophy-icon {
  color: #f59e0b;
  margin-bottom: 20px;
  animation: bounce 1s ease infinite;
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 12px 0;
}

.message {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 32px 0;
}

.confetti {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--color);
  top: -10px;
  left: 50%;
  opacity: 0;
  animation: fall 3s ease-out var(--delay) infinite;
}

.buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.restart {
  background: linear-gradient(145deg, #e2e8f0, #cbd5e1);
  color: #334155;
}

.btn.restart:hover {
  background: linear-gradient(145deg, #cbd5e1, #94a3b8);
  transform: translateY(-2px);
}

.btn.new-game {
  background: linear-gradient(145deg, #3b82f6, #2563eb);
  color: white;
}

.btn.new-game:hover {
  background: linear-gradient(145deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes fall {
  0% {
    opacity: 0;
    transform: translateY(0) translateX(0) rotate(0deg);
  }
  10% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(300px) translateX(calc(var(--delay, 0s) * 50px - 100px)) rotate(720deg);
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 32px 24px;
  }

  .title {
    font-size: 24px;
  }

  .btn {
    padding: 12px 20px;
    font-size: 14px;
  }
}
</style>
