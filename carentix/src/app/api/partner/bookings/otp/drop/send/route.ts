import connectDb from "@/lib/db";
import { sendMail } from "@/lib/sendMail";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const {bookingId} = await req.json();
        const booking = await Booking.findById(bookingId).populate("user");
        if (!booking) {
            return NextResponse.json({ message: "Invalid booking" }, { status: 400 });
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        booking.dropOtp = otp;
        booking.dropOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
        await booking.save();

        if (booking.user.email) {
            await sendMail(booking.user.email, "Your Drop OTP - CARENTIX", `
                <div style="font-family:sans-serif;padding:20px">
                    <h2>Ride OTP</h2>
                    <p>Your Drop OTP is:</p>
                    <h1 style="letter-spacing:6px">${otp}</h1>
                    <p>This OTP is valid for 5 minutes.</p>
                    <p>Share this OTP with the driver to end the ride</p>
                    <br/>
                    <b>CARENTIX</b>
                </div>
                `)
        }

        return NextResponse.json({ message: "Drop OTP sent successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: `Error sending drop OTP ${error}` }, { status: 500 });
    }
}