import connectDb from "@/lib/db";
import payos from "@/lib/payos";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat} from "vnpay"

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { bookingId, payosPayload } = await req.json();
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    const payosOrder = await payos.paymentRequests.create({
      orderCode: Date.now(), // unique order code
      amount: booking.fare, // vnd amount
      description: `${payosPayload.description}`,
      returnUrl: "http://localhost:3000/payment/success",
      cancelUrl: "http://localhost:3000/payment/cancel",
    });

    booking.bookingStatus = "awaiting_payment";
    await booking.save();

    return NextResponse.json(
      { payosOrder, orderId: payosOrder.paymentLinkId},
      { status: 200 },
    );
  } catch (error: any) {
    console.error("PAYOS ERROR:");
    console.error(error);
    console.error(error?.message);

    return NextResponse.json(
      {
        message: error?.message,
        error,
      },
      { status: 500 },
    );
  }
}
