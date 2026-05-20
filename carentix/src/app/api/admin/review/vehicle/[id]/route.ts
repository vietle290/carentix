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
    const vehicle = await Vehicle.findById(vehicleId).populate("owner");
    if (!vehicle) {
      return new Response(JSON.stringify({ message: "Vehicle not found" }), {
        status: 404,
      });
    }

    return Response.json(vehicle, { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: `Get vehicle error ${error}` }), {
      status: 500,
    });
  }
}
