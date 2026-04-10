"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionProps {
  href: string;
  label?: string;
}

export function FloatingAction({ href, label }: FloatingActionProps) {
  return (
    <Link 
      href={href}
      className={cn(
        "fixed bottom-24 right-4 z-40 lg:hidden",
        "w-14 h-14 rounded-full bg-primary-500 text-white shadow-xl shadow-primary-500/30",
        "flex items-center justify-center transition-all active:scale-90 hover:scale-105"
      )}
      title={label}
    >
      <Plus className="w-6 h-6" />
    </Link>
  );
}
