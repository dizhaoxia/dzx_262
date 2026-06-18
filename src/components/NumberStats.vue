<script setup lang="ts">
interface Props {
  numberCounts: Record<number, number>;
  completionPercent: number;
}

const props = defineProps<Props>();

function getProgressColor(count: number): string {
  if (count >= 9) return 'complete';
  if (count >= 7) return 'high';
  if (count >= 4) return 'medium';
  return 'low';
}
</script>

<template>
  <div class="number-stats">
    <div class="overall-bar">
      <div class="overall-fill" :style="{ width: `${completionPercent}%` }" />
      <span class="overall-label">{{ completionPercent }}% 完成</span>
    </div>
    <div class="numbers-grid">
      <div
        v-for="num in 9"
        :key="num"
        class="number-item"
        :class="getProgressColor(numberCounts[num])"
      >
        <span class="num">{{ num }}</span>
        <div class="progress-wrap">
          <div class="progress-fill" :style="{ width: `${(numberCounts[num] / 9) * 100}%` }" />
        </div>
        <span class="count">{{ numberCounts[num] }}/9</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.number-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 22px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 520px;
}

.overall-bar {
  position: relative;
  height: 28px;
  background: linear-gradient(145deg, #e2e8f0, #cbd5e1);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.08);
}

.overall-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #10b981 50%, #f59e0b 100%);
  border-radius: 14px;
  transition: width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
}

.overall-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 13px;
  font-weight: 700;
  color: #1e3a5f;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  z-index: 2;
  letter-spacing: 0.5px;
}

.numbers-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 8px;
}

.number-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 8px 4px;
  border-radius: 10px;
  transition: all 0.3s ease;
  background: linear-gradient(145deg, #f8fafc, #f1f5f9);
}

.number-item.low {
  background: linear-gradient(145deg, #fef2f2, #fee2e2);
}

.number-item.medium {
  background: linear-gradient(145deg, #fffbeb, #fef3c7);
}

.number-item.high {
  background: linear-gradient(145deg, #ecfdf5, #d1fae5);
}

.number-item.complete {
  background: linear-gradient(145deg, #10b981, #059669);
  transform: scale(1.04);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.number-item .num {
  font-size: 18px;
  font-weight: 700;
  color: #1e3a5f;
  line-height: 1;
}

.number-item.complete .num {
  color: white;
}

.progress-wrap {
  width: 80%;
  height: 4px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  overflow: hidden;
}

.number-item.complete .progress-wrap {
  background: rgba(255, 255, 255, 0.25);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #6366f1);
  border-radius: 2px;
  transition: width 0.4s ease;
}

.number-item.medium .progress-fill {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.number-item.high .progress-fill {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.number-item.complete .progress-fill {
  background: linear-gradient(90deg, #fde68a, #fcd34d);
}

.count {
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  line-height: 1;
}

.number-item.complete .count {
  color: #fef3c7;
}

@media (max-width: 480px) {
  .number-stats {
    padding: 14px 16px;
  }

  .numbers-grid {
    gap: 5px;
  }

  .number-item {
    padding: 6px 2px;
  }

  .number-item .num {
    font-size: 15px;
  }

  .count {
    font-size: 9px;
  }
}
</style>
