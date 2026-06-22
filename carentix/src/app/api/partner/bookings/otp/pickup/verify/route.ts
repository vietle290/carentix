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

        if (!booking.pickUpOtp) {
            return NextResponse.json({ message: "Pickup OTP not sent" }, { status: 400 });
        }

        if (otp !== booking.pickUpOtp) {
            return NextResponse.json({ message: "Invalid Pickup OTP" }, { status: 400 });
        }

        if (new Date() > booking.pickUpOtpExpires) {
            return NextResponse.json({ message: "Pickup OTP expired" }, { status: 400 });
        }

        booking.bookingStatus = "started"
        booking.pickUpOtp = "";
        booking.pickUpOtpExpires = undefined;
        await booking.save();


        return NextResponse.json({ message: "Pickup OTP verified successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: `Error verifying pickup OTP ${error}` }, { status: 500 });
    }
}