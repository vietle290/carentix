import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user?.email || session.user.role !== "admin") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const totalPartners = await User.countDocuments({ role: "partner" });
    const totalApprovedPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "approved",
    });
    const totalPendingPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "pending",
    });
    const totalRejectedPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "rejected",
    });
    // const totalUsers = await User.countDocuments({ role: "user" });

    const pendingPartnerUsers = await User.find({
      role: "partner",
      partnerStatus: "pending",
      partnerOnboardingSteps: 3,
    });

    const partnerIds = pendingPartnerUsers.map((partner) => partner._id);
    const partnerVehicles = await User.find({ owner: { $in: partnerIds } });
    const vehicleTypeMap = new Map(
      partnerVehicles.map((vehicle) => [String(vehicle.owner), vehicle.type]),
    );
    const pendingPartnersReview = pendingPartnerUsers.map((partner) => ({
      _id: partner._id,
      name: partner.name,
      email: partner.email,
      mobileNumber: partner.mobileNumber,
      vehicleType: vehicleTypeMap.get(String(partner._id)),
    }));

    return NextResponse.json(
      {
        stats: {
          totalPartners,
          totalApprovedPartners,
          totalPendingPartners,
          totalRejectedPartners,
          //   totalUsers,
        },
        pendingPartnersReview,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: `admin Dashboard error: ${error}` },
      { status: 500 },
    );
  }
}
