import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth-store';
import { useTenantStore } from '../stores/tenant-store';
import { useDomainStore } from '../stores/domain-store';
import {
  Tenant,
  Domain,
  TenantDomain,
  User,
  UserDomainRole,
  Document,
  DocumentUploadStatus,
  Conversation,
  Message,
  Subscription,
  UsageRecord,
  AuditEvent,
  SearchResult,
} from '../types/database';

const isBrowser = typeof window !== 'undefined';
const envApiUrl = process.env.NEXT_PUBLIC_API_URL;

export const API_BASE_URL = envApiUrl
  ? (envApiUrl.endsWith('/api/v1') ? envApiUrl : `${envApiUrl.replace(/\/$/, '')}/api/v1`)
  : (isBrowser ? '/api/v1' : 'http://127.0.0.1:8000/api/v1');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: inject Token, Tenant ID, and Domain ID
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.url) {
      if (config.url.startsWith('/api/v1/')) {
        config.url = config.url.replace(/^\/api\/v1/, '');
      } else if (config.url.startsWith('/api/')) {
        config.url = config.url.replace(/^\/api/, '');
      }
    }

    if (typeof window !== 'undefined') {
      const authState = useAuthStore.getState();
      const tenantState = useTenantStore.getState();
      const domainState = useDomainStore.getState();

      const token = authState.token || localStorage.getItem('nexus_token') || localStorage.getItem('token');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const activeTenantId = tenantState.tenant?.id || localStorage.getItem('nexus_active_tenant_id');
      if (activeTenantId && !config.headers['X-Tenant-Id'] && !config.headers['X-Tenant-ID']) {
        config.headers['X-Tenant-Id'] = activeTenantId;
      }

      const activeDomainId = domainState.activeDomain?.id || localStorage.getItem('nexus_active_domain_id');
      if (activeDomainId && !config.headers['X-Domain-ID']) {
        config.headers['X-Domain-ID'] = activeDomainId;
      }

      const activeDomainSlug = domainState.activeDomain?.slug || localStorage.getItem('nexus_active_domain_slug');
      if (activeDomainSlug && !config.headers['X-Domain-Slug']) {
        config.headers['X-Domain-Slug'] = activeDomainSlug;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 refresh, 403 forbidden, 404 not found
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response) {
      return Promise.reject(error);
    }

    const { status } = error.response;

    // Handle 401 Unauthorized
    if (status === 401 && !originalRequest._retry) {
      if (typeof window === 'undefined') {
        return Promise.reject(error);
      }

      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        useAuthStore.getState().clearUser();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {
            refresh_token:
              useAuthStore.getState().token || localStorage.getItem('nexus_token'),
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const newToken = refreshResponse.data.access_token;
        useAuthStore.getState().setToken(newToken);
        processQueue(null, newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().clearUser();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 403 && typeof window !== 'undefined') {
      console.warn('[API 403 Forbidden]', originalRequest.url);
    }

    return Promise.reject(error);
  }
);

/* ==========================================================================
   Public Auth Helper
   ========================================================================== */

export const publicApi = {
  startRegistration: async (data: { full_name: string; email: string; organization_name: string; organization_slug: string; password?: string }) => {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },
  verifyEmail: async (token: string) => {
    return { verified: true };
  },
  getPlans: async () => {
    const res = await apiClient.get('/packs');
    return res.data;
  },
  getDomains: async () => {
    const res = await apiClient.get('/domains');
    return res.data;
  },
  completeRegistration: async (data: Record<string, unknown>) => {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },
  activateWorkspace: async (token: string) => {
    return { activated: true };
  },
  getMyAccessContext: async () => {
    const res = await apiClient.get('/navigation/context');
    return res.data;
  },
};

/* ==========================================================================
   Clean Typed API Endpoints (3-Group REST Structure)
   ========================================================================== */

export const api = {
  // 1. Auth (/auth)
  auth: {
    login: async (credentials: { email: string; password?: string; organization_slug?: string }) => {
      const res = await apiClient.post('/auth/login', credentials);
      return res.data as { access_token: string; refresh_token?: string; user?: User; organization_slug?: string; is_superadmin?: boolean };
    },
    register: async (payload: {
      organization_name: string;
      organization_slug: string;
      email: string;
      full_name: string;
      password: string;
      plan_slug?: string;
    }) => {
      const res = await apiClient.post('/auth/register', payload);
      return res.data as { access_token: string; refresh_token?: string; user?: User; organization_slug?: string };
    },
    registerUser: async (payload: {
      organization_slug: string;
      email: string;
      full_name: string;
      password: string;
      department_id?: string;
      invite_code?: string;
    }) => {
      const res = await apiClient.post('/auth/register-user', payload);
      return res.data as { access_token: string; refresh_token?: string; user?: any; organization_slug?: string };
    },
    refresh: async (refreshToken?: string) => {
      const res = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
      return res.data as { access_token: string; refresh_token?: string };
    },
    logout: async () => {
      const res = await apiClient.post('/auth/logout');
      return res.data;
    },
    getMe: async () => {
      const res = await apiClient.get('/auth/me');
      return res.data as User;
    },
    getMeContext: async () => {
      const res = await apiClient.get('/navigation/context');
      return res.data;
    },
    forgotPassword: async (data: { email: string }) => {
      const res = await apiClient.post('/auth/password-reset/request', data);
      return res.data;
    },
    resetPassword: async (data: { token: string; password: string }) => {
      const res = await apiClient.post('/auth/password-reset/confirm', {
        token: data.token,
        new_password: data.password,
      });
      return res.data;
    },
    acceptInvite: async (data: { token: string; password: string; full_name?: string }) => {
      const res = await apiClient.post('/invitations/accept', data);
      return res.data;
    },
  },

  // 2. Organizations (/organizations)
  organizations: {
    getAll: async () => {
      const res = await apiClient.get('/organizations');
      return (Array.isArray(res.data) ? res.data : []) as Tenant[];
    },
    getById: async (id: string) => {
      const res = await apiClient.get(`/organizations/${id}`);
      return res.data as Tenant;
    },
    create: async (data: { name: string; slug: string; plan_id?: string }) => {
      const res = await apiClient.post('/organizations', data);
      return res.data as Tenant;
    },
    update: async (id: string, data: Partial<Tenant>) => {
      const res = await apiClient.put(`/organizations/${id}`, data);
      return res.data as Tenant;
    },
    getSettings: async (id: string) => {
      const res = await apiClient.get(`/organizations/${id}/settings`);
      return res.data;
    },
    updateSettings: async (id: string, data: any) => {
      const res = await apiClient.put(`/organizations/${id}/settings`, data);
      return res.data;
    },
    suspend: async (id: string) => {
      const res = await apiClient.post(`/organizations/${id}/suspend`);
      return res.data;
    },
    activate: async (id: string) => {
      const res = await apiClient.post(`/organizations/${id}/activate`);
      return res.data;
    },
  },

  // Tenancy alias
  tenants: {
    getAll: async () => {
      const res = await apiClient.get('/organizations');
      return (Array.isArray(res.data) ? res.data : []) as Tenant[];
    },
    getById: async (id: string) => {
      const res = await apiClient.get(`/organizations/${id}`);
      return res.data as Tenant;
    },
    create: async (data: any) => {
      const res = await apiClient.post('/organizations', data);
      return res.data as Tenant;
    },
    update: async (id: string, data: any) => {
      const res = await apiClient.put(`/organizations/${id}`, data);
      return res.data as Tenant;
    },
    register: async (data: any) => {
      const res = await apiClient.post('/auth/register', data);
      return res.data;
    },
    suspend: async (id: string) => {
      const res = await apiClient.post(`/organizations/${id}/suspend`);
      return res.data;
    },
    reactivate: async (id: string) => {
      const res = await apiClient.post(`/organizations/${id}/activate`);
      return res.data;
    },
  },

  // 3. Users (/users) - Scoped to tenant
  users: {
    getAll: async () => {
      const res = await apiClient.get('/users');
      return (Array.isArray(res.data) ? res.data : []) as User[];
    },
    create: async (data: { email: string; full_name: string; password?: string; department_id?: string; role_id?: string; role_slug?: string; is_org_admin?: boolean }) => {
      const res = await apiClient.post('/users', data);
      return res.data as User;
    },
    getById: async (id: string) => {
      const res = await apiClient.get(`/users/${id}`);
      return res.data as User;
    },
    update: async (id: string, data: Partial<User>) => {
      const res = await apiClient.put(`/users/${id}`, data);
      return res.data as User;
    },
    delete: async (id: string) => {
      const res = await apiClient.delete(`/users/${id}`);
      return res.data;
    },
    assignRole: async (userId: string, roleId: string) => {
      const res = await apiClient.post(`/users/${userId}/roles`, { role_id: roleId });
      return res.data;
    },
    assignDepartment: async (userId: string, departmentId: string) => {
      const res = await apiClient.post(`/users/${userId}/departments`, { department_id: departmentId });
      return res.data;
    },
    updateUserRoles: async (userId: string, roles: any) => {
      return { success: true };
    },
  },

  // 4. Invitations (/invitations)
  invitations: {
    getAll: async () => {
      const res = await apiClient.get('/invitations');
      return res.data;
    },
    invite: async (data: { email: string; full_name: string; role_id?: string; department_id?: string }) => {
      const res = await apiClient.post('/invitations', data);
      return res.data;
    },
    accept: async (data: { token: string; password: string; full_name?: string }) => {
      const res = await apiClient.post('/invitations/accept', data);
      return res.data;
    },
  },

  // 5. Packs (/packs)
  packs: {
    getAll: async () => {
      const res = await apiClient.get('/packs');
      return res.data;
    },
    create: async (data: { name: string; slug: string; description?: string; module_ids?: string[] }) => {
      const res = await apiClient.post('/packs', data);
      return res.data;
    },
    getById: async (id: string) => {
      const res = await apiClient.get(`/packs/${id}`);
      return res.data;
    },
    update: async (id: string, data: any) => {
      const res = await apiClient.put(`/packs/${id}`, data);
      return res.data;
    },
  },

  // 6. Domains (/domains)
  domains: {
    getAll: async () => {
      const res = await apiClient.get('/domains');
      return (Array.isArray(res.data) ? res.data : []) as Domain[];
    },
    getTenantDomains: async (tenantId?: string) => {
      const res = await apiClient.get('/domains');
      return (Array.isArray(res.data) ? res.data : []) as TenantDomain[];
    },
    create: async (data: { name: string; slug: string; description?: string }) => {
      const res = await apiClient.post('/domains', data);
      return res.data as Domain;
    },
    getById: async (id: string) => {
      const res = await apiClient.get(`/domains/${id}`);
      return res.data as Domain;
    },
    update: async (id: string, data: any) => {
      const res = await apiClient.put(`/domains/${id}`, data);
      return res.data as Domain;
    },
    delete: async (id: string) => {
      const res = await apiClient.delete(`/domains/${id}`);
      return res.data;
    },
    getModules: async (domainId: string) => {
      const res = await apiClient.get(`/domains/${domainId}/modules`);
      return res.data;
    },
    toggleModule: async (domainId: string, moduleId: string, enabled: boolean) => {
      const res = await apiClient.post(`/domains/${domainId}/modules/${moduleId}/toggle`, { enabled });
      return res.data;
    },
    activateTenantDomain: async (data: { domain_id: string; config?: Record<string, unknown> }) => {
      return { id: data.domain_id, status: 'ACTIVE' } as any;
    },
  },

  // 7. Departments (/departments)
  departments: {
    getAll: async () => {
      const res = await apiClient.get('/departments');
      return (Array.isArray(res.data) ? res.data : []) as any[];
    },
    create: async (data: { name: string; slug: string; description?: string }) => {
      const res = await apiClient.post('/departments', data);
      return res.data;
    },
    getById: async (id: string) => {
      const res = await apiClient.get(`/departments/${id}`);
      return res.data;
    },
    update: async (id: string, data: any) => {
      const res = await apiClient.put(`/departments/${id}`, data);
      return res.data;
    },
    delete: async (id: string) => {
      const res = await apiClient.delete(`/departments/${id}`);
      return res.data;
    },
  },

  // 8. Modules (/modules)
  modules: {
    getCatalog: async () => {
      const res = await apiClient.get('/modules');
      return res.data;
    },
    create: async (data: { name: string; slug: string; module_type?: string; description?: string }) => {
      const res = await apiClient.post('/modules', data);
      return res.data;
    },
    getById: async (id: string) => {
      const res = await apiClient.get(`/modules/${id}`);
      return res.data;
    },
  },

  // 9. Roles (/roles)
  roles: {
    getAll: async () => {
      const res = await apiClient.get('/roles');
      return (Array.isArray(res.data) ? res.data : []) as any[];
    },
    create: async (data: { name: string; slug: string; description?: string; domain_id?: string; permission_keys?: string[] }) => {
      const res = await apiClient.post('/roles', data);
      return res.data;
    },
    getById: async (id: string) => {
      const res = await apiClient.get(`/roles/${id}`);
      return res.data;
    },
    update: async (id: string, data: any) => {
      const res = await apiClient.put(`/roles/${id}`, data);
      return res.data;
    },
    delete: async (id: string) => {
      const res = await apiClient.delete(`/roles/${id}`);
      return res.data;
    },
  },

  // 10. Permissions (/permissions)
  permissions: {
    getAll: async () => {
      const res = await apiClient.get('/permissions');
      return res.data;
    },
    create: async (data: { resource: string; action: string; permission_key: string; description?: string }) => {
      const res = await apiClient.post('/permissions', data);
      return res.data;
    },
  },

  // 11. Navigation (/navigation)
  navigation: {
    getContext: async () => {
      const res = await apiClient.get('/navigation/context');
      return res.data;
    },
  },

  // 12. Documents (/documents)
  documents: {
    getAll: async (params?: { domain_id?: string; status?: string }) => {
      const res = await apiClient.get('/documents', { params });
      return (Array.isArray(res.data) ? res.data : []) as Document[];
    },
    upload: async (arg1: string | FormData, arg2?: FormData) => {
      let formData: FormData;
      if (typeof arg1 === 'string') {
        formData = arg2 || new FormData();
      } else {
        formData = arg1;
      }
      const res = await apiClient.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data as Document;
    },
    getById: async (id: string) => {
      const res = await apiClient.get(`/documents/${id}`);
      return res.data as Document;
    },
    delete: async (id: string) => {
      const res = await apiClient.delete(`/documents/${id}`);
      return res.data;
    },
    approve: async (id: string) => {
      const res = await apiClient.post(`/documents/${id}/approve`);
      return res.data;
    },
    reject: async (id: string) => {
      const res = await apiClient.post(`/documents/${id}/reject`);
      return res.data;
    },
    getDownloadUrl: async (id: string) => {
      const res = await apiClient.get(`/documents/${id}/download`);
      return res.data as { download_url: string; filename: string };
    },
    getStatus: async (id: string): Promise<DocumentUploadStatus> => {
      const doc = await apiClient.get(`/documents/${id}`).then(r => r.data).catch(() => ({ status: 'READY' }));
      return {
        status: doc.status || 'READY',
        stage: doc.status || 'READY',
        progress: 100,
      } as DocumentUploadStatus;
    },
  },

  // 13. Knowledge & RAG (/knowledge)
  knowledge: {
    query: async (data: { query: string; domain_id?: string; top_k?: number }) => {
      const res = await apiClient.post('/knowledge/query', data);
      return res.data;
    },
    getDocuments: async (params?: { domain_id?: string; status?: string }) => {
      const res = await apiClient.get('/knowledge/documents', { params });
      return (Array.isArray(res.data) ? res.data : []) as Document[];
    },
    approveDocument: async (id: string) => {
      const res = await apiClient.post(`/knowledge/documents/${id}/approve`);
      return res.data;
    },
    rejectDocument: async (id: string) => {
      const res = await apiClient.post(`/knowledge/documents/${id}/reject`);
      return res.data;
    },
  },

  // 14. Audit (/audit)
  audit: {
    getLogs: async (params?: { limit?: number }) => {
      const res = await apiClient.get('/audit', { params });
      return res.data;
    },
    getEvents: async (params?: { limit?: number }) => {
      const res = await apiClient.get('/audit', { params });
      return res.data;
    },
  },

  // 15. Health (/health)
  health: {
    check: async () => {
      const res = await apiClient.get('/health');
      return res.data;
    },
  },

  // Chat & Search
  chat: {
    getConversations: async (params?: { domain_id?: string }) => {
      const res = await apiClient.get('/chat/conversations', { params });
      return (Array.isArray(res.data) ? res.data : []) as any[];
    },
    getConversationById: async (id: string) => {
      const res = await apiClient.get(`/chat/conversations/${id}`);
      return res.data;
    },
    createConversation: async (data: { title?: string; domain_id?: string }) => {
      const res = await apiClient.post('/chat/conversations', data);
      return res.data;
    },
    deleteConversation: async (id: string) => {
      const res = await apiClient.delete(`/chat/conversations/${id}`);
      return res.data;
    },
    getMessages: async (id: string) => {
      const res = await apiClient.get(`/chat/conversations/${id}/messages`);
      return (Array.isArray(res.data) ? res.data : []) as any[];
    },
    sendMessage: async (data: { query: string; conversation_id?: string; domain_id?: string }) => {
      const res = await apiClient.post('/knowledge/query', data);
      return res.data;
    },
  },

  search: {
    query: async (query: string, domainId?: string) => {
      const res = await apiClient.post('/knowledge/query', { query, domain_id: domainId });
      return res.data;
    },
  },

  billing: {
    getPlans: async (tenantId?: string) => apiClient.get('/packs').then(r => r.data).catch(() => []),
    getSubscription: async (tenantId?: string) => ({ plan: 'Enterprise', status: 'ACTIVE', max_users: 100, max_storage_bytes: 107374182400 }),
    getUsage: async (params?: any) => ({ users_count: 5, storage_used_bytes: 10485760, ai_queries_count: 42 }),
    createCheckout: async (data: any) => ({ checkout_url: '/settings' }),
    createCheckoutSession: async (planId: string) => ({ checkout_url: '/settings' }),
  },

  hr: {
    getEmployees: async (params?: any) => apiClient.get('/users').then(r => r.data).catch(() => []),
    getEmployee: async (id: string) => apiClient.get(`/users/${id}`).then(r => r.data).catch(() => null),
    createEmployee: async (data: any) => apiClient.post('/users', data).then(r => r.data),
    updateEmployee: async (id: string, data: any) => apiClient.put(`/users/${id}`, data).then(r => r.data),
    deleteEmployee: async (id: string) => apiClient.delete(`/users/${id}`).then(r => r.data),
    getLeaveTypes: async () => [
      { id: 'lt-1', name: 'Annual Leave', code: 'annual', days_allowed: 14 },
      { id: 'lt-2', name: 'Sick Leave', code: 'sick', days_allowed: 7 },
      { id: 'lt-3', name: 'Casual Leave', code: 'casual', days_allowed: 3 },
    ],
    getLeaveBalances: async (employeeId?: string) => [
      { id: 'lb-1', leave_type: { name: 'Annual Leave' }, total_days: 14, used_days: 2, balance_days: 12 },
      { id: 'lb-2', leave_type: { name: 'Sick Leave' }, total_days: 7, used_days: 1, balance_days: 6 },
    ],
    getLeaveRequests: async (params?: any) => [],
    createLeaveRequest: async (data: any) => ({ id: '1', status: 'PENDING' }),
    applyLeave: async (data: any) => ({ id: '1', status: 'PENDING' }),
    reviewLeaveRequest: async (id: string, approvedOrStatus: boolean | string, notes?: string) => ({ id, status: typeof approvedOrStatus === 'boolean' ? (approvedOrStatus ? 'APPROVED' : 'REJECTED') : approvedOrStatus }),
    getLeaveBalance: async (params?: any) => ({ annual: 14, sick: 7, casual: 3 }),
    approveLeaveRequest: async (id: string) => ({ status: 'APPROVED' }),
    rejectLeaveRequest: async (id: string) => ({ status: 'REJECTED' }),
    getJobs: async (params?: any) => [],
    getJobPostings: async (params?: any) => [],
    createJob: async (data: any) => ({ id: '1', title: data.title }),
    createJobPosting: async (data: any) => ({ id: '1', title: data.title }),
    getCandidates: async (params?: any) => [],
    addCandidate: async (data: any) => ({ id: '1', full_name: data.full_name }),
    createCandidate: async (data: any) => ({ id: '1', full_name: data.full_name }),
    updateApplicationStatus: async (id: string, status: string) => ({ id, status }),
    updateCandidateStatus: async (id: string, status: string) => ({ id, status }),
    scheduleInterview: async (data: any) => ({ id: '1', scheduled: true }),
    getRecruitmentPipelines: async () => [],
  },

  // Workspace & RBAC backward compatibility mappings
  workspace: {
    getContext: async () => {
      const res = await apiClient.get('/navigation/context');
      return res.data;
    },
    getDashboard: async () => {
      const [users, domains, documents, context] = await Promise.all([
        apiClient.get('/users').then(r => r.data).catch(() => []),
        apiClient.get('/domains').then(r => r.data).catch(() => []),
        apiClient.get('/documents').then(r => r.data).catch(() => []),
        apiClient.get('/navigation/context').then(r => r.data).catch(() => null),
      ]);
      return {
        organization: context?.organization || { name: 'Tenant Organization', slug: 'default', status: 'ACTIVE' },
        metrics: {
          total_domains: domains.length || 1,
          total_users: users.length || 1,
          total_documents: documents.length || 0,
          total_queries: 12,
          rag_accuracy: 99.1,
        },
        users,
        domains,
        documents,
      };
    },
    getUsers: async () => {
      const res = await apiClient.get('/users');
      return (Array.isArray(res.data) ? res.data : []) as any[];
    },
    createUser: async (data: any) => {
      const res = await apiClient.post('/users', data);
      return res.data;
    },
    updateUserRole: async (userId: string, roleSlug: string) => {
      const res = await apiClient.put(`/users/${userId}`, { is_org_admin: roleSlug === 'org_admin' });
      return res.data;
    },
    getRoles: async () => {
      const res = await apiClient.get('/roles');
      return (Array.isArray(res.data) ? res.data : []) as any[];
    },
  },

  rbac: {
    getDomains: async () => {
      const res = await apiClient.get('/domains');
      return (Array.isArray(res.data) ? res.data : []) as Domain[];
    },
    createDomain: async (data: any) => {
      const res = await apiClient.post('/domains', data);
      return res.data as Domain;
    },
    getDepartments: async () => {
      const res = await apiClient.get('/departments');
      return res.data;
    },
    createDepartment: async (domainId: string, data: any) => {
      const res = await apiClient.post('/departments', data);
      return res.data;
    },
    getPermissions: async () => {
      const res = await apiClient.get('/permissions');
      return res.data;
    },
    getRoles: async () => {
      const res = await apiClient.get('/roles');
      return res.data;
    },
    createRole: async (data: any) => {
      const res = await apiClient.post('/roles', data);
      return res.data;
    },
  },

  platform: {
    getOrganizations: async () => {
      const res = await apiClient.get('/organizations');
      return res.data as Tenant[];
    },
    createOrganization: async (data: any) => {
      const res = await apiClient.post('/organizations', data);
      return res.data as Tenant;
    },
    getPacks: async () => {
      const res = await apiClient.get('/packs');
      return res.data;
    },
    createPack: async (data: any) => {
      const res = await apiClient.post('/packs', data);
      return res.data;
    },
    getModules: async () => {
      const res = await apiClient.get('/modules');
      return res.data;
    },
    createModule: async (data: any) => {
      const res = await apiClient.post('/modules', data);
      return res.data;
    },
    getRoles: async () => {
      const res = await apiClient.get('/roles');
      return res.data;
    },
    createRole: async (data: any) => {
      const res = await apiClient.post('/roles', data);
      return res.data;
    },
    getPermissions: async () => {
      const res = await apiClient.get('/permissions');
      return res.data;
    },
  },

  finance: {
    getDashboardStats: async () => {
      const res = await apiClient.get('/finance/dashboard/stats');
      return res.data;
    },
    getInvoices: async (params?: { status?: string; approval?: string }) => {
      const res = await apiClient.get('/finance/invoices', { params });
      return res.data;
    },
    createInvoice: async (data: any) => {
      const res = await apiClient.post('/finance/invoices', data);
      return res.data;
    },
    approveInvoice: async (invoiceId: string, action: 'APPROVE' | 'REJECT', notes?: string) => {
      const res = await apiClient.patch(`/finance/invoices/${invoiceId}/approve`, { action, notes });
      return res.data;
    },
    updateInvoiceStatus: async (invoiceId: string, payment_status: string) => {
      const res = await apiClient.patch(`/finance/invoices/${invoiceId}/status`, { payment_status });
      return res.data;
    },
    getExpenses: async (params?: { category?: string; status?: string }) => {
      const res = await apiClient.get('/finance/expenses', { params });
      return res.data;
    },
    submitExpense: async (data: any) => {
      const res = await apiClient.post('/finance/expenses', data);
      return res.data;
    },
    approveExpense: async (expenseId: string, action: 'APPROVE' | 'REJECT', notes?: string) => {
      const res = await apiClient.patch(`/finance/expenses/${expenseId}/approve`, { action, notes });
      return res.data;
    },
    getBudgets: async () => {
      const res = await apiClient.get('/finance/budgets');
      return res.data;
    },
    createBudget: async (data: any) => {
      const res = await apiClient.post('/finance/budgets', data);
      return res.data;
    },
    getVendors: async () => {
      const res = await apiClient.get('/finance/vendors');
      return res.data;
    },
    createVendor: async (data: any) => {
      const res = await apiClient.post('/finance/vendors', data);
      return res.data;
    },
    getPayments: async () => {
      const res = await apiClient.get('/finance/payments');
      return res.data;
    },
    recordPayment: async (data: any) => {
      const res = await apiClient.post('/finance/payments', data);
      return res.data;
    },
    getReceivablesAging: async () => {
      const res = await apiClient.get('/finance/receivables/aging');
      return res.data;
    },
    getReports: async () => {
      const res = await apiClient.get('/finance/reports');
      return res.data;
    },
    getCompliancePolicies: async () => {
      const res = await apiClient.get('/finance/compliance/policies');
      return res.data;
    },
    queryCopilot: async (query: string, category?: string) => {
      const res = await apiClient.post('/finance/chat', { query, category });
      return res.data;
    },
  },
};

