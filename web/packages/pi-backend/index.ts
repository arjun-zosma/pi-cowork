import type {
  AutoNameResponse,
  CapabilitiesResponse,
  HealthResponse,
  ListSessionsInput,
  SessionContext,
  SessionDetailsResponse,
  SessionIdInput,
  SessionMutationResponse,
  SessionsResponse,
  UpdateSessionInput,
} from "./contracts";
import {
  autoNameSession as autoNameSessionFromServices,
  deleteSession as deleteSessionFromServices,
  getSessionContext as getSessionContextFromServices,
  getSessionDetails as getSessionDetailsFromServices,
  getSessionThinking as getSessionThinkingFromServices,
  listSessions as listSessionsFromServices,
  renameSession as renameSessionFromServices,
} from "./sessions";
import { getRuntimeManager } from "../../lib/runtime-state";
import type { RuntimeManager } from "./runtime-manager";

export type * from "./contracts";
export { BACKEND_ERROR_CODES, BackendError, isBackendError } from "./errors";

export interface PiBackend {
  getHealth(): Promise<HealthResponse>;
  getCapabilities(): Promise<CapabilitiesResponse>;
  listSessions(input?: ListSessionsInput): Promise<SessionsResponse>;
  getSessionDetails(
    input: SessionIdInput & { deferThinking?: boolean; deferMedia?: boolean },
  ): Promise<SessionDetailsResponse>;
  getSessionContext(
    input: SessionIdInput & { leafId?: string; deferThinking?: boolean; deferMedia?: boolean },
  ): Promise<SessionContext>;
  renameSession(input: UpdateSessionInput): Promise<SessionMutationResponse>;
  deleteSession(input: SessionIdInput): Promise<SessionMutationResponse>;
  autoNameSession(input: SessionIdInput): Promise<AutoNameResponse>;
  getSessionThinking(
    input: SessionIdInput & { entryId: string; blockIndex: number },
  ): Promise<{ thinking: string }>;
}

export interface CreatePiBackendOptions {
  piVersion: string;
  /** Injectable for tests; defaults to the process-wide runtime manager. */
  runtime?: RuntimeManager;
}

export function createPiBackend(options: CreatePiBackendOptions): PiBackend {
  const runtime = () => options.runtime ?? getRuntimeManager();
  return {
    async getHealth() {
      return {
        status: "ok",
        apiVersion: "v1",
        piVersion: options.piVersion,
      };
    },

    async getCapabilities() {
      return {
        apiVersion: "v1",
        commandTransports: ["http"],
        eventTransports: ["sse"],
        features: {
          concurrentSessions: true,
          prompt: true,
          abort: true,
          steering: true,
          followUp: true,
          sessionBranches: true,
          bash: true,
          extensions: true,
        },
      };
    },

    async listSessions(input = {}) {
      return listSessionsFromServices(input, runtime());
    },
    async getSessionDetails(input) {
      return getSessionDetailsFromServices(input, runtime());
    },
    async getSessionContext(input) {
      return getSessionContextFromServices(input, runtime());
    },
    async renameSession(input) {
      return renameSessionFromServices(input);
    },
    async deleteSession(input) {
      return deleteSessionFromServices(input, runtime());
    },
    async autoNameSession(input) {
      return autoNameSessionFromServices(input, runtime());
    },
    getSessionThinking(input) {
      return getSessionThinkingFromServices(input);
    },
  };
}
