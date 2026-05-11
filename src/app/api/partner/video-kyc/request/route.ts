import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user?.email) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const partner = await User.findOne({ email: session.user.email });
    if (!partner) {
      return new Response(JSON.stringify({ message: "Partner not found" }), {
        status: 404,
      });
    }

    if (partner.videoKycStatus !== "rejected") {
       return new Response(
         JSON.stringify({ message: "You can not request video kyc" }),
         {
           status: 400,
         },
       ) 
    }

    partner.videoKycStatus = "pending";
    partner.videoKycRejectReason = undefined;
    partner.videoKycRoomId = undefined;

    await partner.save();

    return new Response(JSON.stringify({success: true}), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: `Request video kyc error ${error}` }),
      {
        status: 500,
      },
    );
  }
}
