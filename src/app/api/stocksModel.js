import mongoose from "mongoose";

const StocksSchema = new mongoose.Schema({
  StockName: { type: String, required: true, unique: true },
  StockValue: { type: Number, required: true },
});

export default mongoose.models.Stocks || mongoose.model("Stocks", StocksSchema);