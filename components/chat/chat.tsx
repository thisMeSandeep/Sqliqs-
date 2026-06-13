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
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
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
import { MessageSquareIcon } from "lucide-react";
import { ResultTable } from "./result-table";

const suggestions = [
  "How many employees are in each department?",
  "What's the average salary by department?",
  "Which projects are still active?",
];

function firstUserText(messages: ChatUIMessage[]): string | undefined {
  const first = messages.find((m) => m.role === "user");
  const text = first?.parts.find((p) => p.type === "text");
  return text && "text" in text ? text.text : undefined;
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
  const transport = useMemo(
    () => new DefaultChatTransport<ChatUIMessage>({ api: "/api/chat", body: toRequestBody(config) }),
    [config]
  );
  const { messages, sendMessage, status } = useChat<ChatUIMessage>({
    id: session?.id,
    messages: (session?.messages as ChatUIMessage[]) ?? [],
    transport,
  });

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

  return (
    <div className="flex h-full flex-col">
      <Conversation>
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquareIcon className="size-6" />}
              title="Ask the sample database"
              description="Query employees, departments, projects, and assignments in plain English."
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
            messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    const key = `${message.id}-${i}`;

                    if (part.type === "text") {
                      return <MessageResponse key={key}>{part.text}</MessageResponse>;
                    }

                    if (part.type === "reasoning") {
                      return (
                        <Reasoning
                          key={key}
                          className="w-full"
                          isStreaming={part.state === "streaming"}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    }

                    if (part.type === "tool-run_query") {
                      const sql =
                        part.state === "input-available" || part.state === "output-available"
                          ? part.input.sql
                          : undefined;
                      return (
                        <Tool key={key} defaultOpen={false}>
                          <ToolHeader type="tool-run_query" state={part.state} title="SQL query" />
                          <ToolContent>
                            {sql && (
                              <div className="p-3">
                                <CodeBlock code={sql} language="sql" />
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
                  })}
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="px-4 pb-4">
        <PromptInput
          onSubmit={(message) => submit(message.text)}
        >
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the sample database…"
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
