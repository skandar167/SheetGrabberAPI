"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const ShareMapContent = dynamic(
  () => import("../../../components/ShareMapContent"),
  { ssr: false }
);

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;
  return <ShareMapContent token={token} />;
}
