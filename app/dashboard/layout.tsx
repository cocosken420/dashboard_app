"use client";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleBeforeUnload = () => {
      navigator.sendBeacon(
        "/api/logout",
        JSON.stringify({ reason: "tab_closed" })
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return <>{children}</>;
}
