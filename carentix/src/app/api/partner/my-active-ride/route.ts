import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const { bookingId } = await req.json();
        const user = await User.findOne({ email: session.user.email });
        const booking = await Booking.findOne({
            _id: bookingId,
            // driver: user._id,
            // bookingStatus: {
            //     "$in": ["confirmed", "started"]
            // }
        }).populate("user driver vehicle");

        return NextResponse.json({ booking }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: `Get active booking for partner error ${error}` }, { status: 500 });
    }
}