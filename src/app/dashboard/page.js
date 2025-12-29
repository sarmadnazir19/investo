"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Wallet, BarChart3, Newspaper, LogOut } from "lucide-react";
import Button from "../components/Button";
import Navbar from "../components/Navbar";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [news, setNews] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [selectedStock, setSelectedStock] = useState("");
  const [quantity, setQuantity] = useState("");
  const [activeTab, setActiveTab] = useState("trade");
  const [tabContentKey, setTabContentKey] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Fetch Data ---
  async function fetchData() {
    setLoading(true);
    const [userRes, stocksRes, newsRes] = await Promise.all([
      fetch("/api/userinfo", { credentials: "include" }),
      fetch("/api/stocks"),
      fetch("/api/news"),
    ]);
    const userData = await userRes.json();
    const stocksData = await stocksRes.json();
    const newsData = await newsRes.json();

    setUser(userData);
    setStocks(stocksData.stocks || []);
    setNews(newsData.news || []);
    setHoldings(userData.stocks || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setTabContentKey(prev => prev + 1);
  }, [activeTab]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // --- Buy ---
  async function handleBuy() {
    setError("");
    setSuccess("");
    if (!selectedStock || !quantity) return setError("Please select a stock and quantity");
    const stock = stocks.find(s => s.id === selectedStock);
    if (!stock) return setError("Invalid stock selected");
    const cost = stock.StockValue * Number(quantity);
    if (user.balance < cost) return setError("Insufficient balance");
    setLoading(true);

    let updatedHoldings = Array.isArray(user.stocks) ? [...user.stocks] : [];
    const idx = updatedHoldings.findIndex(h => h.stockId === stock.id);
    if (idx >= 0) {
      const prevQty = updatedHoldings[idx].quantity;
      const prevAvg = updatedHoldings[idx].avgPrice;
      const newQty = prevQty + Number(quantity);
      const newAvg = ((prevAvg * prevQty) + cost) / newQty;
      updatedHoldings[idx].quantity = newQty;
      updatedHoldings[idx].avgPrice = newAvg;
    } else {
      updatedHoldings.push({ stockId: stock.id, stockName: stock.StockName, quantity: Number(quantity), avgPrice: stock.StockValue });
    }
    const newBalance = user.balance - cost;

    const res = await fetch("/api/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, balance: newBalance, stocks: updatedHoldings }),
      credentials: "include",
    });

    if (!res.ok) {
      setLoading(false);
      return setError("Failed to update balance");
    }
    setSuccess("Stock purchased successfully!");
    setQuantity("");
    setLoading(false);
    fetchData();
  }

  // --- Sell ---
  async function handleSell() {
    setError("");
    setSuccess("");
    if (!selectedStock || !quantity) return setError("Please select a stock and quantity");
    const stock = stocks.find(s => s.id === selectedStock);
    if (!stock) return setError("Invalid stock selected");

    let updatedHoldings = Array.isArray(user.stocks) ? [...user.stocks] : [];
    const idx = updatedHoldings.findIndex(h => h.stockId === stock.id);
    if (idx < 0 || updatedHoldings[idx].quantity < Number(quantity)) return setError("Not enough shares to sell");

    const revenue = stock.StockValue * Number(quantity);
    setLoading(true);
    updatedHoldings[idx].quantity -= Number(quantity);
    if (updatedHoldings[idx].quantity === 0) updatedHoldings.splice(idx, 1);

    const newBalance = user.balance + revenue;

    const res = await fetch("/api/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, balance: newBalance, stocks: updatedHoldings }),
      credentials: "include",
    });

    if (!res.ok) {
      setLoading(false);
      return setError("Failed to update balance");
    }
    setSuccess("Stock sold successfully!");
    setQuantity("");
    setLoading(false);
    fetchData();
  }

  // --- Logout ---
  async function handleLogout() {
    setLoading(true);
    const res = await fetch("/api/logout", { method: "POST" });
    if (res.ok) window.location.href = "/";
    else {
      setError("Failed to logout");
      setLoading(false);
    }
  }

  // --- Derived values ---
  const selectedStockData = stocks.find(s => s.id === selectedStock);
  const totalCost = selectedStockData ? selectedStockData.StockValue * Number(quantity || 0) : 0;
  const portfolioValue = holdings.reduce((sum, h) => {
    const stock = stocks.find(s => s.id === h.stockId);
    if (stock) return sum + stock.StockValue * h.quantity;
    else if (h.stockId.startsWith("bid:")) return sum + h.avgPrice * h.quantity;
    return sum;
  }, 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#191919] via-black to-[#191919] flex items-center justify-center">
        <div className="text-gold-500 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .animate-fadein {
          animation: fadein 1.2s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadein {
          0% { opacity: 0; transform: translateY(32px) scale(0.98); }
          60% { opacity: 0.7; transform: translateY(8px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .glass-effect {
          background: rgba(255, 207, 96, 0.1);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 207, 96, 0.2);
        }
        .stock-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255, 207, 96, 0.4);
        }
        .holding-card {
          background: linear-gradient(135deg, rgba(25,25,25,0.8) 0%, rgba(255,207,96,0.1) 100%);
        }
        .holding-card:hover {
          background: linear-gradient(135deg, rgba(25,25,25,0.9) 0%, rgba(255,207,96,0.2) 100%);
        }
      `}</style>
      <Navbar onLogout={handleLogout} loading={loading} />
      <main className="min-h-[calc(100vh-180px)] bg-gradient-to-br from-[#191919] via-black to-[#191919] font-sans text-white p-3 sm:p-4 md:p-6 overflow-x-hidden w-full pb-8">
        <div className="mx-auto px-2 sm:px-4 w-full max-w-full" style={{ overflowX: 'hidden' }}>
          {/* Header */}
          <header className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="w-full">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#fbbf24] via-[#ffd700] to-[#fbbf24] bg-clip-text text-transparent text-center sm:text-left animate-fadein">
                Trading Dashboard
              </h1>
              <div className="glass-effect rounded-xl p-3 sm:p-4">
                <p className="text-yellow-200 text-xs sm:text-sm md:text-base text-center sm:text-left">
                  Welcome, <span className="font-bold text-white">{user.username}</span>
                </p>
                <div className="mt-1.5 flex items-center justify-center sm:justify-start gap-2">
                  <Wallet className="text-[#fbbf24]" size={18} />
                  <span className="text-yellow-300 text-xs sm:text-sm">Available Balance:</span>
                  <span className="font-bold text-lg sm:text-xl text-[#fbbf24]">${user.balance?.toLocaleString()}</span>
                </div>
                {portfolioValue > 0 && (
                  <div className="mt-1.5 flex items-center justify-center sm:justify-start gap-2">
                    <BarChart3 className="text-yellow-400" size={18} />
                    <span className="text-yellow-300 text-xs sm:text-sm">Portfolio Value:</span>
                    <span className="font-bold text-base sm:text-lg text-yellow-400">${portfolioValue.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Toast */}
          {(error || success) && (
            <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl p-3 rounded-lg backdrop-blur-md border text-sm shadow-2xl animate-fadein ${
              error
                ? "bg-red-500/90 border-red-400/50 text-white"
                : "bg-yellow-500/90 border-yellow-400/50 text-black"
            }`}>
              {error || success}
            </div>
          )}

          {/* Tabs */}
          <div className="w-full space-y-4">
            <div className="flex gap-2 glass-effect p-2 rounded-xl w-full max-w-full overflow-x-auto shadow-lg">
              {["trade","holdings","news","stocks"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-3 rounded-lg transition-all font-semibold text-sm ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-[#fbbf24] to-[#ffd700] text-black shadow-xl scale-105"
                      : "text-yellow-300 hover:bg-yellow-900/30 hover:scale-102"
                  }`}
                >
                  {{
                    trade: <><TrendingUp className="inline mr-1" size={14} />Trade</>,
                    holdings: <><BarChart3 className="inline mr-1" size={14} />Holdings</>,
                    news: <><Newspaper className="inline mr-1" size={14} />News</>,
                    stocks: <><TrendingUp className="inline mr-1" size={14} />Stocks</>,
                  }[tab]}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-[#191919]/80 backdrop-blur-sm rounded-lg border border-yellow-800/50 p-3 sm:p-4 animate-fadein w-full max-w-full overflow-x-auto" key={tabContentKey}>
              {/* --- Trade Tab --- */}
              {activeTab === "trade" && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Trade Stocks</h2>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-sm text-yellow-300 mb-1">Select Stock</label>
                      <select
                        value={selectedStock}
                        onChange={(e) => setSelectedStock(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-[#191919]/50 text-white border border-yellow-800 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all"
                      >
                        <option value="">Choose a stock</option>
                        {stocks.map(s => (
                          s?.id && s?.StockName && s?.StockValue != null ? (
                            <option key={s.id} value={s.id}>
                              {s.StockName} - ${s.StockValue}
                            </option>
                          ) : null
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-yellow-300 mb-1">Quantity</label>
                      <input
                        type="number"
                        placeholder="Enter quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                        className="w-full px-4 py-3 rounded-lg bg-[#191919]/50 text-white border border-yellow-800 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all"
                      />
                    </div>

                    {/* Order Summary */}
                    {selectedStockData && quantity && (
                      <div className="glass-effect rounded-xl p-3 shadow-lg animate-fadein">
                        <h3 className="text-base font-bold text-white mb-2">Order Summary</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-yellow-300">Stock Price:</span>
                            <span className="font-bold text-white">${selectedStockData.StockValue}</span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-yellow-300">Quantity:</span>
                            <span className="font-bold text-white">{quantity}</span>
                          </div>
                          <div className="border-t border-yellow-800/50 my-2"></div>
                          <div className="flex justify-between items-center bg-black/30 rounded-lg p-2">
                            <span className="text-yellow-300 font-semibold text-sm">Total Cost:</span>
                            <span className="font-bold text-xl text-[#fbbf24]">${totalCost.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 justify-center">
                      <div onClick={handleBuy}>
                        <Button
                          text={loading ? "Buying..." : "Buy"}
                          color="#191919"
                          textColor="#fff"
                          glowColor="#fbbf24"
                          rippleColor="rgba(255,207,36,0.2)"
                          className="shadow-[0_0_10px_2px_#fbbf24] mx-0.5"
                        />
                      </div>
                      <div onClick={handleSell}>
                        <Button
                          text={loading ? "Selling..." : "Sell"}
                          color="#191919"
                          textColor="#fff"
                          glowColor="#fbbf24"
                          rippleColor="rgba(255,207,36,0.2)"
                          className="shadow-[0_0_10px_2px_#fbbf24] mx-0.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- Holdings Tab --- */}
              {activeTab === "holdings" && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Your Holdings</h2>
                  {holdings.length === 0 ? (
                    <div className="text-center py-8 text-yellow-400">
                      <BarChart3 size={40} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No stocks in your portfolio yet</p>
                      <p className="text-xs mt-1">Start trading to build your portfolio!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {holdings.map((holding) => {
                        const stock = stocks.find(s => s.id === holding.stockId);
                        const isLiveBidStock = holding.stockId.startsWith("bid:");

                        if (isLiveBidStock) {
                          const currentValue = holding.avgPrice * holding.quantity;
                          return (
                            <div key={holding.stockId} className="holding-card border border-yellow-800/50 rounded-xl p-3 transition-all duration-300 shadow-lg relative">
                              <div className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/50 rounded-full">
                                <span className="text-[10px] font-semibold text-yellow-300">LIVE BID</span>
                              </div>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="text-lg font-bold text-white mb-0.5">{holding.stockName}</h3>
                                  <p className="text-xs text-yellow-300">{holding.quantity} shares</p>
                                </div>
                                <div className="text-right mt-5">
                                  <div className="text-lg font-bold text-[#fbbf24]">${currentValue.toLocaleString()}</div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-black/20 rounded-lg p-2">
                                  <div className="text-yellow-400 mb-0.5">Purchase Price</div>
                                  <div className="font-bold text-white">${holding.avgPrice.toFixed(2)}</div>
                                </div>
                                <div className="bg-black/20 rounded-lg p-2">
                                  <div className="text-yellow-400 mb-0.5">Total Value</div>
                                  <div className="font-bold text-white">${currentValue.toLocaleString()}</div>
                                </div>
                              </div>
                            </div>
                          );
                        } else if (stock) {
                          const currentValue = stock.StockValue * holding.quantity;
                          const change = ((stock.StockValue - holding.avgPrice) / holding.avgPrice) * 100;
                          return (
                            <div key={holding.stockId} className="holding-card border border-yellow-800/50 rounded-xl p-3 transition-all duration-300 shadow-lg">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="text-lg font-bold text-white mb-0.5">{stock.StockName}</h3>
                                  <p className="text-xs text-yellow-300">{holding.quantity} shares</p>
                                </div>
                                <div className="text-right mt-5">
                                  <div className={`text-lg font-bold ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
                                    ${currentValue.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-yellow-300">{change.toFixed(2)}%</div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-black/20 rounded-lg p-2">
                                  <div className="text-yellow-400 mb-0.5">Purchase Price</div>
                                  <div className="font-bold text-white">${holding.avgPrice.toFixed(2)}</div>
                                </div>
                                <div className="bg-black/20 rounded-lg p-2">
                                  <div className="text-yellow-400 mb-0.5">Current Price</div>
                                  <div className="font-bold text-white">${stock.StockValue.toFixed(2)}</div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* --- News Tab --- */}
              {activeTab === "news" && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Market News</h2>
                  <div className="space-y-2">
                    {news.map(n => (
                      <div key={n.id} className="glass-effect rounded-xl p-3 shadow-lg transition-all hover:scale-102 cursor-pointer">
                        <h3 className="font-bold text-white text-base">{n.title}</h3>
                        <p className="text-yellow-300 text-sm mt-1">{n.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- Stocks Tab --- */}
              {activeTab === "stocks" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {stocks.map(stock => (
                    <div key={stock.id} className="stock-card glass-effect rounded-xl p-3 transition-all cursor-pointer">
                      <h3 className="font-bold text-white text-lg mb-1">{stock.StockName}</h3>
                      <p className="text-yellow-300 text-sm">Price: ${stock.StockValue}</p>
                      <p className={`text-xs ${stock?.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {typeof stock?.change === "number" ? stock.change.toFixed(2) : "0.00"}%</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
