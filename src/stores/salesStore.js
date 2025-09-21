import { defineStore } from 'pinia';
import { fetchData, apiEndpoints, getDateRange } from '../api/wbApi';

export const useSalesStore = defineStore('sales', {
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
      minPrice: '',
      minDiscount: '',
      region: ''
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
    uniqueRegions: (state) => {
      return [...new Set(state.allData.map(item => item.region_name).filter(Boolean))].sort();
    }
  },
  
  actions: {
    async fetchSales() {
      this.loading = true;
      this.error = null;
      
      try {
        const { dateFrom, dateTo } = getDateRange(1);
        const data = await fetchData(apiEndpoints.sales, { dateFrom, dateTo });
        this.allData = Array.isArray(data) ? data : [];
        this.applyFilters();
      } catch (error) {
        this.error = error.message;
        console.error('Sales fetch error:', error);
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
            !item.sale_id?.toLowerCase().includes(this.filters.search.toLowerCase())) {
          return false;
        }
        
        if (this.filters.warehouse && 
            item.warehouse_name !== this.filters.warehouse) {
          return false;
        }
        
        if (this.filters.minPrice && 
            (parseFloat(item.total_price) || 0) < parseFloat(this.filters.minPrice)) {
          return false;
        }
        
        if (this.filters.minDiscount && 
            (parseFloat(item.discount_percent) || 0) < parseFloat(this.filters.minDiscount)) {
          return false;
        }
        
        if (this.filters.region && 
            item.region_name !== this.filters.region) {
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