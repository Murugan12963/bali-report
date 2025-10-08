"use client";

import { useState, useEffect } from "react";

interface TickerItem {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  flag: string;
}

// Static market data moved outside component
const markets: TickerItem[] = [
  {
    symbol: "IBOV",
    name: "Brazil",
    value: 128453.2,
    change: 1247.85,
    changePercent: 0.98,
    flag: "🇧🇷",
  },
  {
    symbol: "MOEX",
    name: "Russia",
    value: 2789.45,
    change: -23.67,
    changePercent: -0.84,
    flag: "🇷🇺",
  },
  {
    symbol: "BSE",
    name: "India",
    value: 84127.85,
    change: 458.23,
    changePercent: 0.55,
    flag: "🇮🇳",
  },
  {
    symbol: "SSE",
    name: "China",
    value: 3087.92,
    change: 15.43,
    changePercent: 0.5,
    flag: "🇨🇳",
  },
  {
    symbol: "JSE",
    name: "S.Africa",
    value: 85234.67,
    change: -234.12,
    changePercent: -0.27,
    flag: "🇿🇦",
  },
  {
    symbol: "JKSE",
    name: "Indonesia",
    value: 7431.25,
    change: 67.89,
    changePercent: 0.92,
    flag: "🇮🇩",
  },
];

export default function MarketTicker() {
  const [tickerData, setTickerData] = useState<TickerItem[]>([]);

  useEffect(() => {
    // Initialize with base data
    setTickerData(markets);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setTickerData((prevData) =>
        prevData.map((item) => ({
          ...item,
          value: item.value + (Math.random() - 0.5) * 50,
          change: item.change + (Math.random() - 0.5) * 5,
          changePercent: item.changePercent + (Math.random() - 0.5) * 0.05,
        })),
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600 dark:text-green-400";
    if (change < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <div className="bg-gray-900 dark:bg-black text-white py-2 overflow-hidden">
      <div className="relative">
        <div className="flex animate-scroll-ticker">
          {/* First set of items */}
          <div className="flex space-x-8 px-4 min-w-fit">
            {tickerData.map((item, index) => (
              <div
                key={`${item.symbol}-1-${index}`}
                className="flex items-center space-x-2 whitespace-nowrap"
              >
                <span className="text-lg">{item.flag}</span>
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-400">{item.symbol}</span>
                <span className="font-mono">{formatNumber(item.value)}</span>
                <span className={`font-medium ${getChangeColor(item.change)}`}>
                  {item.change >= 0 ? "▲" : "▼"}
                  {Math.abs(item.changePercent).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
          {/* Duplicate for seamless scrolling */}
          <div className="flex space-x-8 px-4 min-w-fit">
            {tickerData.map((item, index) => (
              <div
                key={`${item.symbol}-2-${index}`}
                className="flex items-center space-x-2 whitespace-nowrap"
              >
                <span className="text-lg">{item.flag}</span>
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-400">{item.symbol}</span>
                <span className="font-mono">{formatNumber(item.value)}</span>
                <span className={`font-medium ${getChangeColor(item.change)}`}>
                  {item.change >= 0 ? "▲" : "▼"}
                  {Math.abs(item.changePercent).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll-ticker {
          animation: scroll-ticker 30s linear infinite;
        }

        .animate-scroll-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
