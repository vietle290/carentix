import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

const VEHICLE_REGEX = /^[1-9]\d{1}[A-Z]{1,2}\s?\d{3}\.?\d{2}$/;
export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user?.email) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    const { type, number, vehicleModel } = await req.json();
    if (!type || !number || !vehicleModel) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 },
      );
    }

    if (!VEHICLE_REGEX.test(number)) {
      return new Response(
        JSON.stringify({ message: "Invalid vehicle number" }),
        { status: 400 },
      );
    }
    const vehicleNumber = number.toUpperCase();

    let vehicle = await Vehicle.findOne({ owner: user._id });
    if (vehicle) {
      vehicle.type = type;
      vehicle.number = vehicleNumber;
      vehicle.vehicleModel = vehicleModel;
      vehicle.status = "pending";
      await vehicle.save();
      if (user.partnerOnboardingSteps < 2) {
        user.partnerOnboardingSteps = 2;
        user.partnerStatus = "pending";
        await user.save();
      } else {
        user.partnerOnboardingSteps = 3; // Keep the current step if it's already greater than 2
        user.partnerStatus = "pending";
        await user.save();
      }
      return new Response(
        JSON.stringify({ message: "Vehicle updated successfully" }),
        { status: 200 },
      );
    }
    const duplicate = await Vehicle.findOne({ number: vehicleNumber });
    if (duplicate) {
      return new Response(
        JSON.stringify({ message: "Vehicle number already exists" }),
        { status: 400 },
      );
    }
    vehicle = await Vehicle.create({
      owner: user._id,
      type,
      number: vehicleNumber,
      vehicleModel,
      status: "pending",
    });

    if (user.partnerOnboardingSteps < 1) {
      user.partnerOnboardingSteps = 1;
    }
    user.role = "partner";
    user.partnerStatus = "pending";
    await user.save();
    return new Response(JSON.stringify(vehicle), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: `Add vehicle error ${error}` }),
      {
        status: 500,
      },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user?.email) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    const vehicle = await Vehicle.findOne({ owner: user._id });
    if (vehicle) {
      return new Response(JSON.stringify(vehicle), { status: 200 });
    } else {
      return null;
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ message: `Get vehicle error ${error}` }),
      {
        status: 500,
      },
    );
  }
}
