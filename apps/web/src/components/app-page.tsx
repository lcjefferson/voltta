import { Card } from "@/components/ui/card";

export function PageTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div>{eyebrow && <p className="text-xs font-bold tracking-[.18em] text-[#9b7a44]">{eyebrow}</p>}<h1 className="mt-1 font-display text-4xl">{title}</h1></div>{children}</div>;
}
export function EmptyPanel({ title, text }: { title: string; text: string }) { return <Card className="py-12 text-center"><h2 className="font-bold">{title}</h2><p className="mt-2 text-sm text-neutral-500">{text}</p></Card>; }
