import { Card } from "@/components/ui/card";

export function PageTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-bold tracking-[.18em] text-[#9b7a44] sm:text-xs">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 font-display text-[clamp(1.55rem,6.2vw,2.25rem)] leading-[1.05] break-words">
          {title}
        </h1>
      </div>
      {children ? (
        <div className="flex w-full min-w-0 flex-wrap gap-2 sm:w-auto sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function EmptyPanel({ title, text }: { title: string; text: string }) {
  return (
    <Card className="py-12 text-center">
      <h2 className="font-bold">{title}</h2>
      <p className="mt-2 text-sm text-neutral-500">{text}</p>
    </Card>
  );
}
