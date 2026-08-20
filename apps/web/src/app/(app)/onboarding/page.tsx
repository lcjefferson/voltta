import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/app-page";

const steps = [
  ["Complete os dados do seu negócio", "/configuracoes", true],
  ["Cadastre seus serviços", "/servicos", false],
  ["Adicione seus primeiros clientes", "/clientes", false],
  ["Conecte seu WhatsApp", "/whatsapp", false],
  ["Crie sua primeira automação", "/automacoes", false],
] as const;

export default function OnboardingPage() {
  return (
    <>
      <PageTitle
        eyebrow="PRIMEIROS PASSOS"
        title="VAMOS COLOCAR A VOLTTA PRA RODAR."
      />
      <Card className="max-w-2xl">
        <p className="text-sm text-neutral-500">
          Faça estes passos para começar a reconquistar clientes — seja
          barbearia, salão ou estética.
        </p>
        <div className="mt-7 space-y-2">
          {steps.map(([label, href, done]) => (
            <Link
              href={href}
              key={label}
              className="flex min-w-0 items-center gap-3 rounded-lg p-3 hover:bg-neutral-50"
            >
              {done ? (
                <CheckCircle2 className="size-5 shrink-0 text-[#a58450]" />
              ) : (
                <Circle className="size-5 shrink-0 text-neutral-300" />
              )}
              <span
                className={
                  done
                    ? "min-w-0 text-neutral-400 line-through"
                    : "min-w-0 font-semibold"
                }
              >
                {label}
              </span>
            </Link>
          ))}
        </div>
      </Card>
    </>
  );
}
