import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { Button } from "@/components/ui/button";

interface Props {
  mode: "health" | "tax" | "fire" | "life-event" | "insight";
  context?: Record<string, unknown>;
  title?: string;
}

export function AIInsightPanel({ mode, context, title }: Props) {
  const { profile } = useUserProfile();
  const [reply, setReply] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: invokeErr } = await supabase.functions.invoke("ai-mentor", {
        body: { mode, profile, context: context || {} },
      });
      if (invokeErr) throw invokeErr;
      if (data?.error) throw new Error(data.error);
      setReply(data?.reply || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load AI insight");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile.monthlyIncome > 0) fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, JSON.stringify(context)]);

  return (
    <Card className="bg-gradient-card border-primary/30">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-display font-semibold text-sm">{title || "AI Analysis"}</p>
              <p className="text-xs text-muted-foreground">Powered by Gemini</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchInsight} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {loading && !reply && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing your numbers...
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {reply && (
          <div className="text-sm text-foreground whitespace-pre-line leading-relaxed prose-headings:font-display">
            {reply}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
