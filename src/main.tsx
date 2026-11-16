import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { customerRecord } from "virtual:wishnote-customer";
import { InvitationContext } from "./invitation/InvitationContext";
import { toTemplateConfig } from "./invitation/schema";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <InvitationContext value={toTemplateConfig(customerRecord)}>
      <App />
    </InvitationContext>
  </React.StrictMode>,
);
