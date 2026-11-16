import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "../App";
import { InvitationContext } from "../invitation/InvitationContext";
import { toTemplateConfig, validateRecord, type WeddingRecord } from "../invitation/schema";
import "../index.css";

function DraftPreview() {
  const [preview, setPreview] = useState<{ record: WeddingRecord; revision: number } | null>(null);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.source !== window.parent ||
        event.origin !== window.location.origin ||
        event.data?.type !== "wishnote:preview"
      )
        return;
      try {
        const record = validateRecord(event.data.record);
        setPreview({ record, revision: event.data.revision });
        document.title = `${record.couple.first} & ${record.couple.second} · Private draft`;
        window.parent.postMessage(
          { type: "wishnote:applied", revision: event.data.revision },
          window.location.origin,
        );
      } catch {
        window.parent.postMessage({ type: "wishnote:preview-error" }, window.location.origin);
      }
    };
    const mediaError = (event: Event) => {
      if (event.target instanceof HTMLImageElement || event.target instanceof HTMLMediaElement)
        window.parent.postMessage({ type: "wishnote:media-error" }, window.location.origin);
    };
    window.addEventListener("message", receive);
    window.addEventListener("error", mediaError, true);
    window.parent.postMessage({ type: "wishnote:ready" }, window.location.origin);
    return () => {
      window.removeEventListener("message", receive);
      window.removeEventListener("error", mediaError, true);
    };
  }, []);
  if (!preview) return <p style={{ padding: 24 }}>Waiting for the local editor…</p>;
  return (
    <InvitationContext key={preview.revision} value={toTemplateConfig(preview.record)}>
      <App />
    </InvitationContext>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DraftPreview />
  </StrictMode>,
);
