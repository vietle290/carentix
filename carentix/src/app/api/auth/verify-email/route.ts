import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await connectDb();
        const { email, otp } = await req.json();
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        if (!email && !otp) {
            return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
        }
        if (user.otp !== otp) {
            return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
        }
        if (!user.otpExpiry || user.otpExpiry < new Date()) {
            return NextResponse.json({ message: "OTP expired" }, { status: 400 });
        }
        if (user.isEmailVerified) {
            return NextResponse.json({ message: "Email already verified" }, { status: 400 });
        }
        user.isEmailVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
    }
}