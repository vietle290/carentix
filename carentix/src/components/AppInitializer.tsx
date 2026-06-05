"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import GeoUpdater from "./GeoUpdater";

export default function AppInitializer() {
  const { userData } = useSelector((state: RootState) => state.user);

  if (!userData?._id) return null;

  return <GeoUpdater userId={userData?._id.toString()} />;
}