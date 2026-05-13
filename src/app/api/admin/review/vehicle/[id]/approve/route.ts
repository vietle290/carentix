import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.email || session.user.role !== "admin") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    await connectDb();
    const { id: vehicleId } = await context.params;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return new Response(JSON.stringify({ message: "Vehicle not found" }), {
        status: 404,
      });
    }
    
    vehicle.status = "approved";
    vehicle.rejectionReason = undefined;
    await vehicle.save();

    const partner = await User.findById(vehicle.owner);
    if (!partner) {
      return new Response(JSON.stringify({ message: "Partner not found" }), {
        status: 404,
      });
    }
    partner.status = "approved";
    partner.partnerOnboardingSteps = 7;
    await partner.save();

    return Response.json(vehicle, { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: `Approve vehicle error ${error}` }), {
      status: 500,
    });
  }
}
