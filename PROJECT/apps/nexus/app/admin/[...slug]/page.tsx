'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminCatchAllRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const target = pathname ? pathname.replace(/^\/admin/, '/superadmin') : '/superadmin/dashboard';
    router.replace(target);
  }, [pathname, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="animate-pulse font-mono text-sm tracking-wider text-cyan-400">
        REDIRECTING TO CANONICAL NEXUS SUPERADMIN...
      </div>
    </div>
  );
}
