import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import PartnerDocs from "@/models/partnerDocs.model";
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

    if (user.partnerOnboardingSteps >= 2) {
      return new Response(
        JSON.stringify({ message: "Documents already uploaded" }),
        {
          status: 400,
        },
      );
    }

    const formdata = await req.formData();
    const cccd = formdata.get("cccd") as Blob | null;
    const license = formdata.get("license") as Blob | null;
    const rc = formdata.get("rc") as Blob | null;
    if (!cccd || !license || !rc) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        {
          status: 400,
        },
      );
    }

    const updatePayload: any = {
      status: "pending",
    };

    if (cccd) {
      const cccdUrl = await uploadOnCloudinary(cccd);
      if (!cccdUrl) {
        return new Response(
          JSON.stringify({ message: "Failed to upload cccd" }),
          {
            status: 500,
          },
        );
      }
      updatePayload.cccdUrl = cccdUrl;
    }

    if (license) {
      const licenseUrl = await uploadOnCloudinary(license);
      if (!licenseUrl) {
        return new Response(
          JSON.stringify({ message: "Failed to upload license" }),
          {
            status: 500,
          },
        );
      }
      updatePayload.licenseUrl = licenseUrl;
    }

    if (rc) {
      const rcUrl = await uploadOnCloudinary(rc);
      if (!rcUrl) {
        return new Response(
          JSON.stringify({ message: "Failed to upload rc" }),
          {
            status: 500,
          },
        );
      }
      updatePayload.rcUrl = rcUrl;
    }

    // const [cccdUrl, licenseUrl, rcUrl] = await Promise.all([
    //   uploadOnCloudinary(cccd),
    //   uploadOnCloudinary(license),
    //   uploadOnCloudinary(rc),
    // ]);

    // if (!cccdUrl || !licenseUrl || !rcUrl) {
    //   return new Response("Upload failed", { status: 500 });
    // }

    const partnerDocs = await PartnerDocs.findOneAndUpdate(
      { owner: user._id },
      {
        $set: updatePayload,
        $setOnInsert: { owner: user._id },
      },
      {
        upsert: true,
        new: true,
      },
    );

    if (user.partnerOnboardingSteps < 2) {
      user.partnerOnboardingSteps = 2;
      await user.save();
      return new Response(JSON.stringify(partnerDocs), { status: 200 });
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ message: `partner docs error ${error}` }),
      {
        status: 500,
      },
    );
  }
}
