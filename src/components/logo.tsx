import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <UtensilsCrossed className="h-6 w-6 shrink-0" />
      <div>
        <span className="font-sans text-2xl font-extrabold leading-tight">
          Go2Culture
        </span>
        <p className="text-xs opacity-80 hidden sm:block -mt-1">Experience Authentic Food & Culture.</p>
      </div>
    </Link>
  );
}
