import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "default", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost" }) {
  return <button className={cn("inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-bold tracking-wide transition hover:-translate-y-0.5 disabled:opacity-50", variant === "default" && "bg-[#c4a574] text-[#171715] hover:bg-[#d6b887]", variant === "outline" && "border border-current bg-transparent hover:bg-black/5", variant === "ghost" && "hover:bg-black/5", className)} {...props} />;
}
