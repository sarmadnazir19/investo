"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Wallet, BarChart3, Newspaper, LogOut } from "lucide-react";
import Button from "../components/Button";
import Navbar from "../components/Navbar";

export default function DashboardPage() {
  async function handleBuy() {
    setError("");
    setSuccess("");
    if (!selectedStock || !quantity) return setError("Please select a stock and quantity");
    const stock = stocks.find(s => s._id === selectedStock);
    if (!stock) return setError("Invalid stock selected");
    const cost = stock.StockValue * Number(quantity);
    if (user.balance < cost) return setError("Insufficient balance");
    setLoading(true);
    // Update holdings array for DB
    let updatedHoldings = Array.isArray(user.stocks) ? [...user.stocks] : [];
    const idx = updatedHoldings.findIndex(h => h.stockId === stock._id);
    if (idx >= 0) {
      // Weighted average price calculation
      const prevQty = updatedHoldings[idx].quantity;
      const prevAvg = updatedHoldings[idx].avgPrice;
      const newQty = prevQty + Number(quantity);
      const newAvg = ((prevAvg * prevQty) + cost) / newQty;
      updatedHoldings[idx].quantity = newQty;
      updatedHoldings[idx].avgPrice = newAvg;
    } else {
      updatedHoldings.push({ stockId: stock._id, stockName: stock.StockName, quantity: Number(quantity), avgPrice: stock.StockValue });
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

  async function handleSell() {
    setError("");
    setSuccess("");
    if (!selectedStock || !quantity) return setError("Please select a stock and quantity");
    const stock = stocks.find(s => s._id === selectedStock);
    if (!stock) return setError("Invalid stock selected");
    // Use user.stocks for DB holdings
    let updatedHoldings = Array.isArray(user.stocks) ? [...user.stocks] : [];
    const idx = updatedHoldings.findIndex(h => h.stockId === stock._id);
    if (idx < 0 || updatedHoldings[idx].quantity < Number(quantity)) return setError("Not enough shares to sell");
    const revenue = stock.StockValue * Number(quantity);
    setLoading(true);
    updatedHoldings[idx].quantity -= Number(quantity);
    if (updatedHoldings[idx].quantity === 0) {
      updatedHoldings.splice(idx, 1);
    }
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

  async function handleLogout() {
    setLoading(true);
    const res = await fetch("/api/logout", { method: "POST" });
    if (res.ok) {
      window.location.href = "/";
    } else {
      setError("Failed to logout");
      setLoading(false);
    }
  }


  const selectedStockData = stocks.find(s => s._id === selectedStock);
  const totalCost = selectedStockData ? selectedStockData.StockValue * Number(quantity || 0) : 0;
  const portfolioValue = holdings.reduce((sum, h) => {
    const stock = stocks.find(s => s._id === h.stockId);
    return sum + (stock ? stock.StockValue * h.quantity : 0);
  }, 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-purple-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
    {/* putting it in a style tag * for now */}
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
        background: rgba(88, 28, 135, 0.15);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(192, 132, 252, 0.2);
      }
      .stock-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(168, 85, 247, 0.4);
      }
      .holding-card {
        background: linear-gradient(135deg, rgba(88, 28, 135, 0.3) 0%, rgba(168, 85, 247, 0.1) 100%);
      }
      .holding-card:hover {
        background: linear-gradient(135deg, rgba(88, 28, 135, 0.5) 0%, rgba(168, 85, 247, 0.2) 100%);
      }
    `}</style>
    <Navbar onLogout={handleLogout} loading={loading} />
      <main className="min-h-[calc(100vh-180px)] bg-gradient-to-br from-black via-purple-900 to-purple-800 font-sans text-white p-3 sm:p-4 md:p-6 overflow-x-hidden w-full pb-8">
  <div className="mx-auto px-2 sm:px-4 w-full max-w-full" style={{ overflowX: 'hidden' }}>
          <header className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="w-full">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-transparent text-center sm:text-left animate-fadein">
                Trading Dashboard
              </h1>
              <div className="glass-effect rounded-xl p-3 sm:p-4">
                <p className="text-purple-200 text-xs sm:text-sm md:text-base text-center sm:text-left">
                  Welcome, <span className="font-bold text-white">{user.username}</span>
                </p>
                <div className="mt-1.5 flex items-center justify-center sm:justify-start gap-2">
                  <Wallet className="text-green-400" size={18} />
                  <span className="text-purple-300 text-xs sm:text-sm">Available Balance:</span>
                  <span className="font-bold text-lg sm:text-xl text-green-400">${user.balance?.toLocaleString()}</span>
                </div>
                {portfolioValue > 0 && (
                  <div className="mt-1.5 flex items-center justify-center sm:justify-start gap-2">
                    <BarChart3 className="text-blue-400" size={18} />
                    <span className="text-purple-300 text-xs sm:text-sm">Portfolio Value:</span>
                    <span className="font-bold text-base sm:text-lg text-blue-400">${portfolioValue.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </header>


        {(error || success) && (
          <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl p-3 rounded-lg backdrop-blur-md border text-sm shadow-2xl animate-fadein ${
            error 
              ? "bg-red-500/90 border-red-400/50 text-white" 
              : "bg-green-500/90 border-green-400/50 text-white"
          }`}>
            {error || success}
          </div>
        )}

        <div className="w-full space-y-4">

            <div className="flex gap-2 glass-effect p-2 rounded-xl w-full max-w-full overflow-x-auto shadow-lg">
              <button
                onClick={() => setActiveTab("trade")}
                className={`flex-1 py-2 px-3 rounded-lg transition-all font-semibold text-sm ${
                  activeTab === "trade"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/50 scale-105"
                    : "text-purple-300 hover:bg-purple-800/50 hover:scale-102"
                }`}
              >
                <TrendingUp className="inline mr-1" size={14} />
                Trade
              </button>
              <button
                onClick={() => setActiveTab("holdings")}
                className={`flex-1 py-2 px-3 rounded-lg transition-all font-semibold text-sm ${
                  activeTab === "holdings"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/50 scale-105"
                    : "text-purple-300 hover:bg-purple-800/50 hover:scale-102"
                }`}
              >
                <BarChart3 className="inline mr-1" size={14} />
                Holdings
              </button>
              <button
                onClick={() => setActiveTab("news")}
                className={`flex-1 py-2 px-3 rounded-lg transition-all font-semibold text-sm ${
                  activeTab === "news"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/50 scale-105"
                    : "text-purple-300 hover:bg-purple-800/50 hover:scale-102"
                }`}
              >
                <Newspaper className="inline mr-1" size={14} />
                News
              </button>
              <button
                onClick={() => setActiveTab("stocks")}
                className={`flex-1 py-2 px-3 rounded-lg transition-all font-semibold text-sm ${
                  activeTab === "stocks"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/50 scale-105"
                    : "text-purple-300 hover:bg-purple-800/50 hover:scale-102"
                }`}
              >
                <TrendingUp className="inline mr-1" size={14} />
                Stocks
              </button>
            </div>


            <div
              className="bg-purple-950/50 backdrop-blur-sm rounded-lg border border-purple-700/50 p-3 sm:p-4 animate-fadein w-full max-w-full overflow-x-auto"
              key={tabContentKey}
            >
              {activeTab === "trade" && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Trade Stocks</h2>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-sm text-purple-300 mb-1">Select Stock</label>
                      <select
                        value={selectedStock}
                        onChange={(e) => setSelectedStock(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-purple-900/50 text-white border border-purple-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      >
                        <option value="">Choose a stock</option>
                        {stocks.map(s => (
                          <option key={s._id} value={s._id}>
                            {s.StockName} - ${s.StockValue}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-purple-300 mb-1">Quantity</label>
                      <input
                        type="number"
                        placeholder="Enter quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                        className="w-full px-4 py-3 rounded-lg bg-purple-900/50 text-white border border-purple-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      />
                    </div>
                    {selectedStockData && quantity && (
                      <div className="glass-effect rounded-xl p-3 shadow-lg animate-fadein">
                        <h3 className="text-base font-bold text-white mb-2">Order Summary</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-purple-300">Stock Price:</span>
                            <span className="font-bold text-white">${selectedStockData.StockValue}</span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-purple-300">Quantity:</span>
                            <span className="font-bold text-white">{quantity}</span>
                          </div>
                          <div className="border-t border-purple-700/50 my-2"></div>
                          <div className="flex justify-between items-center bg-black/30 rounded-lg p-2">
                            <span className="text-purple-200 font-semibold text-sm">Total Cost:</span>
                            <span className="font-bold text-xl text-green-400">${totalCost.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 justify-center">
                      <div onClick={handleBuy}>
                        <Button
                          text={loading ? "Buying..." : "Buy"}
                          color="#7c3aed" 
                          textColor="#fff"
                          glowColor="#10b981" 
                          rippleColor="rgba(124,58,237,0.2)" 
                          className="shadow-[0_0_10px_2px_#10b981] mx-0.5"
                        />
                      </div>
                      <div onClick={handleSell}>
                        <Button
                          text={loading ? "Selling..." : "Sell"}
                          color="#7c3aed" 
                          textColor="#fff"
                          glowColor="#ef4444" 
                          rippleColor="rgba(124,58,237,0.2)" 
                          className="shadow-[0_0_10px_2px_#ef4444] mx-0.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "holdings" && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Your Holdings</h2>
                  {holdings.length === 0 ? (
                    <div className="text-center py-8 text-purple-400">
                      <BarChart3 size={40} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No stocks in your portfolio yet</p>
                      <p className="text-xs mt-1">Start trading to build your portfolio!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {holdings.map((holding) => {
                        const stock = stocks.find(s => s._id === holding.stockId);
                        if (!stock) return null;
                        const currentValue = stock.StockValue * holding.quantity;
                        return (
                          <div key={holding.stockId} className="holding-card border border-purple-700/50 rounded-xl p-3 transition-all duration-300 shadow-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="text-lg font-bold text-white mb-0.5">{stock.StockName}</h3>
                                <p className="text-xs text-purple-300">{holding.quantity} shares</p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-400">${currentValue.toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-black/20 rounded-lg p-2">
                                <div className="text-purple-400 mb-0.5">Current Price</div>
                                <div className="font-bold text-white">${stock.StockValue}</div>
                              </div>
                              <div className="bg-black/20 rounded-lg p-2">
                                <div className="text-purple-400 mb-0.5">Avg Price</div>
                                <div className="font-bold text-white">${holding.avgPrice.toFixed(2)}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "news" && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Latest News</h2>
                  {news.length === 0 ? (
                    <div className="text-center text-purple-400 py-8 text-sm">No news available</div>
                  ) : (
                    <>
 
                      <div className="mb-3 p-3 rounded-lg bg-purple-900/30 border border-purple-700/30">
                        <div className="font-bold text-purple-100 text-base mb-1">{news[0].title}</div>
                        <div className="text-purple-300 text-sm mb-1">{news[0].body || news[0].content}</div>
                        <div className="text-xs text-purple-400">{news[0].date ? new Date(news[0].date).toLocaleString() : ""}</div>
                      </div>
        
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {news.slice(1).length === 0 ? (
                          <div className="text-center text-purple-400 py-3 text-sm">No more news</div>
                        ) : (
                          news.slice(1).map(n => (
                            <div key={n._id} className="p-2 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 transition-all border border-purple-700/30">
                              <div className="font-medium text-purple-100 mb-0.5 text-sm">{n.title}</div>
                              <div className="text-xs text-purple-300 line-clamp-2">{n.body || n.content}</div>
                              <div className="text-xs text-purple-400 mt-1">{n.date ? new Date(n.date).toLocaleString() : ""}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "stocks" && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Available Stocks</h2>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {stocks.length === 0 ? (
                      <div className="text-center text-purple-400 py-8 text-sm">No stocks available</div>
                    ) : (
                      stocks.map(s => (
                        <div
                          key={s._id}
                          className="stock-card p-3 rounded-xl glass-effect hover:bg-purple-900/50 transition-all duration-300 cursor-pointer shadow-md"
                          onClick={() => setSelectedStock(s._id)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                <TrendingUp size={16} className="text-white" />
                              </div>
                              <span className="font-bold text-base text-white">{s.StockName}</span>
                            </div>
                            <span className="text-green-400 font-bold text-lg">${s.StockValue}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </main>
    </>
  );
}