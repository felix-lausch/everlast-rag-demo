"use client";

import { useChat } from "@ai-sdk/react";
import { isTextUIPart } from "ai";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { cn } from "@/lib/utils";
import RecipeTile from "@/components/RecipeTile";
import RecipePanel from "@/components/RecipePanel";
import type { RecipeTile as RecipeTileType } from "@/lib/supabase/recipes";

interface RecipeCardData {
  id: string;
  name: string;
  photo_urls: string[];
}

const STORAGE_KEY = "chat-messages";

export default function Chat() {
  const { messages, sendMessage, setMessages, status } = useChat();
  const [input, setInput] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setMessages(JSON.parse(stored)); } catch { localStorage.removeItem(STORAGE_KEY); }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <div className="flex h-full">
      <div className={cn("flex flex-col bg-zinc-950 transition-all flex-1", selectedRecipeId ? "w-1/2" : "flex-1")}>
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.length === 0 && (
            <p className="text-center text-sm text-zinc-500">
              Send a message to start the conversation.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                m.role === "user"
                  ? "self-end bg-zinc-700 text-zinc-100"
                  : "self-start bg-zinc-800 text-zinc-100"
              )}
            >
              {m.parts.map((part, i) => {
                if (isTextUIPart(part)) {
                  return m.role === "assistant" ? (
                    <div key={i} className="prose prose-sm prose-invert max-w-none">
                      <Markdown>{part.text}</Markdown>
                    </div>
                  ) : (
                    <span key={i}>{part.text}</span>
                  );
                }

                const p = part as { type: string; state?: string; output?: unknown };
                if (p.type === "tool-search_recipes" && p.state === "output-available") {
                  const output = p.output as { recipes?: RecipeCardData[] } | null;
                  const recipes = output?.recipes ?? [];
                  if (recipes.length === 0) return null;
                  return (
                    <div key={i} className="grid grid-cols-3 gap-3 py-2">
                      {recipes.map((r) => {
                        const tile: RecipeTileType = {
                          id: r.id,
                          name: r.name,
                          photo_urls: r.photo_urls,
                          courses: [],
                          categories: [],
                          is_favourite: false,
                        };
                        return <RecipeTile key={r.id} recipe={tile} onClick={setSelectedRecipeId} />;
                      })}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-zinc-800 px-4 py-4">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl gap-2">
          <input
            className={cn(
              "flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100",
              "placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            )}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => { setMessages([]); localStorage.removeItem(STORAGE_KEY); }}
            disabled={isLoading || messages.length === 0}
            className={cn(
              "rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-400",
              "transition-colors hover:bg-zinc-800 disabled:opacity-40"
            )}
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={cn(
              "rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900",
              "transition-colors hover:bg-zinc-300 disabled:opacity-40"
            )}
          >
            Send
          </button>
        </form>
      </div>
      </div>

      {selectedRecipeId && (
        <div className="w-1/2 border-l border-zinc-800">
          <RecipePanel recipeId={selectedRecipeId} onClose={() => setSelectedRecipeId(null)} />
        </div>
      )}
    </div>
  );
}
