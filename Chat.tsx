import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import {
  Send,
  Bot,
  User,
  Trash2,
  ArrowLeft,
  Sparkles,
  Zap,
  Loader2,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

export default function Chat() {
  const { isAuthenticated } = useAuth();
  const [sessionId] = useState(() => uuidv4());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const sendMutation = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          content: data.response,
          createdAt: new Date(),
        },
      ]);
      setIsTyping(false);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          content:
            "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
          createdAt: new Date(),
        },
      ]);
      setIsTyping(false);
    },
  });

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    sendMutation.mutate({
      message: userMessage.content,
      sessionId,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navigation />

      {/* Chat container */}
      <div className="flex-1 flex flex-col pt-14">
        {/* Header */}
        <div className="border-b border-[#27272a] px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="text-[#a1a1aa] hover:text-[#00f0ff] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#00f0ff]" />
                </div>
                <div>
                  <h1 className="font-display text-sm font-semibold text-white">
                    LUMINA AI
                  </h1>
                  <span className="text-[9px] font-mono-code text-[#00f0ff] uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={handleClear}
                  className="p-2 text-[#a1a1aa] hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#00f0ff]/5 border border-[#00f0ff]/20 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-[#00f0ff]" />
                </div>
                <h2 className="font-display text-xl font-semibold text-white mb-2">
                  AI Intelligence Assistant
                </h2>
                <p className="text-sm text-[#a1a1aa] max-w-md mx-auto mb-8">
                  Ask me anything about AI news, trends, technologies, or
                  developments. I'm here to help you navigate the rapidly evolving
                  world of artificial intelligence.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                  {[
                    "What are the latest LLM developments?",
                    "Explain the EU AI Act impact",
                    "Compare GPT-4 vs Claude",
                    "Latest AI funding rounds?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="text-left px-4 py-2.5 bg-[#111111] border border-[#27272a] text-xs text-[#a1a1aa] hover:border-[#00f0ff]/30 hover:text-[#00f0ff] transition-all rounded-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                {!isAuthenticated && (
                  <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-mono-code text-[#a1a1aa]">
                    <Zap className="w-3 h-3 text-[#ffaa00]" />
                    <span>
                      Guest mode —{" "}
                      <Link
                        to="/login"
                        className="text-[#00f0ff] hover:underline"
                      >
                        Sign in
                      </Link>{" "}
                      to save history
                    </span>
                  </div>
                )}
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-[#00f0ff]" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-white"
                      : "bg-[#111111] border border-[#27272a] text-[#e4e4e7]"
                  }`}
                >
                  {msg.content}
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-[#27272a] border border-[#27272a] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-[#a1a1aa]" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-[#00f0ff]" />
                </div>
                <div className="bg-[#111111] border border-[#27272a] px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 text-[#00f0ff] animate-spin" />
                    <span className="text-xs text-[#a1a1aa] font-mono-code">
                      Processing...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-[#27272a] px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about AI news, trends, or anything..."
                rows={1}
                className="flex-1 bg-[#111111] border border-[#27272a] text-white text-sm placeholder:text-[#27272a] rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-[#00f0ff]/50 focus:ring-1 focus:ring-[#00f0ff]/20 min-h-[44px] max-h-[120px]"
                style={{
                  height: "auto",
                  overflow: "hidden",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-3 bg-[#00f0ff] text-[#050505] rounded-lg hover:bg-[#00f0ff]/90 disabled:opacity-30 disabled:hover:bg-[#00f0ff] transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[9px] font-mono-code text-[#27272a] mt-2 text-center uppercase tracking-wider">
              LUMINA AI may produce inaccurate information. Verify critical
              facts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
