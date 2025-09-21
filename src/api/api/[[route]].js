// api/[[route]].js
export default async function handler(req, res) {
  const { route } = req.query;
  const API_BASE = 'http://109.73.206.144:6969';
  const API_KEY = 'E6kUTYrYwZq2tN4QEtyzsbEBk3ie';
  
  // Получаем параметры из запроса
  const { ...queryParams } = req.query;
  delete queryParams.route; // Удаляем параметр route
  
  // Формируем URL
  const url = new URL(`${API_BASE}/api/${route}`);
  url.searchParams.append('key', API_KEY);
  
  // Добавляем остальные параметры
  Object.keys(queryParams).forEach(key => {
    if (queryParams[key]) {
      url.searchParams.append(key, queryParams[key]);
    }
  });
  
  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Разрешаем CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    res.status(200).json(data);
  } catch (error) {
    console.error('API Proxy error:', error);
    res.status(500).json({ 
      error: error.message,
      url: url.toString()
    });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};