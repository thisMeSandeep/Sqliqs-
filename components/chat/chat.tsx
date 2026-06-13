"use client";

import { useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { ChatUIMessage } from "@/lib/ai/agent";
import type { ConnectionConfig } from "@/lib/ai/types";
import { toRequestBody } from "@/lib/ai/request";
import { saveSession } from "@/lib/store/history";
import type { Session } from "@/lib/store/db";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Tool, ToolContent, ToolHeader } from "@/components/ai-elements/tool";
import { CodeBlock } from "@/components/ai-elements/code-block";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckIcon,
  CopyIcon,
  MessageSquareIcon,
  PencilIcon,
  RotateCcwIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { ResultTable } from "./result-table";

// Generic, schema-agnostic prompts — they work against any connected database
// (the model reads the live schema), so they're not tied to the sample data.
const suggestions = [
  "What tables are in this database?",
  "Give me a high-level summary of the data",
  "Which table has the most rows?",
];

function firstUserText(messages: ChatUIMessage[]): string | undefined {
  const first = messages.find((m) => m.role === "user");
  const text = first?.parts.find((p) => p.type === "text");
  return text && "text" in text ? text.text : undefined;
}

// Concatenate the text parts of a message — used for copy and edit.
function messageText(message: ChatUIMessage): string {
  return message.parts
    .filter((p) => p.type === "text")
    .map((p) => ("text" in p ? p.text : ""))
    .join("");
}

// Turn raw provider/SDK errors into one plain sentence the user can act on,
// instead of leaving them staring at a hung, half-finished reply.
function friendlyError(error: Error): string {
  const m = (error.message ?? "").toLowerCase();
  if (m.includes("rate limit") || m.includes("429") || m.includes("quota") || m.includes("too many requests"))
    return "The model is busy or rate-limited right now. Wait a moment and try again.";
  if (m.includes("context") && (m.includes("length") || m.includes("window") || m.includes("maximum") || m.includes("token")))
    return "This conversation got too long for the model. Start a new chat or ask a shorter question.";
  if (m.includes("max_tokens") || (m.includes("output") && m.includes("token")))
    return "The response was cut off because it hit the token limit. Try asking for less, then try again.";
  if (m.includes("api key") || m.includes("unauthor") || m.includes("401") || (m.includes("invalid") && m.includes("key")))
    return "The API key looks invalid or missing. Check the model & key in this project's settings.";
  if (m.includes("network") || m.includes("fetch failed") || m.includes("timeout"))
    return "Couldn't reach the model. Check your connection and try again.";
  return "Something went wrong generating a response. Please try again.";
}

