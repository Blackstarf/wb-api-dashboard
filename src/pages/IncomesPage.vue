<template>
  <div class="incomes-page">
    <div class="header-actions">
      <h1>📈 Доходы</h1>
      <button @click="forceRefresh" class="refresh-btn">
        🔄 Обновить данные
      </button>
    </div>
    
    <Filters 
      :filters="store.filters" 
      :data="store.allData"
      @update-filters="store.setFilters" 
    />
    
    <div v-if="store.loading" class="loading">
      <div class="spinner"></div>
      Загрузка данных...
    </div>
    
    <div v-else-if="store.error" class="error">
      ❌ Ошибка: {{ store.error }}
      <button @click="store.fetchAllIncomes" class="retry-btn">Повторить</button>
    </div>
    
    <div v-else>
      <!-- График -->
      <IncomeChart :data="store.filteredData" />
      
      <!-- Статистика -->
      <div class="stats-section">
        <div class="stat-card">
          <h3>📊 Статистика</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Всего записей:</span>
              <span class="stat-value">{{ store.allData.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">После фильтров:</span>
              <span class="stat-value">{{ store.filteredData.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Общая сумма:</span>
              <span class="stat-value">{{ totalAmount }} руб.</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Общее количество:</span>
              <span class="stat-value">{{ totalQuantity }} шт.</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Средняя сумма:</span>
              <span class="stat-value">{{ averageAmount }} руб.</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Уникальных дат:</span>
              <span class="stat-value">{{ uniqueDates }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Таблица -->
      <div class="table-section" v-if="store.paginatedData.length > 0">
        <h2>📋 Таблица данных</h2>
        <div class="table-info">
          <span>Показано: {{ store.paginatedData.length }} из {{ store.filteredData.length }} записей</span>
          <span>Страница: {{ store.currentPage }} из {{ store.totalPages }}</span>
        </div>
        <DataTable 
          :data="store.paginatedData" 
          :columns="tableColumns" 
        />
      </div>

      <div v-else class="no-data">
        <h3>📭 Нет данных</h3>
        <p>Попробуйте изменить фильтры</p>
      </div>
      
      <!-- Пагинация -->
      <Pagination 
        v-if="store.totalPages > 1"
        :current-page="store.currentPage" 
        :total-pages="store.totalPages" 
        @page-change="store.setPage" 
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useIncomesStore } from '../stores/incomesStore';
import Filters from '../components/Filters.vue';
import DataTable from '../components/DataTable.vue';
import Pagination from '../components/Pagination.vue';
import IncomeChart from '../components/IncomeChart.vue';

const store = useIncomesStore();

// Колонки для таблицы
const tableColumns = [
  { key: 'income_id', title: 'ID' },
  { key: 'date', title: 'Дата' },
  { key: 'supplier_article', title: 'Артикул' },
  { key: 'quantity', title: 'Кол-во', formatter: (value) => value ? `${value} шт.` : '0 шт.' },
  { key: 'total_price', title: 'Сумма', formatter: (value) => value ? `${parseFloat(value).toFixed(2)} руб.` : '0 руб.' },
  { key: 'warehouse_name', title: 'Склад' },
  { key: 'barcode', title: 'Штрихкод' }
];

// Вычисляемые свойства
const totalAmount = computed(() => {
  return store.filteredData.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0).toFixed(2);
});

const totalQuantity = computed(() => {
  return store.filteredData.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
});

const averageAmount = computed(() => {
  if (store.filteredData.length === 0) return 0;
  const total = store.filteredData.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
  return (total / store.filteredData.length).toFixed(2);
});

const uniqueDates = computed(() => {
  return new Set(store.filteredData.map(item => item.date).filter(Boolean)).size;
});

const forceRefresh = () => {
  store.fetchAllIncomes();
};

onMounted(() => {
  store.fetchAllIncomes();
});
</script>

<style scoped>
.incomes-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  color: #2c3e50;
  margin: 0;
}

.refresh-btn {
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.refresh-btn:hover {
  background: #45a049;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.error {
  background: #ffe6e6;
  color: #d63031;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin: 20px 0;
}

.retry-btn {
  margin-left: 10px;
  padding: 5px 10px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.stats-section {
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-label {
  font-weight: 500;
  color: #2c3e50;
}

.stat-value {
  font-weight: 600;
  color: #4CAF50;
}

.table-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.table-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  color: #666;
  font-size: 14px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
  background: white;
  border-radius: 8px;
  margin: 20px 0;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>