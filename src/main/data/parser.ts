import type { Message, Session } from "../../common/types";

export interface ParseSessionOptions {
  sessionId: string;
  projectId: string;
  rawPath: string;
  modifiedAt: string;
}

export function parseSessionContent(rawContent: string, options: ParseSessionOptions): Session {
  const payload = rawContent.trim();
  const messages = parseMessages(payload);
  const title = deriveTitle(messages, options.sessionId, payload);

  return {
    id: options.sessionId,
    projectId: options.projectId,
    timestamp: options.modifiedAt,
    title,
    rawPath: options.rawPath,
    messages,
  };
}

function parseMessages(payload: string): Message[] {
  const jsonResult = tryParseJson(payload);
  if (jsonResult) {
    const jsonMessages = extractMessages(jsonResult);
    if (jsonMessages.length > 0) {
      return jsonMessages;
    }
  }

  const jsonLines = parseJsonLines(payload);
  if (jsonLines.length > 0) {
    return jsonLines;
  }

  return parseDelimitedText(payload);
}

function extractMessages(value: unknown): Message[] {
  const eventMessages = normalizeEventMessage(value);
  if (eventMessages.length > 0) {
    return eventMessages;
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => normalizeCandidateMessage(entry, index));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;
  const candidates = [record.messages, record.history, record.turns, record.conversation, record.items, record.entries, record.events];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      const messages = candidate.flatMap((entry, index) => normalizeCandidateMessage(entry, index));
      if (messages.length > 0) {
        return messages;
      }
    }
  }

  const content = getTextContent(record.content ?? record.text ?? record.message);
  if (content) {
    return [
      {
        role: "user",
        content,
      },
    ];
  }

  return [];
}

function normalizeCandidateMessage(candidate: unknown, index: number): Message[] {
  const eventMessages = normalizeEventMessage(candidate);
  if (eventMessages.length > 0) {
    return eventMessages;
  }

  if (typeof candidate === "string") {
    return [
      {
        role: index % 2 === 0 ? "user" : "assistant",
        content: candidate.trim(),
      },
    ];
  }

  if (!candidate || typeof candidate !== "object") {
    return [];
  }

  const record = candidate as Record<string, unknown>;
  const role = normalizeRole(
    getTextContent(record.role) ?? getTextContent(record.author) ?? getTextContent(record.sender) ?? getTextContent(record.type),
  );
  const content =
    getTextContent(record.content) ??
    getTextContent(record.text) ??
    getTextContent(record.message) ??
    getTextContent(record.body) ??
    stringifyContent(record.parts);

  if (!content) {
    return [];
  }

  return [
    {
      role,
      content,
      timestamp: getTextContent(record.timestamp) ?? getTextContent(record.createdAt) ?? getTextContent(record.time),
    },
  ];
}

function normalizeEventMessage(candidate: unknown): Message[] {
  if (!candidate || typeof candidate !== "object") {
    return [];
  }

  const record = candidate as Record<string, unknown>;
  const type = getTextContent(record.type);
  if (type !== "user.message" && type !== "assistant.message") {
    return [];
  }

  const data = record.data && typeof record.data === "object" ? (record.data as Record<string, unknown>) : record;
  const content =
    extractPlainText(data.content) ??
    extractPlainText(data.transformedContent) ??
    extractPlainText(data.message) ??
    extractPlainText(data.text) ??
    extractPlainText(data.body) ??
    extractPlainText(data.parts);

  if (!content) {
    return [];
  }

  return [
    {
      role: type === "assistant.message" ? "assistant" : "user",
      content,
      timestamp: getTextContent(record.timestamp) ?? getTextContent(data.timestamp),
    },
  ];
}

function parseJsonLines(payload: string): Message[] {
  if (!payload.includes("\n")) {
    return [];
  }

  const messages: Message[] = [];
  for (const line of payload.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    const parsed = tryParseJson(trimmed);
    if (!parsed) {
      continue;
    }

    messages.push(...extractMessages(parsed));
  }

  return messages;
}

function parseDelimitedText(payload: string): Message[] {
  const lines = payload.split(/\r?\n/);
  const messages: Message[] = [];
  let currentRole: Message["role"] | undefined;
  let buffer: string[] = [];

  const flush = () => {
    const content = buffer.join("\n").trim();
    if (!content) {
      buffer = [];
      return;
    }

    messages.push({
      role: currentRole ?? (messages.length % 2 === 0 ? "user" : "assistant"),
      content,
    });
    buffer = [];
  };

  for (const line of lines) {
    const marker = line.match(/^(user|assistant|copilot|you|me)\s*:\s*(.*)$/i);
    if (marker) {
      flush();
      currentRole = normalizeRole(marker[1]);
      if (marker[2]) {
        buffer.push(marker[2]);
      }
      continue;
    }

    buffer.push(line);
  }

  flush();

  return messages.length > 0
    ? messages
    : [
        {
          role: "user",
          content: payload,
        },
      ];
}

function tryParseJson(payload: string): unknown {
  try {
    return JSON.parse(payload);
  } catch {
    return undefined;
  }
}

function deriveTitle(messages: Message[], sessionId: string, payload: string): string {
  const firstUserMessage = messages.find((message) => message.role === "user")?.content?.trim();
  if (firstUserMessage) {
    return truncate(firstUserMessage, 72);
  }

  const firstAssistantMessage = messages.find((message) => message.role === "assistant")?.content?.trim();
  if (firstAssistantMessage) {
    return truncate(firstAssistantMessage, 72);
  }

  return truncate(sessionId || payload.replace(/\s+/g, " "), 72);
}

function truncate(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function normalizeRole(value: string): Message["role"] {
  const normalized = value.toLowerCase();
  if (normalized.includes("assistant") || normalized.includes("copilot")) {
    return "assistant";
  }

  return "user";
}

function getTextContent(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value.trim() || undefined;
  }

  if (typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") {
    return String(value);
  }

  return undefined;
}

function stringifyContent(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value.trim() || undefined;
  }

  if (Array.isArray(value)) {
    const pieces = value.flatMap((entry) => {
      if (typeof entry === "string") {
        return [entry];
      }

      if (entry && typeof entry === "object") {
        const record = entry as Record<string, unknown>;
        return [getTextContent(record.text) ?? getTextContent(record.content) ?? JSON.stringify(entry)];
      }

      return [String(entry)];
    });

    const normalized = pieces.filter(Boolean).join("\n").trim();
    return normalized || undefined;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return getTextContent(record.text) ?? getTextContent(record.content) ?? JSON.stringify(value);
  }

  return undefined;
}

function extractPlainText(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value.trim() || undefined;
  }

  if (typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const pieces = value.flatMap((entry) => {
      const text = extractPlainText(entry);
      return text ? [text] : [];
    });

    const normalized = pieces.join("\n").trim();
    return normalized || undefined;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return (
      extractPlainText(record.text) ??
      extractPlainText(record.content) ??
      extractPlainText(record.transformedContent) ??
      extractPlainText(record.message) ??
      extractPlainText(record.body) ??
      extractPlainText(record.parts)
    );
  }

  return undefined;
}
