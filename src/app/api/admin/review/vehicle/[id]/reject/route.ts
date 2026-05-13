import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

export async function POST(
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

    const {reason} = await req.json();

    await connectDb();
    const { id: vehicleId } = await context.params;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return new Response(JSON.stringify({ message: "Vehicle not found" }), {
        status: 404,
      });
    }
    
    vehicle.status = "rejected";
    vehicle.rejectionReason = reason;
    await vehicle.save();


    return Response.json(vehicle, { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: `Reject vehicle error ${error}` }), {
      status: 500,
    });
  }
}