// config is omitted in the playground (server falls back to the sample DB +
// free model) and provided by a project. When a `session` is passed (project
// mode) the thread is persisted to IndexedDB; remount via key on session switch.
export function Chat({
  config,
  session,
  onPersisted,
}: {
  config?: ConnectionConfig;
  session?: Session;
  onPersisted?: () => void;
}) {
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const transport = useMemo(
    () => new DefaultChatTransport<ChatUIMessage>({ api: "/api/chat", body: toRequestBody(config) }),
    [config]
  );
  const { messages, sendMessage, status, error, regenerate, setMessages } = useChat<ChatUIMessage>({
    id: session?.id,
    messages: (session?.messages as ChatUIMessage[]) ?? [],
    transport,
  });

  const busy = status === "submitted" || status === "streaming";
  const lastId = messages.at(-1)?.id;

  // Persist the thread after each completed turn (project mode only).
  useEffect(() => {
    if (!session || status !== "ready" || messages.length === 0) return;
    saveSession({
      ...session,
      title: firstUserText(messages) ?? session.title,
      messages,
    }).then(() => onPersisted?.());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, messages]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  // Editing a user message resends it: drop that message and everything after,
  // then send the edited text as a fresh turn.
  function saveEdit() {
    const trimmed = editText.trim();
    const idx = messages.findIndex((m) => m.id === editingId);
    if (idx === -1 || !trimmed) return setEditingId(null);
    setMessages(messages.slice(0, idx));
    sendMessage({ text: trimmed });
    setEditingId(null);
  }

  return (
    <div className="flex h-full flex-col">
      <Conversation>
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquareIcon className="size-6" />}
              title="Ask your data"
              description="Ask questions about your connected database in plain English."
            >
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="rounded-full border px-3 py-1 text-sm text-muted-foreground hover:bg-muted"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((message) => {
              const isUser = message.role === "user";
              const isAssistant = message.role === "assistant";
              const editing = editingId === message.id;

              return (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {/* Edit mode for a user message */}
                    {editing ? (
                      <div className="flex w-full flex-col gap-2">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveEdit();
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="min-h-20 bg-background"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={saveEdit} disabled={!editText.trim()}>
                            Send
                          </Button>
                        </div>
                      </div>
                    ) : (
                      message.parts.map((part, i) => {
                        const key = `${message.id}-${i}`;

                        if (part.type === "text") {
                          return <MessageResponse key={key}>{part.text}</MessageResponse>;
                        }

                        if (part.type === "reasoning") {
                          // Collapsed even while streaming (like ChatGPT/Claude):
                          // a "Thinking…" pill, so the reasoning text is never
                          // mistaken for the answer.
                          return (
                            <Reasoning
                              key={key}
                              className="w-full"
                              defaultOpen={false}
                              isStreaming={part.state === "streaming"}
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>{part.text}</ReasoningContent>
                            </Reasoning>
                          );
                        }

                        if (part.type === "tool-run_query") {
                          const isMongo = config?.kind === "mongodb";
                          const query =
                            part.state === "input-available" || part.state === "output-available"
                              ? part.input.query
                              : undefined;
                          return (
                            <Tool key={key} defaultOpen={false}>
                              <ToolHeader
                                type="tool-run_query"
                                state={part.state}
                                title={isMongo ? "Query" : "SQL query"}
                              />
                              <ToolContent>
                                {query && (
                                  <div className="p-3">
                                    <CodeBlock code={query} language={isMongo ? "json" : "sql"} />
                                  </div>
                                )}
                                {part.state === "output-available" && (
                                  <div className="space-y-2 p-3 pt-0">
                                    <ResultTable rows={part.output.rows} />
                                    {part.output.truncated && (
                                      <p className="text-muted-foreground text-xs">
                                        Showing the first {part.output.rowCount} rows (result was
                                        truncated).
                                      </p>
                                    )}
                                  </div>
                                )}
                                {part.state === "output-error" && (
                                  <p className="p-3 text-destructive text-sm">{part.errorText}</p>
                                )}
                              </ToolContent>
                            </Tool>
                          );
                        }

                        return null;
                      })
                    )}
                  </MessageContent>

                  {/* Hover actions: copy / edit (user), copy / try again (assistant) */}
                  {!editing && (
                    <MessageActions
                      className={cnActions(isUser)}
                    >
                      <CopyButton text={messageText(message)} />
                      {isUser && (
                        <MessageAction
                          tooltip="Edit"
                          onClick={() => {
                            setEditingId(message.id);
                            setEditText(messageText(message));
                          }}
                        >
                          <PencilIcon className="size-3.5" />
                        </MessageAction>
                      )}
                      {isAssistant && message.id === lastId && !busy && (
                        <MessageAction tooltip="Try again" onClick={() => regenerate()}>
                          <RotateCcwIcon className="size-3.5" />
                        </MessageAction>
                      )}
                    </MessageActions>
                  )}
                </Message>
              );
            })
          )}

          {/* Plain-language error + retry, instead of a silent hang */}
          {error && (
            <div className="mx-auto flex w-full max-w-2xl items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div className="flex-1">
                <p className="text-foreground">{friendlyError(error)}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => regenerate()}>
                <RotateCcwIcon className="size-4" /> Try again
              </Button>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="px-4 pb-4">
        <PromptInput onSubmit={(message) => submit(message.text)}>
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your data…"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <div />
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

// Actions reveal on hover; aligned right for the user's own (right-aligned) bubble.
function cnActions(isUser: boolean): string {
  return [
    "opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100",
    isUser ? "justify-end" : "justify-start",
  ].join(" ");
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <MessageAction
      tooltip={copied ? "Copied" : "Copy"}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
    </MessageAction>
  );
}
