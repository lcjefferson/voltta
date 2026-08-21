import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full min-w-0 rounded-md border border-neutral-300 bg-white px-3 text-base outline-none transition placeholder:text-neutral-400 focus:border-[#c4a574] focus:ring-2 focus:ring-[#c4a574]/20",
        className,
      )}
      {...props}
    />
  );
}
