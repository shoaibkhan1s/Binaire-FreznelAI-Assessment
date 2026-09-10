import localforage from 'localforage';

class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.modelsCacheKey = 'binaire_models_cache';
  }

  // Fetch API in background without async-await
  // Also using Streams API for large JSON handling to prevent corruption
  fetchModels(url) {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let result = '';

          const readChunk = () => {
            reader.read().then(({ done, value }) => {
              if (done) {
                try {
                  const data = JSON.parse(result);
                  // Cache data for offline usage
                  this.cacheData(data).then(() => {
                    resolve(data);
                  });
                } catch (error) {
                  reject(new Error('JSON Parse Error: File might be corrupted or incomplete.'));
                }
                return;
              }
              // Append chunks safely
              result += decoder.decode(value, { stream: true });
              readChunk();
            }).catch(reject);
          };

          readChunk();
        })
        .catch(reject);
    });
  }

  cacheData(data) {
    return localforage.setItem(this.modelsCacheKey, data);
  }

  getCachedModels() {
    return localforage.getItem(this.modelsCacheKey);
  }
}

const apiService = new ApiService('/api/hf-models-api.json');
export default apiService;
