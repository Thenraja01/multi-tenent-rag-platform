import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export interface HostContext {
  type: 'PLATFORM' | 'ORGANIZATION' | 'DEPARTMENT' | 'UNKNOWN';
  tenantSlug?: string;
  departmentSlug?: string;
  hostname: string;
}

export interface DecodedToken {
  sub?: string;
  tenant_id?: string;
  tenant_slug?: string;
  org_id?: string;
  org_slug?: string;
  is_superadmin?: boolean;
  is_org_admin?: boolean;
  department_slug?: string;
  department_id?: string;
  allowed_departments?: string[];
  role?: string;
  roles?: string[];
  exp?: number;
}

export interface HostResolutionResult {
  status: number; // 200, 403, 404, 503
  tenant?: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
  department?: {
    id: string;
    slug: string;
    name: string;
    status: string;
  };
  domain?: {
    id: string;
    hostname: string;
    status: string;
  };
  cachedAt: number;
}

const RESERVED_SUBDOMAINS = new Set([
  'admin',
  'super-admin',
  'superadmin',
  'api',
  'www',
  'app',
  'login',
  'register',
  'platform',
  'mail',
  'support',
  'auth',
  'static',
  'test',
  'testserver',
  'dev',
  'stage',
  'staging',
  'demo',
  'preview',
]);

// Resolution cache with 30s TTL
const resolutionCache = new Map<string, HostResolutionResult>();
const CACHE_TTL_MS = 30_000;

function parseHostContext(hostHeader: string): HostContext {
  const cleanHost = hostHeader.split(',')[0].trim().replace(/:\d+$/, '').toLowerCase();

  const configuredBaseDomain = (
    process.env.TENANT_BASE_DOMAIN ||
    process.env.NEXT_PUBLIC_TENANT_BASE_DOMAIN ||
    process.env.NEXT_PUBLIC_APP_DOMAIN ||
    'localfix.app'
  ).toLowerCase().replace(/:\d+$/, '').trim();

  const baseDomains = [
    configuredBaseDomain,
    'localfix.app',
    'nexus.com',
    'nexusrag.com',
    'nexusrag.local',
    'nip.io',
    'localhost',
    '127.0.0.1',
  ];

  // 1. Platform SuperAdmin Hosts
  if (
    cleanHost.startsWith('super-admin.') ||
    cleanHost.startsWith('superadmin.') ||
    cleanHost.startsWith('platform.')
  ) {
    return { type: 'PLATFORM', hostname: cleanHost };
  }

  // 2. Base domain exact match -> Platform / Landing
  if (baseDomains.includes(cleanHost)) {
    return { type: 'PLATFORM', hostname: cleanHost };
  }

  // 3. Multi-level Subdomain Parsing
  let matchedBase: string | null = null;
  for (const base of baseDomains) {
    if (cleanHost.endsWith(`.${base}`)) {
      matchedBase = base;
      break;
    }
  }

  if (matchedBase) {
    const subPart = cleanHost.slice(0, -(matchedBase.length + 1));
    const parts = subPart.split('.').filter(Boolean);

    if (parts.length === 1) {
      if (RESERVED_SUBDOMAINS.has(parts[0])) {
        return { type: 'PLATFORM', hostname: cleanHost };
      }
      return {
        type: 'ORGANIZATION',
        tenantSlug: parts[0],
        hostname: cleanHost,
      };
    } else if (parts.length >= 2) {
      if (RESERVED_SUBDOMAINS.has(parts[1])) {
        return { type: 'PLATFORM', hostname: cleanHost };
      }
      return {
        type: 'DEPARTMENT',
        departmentSlug: parts[0], // e.g. hr
        tenantSlug: parts[1],     // e.g. acme
        hostname: cleanHost,
      };
    }
  }

  return { type: 'UNKNOWN', hostname: cleanHost };
}

