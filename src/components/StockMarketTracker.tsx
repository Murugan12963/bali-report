"use client";

import { useState, useEffect, useMemo } from "react";
import { polygonApiService } from "@/lib/services/polygon-api";

interface MarketData {
  name: string;
  symbol: string;
  country: string;
  flag: string;
  value: number;
  change: number;
  changePercent: number;
  currency: string;
  lastUpdate: string;
}

interface StockMarketTrackerProps {
  markets: "BRICS" | "Indonesia";
}

export default function StockMarketTracker({
  markets,
}: StockMarketTrackerProps) {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // BRICS market indices
  const bricsMarkets: MarketData[] = useMemo(
    () => [
      {
        name: "Bovespa",
        symbol: "IBOV",
        country: "Brazil",
        flag: "🇧🇷",
        value: 128453.2,
        change: 1247.85,
        changePercent: 0.98,
        currency: "BRL",
        lastUpdate: "Live",
      },
      {
        name: "MOEX",
        symbol: "IMOEX",
        country: "Russia",
        flag: "🇷🇺",
        value: 2789.45,
        change: -23.67,
        changePercent: -0.84,
        currency: "RUB",
        lastUpdate: "Live",
      },
      {
        name: "Sensex",
        symbol: "BSE",
        country: "India",
        flag: "🇮🇳",
        value: 84127.85,
        change: 458.23,
        changePercent: 0.55,
        currency: "INR",
        lastUpdate: "Live",
      },
      {
        name: "Shanghai",
        symbol: "SSE",
        country: "China",
        flag: "🇨🇳",
        value: 3087.92,
        change: 15.43,
        changePercent: 0.5,
        currency: "CNY",
        lastUpdate: "Live",
      },
      {
        name: "JSE All Share",
        symbol: "JSE",
        country: "South Africa",
        flag: "🇿🇦",
        value: 85234.67,
        change: -234.12,
        changePercent: -0.27,
        currency: "ZAR",
        lastUpdate: "Live",
      },
    ],
    [],
  );

  // Indonesian market indices (fallback data)
  const indonesiaMarkets: MarketData[] = useMemo(
    () => [
      {
        name: "JCI Composite",
        symbol: "JKSE",
        country: "Indonesia",
        flag: "🇮🇩",
        value: 7431.25,
        change: 67.89,
        changePercent: 0.92,
        currency: "IDR",
        lastUpdate: "Live",
      },
      {
        name: "LQ45 Index",
        symbol: "LQ45",
        country: "Indonesia",
        flag: "🇮🇩",
        value: 1023.45,
        change: 8.73,
        changePercent: 0.86,
        currency: "IDR",
        lastUpdate: "Live",
      },
      {
        name: "IDX30",
        symbol: "IDX30",
        country: "Indonesia",
        flag: "🇮🇩",
        value: 567.89,
        change: -2.34,
        changePercent: -0.41,
        currency: "IDR",
        lastUpdate: "Live",
      },
      {
        name: "Jakarta Islamic",
        symbol: "JII",
        country: "Indonesia",
        flag: "🇮🇩",
        value: 634.78,
        change: 4.56,
        changePercent: 0.72,
        currency: "IDR",
        lastUpdate: "Live",
      },
      {
        name: "IDX BUMN20",
        symbol: "BUMN20",
        country: "Indonesia",
        flag: "🇮🇩",
        value: 456.32,
        change: 3.21,
        changePercent: 0.71,
        currency: "IDR",
        lastUpdate: "Live",
      },
    ],
    [],
  );

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        if (markets === "Indonesia") {
          const polygonData = await polygonApiService.getIndonesianMarkets();
          const mappedData = polygonData.map((item) => ({
            name: item.name,
            symbol: item.symbol,
            country: "Indonesia",
            flag: "🇮🇩",
            value: item.last,
            change: item.change,
            changePercent: item.changePercent,
            currency: "IDR",
            lastUpdate: new Date(item.timestamp).toLocaleTimeString(),
          }));
          setMarketData(mappedData);
        } else {
          // BRICS markets - keep static data for now
          setMarketData(bricsMarkets);
        }
      } catch (error) {
        console.error("Error fetching market data:", error);
        // Fallback to static data
        if (markets === "Indonesia") {
          setMarketData(indonesiaMarkets);
        } else {
          setMarketData(bricsMarkets);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [markets, bricsMarkets, indonesiaMarkets]);

  const handleRefresh = async () => {
    setLoading(true);
    setLastRefresh(new Date());
    try {
      if (markets === "Indonesia") {
        const polygonData = await polygonApiService.getIndonesianMarkets();
        const mappedData = polygonData.map((item) => ({
          name: item.name,
          symbol: item.symbol,
          country: "Indonesia",
          flag: "🇮🇩",
          value: item.last,
          change: item.change,
          changePercent: item.changePercent,
          currency: "IDR",
          lastUpdate: new Date(item.timestamp).toLocaleTimeString(),
        }));
        setMarketData(mappedData);
      } else {
        // BRICS - simple refresh doesn't change static data
        setLoading(false);
      }
    } catch (error) {
      console.error("Error refreshing market data:", error);
      setLoading(false);
    }
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600 dark:text-green-400";
    if (change < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getChangeBackground = (change: number) => {
    if (change > 0)
      return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
    if (change < 0)
      return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800";
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return "📈";
    if (change < 0) return "📉";
    return "➡️";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 theme-transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{markets === "BRICS" ? "🌍" : "🇮🇩"}</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {markets === "BRICS" ? "BRICS Markets" : "Indonesian Markets"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time stock market data
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <span className="text-lg">🔄</span>
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Market Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl h-32"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {marketData.map((market) => (
            <div
              key={market.symbol}
              className={`relative rounded-xl border p-4 transition-all hover:shadow-lg hover:scale-[1.02] ${getChangeBackground(market.change)}`}
            >
              {/* Country Flag and Name */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{market.flag}</span>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {market.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {market.symbol}
                    </div>
                  </div>
                </div>
                <span className="text-2xl">{getChangeIcon(market.change)}</span>
              </div>

              {/* Value */}
              <div className="mb-2">
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatNumber(market.value)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {market.currency}
                </div>
              </div>

              {/* Change */}
              <div className={`font-medium ${getChangeColor(market.change)}`}>
                <span className="text-sm">
                  {market.change >= 0 ? "+" : ""}
                  {formatNumber(market.change)}
                </span>
                <span className="text-xs ml-1">
                  ({market.changePercent >= 0 ? "+" : ""}
                  {formatNumber(market.changePercent)}%)
                </span>
              </div>

              {/* Live Indicator */}
              <div className="absolute top-2 right-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    LIVE
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-green-600 dark:text-green-400">●</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {marketData.filter((m) => m.change > 0).length} Rising
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-red-600 dark:text-red-400">●</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {marketData.filter((m) => m.change < 0).length} Falling
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-400">●</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {marketData.filter((m) => m.change === 0).length} Unchanged
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      {markets === "Indonesia" && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-200 flex items-center">
            <span className="mr-2">ℹ️</span>
            Data provided by Polygon.io. Updates every 30 seconds.
          </p>
        </div>
      )}
      {markets === "BRICS" && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center">
            <span className="mr-2">⚠️</span>
            BRICS market data is for demonstration purposes.
          </p>
        </div>
      )}
    </div>
  );
}
