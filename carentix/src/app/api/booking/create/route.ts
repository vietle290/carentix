import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      driverId,
      vehicleId,
      pickUpAddress,
      dropAddress,
      pickUpLocation,
      dropLocation,
      fare,
      mobileNumber,
    } = await req.json();

    if (
      !driverId ||
      !vehicleId ||
      !pickUpLocation.coordinates ||
      !dropLocation.coordinates
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const driver = await User.findById(driverId);
    if (!driver) {
      return NextResponse.json(
        { message: "Driver not found" },
        { status: 404 },
      );
    }

    const existing = await Booking.findOne({
      user: session.user.id,
      status: {
        $in: ["requested", "awaiting_payment", "confirmed", "started"],
      }
    });

    if (existing) {
      return NextResponse.json(
        existing
      );
    }

    const booking = await Booking.create({
      user: session.user.id,
      driver: driverId,
      vehicle: vehicleId,
      pickUpAddress,
      dropAddress,
      pickUpLocation,
      dropLocation,
      fare,
      userMobileNumber: mobileNumber,
      driverMobileNumber: driver.mobileNumber,
      bookingStatus: "requested",
    });

    return NextResponse.json(booking, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `create booking failed ${error}`  }, { status: 500 });
  }
}
