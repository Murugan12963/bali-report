import axios from "axios";

export interface PolygonMarketData {
  symbol: string;
  name: string;
  last: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

class PolygonApiService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private cache: { [key: string]: { data: any; timestamp: number } } = {};
  private readonly cacheDuration: number;

  // Indonesian market symbols - using common formats
  private readonly indonesianSymbols = [
    { symbol: "BBCA.JK", name: "Bank Central Asia" },
    { symbol: "BBRI.JK", name: "Bank Rakyat Indonesia" },
    { symbol: "ASII.JK", name: "Astra International" },
    { symbol: "TLKM.JK", name: "Telkom Indonesia" },
  ];

  // BRICS market symbols
  private readonly bricsSymbols = [
    { symbol: "IBOV.SA", name: "Bovespa", country: "Brazil" },      // Brazil
    { symbol: "IMOEX.ME", name: "MOEX", country: "Russia" },       // Russia
    { symbol: "SENSEX.BO", name: "Sensex", country: "India" },     // India
    { symbol: "000001.SS", name: "SSE", country: "China" },        // China (Shanghai)
    { symbol: "J203.JO", name: "JSE All Share", country: "South Africa" }, // South Africa
  ];

  constructor() {
    this.baseUrl = "https://api.polygon.io";
    this.apiKey = process.env.POLYGON_API_KEY || "";
    this.cacheDuration = 60; // 1 minute cache
  }

  private async request<T>(
    endpoint: string,
    params: Record<string, string> = {},
  ): Promise<T> {
    try {
      const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
      const now = Date.now();
      const cached = this.cache[cacheKey];

      if (cached && now - cached.timestamp < this.cacheDuration * 1000) {
        return cached.data;
      }

      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        params: {
          ...params,
          apiKey: this.apiKey,
        },
        timeout: 10000, // 10 second timeout
      });

      // Handle API errors
      if (response.data.error) {
        throw new Error(`Polygon.io API error: ${response.data.error}`);
      }

