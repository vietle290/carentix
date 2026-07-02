import { auth } from "@/auth";
import AdminDashboard from "@/components/AdminDashboard";
import Footer from "@/components/Footer";
import GeoUpdater from "@/components/GeoUpdater";
import Nav from "@/components/Nav";
import PartnerDashboard from "@/components/PartnerDashboard";
import PublicHome from "@/components/PublicHome";
import connectDb from "@/lib/db";
import User from "@/models/user.model";

export default async function Home() {
  const session = await auth();
  await connectDb();
  const user = await User.findOne({ email: session?.user?.email });
  const plainUser = JSON.parse(JSON.stringify(user));

  const aboutUsIdScroll = "about-us";
  const contactUsIdScroll = "contact-us";
  const homeIdScroll = "home";

  return (
    <div className="w-full min-h-screen bg-white">
      {/* <GeoUpdater userId={user?._id.toString()} /> */}
      {plainUser?.role == "partner" ? (
        <>
          <Nav />
          <PartnerDashboard />
        </>
      ) : plainUser?.role == "admin" ? (
        <AdminDashboard />
      ) : (
        <>
          <Nav aboutUsIdScroll={aboutUsIdScroll} contactUsIdScroll={contactUsIdScroll} homeIdScroll={homeIdScroll}/>
          <PublicHome aboutUsIdScroll={aboutUsIdScroll} homeIdScroll={homeIdScroll}/>
        </>
      )}
      <Footer contactUsIdScroll={session?.user?.role === "user" ? contactUsIdScroll : ""}/>
    </div>
  );
}
