import { defineStore } from 'pinia';
import { fetchData, apiEndpoints, getDateRange } from '../api/wbApi';

export const useIncomesStore = defineStore('incomes', {
  state: () => ({
    allData: [],
    filteredData: [],
    loading: false,
    error: null,
    currentPage: 1,
    itemsPerPage: 50,
    filters: {
      search: '',
      warehouse: '',
      minQuantity: '',
      minPrice: ''
    }
  }),
  
  getters: {
    totalPages: (state) => Math.ceil(state.filteredData.length / state.itemsPerPage),
    paginatedData: (state) => {
      const start = (state.currentPage - 1) * state.itemsPerPage;
      const end = start + state.itemsPerPage;
      return state.filteredData.slice(start, end);
    }
  },
  
  actions: {
    async fetchAllIncomes() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('🟡 Загрузка данных из API...');
        
        const { dateFrom, dateTo } = getDateRange(1);
        const data = await fetchData(apiEndpoints.incomes, { 
          dateFrom, 
          dateTo,
          limit: 500 
        });
        
        console.log('🟢 Получены данные:', data);
        
        // Обрабатываем разные форматы ответа
        let dataArray = [];
        
        if (Array.isArray(data)) {
          dataArray = data;
        } else if (data && typeof data === 'object') {
          // Ищем массив данных в объекте
          const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
          
          if (arrayKeys.length > 0) {
            // Берем первый найденный массив
            dataArray = data[arrayKeys[0]];
          } else if (data.data && Array.isArray(data.data)) {
            dataArray = data.data;
          } else {
            // Пробуем преобразовать объект в массив
            dataArray = Object.values(data);
          }
        }
        
        // Фильтруем только объекты
        this.allData = dataArray.filter(item => item && typeof item === 'object');
        
        console.log(`✅ Загружено ${this.allData.length} записей`);
        this.applyFilters();
        
      } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        this.error = error.message;
        this.allData = [];
        this.filteredData = [];
      } finally {
        this.loading = false;
      }
    },
    
    applyFilters() {
      this.filteredData = this.allData.filter(item => {
        if (this.filters.search && 
            !item.supplier_article?.toLowerCase().includes(this.filters.search.toLowerCase())) {
          return false;
        }
        
        if (this.filters.warehouse && 
            item.warehouse_name !== this.filters.warehouse) {
          return false;
        }
        
        if (this.filters.minQuantity && 
            (parseInt(item.quantity) || 0) < parseInt(this.filters.minQuantity)) {
          return false;
        }
        
        if (this.filters.minPrice && 
            (parseFloat(item.total_price) || 0) < parseFloat(this.filters.minPrice)) {
          return false;
        }
        
        return true;
      });
      
      this.currentPage = 1;
      console.log(`🔍 После фильтров: ${this.filteredData.length} записей`);
    },
    
    setFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters };
      this.applyFilters();
    },
    
    setPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    }
  }
});