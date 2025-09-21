<template>
  <div class="orders-page">
    <div class="header-actions">
      <h1>📦 Заказы</h1>
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
      <button @click="store.fetchOrders" class="retry-btn">Повторить</button>
    </div>
    
    <div v-else>
      <!-- График -->
      <OrdersChart :data="store.filteredData" />
      
      <!-- Статистика -->
      <div class="stats-section">
        <div class="stat-card">
          <h3>📊 Статистика заказов</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Всего заказов:</span>
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
              <span class="stat-label">Активных заказов:</span>
              <span class="stat-value">{{ activeOrders }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Отмененных заказов:</span>
              <span class="stat-value">{{ canceledOrders }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Средняя скидка:</span>
              <span class="stat-value">{{ averageDiscount }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Уникальных дат:</span>
              <span class="stat-value">{{ uniqueDates }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Уникальных регионов:</span>
              <span class="stat-value">{{ uniqueRegions }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Уникальных складов:</span>
              <span class="stat-value">{{ uniqueWarehouses }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Таблица -->
      <div class="table-section" v-if="store.paginatedData.length > 0">
        <h2>📋 Таблица заказов</h2>
        <div class="table-info">
          <span>Показано: {{ store.paginatedData.length }} из {{ store.filteredData.length }} заказов</span>
          <span>Страница: {{ store.currentPage }} из {{ store.totalPages }}</span>
        </div>
        <DataTable 
          :data="store.paginatedData" 
          :columns="tableColumns" 
        />
      </div>

      <div v-else class="no-data">
        <h3>📭 Нет данных о заказах</h3>
        <p>Попробуйте изменить фильтры или обновить данные</p>
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
import { useOrdersStore } from '../stores/ordersStore';
import Filters from '../components/Filters.vue';
import DataTable from '../components/DataTable.vue';
import Pagination from '../components/Pagination.vue';
import OrdersChart from '../components/OrdersChart.vue';

const store = useOrdersStore();

// Колонки для таблицы заказов
const tableColumns = [
  { key: 'g_number', title: 'Номер заказа' },
  { key: 'date', title: 'Дата создания' },
  { key: 'supplier_article', title: 'Артикул' },
  { key: 'total_price', title: 'Сумма', formatter: (value) => value ? `${parseFloat(value).toFixed(2)} руб.` : '0 руб.' },
  { key: 'discount_percent', title: 'Скидка', formatter: (value) => value ? `${value}%` : '0%' },
  { key: 'warehouse_name', title: 'Склад' },
  { key: 'oblast', title: 'Регион' },
  { key: 'brand', title: 'Бренд' },
  { key: 'is_cancel', title: 'Статус', formatter: (value) => value ? '❌ Отменен' : '✅ Активен' }
];

// Вычисляемые свойства
const totalAmount = computed(() => {
  return store.filteredData.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0).toFixed(2);
});

const activeOrders = computed(() => {
  return store.filteredData.filter(item => !item.is_cancel).length;
});

const canceledOrders = computed(() => {
  return store.filteredData.filter(item => item.is_cancel).length;
});

const averageDiscount = computed(() => {
  if (store.filteredData.length === 0) return 0;
  const totalDiscount = store.filteredData.reduce((sum, item) => sum + (parseFloat(item.discount_percent) || 0), 0);
  return (totalDiscount / store.filteredData.length).toFixed(1);
});

const uniqueDates = computed(() => {
  const dates = store.filteredData.map(item => item.date ? item.date.split(' ')[0] : null).filter(Boolean);
  return new Set(dates).size;
});

const uniqueRegions = computed(() => {
  return new Set(store.filteredData.map(item => item.oblast).filter(Boolean)).size;
});

const uniqueWarehouses = computed(() => {
  return new Set(store.filteredData.map(item => item.warehouse_name).filter(Boolean)).size;
});

const forceRefresh = () => {
  store.fetchOrders();
};

onMounted(() => {
  store.fetchOrders();
});
</script>

<style scoped>
.orders-page {
  padding: 20px;
  max-width: 1800px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
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

.stat-card h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 15px;
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

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .table-info {
    flex-direction: column;
    gap: 10px;
  }
}
</style>