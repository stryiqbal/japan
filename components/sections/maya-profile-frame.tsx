"use client";

import { useEffect, useRef } from "react";

export default function MayaProfileFrame() {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.contentWindow) return;

      const data = event.data;
      if (typeof data !== "object" || data === null || data.type !== "maya-profile-resize") return;
      if (data.mode === "viewport") {
        frame.style.height = "100svh";
      } else if (data.mode === "content" && typeof data.height === "number" && Number.isFinite(data.height)) {
        frame.style.height = `${Math.max(window.innerHeight, Math.ceil(data.height))}px`;
      }
    };

    const requestMeasurement = () => {
      frame.contentWindow?.postMessage({ type: "maya-profile-measure" }, window.location.origin);
    };

    window.addEventListener("message", handleMessage);
    frame.addEventListener("load", requestMeasurement);
    requestMeasurement();

    return () => {
      window.removeEventListener("message", handleMessage);
      frame.removeEventListener("load", requestMeasurement);
    };
  }, []);

  return (
    <iframe
      ref={frameRef}
      className="maya-profile-frame"
      src="/embeds/maya-profile.html"
      title="Japan through four seasons"
      style={{ display: "block", width: "100%", height: "100svh", border: 0, background: "#eeece8" }}
    />
  );
}