"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, Wallet, BarChart3, Package, Trophy, Gavel } from "lucide-react";
import AdminNavbar from "../../../components/AdminNavbar";

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username;
  
  const [user, setUser] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [liveBids, setLiveBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserDetails();
  }, [username]);

  async function fetchUserDetails() {
    try {
      setLoading(true);
      setError("");

      // Fetch all users to find this specific user
      const usersRes = await fetch("/api/admin", {
        credentials: "include",
      });
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      const usersData = await usersRes.json();
      
      const foundUser = usersData.users.find(u => u.username === username);
      if (!foundUser) throw new Error("User not found");


      const stocksRes = await fetch("/api/stocks");
      if (!stocksRes.ok) throw new Error("Failed to fetch stocks");
      const stocksData = await stocksRes.json();


      const bidsRes = await fetch("/api/livebids");
      if (!bidsRes.ok) throw new Error("Failed to fetch live bids");
      const bidsData = await bidsRes.json();

      setUser(foundUser);
      setStocks(stocksData.stocks);
      setLiveBids(bidsData.liveBids || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-purple-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading user details...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-purple-800">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-6">
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded">
            {error || "User not found"}
          </div>
          <button
            onClick={() => router.push("/admin/leaderboard")}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Leaderboard
          </button>
        </div>
      </div>
    );
  }

  // Calculate portfolio value
  const portfolioValue = (user.stocks || []).reduce((sum, holding) => {
    const stock = stocks.find(s => s.id === holding.stockId);
    if (stock) {
      return sum + (stock.StockValue * holding.quantity);
    } else if (holding.stockId && holding.stockId.startsWith("bid:")) {
      return sum + (holding.avgPrice * holding.quantity);
    }
    return sum;
  }, 0);

  const totalValue = user.balance + portfolioValue;


  const regularStocks = (user.stocks || []).filter(h => !h.stockId.startsWith("bid:"));
  const liveBidHoldings = (user.stocks || []).filter(h => h.stockId.startsWith("bid:"));

  const wonBids = liveBids.filter(bid => {
    if (!bid.bids || bid.bids.length === 0) return false;
    const highestBid = bid.bids.reduce((max, b) => b.amount > max.amount ? b : max, bid.bids[0]);
    return highestBid.username === username && bid.awarded;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-purple-800">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">

        <button
          onClick={() => router.push("/admin/leaderboard")}
          className="flex items-center gap-2 text-purple-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Leaderboard</span>
        </button>


        <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-4">{username}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-black/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-green-400" />
                <span className="text-purple-300 text-sm">Balance</span>
              </div>
              <p className="text-white text-2xl font-bold">${user.balance.toLocaleString()}</p>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span className="text-purple-300 text-sm">Portfolio Value</span>
              </div>
              <p className="text-white text-2xl font-bold">${portfolioValue.toLocaleString()}</p>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-purple-300 text-sm">Total Value</span>
              </div>
              <p className="text-white text-2xl font-bold">${totalValue.toLocaleString()}</p>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300 text-sm">Total Holdings</span>
              </div>
              <p className="text-white text-2xl font-bold">{(user.stocks || []).length}</p>
            </div>
          </div>
        </div>


        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            Stock Portfolio
          </h2>

          {regularStocks.length === 0 ? (
            <p className="text-purple-300 text-center py-8">No stocks owned yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/30">
                    <th className="px-4 py-3 text-left text-purple-300 font-semibold">Stock</th>
                    <th className="px-4 py-3 text-right text-purple-300 font-semibold">Shares</th>
                    <th className="px-4 py-3 text-right text-purple-300 font-semibold">Avg Price</th>
                    <th className="px-4 py-3 text-right text-purple-300 font-semibold">Current Price</th>
                    <th className="px-4 py-3 text-right text-purple-300 font-semibold">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {regularStocks.map((holding, index) => {
                    const stock = stocks.find(s => s.id === holding.stockId);
                    const currentValue = stock ? stock.StockValue * holding.quantity : 0;

                    return (
                      <tr key={index} className="border-b border-purple-500/20 hover:bg-purple-500/10">
                        <td className="px-4 py-3 text-white font-medium">
                          {holding.stockName || "Unknown"}
                        </td>
                        <td className="px-4 py-3 text-right text-white">
                          {holding.quantity.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-white">
                          ${holding.avgPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-white">
                          ${stock ? stock.StockValue.toLocaleString() : "N/A"}
                        </td>
                        <td className="px-4 py-3 text-right text-white font-bold">
                          ${currentValue.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>


        {liveBidHoldings.length > 0 && (
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Gavel className="w-6 h-6 text-yellow-400" />
              Won Live Bids
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/30">
                    <th className="px-4 py-3 text-left text-purple-300 font-semibold">Item</th>
                    <th className="px-4 py-3 text-right text-purple-300 font-semibold">Quantity</th>
                    <th className="px-4 py-3 text-right text-purple-300 font-semibold">Price Paid</th>
                    <th className="px-4 py-3 text-right text-purple-300 font-semibold">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {liveBidHoldings.map((holding, index) => {
                    const totalValue = holding.avgPrice * holding.quantity;
                    return (
                      <tr key={index} className="border-b border-purple-500/20 hover:bg-purple-500/10">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-block bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs font-bold">
                              LIVE BID
                            </span>
                            <span className="text-white font-medium">{holding.stockName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-white">
                          {holding.quantity.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-white">
                          ${holding.avgPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-white font-bold">
                          ${totalValue.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {wonBids.length > 0 && (
          <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Awarded Bids
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wonBids.map((bid) => {
                const highestBid = bid.bids.reduce((max, b) => b.amount > max.amount ? b : max, bid.bids[0]);
                return (
                  <div key={bid.id} className="bg-black/30 rounded-lg p-4 border border-yellow-500/30">
                    <h3 className="text-white font-bold mb-2">{bid.stockName}</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-300">Winning Bid:</span>
                        <span className="text-white font-bold">${highestBid.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-300">Quantity:</span>
                        <span className="text-white">{bid.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-300">Status:</span>
                        <span className="text-green-400 font-bold">AWARDED ✓</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
