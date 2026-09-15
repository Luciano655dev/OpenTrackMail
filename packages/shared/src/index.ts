import { z } from "zod";

export const emailAddressSchema = z.string().trim().email().max(320);

export const createTrackedEmailSchema = z.object({
  subject: z.string().trim().max(998).default("(no subject)"),
  recipients: z.array(emailAddressSchema).min(1).max(100),
  provider: z.enum(["gmail", "outlook", "generic"]).default("gmail"),
  providerMessageId: z.string().trim().max(500).nullable().optional(),
  providerThreadId: z.string().trim().max(500).nullable().optional(),
  clientMessageId: z.string().uuid().optional(),
  sentAt: z.iso.datetime().optional(),
});

export const updateTrackedEmailSchema = z.object({
  providerMessageId: z.string().trim().max(500).nullable().optional(),
  providerThreadId: z.string().trim().max(500).nullable().optional(),
  sentAt: z.iso.datetime().optional(),
});

export const updateSettingsSchema = z.object({
  defaultTracking: z.boolean().optional(),
  openNotifications: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, "At least one setting is required");

export type CreateTrackedEmailInput = z.infer<typeof createTrackedEmailSchema>;

export type TrackedEmailSummary = {
  id: string;
  trackingId: string;
  provider: "gmail" | "outlook" | "generic";
  providerMessageId: string | null;
  providerThreadId: string | null;
  subject: string;
  recipients: string[];
  sentAt: string;
  openCount: number;
  firstOpenedAt: string | null;
  lastOpenedAt: string | null;
  status: "sent" | "opened";
};

export type OpenActivity = {
  id: string;
  detectedAt: string;
  isDuplicate: boolean;
};

export type ExtensionSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: { id: string; email: string };
};

export const API_ERROR_CODES = {
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  INVALID_INPUT: "invalid_input",
  NOT_FOUND: "not_found",
  RATE_LIMITED: "rate_limited",
  INTERNAL_ERROR: "internal_error",
} as const;
