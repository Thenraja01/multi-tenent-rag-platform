import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const isBrowser = typeof window !== "undefined";
const envApiUrl = process.env.NEXT_PUBLIC_API_URL;

export const API_BASE_URL = envApiUrl
  ? (envApiUrl.endsWith("/api/v1") ? envApiUrl : `${envApiUrl.replace(/\/$/, "")}/api/v1`)
  : (isBrowser ? "/api/v1" : "http://127.0.0.1:8000/api/v1");

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Normalize URL to prevent /api/v1/api/ duplicate prefixing
  if (config.url) {
    if (config.url.startsWith('/api/v1/')) {
      config.url = config.url.replace(/^\/api\/v1/, '');
    } else if (config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    }
  }

  if (typeof window !== "undefined") {
    let token = localStorage.getItem("nexus_token") || localStorage.getItem("token");
    if (!token && typeof document !== "undefined") {
      const match = document.cookie.match(/nexus_token=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const activeTenantId = localStorage.getItem("nexus_active_tenant_id");
    if (activeTenantId && !config.headers["X-Tenant-Id"]) {
      config.headers["X-Tenant-Id"] = activeTenantId;
    }

    const activeDomainSlug = localStorage.getItem("nexus_active_domain_slug");
    if (activeDomainSlug && !config.headers["X-Domain-Slug"]) {
      config.headers["X-Domain-Slug"] = activeDomainSlug;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (typeof window !== "undefined" && error.response) {
      const { status } = error.response;
      // Only clear tokens if unauthorized on critical auth verification
      if (status === 401 && error.config?.url?.includes('/auth/me')) {
        const isAuthPage =
          window.location.pathname.startsWith("/login") ||
          window.location.pathname.startsWith("/register") ||
          window.location.pathname.startsWith("/activation");
        if (!isAuthPage) {
          localStorage.removeItem("nexus_token");
          localStorage.removeItem("nexus_user");
        }
      }
    }
    return Promise.reject(error);
  }
);
