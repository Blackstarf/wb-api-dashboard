<template>
  <div class="pagination">
    <button 
      @click="emit('page-change', currentPage - 1)"
      :disabled="currentPage === 1"
      class="pagination-btn"
    >
      ← Назад
    </button>
    
    <span class="page-info">
      Страница {{ currentPage }} из {{ totalPages }}
    </span>
    
    <button 
      @click="emit('page-change', currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="pagination-btn"
    >
      Вперед →
    </button>
  </div>
</template>

<script setup>
defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['page-change']);
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 20px 0;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  background: #2c3e50;
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: 500;
  color: #2c3e50;
}
</style>