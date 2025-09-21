import axios from 'axios';

// Определяем среду выполнения
const IS_DEVELOPMENT = import.meta.env.DEV;
const API_BASE = IS_DEVELOPMENT ? 'http://109.73.206.144:6969' : '';
const API_KEY = 'E6kUTYrYwZq2tN4QEtyzsbEBk3ie';

const api = axios.create({
  baseURL: IS_DEVELOPMENT ? `${API_BASE}/api` : '/api',
  params: {
    key: IS_DEVELOPMENT ? API_KEY : undefined,
    limit: 100
  },
  timeout: 30000
});

// Интерцептор для запросов
api.interceptors.request.use((config) => {
  console.log('🟡 API Request:', config.method?.toUpperCase(), config.url);
  
  if (!IS_DEVELOPMENT) {
    // Для production добавляем ключ как query параметр
    config.params = {
      ...config.params,
      key: API_KEY
    };
  }
  
  console.log('Params:', config.params);
  return config;
});

// Интерцептор для ответов
api.interceptors.response.use(
  (response) => {
    console.log('🟢 API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('🔴 API Error:', error.response?.status, error.config?.url);
    console.log('Error details:', error.message);
    return Promise.reject(error);
  }
);

export const apiEndpoints = {
  orders: 'orders',
  sales: 'sales', 
  incomes: 'incomes',
  stocks: 'stocks'
};

export const fetchData = async (endpoint, params = {}) => {
  try {
    const response = await api.get(`/${endpoint}`, { params });
    
    // Обработка разных форматов ответа
    let data = response.data;
    
    if (data && typeof data === 'object') {
      if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data)) {
        return data;
      }
      const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
      if (arrayKey) {
        return data[arrayKey];
      }
    }
    
    return data || [];
  } catch (error) {
    console.error('API Request failed:', {
      endpoint,
      params,
      error: error.response?.data || error.message
    });
    throw error;
  }
};

export const getDateRange = (yearsBack = 1) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  return {
    dateFrom: `${currentYear - yearsBack}-01-01`,
    dateTo: `${currentYear}-12-31`
  };
};

export const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};