// api/proxy.js
export default async function handler(request, response) {
  const { query } = request;
  const { endpoint, ...params } = query;
  
  // Базовый URL API
  const API_BASE = 'http://109.73.206.144:6969';
  const API_KEY = 'E6kUTYrYwZq2tN4QEtyzsbEBk3ie';
  
  // Формируем URL
  const url = new URL(`${API_BASE}/api/${endpoint}`);
  url.searchParams.append('key', API_KEY);
  
  // Добавляем параметры
  Object.keys(params).forEach(key => {
    if (params[key]) {
      url.searchParams.append(key, params[key]);
    }
  });
  
  try {
    const apiResponse = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!apiResponse.ok) {
      throw new Error(`API error: ${apiResponse.status}`);
    }
    
    const data = await apiResponse.json();
    
    // Разрешаем CORS
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    response.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    response.status(500).json({ 
      error: error.message,
      url: url.toString()
    });
  }
}

// Обработка OPTIONS запросов для CORS
export const config = {
  api: {
    bodyParser: false,
  },
};