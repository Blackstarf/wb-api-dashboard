import { fetchData, getDateRange } from '../api/wbApi';

export const createBaseStore = (endpoint, storeName) => {
  return defineStore(storeName, {
    state: () => ({
      allData: [],
      filteredData: [],
      loading: false,
      error: null,
      currentPage: 1,
      itemsPerPage: 50,
      filters: {}
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
      async fetchData() {
        this.loading = true;
        this.error = null;
        
        try {
          const { dateFrom, dateTo } = getDateRange(1);
          const data = await fetchData(endpoint, { dateFrom, dateTo });
          this.allData = Array.isArray(data) ? data : [];
          this.applyFilters();
        } catch (error) {
          this.error = error.message;
          this.allData = [];
          this.filteredData = [];
        } finally {
          this.loading = false;
        }
      },
      
      applyFilters() {
        // Будет переопределено в каждом store
        this.filteredData = this.allData;
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
};