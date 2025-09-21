<template>
  <div class="stocks-page">
    <div class="header-actions">
      <h1>🏪 Остатки на складах</h1>
      <div class="last-update">
        <span>Данные на: {{ currentDate }}</span>
        <button @click="forceRefresh" class="refresh-btn">
          🔄 Обновить
        </button>
      </div>
    </div>
    
    <Filters 
      :filters="store.filters" 
      :data="store.allData"
      @update-filters="store.setFilters" 
    />
    
    <div v-if="store.loading" class="loading">
      <div class="spinner"></div>
      Загрузка данных о остатках...
    </div>
    
    <div v-else-if="store.error" class="error">
      ❌ Ошибка: {{ store.error }}
      <button @click="store.fetchStocks" class="retry-btn">Повторить</button>
    </div>
    
    <div v-else>
      <!-- График -->
      <StocksChart :data="store.filteredData" />
      
      <!-- Статистика -->
      <div class="stats-section">
        <div class="stat-card">
          <h3>📊 Статистика остатков</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Всего позиций:</span>
              <span class="stat-value">{{ store.allData.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">После фильтров:</span>
              <span class="stat-value">{{ store.filteredData.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Общее количество:</span>
              <span class="stat-value">{{ totalQuantity }} шт.</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Общая стоимость:</span>
              <span class="stat-value">{{ totalAmount }} руб.</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Средняя цена:</span>
              <span class="stat-value">{{ averagePrice }} руб.</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Уникальных складов:</span>
              <span class="stat-value">{{ uniqueWarehousesCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Уникальных товаров:</span>
              <span class="stat-value">{{ uniqueProductsCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Уникальных брендов:</span>
              <span class="stat-value">{{ uniqueBrandsCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Дополнительная статистика по стоимости -->
      <div class="stats-section">
        <div class="stat-card">
          <h3>💰 Распределение стоимости</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Макс. стоимость позиции:</span>
              <span class="stat-value">{{ maxItemValue }} руб.</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Мин. стоимость позиции:</span>
              <span class="stat-value">{{ minItemValue }} руб.</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Сумма > 10 000 руб:</span>
              <span class="stat-value">{{ highValueItems }} шт.</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Нулевые остатки:</span>
              <span class="stat-value">{{ zeroQuantityItems }} шт.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Таблица -->
      <div class="table-section" v-if="store.paginatedData.length > 0">
        <h2>📋 Таблица остатков</h2>
        <div class="table-info">
          <span>Показано: {{ store.paginatedData.length }} из {{ store.filteredData.length }} позиций</span>
          <span>Страница: {{ store.currentPage }} из {{ store.totalPages }}</span>
        </div>
        <DataTable 
          :data="store.paginatedData" 
          :columns="tableColumns" 
        />
      </div>

      <div v-else class="no-data">
        <h3>📭 Нет данных об остатках</h3>
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
import { computed, onMounted, ref } from 'vue';
import { useStocksStore } from '../stores/stocksStore';
import Filters from '../components/Filters.vue';
import DataTable from '../components/DataTable.vue';
import Pagination from '../components/Pagination.vue';
import StocksChart from '../components/StocksChart.vue';

const store = useStocksStore();
const currentDate = ref(new Date().toLocaleDateString('ru-RU'));

// Колонки для таблицы остатков
const tableColumns = [
  { key: 'nm_id', title: 'Номенклатура' },
  { key: 'supplier_article', title: 'Артикул' },
  { key: 'subject', title: 'Предмет' },
  { key: 'quantity', title: 'Количество', formatter: (value) => value ? `${value} шт.` : '0 шт.' },
  { key: 'price', title: 'Цена', formatter: (value) => value ? `${parseFloat(value).toFixed(2)} руб.` : '0 руб.' },
  { key: 'total_value', title: 'Стоимость', formatter: (value) => value ? `${parseFloat(value).toFixed(2)} руб.` : '0 руб.' },
  { key: 'warehouse_name', title: 'Склад' },
  { key: 'brand', title: 'Бренд' },
  { key: 'category', title: 'Категория' }
];

// Вычисляемые свойства
const totalQuantity = computed(() => {
  return store.filteredData.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
});

const totalAmount = computed(() => {
  return store.filteredData.reduce((sum, item) => {
    const quantity = parseInt(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return sum + (quantity * price);
  }, 0).toFixed(2);
});

const averagePrice = computed(() => {
  if (store.filteredData.length === 0) return 0;
  const total = store.filteredData.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    return sum + price;
  }, 0);
  return (total / store.filteredData.length).toFixed(2);
});

const uniqueWarehousesCount = computed(() => {
  return new Set(store.filteredData.map(item => item.warehouse_name).filter(Boolean)).size;
});

const uniqueProductsCount = computed(() => {
  return new Set(store.filteredData.map(item => item.nm_id).filter(Boolean)).size;
});

const uniqueBrandsCount = computed(() => {
  return new Set(store.filteredData.map(item => item.brand).filter(Boolean)).size;
});

const maxItemValue = computed(() => {
  if (store.filteredData.length === 0) return 0;
  return Math.max(...store.filteredData.map(item => {
    const quantity = parseInt(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return quantity * price;
  })).toFixed(2);
});

const minItemValue = computed(() => {
  if (store.filteredData.length === 0) return 0;
  const values = store.filteredData.map(item => {
    const quantity = parseInt(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return quantity * price;
  }).filter(value => value > 0);
  
  return values.length > 0 ? Math.min(...values).toFixed(2) : 0;
});

const highValueItems = computed(() => {
  return store.filteredData.filter(item => {
    const quantity = parseInt(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return quantity * price > 10000;
  }).length;
});

const zeroQuantityItems = computed(() => {
  return store.filteredData.filter(item => (parseInt(item.quantity) || 0) === 0).length;
});

// Добавляем вычисляемое поле для стоимости
const enhancedData = computed(() => {
  return store.filteredData.map(item => ({
    ...item,
    total_value: ((parseInt(item.quantity) || 0) * (parseFloat(item.price) || 0)).toFixed(2)
  }));
});

const forceRefresh = () => {
  currentDate.value = new Date().toLocaleDateString('ru-RU');
  store.fetchStocks();
};

onMounted(() => {
  store.fetchStocks();
});
</script>

<style scoped>
.stocks-page {
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

.last-update {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #666;
  font-size: 14px;
}

.refresh-btn {
  padding: 8px 16px;
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
  
  .last-update {
    width: 100%;
    justify-content: space-between;
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