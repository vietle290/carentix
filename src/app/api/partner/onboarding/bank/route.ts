import { auth } from "@/auth";
import connectDb from "@/lib/db";
import PartnerBank from "@/models/partnerBank.model";
import User from "@/models/user.model";
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

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    const { accountHolder, accountNumber, swiftCode, vietQR, mobileNumber } =
      await req.json();
    if (!accountHolder || !accountNumber || !swiftCode || !mobileNumber) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        {
          status: 400,
        },
      );
    }
    const partnerBank = await PartnerBank.findOneAndUpdate(
      { owner: user._id },
      { accountHolder, accountNumber, swiftCode, vietQR, status: "added" },
      { upsert: true, new: true },
    );
    user.mobileNumber = mobileNumber;
    if (user.partnerOnboardingSteps < 3) {
      user.partnerOnboardingSteps = 3;
    }
    await user.save();

    return new Response(JSON.stringify(partnerBank), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: `Add bank error ${error}` }),
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

    const partnerBank = await PartnerBank.findOne({ owner: user._id });
    if (partnerBank) {
      return new Response(JSON.stringify(partnerBank), { status: 200 });
    } else {
      return null;
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ message: `Get bank error ${error}` }),
      {
        status: 500,
      },
    );
  }
}
