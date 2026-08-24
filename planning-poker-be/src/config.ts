import { DEFAULT_MAX_PARTICIPANTS } from "./contracts.js";

export type RuntimeConfig = {
  host: string;
  port: number;
  allowedOrigins: string[];
  maxParticipants: number;
  maxHttpBufferBytes: number;
  roomTtlMs: number;
  cleanupIntervalMs: number;
  sessionTtlMs: number;
  recoveryMaxDisconnectionMs: number;
};

const parseInteger = (
  value: string | undefined,
  fallback: number,
  name: string,
  minimum: number,
): number => {
  if (value === undefined || value.trim() === "") return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum) {
    throw new Error(
      `${name} must be an integer greater than or equal to ${minimum}.`,
    );
  }
  return parsed;
};

export const loadRuntimeConfig = (
  environment: NodeJS.ProcessEnv = process.env,
): RuntimeConfig => {
  const production = environment.NODE_ENV === "production";
  const configuredOrigins = environment.PP_ALLOWED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (production && (!configuredOrigins || configuredOrigins.length === 0)) {
    throw new Error("PP_ALLOWED_ORIGINS is required in production.");
  }
  if (production && configuredOrigins?.includes("*")) {
    throw new Error("PP_ALLOWED_ORIGINS cannot contain '*' in production.");
  }

  return {
    host: environment.PP_HOST?.trim() || "127.0.0.1",
    port: parseInteger(environment.PP_PORT, 3000, "PP_PORT", 0),
    allowedOrigins: configuredOrigins ?? [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    maxParticipants: parseInteger(
      environment.PP_MAX_PARTICIPANTS,
      DEFAULT_MAX_PARTICIPANTS,
      "PP_MAX_PARTICIPANTS",
      2,
    ),
    maxHttpBufferBytes: parseInteger(
      environment.PP_MAX_HTTP_BUFFER_BYTES,
      100_000,
      "PP_MAX_HTTP_BUFFER_BYTES",
      1_024,
    ),
    roomTtlMs: parseInteger(
      environment.PP_ROOM_TTL_MS,
      3_600_000,
      "PP_ROOM_TTL_MS",
      1_000,
    ),
    cleanupIntervalMs: parseInteger(
      environment.PP_CLEANUP_INTERVAL_MS,
      60_000,
      "PP_CLEANUP_INTERVAL_MS",
      100,
    ),
    sessionTtlMs: parseInteger(
      environment.PP_SESSION_TTL_MS,
      120_000,
      "PP_SESSION_TTL_MS",
      1_000,
    ),
    recoveryMaxDisconnectionMs: parseInteger(
      environment.PP_RECOVERY_MAX_DISCONNECTION_MS,
      120_000,
      "PP_RECOVERY_MAX_DISCONNECTION_MS",
      1_000,
    ),
  };
};
