'use client';

import { XCircle } from "lucide-react";
import { useParams } from "next/navigation";

function Page() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-[32px] p-8 max-w-md w-full text-center shadow-lg">
        <XCircle
          size={80}
          className="mx-auto text-red-500 mb-4"
        />

        <h1 className="text-3xl font-black text-zinc-900">
          Payment Failed
        </h1>

        <p className="mt-3 text-zinc-500">
          We couldn't process your payment.
        </p>

        <div className="mt-6 rounded-2xl bg-zinc-50 p-4 border">
          <p className="text-sm text-zinc-500">
            Booking ID
          </p>

          <p className="font-bold mt-1">
            {id}
          </p>
        </div>

        <a
          href={`/user/checkout?bookingId=${id}`}
          className="mt-6 inline-flex items-center justify-center w-full h-12 rounded-xl bg-zinc-900 text-white font-semibold"
        >
          Try Again
        </a>
      </div>
    </div>
  );
}

export default Page