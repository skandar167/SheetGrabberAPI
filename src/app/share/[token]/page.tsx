"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useParams } from "next/navigation";

const ShareMapContent = dynamic(
  () => import("../../../components/ShareMapContent"),
  { ssr: false }
);

function ShareInner() {
  const params = useParams();
  const token = params?.token as string | undefined;
  if (!token) return null;
  return <ShareMapContent token={token} />;
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#0b0f19", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
        Chargement...
      </div>
    }>
      <ShareInner />
    </Suspense>
  );
}
