import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <UtensilsCrossed className="h-6 w-6 text-[#F20024]" />
      <span className="font-sans text-2xl font-extrabold text-foreground">
        Go2Culture
      </span>
    </Link>
  );
}
