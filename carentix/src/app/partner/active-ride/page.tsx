"use client";

import { BookingStatus, IBooking, PaymentStatus } from "@/models/booking.model";
import axios from "axios";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Zap } from "lucide-react";
import PanelContent from "@/components/PanelContent";

const LiveRideMap = dynamic(() => import("@/components/LiveRideMap"), {
  ssr: false,
});

const MAP_STATUS: Record<BookingStatus, "arriving" | "ongoing" | "completed"> =
  {
    idle: "arriving",
    requested: "arriving",
    awaiting_payment: "arriving",
    confirmed: "arriving",
    started: "ongoing",
    completed: "completed",
    cancelled: "completed",
    rejected: "completed",
    expired: "completed",
  };

const STATUS_LABEL: Record<
  BookingStatus,
  { label: string; sublabel: string; dot: string }
> = {
  idle: {
    label: "Awaiting Confirmation",
    sublabel: "Booking is being processed",
    dot: "bg-amber-400",
  },
  requested: {
    label: "Awaiting Confirmation",
    sublabel: "Booking is being processed",
    dot: "bg-amber-400",
  },

  awaiting_payment: {
    label: "Payment Pending",
    sublabel: "Customer payment is pending",
    dot: "bg-purple-400",
  },

  confirmed: {
    label: "Heading to Pickup",
    sublabel: "Drive to the pickup location",
    dot: "bg-amber-400",
  },

  started: {
    label: "Ride in Progress",
    sublabel: "Heading to drop location",
    dot: "bg-emerald-400",
  },

  completed: {
    label: "Ride Completed",
    sublabel: "Trip has ended successfully",
    dot: "bg-zinc-400",
  },

  cancelled: {
    label: "Ride Cancelled",
    sublabel: "This ride was cancelled",
    dot: "bg-red-400",
  },

  rejected: {
    label: "Ride Rejected",
    sublabel: "Ride was rejected",
    dot: "bg-red-400",
  },

  expired: {
    label: "Request Expired",
    sublabel: "Booking timed out",
    dot: "bg-orange-400",
  },
};

const PAYMENT_BADGE: Record<PaymentStatus, { label: string; color: string }> = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700",
  },

  paid: {
    label: "Paid",
    color: "bg-emerald-100 text-emerald-700",
  },
  cash: {
    label: "Paid",
    color: "bg-zinc-100 text-zinc-700",
  },
  failed: {
    label: "Failed",
    color: "bg-red-100 text-red-700",
  },
};

function Page() {
  const [booking, setBooking] = useState<IBooking | null>(null);
  const [loading, setLoading] = useState(false);
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const [pickUpPos, setPickUpPos] = useState<[number, number] | null>(null);
  const [dropPos, setDropPos] = useState<[number, number] | null>(null);
  const [distanceToPickUp, setDistanceToPickUp] = useState(0);
  const [distanceToDrop, setDistanceToDrop] = useState(0);
  const [etaToPickUp, setEtaToPickUp] = useState(0);
  const [etaToDrop, setEtaToDrop] = useState(0);
  const [status, setStatus] = useState("idle");
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/partner/my-active-ride");
        setBooking(data.booking);
        setStatus(data.booking.bookingStatus);
        setPickUpPos([
          data.booking.pickUpLocation.coordinates[1],
          data.booking.pickUpLocation.coordinates[0],
        ]);
        setDropPos([
          data.booking.dropLocation.coordinates[1],
          data.booking.dropLocation.coordinates[0],
        ]);
      } catch (error: any) {
        console.log(error?.response?.data.message ?? error);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, []);

  const onChatToggle = () => {
    setChatOpen(!chatOpen);
  }

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setDriverPos([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.log("gps error", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <p className="text-white/40 text-sn tracking-widest uppercase font-medium">
            Loading Ride...
          </p>
        </div>
      </div>
    );
  }

  const config = STATUS_LABEL[booking?.bookingStatus ?? "confirmed"];
  const isActive = ["confirmed", "started"].includes(status);
  const canChat = booking?.bookingStatus === "confirmed";
  const displayEta = status === "confirmed" ? etaToPickUp : etaToDrop;
  const displayDistance =
    status === "confirmed" ? distanceToPickUp : distanceToDrop;
  const paymentStatus = PAYMENT_BADGE[booking?.paymentStatus ?? "pending"];
    const panelProps = {
    isActive,
    displayDistance,
    displayEta,
    config,
    status,
    booking,
    paymentStatus,
    canChat,
    chatOpen,
    onChatToggle
  };

  return (
    <div className="h-screen w-full bg-zinc-100 flex flex-col lg:flex-row overflow-hidden">
      <div className="relative flex-1 h-full z-0">
        <LiveRideMap
          booking={booking}
          driverPos={driverPos}
          pickUpPos={pickUpPos}
          dropPos={dropPos}
          mapStatus={MAP_STATUS[booking?.bookingStatus ?? "idle"]}
          onStats={({
            distanceToPickUp,
            etaToPickUp,
            distanceToDrop,
            etaToDrop,
          }) => {
            setDistanceToPickUp(distanceToPickUp);
            setEtaToPickUp(etaToPickUp);
            setDistanceToDrop(distanceToDrop);
            setEtaToDrop(etaToDrop);
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-500 pointer-events-none"
        >
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-zinc-100">
            <span
              className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`}
            />
            <span className="text-xs font-semibold tracking-wide text-zinc-900">
              {config.label}
            </span>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex w-105 xl:w-115 bg-white border-l border-zinc-100 flex-col overflow-hidden"
      >
        <div className="bg-zinc-950 px-6 py-5 shrink-0">
          <p className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase font-semibold mb-1">
            Driver Panel
          </p>
          <div className="flex items-center justify-between">
            <h1 className="text-white text-xl font-bold">Active Ride</h1>
            {isActive && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                <Zap size={12} className="text-amber-400" />
                <span className="text-white text-xs font-semibold">
                  {Math.round(displayEta)} min
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            <PanelContent {...panelProps} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Page;
