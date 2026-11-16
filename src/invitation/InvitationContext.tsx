import { createContext, useContext } from "react";
import type { TemplateConfig } from "./schema";

export const InvitationContext = createContext<TemplateConfig | null>(null);
export function useInvitation() {
  const value = useContext(InvitationContext);
  if (!value) throw new Error("An invitation must have a customer configuration.");
  return value;
}
