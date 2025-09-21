<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3>📊 График доходов</h3>
      <select v-model="chartType" @change="updateChart">
        <option value="line">Линейный</option>
        <option value="bar">Столбчатый</option>
      </select>
    </div>
    
    <canvas ref="chartCanvas"></canvas>
    
    <div v-if="!hasData" class="no-chart-data">
      <p>Нет данных для построения графика</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
});

const chartCanvas = ref(null);
const chartType = ref('line');
let chartInstance = null;

const hasData = computed(() => {
  return props.data.length > 0;
});

// Подготовка данных для графика
const prepareChartData = () => {
  if (props.data.length === 0) return null;

  // Группируем по дате
  const groupedByDate = {};
  props.data.forEach(item => {
    const date = item.date;
    if (!groupedByDate[date]) {
      groupedByDate[date] = { total: 0, count: 0 };
    }
    groupedByDate[date].total += parseFloat(item.total_price) || 0;
    groupedByDate[date].count += parseInt(item.quantity) || 0;
  });

  const dates = Object.keys(groupedByDate).sort();
  
  return {
    labels: dates,
    datasets: [
      {
        label: 'Сумма доходов (руб)',
        data: dates.map(date => groupedByDate[date].total),
        borderColor: '#4CAF50',
        backgroundColor: chartType.value === 'bar' ? 'rgba(76, 175, 80, 0.7)' : 'rgba(76, 175, 80, 0.1)',
        yAxisID: 'y',
        fill: chartType.value === 'line',
        tension: 0.4
      },
      {
        label: 'Количество (шт)',
        data: dates.map(date => groupedByDate[date].count),
        borderColor: '#2196F3',
        backgroundColor: chartType.value === 'bar' ? 'rgba(33, 150, 243, 0.7)' : 'rgba(33, 150, 243, 0.1)',
        yAxisID: 'y1',
        type: chartType.value === 'line' ? 'line' : 'bar'
      }
    ]
  };
};

// Создание графика
const createChart = () => {
  if (!chartCanvas.value) return;
  
  if (chartInstance) {
    chartInstance.destroy();
  }

  const chartData = prepareChartData();
  if (!chartData) return;

  chartInstance = new Chart(chartCanvas.value, {
    type: chartType.value,
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Сумма (руб)'
          },
          grid: {
            drawOnChartArea: true,
          },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Количество (шт)'
          },
          grid: {
            drawOnChartArea: false,
          },
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Динамика доходов по датам'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                const value = context.parsed.y;
                if (context.dataset.label.includes('Сумма')) {
                  label += value.toLocaleString('ru-RU') + ' руб';
                } else {
                  label += value.toLocaleString('ru-RU') + ' шт';
                }
              }
              return label;
            }
          }
        },
        legend: {
          position: 'top',
        }
      }
    }
  });
};

const updateChart = () => {
  createChart();
};

// Наблюдаем за изменениями данных
watch(() => props.data, () => {
  createChart();
}, { deep: true });

onMounted(() => {
  createChart();
});
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chart-header h3 {
  margin: 0;
  color: #2c3e50;
}

.chart-header select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.no-chart-data {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #666;
}
</style>