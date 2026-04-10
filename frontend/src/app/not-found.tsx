"use client";

import Link from "next/link";
import { MoveLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-8 animate-bounce transition-all duration-1000">
        <HelpCircle className="w-12 h-12 text-primary-500" />
      </div>
      <h1 className="text-8xl font-black text-neutral-900 dark:text-neutral-50 tracking-tighter">404</h1>
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mt-4">Page not found</h2>
      <p className="text-neutral-400 font-medium mt-2 max-w-sm">
        The location you are looking for might have been moved or does not exist.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Button asChild variant="outline" className="h-12 px-8 font-black border-neutral-200">
          <Link href="/dashboard">
            <MoveLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
        </Button>
        <Button className="h-12 px-8 font-black">
          Contact Support
        </Button>
      </div>
    </div>
  );
}
