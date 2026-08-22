"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SetupProgress } from "@/lib/help";
import { isTourDoneLocally } from "@/lib/tour-storage";
import { useAuthStore } from "@/lib/auth-store";

type OnboardingSetting = {
  completed?: boolean;
  tourCompletedAt?: string;
  skipped?: boolean;
};

type Company = {
  phone?: string | null;
  logoUrl?: string | null;
};

type Service = { id: string };
type CustomersResponse = { total?: number; data?: unknown[] };
type Connection = { connected?: boolean; status?: string };
type Appointment = { id: string };

export function useOnboardingSetting(opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["onboarding"],
    queryFn: () => api<OnboardingSetting>("/company/onboarding"),
    staleTime: 15_000,
    enabled: opts?.enabled !== false,
  });
}

export function useSetupProgress() {
  const companyId = useAuthStore((s) => s.user?.companyId);
  const onboarding = useOnboardingSetting();
  const company = useQuery({
    queryKey: ["company"],
    queryFn: () => api<Company>("/company"),
    staleTime: 30_000,
  });
  const services = useQuery({
    queryKey: ["services"],
    queryFn: () => api<Service[]>("/services"),
    staleTime: 30_000,
  });
  const customers = useQuery({
    queryKey: ["customers", 1],
    queryFn: () => api<CustomersResponse>("/customers?page=1&limit=1"),
    staleTime: 30_000,
  });
  const whatsapp = useQuery({
    queryKey: ["whatsapp-connection"],
    queryFn: () => api<Connection>("/whatsapp/connection"),
    staleTime: 15_000,
  });
  const appointments = useQuery({
    queryKey: ["appointments", "setup-check"],
    queryFn: () =>
      api<Appointment[]>(
        `/appointments?from=${new Date("2020-01-01").toISOString()}&to=${new Date("2100-01-01").toISOString()}`,
      ),
    staleTime: 30_000,
  });

  const progress: SetupProgress = {
    tourCompleted:
      Boolean(onboarding.data?.completed) || isTourDoneLocally(companyId),
    hasPhoneOrLogo: Boolean(company.data?.phone || company.data?.logoUrl),
    hasService: (services.data?.length || 0) > 0,
    hasCustomer:
      (customers.data?.total || customers.data?.data?.length || 0) > 0,
    hasAppointment: (appointments.data?.length || 0) > 0,
    whatsappConnected: Boolean(
      whatsapp.data?.connected || whatsapp.data?.status === "CONNECTED",
    ),
  };

  return {
    progress,
    onboarding: onboarding.data,
    isLoading:
      onboarding.isLoading ||
      company.isLoading ||
      services.isLoading ||
      customers.isLoading ||
      whatsapp.isLoading ||
      appointments.isLoading,
  };
}
