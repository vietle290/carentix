import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const {bookingId, otp} = await req.json();
        const booking = await Booking.findById(bookingId).populate("user");
        if (!booking) {
            return NextResponse.json({ message: "Invalid booking" }, { status: 400 });
        }

        if (!booking.dropOtp) {
            return NextResponse.json({ message: "Drop OTP not sent" }, { status: 400 });
        }

        if (otp !== booking.dropOtp) {
            return NextResponse.json({ message: "Invalid Drop OTP" }, { status: 400 });
        }

        if (new Date() > booking.dropOtpExpires) {
            return NextResponse.json({ message: "Drop OTP expired" }, { status: 400 });
        }

        booking.bookingStatus = "completed";
        booking.dropOtp = "";
        booking.dropOtpExpires = undefined;
        await booking.save();


        return NextResponse.json({ message: "Drop OTP verified successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: `Error verifying drop OTP ${error}` }, { status: 500 });
    }
}