import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { OwnerEditor } from "./OwnerEditor";
import "./editor.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <OwnerEditor />
  </StrictMode>,
);
