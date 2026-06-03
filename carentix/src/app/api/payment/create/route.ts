import { auth } from "@/auth";
import connectDb from "@/lib/db";
import payos from "@/lib/payos";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

import {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
  HashAlgorithm,
} from "vnpay";

function generatePayID() {
  const now = new Date();
  const timestamp = now.getTime();
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const milliseconds = now.getMilliseconds().toString().padStart(3, "0");
  return `PAY${timestamp}${seconds}${milliseconds}`;
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    const { bookingId, payosPayload } = await req.json();
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    // const payosOrder = await payos.paymentRequests.create({
    //   orderCode: Date.now(),
    //   amount: booking.fare,
    //   description: `${payosPayload.description}`,
    //   returnUrl: "http://localhost:3000/payment/success",
    //   cancelUrl: "http://localhost:3000/payment/cancel",
    // });

    const vnpay = new VNPay({
      tmnCode: process.env.VNPAY_TMN_CODE!,
      secureSecret: process.env.VNPAY_HASH_SECRET!,
      vnpayHost: process.env.VNPAY_URL,
      testMode: true, // optional
      hashAlgorithm: HashAlgorithm.SHA512, // opitonal`
      loggerFn: ignoreLogger, // optional
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const vnpayResponse = vnpay.buildPaymentUrl({
      vnp_Amount: Number(booking.fare),
      vnp_IpAddr: "127.0.0.1", //
      vnp_TxnRef: bookingId,
      vnp_OrderInfo: `${payosPayload.description} ${bookingId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL!,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    

    booking.bookingStatus = "awaiting_payment";
    await booking.save();

    return NextResponse.json(
      { vnpayResponse, amount: booking.fare },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("VNPAY ERROR:");
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