async function verifyHostResolution(
  tenantSlug: string,
  departmentSlug?: string,
  hostname?: string
): Promise<HostResolutionResult> {
  const cacheKey = `${tenantSlug}:${departmentSlug || ''}:${hostname || ''}`.toLowerCase();
  const cached = resolutionCache.get(cacheKey);
  const now = Date.now();

  if (cached && (now - cached.cachedAt) < CACHE_TTL_MS) {
    return cached;
  }

  const backendBase =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:8000';

  const queryParams = new URLSearchParams({
    subdomain: tenantSlug,
    ...(departmentSlug ? { department: departmentSlug } : {}),
    ...(hostname ? { hostname } : {}),
  });

  try {
    const res = await fetch(`${backendBase}/api/v1/organizations/resolve?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-internal-source': 'next-middleware',
      },
    });

    let result: HostResolutionResult;
    if (res.status === 200) {
      const data = await res.json();
      result = {
        status: 200,
        tenant: data.tenant,
        department: data.department,
        domain: data.domain,
        cachedAt: now,
      };
    } else {
      result = { status: res.status, cachedAt: now };
    }

    resolutionCache.set(cacheKey, result);
    return result;
  } catch {
    // Fail-Closed Security: Do NOT assume 200 OK during network/backend errors
    return { status: 503, cachedAt: now };
  }
}

function parseJwt(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isSafeRedirectUrl(url: string | null): boolean {
  if (!url) return false;
  return url.startsWith('/') && !url.startsWith('//') && !url.includes(':');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass WebSocket upgrades and internal HMR
  const upgradeHeader = request.headers.get('upgrade');
  if (
    upgradeHeader?.toLowerCase() === 'websocket' ||
    pathname.startsWith('/_next/hmr') ||
    pathname.startsWith('/_next/webpack-hmr') ||
    pathname.startsWith('/ws')
  ) {
    return NextResponse.next();
  }

  // 2. Parse Host Context
  const hostHeader = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const hostContext = parseHostContext(hostHeader);

  // 3. Prepare Request Headers
  const requestHeaders = new Headers(request.headers);
  const requestId = request.headers.get('x-request-id') || `req_${Math.random().toString(36).substring(2, 11)}`;
  requestHeaders.set('x-request-id', requestId);
  requestHeaders.set('x-context-type', hostContext.type);

  if (hostContext.tenantSlug) {
    requestHeaders.set('x-tenant-slug', hostContext.tenantSlug);
  }
  if (hostContext.departmentSlug) {
    requestHeaders.set('x-department-slug', hostContext.departmentSlug);
  }

  // 4. Static assets and status pages bypass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname === '/tenant-not-found' ||
    pathname === '/organization-suspended' ||
    pathname === '/domain-disabled' ||
    pathname === '/module-disabled' ||
    pathname === '/503'
  ) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 5. Database-Driven Host Resolution (Tenant & Department)
  if (hostContext.type === 'ORGANIZATION' || hostContext.type === 'DEPARTMENT') {
    const resolution = await verifyHostResolution(
      hostContext.tenantSlug!,
      hostContext.departmentSlug,
      hostContext.hostname
    );

    if (resolution.status === 404) {
      const url = request.nextUrl.clone();
      url.pathname = '/tenant-not-found';
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    if (resolution.status === 403) {
      const url = request.nextUrl.clone();
      url.pathname = '/organization-suspended';
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    if (resolution.status === 503) {
      // Backend outage fail-closed
      return new NextResponse('Service Temporarily Unavailable', { status: 503 });
    }

    if (resolution.tenant?.id) {
      requestHeaders.set('x-tenant-id', resolution.tenant.id);
      requestHeaders.set('x-tenant-name', resolution.tenant.name);
    }

    if (resolution.department?.id) {
      requestHeaders.set('x-department-id', resolution.department.id);
      requestHeaders.set('x-department-name', resolution.department.name);
    }
  }

  // 6. Public Auth & Marketing Routes
  const isPublicAuthRoute =
    pathname === '/login' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/invite') ||
    pathname.startsWith('/403') ||
    pathname.startsWith('/404');

  const isPlatformPublicRoute =
    hostContext.type === 'PLATFORM' &&
    !pathname.startsWith('/superadmin') &&
    (
      pathname === '/' ||
      pathname.startsWith('/pricing') ||
      pathname.startsWith('/solutions') ||
      pathname.startsWith('/architecture') ||
      pathname.startsWith('/platform') ||
      pathname.startsWith('/multi-tenancy') ||
      pathname.startsWith('/security') ||
      pathname.startsWith('/rbac') ||
      pathname.startsWith('/rag') ||
      pathname.startsWith('/how-it-works') ||
      pathname.startsWith('/use-cases') ||
      pathname.startsWith('/faq') ||
      pathname.startsWith('/about') ||
      pathname.startsWith('/contact')
    );

  if (isPublicAuthRoute || isPlatformPublicRoute) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Token Extraction for Protected Routes
  const token =
    request.cookies.get('nexus_access_token')?.value ||
    request.cookies.get('nexus_token')?.value ||
    request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  // Unauthenticated User Handling
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    if (isSafeRedirectUrl(pathname)) {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  const payload = parseJwt(token);

  // Expiration Check
  if (payload && payload.exp && Date.now() >= payload.exp * 1000) {
    const loginUrl = new URL('/login', request.url);
    if (isSafeRedirectUrl(pathname)) {
      loginUrl.searchParams.set('redirect', pathname);
    }
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('nexus_access_token');
    response.cookies.delete('nexus_token');
    return response;
  }

  // 7. Platform SuperAdmin Host & Route Authorization
  if (
    hostContext.type === 'PLATFORM' ||
    pathname.startsWith('/superadmin') ||
    pathname.startsWith('/platform')
  ) {
    if (!payload?.is_superadmin) {
      const forbiddenUrl = new URL('/403', request.url);
      return NextResponse.redirect(forbiddenUrl);
    }

    if (pathname === '/' || pathname === '/dashboard') {
      const url = request.nextUrl.clone();
      url.pathname = '/superadmin';
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }
  }

  // 8. Clean URL Rewriting by Host Context
  const url = request.nextUrl.clone();

  // A. Organization Admin & Workspace Routes (e.g. matrix.localhost:3000/* or matrix.nexusrag.app/*)
  if (hostContext.type === 'ORGANIZATION') {
    // 1. Organization Admin Explicit Routes (/org-admin/* or /admin/*)
    if (pathname.startsWith('/org-admin') || pathname.startsWith('/admin')) {
      const subAdminPath = pathname.startsWith('/org-admin')
        ? pathname.slice('/org-admin'.length)
        : pathname.slice('/admin'.length);
      const targetSub = subAdminPath || '';
      url.pathname = `/org-admin${targetSub}`;
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    // 2. Direct Clean Admin Routes (e.g. /dashboard, /users, /departments, /roles, etc.)
    const directOrgAdminRoutes: Record<string, string> = {
      '/dashboard': '/org-admin/overview',
      '/users': '/org-admin/users',
      '/departments': '/org-admin/departments',
      '/roles': '/org-admin/access',
      '/permissions': '/org-admin/access',
      '/access': '/org-admin/access',
      '/domains': '/org-admin/domains',
      '/modules': '/org-admin/modules',
      '/capabilities': '/org-admin/modules',
      '/feature-flags': '/org-admin/modules',
      '/documents': '/org-admin/knowledge',
      '/knowledge': '/org-admin/knowledge',
      '/nexus': '/org-admin/nexus',
      '/settings': '/org-admin/settings',
      '/settings/organization': '/org-admin/settings',
      '/teams': '/org-admin/teams',
      '/invitations': '/org-admin/invitations',
      '/workflows': '/org-admin/workflows',
      '/security': '/org-admin/security',
      '/analytics': '/org-admin/analytics',
      '/integrations': '/org-admin/integrations',
      '/workspace': '/workspace',
    };

    const directMatch = directOrgAdminRoutes[pathname];
    if (directMatch) {
      url.pathname = directMatch;
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    // 3. Organization Root (/) -> Dynamic landing based on backend admin flag
    if (pathname === '/') {
      const isOrgAdminUser = Boolean(payload?.is_org_admin || payload?.is_superadmin);
      url.pathname = isOrgAdminUser ? '/org-admin/overview' : '/workspace';
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }
  }

  // B. Department Hostname Application Routes (hr.matrix.localhost:3000/*, finance.matrix.localhost:3000/*)
  if (hostContext.type === 'DEPARTMENT') {
    // Dynamic access check from backend JWT claims (is_org_admin, is_superadmin, allowed_departments, department_slug)
    const isSuperOrOrgAdmin = Boolean(payload?.is_org_admin || payload?.is_superadmin);

    const matchesDept = (deptSlug?: string) => {
      if (!deptSlug || !hostContext.departmentSlug) return false;
      const cleanA = deptSlug.toLowerCase().replace(/-dept$/, '');
      const cleanB = hostContext.departmentSlug.toLowerCase().replace(/-dept$/, '');
      return cleanA === cleanB || deptSlug.toLowerCase() === hostContext.departmentSlug.toLowerCase();
    };

    const isAuthorizedForDept =
      isSuperOrOrgAdmin ||
      payload?.allowed_departments?.includes('*') ||
      (hostContext.departmentSlug && payload?.allowed_departments?.some((d) => matchesDept(d))) ||
      matchesDept(payload?.department_slug);

    if (!isAuthorizedForDept) {
      // User is logged in to this organization, but NOT permitted in this specific department
      const forbiddenUrl = new URL('/403', request.url);
      return NextResponse.redirect(forbiddenUrl);
    }

    if (pathname === '/' || pathname === '/dashboard') {
      url.pathname = '/department/dashboard';
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    // Clean module path rewrite (e.g. hr.matrix.localhost:3000/leave/pending -> /department/leave/pending)
    url.pathname = `/department${pathname}`;
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|_next/hmr|_next/webpack-hmr|favicon.ico).*)'],
};
