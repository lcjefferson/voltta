"use client";

import { PageTitle } from "@/components/app-page";
import { SetupGuide } from "@/components/setup-guide";

export default function OnboardingPage() {
  return (
    <>
      <PageTitle
        eyebrow="PRIMEIROS PASSOS"
        title="VAMOS COLOCAR A VOLTTA PRA RODAR."
      />
      <div className="max-w-2xl">
        <SetupGuide />
      </div>
    </>
  );
}
