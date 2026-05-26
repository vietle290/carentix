import mongoose from "mongoose";

type BookingStatus =
  | "idle"
  | "requested"
  | "awaiting_payment"
  | "confirmed"
  | "started"
  | "completed"
  | "cancelled"
  | "rejected"
  | "expired";

type PaymentStatus = "pending" | "paid" | "cash" | "failed";

interface IBooking {
  user: mongoose.Types.ObjectId;
  driver: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;

  pickUpAddress: string;
  dropAddress: string;

  pickUpLocation: {
    type: "Point";
    coordinates: [number, number];
  };
  dropLocation: {
    type: "Point";
    coordinates: [number, number];
  };

  fare: number;

  userMobileNumber: string;
  driverMobileNumber: string;

  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;

  adminCommission: number;
  partnerAmount: number;

  pickUpOtp: string;
  pickUpOtpExpires: Date;
  dropOtp: string;
  dropOtpExpires: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

const bookingSchema = new mongoose.Schema<IBooking>(
  {
    user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    driver: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    vehicle: { type: mongoose.Types.ObjectId, required: true, ref: "Vehicle" },

    pickUpAddress: { type: String, required: true },
    dropAddress: { type: String, required: true },

    pickUpLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: [Number],
    },
    dropLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: [Number],
    },

    fare: { type: Number, required: true },

    userMobileNumber: { type: String, required: true },
    driverMobileNumber: { type: String, required: true },

    bookingStatus: {
      type: String,
      enum: [
        "idle",
        "requested",
        "awaiting_payment",
        "confirmed",
        "started",
        "completed",
        "cancelled",
        "rejected",
        "expired",
      ],
      default: "idle",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "cash", "failed"],
      default: "pending",
    },

    adminCommission: { type: Number, default: 0 },
    partnerAmount: { type: Number, default: 0 },

    pickUpOtp: { type: String },
    pickUpOtpExpires: { type: Date },
    dropOtp: { type: String },
    dropOtpExpires: { type: Date },
  },
  { timestamps: true },
);

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;
