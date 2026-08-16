import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  title?: string;
  body?: string;
  label: string;
  href: string;
};

export function BlogCta({
  title = "Quer agenda e WhatsApp no automático?",
  body = "A VOLTTA organiza horários, confirma clientes e dispara retornos — para barbearias, salões e estética. 7 dias grátis.",
  label,
  href,
}: Props) {
  return (
    <aside className="my-10 rounded-xl border border-[#c4a574]/40 bg-[#211f1b] p-6 text-white sm:p-8">
      <p className="text-xs font-bold tracking-[.2em] text-[#c4a574]">
        VOLTTA™
      </p>
      <h2 className="mt-3 font-display text-2xl leading-tight sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
        {body}
      </p>
      <Link href={href} className="mt-6 inline-block w-full sm:w-auto">
        <Button className="h-11 w-full px-6 sm:w-auto">
          {label}
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </Link>
    </aside>
  );
}
