import { apiClient } from "./client";

export interface SmtpConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_user?: string;
  smtp_password?: string;
  from_email: string;
  from_name: string;
  encryption: "TLS" | "SSL" | "NONE";
}

export const settingsApi = {
  getSettings: async (): Promise<any> => {
    try {
      const res = await apiClient.get("/settings");
      return res.data || {};
    } catch {
      return {};
    }
  },

  getSmtpSettings: async (): Promise<SmtpConfig | null> => {
    try {
      const res = await apiClient.get<SmtpConfig>("/settings/smtp");
      return res.data;
    } catch {
      return null;
    }
  },

  updateSmtpSettings: async (config: Partial<SmtpConfig>): Promise<any> => {
    const res = await apiClient.put("/settings/smtp", config);
    return res.data;
  },

  testSmtp: async (recipientEmail: string): Promise<any> => {
    const res = await apiClient.post("/settings/smtp/test", { email: recipientEmail });
    return res.data;
  },
};
