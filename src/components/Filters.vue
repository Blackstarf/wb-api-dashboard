<template>
  <div class="filters">
    <div class="filter-group">
      <input 
        type="text" 
        v-model="localFilters.search"
        placeholder="Поиск по артикулу или номеру..."
        @keyup.enter="applyFilters"
      >
    </div>
    
    <div class="filter-group">
      <select v-model="localFilters.warehouse" @change="applyFilters">
        <option value="">Все склады</option>
        <option v-for="warehouse in warehouses" :key="warehouse" :value="warehouse">
          {{ warehouse }}
        </option>
      </select>
    </div>
    
    <div class="filter-group">
      <select v-model="localFilters.region" @change="applyFilters">
        <option value="">Все регионы</option>
        <option v-for="region in regions" :key="region" :value="region">
          {{ region }}
        </option>
      </select>
    </div>
    
    <div class="filter-group">
      <select v-model="localFilters.isCanceled" @change="applyFilters">
        <option value="">Все статусы</option>
        <option value="false">Активные</option>
        <option value="true">Отмененные</option>
      </select>
    </div>
    
    <div class="filter-group">
      <input 
        type="number" 
        v-model.number="localFilters.minPrice"
        placeholder="Мин. сумма"
        @keyup.enter="applyFilters"
        min="0"
        step="0.01"
      >
    </div>
    
    <div class="filter-group">
      <input 
        type="number" 
        v-model.number="localFilters.minDiscount"
        placeholder="Мин. скидка %"
        @keyup.enter="applyFilters"
        min="0"
        max="100"
        step="1"
      >
    </div>
    
    <button @click="applyFilters" class="apply-btn">
      🔍 Найти
    </button>
    
    <button @click="resetFilters" class="reset-btn">
      🗑️ Сбросить
    </button>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  },
  data: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update-filters']);

const localFilters = ref({ 
  search: props.filters.search || '',
  warehouse: props.filters.warehouse || '',
  region: props.filters.region || '',
  isCanceled: props.filters.isCanceled || '',
  minPrice: props.filters.minPrice || '',
  minDiscount: props.filters.minDiscount || ''
});

const warehouses = ref([]);
const regions = ref([]);

// Собираем уникальные склады и регионы
watch(() => props.data, (newData) => {
  if (newData.length > 0) {
    const uniqueWarehouses = [...new Set(newData.map(item => item.warehouse_name).filter(Boolean))];
    warehouses.value = uniqueWarehouses.sort();
    
    const uniqueRegions = [...new Set(newData.map(item => item.oblast).filter(Boolean))];
    regions.value = uniqueRegions.sort();
  }
}, { immediate: true });

const applyFilters = () => {
  emit('update-filters', { ...localFilters.value });
};

const resetFilters = () => {
  localFilters.value = {
    search: '',
    warehouse: '',
    region: '',
    isCanceled: '',
    minPrice: '',
    minDiscount: ''
  };
  applyFilters();
};
</script>

<style scoped>
.filters {
  display: flex;
  gap: 12px;
  align-items: end;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

input, select {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 120px;
}

.apply-btn {
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.apply-btn:hover {
  background: #45a049;
}

.reset-btn {
  padding: 8px 16px;
  border: 1px solid #dc3545;
  background: white;
  color: #dc3545;
  border-radius: 4px;
  cursor: pointer;
}

.reset-btn:hover {
  background: #dc3545;
  color: white;
}
</style>