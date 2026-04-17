import connectDb from "@/lib/db";
import { sendMail } from "@/lib/sendMail";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();
        await connectDb();
        let user = await User.findOne({ email });
        if (user && user.isEmailVerified) {
            return NextResponse.json({ message: "Email already exists" }, { status: 400 });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        if (password.length < 6) {
            return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
        }


        const hashedPassword = await bcrypt.hash(password, 10);
        if (user && !user.isEmailVerified) {
            user.name = name;
            user.password = hashedPassword;
            user.email = email;
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save();
            return NextResponse.json(user, { status: 200 });
        } else {
            user = await User.create({ name, email, password: hashedPassword, otp, otpExpiry });
        }
        await sendMail(email, "Verify your email", `<p>Your OTP for email verification is: <strong>${otp}</strong></p><p>This OTP is valid for 10 minutes.</p>`);
        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: `Register failed: ${error}` }, { status: 500 });
    }
}