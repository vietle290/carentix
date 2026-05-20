"use client";
import { RootState } from "@/redux/store";
import axios from "axios";
// import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import {
  CheckCircle,
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

function Page() {
  const { userData } = useSelector((state: RootState) => state.user);
  const containerRef = useRef<HTMLDivElement>(null);
  const [joined, setJoined] = useState(false);
  const previewRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [reason, setReason] = useState("");
  const { roomId } = useParams();
  const [loading, setLoading] = useState(false);
  const [aLoading, setALoading] = useState(false);
  const [rLoading, setRLoading] = useState(false);

  const router = useRouter();

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  useEffect(() => {
    if (joined) {
      return;
    }
    let localStream: MediaStream;
    const getMedia = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(localStream);
        if (previewRef.current) {
          previewRef.current.srcObject = localStream;
        }
      } catch (error) {
        console.log(error);
      }
    };
    getMedia();
  }, [joined]);

  const toggleCamera = () => {
    if (!stream) {
      return;
    }
    stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
    setCameraOn(!cameraOn);
  };
  const toggleMic = () => {
    if (!stream) {
      return;
    }
    stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
    setMicOn(!micOn);
  };

  const handleApprove = async () => {
    if (!roomId) {
      return;
    }
    setALoading(true);
    try {
      const { data } = await axios.post("/api/admin/video-kyc/complete", {
        roomId,
        action: "approved",
      });
      console.log(data);
      setALoading(false);
      router.push("/");
    } catch (error: any) {
      console.log(error.response.data.message ?? error);
      setALoading(false);
    }
  };

  const handleReject = async () => {
    if (!roomId) {
      return;
    }
    setRLoading(true);
    try {
      const { data } = await axios.post("/api/admin/video-kyc/complete", {
        roomId,
        action: "rejected",
        reason,
      });
      console.log(data);
      setRLoading(false);
      router.push("/");
    } catch (error: any) {
      console.log(error.response.data.message ?? error);
      setRLoading(false);
    }
  };

  const startCall = async () => {
    if (!containerRef) {
      return null;
    }
    if (!userData?._id) {
      return null;
    }
    setLoading(true);
    const { ZegoUIKitPrebuilt } =
      await import("@zegocloud/zego-uikit-prebuilt");
    const displayName =
      userData?.role === "admin"
        ? "Admin"
        : `${userData?.name} ${userData?.email}`;
    try {
      const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverSecret!,
        roomId?.toString() || "test-room",
        userData?._id.toString() || "test-user",
        displayName,
      );

      const kit = ZegoUIKitPrebuilt.create(kitToken);
      kit.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showPreJoinView: false,
      });
      setJoined(true);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Image
            src={"/logo-v3.png"}
            alt="logo"
            width={44}
            height={44}
            priority
          />
          <p className="text-xs text-gray-400">
            {userData?.role === "admin"
              ? "Admin Verification"
              : "Partner Video KYC"}
          </p>
        </div>

        {joined && (
          <div className="flex flex-wrap gap-3">
            {userData?.role === "admin" && (
              <>
                <button
                  type="button"
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full text-sm flex items-center gap-2"
                  onClick={() => {
                    setApproveModalOpen(true) 
                  }}
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
                <button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm flex items-center gap-2"
                  onClick={() => {
                    setRejectModalOpen(true)
                  }}
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </>
            )}

            <button
              type="button"
              className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-full text-sm flex items-center gap-2"
              onClick={() => router.push("/")}
            >
              <PhoneOff size={16} />
              End Call
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 relative">
        <div
          ref={containerRef}
          className={`absolute inset-0 ${joined ? "block" : "hidden"}`}
        />
        {!joined && (
          <div className="h-full flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <video
                  ref={previewRef}
                  autoPlay
                  playsInline
                  className="w-full h-75 sm:h-100 object-cover"
                />
                {!cameraOn && (
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <VideoOff size={40} />
                  </div>
                )}
              </div>
              <div className="space-y-8 text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold">
                  Secure Video KYC
                </h1>
                <div className="flex justify-center lg:justify-start gap-6">
                  <button
                    type="button"
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${cameraOn ? "bg-white text-black" : "bg-white/10 border border-white/20"}`}
                    onClick={toggleCamera}
                  >
                    {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
                  </button>
                  <button
                    type="button"
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${micOn ? "bg-white text-black" : "bg-white/10 border border-white/20"}`}
                    onClick={toggleMic}
                  >
                    {micOn ? <Mic size={20} /> : <MicOff size={20} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={startCall}
                  className="w-full bg-white text-black py-4 rounded-xl font-semibold"
                  disabled={loading}
                >
                  {loading ? "Joining..." : "Join Secure Call"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {approveModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative bg-[#111] w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <button
                type="button"
                className="absolute top-4 right-4 text-gray-400"
                onClick={() => setApproveModalOpen(false)}
              >
                <X size={16} />
                {""}
              </button>

              <h2 className="text-lg font-semibold mb-4">Confirm Approval</h2>
              <div className="flex gap-4">
                <button
                  type="button"
                  className="flex-1 border rounded-xl py-2"
                  onClick={() => setApproveModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 bg-green-600 rounded-xl py-2"
                  disabled={aLoading}
                  onClick={handleApprove}
                >
                  {aLoading ? "Processing..." : "Approve"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

            <AnimatePresence>
        {rejectModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative bg-[#111] w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <button
                type="button"
                className="absolute top-4 right-4 text-gray-400"
                onClick={() => setRejectModalOpen(false)}
              >
                <X size={16} />
                {""}
              </button>

              <h2 className="text-lg font-semibold mb-4">Confirm Rejection</h2>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for rejection"
                className="w-full bg-white/10 border border-white/20 rounded-xl p-3 mb-4 text-sm"
              ></textarea>
              <div className="flex gap-4">
                <button
                  type="button"
                  className="flex-1 border rounded-xl py-2"
                  onClick={() => setRejectModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 bg-red-600 rounded-xl py-2"
                  disabled={rLoading}
                  onClick={handleReject}
                >
                  {rLoading ? "Processing..." : "Reject"}
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
