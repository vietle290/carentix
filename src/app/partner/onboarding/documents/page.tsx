"use client";
import axios from "axios";
import { ArrowLeft, CircleDashed, FileCheck, UploadCloud } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type docsType = "cccd" | "license" | "rc";
function Page() {
  const router = useRouter();
  const [docs, setDocs] = useState<Record<docsType, File | null>>({
    cccd: null,
    license: null,
    rc: null,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDocs = async () => {
    setLoading(true);
    setError("");
    try {
      const formdata = new FormData();
      if (!docs.cccd || !docs.license || !docs.rc) {
        setError("Missing required fields");
        setLoading(false);
        return null;
      }
      formdata.append("cccd", docs.cccd);
      formdata.append("license", docs.license);
      formdata.append("rc", docs.rc);
      const { data } = await axios.post(
        "/api/partner/onboarding/documents",
        formdata,
      );
      console.log(data);
      setLoading(false);
      router.push("/partner/onboarding/bank");
    } catch (error: any) {
      setError(error?.response?.data?.message ?? "Something went wrong");
      setLoading(false);
    }
  };

  const handleImage = (doc: docsType, file: File | null) => {
    if (!file) return;
    setDocs((prev) => ({ ...prev, [doc]: file }));
  };
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0, 0, 0, 0.15)] p-6 sm:p-8"
      >
        <div className="relative text-center">
          <button
            type="button"
            className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
            {""}
          </button>
          <p className="text-xs text-gray-500 font-medium">step 2 of 3</p>
          <h1 className="text-2xl font-bold mt-1">Upload Documents</h1>
          <p className="text-sm text-gray-500 mt-2">
            Required for verification
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <motion.label
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black transition"
          >
            <div>
              <p className="text-sm font-semibold">CCCD / ID Proof</p>
              <p className="text-xs text-gray-500">Goverment issued ID</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Upload</span>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-200 hover:text-black transition"
              >
                <UploadCloud size={18} />
              </motion.div>
            </div>

            <input
              type="file"
              hidden
              accept="image/*,.pdf"
              onChange={(e) =>
                handleImage("cccd", e.target?.files?.[0] || null)
              }
            />
          </motion.label>
          <motion.label
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black transition"
          >
            <div>
              <p className="text-sm font-semibold">Driving License</p>
              <p className="text-xs text-gray-500">Valid driving license</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Upload</span>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-200 hover:text-black transition"
              >
                <UploadCloud size={18} />
              </motion.div>
            </div>
            <input
              type="file"
              hidden
              accept="image/*,.pdf"
              onChange={(e) =>
                handleImage("license", e.target?.files?.[0] || null)
              }
            />
          </motion.label>
          <motion.label
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black transition"
          >
            <div>
              <p className="text-sm font-semibold">Vehicle RC</p>
              <p className="text-xs text-gray-500">Registration Certificate</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Upload</span>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-200 hover:text-black transition"
              >
                <UploadCloud size={18} />
              </motion.div>
            </div>
            <input
              type="file"
              hidden
              accept="image/*,.pdf"
              onChange={(e) => handleImage("rc", e.target?.files?.[0] || null)}
            />
          </motion.label>
        </div>
        <div className="mt-6 flex items-start gap-3 text-xs text-gray-500">
          <FileCheck size={16} />{" "}
          <p>
            Documents uploaded are secured stored and manually verified by our
            team
          </p>
        </div>
        {error && <p className="text-red-500 mt-4">*{error}</p>}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className="mt-6 w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition"
          onClick={handleDocs}
        >
          {loading ? (
            <CircleDashed className="animate-spin text-white" size={20} />
          ) : (
            "Continue"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Page;
