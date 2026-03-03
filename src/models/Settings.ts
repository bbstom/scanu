import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  key: string;
  value: string;
  description?: string;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  value: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Settings || 
  mongoose.model<ISettings>("Settings", SettingsSchema);
