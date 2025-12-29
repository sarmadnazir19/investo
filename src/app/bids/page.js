"use client";
import { useState, useEffect } from "react";
import { TrendingUp, Gavel, Users, DollarSign, Clock, Award, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";

export default function LiveBidsPage() {
  const [bids, setBids] = useState([]);
  const [user, setUser] = useState("");
  const [balance, setBalance] = useState(0);
  const [bidValues, setBidValues] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBids();
    fetch("/api/userinfo", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setUser(data.username || "");
        setBalance(data.balance || 0);
      });
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

  async function fetchBids() {
    setLoading(true);
    const res = await fetch("/api/livebids");
    const data = await res.json();
    setBids(data.bids || []);
    setLoading(false);
  }

  async function placeBid(bidId, minBid) {
    setError("");
    setSuccess("");
    const value = bidValues[bidId];
    if (!value || !user) return setError("Enter bid value and login");
    
    const bidAmount = Number(value);
    if (bidAmount < minBid) {
      return setError(`Bid must be at least $${minBid}`);
    }
    
    setLoading(true);
    const res = await fetch("/api/livebids/place", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bidId, user, value: bidAmount })
    });
    const data = await res.json();
    setLoading(false);
    
    if (data.success) {
      setSuccess("Bid placed successfully!");
      setBidValues(v => ({ ...v, [bidId]: "" }));
      fetchBids();
    } else {
      setError(data.error || "Bid failed");
    }
  }

  const activeBids = bids.filter(bid => bid.status === "active");

  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-purple-800 font-sans text-white p-3 md:p-4">
      <div className="max-w-6xl mx-auto">

        <header className="mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Gavel className="text-purple-400" size={24} />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Live Bidding
            </h1>
          </div>
          <p className="text-purple-300 text-xs sm:text-sm">Place your bids on active stock offerings</p>
          {user && (
            <div className="mt-2 flex flex-col sm:flex-row gap-1.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-600/30 border border-purple-500/50 rounded-lg text-xs sm:text-sm">
                <Users size={12} />
                <span>Logged in as: <strong>{user}</strong></span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-600/30 border border-green-500/50 rounded-lg text-xs sm:text-sm">
                <DollarSign size={12} className="text-green-400" />
                <span className="text-green-300">Balance: <strong className="text-white">${balance.toLocaleString()}</strong></span>
              </div>
            </div>
          )}
        </header>


        {(error || success) && (
          <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl p-3 rounded-lg backdrop-blur-md border text-sm flex items-start gap-2 shadow-2xl animate-fadein ${
            error 
              ? "bg-red-500/90 border-red-400/50 text-white" 
              : "bg-green-500/90 border-green-400/50 text-white"
          }`}>
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span className="flex-1">{error || success}</span>
          </div>
        )}


        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 mb-4">
          <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-sm rounded-lg border border-purple-500/50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-[10px] sm:text-xs mb-0.5">Active Bids</p>
                <p className="text-xl sm:text-2xl font-bold">{activeBids.length}</p>
              </div>
              <Clock className="text-purple-400" size={22} />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-600/30 to-emerald-600/30 backdrop-blur-sm rounded-lg border border-green-500/50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-[10px] sm:text-xs mb-0.5">Your Bids</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {activeBids.reduce((count, bid) => 
                    count + (bid.bids?.filter(b => b.user === user).length || 0), 0
                  )}
                </p>
              </div>
              <Gavel className="text-green-400" size={22} />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 backdrop-blur-sm rounded-lg border border-blue-500/50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-[10px] sm:text-xs mb-0.5">Total Volume</p>
                <p className="text-xl sm:text-2xl font-bold">
                  ${activeBids.reduce((sum, b) => sum + (b.value * b.quantity), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="text-blue-400" size={22} />
            </div>
          </div>
        </div>


        {loading && activeBids.length === 0 ? (
          <div className="text-center py-8 text-purple-400">
            <Clock className="animate-pulse mx-auto mb-2" size={28} />
            <p className="text-xs sm:text-sm">Loading live bids...</p>
          </div>
        ) : activeBids.length === 0 ? (
          <div className="text-center py-10 bg-purple-950/30 rounded-lg border border-purple-700/30">
            <Gavel className="mx-auto mb-3 text-purple-600" size={40} />
            <p className="text-purple-400 text-base font-semibold mb-1">No Active Bids</p>
            <p className="text-purple-500 text-xs sm:text-sm">Check back soon for new bidding opportunities</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {activeBids.map(bid => (
              <BidCard
                key={bid.id}
                bid={bid}
                user={user}
                bidValue={bidValues[bid.id] || ""}
                setBidValue={(value) => setBidValues(v => ({ ...v, [bid.id]: value }))}
                onPlaceBid={() => placeBid(bid.id, bid.value * bid.quantity)}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>
    </main>
    </>
  );
}

function BidCard({ bid, user, bidValue, setBidValue, onPlaceBid, loading }) {
  const minBid = bid.value * bid.quantity;
  const userBids = bid.bids?.filter(b => b.user === user) || [];
  const highestBid = bid.bids?.length > 0 
    ? Math.max(...bid.bids.map(b => b.value))
    : minBid;
  const isUserHighest = userBids.some(b => b.value === highestBid);

  return (
    <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-lg border border-purple-500/50 p-3 hover:shadow-lg transition-all">

      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-lg sm:text-xl font-bold mb-0.5">{bid.stockName}</h3>
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/20 border border-green-500/50 rounded-full w-fit">
            <Clock size={10} className="text-green-400" />
            <span className="text-[10px] font-semibold text-green-300">LIVE</span>
          </div>
        </div>
        <TrendingUp className="text-purple-400" size={20} />
      </div>

      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <div className="bg-black/30 rounded-lg p-1.5">
          <p className="text-purple-300 text-[10px]">Price</p>
          <p className="text-xs sm:text-sm font-bold">${bid.value}</p>
        </div>
        <div className="bg-black/30 rounded-lg p-1.5">
          <p className="text-purple-300 text-[10px]">Qty</p>
          <p className="text-xs sm:text-sm font-bold">{bid.quantity}</p>
        </div>
        <div className="bg-black/30 rounded-lg p-1.5">
          <p className="text-purple-300 text-[10px]">Min Bid</p>
          <p className="text-xs sm:text-sm font-bold text-yellow-400">${minBid}</p>
        </div>
      </div>


      {bid.bids?.length > 0 && (
        <div className="mb-2 p-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-blue-300">Highest Bid:</span>
            <span className="text-xs sm:text-sm font-bold text-blue-200">${highestBid}</span>
          </div>
          {isUserHighest && (
            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-green-400">
              <Award size={10} />
              You&apos;re leading!
            </div>
          )}
        </div>
      )}


      <div className="mb-2">
        <label className="block text-[10px] text-purple-300 mb-1">Your Bid Amount</label>
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="number"
              placeholder={minBid.toString()}
              value={bidValue}
              onChange={e => setBidValue(e.target.value)}
              className="w-full pl-7 pr-2 py-1.5 text-xs sm:text-sm rounded-lg bg-purple-900/50 text-white border border-purple-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              min={minBid}
            />
          </div>
          <button
            onClick={onPlaceBid}
            disabled={loading || !bidValue}
            className="px-3 py-1.5 text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50 whitespace-nowrap"
          >
            Place Bid
          </button>
        </div>
      </div>


      <div className="pt-2 border-t border-white/10">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1 text-purple-300">
            <Users size={12} />
            <strong className="text-[10px]">All Bids ({bid.bids?.length || 0})</strong>
          </div>
        </div>
        
        {bid.bids?.length > 0 ? (
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {bid.bids
              .sort((a, b) => b.value - a.value)
              .map((b, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center p-1.5 rounded-lg border transition-all ${
                    b.user === user
                      ? "bg-purple-600/20 border-purple-500/50"
                      : "bg-purple-900/20 border-purple-700/30"
                  }`}
                >
                  <span className="text-[10px] sm:text-xs font-medium flex items-center gap-1">
                    {b.user === user && <Award size={10} className="text-yellow-400" />}
                    {b.user}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-purple-300">${b.value}</span>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-2 bg-purple-900/20 rounded-lg border border-purple-700/30">
            <p className="text-purple-400 text-[10px]">No bids yet - be the first!</p>
          </div>
        )}
      </div>
    </div>
  );
}