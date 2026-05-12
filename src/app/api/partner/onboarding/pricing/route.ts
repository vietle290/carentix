import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user?.email) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const partner = await User.findOne({ email: session.user.email });
    const vehicle = await Vehicle.findOne({ owner: partner._id });
    if (!partner) {
      return new Response(JSON.stringify({ message: "Partner not found" }), {
        status: 404,
      });
    }

    if (!vehicle) {
      return new Response(JSON.stringify({ message: "Vehicle not found" }), {
        status: 404,
      });
    }

    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const baseFare = formData.get("baseFare");
    const pricePerKM = formData.get("pricePerKM");
    const waitingCharge = formData.get("waitingCharge");

    let updated = false;
    if (image && image.size > 0) {
      const imageUrl = await uploadOnCloudinary(image);
      if (imageUrl) {
        vehicle.imageUrl = imageUrl;
        updated = true;
      }
    }

    if (baseFare !== null) {
      vehicle.baseFare = Number(baseFare);
      updated = true;
    }

    if (pricePerKM !== null) {
      vehicle.pricePerKM = Number(pricePerKM);
      updated = true;
    }

    if (waitingCharge !== null) {
      vehicle.waitingCharge = Number(waitingCharge);
      updated = true;
    }

    if (updated === false) {
      return new Response(JSON.stringify({ message: "No changes made" }), {
        status: 400,
      });
    }

    vehicle.status = "pending";
    vehicle.rejectionReason = undefined;
    await vehicle.save();
    partner.partnerOnboardingSteps = 6;
    await partner.save();

    return new Response(JSON.stringify({ message: "Pricing submitted" }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: `Pricing error ${error}` }), {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user?.email) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const partner = await User.findOne({ email: session.user.email });
    const vehicle = await Vehicle.findOne({ owner: partner._id });
    if (!partner) {
      return new Response(JSON.stringify({ message: "Partner not found" }), {
        status: 404,
      });
    }

    if (!vehicle) {
      return new Response(JSON.stringify({ message: "Vehicle not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(vehicle), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: `Get pricing error ${error}` }), {
      status: 500,
    });
  }
}
