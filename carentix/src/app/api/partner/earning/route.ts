import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const bookings = await Booking.find({
      paymentStatus: "paid",
      createdAt: { $gte: sevenDaysAgo },
    }).select("partnerAmount createdAt");

    const earningMap: Record<string, number> = {};

    bookings.forEach((booking) => {
      const date = new Date(booking.createdAt).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      });
      if (!earningMap[date]) {
        earningMap[date] = 0;
      }
      earningMap[date] += booking.partnerAmount || 0;
    });
    const earning = Object.entries(earningMap).map(([date, earnings]) => ({
      date,
      earnings,
    }));
    return NextResponse.json({ earning }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json(
      { message: `Get partner earnings error ${error}` },
      { status: 500 },
    );
  }
}
