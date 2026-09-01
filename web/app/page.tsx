"use client";

import { useEffect, useMemo, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000");

type Stage =
  | "home"
  | "opening"
  | "questions"
  | "matching"
  | "results"
  | "detail"
  | "commit"
  | "save"
  | "checkout"
  | "complete"
  | "name"
  | "memory"
  | "app"
  | "care";
type Answers = Record<string, string>;
type Tier = "Entry" | "Signature" | "Premium";
type Panel = "guarantee" | "support" | "privacy" | null;
type Plant = {
  slug: string;
  name: string;
  scientific: string;
  image: string;
  summary: string;
  reason: string;
  caution: string;
  difficulty: string;
  light: string;
  absence: string;
  maintenance: string;
  placement: string[];
  presence: string;
  petSafe: boolean;
  tiers: Tier[];
};

const STORE = "greening-mvp-session-v1";
const questions = [
  {
    id: "placement",
    group: "공간",
    title: "식물을 어디에 두고 싶나요?",
    helper: "정확히 정하지 않았어도 괜찮아요. 가장 가까운 곳을 골라주세요.",
    options: [
      ["책상이나 선반 위", "desk", "작고 가까운 초록"],
      ["침대 옆이나 바닥", "floor", "편안한 생활의 포인트"],
      ["창가 근처", "window", "빛을 충분히 받는 자리"],
      ["아직 잘 모르겠어요", "unsure", ""],
    ],
  },
  {
    id: "brightness",
    group: "공간",
    title: "낮에 불을 켜지 않아도 방이 밝은 편인가요?",
    helper: "정확한 수치 대신 평소 느끼는 밝기로 답해주세요.",
    options: [
      ["네, 꽤 밝아요", "bright", ""],
      ["보통이에요", "medium", ""],
      ["조금 어두운 편이에요", "dim", ""],
      ["잘 모르겠어요", "unsure", ""],
    ],
  },
  {
    id: "sunlight",
    group: "공간",
    title: "식물을 둘 곳에 햇빛이 직접 들어오나요?",
    helper: "햇빛이 바닥이나 가구에 선명하게 맺히는지 떠올려보세요.",
    options: [
      ["하루에 어느 정도 직접 들어와요", "direct", ""],
      ["밝지만 직접 햇빛은 거의 없어요", "indirect", ""],
      ["햇빛이 거의 들지 않아요", "low", ""],
      ["잘 모르겠어요", "unsure", ""],
    ],
  },
  {
    id: "absence",
    group: "생활",
    title: "집을 며칠씩 비우는 일이 있나요?",
    helper: "평소 생활 리듬에 맞는 식물일수록 오래 함께하기 쉬워요.",
    options: [
      ["거의 없어요", "low", ""],
      ["가끔 2~3일 비워요", "medium", ""],
      ["자주 며칠씩 비워요", "high", ""],
    ],
  },
  {
    id: "maintenance",
    group: "생활",
    title: "식물 관리는 어느 정도가 편할까요?",
    helper: "잘해야 한다는 부담 없이, 실제로 가능한 정도를 골라주세요.",
    options: [
      ["필요한 만큼 챙길 수 있어요", "regular", ""],
      ["자주 신경 쓰지 않아도 되는 게 좋아요", "low", ""],
      ["최대한 손이 적게 가는 식물이 좋아요", "very-low", ""],
    ],
  },
  {
    id: "presence",
    group: "취향",
    title: "공간에서 어느 정도 존재감이 있었으면 좋겠나요?",
    helper: "가격이 아니라, 지금 공간에 어울릴 크기를 골라주세요.",
    options: [
      ["책상 위에 작은 포인트", "small", "약 25~40cm"],
      ["방 분위기를 바꾸는 중간 크기", "medium", "약 50~80cm"],
      ["공간 중심이 되는 큰 식물", "large", "약 90~130cm"],
    ],
  },
  {
    id: "pet",
    group: "안전",
    title: "식물과 함께 지내는 반려동물이 있나요?",
    helper: "반려동물이 있다면 안전성이 확인된 후보만 보여드릴게요.",
    options: [
      ["없어요", "none", ""],
      ["있어요", "has", ""],
      ["가끔 반려동물이 머물러요", "occasional", ""],
    ],
  },
];

const plants: Plant[] = [
  {
    slug: "parlor-palm",
    name: "테이블야자",
    scientific: "Chamaedorea elegans",
    image:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1400&q=88",
    summary: "부드러운 잎과 단정한 크기로 처음 들이는 식물에 잘 어울려요.",
    reason: "간접광에서도 안정적이고 물 주기 간격이 비교적 여유로워요.",
    caution: "강한 직사광은 잎끝을 마르게 할 수 있어요.",
    difficulty: "쉬움",
    light: "medium",
    absence: "medium",
    maintenance: "low",
    placement: ["desk", "floor", "unsure"],
    presence: "small",
    petSafe: true,
    tiers: ["Entry", "Signature"],
  },
  {
    slug: "areca-palm",
    name: "아레카야자",
    scientific: "Dypsis lutescens",
    image:
      "https://images.unsplash.com/photo-1583955967842-14dd8d6b8257?auto=format&fit=crop&w=1400&q=88",
    summary: "가볍게 퍼지는 잎이 방의 분위기를 한결 부드럽게 바꿔줘요.",
    reason: "밝은 공간에서 존재감 있는 초록을 원하는 생활에 잘 맞아요.",
    caution: "흙이 오래 마른 상태로 방치되지 않도록 살펴봐 주세요.",
    difficulty: "보통",
    light: "bright",
    absence: "low",
    maintenance: "regular",
    placement: ["floor", "window", "unsure"],
    presence: "large",
    petSafe: true,
    tiers: ["Signature", "Premium"],
  },
  {
    slug: "peperomia",
    name: "페페로미아",
    scientific: "Peperomia obtusifolia",
    image:
      "https://images.unsplash.com/photo-1509423350716-97f2360af8e4?auto=format&fit=crop&w=1400&q=88",
    summary: "도톰한 잎과 작은 크기로 책상 위에 두기 좋은 식물이에요.",
    reason: "물을 자주 주지 않아도 되고 반려동물과 함께 지내기에도 안전해요.",
    caution: "물을 너무 자주 주면 뿌리가 상할 수 있어요.",
    difficulty: "쉬움",
    light: "medium",
    absence: "high",
    maintenance: "very-low",
    placement: ["desk", "unsure"],
    presence: "small",
    petSafe: true,
    tiers: ["Entry"],
  },
  {
    slug: "zz-plant",
    name: "금전수",
    scientific: "Zamioculcas zamiifolia",
    image:
      "https://images.unsplash.com/photo-1614594575810-ecbb2d3f5cc5?auto=format&fit=crop&w=1400&q=88",
    summary: "단단하고 짙은 잎이 차분한 공간에 선명한 중심을 만들어줘요.",
    reason: "빛이 적거나 집을 자주 비우는 생활에서도 비교적 잘 버텨요.",
    caution: "반려동물이 잎을 먹지 않도록 주의가 필요해요.",
    difficulty: "매우 쉬움",
    light: "dim",
    absence: "high",
    maintenance: "very-low",
    placement: ["floor", "unsure"],
    presence: "medium",
    petSafe: false,
    tiers: ["Entry", "Signature"],
  },
  {
    slug: "monstera",
    name: "몬스테라",
    scientific: "Monstera deliciosa",
    image:
      "https://images.unsplash.com/photo-1618219740975-d40978bb7378?auto=format&fit=crop&w=1400&q=88",
    summary: "넓고 선명한 잎으로 공간의 인상을 확실하게 바꿔줘요.",
    reason: "밝은 간접광과 넉넉한 바닥 공간이 있는 방에 잘 맞아요.",
    caution: "반려동물에게 안전하지 않고, 잎이 넓게 퍼질 공간이 필요해요.",
    difficulty: "보통",
    light: "bright",
    absence: "medium",
    maintenance: "regular",
    placement: ["floor", "window"],
    presence: "large",
    petSafe: false,
    tiers: ["Signature", "Premium"],
  },
];
const tiers: Record<Tier, { price: number; size: string; includes: string }> = {
  Entry: {
    price: 49900,
    size: "약 25~40cm",
    includes: "식물 · 기본 화분 · 이름표 · 관리 가이드",
  },
  Signature: {
    price: 79900,
    size: "약 50~80cm",
    includes: "식물 · 시그니처 화분 · 이름표 · 관리 키트",
  },
  Premium: {
    price: 119000,
    size: "약 90~130cm",
    includes: "대형 식물 · 프리미엄 화분 · 이름표 · 관리 키트",
  },
};

function score(p: Plant, a: Answers) {
  let n = 0;
  if (p.light === a.brightness || a.brightness === "unsure") n += 25;
  if (
    (a.sunlight === "direct" && p.light === "bright") ||
    (a.sunlight === "indirect" && p.light !== "dim") ||
    (a.sunlight === "low" && p.light === "dim") ||
    a.sunlight === "unsure"
  )
    n += 20;
  if (p.absence === a.absence) n += 20;
  if (p.maintenance === a.maintenance) n += 15;
  if (p.placement.includes(a.placement)) n += 10;
  if (p.presence === a.presence) n += 10;
  return n;
}
function track(name: string, detail: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const e = JSON.parse(localStorage.getItem("greening-analytics") || "[]");
  e.push({ name, detail, at: new Date().toISOString() });
  localStorage.setItem("greening-analytics", JSON.stringify(e.slice(-100)));
}

const validStages: Stage[] = [
  "home",
  "opening",
  "questions",
  "matching",
  "results",
  "detail",
  "commit",
  "save",
  "checkout",
  "complete",
  "name",
  "memory",
  "app",
  "care",
];

function routeState(
  pathname: string,
): { stage: Stage; qi?: number; slug?: string } | null {
  if (pathname === "/") return null;
  if (pathname === "/find/opening") return { stage: "opening" };
  if (pathname.startsWith("/find/q/")) {
    const id = pathname.split("/").at(-1);
    const index = questions.findIndex((question) => question.id === id);
    return { stage: "questions", qi: index >= 0 ? index : 0 };
  }
  if (pathname === "/find/matching") return { stage: "matching" };
  if (pathname === "/find/results") return { stage: "results" };
  if (pathname.startsWith("/plants/"))
    return { stage: "detail", slug: pathname.split("/").at(-1) };
  const routes: Record<string, Stage> = {
    "/commit": "commit",
    "/save-result": "save",
    "/checkout": "checkout",
    "/mvp-complete": "complete",
    "/name": "name",
    "/memory-preview": "memory",
    "/app": "app",
    "/care": "care",
  };
  return routes[pathname] ? { stage: routes[pathname] } : { stage: "home" };
}

function smoothly(update: () => void) {
  if (typeof document === "undefined") return update();
  const motionOff = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const viewDocument = document as Document & {
    startViewTransition?: (callback: () => void) => void;
  };
  if (!motionOff && viewDocument.startViewTransition) {
    viewDocument.startViewTransition(update);
  } else {
    update();
  }
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("home"),
    [qi, setQi] = useState(0),
    [answers, setAnswers] = useState<Answers>({}),
    [slug, setSlug] = useState("parlor-palm"),
    [tier, setTier] = useState<Tier>("Entry"),
    [savedName, setSavedName] = useState(""),
    [email, setEmail] = useState(""),
    [nickname, setNickname] = useState(""),
    [panel, setPanel] = useState<Panel>(null),
    [restored, setRestored] = useState(false),
    [hydrated, setHydrated] = useState(false);
  /* Session restoration intentionally hydrates the interactive journey once. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const d = JSON.parse(raw);
        const storedStage = validStages.includes(d.stage) ? d.stage : "home";
        setStage(storedStage);
        setQi(Math.min(questions.length - 1, Math.max(0, Number(d.qi) || 0)));
        setAnswers(d.answers || {});
        setSlug(d.slug || "parlor-palm");
        setTier(d.tier || "Entry");
        setSavedName(d.savedName || "");
        setEmail(d.email || "");
        setNickname(d.nickname || "");
        setRestored(storedStage !== "home");
      }
      const route = routeState(window.location.pathname);
      if (route) {
        setStage(route.stage);
        if (route.qi !== undefined) setQi(route.qi);
        if (route.slug && plants.some((plant) => plant.slug === route.slug))
          setSlug(route.slug);
        setRestored(false);
      }
    } catch {
      localStorage.removeItem(STORE);
      setStage("home");
    } finally {
      setHydrated(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORE,
      JSON.stringify({
        stage,
        qi,
        answers,
        slug,
        tier,
        savedName,
        email,
        nickname,
      }),
    );
    const paths: Record<Stage, string> = {
      home: "/",
      opening: "/find/opening",
      questions: `/find/q/${questions[qi]?.id || "placement"}`,
      matching: "/find/matching",
      results: "/find/results",
      detail: `/plants/${slug}`,
      commit: "/commit",
      save: "/save-result",
      checkout: "/checkout",
      complete: "/mvp-complete",
      name: "/name",
      memory: "/memory-preview",
      app: "/app",
      care: "/care",
    };
    history.replaceState({}, "", paths[stage]);
  }, [hydrated, stage, qi, answers, slug, tier, savedName, email, nickname]);
  const results = useMemo(
    () =>
      plants
        .filter((p) => answers.pet === "none" || p.petSafe)
        .map((p) => ({ p, n: score(p, answers) }))
        .sort((a, b) => b.n - a.n)
        .slice(0, 3),
    [answers],
  );
  const selected =
      plants.find((p) => p.slug === slug) || results[0]?.p || plants[0],
    activeTier = selected.tiers.includes(tier) ? tier : selected.tiers[0],
    q = questions[qi];
  function go(s: Stage) {
    smoothly(() => {
      setStage(s);
      setRestored(false);
      track("screen_viewed", { stage: s });
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function start() {
    setAnswers({});
    setQi(0);
    track("recommendation_started");
    go("opening");
  }
  function choose(v: string) {
    setAnswers((a) => ({ ...a, [q.id]: v }));
    track("adoption_step_completed", { question: q.id, value: v });
    setTimeout(
      () =>
        qi < questions.length - 1
          ? smoothly(() => setQi((x) => x + 1))
          : go("matching"),
      180,
    );
  }
  function reset() {
    localStorage.removeItem(STORE);
    setAnswers({});
    setQi(0);
    setSavedName("");
    setEmail("");
    setNickname("");
    go("home");
  }
  useEffect(() => {
    if (stage !== "matching") return;
    const t = setTimeout(() => {
      track("recommendation_viewed", {
        ruleVersion: "RULE-1.0",
        weightVersion: "WEIGHT-1.0",
      });
      go("results");
    }, 1500);
    return () => clearTimeout(t);
  }, [stage]);

  return (
    <main>
      <header className="siteHeader">
        <button
          className="brand"
          onClick={() => go("home")}
          aria-label="Greening 홈"
        >
          <span>g</span>
          <b>Greening</b>
        </button>
        <nav>
          <button onClick={() => go("home")}>브랜드</button>
          <button onClick={() => setPanel("guarantee")}>90일 안심 약속</button>
          <button onClick={() => setPanel("support")}>도움말</button>
        </nav>
        <button className="headerCta" onClick={start}>
          내 식물 찾기
        </button>
      </header>
      {restored && (
        <div className="restoreNotice" role="status">
          <span>이전에 보던 추천 여정을 이어서 보여드렸어요.</span>
          <button onClick={reset}>처음부터 시작</button>
        </div>
      )}

      {stage === "home" && (
        <>
          <section className="hero">
            <div className="heroCopy">
              <p className="eyebrow">A PLANT THAT FITS YOUR LIFE</p>
              <h1>
                당신의 공간을 읽고
                <br />
                <em>오래 함께할 초록을 찾다</em>
              </h1>
              <p className="heroLead">
                예쁜 식물을 고르는 데서 끝나지 않아요. 빛, 생활 리듬, 원하는
                크기를 함께 보고 당신의 공간에서 잘 살아갈 식물을 추천합니다.
              </p>
              <div className="heroActions">
                <button className="primary" onClick={start}>
                  나와 맞는 식물 찾기 <span>→</span>
                </button>
                <button
                  className="secondary"
                  onClick={() =>
                    document
                      .getElementById("how")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  어떻게 찾나요?
                </button>
              </div>
              <div className="heroProof">
                <span>회원가입 없이 시작</span>
                <span>약 2분</span>
                <span>결과 3개 추천</span>
              </div>
            </div>
            <div className="heroVisual">
              <img
                src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1500&q=90"
                alt="밝은 방 안에 놓인 반려식물"
              />
              <div className="visualCard">
                <small>공간과 생활을 함께 본 추천</small>
                <b>밝은 간접광 · 관리 부담 낮음</b>
                <span>첫 번째 후보를 찾았어요</span>
              </div>
            </div>
          </section>
          <section className="principle" id="how">
            <div>
              <p className="eyebrow">WHY GREENING</p>
              <h2>잘 키울 수 있다는 확신부터</h2>
            </div>
            <p>
              식물을 고르는 순간보다 함께 살아가는 시간이 더 중요하니까.
              Greening은 생존 가능성, 생활 적합성, 취향 순서로 후보를
              살펴봅니다.
            </p>
          </section>
          <section className="steps">
            <article>
              <span>01</span>
              <h3>공간을 알려주세요</h3>
              <p>전문 용어 없이 낮의 밝기와 식물을 둘 자리만 물어봐요.</p>
            </article>
            <article>
              <span>02</span>
              <h3>생활 리듬을 맞춰봐요</h3>
              <p>집을 비우는 날과 편안한 관리 정도를 추천에 반영해요.</p>
            </article>
            <article>
              <span>03</span>
              <h3>오래 갈 후보를 만나요</h3>
              <p>살아갈 가능성이 높은 세 식물과 솔직한 주의점을 보여드려요.</p>
            </article>
          </section>
          <section className="promiseSection">
            <div>
              <p className="eyebrow light">THE FIRST 90 DAYS</p>
              <h2>처음이라도 괜찮아요.</h2>
              <p>
                배송 후 90일 동안 기본 관리 가이드와 안심 약속을 함께 제공할
                예정이에요.
              </p>
              <button onClick={() => setPanel("guarantee")}>
                90일 안심 약속 보기 →
              </button>
            </div>
            <div className="promiseNumber">
              <strong>90</strong>
              <span>
                days
                <br />
                together
              </span>
            </div>
          </section>
        </>
      )}

      {stage === "opening" && (
        <section className="journey opening">
          <button className="back" onClick={() => go("home")}>
            ← 돌아가기
          </button>
          <div className="openingMark">
            <span>g</span>
          </div>
          <p className="eyebrow">FIND YOUR PLANT</p>
          <h1>
            함께 살 식물을
            <br />
            천천히 찾아볼까요?
          </h1>
          <p>
            정답은 없어요. 지금 공간과 생활에 가장 가까운 답을 고르면 됩니다.
          </p>
          <ul>
            <li>객관식 질문 7개</li>
            <li>약 2분 소요</li>
            <li>결과 전 개인정보 입력 없음</li>
          </ul>
          <button className="primary" onClick={() => go("questions")}>
            시작하기 <span>→</span>
          </button>
        </section>
      )}

      {stage === "questions" && q && (
        <section className="questionPage">
          <div className="questionTop">
            <button
              className="back"
              onClick={() => (qi === 0 ? go("opening") : setQi((x) => x - 1))}
            >
              ← 이전
            </button>
            <span>{q.group}</span>
            <button className="quiet" onClick={reset}>
              나가기
            </button>
          </div>
          <div
            className="progress"
            aria-label={`추천 질문 ${qi + 1}/${questions.length}`}
          >
            <i style={{ width: `${((qi + 1) / questions.length) * 100}%` }} />
          </div>
          <div className="questionBody" key={q.id}>
            <p className="stepLabel">{String(qi + 1).padStart(2, "0")} / 07</p>
            <h1>{q.title}</h1>
            <p className="questionHelper">{q.helper}</p>
            <div className="choices">
              {q.options.map(([label, value, note]) => (
                <button
                  key={value}
                  className={answers[q.id] === value ? "selected" : ""}
                  onClick={() => choose(value)}
                >
                  <span className="choiceRadio" />
                  <span>
                    <b>{label}</b>
                    {note && <small>{note}</small>}
                  </span>
                  <i>→</i>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {stage === "matching" && (
        <section className="matching" aria-live="polite">
          <div className="matchingOrb">
            <span>g</span>
            <i />
            <i />
            <i />
          </div>
          <p className="eyebrow">MATCHING</p>
          <h1>
            지금 당신의 환경에서
            <br />
            오래 함께할 후보를 찾고 있어요.
          </h1>
          <p>위치와 지역 특성을 반영해 어울리는 식물을 찾는 중이에요...</p>
        </section>
      )}

      {stage === "results" && (
        <section className="resultsPage">
          <div className="pageIntro">
            <p className="eyebrow">YOUR MATCHES</p>
            <h1>
              당신에게 먼저
              <br />
              보여드리고 싶은 식물이에요.
            </h1>
            <p>
              키우기 어려운 조건은 먼저 제외하고, 지금 생활과 공간에 비교적 잘
              맞는 후보를 골랐어요.
            </p>
          </div>
          <div className="resultGrid">
            {results.map(({ p }, i) => (
              <article className={i === 0 ? "best" : ""} key={p.slug}>
                <div className="resultImage">
                  <img src={p.image} alt={p.name} />
                  {i === 0 && <span>가장 먼저 추천해요</span>}
                </div>
                <div className="resultContent">
                  <small>{p.scientific}</small>
                  <h2>{p.name}</h2>
                  <p>{p.reason}</p>
                  <dl>
                    <div>
                      <dt>관리 난이도</dt>
                      <dd>{p.difficulty}</dd>
                    </div>
                    <div>
                      <dt>가능한 크기</dt>
                      <dd>{p.tiers.join(" · ")}</dd>
                    </div>
                  </dl>
                  <div className="caution">
                    <b>알아둘 점</b>
                    <span>{p.caution}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSlug(p.slug);
                      setTier(p.tiers[0]);
                      go("detail");
                    }}
                  >
                    자세히 보기 <span>→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
          <div className="resultFooter">
            <button
              className="secondary"
              onClick={() => {
                setQi(0);
                go("questions");
              }}
            >
              답변 다시 보기
            </button>
            <p>추천 기준 · RULE-1.0 / WEIGHT-1.0</p>
          </div>
        </section>
      )}

      {stage === "detail" && (
        <section className="detailPage">
          <button className="back" onClick={() => go("results")}>
            ← 추천 결과
          </button>
          <div className="detailGrid">
            <div className="detailImage">
              <img src={selected.image} alt={selected.name} />
              <span>실제 판매 이미지는 Pilot 전 업데이트될 예정입니다.</span>
            </div>
            <div className="detailInfo">
              <p className="eyebrow">YOUR SELECTED PLANT</p>
              <small>{selected.scientific}</small>
              <h1>{selected.name}</h1>
              <p className="detailSummary">{selected.summary}</p>
              <div className="fitReason">
                <b>당신에게 추천한 이유</b>
                <p>{selected.reason}</p>
              </div>
              <dl className="plantFacts">
                <div>
                  <dt>관리 난이도</dt>
                  <dd>{selected.difficulty}</dd>
                </div>
                <div>
                  <dt>빛</dt>
                  <dd>
                    {selected.light === "bright"
                      ? "밝은 빛"
                      : selected.light === "medium"
                        ? "밝은 간접광"
                        : "적은 빛"}
                  </dd>
                </div>
                <div>
                  <dt>반려동물</dt>
                  <dd>{selected.petSafe ? "함께 지내기 안전" : "섭취 주의"}</dd>
                </div>
              </dl>
              <div className="tierBox">
                <h2>함께할 크기를 골라주세요</h2>
                {selected.tiers.map((t) => (
                  <button
                    key={t}
                    className={activeTier === t ? "selected" : ""}
                    onClick={() => setTier(t)}
                  >
                    <span>
                      <b>{t}</b>
                      <small>{tiers[t].size}</small>
                    </span>
                    <strong>{tiers[t].price.toLocaleString()}원</strong>
                  </button>
                ))}
              </div>
              <div className="guaranteeLine">
                <span>90</span>
                <p>
                  <b>첫 90일 안심 약속</b>
                  <small>
                    처음 키우는 과정에서 필요한 안내를 함께 제공할 예정이에요.
                  </small>
                </p>
              </div>
              <button
                className="primary full"
                onClick={() => {
                  setTier(activeTier);
                  go("commit");
                }}
              >
                이 식물로 시작하기 <span>→</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {stage === "commit" && (
        <section className="narrowPage">
          <button className="back" onClick={() => go("detail")}>
            ← 식물 상세
          </button>
          <p className="eyebrow">YOUR CHOICE</p>
          <h1>
            이 조합으로
            <br />
            시작해볼까요?
          </h1>
          <p className="intro">
            선택한 식물과 구성, 예상 가격을 한 번 더 확인해주세요.
          </p>
          <div className="summaryCard">
            <img src={selected.image} alt="" />
            <div>
              <small>{selected.scientific}</small>
              <h2>{selected.name}</h2>
              <span>{tier}</span>
            </div>
            <strong>{tiers[tier].price.toLocaleString()}원</strong>
          </div>
          <div className="summaryRows">
            <p>
              <span>크기</span>
              <b>{tiers[tier].size}</b>
            </p>
            <p>
              <span>포함 구성</span>
              <b>{tiers[tier].includes}</b>
            </p>
            <p>
              <span>안심 약속</span>
              <b>배송 후 첫 90일 안내 예정</b>
            </p>
          </div>
          <DemoNotice />
          <button className="primary full" onClick={() => go("save")}>
            구매 경험 이어가기 <span>→</span>
          </button>
        </section>
      )}

      {stage === "save" && (
        <section className="narrowPage formPage">
          <button className="back" onClick={() => go("commit")}>
            ← 선택 확인
          </button>
          <p className="eyebrow">SAVE YOUR MATCH</p>
          <h1>
            추천 결과를
            <br />
            저장해둘게요.
          </h1>
          <p className="intro">
            입력한 정보는 이 브라우저의 MVP 체험 상태 저장에만 사용됩니다.
          </p>
          <label>
            이름
            <input
              value={savedName}
              onChange={(e) => setSavedName(e.target.value)}
              placeholder="이름을 입력해주세요"
            />
          </label>
          <label>
            이메일
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </label>
          <label className="consent">
            <input type="checkbox" defaultChecked />
            <span>
              MVP 테스트 관련 안내를 확인했습니다. 마케팅 수신 동의는 포함되지
              않습니다.
            </span>
          </label>
          <button
            className="primary full"
            disabled={!savedName.trim() || !/^\S+@\S+\.\S+$/.test(email)}
            onClick={() => go("checkout")}
          >
            저장하고 계속하기 <span>→</span>
          </button>
          <button className="textButton" onClick={() => go("checkout")}>
            저장하지 않고 계속
          </button>
        </section>
      )}

      {stage === "checkout" && (
        <section className="checkoutPage">
          <button className="back" onClick={() => go("save")}>
            ← 결과 저장
          </button>
          <div className="demoBanner">
            <b>MVP 체험 화면입니다.</b>
            <span>실제 결제와 주문은 발생하지 않습니다.</span>
          </div>
          <div className="checkoutGrid">
            <div>
              <p className="eyebrow">MOCK CHECKOUT</p>
              <h1>
                마지막으로
                <br />
                경험을 확인해주세요.
              </h1>
              <div className="fakeForm">
                <h2>배송 정보</h2>
                <div className="fakeFields">
                  <span>받는 분</span>
                  <span>휴대전화</span>
                  <span className="wide">주소</span>
                </div>
                <small>
                  개인정보 보호를 위해 실제 배송 정보는 입력받지 않아요.
                </small>
              </div>
              <div className="fakeForm">
                <h2>결제 수단</h2>
                <button className="fakePayment">
                  <span>카드 결제 체험</span>
                  <b>실제 카드번호 입력 없음</b>
                </button>
              </div>
            </div>
            <aside>
              <h2>선택 요약</h2>
              <div className="checkoutPlant">
                <img src={selected.image} alt="" />
                <div>
                  <b>{selected.name}</b>
                  <span>
                    {tier} · {tiers[tier].size}
                  </span>
                </div>
              </div>
              <p>
                <span>상품 금액</span>
                <b>{tiers[tier].price.toLocaleString()}원</b>
              </p>
              <p>
                <span>배송비</span>
                <b>무료</b>
              </p>
              <hr />
              <p className="total">
                <span>체험 결제 금액</span>
                <b>{tiers[tier].price.toLocaleString()}원</b>
              </p>
              <button
                className="primary full"
                onClick={() => {
                  track("purchase_intent_completed", {
                    plant: selected.slug,
                    tier,
                  });
                  go("complete");
                }}
              >
                구매하기 · 실제 결제 없음
              </button>
              <small>
                버튼을 눌러도 카드 승인이나 주문 생성은 일어나지 않습니다.
              </small>
            </aside>
          </div>
        </section>
      )}

      {stage === "complete" && (
        <section className="completePage">
          <div className="completeMark">✓</div>
          <p className="eyebrow">MVP COMPLETE</p>
          <h1>
            함께 시작하는 경험을
            <br />
            끝까지 살펴봤어요.
          </h1>
          <p>
            지금은 MVP 테스트 단계예요. 실제 결제와 주문은 발생하지 않았습니다.
          </p>
          <div className="completeChoice">
            <img src={selected.image} alt="" />
            <div>
              <small>당신이 고른 식물</small>
              <b>
                {selected.name} · {tier}
              </b>
            </div>
          </div>
          <button className="primary" onClick={() => go("name")}>
            내 식물의 이름 정하기 <span>→</span>
          </button>
        </section>
      )}

      {stage === "name" && (
        <section className="narrowPage formPage namePage">
          <button className="back" onClick={() => go("complete")}>
            ← 이전
          </button>
          <p className="eyebrow">MAKE IT YOURS</p>
          <h1>
            이제 이 식물의
            <br />
            이름을 정해볼까요?
          </h1>
          <p className="intro">
            이름을 붙이는 순간부터 식물은 상품이 아니라 함께 지낼 존재가 됩니다.
          </p>
          <div className="namePlant">
            <img src={selected.image} alt={selected.name} />
          </div>
          <label>
            식물 이름
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 초록이, 몽이"
              maxLength={12}
            />
          </label>
          <button
            className="primary full"
            disabled={!nickname.trim()}
            onClick={() => go("memory")}
          >
            이 이름으로 시작하기 <span>→</span>
          </button>
          <button
            className="textButton"
            onClick={() => {
              setNickname(selected.name);
              go("memory");
            }}
          >
            나중에 정할게요
          </button>
        </section>
      )}

      {stage === "memory" && (
        <section className="memoryPage">
          <button className="back" onClick={() => go("name")}>
            ← 이름 정하기
          </button>
          <div className="memoryIntro">
            <p className="eyebrow">FIRST MEMORY</p>
            <h1>
              {nickname || selected.name}와의
              <br />첫 기록이 시작됐어요.
            </h1>
            <p>
              실제 기록 기능이 아닌, 앞으로 이어질 돌봄 경험의 미리보기입니다.
            </p>
          </div>
          <article className="memoryCard">
            <img src={selected.image} alt="" />
            <div>
              <time>오늘</time>
              <h2>처음 만났어요.</h2>
              <p>내 공간과 생활에 맞는 {selected.name}를 추천받았어요.</p>
              <span>첫 번째 기억</span>
            </div>
          </article>
          <div className="memoryFuture">
            <span>다음</span>
            <p>앱에서는 함께한 시간과 관리 기록이 차곡차곡 쌓일 예정이에요.</p>
          </div>
          <button className="primary" onClick={() => go("app")}>
            앱 미리보기 <span>→</span>
          </button>
        </section>
      )}

      {stage === "app" && (
        <section className="appPage">
          <div className="phoneMock">
            <div className="phoneTop">
              <span>9:41</span>
              <b>Greening</b>
              <i>•••</i>
            </div>
            <img src={selected.image} alt="" />
            <div className="phoneContent">
              <small>오늘의 {nickname || selected.name}</small>
              <h2>오늘은 편안해 보여요.</h2>
              <p>다음 물주기까지 여유가 있어요.</p>
              <button>기록 남기기</button>
            </div>
          </div>
          <div className="appCopy">
            <span className="coming">COMING SOON</span>
            <p className="eyebrow">GREENING CARE APP</p>
            <h1>
              같이 지내는 시간은
              <br />
              앱에서 이어질 예정이에요.
            </h1>
            <p>
              물 주기 알림보다 먼저, 지금 식물에게 필요한 판단과 함께한 기억을
              차분히 전해드릴게요.
            </p>
            <button className="primary" onClick={() => go("care")}>
              Greening 앱 시작하기 <span>→</span>
            </button>
          </div>
        </section>
      )}

      {stage === "care" && (
        <CareExperience
          plant={selected}
          nickname={nickname || selected.name}
          onExit={() => go("home")}
        />
      )}

      <footer className="siteFooter">
        <div className="brand footerBrand">
          <span>g</span>
          <b>Greening</b>
        </div>
        <p>내 공간에 맞는 식물을 만나고, 오래 함께하는 방법.</p>
        <nav>
          <button onClick={() => setPanel("guarantee")}>90일 안심 약속</button>
          <button onClick={() => setPanel("support")}>도움말</button>
          <button onClick={() => setPanel("privacy")}>개인정보 안내</button>
        </nav>
        <small>© 2026 Greening. Interactive MVP.</small>
      </footer>
      {panel && (
        <div
          className="overlay"
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && setPanel(null)}
        >
          <section
            className="infoPanel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
          >
            <button
              className="close"
              onClick={() => setPanel(null)}
              aria-label="닫기"
            >
              ×
            </button>
            {panel === "guarantee" && (
              <>
                <p className="eyebrow">90-DAY PROMISE</p>
                <h2 id="panel-title">처음 90일을 함께할 약속</h2>
                <p>
                  식물이 새 공간에 적응하는 첫 90일 동안 기본 관리 안내와 문제
                  해결 가이드를 제공하는 방향입니다.
                </p>
                <ul>
                  <li>배송 직후 적응 가이드</li>
                  <li>환경에 맞춘 기본 관리 안내</li>
                  <li>이상 징후 확인 방법</li>
                </ul>
                <DemoNotice />
              </>
            )}
            {panel === "support" && (
              <>
                <p className="eyebrow">SUPPORT</p>
                <h2 id="panel-title">자주 묻는 질문</h2>
                <details open>
                  <summary>추천은 어떤 기준으로 하나요?</summary>
                  <p>
                    생존 가능성, 생활 적합성, 취향 순서로 판단하며 중요한 안전
                    조건은 먼저 제외합니다.
                  </p>
                </details>
                <details>
                  <summary>실제로 구매되는 건가요?</summary>
                  <p>
                    아니요. 현재 MVP에서는 결제, 주문, 배송이 발생하지 않습니다.
                  </p>
                </details>
                <details>
                  <summary>답변을 다시 바꿀 수 있나요?</summary>
                  <p>결과 화면에서 답변 다시 보기를 선택할 수 있어요.</p>
                </details>
              </>
            )}
            {panel === "privacy" && (
              <>
                <p className="eyebrow">PRIVACY</p>
                <h2 id="panel-title">개인정보 안내</h2>
                <p>
                  추천 진행 상태와 선택 결과는 현재 브라우저의 로컬 저장소에만
                  저장합니다. 실제 배송 주소나 카드 정보는 수집하지 않습니다.
                </p>
                <p>‘처음부터 시작’을 선택하면 저장된 진행 상태가 제거됩니다.</p>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

type CareTab =
  "today" | "scan" | "shop" | "doctor" | "diary" | "quiz" | "points";

const careProducts = [
  ...plants.map((p) => ({
    id: p.slug,
    name: p.name,
    image: p.image,
    price: tiers[p.tiers[0]].price,
    category: "식물",
    detail: p.summary,
  })),
  {
    id: "pot",
    name: "Greening 시그니처 화분",
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=700&q=84",
    price: 24000,
    category: "화분",
    detail: "어떤 공간에도 차분하게 어울리는 무광 세라믹 화분",
  },
  {
    id: "mister",
    name: "파인 미스트 분무기",
    image:
      "https://images.unsplash.com/photo-1597868233688-147bbd3a7ff9?auto=format&fit=crop&w=700&q=84",
    price: 12000,
    category: "관리용품",
    detail: "잎 주변 습도를 부드럽게 관리하는 미세 분무기",
  },
  {
    id: "soil",
    name: "통기 배양토 3L",
    image:
      "https://images.unsplash.com/photo-1621460248083-6271cc4437a8?auto=format&fit=crop&w=700&q=84",
    price: 15000,
    category: "관리용품",
    detail: "과습 위험을 줄인 초보자용 배양토",
  },
];

function CareExperience({
  plant,
  nickname,
  onExit,
}: {
  plant: Plant;
  nickname: string;
  onExit: () => void;
}) {
  const [tab, setTab] = useState<CareTab>("today");
  const [points, setPoints] = useState(650);
  const [notice, setNotice] = useState("");
  const [entries, setEntries] = useState([
    {
      date: "오늘",
      title: "처음 만났어요",
      note: `내 공간과 생활에 맞는 ${plant.name}를 추천받았어요.`,
      tag: "첫 기록",
    },
    {
      date: "3일 전",
      title: "새 자리에 적응 중",
      note: "잎 방향과 흙의 마름을 천천히 살펴봤어요.",
      tag: "관찰",
    },
  ]);
  const [diaryText, setDiaryText] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [scanPreview, setScanPreview] = useState("");
  const [scanDone, setScanDone] = useState(false);
  const [doctorText, setDoctorText] = useState("");
  const [doctorBusy, setDoctorBusy] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([
    {
      role: "assistant",
      text: `안녕하세요. ${nickname}(${plant.name})의 상태에서 궁금한 점을 편하게 알려주세요.`,
    },
  ]);
  const [quizStep, setQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const shownProducts = careProducts.filter((p) =>
    `${p.name} ${p.category} ${p.detail}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  function selectTab(next: CareTab) {
    smoothly(() => {
      setTab(next);
      setNotice("");
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    track("care_tab_viewed", { tab: next });
  }
  function addRecord() {
    if (!diaryText.trim()) return;
    setEntries((v) => [
      {
        date: "오늘",
        title: "오늘의 돌봄을 기록했어요",
        note: diaryText,
        tag: "케어 +30P",
      },
      ...v,
    ]);
    setPoints((v) => v + 30);
    setDiaryText("");
    setNotice("기록을 저장하고 30P를 적립했어요.");
  }
  async function askDoctor(text: string) {
    const clean = text.trim();
    if (!clean || doctorBusy) return;
    const next = [...messages, { role: "user" as const, text: clean }];
    setMessages(next);
    setDoctorText("");
    setDoctorBusy(true);
    try {
      const response = await fetch(`${API}/api/v1/doctor/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.slice(-12).map((message) => ({
            role: message.role,
            content: message.text,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.reply) throw new Error("AI 응답 오류");
      setMessages((current) => [
        ...current,
        { role: "assistant", text: data.reply },
      ]);
      track("plant_doctor_replied", { fallback: Boolean(data.fallback) });
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "지금은 AI 닥터 연결이 잠시 불안정해요. 잠시 후 다시 시도하거나, 잎과 흙 상태를 사진과 함께 가까운 화원에 보여주세요.",
        },
      ]);
    } finally {
      setDoctorBusy(false);
    }
  }

  return (
    <section className="careApp">
      <aside className="careSidebar">
        <button className="careLogo" onClick={onExit}>
          <span>g</span>
          <b>Greening</b>
          <small>CARE</small>
        </button>
        <nav aria-label="Care 기능">
          {(
            [
              ["today", "오늘"],
              ["scan", "공간 분석"],
              ["shop", "식물·용품"],
              ["doctor", "AI 식물 닥터"],
              ["diary", "성장 기록"],
              ["quiz", "식물 퀴즈"],
              ["points", "포인트 상점"],
            ] as [CareTab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              className={tab === key ? "active" : ""}
              onClick={() => selectTab(key)}
            >
              <i>
                {key === "today"
                  ? "⌂"
                  : key === "scan"
                    ? "◎"
                    : key === "shop"
                      ? "□"
                      : key === "doctor"
                        ? "+"
                        : key === "diary"
                          ? "○"
                          : key === "quiz"
                            ? "?"
                            : "P"}
              </i>
              {label}
              {key === "shop" && cart.length > 0 && <b>{cart.length}</b>}
            </button>
          ))}
        </nav>
        <div className="careProfile">
          <img src={plant.image} alt="" />
          <span>
            <small>나의 반려식물</small>
            <b>{nickname}</b>
          </span>
        </div>
        <button className="careExit" onClick={onExit}>
          웹 홈으로 나가기
        </button>
      </aside>
      <div className="careMain">
        <header className="careTop">
          <div>
            <small>좋은 아침이에요</small>
            <b>{nickname}와 함께한 5일째</b>
          </div>
          <button onClick={() => selectTab("points")}>
            <span>{points.toLocaleString()}P</span> 사용하기
          </button>
        </header>
        {notice && (
          <div className="careToast" role="status">
            ✓ {notice}
          </div>
        )}

        {tab === "today" && (
          <div className="careView">
            <div className="careTitle">
              <p className="eyebrow">TODAY WITH {nickname.toUpperCase()}</p>
              <h1>오늘은 편안해 보여요.</h1>
              <p>급하게 해야 할 일은 없어요. 흙 마름만 가볍게 확인해 주세요.</p>
            </div>
            <div className="todayGrid">
              <article className="plantHeroCard">
                <img src={plant.image} alt={nickname} />
                <div>
                  <span>상태 좋음</span>
                  <small>{plant.scientific}</small>
                  <h2>{nickname}</h2>
                  <p>{plant.name} · 함께한 지 5일</p>
                </div>
              </article>
              <article className="todayMission">
                <p className="eyebrow">TODAY CARE</p>
                <h2>흙의 마름을 확인해 주세요.</h2>
                <p>
                  손가락 한 마디 깊이까지 흙이 말랐을 때 물을 주세요. 아직
                  촉촉하다면 오늘은 쉬어도 괜찮아요.
                </p>
                <div>
                  <span>
                    <b>다음 물주기</b>2~4일 후 예상
                  </span>
                  <span>
                    <b>빛</b>현재 자리 유지
                  </span>
                </div>
                <button onClick={() => selectTab("diary")}>
                  확인하고 기록 남기기 →
                </button>
              </article>
            </div>
            <div className="careQuick">
              <button onClick={() => selectTab("scan")}>
                <span>◎</span>
                <b>새 공간 분석</b>
                <small>사진으로 빛과 여유 공간 확인</small>
              </button>
              <button onClick={() => selectTab("doctor")}>
                <span>+</span>
                <b>AI 닥터에게 묻기</b>
                <small>이상 징후와 관리 고민 상담</small>
              </button>
              <button onClick={() => selectTab("shop")}>
                <span>□</span>
                <b>추천 관리용품</b>
                <small>{nickname}에게 맞는 용품 보기</small>
              </button>
            </div>
            <section className="careJourney">
              <div>
                <p className="eyebrow">OUR JOURNEY</p>
                <h2>작은 기록이 관계가 돼요.</h2>
              </div>
              <div className="journeyStat">
                <strong>5</strong>
                <span>함께한 날</span>
              </div>
              <div className="journeyStat">
                <strong>{entries.length}</strong>
                <span>쌓인 기록</span>
              </div>
              <div className="journeyStat">
                <strong>{points}</strong>
                <span>돌봄 포인트</span>
              </div>
            </section>
          </div>
        )}

        {tab === "scan" && (
          <div className="careView">
            <div className="careTitle">
              <p className="eyebrow">SPACE SCAN</p>
              <h1>새로운 공간을 보여주세요.</h1>
              <p>
                창문과 식물을 놓고 싶은 자리가 함께 보이면 더 정확하게 살펴볼 수
                있어요.
              </p>
            </div>
            <div className="scanWorkspace">
              <label
                className={`scanDrop ${scanPreview ? "hasImage" : ""}`}
                style={
                  scanPreview
                    ? {
                        backgroundImage: `linear-gradient(#172a2822,#172a2855),url(${scanPreview})`,
                      }
                    : {}
                }
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setScanPreview(URL.createObjectURL(f));
                      setScanDone(false);
                    }
                  }}
                />
                {scanPreview ? (
                  <span>다른 사진 선택</span>
                ) : (
                  <>
                    <i>◎</i>
                    <b>방 사진을 올려주세요</b>
                    <small>JPG, PNG, WEBP · 최대 5MB</small>
                  </>
                )}
              </label>
              <div className="scanGuide">
                <h2>사진에 담으면 좋은 것</h2>
                <ol>
                  <li>
                    <b>01</b>낮의 자연광이 들어오는 창문
                  </li>
                  <li>
                    <b>02</b>식물을 놓고 싶은 가구나 바닥
                  </li>
                  <li>
                    <b>03</b>방 전체 크기를 짐작할 수 있는 구도
                  </li>
                </ol>
                <button
                  className="primary full"
                  disabled={!scanPreview}
                  onClick={() => setScanDone(true)}
                >
                  이 공간 분석하기
                </button>
              </div>
            </div>
            {scanDone && (
              <div className="scanResult">
                <span>분석 완료</span>
                <div>
                  <small>예상 빛</small>
                  <b>밝은 간접광</b>
                </div>
                <div>
                  <small>추천 위치</small>
                  <b>창가에서 1~2m</b>
                </div>
                <div>
                  <small>추천 크기</small>
                  <b>중소형 식물</b>
                </div>
                <button onClick={() => selectTab("shop")}>
                  맞는 식물 보기 →
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "shop" && (
          <div className="careView">
            <div className="careTitle split">
              <div>
                <p className="eyebrow">PLANT & CARE SHOP</p>
                <h1>함께 지내는 데 필요한 것들.</h1>
                <p>
                  식물부터 화분과 관리용품까지 Greening의 기준으로 골랐어요.
                </p>
              </div>
              <div className="cartSummary">
                <span>장바구니</span>
                <b>
                  {cart.length}개 ·{" "}
                  {careProducts
                    .filter((p) => cart.includes(p.id))
                    .reduce((n, p) => n + p.price, 0)
                    .toLocaleString()}
                  원
                </b>
                <button
                  onClick={() => {
                    setCart([]);
                    setNotice("MVP 장바구니 체험을 완료했어요.");
                  }}
                  disabled={!cart.length}
                >
                  모의 주문 완료
                </button>
              </div>
            </div>
            <label className="careSearch">
              ⌕
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="식물이나 관리용품 검색"
              />
            </label>
            <div className="careProducts">
              {shownProducts.map((p) => (
                <article key={p.id}>
                  <div>
                    <img src={p.image} alt={p.name} />
                    <button
                      aria-label={`${p.name} 관심 목록`}
                      onClick={() =>
                        setSaved((v) =>
                          v.includes(p.id)
                            ? v.filter((x) => x !== p.id)
                            : [...v, p.id],
                        )
                      }
                    >
                      {saved.includes(p.id) ? "♥" : "♡"}
                    </button>
                    <span>{p.category}</span>
                  </div>
                  <small>GREENING SELECT</small>
                  <h2>{p.name}</h2>
                  <p>{p.detail}</p>
                  <footer>
                    <b>{p.price.toLocaleString()}원</b>
                    <button
                      onClick={() => {
                        setCart((v) => (v.includes(p.id) ? v : [...v, p.id]));
                        setNotice(`${p.name}을 장바구니에 담았어요.`);
                      }}
                    >
                      {cart.includes(p.id) ? "담김 ✓" : "담기"}
                    </button>
                  </footer>
                </article>
              ))}
            </div>
          </div>
        )}

        {tab === "doctor" && (
          <div className="careView">
            <div className="careTitle">
              <p className="eyebrow">AI PLANT DOCTOR</p>
              <h1>식물 고민을 바로 물어보세요.</h1>
              <p>
                보이는 증상과 최근 관리 상황을 알려주면 확인 순서를 함께
                찾아드려요.
              </p>
            </div>
            <div className="doctorWorkspace">
              <aside>
                <h2>빠른 질문</h2>
                {[
                  "잎끝이 갈색으로 말라요",
                  "잎이 노랗게 변했어요",
                  "흙에 작은 벌레가 보여요",
                  "물을 얼마나 줘야 하나요?",
                ].map((x) => (
                  <button
                    key={x}
                    disabled={doctorBusy}
                    onClick={() => askDoctor(x)}
                  >
                    {x}
                    <span>→</span>
                  </button>
                ))}
                <div>
                  <b>이렇게 알려주세요</b>
                  <p>
                    식물 이름 · 증상 시작일
                    <br />
                    최근 물 준 날짜 · 빛의 양<br />
                    흙이 마른 정도
                  </p>
                </div>
              </aside>
              <section>
                <header>
                  <div className="doctorAvatar">AI</div>
                  <span>
                    <b>닥터 그린</b>
                    <small>
                      {doctorBusy
                        ? "답변을 살펴보는 중"
                        : "AI 온라인 · 대화 문맥 연결됨"}
                    </small>
                  </span>
                  <button
                    onClick={() =>
                      setMessages([
                        {
                          role: "assistant",
                          text: "새 상담을 시작할게요. 어떤 점이 궁금한가요?",
                        },
                      ])
                    }
                  >
                    새 상담
                  </button>
                </header>
                <div className="doctorMessages">
                  {messages.map((m, i) => (
                    <div key={i} className={m.role}>
                      {m.role === "assistant" && <span>AI</span>}
                      <p>{m.text}</p>
                    </div>
                  ))}
                  {doctorBusy && (
                    <div className="assistant doctorThinking">
                      <span>AI</span>
                      <p>
                        <i />
                        <i />
                        <i />
                      </p>
                    </div>
                  )}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    askDoctor(doctorText);
                  }}
                >
                  <input
                    value={doctorText}
                    onChange={(e) => setDoctorText(e.target.value)}
                    placeholder="식물 상태를 자세히 적어주세요"
                  />
                  <button disabled={!doctorText.trim() || doctorBusy}>
                    {doctorBusy ? "답변 중" : "보내기"}
                  </button>
                </form>
              </section>
            </div>
            <p className="medicalNote">
              빠르게 번지는 병충해나 뿌리 부패가 의심되면 가까운 화원 전문가에게
              직접 확인하세요.
            </p>
          </div>
        )}

        {tab === "diary" && (
          <div className="careView">
            <div className="careTitle split">
              <div>
                <p className="eyebrow">GROWTH DIARY</p>
                <h1>돌볼수록 쌓이는 우리의 기록.</h1>
                <p>작은 변화를 기록하면 관리 패턴을 이해하기 쉬워져요.</p>
              </div>
              <div className="diaryPoints">
                <small>사용 가능 포인트</small>
                <b>{points}P</b>
                <button onClick={() => selectTab("points")}>
                  포인트 상점 →
                </button>
              </div>
            </div>
            <div className="diaryWorkspace">
              <aside>
                <img src={plant.image} alt="" />
                <small>나의 반려식물</small>
                <h2>{nickname}</h2>
                <p>{plant.name} · 밝은 간접광</p>
                <label>
                  오늘의 기록
                  <textarea
                    value={diaryText}
                    onChange={(e) => setDiaryText(e.target.value)}
                    placeholder="물주기, 새잎, 흙 상태처럼 오늘의 변화를 적어주세요."
                  />
                </label>
                <button
                  className="primary full"
                  disabled={!diaryText.trim()}
                  onClick={addRecord}
                >
                  저장하고 30P 받기
                </button>
              </aside>
              <section className="careTimeline">
                <h2>식물 로그</h2>
                {entries.map((e, i) => (
                  <article key={`${e.date}-${i}`}>
                    <time>{e.date}</time>
                    <div>
                      <span>{e.tag}</span>
                      <h3>{e.title}</h3>
                      <p>{e.note}</p>
                    </div>
                  </article>
                ))}
              </section>
            </div>
          </div>
        )}

        {tab === "quiz" && (
          <div className="careView quizWorkspace">
            <p className="eyebrow">PLANT KNOWLEDGE</p>
            {quizStep < 4 ? (
              <>
                <div className="quizBar">
                  <i style={{ width: `${(quizStep + 1) * 25}%` }} />
                </div>
                <small>{quizStep + 1} / 4</small>
                <h1>
                  {
                    [
                      "물을 주기 전 가장 먼저 확인할 것은?",
                      "잎끝이 갈색일 때 먼저 살펴볼 것은?",
                      "식물을 새 자리에 둔 직후에는?",
                      "반려동물과 함께라면 가장 중요한 것은?",
                    ][quizStep]
                  }
                </h1>
                <div className="careQuizOptions">
                  {[
                    ["겉흙과 속흙의 마름", "요일", "화분 색"],
                    [
                      "흙의 수분과 공기 건조",
                      "잎을 모두 자르기",
                      "매일 비료 주기",
                    ],
                    [
                      "며칠간 변화를 관찰하기",
                      "매일 자리 옮기기",
                      "바로 분갈이하기",
                    ],
                    ["식물의 섭취 안전성", "화분 무게", "잎의 개수"],
                  ][quizStep].map((x, i) => (
                    <button
                      key={x}
                      onClick={() => {
                        setQuizScore((v) => v + (i === 0 ? 1 : 0));
                        setQuizStep((v) => v + 1);
                      }}
                    >
                      {x}
                      <span>→</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="careQuizResult">
                <span>{quizScore === 4 ? "✓" : "+"}</span>
                <small>CARE QUIZ COMPLETE</small>
                <h1>
                  {quizScore === 4
                    ? "식물의 신호를 잘 읽고 있어요."
                    : "관찰하는 습관부터 시작해봐요."}
                </h1>
                <p>
                  4문제 중 {quizScore}문제를 맞혔어요. 참여 보상으로 50P를 받을
                  수 있어요.
                </p>
                <button
                  className="primary"
                  onClick={() => {
                    setPoints((v) => v + 50);
                    setNotice("퀴즈 참여 보상 50P를 받았어요.");
                    setQuizStep(0);
                    setQuizScore(0);
                  }}
                >
                  50P 받고 다시 도전
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "points" && (
          <div className="careView">
            <div className="pointsHero">
              <div>
                <p className="eyebrow light">GREENING POINTS</p>
                <h1>
                  돌보는 습관이
                  <br />
                  다음 돌봄으로 이어져요.
                </h1>
                <p>기록과 퀴즈로 모은 포인트를 관리용품 체험에 사용해보세요.</p>
              </div>
              <div>
                <small>사용 가능</small>
                <strong>{points.toLocaleString()}P</strong>
                <span>이번 달 +180P</span>
              </div>
            </div>
            <h2 className="pointHeading">포인트로 교환하기</h2>
            <div className="pointGoods">
              {[
                {
                  name: "통기 배양토 1L",
                  cost: 400,
                  image: careProducts[7].image,
                },
                { name: "식물 이름표", cost: 250, image: plant.image },
                {
                  name: "미세 분무기",
                  cost: 600,
                  image: careProducts[6].image,
                },
              ].map((g) => (
                <article key={g.name}>
                  <img src={g.image} alt="" />
                  <div>
                    <h3>{g.name}</h3>
                    <p>{g.cost}P</p>
                    <button
                      disabled={points < g.cost}
                      onClick={() => {
                        setPoints((v) => v - g.cost);
                        setNotice(`${g.name} 교환 체험을 완료했어요.`);
                      }}
                    >
                      교환하기
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <section className="earnPoints">
              <h2>포인트를 모으는 방법</h2>
              <div>
                <span>
                  <b>+30P</b>오늘의 관리 기록
                </span>
                <span>
                  <b>+50P</b>식물 퀴즈 참여
                </span>
                <span>
                  <b>+20P</b>주간 상태 확인
                </span>
              </div>
            </section>
          </div>
        )}
      </div>
    </section>
  );
}

function DemoNotice() {
  return (
    <div className="mvpNotice">
      <b>이번 화면은 MVP 구매 경험입니다.</b>
      <p>
        실제 결제, 주문, 배송은 발생하지 않아요. 카드 정보도 입력받지 않습니다.
      </p>
    </div>
  );
}
