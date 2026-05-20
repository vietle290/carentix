import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user?.email || session.user.role !== "admin") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const {roomId, action, reason} = await req.json();
    if (!roomId) {
        return new Response(JSON.stringify({ message: "Room ID is required" }), {
            status: 400,
        });
    }

    if (!["approved", "rejected"].includes(action)) {
        return new Response(JSON.stringify({ message: "Invalid action" }), {
            status: 400,
        });
    }

    const partner = await User.findOne({ videoKycRoomId: roomId, role: "partner" });
    if (!partner) {
        return new Response(JSON.stringify({ message: "Partner not found" }), {
            status: 404,
        });
    }

    if (action === "approved") {
        partner.videoKycStatus = "approved";
        partner.videoKycRejectionReason = undefined;
        partner.partnerOnboardingSteps = 5;
    }

    if (action === "rejected") {
        if (!reason) {
            return new Response(JSON.stringify({ message: "Rejection reason is required" }), {
                status: 400,
            });
        }
        partner.videoKycStatus = "rejected";
        partner.videoKycRejectionReason = reason.trim();
    }

    await partner.save();

    return new Response(JSON.stringify({ status: partner.videoKycStatus }), {
        status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: `Error completing video KYC: ${error}` }), {
      status: 500,
    });
  }
}
