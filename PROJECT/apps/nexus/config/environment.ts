export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  appDomain: process.env.NEXT_PUBLIC_APP_DOMAIN || "nexusrag.com",
  isProduction: process.env.NODE_ENV === "production",
};
