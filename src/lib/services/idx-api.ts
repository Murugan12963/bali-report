import axios from 'axios';

export interface IDXMarketData {
  symbol: string;
  name: string;
  last: number;
  change: number;
  changePercent: number;
  volume: number;
  value: number;
  timestamp: string;
}

class IDXApiService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private cache: { [key: string]: { data: any; timestamp: number } } = {};
  private readonly cacheDuration: number;

  constructor() {
    this.baseUrl = process.env.IDX_API_BASE_URL || 'https://api.idx.co.id/v1';
    this.apiKey = process.env.IDX_API_KEY || '';
    this.cacheDuration = Number(process.env.IDX_CACHE_DURATION) || 300; // 5 minutes default
  }

  private async request<T>(endpoint: string): Promise<T> {
    try {
      // Check cache first
      const cacheKey = endpoint;
      const now = Date.now();
      const cached = this.cache[cacheKey];

      if (cached && (now - cached.timestamp) < (this.cacheDuration * 1000)) {
        return cached.data;
      }

      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        }
      });

      // Update cache
      this.cache[cacheKey] = {
        data: response.data,
        timestamp: now
      };

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid IDX API credentials');
        }
        if (error.response?.status === 429) {
          throw new Error('IDX API rate limit exceeded');
        }
      }
      throw new Error('Failed to fetch data from IDX API');
    }
  }

  async getIndices(): Promise<IDXMarketData[]> {
    const indices = ['COMPOSITE', 'LQ45', 'IDX30', 'JII', 'IDXBUMN20'];
    try {
      const response = await this.request<any>('/stockIndices');
      
      // Transform the response to match our interface
      return indices.map(index => {
        const data = response.find((item: any) => item.indexCode === index);
        return {
          symbol: data.indexCode,
          name: this.getIndexName(data.indexCode),
          last: data.currentValue,
          change: data.indexChange,
          changePercent: data.percentageChange,
          volume: data.volume,
          value: data.tradingValue,
          timestamp: data.tradingDate
        };
      });
    } catch (error) {
      console.error('Error fetching IDX indices:', error);
      throw error;
    }
  }

  private getIndexName(symbol: string): string {
    const names: { [key: string]: string } = {
      'COMPOSITE': 'JCI Composite',
      'LQ45': 'LQ45 Index',
      'IDX30': 'IDX30',
      'JII': 'Jakarta Islamic',
      'IDXBUMN20': 'IDX BUMN20'
    };
    return names[symbol] || symbol;
  }

  async clearCache(): Promise<void> {
    this.cache = {};
  }
}

// Export singleton instance
export const idxApiService = new IDXApiService();