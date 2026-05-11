import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

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
    const { id: partnerId } = await context.params;
    const partner = await User.findById(partnerId);
    if (!partner || partner.role !== "partner") {
      return new Response(JSON.stringify({ message: "Partner not found" }), {
        status: 404,
      });
    }

    const roomId = `video-kyc-${partnerId}-${Date.now()}`;
    partner.videoKycRoomId = roomId;
    partner.videoKycStatus = "in_progress";
    partner.partnerOnboardingSteps = 4;
    await partner.save();
    return NextResponse.json(
      { message: "Video KYC started successfully", roomId },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: `Error starting video KYC: ${error}` },
      { status: 500 },
    );
  }
}
