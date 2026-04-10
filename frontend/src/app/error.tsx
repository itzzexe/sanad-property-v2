"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-danger-bg rounded-full flex items-center justify-center mb-8">
        <AlertTriangle className="w-12 h-12 text-danger" />
      </div>
      <h1 className="text-4xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight">Something went wrong</h1>
      <p className="text-neutral-400 font-medium mt-4 max-w-md">
        An unexpected error occurred while processing your request. Our team has been notified.
      </p>
      
      {error.digest && (
        <code className="mt-4 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-mono text-neutral-500">
          Error ID: {error.digest}
        </code>
      )}

      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Button onClick={() => reset()} className="h-12 px-8 font-black">
          <RotateCcw className="w-4 h-4 mr-2" /> Try Again
        </Button>
        <Button variant="outline" className="h-12 px-8 font-black border-neutral-200">
          Contact Support
        </Button>
      </div>
    </div>
  );
}
