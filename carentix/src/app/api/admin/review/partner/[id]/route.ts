import { auth } from "@/auth";
import connectDb from "@/lib/db";
import PartnerBank from "@/models/partnerBank.model";
import PartnerDocs from "@/models/partnerDocs.model";
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
    const { id: partnerId } = await context.params;
    const partner = await User.findById(partnerId);
    if (!partner || partner.role !== "partner") {
      return new Response(JSON.stringify({ message: "Partner not found" }), {
        status: 404,
      });
    }
    // const vehicle = await Vehicle.findOne({ owner: partnerId});
    // const documents = await PartnerDocs.findOne({ owner: partnerId });
    // const bank = await PartnerBank.findOne({ owner: partnerId });

    const [vehicle, documents, bank] = await Promise.all([
      Vehicle.findOne({ owner: partnerId }),
      PartnerDocs.findOne({ owner: partnerId }),
      PartnerBank.findOne({ owner: partnerId }),
    ]);
    return Response.json(
      {
        partner,
        vehicle: vehicle || null,
        documents: documents || null,
        bank: bank || null,
      },
      { status: 200 },
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
