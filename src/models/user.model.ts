import mongoose, { Document, model } from "mongoose";

export interface IUser extends Document{
    name: string;
    email: string;
    password?: string;
    role: "user" | "partner" | "admin";
    isEmailVerified?: boolean;
    otp?: string;
    otpExpiry?: Date;
    partnerOnboardingSteps: number;
    mobileNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["user", "partner", "admin"], default: "user" },
    isEmailVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    partnerOnboardingSteps: { type: Number, min: 0, max: 8, default: 0 },
    mobileNumber: { type: String },
},{timestamps: true});

const User = mongoose.models.User || model("User", userSchema);
export default User;