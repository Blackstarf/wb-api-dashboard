<template>
  <div class="data-table">
    <table>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.id || item.g_number || item.income_id">
          <td v-for="column in columns" :key="column.key">
            {{ formatValue(item, column) }}
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-if="data.length === 0" class="no-data">
      Нет данных для отображения
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  }
});

const formatValue = (item, column) => {
  // Если поле существует в объекте, используем его
  if (item[column.key] !== undefined) {
    const value = item[column.key];
    
    if (column.formatter && typeof column.formatter === 'function') {
      return column.formatter(value);
    }
    
    return value || 'N/A';
  }
  
  // Если поле не существует, пытаемся вычислить его
  if (column.key === 'total_value') {
    const quantity = parseInt(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const total = quantity * price;
    return column.formatter ? column.formatter(total) : total.toFixed(2);
  }
  
  return 'N/A';
};
</script>

<style scoped>
.data-table {
  overflow-x: auto;
  margin: 20px 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

tr:hover {
  background-color: #f5f5f5;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}
</style>