<script setup lang="ts">
import { Trophy, RotateCcw, Sparkles, Clock } from 'lucide-vue-next';
import { onMounted, onUnmounted, ref } from 'vue';

interface Props {
  show: boolean;
  formattedTime: string;
  completionPercent: number;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'restart'): void;
  (e: 'new-game'): void;
}>();

const confettiPieces = ref<{ id: number; left: number; delay: number; color: string; duration: number; size: number }[]>([]);

const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

function generateConfetti() {
  confettiPieces.value = [];
  for (let i = 0; i < 50; i++) {
    confettiPieces.value.push({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 2.5 + Math.random() * 2,
      size: 6 + Math.random() * 8,
    });
  }
}

let mounted = false;

onMounted(() => {
  mounted = true;
  generateConfetti();
});

onUnmounted(() => {
  mounted = false;
});

function handleRestart(): void {
  emit('restart');
}

function handleNewGame(): void {
  emit('new-game');
}

function handleEnter(e: TransitionEvent) {
  if (e.propertyName === 'transform' && mounted) {
    generateConfetti();
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay">
      <div class="bg-confetti">
        <div
          v-for="p in confettiPieces"
          :key="p.id"
          class="bg-piece"
          :style="{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            backgroundColor: p.color,
            animationDuration: `${p.duration}s`,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
          }"
        />
      </div>
      <div class="modal-content" @transitionend="handleEnter">
        <div class="trophy-icon">
          <Trophy :size="64" />
        </div>
        <h2 class="title">🎉 恭喜通关！</h2>
        <p class="message">你成功完成了数独谜题</p>
        <div class="stats">
          <div class="stat-item">
            <Clock :size="22" class="stat-icon time" />
            <div class="stat-info">
              <span class="stat-label">用时</span>
              <span class="stat-value time">{{ formattedTime }}</span>
            </div>
          </div>
          <div class="stat-item">
            <Trophy :size="22" class="stat-icon percent" />
            <div class="stat-info">
              <span class="stat-label">完成度</span>
              <span class="stat-value percent">{{ completionPercent }}%</span>
            </div>
          </div>
        </div>
        <div class="confetti-modal">
          <span
            v-for="i in 24"
            :key="i"
            class="confetti-piece"
            :style="{
              '--delay': `${i * 0.08}s`,
              '--color': colors[i % colors.length],
              '--drift': `${(i % 5 - 2) * 40}px`,
            }"
          />
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
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(6px);
  overflow: hidden;
}

.bg-confetti {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-piece {
  position: absolute;
  top: -20px;
  border-radius: 2px;
  opacity: 0;
  animation: bgFall linear infinite;
}

@keyframes bgFall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(1080deg);
    opacity: 0;
  }
}

.modal-content {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 28px;
  padding: 48px 56px;
  text-align: center;
  position: relative;
  animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.6);
  max-width: 92vw;
  overflow: hidden;
}

.trophy-icon {
  color: #f59e0b;
  margin-bottom: 20px;
  animation: trophyBounce 1.2s ease infinite;
  filter: drop-shadow(0 6px 16px rgba(245, 158, 11, 0.4));
}

.title {
  font-size: 34px;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.message {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 28px 0;
}

.stats {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 22px;
  background: linear-gradient(145deg, #f1f5f9, #e2e8f0);
  border-radius: 14px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.stat-icon {
  flex-shrink: 0;
}

.stat-icon.time {
  color: #f59e0b;
}

.stat-icon.percent {
  color: #10b981;
}

.stat-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.stat-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  font-family: 'SF Mono', 'Menlo', monospace;
}

.stat-value.time {
  color: #d97706;
}

.stat-value.percent {
  color: #059669;
}

.confetti-modal {
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
  border-radius: 2px;
  animation: fallPiece 3.2s ease-out var(--delay) infinite;
}

.buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 2;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.restart {
  background: linear-gradient(145deg, #e2e8f0, #cbd5e1);
  color: #334155;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.btn.restart:hover {
  background: linear-gradient(145deg, #cbd5e1, #94a3b8);
  transform: translateY(-3px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.15);
}

.btn.new-game {
  background: linear-gradient(145deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.45);
}

.btn.new-game:hover {
  background: linear-gradient(145deg, #2563eb, #1d4ed8);
  transform: translateY(-3px);
  box-shadow: 0 8px 22px rgba(59, 130, 246, 0.55);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.75);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes trophyBounce {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-14px) rotate(5deg); }
}

@keyframes fallPiece {
  0% {
    opacity: 0;
    transform: translateY(0) translateX(0) rotate(0deg) scale(0.5);
  }
  8% {
    opacity: 1;
    transform: translateY(20px) translateX(calc(var(--drift) * 0.2)) rotate(120deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(360px) translateX(var(--drift)) rotate(900deg) scale(0.3);
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 36px 24px;
  }

  .title {
    font-size: 26px;
  }

  .stats {
    gap: 12px;
  }

  .stat-item {
    padding: 12px 16px;
    gap: 10px;
  }

  .stat-value {
    font-size: 18px;
  }

  .btn {
    padding: 12px 20px;
    font-size: 14px;
  }
}
</style>
