"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles, MessageSquare, RefreshCw, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EventItem } from "@/types/event";

interface AICoPilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export function AICoPilotDrawer({ isOpen, onClose, event }: AICoPilotDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: `Hello! I'm your VibeCraft Senior Event Co-Pilot. I'm actively synced with ${
        event ? `"${event.title}" (${event.guest_count} guests, ${event.total_budget} ${event.currency})` : "your event plans"
      }. Ask me anything about budget allocation, vendor contracts, run-of-show timing, or personalized ideas!`,
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "How can I cut 10% from my catering budget?",
    "Generate day-of emergency checklist",
    "What questions must I ask the venue before booking?",
    "Give me 3 creative guest favor ideas",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    try {
      const eventContext = event
        ? `Event: ${event.title}\nType: ${event.event_type}\nDate: ${event.target_date}\nBudget: ${event.total_budget} ${event.currency}\nGuests: ${event.guest_count}\nLocation: ${event.location || "N/A"}`
        : "General Event Planning";

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventContext, message: query }),
      });

      const data = await res.json();
      const reply = data.reply || "I've reviewed your request. Let's make sure our vendor contracts and timeline reflect this!";

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: "I encountered a brief connection glitch, but standard protocol: always check vendor overtime rates and have a 10% contingency buffer!",
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md rounded-2xl border border-fuchsia-500/30 bg-slate-950/95 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200 flex flex-col h-[560px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-900/60 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-fuchsia-600 to-pink-500 text-white shadow-glow">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              VibeCraft Co-Pilot
              <Badge variant="glow" className="text-[9px] px-1.5 py-0">
                Gemini AI
              </Badge>
            </h3>
            <p className="text-[11px] text-slate-400">Context: {event?.title || "All Events"}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                m.sender === "user"
                  ? "bg-fuchsia-600 text-white rounded-br-none"
                  : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm"
              }`}
            >
              {m.text}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
            <RefreshCw className="h-3 w-3 animate-spin text-fuchsia-400" />
            <span>AI Co-Pilot is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-2 border-t border-slate-900 bg-slate-950/60 overflow-x-auto flex gap-1.5 no-scrollbar">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            className="text-[11px] whitespace-nowrap bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-full px-2.5 py-1 transition-colors"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about budget, vendors, timeline..."
            className="text-xs bg-slate-950"
          />
          <Button type="submit" size="icon" variant="glow" disabled={!input.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
