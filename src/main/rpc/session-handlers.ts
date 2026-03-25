import type { Session } from "../../common/types";
import { loadSessionHistory, type ExplorerOptions } from "../data/explorer";

export async function getSessionHistory(sessionId: string, options: ExplorerOptions = {}): Promise<Session | undefined> {
  return loadSessionHistory(sessionId, options);
}
