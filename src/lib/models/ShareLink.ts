import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShareLink extends Document {
  token: string;
  clientsData: string; // JSON stringified array
  createdBy: mongoose.Types.ObjectId;
  active: boolean;
  label?: string;
  createdAt: Date;
  expiresAt?: Date;
}

const ShareLinkSchema = new Schema<IShareLink>(
  {
    token: { type: String, required: true, unique: true },
    clientsData: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    active: { type: Boolean, default: true },
    label: { type: String, default: "" },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

const ShareLink: Model<IShareLink> =
  mongoose.models.ShareLink ||
  mongoose.model<IShareLink>("ShareLink", ShareLinkSchema);

export default ShareLink;
