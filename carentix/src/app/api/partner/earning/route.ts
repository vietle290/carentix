import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    const driver = await User.findOne({ email: session?.user?.email });
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const bookings = await Booking.find({
      driver: driver._id,
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
