import axios, { AxiosInstance } from 'axios';

class APIClient {
  private client: AxiosInstance;
  private retryCount = 3;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        
        if (!config || !config.retry) {
          config.retry = 0;
        }

        if (config.retry < this.retryCount) {
          config.retry += 1;
          await new Promise((resolve) => setTimeout(resolve, 1000 * config.retry));
          return this.client(config);
        }

        return Promise.reject(error);
      }
    );
  }

  async getSystemInfo() {
    const response = await this.client.get('/api/system/info');
    return response.data;
  }

  async getCPUInfo() {
    const response = await this.client.get('/api/system/cpu');
    return response.data;
  }

  async getMemoryInfo() {
    const response = await this.client.get('/api/system/memory');
    return response.data;
  }

  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new APIClient();
