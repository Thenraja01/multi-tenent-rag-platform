/**
 * Utility for cross-subdomain and platform root URL resolution.
 */

export function getPlatformRootUrl(path: string = '/'): string {
  if (typeof window === 'undefined') {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return cleanPath;
  }

  const { protocol, host, port } = window.location;
  const currentHost = host.split(':')[0].toLowerCase();

  const configuredBaseDomain = (
    process.env.NEXT_PUBLIC_APP_DOMAIN ||
    process.env.NEXT_PUBLIC_TENANT_BASE_DOMAIN ||
    'localfix.app'
  ).toLowerCase().split(':')[0].trim();

  const baseDomains = [
    configuredBaseDomain,
    'localfix.app',
    'nexusrag.com',
    'nexusrag.local',
    'nip.io',
    'localhost',
    '127.0.0.1',
  ];

  let targetBase = currentHost;
  for (const base of baseDomains) {
    if (currentHost.endsWith(`.${base}`)) {
      targetBase = base;
      break;
    }
  }

  const portSuffix = port ? `:${port}` : '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${protocol}//${targetBase}${portSuffix}${cleanPath}`;
}

export function navigateToPlatform(path: string = '/'): void {
  const targetUrl = getPlatformRootUrl(path);
  if (typeof window !== 'undefined') {
    window.location.href = targetUrl;
  }
}
