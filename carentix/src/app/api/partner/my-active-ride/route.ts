import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user.email });
        const booking = await Booking.findOne({
            driver: user._id,
            bookingStatus: {
                "$in": ["confirmed", "started", "completed"]
            }
        }).populate("user driver vehicle");

        return NextResponse.json({ booking }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: `Get active booking error ${error}` }, { status: 500 });
    }
}