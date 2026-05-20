import mongoose, { Document, model } from "mongoose";

type VideoKycStatus =
  | "not_required"
  | "pending"
  | "in_progress"
  | "approved"
  | "rejected";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "user" | "partner" | "admin";
  isEmailVerified?: boolean;
  otp?: string;
  otpExpiry?: Date;
  socketId: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  isOnline: boolean;
  partnerOnboardingSteps: number;
  mobileNumber?: string;
  partnerStatus: "approved" | "pending" | "rejected";
  rejectionReason?: string;
  videoKycStatus: VideoKycStatus;
  videoKycRoomId: string;
  videoKycRejectionReason: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["user", "partner", "admin"], default: "user" },
    isEmailVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    socketId: { type: String, default: null },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: [Number],
    },
    isOnline: { type: Boolean, default: false, index: true },
    partnerOnboardingSteps: { type: Number, min: 0, max: 8, default: 0 },
    mobileNumber: { type: String },
    partnerStatus: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },
    videoKycStatus: {
      type: String,
      enum: ["not_required", "pending", "in_progress", "approved", "rejected"],
      default: "not_required",
    },
    videoKycRoomId: { type: String },
    videoKycRejectionReason: { type: String },
  },
  { timestamps: true },
);

userSchema.index({ location: "2dsphere" });

const User = mongoose.models.User || model("User", userSchema);
export default User;
