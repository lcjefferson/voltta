"use client";

import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  /** Label opcional, ex.: "clientes" */
  noun?: string;
};

export function ListPagination({
  page,
  limit,
  total,
  onPageChange,
  noun = "itens",
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (total <= limit && page <= 1) return null;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-neutral-500">
        {from}–{to} de {total} {noun}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-9 px-3 text-xs"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <span className="min-w-16 text-center text-sm text-neutral-600">
          {page}/{totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          className="h-9 px-3 text-xs"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
