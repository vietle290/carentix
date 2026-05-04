"use client";

import axios from "axios";
import {
  CheckCircle2,
  Clock,
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

type Stats = {
  totalApprovedPartners: number;
  totalPartners: number;
  totalPendingPartners: number;
  totalRejectedPartners: number;
};

type Tab = "partner" | "kyc" | "vehicle";
function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("partner");
  const [partnerReview, setPartnerReview] = useState<any>();
  const [pendingKyc, setPendingKyc] = useState<any>();
  const [vehicleReviews, setVehicleReviews] = useState<any>();

  useEffect(() => {
    const handleGetData = async () => {
      try {
        const { data } = await axios.get("/api/admin/dashboard");
        setStats(data.stats);
        setPartnerReview(data.pendingPartnersReview);
      } catch (error) {
        console.log(error);
      }
    };
    handleGetData();
  }, []);
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b z-40">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={"/logo.png"}
              alt="Logo"
              width={100}
              height={100}
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </div>

          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-black text-white">
            <User size={14} />
            Admin Dashboard
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        <div className="grid grid-cols-12 sm:grid-cols-4 gap-6">
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
              {activeTab === "partner" && <ContentList data={partnerReview ?? []} type={"partner"}/>}
              {activeTab === "kyc" && <ContentList data={pendingKyc ?? []} type={"kyc"}/>}
              {activeTab === "vehicle" && <ContentList data={vehicleReviews ?? []} type={"vehicle"}/>}
            </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default AdminDashboard;
