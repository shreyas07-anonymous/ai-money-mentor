// AI Mentor – multi-purpose Gemini-powered finance advisor.
// Modes: "chat" (multi-turn conversation), "insight" (one-shot recommendation),
// "health" (full health analysis), "tax" (regime + deduction advice),
// "fire" (FIRE narrative), "life-event" (decision support).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface RequestBody {
  mode: "chat" | "insight" | "health" | "tax" | "fire" | "life-event";
  profile?: Record<string, unknown>;
  messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  context?: Record<string, unknown>;
}

function systemPromptFor(mode: string, profile: Record<string, unknown> = {}): string {
  const base = `You are AI Money Mentor — an India-focused personal finance guide.
Rules:
- Speak in plain, friendly English. Zero jargon. No SEBI/RBI legalese.
- Always reference Indian context (₹, NPS, ELSS, 80C, EPF, HRA, etc.).
- Use crisp bullet points, short paragraphs, real numbers from the user's profile.
- End with ONE concrete "Do this today" action.
- Never invent specific fund names or guarantee returns. Use ranges/averages.

User profile (JSON):
${JSON.stringify(profile, null, 2)}`;

  const modePrompts: Record<string, string> = {
    chat: `${base}\n\nYou are in a chat conversation. Respond conversationally and personally. Address them by first name when known.`,
    insight: `${base}\n\nGenerate ONE specific, high-impact insight (2-3 sentences) the user can act on right now.`,
    health: `${base}\n\nProduce a comprehensive Money Health analysis. Output sections:\n1. **Overall verdict** (1 sentence)\n2. **3 biggest strengths**\n3. **3 biggest risks** with ₹ impact\n4. **Action this week** (1 specific step)\n5. **Action this month**\n6. **Action this year**`,
    tax: `${base}\n\nAnalyze the user's tax situation. Output:\n1. Which regime (Old/New) is better and by how much (₹)\n2. Top 3 missed deductions with exact ₹ savings potential\n3. One quick-win action they can do this week`,
    fire: `${base}\n\nGenerate FIRE journey commentary. Output:\n1. Where they stand vs Freedom Number (encouraging tone)\n2. Biggest lever to pull (SIP increase, expense cut, or income boost)\n3. Realistic timeline with stress-test caveat\n4. One action this week`,
    "life-event": `${base}\n\nGive practical, step-by-step advice for the specific life event. Output:\n1. **TL;DR** (2 sentence summary)\n2. **3 things to do first**\n3. **What to avoid**\n4. **₹ numbers specific to their situation**\n5. **Do this today**`,
  };

  return modePrompts[mode] || base;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as RequestBody;
    const { mode, profile = {}, messages = [], context = {} } = body;

    if (!mode) {
      return new Response(JSON.stringify({ error: "mode is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = systemPromptFor(mode, profile);

    const aiMessages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    if (mode === "chat") {
      for (const m of messages) aiMessages.push({ role: m.role, content: m.content });
    } else {
      const userPrompt = context && Object.keys(context).length
        ? `Context for this request: ${JSON.stringify(context)}\n\nGenerate the analysis now.`
        : "Generate the analysis now based on the profile above.";
      aiMessages.push({ role: "user", content: userPrompt });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited. Try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: `AI gateway error: ${errText}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
