import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user?.email || session.user.role !== "admin") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const partner = await User.find({
        role: "partner",
        partnerOnboardingSteps: 4,
        videoKycStatus: { $in: ["pending", "in_progress"] },
    })
    return new Response(JSON.stringify({ pendingVideoKycPartners: partner }), {
        status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: `Error fetching pending video KYC partners: ${error}`,
      }),
      {
        status: 500,
      },
    );
  }
}
