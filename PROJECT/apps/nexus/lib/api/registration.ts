import { apiClient } from "./client";
import { RegistrationStartPayload, RegistrationCompletePayload } from "@/types/registration";

export const registrationApi = {
  start: async (payload: RegistrationStartPayload) => {
    const res = await apiClient.post("/api/public/registration/start", payload);
    return res.data;
  },
  verifyEmail: async (token: string) => {
    const res = await apiClient.post("/api/public/registration/verify-email", { token });
    return res.data;
  },
  getStatus: async (token: string) => {
    const res = await apiClient.get(`/api/public/registration/status?token=${encodeURIComponent(token)}`);
    return res.data;
  },
  complete: async (payload: RegistrationCompletePayload) => {
    const res = await apiClient.post("/api/public/registration/complete", payload);
    return res.data;
  },
};
