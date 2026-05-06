import { auth } from "@/auth";
import connectDb from "@/lib/db";
import PartnerBank from "@/models/partnerBank.model";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
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
    await connectDb();
    const { rejectionReason } = await req.json();
    const { id: partnerId } = await context.params;
    const partner = await User.findById(partnerId);
    if (!partner || partner.role !== "partner") {
      return new Response(JSON.stringify({ message: "Partner not found" }), {
        status: 404,
      });
    }

    partner.partnerStatus = "rejected";
    partner.rejectionReason = rejectionReason;
    await partner.save();

    return Response.json(
      { message: "Partner rejected successfully" },
      { status: 200 },
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: `Partner rejected error: ${error}` }), {
      status: 500,
    });
  }
}
