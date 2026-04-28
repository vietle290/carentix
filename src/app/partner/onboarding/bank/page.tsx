"use client";
import axios from "axios";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle,
  CircleDashed,
  CreditCard,
  Landmark,
  Phone,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SWIFT_REGEX = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
function Page() {
  const router = useRouter();
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [vietQR, setVietQR] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sanitizedSwiftCode = swiftCode.trim().toUpperCase();

  const isNameValid = accountHolder.trim().length >= 3;
  const isAccountNumberValid = accountNumber.trim().length >= 9;
  const isSwiftCodeValid = SWIFT_REGEX.test(sanitizedSwiftCode);
  const isMobileNumberValid = mobileNumber.trim().length == 10;

  const canSubmit =
    isNameValid &&
    isAccountNumberValid &&
    isSwiftCodeValid &&
    isMobileNumberValid;

  const handleBank = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/partner/onboarding/bank", {
        accountHolder,
        accountNumber,
        swiftCode: sanitizedSwiftCode,
        vietQR,
        mobileNumber,
      });
      setLoading(false);
      setError("");
      console.log(data);
    } catch (error: any) {
      setLoading(false);
      setError(error?.response?.data?.message ?? "Something went wrong");
    }
  };

  // const sanitizedSwiftCode = swiftCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
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
          <p className="text-xs text-gray-500 font-medium">step 3 of 3</p>
          <h1 className="text-2xl font-bold mt-1">Bank & Payout Setup</h1>
          <p className="text-sm text-gray-500 mt-2">Used for partner payouts</p>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="ahn"
              className="text-xs font-semibold text-gray-500"
            >
              Account holder name
            </label>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <BadgeCheck />
              </div>
              <input
                type="text"
                id="ahn"
                placeholder="As per bank records"
                className={`flex-1 border-b pb-2 text-sm focus:outline-none ${!isNameValid && accountHolder.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
              />
            </div>
            {!isNameValid && accountHolder.length > 0 && (
              <p className="text-xs text-red-400 mt-1">
                Account holder name must be at least 3 characters
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="ban"
              className="text-xs font-semibold text-gray-500"
            >
              Bank account number
            </label>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <CreditCard />
              </div>
              <input
                type="text"
                id="ban"
                placeholder="Enter account number"
                className={`flex-1 border-b pb-2 text-sm focus:outline-none ${!isAccountNumberValid && accountNumber.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            {!isAccountNumberValid && accountNumber.length > 0 && (
              <p className="text-xs text-red-400 mt-1">
                Account number must be at least 9 characters
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="swift"
              className="text-xs font-semibold text-gray-500"
            >
              Swift code
            </label>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <Landmark />
              </div>
              <input
                type="text"
                id="swift"
                placeholder="ABCREGFT"
                className={`flex-1 border-b pb-2 text-sm focus:outline-none ${!isSwiftCodeValid && swiftCode.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
                value={swiftCode.toUpperCase()}
                onChange={(e) => setSwiftCode(e.target.value)}
              />
            </div>
            {!isSwiftCodeValid && swiftCode.length > 0 && (
              <p className="text-xs text-red-400 mt-1">
                Swift code must be at least 8 characters and match the format
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="mobi"
              className="text-xs font-semibold text-gray-500"
            >
              Mobile number
            </label>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <Phone />
              </div>
              <input
                type="text"
                id="mobi"
                placeholder="10 digit mobile number"
                className={`flex-1 border-b pb-2 text-sm focus:outline-none ${!isMobileNumberValid && mobileNumber.length > 0 ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>
            {!isMobileNumberValid && mobileNumber.length > 0 && (
              <p className="text-xs text-red-400 mt-1">
                Mobile number must be 10 digits
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="ahn"
              className="text-xs font-semibold text-gray-500"
            >
              VietQR Template ID (optional)
            </label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                id="ahn"
                placeholder="WQEdEF7"
                className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
                value={vietQR}
                onChange={(e) => setVietQR(e.target.value)}
              />
            </div>
          </div>
        </div>
        {error && <p className="text-red-500 mt-4">*{error}</p>}

        <div className="mt-6 flex items-start gap-3 text-xs text-gray-500">
          <CheckCircle size={16} className="mt-0.5" />
          <p>
            Bank & Payout are verified before activation. This usually take 1-2
            days.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="mt-8 w-full h-14 rounded-2xl bg-black text-white font-semibold disabled:opacity-40 transition flex justify-center items-center"
          onClick={handleBank}
          disabled={!canSubmit || loading}
        >
          {loading ? (
            <CircleDashed className="animate-spin text-white" />
          ) : (
            "Continue"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Page;
