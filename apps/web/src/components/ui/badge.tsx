import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center rounded-full bg-[#c4a574]/15 px-2.5 py-1 text-xs font-bold text-[#80622f]", className)} {...props} />;
}
