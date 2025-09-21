import { defineStore } from 'pinia';
import { fetchData, apiEndpoints } from '../api/wbApi';

export const useStocksStore = defineStore('stocks', {
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
      minPrice: '',
      subject: ''
    }
  }),
  
  getters: {
    totalPages: (state) => Math.ceil(state.filteredData.length / state.itemsPerPage),
    paginatedData: (state) => {
      const start = (state.currentPage - 1) * state.itemsPerPage;
      const end = start + state.itemsPerPage;
      return state.filteredData.slice(start, end);
    },
    uniqueWarehouses: (state) => {
      return [...new Set(state.allData.map(item => item.warehouse_name).filter(Boolean))].sort();
    },
    uniqueSubjects: (state) => {
      return [...new Set(state.allData.map(item => item.subject).filter(Boolean))].sort();
    }
  },
  
  actions: {
    async fetchStocks() {
      this.loading = true;
      this.error = null;
      
      try {
        // Для stocks используем только текущую дату
        const today = new Date();
        const dateFrom = today.toISOString().split('T')[0]; // YYYY-MM-DD
        
        console.log('📦 Загрузка остатков на:', dateFrom);
        
        const data = await fetchData(apiEndpoints.stocks, { dateFrom });
        this.allData = Array.isArray(data) ? data : [];
        this.applyFilters();
      } catch (error) {
        this.error = error.message;
        console.error('Stocks fetch error:', error);
        this.allData = [];
        this.filteredData = [];
      } finally {
        this.loading = false;
      }
    },
    
    applyFilters() {
      this.filteredData = this.allData.filter(item => {
        if (this.filters.search && 
            !item.supplier_article?.toLowerCase().includes(this.filters.search.toLowerCase()) &&
            !item.nm_id?.toString().includes(this.filters.search)) {
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
            (parseFloat(item.price) || 0) < parseFloat(this.filters.minPrice)) {
          return false;
        }
        
        if (this.filters.subject && 
            item.subject !== this.filters.subject) {
          return false;
        }
        
        return true;
      });
      
      this.currentPage = 1;
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