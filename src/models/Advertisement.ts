import mongoose, { Schema, Document } from "mongoose";

export interface IAdvertisement extends Document {
  title: string;
  type: "text" | "image" | "html";
  content: string; // 文字内容或 HTML 内容
  imageUrl?: string; // 图片 URL
  imageHeight?: number; // 图片高度（像素）
  linkUrl?: string; // 点击跳转链接
  position: "home" | "detail-top" | "detail-middle" | "detail-bottom";
  enabled: boolean;
  order: number; // 排序，数字越小越靠前
  createdAt: Date;
  updatedAt: Date;
}

const AdvertisementSchema = new Schema<IAdvertisement>(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "html"],
      required: true,
      default: "text",
    },
    content: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
    },
    imageHeight: {
      type: Number,
      default: 200, // 默认高度 200px
    },
    linkUrl: {
      type: String,
    },
    position: {
      type: String,
      enum: ["home", "detail-top", "detail-middle", "detail-bottom"],
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

AdvertisementSchema.index({ position: 1, enabled: 1, order: 1 });

// 删除缓存的模型以确保使用最新的 schema
if (mongoose.models.Advertisement) {
  delete mongoose.models.Advertisement;
}

export default mongoose.model<IAdvertisement>("Advertisement", AdvertisementSchema);
