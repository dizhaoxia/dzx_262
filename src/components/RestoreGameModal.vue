<script setup lang="ts">
import { RefreshCw, X, Clock, Save } from 'lucide-vue-next';
import type { Difficulty } from '@/utils/sudoku';

interface Props {
  show: boolean;
  formattedTime: string;
  difficulty: Difficulty | null;
  completionPercent: number;
  hintsRemaining: number;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'restore'): void;
  (e: 'discard'): void;
}>();

const difficultyLabels: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

function handleRestore(): void {
  emit('restore');
}

function handleDiscard(): void {
  emit('discard');
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay">
      <div class="modal-content">
        <div class="save-icon">
          <Save :size="48" />
        </div>
        <h2 class="title">检测到未完成的游戏</h2>
        <p class="subtitle">是否恢复上次的游戏进度？</p>

        <div v-if="difficulty" class="info-grid">
          <div class="info-item">
            <span class="info-label">难度</span>
            <span class="info-value" :class="difficulty">{{ difficultyLabels[difficulty] }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">
              <Clock :size="14" />
              用时
            </span>
            <span class="info-value time">{{ formattedTime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">完成度</span>
            <span class="info-value percent">{{ completionPercent }}%</span>
          </div>
          <div class="info-item">
            <span class="info-label">剩余提示</span>
            <span class="info-value hint">{{ hintsRemaining }} 次</span>
          </div>
        </div>

        <div class="buttons">
          <button class="btn discard" @click="handleDiscard">
            <X :size="18" />
            <span>放弃进度</span>
          </button>
          <button class="btn restore" @click="handleRestore">
            <RefreshCw :size="18" />
            <span>恢复游戏</span>
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 24px;
  padding: 40px 48px;
  text-align: center;
  position: relative;
  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  max-width: 90vw;
  width: 440px;
}

.save-icon {
  color: #3b82f6;
  margin-bottom: 16px;
  animation: pulse 2s ease-in-out infinite;
}

.title {
  font-size: 26px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 15px;
  color: #64748b;
  margin: 0 0 28px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 28px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 12px 14px;
  background: linear-gradient(145deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
}

.info-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-value {
  font-size: 17px;
  font-weight: 700;
  color: #1e3a5f;
}

.info-value.easy {
  color: #10b981;
}

.info-value.medium {
  color: #f59e0b;
}

.info-value.hard {
  color: #ef4444;
}

.info-value.time {
  color: #d97706;
  font-family: 'SF Mono', monospace;
}

.info-value.percent {
  color: #059669;
}

.info-value.hint {
  color: #7c3aed;
}

.buttons {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 13px 24px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.discard {
  background: linear-gradient(145deg, #e2e8f0, #cbd5e1);
  color: #475569;
}

.btn.discard:hover {
  background: linear-gradient(145deg, #cbd5e1, #94a3b8);
  transform: translateY(-2px);
}

.btn.restore {
  background: linear-gradient(145deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.45);
}

.btn.restore:hover {
  background: linear-gradient(145deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.55);
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

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 32px 24px;
    width: auto;
  }

  .title {
    font-size: 22px;
  }

  .info-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .info-item {
    padding: 10px 12px;
  }

  .info-value {
    font-size: 15px;
  }

  .btn {
    padding: 12px 18px;
    font-size: 14px;
  }
}
</style>
