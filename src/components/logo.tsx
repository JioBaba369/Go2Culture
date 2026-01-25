import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
      <span className="font-sans text-2xl font-extrabold text-primary-foreground">
        Go2Culture
      </span>
    </Link>
  );
}
