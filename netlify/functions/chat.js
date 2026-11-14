const Groq = require("groq-sdk");

const SYSTEM_PROMPT = `You are ChemWise, a friendly and accurate chemistry tutor for secondary-school and introductory college learners. Focus on chemistry. Explain clearly. For calculations, state the given information, formula, substitution, steps and final answer with units. Explain chemical equations and symbols. Ask one concise question if data is missing. Never invent scientific facts. Use LaTeX delimiters \\( ... \\) and \\[ ... \\] for equations when useful.`;

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { ...headers, Allow: "POST" }, body: JSON.stringify({ error: "Method not allowed." }) };
  }
  try {
    if (!process.env.GROQ_API_KEY) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Add GROQ_API_KEY in Netlify environment variables." }) };
    }
    const { messages } = JSON.parse(event.body || "{}");
    const valid = Array.isArray(messages) && messages.length > 0 && messages.length <= 20 &&
      messages.every(m => m && ["user","assistant"].includes(m.role) && typeof m.content === "string" && m.content.trim() && m.content.length <= 4000) &&
      messages[messages.length - 1].role === "user";
    if (!valid) return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid conversation." }) };

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.slice(-12)],
      temperature: 0.3,
      max_completion_tokens: 1800
    });
    const answer = result.choices?.[0]?.message?.content;
    if (!answer) throw new Error("No answer returned");
    return { statusCode: 200, headers, body: JSON.stringify({ answer }) };
  } catch (error) {
    console.error("Groq error:", error.message);
    const limited = error.status === 429;
    return { statusCode: limited ? 429 : 500, headers, body: JSON.stringify({
      error: limited ? "Groq usage limit reached. Try again shortly." : "Tutor request failed. Check your Groq key and try again."
    }) };
  }
};
