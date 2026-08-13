export const AUTOMATION_QUEUE = 'automations';
export const WHATSAPP_QUEUE = 'whatsapp-outbound';

export type AutomationJobName = 'run-execution';
export type WhatsappJobName = 'send-text';

export type RunExecutionJob = {
  executionId: string;
};

/** Envio outbound rate-limited (automações e campanhas). */
export type SendWhatsappJob = {
  companyId: string;
  to: string;
  text: string;
  /** Se presente, atualiza AutomationExecution ao concluir. */
  executionId?: string;
};

/** ~5 msgs/s no worker; gap mínimo entre envios da mesma empresa. */
export const WHATSAPP_WORKER_LIMITER = { max: 5, duration: 1000 } as const;
export const WHATSAPP_COMPANY_GAP_MS = 1_200;
