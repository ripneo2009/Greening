import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';

export type RoomAnalysis = { style: string; colors: string[]; lightLevel: 'low'|'medium'|'high'; availableLocations: string[]; cautions: string[]; plantTraits: string[] };
const schema = { type:'object', additionalProperties:false, properties:{ style:{type:'string'}, colors:{type:'array',items:{type:'string'}}, lightLevel:{type:'string',enum:['low','medium','high']}, availableLocations:{type:'array',items:{type:'string'}}, cautions:{type:'array',items:{type:'string'}}, plantTraits:{type:'array',items:{type:'string'}} }, required:['style','colors','lightLevel','availableLocations','cautions','plantTraits'] };

const safeFallback = (reason: string): RoomAnalysis => ({
  style: '편안한 실내 공간', colors: ['크림', '내추럴 우드', '그린'], lightLevel: 'medium',
  availableLocations: ['창가에서 1~2m 떨어진 자리', '통풍이 가능한 책상 또는 선반'],
  cautions: [`AI 정밀 분석을 사용할 수 없어 안전한 기본 조건으로 추천했습니다 (${reason}).`, '실제 조도는 센서 측정값을 우선 확인해주세요.'],
  plantTraits: ['초보자용', '간접광 적응', '관리 주기가 긴 식물']
});

export async function analyzeRoom(image: Buffer, mime: string): Promise<RoomAnalysis> {
  if (!env.AI_API_KEY) return safeFallback('API 미설정');
  try {
    const groq = env.AI_BASE_URL.includes('api.groq.com');
    const responseFormat = groq
      ? { type: 'json_object' }
      : { type:'json_schema', json_schema:{ name:'room_analysis', strict:true, schema } };
    const response = await fetch(`${env.AI_BASE_URL.replace(/\/$/,'')}/chat/completions`, { method:'POST', signal:AbortSignal.timeout(env.AI_TIMEOUT_MS), headers:{ Authorization:`Bearer ${env.AI_API_KEY}`, 'Content-Type':'application/json' }, body:JSON.stringify({ model:env.AI_MODEL, temperature:0.2, response_format:responseFormat, ...(groq ? { reasoning_effort: 'none', reasoning_format: 'hidden' } : {}), messages:[{role:'system',content:'당신은 실내 원예와 공간 스타일링 전문가다. 사진에서 확실히 보이는 정보만 판단하고 빛의 세기는 추정임을 전제로 하라. 반드시 style, colors, lightLevel, availableLocations, cautions, plantTraits 필드를 가진 JSON 객체만 출력하라.'},{role:'user',content:[{type:'text',text:'이 방에 건강하게 살면서 인테리어에도 어울릴 식물의 조건을 분석해줘. 개인 정보나 사람의 신원은 추론하지 마.'},{type:'image_url',image_url:{url:`data:${mime};base64,${image.toString('base64')}`}}]}] }) });
    if (!response.ok) return safeFallback(`AI 응답 ${response.status}`);
    const data = await response.json() as { choices?: Array<{message?:{content?:string}}> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return safeFallback('응답 없음');
    return JSON.parse(content) as RoomAnalysis;
  } catch { return safeFallback('일시적 연결 오류'); }
}

export type DoctorMessage = { role: 'user' | 'assistant'; content: string };

function doctorFallback(question: string): string {
  if (/노랗|누렇|과습|물.*많/.test(question)) return '잎이 노래지고 흙이 오래 축축하다면 과습 가능성이 커요. 겉흙 3cm가 마를 때까지 물을 멈추고, 받침의 고인 물을 비운 뒤 통풍을 확보해주세요. 식물 이름과 최근 물 준 날짜도 알려주실래요?';
  if (/벌레|솜|응애|깍지|거미줄/.test(question)) return '병충해 가능성이 있어요. 우선 다른 식물과 분리하고 잎 앞뒤를 젖은 천으로 닦아주세요. 벌레의 색과 모양, 잎에 끈적임이 있는지도 알려주시면 원인을 더 좁혀볼게요.';
  if (/갈색|말라|바삭|잎끝/.test(question)) return '갈색 잎끝은 건조한 공기, 불규칙한 물주기, 비료 염류가 원인일 수 있어요. 흙의 마름 정도와 냉난방 바람을 먼저 확인해주세요. 갈색 부분이 마른 편인지 물렁한 편인지도 궁금해요.';
  if (/축|물러|냄새|썩/.test(question)) return '줄기가 무르거나 흙에서 냄새가 난다면 뿌리 과습을 먼저 의심해야 해요. 물주기를 중단하고 배수 구멍과 검게 변한 뿌리가 있는지 확인해주세요.';
  return '함께 살펴볼게요. 식물 이름, 증상이 시작된 시점, 햇빛이 드는 시간, 최근 물 준 날짜와 현재 흙의 촉감을 알려주시면 더 구체적으로 안내할 수 있어요.';
}

export async function chatWithPlantDoctor(messages: DoctorMessage[]): Promise<{ reply: string; fallback: boolean; reason?: string }> {
  const latest = messages.at(-1)?.content || '';
  if (!env.AI_API_KEY) return { reply: doctorFallback(latest), fallback: true, reason: 'API_KEY_MISSING' };
  try {
    const response = await fetch(`${env.AI_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST', signal: AbortSignal.timeout(env.AI_TIMEOUT_MS),
      headers: { Authorization: `Bearer ${env.AI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: env.AI_MODEL, temperature: 0.35, max_tokens: 700, ...(env.AI_BASE_URL.includes('api.groq.com') ? { reasoning_effort: 'none', reasoning_format: 'hidden' } : {}), messages: [
        { role: 'system', content: '너는 Greening의 친절한 AI 식물 닥터다. 한국어로 짧고 이해하기 쉽게 대화한다. 가능한 원인을 1~3개 제시하고 지금 할 일과 추가 질문을 안내한다. 확정 진단이나 농약 오남용을 유도하지 않는다. 식물·원예 이외 질문에는 식물 상담만 가능하다고 답한다. 심한 병충해나 급격한 부패는 가까운 화원 전문가 확인을 권한다.' },
        ...messages.slice(-10),
      ] }),
    });
    if (!response.ok) return { reply: doctorFallback(latest), fallback: true, reason: `AI_HTTP_${response.status}` };
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const reply = data.choices?.[0]?.message?.content?.trim();
    return reply ? { reply, fallback: false } : { reply: doctorFallback(latest), fallback: true, reason: 'AI_EMPTY_RESPONSE' };
  } catch { return { reply: doctorFallback(latest), fallback: true, reason: 'AI_CONNECTION_ERROR' }; }
}
