"use client";

import axios from "axios";
import {
  CheckCircle2,
  Clock,
  LogOut,
  Settings,
  Truck,
  User,
  Users,
  Video,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Kpi from "./Kpi";
import TabButton from "./TabButton";
import { AnimatePresence, motion } from "motion/react";
import ContentList from "./ContentList";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getSocket } from "@/lib/socket";
import { signOut } from "next-auth/react";
import AdminEarning from "./AdminEarning";

type Stats = {
  totalApprovedPartners: number;
  totalPartners: number;
  totalPendingPartners: number;
  totalRejectedPartners: number;
};

type Tab = "partner" | "kyc" | "vehicle";
function AdminDashboard() {
  const { userData } = useSelector((state: RootState) => state.user);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("partner");
  const [partnerReview, setPartnerReview] = useState<any>();
  const [pendingKyc, setPendingKyc] = useState<any>();
  const [vehicleReviews, setVehicleReviews] = useState<any>();
  const [profileOpen, setProfileOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogOut = async () => {
    const socket = getSocket();
    if (socket.connected) {
      socket.disconnect();
    }
    await signOut({ redirect: false });

    setProfileOpen(false);
    dispatch({ type: "user/setUserData", payload: null });
    window.location.href = "/";
  };

  useEffect(() => {
    const handleGetData = async () => {
      try {
        const { data } = await axios.get("/api/admin/dashboard");
        setStats(data.stats);
        setPartnerReview(data.pendingPartnersReview);
        setVehicleReviews(data.pendingVehicles);
      } catch (error) {
        console.log(error);
      }
    };
    const handleGetPendingKyc = async () => {
      try {
        const { data } = await axios.get("/api/admin/video-kyc/pending");
        setPendingKyc(data.pendingVideoKycPartners);
      } catch (error) {
        console.log(error);
      }
    };
    handleGetData();
    handleGetPendingKyc();
  }, []);
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b z-40">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={"/logo-v3.png"}
              alt="Logo"
              width={100}
              height={100}
              style={{
                width: "auto",
                height: "auto",
                backgroundColor: "black",
              }}
              priority
            />
          </div>

          <div
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-black text-white"
            onClick={() => setProfileOpen((prev) => !prev)}
          >
            <User size={14} />
            Admin Dashboard
          </div>
        </div>
      </div>

      <AnimatePresence>
        {profileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-0 w-75 bg-white text-black rounded-2xl shadow-xl border z-50"
          >
            <div className="p-5 ">
              <p className="font-semibold text-lg">{userData?.name}</p>
              <p className="text-xs uppercase text-gray-500 mb-4">
                {userData?.role}
              </p>
              <button
                type="button"
                className="w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl mt-2"
                onClick={handleLogOut}
              >
                <LogOut size={16} className="ml-1" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          <Kpi
            label="Total Partner"
            value={stats?.totalPartners ?? 0}
            icon={<Users />}
            variant={"totalPartners"}
          />
          <Kpi
            label="Approved Partner"
            value={stats?.totalApprovedPartners ?? 0}
            icon={<CheckCircle2 />}
            variant={"approved"}
          />

          <Kpi
            label="Pending Partner"
            value={stats?.totalPendingPartners ?? 0}
            icon={<Clock />}
            variant={"pending"}
          />

          <Kpi
            label="Rejected Partner"
            value={stats?.totalRejectedPartners ?? 0}
            icon={<XCircle />}
            variant={"rejected"}
          />
        </div>
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 flex flex-wrap gap-2">
          <TabButton
            active={activeTab === "partner"}
            count={partnerReview?.length ?? 0}
            icon={<User size={15} />}
            onClick={() => setActiveTab("partner")}
          >
            Pending Partner Review
          </TabButton>
          <TabButton
            active={activeTab === "kyc"}
            count={pendingKyc?.length ?? 0}
            icon={<Video size={15} />}
            onClick={() => setActiveTab("kyc")}
          >
            Pending Video KYC
          </TabButton>
          <TabButton
            active={activeTab === "vehicle"}
            count={vehicleReviews?.length ?? 0}
            icon={<Truck size={15} />}
            onClick={() => setActiveTab("vehicle")}
          >
            Pending Vehicle Reviews
          </TabButton>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-3"
          >
            {activeTab === "partner" && (
              <ContentList data={partnerReview ?? []} type={"partner"} />
            )}
            {activeTab === "kyc" && (
              <ContentList data={pendingKyc ?? []} type={"kyc"} />
            )}
            {activeTab === "vehicle" && (
              <ContentList data={vehicleReviews ?? []} type={"vehicle"} />
            )}
          </motion.div>
        </AnimatePresence>
        <AdminEarning />
      </main>
    </div>
  );
}

export default AdminDashboard;
