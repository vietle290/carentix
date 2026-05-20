import mongoose, { Document, model } from "mongoose";



const userSchema = new mongoose.Schema(
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
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

const User = model("User", userSchema);
export default User;
