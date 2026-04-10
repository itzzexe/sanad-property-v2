"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, LayoutDashboard, CreditCard, 
  TrendingUp, MoreHorizontal 
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_MENU = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Properties", href: "/dashboard/properties", icon: Building2 },
  { name: "Finance", href: "/dashboard/finance", icon: TrendingUp },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "More", href: "#", icon: MoreHorizontal },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 lg:hidden shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)] pb-safe">
      <div className="flex items-center justify-around h-16 relative">
        {MOBILE_MENU.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all relative overflow-hidden",
                isActive ? "text-primary-600" : "text-neutral-400"
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary-500 rounded-b-full shadow-[0_0_10px_0_rgba(79,70,229,0.3)] animate-in slide-in-from-top-1" />
              )}
              <item.icon className={cn("w-5 h-5", isActive && "scale-110")} />
              <span className={cn("text-[10px] font-bold uppercase tracking-tight", isActive && "text-primary-700")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
