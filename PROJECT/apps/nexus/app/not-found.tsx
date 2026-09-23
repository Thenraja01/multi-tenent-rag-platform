import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto text-2xl font-bold font-mono">
          404
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Page Not Found</h1>
          <p className="text-xs text-slate-400 mt-1">
            The requested route does not exist or has been moved to another domain workspace.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button href="/" variant="primary" size="md" icon={<Home className="w-4 h-4" />}>
            Return Home
          </Button>
          <Button href="/dashboard" variant="outline" size="md">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
