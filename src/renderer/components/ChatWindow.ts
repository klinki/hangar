import type { Session } from "../../common/types";

export class ChatWindow {
  private readonly root: HTMLElement;

  constructor() {
    this.root = document.createElement("section");
    this.root.className = "chat-window";
  }

  mount(parent: HTMLElement): HTMLElement {
    parent.appendChild(this.root);
    return this.root;
  }

  setSession(session: Session | undefined): void {
    this.root.replaceChildren();

    if (!session) {
      const empty = document.createElement("div");
      empty.className = "chat-window__empty";
      empty.textContent = "Select a session from the tree to view its read-only transcript.";
      this.root.appendChild(empty);
      return;
    }

    if (session.messages.length === 0) {
      const empty = document.createElement("div");
      empty.className = "chat-window__empty";
      empty.textContent = "This session exists, but no transcript messages were found.";
      this.root.appendChild(empty);
      return;
    }

    const messages = document.createElement("div");
    messages.className = "chat-window__messages";

    for (const message of session.messages) {
      const bubble = document.createElement("article");
      bubble.className = `chat-message chat-message--${message.role}`;

      const meta = document.createElement("div");
      meta.className = "chat-message__meta";

      const role = document.createElement("span");
      role.className = "chat-message__role";
      role.textContent = message.role;

      const timestamp = document.createElement("span");
      timestamp.textContent = message.timestamp ? formatTimestamp(message.timestamp) : session.timestamp;

      meta.append(role, timestamp);

      const content = document.createElement("div");
      content.className = "chat-message__content";
      content.textContent = message.content;

      bubble.append(meta, content);
      messages.appendChild(bubble);
    }

    const header = document.createElement("header");
    header.className = "main-panel__header";

    const title = document.createElement("h2");
    title.className = "main-panel__title";
    title.textContent = session.title;

    const subtitle = document.createElement("p");
    subtitle.className = "main-panel__subtitle";
    subtitle.textContent = `Session ${session.id} • ${formatTimestamp(session.timestamp)} • ${session.messages.length} message${session.messages.length === 1 ? "" : "s"}`;

    header.append(title, subtitle);
    this.root.append(header, messages);
  }

  setError(message: string): void {
    this.root.replaceChildren();
    const error = document.createElement("div");
    error.className = "chat-window__error";
    error.textContent = message;
    this.root.appendChild(error);
  }
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

