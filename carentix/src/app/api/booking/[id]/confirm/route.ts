import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDb();
    const bookingId = (await context.params).id;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({
        message: "Booking not found",
        success: false,
      });
    }

    booking.bookingStatus = "confirmed";
    booking.paymentStatus = "cash";
    await booking.save();
    return NextResponse.json({ message: "Booking confirmed", success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `Booking cash confirmation error ${error}`, success: false },
      { status: 500 },
    );
  }
}
