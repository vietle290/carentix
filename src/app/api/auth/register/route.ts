import connectDb from "@/lib/db";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();
        await connectDb();
        let user = await User.findOne({ email });
        if (user) {
            return NextResponse.json({ message: "Email already exists" }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({ name, email, password: hashedPassword });
        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: `Register failed: ${error}` }, { status: 500 });
    }
}