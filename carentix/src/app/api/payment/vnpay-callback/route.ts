import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const searchParams = req.nextUrl.searchParams;
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
    const vnp_OrderInfo = searchParams.get("vnp_OrderInfo");
    const bookingId = searchParams.get("vnp_TxnRef");

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found", success: false },
      );
    }

    if (vnp_ResponseCode !== "00") {
    //   booking.bookingStatus = "cancelled";
      booking.paymentStatus = "failed";
      await booking.save();
      return NextResponse.redirect(`${process.env.PAYMENRT_FAILURE_URL}?bookingId=${booking._id}`);
    }

    const adminCommission = booking.fare * 0.10;
    const partnerAmount = booking.fare - adminCommission;
    booking.adminCommission = adminCommission;
    booking.partnerAmount = partnerAmount;
    booking.bookingStatus = "confirmed";
    booking.paymentStatus = "paid";
    await booking.save();
    
    return NextResponse.redirect(`${process.env.PAYMENRT_SUCCESS_URL}?bookingId=${booking._id}`);
  } catch (error) {
    return NextResponse.json(
      { message: `VNPAY callback error ${error}` },
      { status: 500 },
    );
  }
}
