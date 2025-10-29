export const config = { runtime: "experimental-edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { companyName, website, email } = await req.json();

    const scores = {
      websiteSpeed: Math.floor(Math.random() * 30) + 60,
      mobileScore: Math.floor(Math.random() * 30) + 60,
      gbpScore: Math.floor(Math.random() * 30) + 60,
      socialPresence: Math.floor(Math.random() * 30) + 60,
    };

    const overallScore = Math.round(
      (scores.websiteSpeed + scores.mobileScore + scores.gbpScore + scores.socialPresence) / 4
    );

    const prompt = `
    You are a CX optimization AI assistant for CX Optimized.
    The client is ${companyName} with website ${website}.
    Based on their CX audit scores (Website ${scores.websiteSpeed}, Mobile ${scores.mobileScore}, GBP ${scores.gbpScore}, Social ${scores.socialPresence}),
    write one short branded paragraph titled "CX Optimized Expert AI Analysis" explaining what their score means,
    and recommend one of these audits: CX Journey Snapshot, CX Priority Assessment, or Competitor CX Intelligence Audit.`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const aiData = await aiResponse.json();
    const recommendedAudit = aiData.choices?.[0]?.message?.content || "CX Journey Snapshot Audit";

    return new Response(JSON.stringify({
      overallScore,
      scores,
      explanations: {
        websiteSpeed: "Website performance and page speed directly affect conversions.",
        mobileScore: "Mobile responsiveness impacts your CX rating and local SEO visibility.",
        gbpScore: "Google Business Profile completeness drives local discovery and trust.",
        socialPresence: "Online consistency builds brand credibility and retention."
      },
      recommendedAudit
    }), { headers: { "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
