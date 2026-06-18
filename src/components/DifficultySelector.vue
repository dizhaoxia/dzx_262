<script setup lang="ts">
import type { Difficulty } from '@/utils/sudoku';

const emit = defineEmits<{
  (e: 'select', difficulty: Difficulty): void;
}>();

const difficulties: { key: Difficulty; label: string; desc: string; color: string }[] = [
  { key: 'easy', label: '简单', desc: '挖空 30~35 格', color: 'green' },
  { key: 'medium', label: '中等', desc: '挖空 40~45 格', color: 'yellow' },
  { key: 'hard', label: '困难', desc: '挖空 50~55 格', color: 'red' },
];

function selectDifficulty(diff: Difficulty): void {
  emit('select', diff);
}
</script>

<template>
  <div class="difficulty-selector">
    <h2 class="title">选择难度</h2>
    <p class="subtitle">请选择一个难度开始游戏</p>
    <div class="difficulty-buttons">
      <button
        v-for="diff in difficulties"
        :key="diff.key"
        :class="['difficulty-btn', diff.color]"
        @click="selectDifficulty(diff.key)"
      >
        <span class="diff-label">{{ diff.label }}</span>
        <span class="diff-desc">{{ diff.desc }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.difficulty-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(30, 58, 95, 0.15);
  backdrop-filter: blur(10px);
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0;
  letter-spacing: 1px;
}

.subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

.difficulty-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.difficulty-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 36px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  position: relative;
  overflow: hidden;
}

.difficulty-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.difficulty-btn:hover::before {
  left: 100%;
}

.difficulty-btn.green {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
}

.difficulty-btn.green:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.5);
}

.difficulty-btn.yellow {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
}

.difficulty-btn.yellow:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(245, 158, 11, 0.5);
}

.difficulty-btn.red {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
}

.difficulty-btn.red:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(239, 68, 68, 0.5);
}

.diff-label {
  font-size: 22px;
  font-weight: 700;
  position: relative;
  z-index: 1;
}

.diff-desc {
  font-size: 13px;
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

@media (max-width: 480px) {
  .difficulty-selector {
    padding: 24px;
  }

  .title {
    font-size: 24px;
  }

  .difficulty-btn {
    padding: 18px 28px;
    min-width: 100px;
  }

  .diff-label {
    font-size: 18px;
  }

  .diff-desc {
    font-size: 12px;
  }
}
</style>
