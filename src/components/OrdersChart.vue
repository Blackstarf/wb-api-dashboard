<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3>📊 График заказов</h3>
      <div class="chart-controls">
        <select v-model="chartType" @change="updateChart">
          <option value="line">Линейный</option>
          <option value="bar">Столбчатый</option>
        </select>
        <select v-model="dataType" @change="updateChart">
          <option value="amount">Сумма заказов</option>
          <option value="count">Количество заказов</option>
          <option value="discount">Средняя скидка</option>
        </select>
      </div>
    </div>
    
    <canvas ref="chartCanvas"></canvas>
    
    <div v-if="!hasData" class="no-chart-data">
      <p>Нет данных для построения графика</p>
    </div>
    
    <div v-else-if="chartError" class="chart-error">
      <p>❌ Ошибка при создании графика: {{ chartError }}</p>
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
const dataType = ref('amount');
const chartError = ref(null);

let chartInstance = null;

const hasData = computed(() => {
  return props.data.length > 0;
});

// Подготовка данных для графика
const prepareChartData = () => {
  if (props.data.length === 0) return null;

  // Группируем по дате (только дата, без времени)
  const groupedByDate = {};
  props.data.forEach(item => {
    const date = item.date ? item.date.split(' ')[0] : 'Не указана'; // Берем только дату
    if (!groupedByDate[date]) {
      groupedByDate[date] = { 
        totalAmount: 0, 
        totalDiscount: 0,
        count: 0
      };
    }
    groupedByDate[date].totalAmount += parseFloat(item.total_price) || 0;
    groupedByDate[date].totalDiscount += parseFloat(item.discount_percent) || 0;
    groupedByDate[date].count += 1;
  });

  const dates = Object.keys(groupedByDate).sort();
  
  let datasetData = [];
  let label = '';
  let color = '';
  
  switch (dataType.value) {
    case 'amount':
      datasetData = dates.map(date => groupedByDate[date].totalAmount);
      label = 'Сумма заказов (руб)';
      color = '#4CAF50';
      break;
    case 'count':
      datasetData = dates.map(date => groupedByDate[date].count);
      label = 'Количество заказов (шт)';
      color = '#2196F3';
      break;
    case 'discount':
      datasetData = dates.map(date => groupedByDate[date].totalDiscount / groupedByDate[date].count);
      label = 'Средняя скидка (%)';
      color = '#FF9800';
      break;
  }
  
  return {
    labels: dates,
    datasets: [
      {
        label: label,
        data: datasetData,
        borderColor: color,
        backgroundColor: chartType.value === 'bar' ? 
          color + 'CC' : 
          color + '33',
        fill: chartType.value === 'line',
        tension: 0.4
      }
    ]
  };
};

// Создание графика
const createChart = () => {
  if (!chartCanvas.value) {
    chartError.value = 'Canvas element not found';
    return;
  }
  
  try {
    if (chartInstance) {
      chartInstance.destroy();
    }

    const chartData = prepareChartData();
    if (!chartData) {
      chartError.value = 'No data available';
      return;
    }

    const isLineChart = chartType.value === 'line';

    chartInstance = new Chart(chartCanvas.value, {
      type: chartType.value,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: getChartTitle()
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
                  if (dataType.value === 'amount') {
                    label += value.toLocaleString('ru-RU') + ' руб';
                  } else if (dataType.value === 'count') {
                    label += value.toLocaleString('ru-RU') + ' шт';
                  } else {
                    label += value.toFixed(1) + '%';
                  }
                }
                return label;
              }
            }
          },
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: getYAxisLabel()
            }
          }
        }
      }
    });

    chartError.value = null;

  } catch (error) {
    console.error('Ошибка при создании графика:', error);
    chartError.value = error.message;
  }
};

const getChartTitle = () => {
  switch (dataType.value) {
    case 'amount': return 'Динамика суммы заказов по датам';
    case 'count': return 'Динамика количества заказов по датам';
    case 'discount': return 'Динамика средней скидки по датам';
    default: return 'Динамика заказов';
  }
};

const getYAxisLabel = () => {
  switch (dataType.value) {
    case 'amount': return 'Сумма (руб)';
    case 'count': return 'Количество (шт)';
    case 'discount': return 'Скидка (%)';
    default: return 'Значение';
  }
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
  flex-wrap: wrap;
  gap: 15px;
}

.chart-header h3 {
  margin: 0;
  color: #2c3e50;
}

.chart-controls {
  display: flex;
  gap: 10px;
}

.chart-controls select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.no-chart-data {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #666;
}

.chart-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #d63031;
  background: #ffe6e6;
  padding: 20px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .chart-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .chart-controls select {
    flex: 1;
  }
}
</style>