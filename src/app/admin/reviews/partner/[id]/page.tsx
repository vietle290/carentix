"use client";

import AnimatedCard from "@/components/AnimatedCard";
import DocReview from "@/components/DocReview";
import { IPartnerBank } from "@/models/partnerBank.model";
import { IPartnerDocs } from "@/models/partnerDocs.model";
import { IUser } from "@/models/user.model";
import { IVehicle } from "@/models/vehicle.model";
import axios from "axios";
import {
  AlertTriangle,
  ArrowLeft,
  Car,
  CheckCircle,
  CircleDashed,
  Clock,
  FileText,
  Landmark,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

function Page() {
  const router = useRouter();
  const { id } = useParams();
  const [data, setData] = useState<IUser | null>(null);
  const [vehicleDetails, setVehicleDetails] = useState<IVehicle | null>(null);
  const [partnerDocs, setPartnerDocs] = useState<IPartnerDocs | null>(null);
  const [bankDetails, setBankDetails] = useState<IPartnerBank | null>(null);
  const [showApprove, setShowApprove] = useState(false);
  const [showreject, setShowreject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [rejectedLoading, setRejectedLoading] = useState(false);
  useEffect(() => {
    const handleGetPartner = async () => {
      try {
        const { data } = await axios.get(`/api/admin/review/partner/${id}`);
        setData(data.partner);
        setVehicleDetails(data.vehicle);
        setPartnerDocs(data.documents);
        setBankDetails(data.bank);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    handleGetPartner();
  }, [id]);

  const handleApprove = async () => {
    setApprovedLoading(true);
    try {
      const { data } = await axios.get(`/api/admin/review/partner/${id}/approve`);
      setApprovedLoading(false);
      router.push("/");
    } catch (error) {
      console.log(error);
      setApprovedLoading(false);
    }
  };

    const handleReject = async () => {
      setRejectedLoading(true);
      try {
        const { data } = await axios.post(`/api/admin/review/partner/${id}/reject`, {
          rejectionReason: rejectReason,
        });
        setRejectedLoading(false);
        router.push("/");
      } catch (error) {
        console.log(error);
        setRejectedLoading(false);
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-500">
        Loading Partner...
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            type="button"
            className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
            {""}
          </button>
          <div className="flex-1">
            <div className="font-semibold text-lg">{data?.name}</div>
            <div className="text-xs text-gray-500">{data?.email}</div>
          </div>
          {data?.partnerStatus === "approved" ? (
            <div className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-green-100 text-green-700">
              <CheckCircle size={18} />
              Approved
            </div>
          ) : data?.partnerStatus === "rejected" ? (
            <div className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-red-100 text-red-700">
              <XCircle size={18} />
              Rejected
            </div>
          ) : (
            <div className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-yellow-100 text-yellow-700">
              <Clock size={18} />
              Pending
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <AnimatedCard title="Vehicle Details" icon={<Car size={18} />}>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Vehicle Type</span>
              <span className="font-semibold">
                {vehicleDetails?.type || "-"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Registration Number</span>
              <span className="font-semibold">
                {vehicleDetails?.number || "-"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Model</span>
              <span className="font-semibold">
                {vehicleDetails?.vehicleModel || "-"}
              </span>
            </div>
          </AnimatedCard>

          <AnimatedCard title="Documents" icon={<FileText size={18} />}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <DocReview label={"CCCD"} url={partnerDocs?.cccdUrl || "-"} />
              <DocReview
                label={"Registration Certificate"}
                url={partnerDocs?.rcUrl || "-"}
              />
              <DocReview
                label={"Driving License"}
                url={partnerDocs?.licenseUrl || "-"}
              />
            </div>
          </AnimatedCard>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <AnimatedCard title={"Bank Details"} icon={<Landmark size={18} />}>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Account Holder</span>
              <span className="font-semibold">
                {bankDetails?.accountHolder || "-"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Account Number</span>
              <span className="font-semibold">
                {bankDetails?.accountNumber || "-"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">SWIFT Code</span>
              <span className="font-semibold">
                {bankDetails?.swiftCode || "-"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">VietQR Code</span>
              <span className="font-semibold">
                {bankDetails?.vietQR || "-"}
              </span>
            </div>
          </AnimatedCard>

          {data?.partnerStatus === "pending" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-4xl p-8 shadow-xl space-y-6"
            >
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck size={18} />
                Admin Check
              </div>
              <p className="text-sm text-gray-500">
                Verify documents carefully before approving.
              </p>

              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  className="py-3 rounded-2xl bg-linear-to-r from-black to-gray-800 text-white font-semibold hover:opacity-90 transition"
                  onClick={() => setShowApprove(true)}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="py-3 rounded-2xl border font-semibold hover:bg-gray-100 transition"
                  onClick={() => setShowreject(true)}
                >
                  Reject
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showApprove && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-around px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm"
            >
              <h2 className="text-lg font-bold">Approve Partner</h2>
              <p className="text-sm text-gray-500 mt-2">
                Confirm all information has been verified
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  className="flex-1 py-2 rounded-xl border"
                  onClick={() => setShowApprove(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 flex py-2 rounded-xl bg-black text-white items-center justify-center"
                  onClick={handleApprove}
                  disabled={approvedLoading}
                >
                  {approvedLoading ? <CircleDashed className="text-white animate-spin" /> : "Approve"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showreject && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-around px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm"
            >
              <h2 className="text-lg font-bold">Reject Partner</h2>
              <p className="text-sm text-gray-500 mt-2">
                <textarea
                  name="reason"
                  id="reason"
                  placeholder="Enter reason for rejection..."
                  className="border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  className="flex-1 py-2 rounded-xl border"
                  onClick={() => setShowreject(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 flex py-2 rounded-xl bg-red-500 text-white items-center justify-center"
                  onClick={handleReject}
                  disabled={rejectedLoading}
                >
                  {rejectedLoading ? <CircleDashed className="text-white animate-spin" /> : "Reject"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Page;
