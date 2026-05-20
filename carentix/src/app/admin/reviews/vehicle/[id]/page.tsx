"use client";

import { IUser } from "@/models/user.model";
import { vehicleType } from "@/models/vehicle.model";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle,
  CircleDashed,
  Clock,
  ImageIcon,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import AnimatedCard from "@/components/AnimatedCard";
import { BiMoney } from "react-icons/bi";

interface IVehicle {
  owner: IUser;
  type: vehicleType;
  vehicleModel: string;
  number: string;
  imageUrl?: string;
  baseFare?: number;
  pricePerKM?: number;
  waitingCharge?: number;
  status: "approved" | "pending" | "rejected";
  rejectionReason?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function Page() {
  const { id } = useParams();
  const [data, setData] = useState<IVehicle>();
  const router = useRouter();
  const [showApprove, setShowApprove] = useState(false);
  const [showreject, setShowreject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [rejectedLoading, setRejectedLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`/api/admin/review/vehicle/${id}`);
        setData(res.data);
        setLoading(false);
      } catch (error: any) {
        console.log(error.response.data.message ?? error);
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleApprove = async () => {
    setApprovedLoading(true);
    try {
      const { data } = await axios.get(
        `/api/admin/review/vehicle/${id}/approve`,
      );
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
      const { data } = await axios.post(
        `/api/admin/review/vehicle/${id}/reject`,
        {
          reason: rejectReason,
        },
      );
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
        Loading Vehicle...
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="font-semibold text-lg">{data?.owner.name}</div>
            <div className="text-xs text-gray-500">{data?.owner.email}</div>
          </div>
          {data?.status === "approved" ? (
            <div className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-green-100 text-green-700">
              <CheckCircle size={18} />
              Approved
            </div>
          ) : data?.status === "rejected" ? (
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

      <main className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl overflow-hidden shadow-xl bg-white"
        >
          {data?.imageUrl ? (
            <img
              src={data.imageUrl}
              alt="Vehicle"
              className="w-full h-112.5 object-cover cursor-pointer"
              onClick={() => window.open(data.imageUrl, "_blank")}
            />
          ) : (
            <div className="h-112.5 grid place-items-center text-gray-300">
              <ImageIcon size={25} />
            </div>
          )}
        </motion.div>

        <div className="space-y-8">
          <AnimatedCard title={"Vehicle Details"} icon={<Truck size={18} />}>
            <div className="grid grid-cols-2 gap-y-4">
              <div className="text-gray-500">Vehicle Type</div>
              <div className="font-semibold justify-self-end">
                {data?.type || "-"}
              </div>

              <div className="text-gray-500">Vehicle Model</div>
              <div className="font-semibold justify-self-end">
                {data?.vehicleModel || "-"}
              </div>

              <div className="text-gray-500">Vehicle Number</div>
              <div className="font-semibold justify-self-end">
                {data?.number || "-"}
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard
            title={"Pricing Configuration"}
            icon={<BiMoney size={18} />}
          >
            <div className="grid grid-cols-2 gap-y-4">
              <div className="text-gray-500">Base Fare</div>
              <div className="font-semibold justify-self-end">
                {data?.baseFare || 0} <span className="underline">đ</span>
              </div>

              <div className="text-gray-500">Price Per KM</div>
              <div className="font-semibold justify-self-end">
                {data?.pricePerKM || 0} <span className="underline">đ</span>
              </div>

              <div className="text-gray-500">Waiting Charge</div>
              <div className="font-semibold justify-self-end">
                {data?.waitingCharge || 0} <span className="underline">đ</span>
              </div>
            </div>
          </AnimatedCard>
          {data?.status === "pending" && (
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
              <h2 className="text-lg font-bold">Approve Vehicle</h2>
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
                  {approvedLoading ? (
                    <CircleDashed className="text-white animate-spin" />
                  ) : (
                    "Approve"
                  )}
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
              <h2 className="text-lg font-bold">Reject Vehicle</h2>
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
                  {rejectedLoading ? (
                    <CircleDashed className="text-white animate-spin" />
                  ) : (
                    "Reject"
                  )}
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
