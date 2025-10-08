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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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
    <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-purple-800 font-sans text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Trading Dashboard
              </h1>
              <p className="text-purple-300 text-sm md:text-base">
                Welcome {user.username}, your available Balance is: <span className="font-bold text-green-400">${user.balance?.toLocaleString()}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </header>

        {/* Notifications */}
        {(error || success) && (
          <div className={`mb-6 p-4 rounded-lg backdrop-blur-sm border ${
            error 
              ? "bg-red-500/20 border-red-500/50 text-red-200" 
              : "bg-green-500/20 border-green-500/50 text-green-200"
          }`}>
            {error || success}
          </div>
        )}


        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Trading & Holdings */}
          <div className="md:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 bg-purple-950/50 p-2 rounded-lg backdrop-blur-sm border border-purple-700/50">
              <button
                onClick={() => setActiveTab("trade")}
                className={`flex-1 py-2 px-4 rounded-md transition-all ${
                  activeTab === "trade"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                    : "text-purple-300 hover:bg-purple-800/50"
                }`}
              >
                Trade
              </button>
              <button
                onClick={() => setActiveTab("holdings")}
                className={`flex-1 py-2 px-4 rounded-md transition-all ${
                  activeTab === "holdings"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                    : "text-purple-300 hover:bg-purple-800/50"
                }`}
              >
                Holdings
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-purple-950/50 backdrop-blur-sm rounded-lg border border-purple-700/50 p-6">
              {activeTab === "trade" && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Trade Stocks</h2>
                  <div className="flex flex-col gap-4">
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
                      <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-purple-300">Stock Price:</span>
                          <span className="font-semibold">${selectedStockData.StockValue}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-purple-300">Quantity:</span>
                          <span className="font-semibold">{quantity}</span>
                        </div>
                        <div className="border-t border-purple-700/50 my-2"></div>
                        <div className="flex justify-between">
                          <span className="text-purple-300">Total Cost:</span>
                          <span className="font-bold text-lg">${totalCost.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 justify-center">
                      <div onClick={handleBuy}>
                        <Button
                          text={loading ? "Buying..." : "Buy"}
                          color="#7c3aed" // purple
                          textColor="#fff"
                          glowColor="#10b981" // green glow
                          rippleColor="rgba(124,58,237,0.2)" // purple ripple
                          className="shadow-[0_0_10px_2px_#10b981] mx-0.5"
                        />
                      </div>
                      <div onClick={handleSell}>
                        <Button
                          text={loading ? "Selling..." : "Sell"}
                          color="#7c3aed" // purple
                          textColor="#fff"
                          glowColor="#ef4444" // red glow
                          rippleColor="rgba(124,58,237,0.2)" // purple ripple
                          className="shadow-[0_0_10px_2px_#ef4444] mx-0.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "holdings" && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Your Holdings</h2>
                  {holdings.length === 0 ? (
                    <div className="text-center py-12 text-purple-400">
                      <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No stocks in your portfolio yet</p>
                      <p className="text-sm mt-2">Start trading to build your portfolio!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {holdings.map((holding) => {
                        const stock = stocks.find(s => s._id === holding.stockId);
                        if (!stock) return null;
                        const currentValue = stock.StockValue * holding.quantity;
                        return (
                          <div key={holding.stockId} className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4 hover:bg-purple-900/50 transition-all">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="text-xl font-bold text-purple-100">{stock.StockName}</h3>
                                <p className="text-sm text-purple-400">{holding.quantity} shares</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold">${currentValue.toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-purple-400">Current Price</div>
                                <div className="font-semibold">${stock.StockValue}</div>
                              </div>
                              <div>
                                <div className="text-purple-400">Avg Price</div>
                                <div className="font-semibold">${holding.avgPrice.toFixed(2)}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stocks & News */}
          <div className="space-y-6">
            {/* Available Stocks */}
            <div className="bg-purple-950/50 backdrop-blur-sm rounded-lg border border-purple-700/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-purple-400" />
                <h3 className="text-lg font-semibold">Available Stocks</h3>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {stocks.length === 0 ? (
                  <div className="text-center text-purple-400 py-8">No stocks available</div>
                ) : (
                  stocks.map(s => (
                    <div
                      key={s._id}
                      className="p-3 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 transition-all border border-purple-700/30 cursor-pointer"
                      onClick={() => setSelectedStock(s._id)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{s.StockName}</span>
                        <span className="text-green-400 font-bold">${s.StockValue}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
    </>
  );
}