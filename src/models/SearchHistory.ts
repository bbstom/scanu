import mongoose, { Schema, Document } from "mongoose";

export interface ISearchHistory extends Document {
  address: string;
  chainType: "eth" | "btc" | "trx";
  searchCount: number;
  lastSearchAt: Date;
  createdAt: Date;
  // 新增字段
  firstSearchAt: Date;
  tags?: string[]; // 用户自定义标签
  note?: string; // 备注
  isFavorite?: boolean; // 是否收藏
  lastBalance?: string; // 最后查询的余额
  lastBalanceUSD?: number; // 最后查询的美元价值
}

const SearchHistorySchema = new Schema<ISearchHistory>({
  address: {
    type: String,
    required: true,
    index: true,
  },
  chainType: {
    type: String,
    required: true,
    enum: ["eth", "btc", "trx"],
  },
  searchCount: {
    type: Number,
    default: 1,
  },
  lastSearchAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  firstSearchAt: {
    type: Date,
    default: Date.now,
  },
  tags: {
    type: [String],
    default: [],
  },
  note: {
    type: String,
    default: "",
  },
  isFavorite: {
    type: Boolean,
    default: false,
    index: true,
  },
  lastBalance: {
    type: String,
    default: "0",
  },
  lastBalanceUSD: {
    type: Number,
    default: 0,
  },
});

SearchHistorySchema.index({ address: 1, chainType: 1 }, { unique: true });
SearchHistorySchema.index({ searchCount: -1 }); // 热门地址索引
SearchHistorySchema.index({ lastSearchAt: -1 }); // 最近搜索索引

export default mongoose.models.SearchHistory || 
  mongoose.model<ISearchHistory>("SearchHistory", SearchHistorySchema);
