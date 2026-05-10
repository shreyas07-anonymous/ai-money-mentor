import { useState } from "react";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { MessageCircle, X, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_CHIPS = [
  "How do I save more tax?",
  "Should I prepay my loans?",
  "How can I save more each month?",
  "Am I on track for retirement?",
];

export default function MentorChat() {
  const { profile } = useUserProfile();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const greeting = `Hi ${profile.firstName || "there"}! I've reviewed your numbers. Ask me anything about taxes, investments, retirement, or any money decision you're facing.`;

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-mentor", {
        body: {
          mode: "chat",
          profile,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "I'm not sure how to respond. Try rephrasing?" }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to reach AI";
      toast.error(msg);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't reach the AI right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-gold hover:shadow-elevated transition-all animate-pulse-gold"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-semibold hidden sm:inline">Ask Mentor</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96">
      <Card className="bg-card border-border/50 shadow-elevated rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-card">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm">🤖</span>
            </div>
            <div>
              <p className="text-sm font-semibold">AI Money Mentor</p>
              <p className="text-xs text-muted-foreground">Powered by Gemini</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
          <div className="bg-secondary/50 rounded-xl p-3 text-sm text-foreground whitespace-pre-line">
            {greeting}
          </div>

          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`${msg.role === "user" ? "ml-auto bg-primary/15 text-foreground" : "bg-secondary/50 text-foreground"} rounded-xl p-3 text-sm max-w-[85%] whitespace-pre-line`}>
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 py-2 px-4">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-muted-foreground">AI Mentor is thinking...</span>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-border/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="Ask anything about your finances..."
              disabled={loading}
              className="flex-1 px-3 py-2 text-sm bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-50"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
