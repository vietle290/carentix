"use client";
import axios from "axios";
import { CircleDashed, Lock, Mail, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

type stepType = "login" | "signup" | "otp";

function AuthModal({ open, onClose }: AuthModalProps) {
  const [step, setStep] = useState<stepType>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleSignup = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });
      setErr("");
      setStep("otp");
      setLoading(false);
    } catch (error: unknown) {
      setLoading(false);
      setErr(
        (error as { response: { data: { message: string } } }).response.data
          .message || "An error occurred. Please try again.",
      );
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/verify-email", {
        email,
        otp: otp.join(""),
      });
      setErr("");
      setOtp(["", "", "", "", "", ""]);
      setStep("login");
      setLoading(false);
    } catch (error: unknown) {
      setLoading(false);
      setErr(
        (error as { response: { data: { message: string } } }).response.data
          .message || "An error occurred. Please try again.",
      );
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      // callbackUrl: "/",
    });
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < otp.length - 1) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
      if (!value && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-90"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="fixed inset-0 z-100 flex items-center justify-center px-4"
            >
              <div className="relative w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-[0_40px_100px_rgba(0,0,0,0.35)] p-6 sm:p-8 text-black">
                <div
                  className="absolute right-4 top-4 text-gray-500 hover:text-black transition cursor-pointer"
                  onClick={onClose}
                >
                  <X size={20} />
                </div>
                <div className="mb-6 text-center">
                  <h1 className="text-3xl font-extrabold tracking-widest">
                    CARENTIX
                  </h1>
                  <p className="mt-1 text-xs text-gray-500">
                    Premium Vehicle Booking
                  </p>
                </div>
                <button
                  className="w-full h-11 rounded-xl border border-black/20 flex items-center justify-center gap-3 text-sm font-semibold hover:bg-black hover:text-white transition"
                  onClick={handleGoogleLogin}
                >
                  <Image
                    src={"/google.png"}
                    alt="Google"
                    width={20}
                    height={20}
                  />
                  <span>Continue with Google</span>
                </button>
                <div className="flex items-center gap-4 my-6">
                  <div className="h-px flex-1 bg-gray-300" />
                  <div className="text-xs text-gray-500">Or</div>
                  <div className="h-px flex-1 bg-gray-300" />
                </div>

                <div>
                  {step === "login" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <h1 className="text-xl font-semibold">Welcome back</h1>
                      <div className="mt-5 space-y-4">
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <Mail size={18} className="text-gray-500" />
                          <input
                            type="email"
                            placeholder="Email"
                            className="w-full bg-transparent outline-none text-sm"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                          />
                        </div>
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <Lock size={18} className="text-gray-500" />
                          <input
                            type="password"
                            placeholder="Password"
                            className="w-full bg-transparent outline-none text-sm"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                          />
                        </div>
                        <button
                          className="w-full h-11 rounded-xl flex items-center justify-center bg-black text-white font-semibold hover:bg-gray-900 transition"
                          onClick={handleLogin}
                        >
                          {!loading ? (
                            "Login"
                          ) : (
                            <CircleDashed
                              size={18}
                              className="animate-spin text-white"
                            />
                          )}
                        </button>
                      </div>
                      <p className="mt-4 text-center text-sm text-gray-500">
                        Don&apos;t have an account?&nbsp;
                        <span
                          className="text-black font-semibold hover:underline cursor-pointer"
                          onClick={() => setStep("signup")}
                        >
                          Sign up
                        </span>
                      </p>
                    </motion.div>
                  )}
                  {step === "signup" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <h1 className="text-xl font-semibold">
                        Create an account
                      </h1>
                      <div className="mt-5 space-y-4">
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <User size={18} className="text-gray-500" />
                          <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full bg-transparent outline-none text-sm"
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                          />
                        </div>
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <Mail size={18} className="text-gray-500" />
                          <input
                            type="email"
                            placeholder="Email"
                            className="w-full bg-transparent outline-none text-sm"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                          />
                        </div>
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <Lock size={18} className="text-gray-500" />
                          <input
                            type="password"
                            placeholder="Password"
                            className="w-full bg-transparent outline-none text-sm"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                          />
                        </div>
                        {err && (
                          <div className="text-red-500 text-sm">{err}</div>
                        )}
                        <button
                          className="w-full h-11 rounded-xl flex justify-center items-center bg-black text-white font-semibold hover:bg-gray-900 transition"
                          disabled={loading}
                          onClick={handleSignup}
                        >
                          {!loading ? (
                            "Sign Up"
                          ) : (
                            <CircleDashed
                              size={18}
                              className="animate-spin text-white"
                            />
                          )}
                        </button>
                      </div>
                      <p className="mt-4 text-center text-sm text-gray-500">
                        Already have an account?&nbsp;
                        <span
                          className="text-black font-semibold hover:underline cursor-pointer"
                          onClick={() => setStep("login")}
                        >
                          Login
                        </span>
                      </p>
                    </motion.div>
                  )}

                  {step === "otp" && (
                    <motion.div
                      key="otp"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h2 className="text-xl font-semibold">Verify Email</h2>
                      <div className="mt-6 flex justify-between gap-2">
                        {otp.map((digit, index) => (
                          <input
                            placeholder="_"
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleOtpChange(index, e.target.value)
                            }
                            className="w-10 sm:w-12 h-12 text-center font-semibold border border-gray-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition"
                          />
                        ))}
                      </div>
                      {err && <div className="text-red-500 text-sm">{err}</div>}
                      <button
                        className="mt-6 w-full h-11 flex justify-center items-center rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition"
                        onClick={handleVerifyEmail}
                        disabled={loading}
                      >
                        {!loading ? (
                          "Verify OTP"
                        ) : (
                          <CircleDashed
                            size={18}
                            className="animate-spin text-white"
                          />
                        )}
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AuthModal;
