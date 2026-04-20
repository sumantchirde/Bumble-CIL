// Edge function: generate AI-suggested first messages for a male profile
// Uses Lovable AI Gateway (no API key needed from user)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RequestBody {
  initiator: { name: string; age: number; interests?: string[] };
  candidate: {
    name: string;
    age: number;
    bio: string;
    interests: string[];
  };
  sharedInterests: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = (await req.json()) as RequestBody;
    const { initiator, candidate, sharedInterests } = body;

    if (!candidate?.name || !initiator?.name) {
      return new Response(JSON.stringify({ error: "Missing initiator/candidate" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a witty, warm dating coach helping a woman send the first message on Bumble.
Rules:
- Generate 3 distinct opener messages, each 1-2 sentences, under 200 characters.
- Tone variety: one playful, one curious/thoughtful, one confident & flirty.
- Reference SHARED interests when present; otherwise pick something specific from the man's bio or interests.
- End with a light question to invite a reply.
- Sound natural, never cheesy, never generic ("Hey!", "How's your day?").
- No emojis unless they truly fit. No pet names. Use his name only if it flows.`;

    const userPrompt = `From: ${initiator.name} (${initiator.age})
To: ${candidate.name} (${candidate.age})

His bio: "${candidate.bio}"
His interests: ${candidate.interests.join(", ") || "(none listed)"}
Shared interests: ${sharedInterests.length ? sharedInterests.join(", ") : "(none)"}

Write 3 first messages she could send.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_openers",
                description: "Return 3 first-message openers",
                parameters: {
                  type: "object",
                  properties: {
                    suggestions: {
                      type: "array",
                      minItems: 3,
                      maxItems: 3,
                      items: {
                        type: "object",
                        properties: {
                          tone: {
                            type: "string",
                            enum: ["playful", "curious", "confident"],
                          },
                          message: { type: "string" },
                          reasoning: {
                            type: "string",
                            description: "Brief explanation of what this opener leverages",
                          },
                        },
                        required: ["tone", "message", "reasoning"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["suggestions"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "return_openers" } },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error:
              "AI credits exhausted. Add credits in Lovable Settings → Workspace → Usage.",
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments
      ? JSON.parse(toolCall.function.arguments)
      : null;

    if (!args?.suggestions) {
      console.error("Unexpected AI response:", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "Could not parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ suggestions: args.suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-first-message error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
