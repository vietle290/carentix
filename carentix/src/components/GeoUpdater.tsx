"use client";

import { getSocket } from "@/lib/socket";
import { useEffect, useRef } from "react";
import { WebSocket } from "socket.io-client";

function GeoUpdater({ userId }: { userId: string }) {
  const socketRef = useRef<any>(null);
  useEffect(() => {
    if (!userId) return;
    if (!navigator.geolocation) return;
    socketRef.current = getSocket();
    const socket = socketRef.current;
    socket.emit("identity", userId);

    const watcher = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        socket.emit("update-location", { userId, latitude, longitude });
      },
      (error) => {
        console.log(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
    return () => {
      navigator.geolocation.clearWatch(watcher);
      // socket.disconnect();
    };
  }, [userId]);
  return null;
}

export default GeoUpdater;
