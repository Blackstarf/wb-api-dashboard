<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3>📊 График остатков на складах</h3>
      <div class="chart-controls">
        <select v-model="chartType" @change="updateChart">
          <option value="bar">Столбчатый</option>
          <option value="line">Линейный</option>
        </select>
        <select v-model="groupBy" @change="updateChart">
          <option value="warehouse_name">По складам</option>
          <option value="subject">По предметам</option>
          <option value="brand">По брендам</option>
        </select>
      </div>
    </div>
    
    <div class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
    
    <div v-if="props.data.length === 0" class="no-chart-data">
      <p>📭 Нет данных для построения графика</p>
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
const chartType = ref('bar');
const groupBy = ref('warehouse_name');
let chartInstance = null;

// Цветовая палитра для графиков
const colorPalette = [
  '#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0',
  '#673AB7', '#3F51B5', '#00BCD4', '#009688', '#CDDC39'
];

// Подготовка данных для графика
const prepareChartData = () => {
  if (props.data.length === 0) {
    return null;
  }

  // Группируем данные по количеству позиций
  const groupedData = {};
  props.data.forEach(item => {
    const key = item[groupBy.value] || 'Не указано';
    
    if (!groupedData[key]) {
      groupedData[key] = 0;
    }
    
    groupedData[key] += 1;
  });

  const labels = Object.keys(groupedData);
  
  if (labels.length === 0) {
    return null;
  }

  // Сортируем по количеству позиций (по убыванию)
  labels.sort((a, b) => groupedData[b] - groupedData[a]);

  const datasetData = labels.map(label => groupedData[label]);

  // Ограничиваем количество элементов для лучшего отображения
  const maxItems = 12;
  const limitedLabels = labels.slice(0, maxItems);
  const limitedData = datasetData.slice(0, maxItems);

  return {
    labels: limitedLabels,
    datasets: [
      {
        label: `Количество позиций по ${getGroupByLabel()}`,
        data: limitedData,
        backgroundColor: chartType.value === 'bar' ? 
          limitedLabels.map((_, index) => colorPalette[index % colorPalette.length] + 'CC') : 
          'rgba(33, 150, 243, 0.2)',
        borderColor: limitedLabels.map((_, index) => colorPalette[index % colorPalette.length]),
        borderWidth: chartType.value === 'bar' ? 1 : 3,
        fill: chartType.value === 'line',
        tension: chartType.value === 'line' ? 0.4 : undefined
      }
    ]
  };
};

const getGroupByLabel = () => {
  const typeMap = {
    warehouse_name: 'складам',
    subject: 'предметам', 
    brand: 'брендам'
  };
  return typeMap[groupBy.value];
};

const getChartTitle = () => {
  const typeMap = {
    warehouse_name: 'складам',
    subject: 'предметам', 
    brand: 'брендам'
  };
  
  const chartMap = {
    bar: 'Количество позиций по',
    line: 'Распределение позиций по'
  };

  return `${chartMap[chartType.value]} ${typeMap[groupBy.value]}`;
};

// Создание графика
const createChart = () => {
  if (!chartCanvas.value) {
    return;
  }
  
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const chartData = prepareChartData();
  if (!chartData) {
    return;
  }

  try {
    chartInstance = new Chart(chartCanvas.value, {
      type: chartType.value,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 10,
            bottom: 20,
            left: 15,
            right: 15
          }
        },
        plugins: {
          title: {
            display: true,
            text: getChartTitle(),
            font: {
              size: 14,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 15
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw;
                return `${label}: ${value.toLocaleString('ru-RU')} позиций`;
              }
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Количество позиций',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            ticks: {
              callback: function(value) {
                return value.toLocaleString('ru-RU');
              },
              font: {
                size: 11
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: {
                size: 10
              }
            },
            grid: {
              display: false
            }
          }
        },
        animation: {
          duration: 800,
          easing: 'easeOutQuart'
        }
      }
    });
  } catch (error) {
    console.error('Ошибка создания графика:', error);
  }
};

const updateChart = () => {
  createChart();
};

// Наблюдаем за изменениями данных
watch(() => props.data, () => {
  createChart();
}, { deep: true });

watch([chartType, groupBy], () => {
  createChart();
});

onMounted(() => {
  setTimeout(() => {
    createChart();
  }, 100);
});
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 15px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 12px;
}

.chart-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.chart-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.chart-controls select {
  padding: 8px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 13px;
  min-width: 140px;
  background: white;
  font-weight: 500;
  transition: all 0.2s ease;
}

.chart-controls select:focus {
  border-color: #2196F3;
  outline: none;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.chart-wrapper {
  height: 350px;
  position: relative;
}

.no-chart-data {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;
  }
  
  .chart-controls {
    width: 100%;
    justify-content: center;
  }
  
  .chart-controls select {
    flex: 1;
    min-width: 120px;
    font-size: 12px;
    padding: 6px 10px;
  }
  
  .chart-container {
    padding: 12px;
  }
  
  .chart-header h3 {
    font-size: 16px;
  }
  
  .chart-wrapper {
    height: 300px;
  }
}
</style>