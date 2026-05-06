import { auth } from "@/auth";
import connectDb from "@/lib/db";
import PartnerBank from "@/models/partnerBank.model";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
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
    const { id: partnerId } = await context.params;
    const partner = await User.findById(partnerId);
    if (!partner || partner.role !== "partner") {
      return new Response(JSON.stringify({ message: "Partner not found" }), {
        status: 404,
      });
    }
    if (partner.partnerStatus === "approved") {
      return new Response(
        JSON.stringify({ message: "Partner already approved" }),
        {
          status: 400,
        },
      );
    }
    const partnerDocs = await PartnerDocs.findOne({ owner: partnerId });
    const partnerBank = await PartnerBank.findOne({ owner: partnerId });

    if (!partnerDocs || !partnerBank) {
      return new Response(JSON.stringify({ message: "Partner did not complete onboarding" }), {
        status: 400,
      });
    }

    partner.partnerStatus = "approved";
    partner.partnerOnboardingSteps = 4;
    await partner.save();
    partnerDocs.status = "approved";
    await partnerDocs.save();
    partnerBank.status = "verified";
    await partnerBank.save();
    return Response.json(
      { message: "Partner approved successfully" },
      { status: 200 },
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: `Partner approved error: ${error}` }), {
      status: 500,
    });
  }
}