      // Cache the response
      this.cache[cacheKey] = {
        data: response.data,
        timestamp: now,
      };

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Invalid Polygon.io API key");
        }
        if (error.response?.status === 429) {
          throw new Error("Polygon.io API rate limit exceeded");
        }
        if (error.response?.status && error.response.status >= 400) {
          throw new Error(
            `Polygon.io API error (${error.response.status}): ${error.response.statusText}`,
          );
        }
      }
      throw new Error(
        `Failed to fetch data from Polygon.io: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async getBRICSMarkets(): Promise<PolygonMarketData[]> {
    try {
      if (!this.apiKey) {
        throw new Error("Polygon.io API key not configured");
      }

      const results: PolygonMarketData[] = [];

      // Try to get real-time global market snapshots
      for (const symbolInfo of this.bricsSymbols) {
        try {
          const quoteData = await this.request<{
            symbol: string;
            last: {
              price: number;
              size: number;
              timestamp: number;
            };
            prevDay: {
              c: number; // previous close
              v: number; // volume
            };
          }>(`/v2/last/trade/${symbolInfo.symbol}`);

          const lastPrice = quoteData.last?.price || quoteData.prevDay?.c || 0;
          const previousClose = quoteData.prevDay?.c || 0;
          const change = previousClose ? lastPrice - previousClose : 0;
          const changePercent = previousClose ? (change / previousClose) * 100 : 0;

          results.push({
            symbol: symbolInfo.symbol,
            name: symbolInfo.name,
            last: lastPrice,
            change: change,
            changePercent: changePercent,
            volume: quoteData.last?.size || quoteData.prevDay?.v || 0,
            timestamp: new Date((quoteData.last?.timestamp || Date.now()) / 1000000).toISOString(),
          });
        } catch (error) {
          console.error(`Error fetching data for ${symbolInfo.symbol}:`, error);
        }
      }

      if (results.length === 0) {
        throw new Error("No data received from Polygon.io for any BRICS markets");
      }

      console.log(`Successfully fetched ${results.length} real-time BRICS market quotes from Polygon.io`);
      return results;
    } catch (error) {
      console.error("Error fetching BRICS markets from Polygon.io:", error);
      throw error;
    }
  }

  async getIndonesianMarkets(): Promise<PolygonMarketData[]> {
    try {
      if (!this.apiKey) {
        throw new Error("Polygon.io API key not configured");
      }

      // Try to get real-time global stock snapshots
      const data = await this.request<{
        status: string;
        tickers: Array<{
          ticker: string;
          name: string;
          market: string;
          locale: string;
          currency: string;
          lastTrade: {
            p: number; // price
            s: number; // size
            t: number; // timestamp
          };
          lastQuote: {
            p: number; // ask price
            s: number; // ask size
            P: number; // bid price
            S: number; // bid size
            t: number; // timestamp
          };
          prevDay: {
            o: number; // open
            h: number; // high
            l: number; // low
            c: number; // close
            v: number; // volume
          };
          updated: number;
        }>;
      }>(`/v2/snapshot/locale/global/markets/stocks/tickers`);

      const results: PolygonMarketData[] = [];

      // Filter for our Indonesian stocks
      const indonesianSymbolsSet = new Set(
        this.indonesianSymbols.map((s) => s.symbol),
      );

      for (const ticker of data.tickers || []) {
        if (indonesianSymbolsSet.has(ticker.ticker)) {
          const symbolInfo = this.indonesianSymbols.find(
            (s) => s.symbol === ticker.ticker,
          );
          if (!symbolInfo) continue;

          // Use last trade price if available, otherwise prevDay close
          const lastPrice = ticker.lastTrade?.p || ticker.prevDay?.c || 0;
          const previousClose = ticker.prevDay?.c || 0;
          const change = previousClose ? lastPrice - previousClose : 0;
          const changePercent = previousClose
            ? (change / previousClose) * 100
            : 0;

          results.push({
            symbol: ticker.ticker,
            name: symbolInfo.name,
            last: lastPrice,
            change: change,
            changePercent: changePercent,
            volume: ticker.prevDay?.v || 0, // Use prevDay volume as current volume might not be available
            timestamp: new Date(
              (ticker.lastTrade?.t || ticker.updated || Date.now()) / 1000000,
            ).toISOString(),
          });
        }
      }

      // If no data from snapshot, try individual quote requests as fallback
      if (results.length === 0) {
        console.warn(
          "No data from snapshot, trying individual quotes as fallback",
        );

        for (const symbolInfo of this.indonesianSymbols) {
          try {
            const quoteData = await this.request<{
              symbol: string;
              last: {
                price: number;
                size: number;
                timestamp: number;
              };
              prevDay: {
                c: number; // previous close
                v: number; // volume
              };
            }>(`/v2/last/trade/${symbolInfo.symbol}`);

            const lastPrice =
              quoteData.last?.price || quoteData.prevDay?.c || 0;
            const previousClose = quoteData.prevDay?.c || 0;
            const change = previousClose ? lastPrice - previousClose : 0;
            const changePercent = previousClose
              ? (change / previousClose) * 100
              : 0;

            results.push({
              symbol: symbolInfo.symbol,
              name: symbolInfo.name,
              last: lastPrice,
              change: change,
              changePercent: changePercent,
              volume: quoteData.last?.size || quoteData.prevDay?.v || 0,
              timestamp: new Date(
                (quoteData.last?.timestamp || Date.now()) / 1000000,
              ).toISOString(),
            });
          } catch (error) {
            console.error(
              `Error fetching individual quote for ${symbolInfo.symbol}:`,
              error,
            );
          }
        }
      }

      if (results.length === 0) {
        throw new Error("No data received from Polygon.io for any symbols");
      }

      console.log(
        `Successfully fetched ${results.length} real-time quotes from Polygon.io`,
      );
      return results;
    } catch (error) {
      console.error(
        "Error fetching Indonesian markets from Polygon.io:",
        error,
      );
      throw error;
    }
  }

  async clearCache(): Promise<void> {
    this.cache = {};
  }
}

// Export singleton instance
export const polygonApiService = new PolygonApiService();
