import { NextResponse } from "next/server";

type DoctorMessage = {
  role: "user" | "assistant";
  content: string;
};

function fallback(question: string): string {
  if (/노랗|과습|물.*많/.test(question)) {
    return "잎이 노래지고 흙이 오래 축축하다면 과습 가능성이 커요. 겉흙 3cm가 마를 때까지 물을 멈추고, 받침의 고인 물과 통풍 상태를 확인해 주세요.";
  }
  if (/벌레|해충|깍지|거미/.test(question)) {
    return "우선 다른 식물과 분리하고 잎 앞뒤를 미지근한 물로 닦아 주세요. 벌레의 색과 모양, 잎에 끈적임이 있는지 알려주시면 원인을 더 좁혀볼게요.";
  }
  return "함께 살펴볼게요. 식물 이름과 증상이 시작된 시점, 햇빛을 받는 시간, 최근 물 준 날짜를 알려주세요.";
}

function validMessages(value: unknown): value is DoctorMessage[] {
  return Array.isArray(value) && value.length > 0 && value.length <= 12 &&
    value.every((message) =>
      typeof message === "object" && message !== null &&
      (message as DoctorMessage).role === "user" ||
      typeof message === "object" && message !== null &&
      (message as DoctorMessage).role === "assistant"
    ) && value.every((message) =>
      typeof (message as DoctorMessage).content === "string" &&
      (message as DoctorMessage).content.trim().length > 0 &&
      (message as DoctorMessage).content.length <= 1500
    );
}

export async function POST(request: Request) {
  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!validMessages(body.messages)) {
    return NextResponse.json({ error: "대화 내용을 확인해 주세요." }, { status: 400 });
  }

  const messages = body.messages;
  const latest = messages.at(-1)?.content ?? "";
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: fallback(latest), fallback: true, reason: "API_KEY_MISSING" });
  }

  try {
    const baseUrl = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
    const isGroq = baseUrl.includes("api.groq.com");
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: AbortSignal.timeout(30_000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "gpt-4.1-mini",
        temperature: 0.35,
        max_tokens: 700,
        ...(isGroq ? { reasoning_effort: "none", reasoning_format: "hidden" } : {}),
        messages: [
          {
            role: "system",
            content: "너는 Greening의 친절한 AI 식물 닥터다. 한국어로 짧고 이해하기 쉽게 답하고, 가능한 원인을 1~3개 제시한 뒤 지금 할 일과 필요한 추가 질문을 안내한다. 확정 진단이나 농약 오남용을 유도하지 않는다.",
          },
          ...messages.slice(-10),
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ reply: fallback(latest), fallback: true, reason: `AI_HTTP_${response.status}` });
    }
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const reply = data.choices?.[0]?.message?.content
      ?.replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/^<think>[\s\S]*/i, "")
      .trim();
    return NextResponse.json(reply
      ? { reply, fallback: false }
      : { reply: fallback(latest), fallback: true, reason: "AI_EMPTY_RESPONSE" });
  } catch {
    return NextResponse.json({ reply: fallback(latest), fallback: true, reason: "AI_CONNECTION_ERROR" });
  }
}
