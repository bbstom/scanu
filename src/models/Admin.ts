import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  username: string;
  password: string;
  createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Admin || 
  mongoose.model<IAdmin>("Admin", AdminSchema);
