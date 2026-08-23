"use client";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=80";
type Plant = {
  id: string;
  common_name: string;
  scientific_name?: string;
  description: string;
  difficulty: number;
  price: number;
  score?: number;
  category?: "plant" | "pot" | "care" | "soil" | "package";
  image?: string;
  petSafe?: boolean;
  large?: boolean;
};
type CartItem = {
  key: string;
  plant: Plant;
  quantity: number;
  pot: string;
  packageName: string;
  unitPrice: number;
};
type DoctorChatMessage = { role: "user" | "assistant"; content: string };
const demo: Plant[] = [
  {
    id: "1",
    common_name: "테이블야자",
    scientific_name: "Chamaedorea elegans",
    description: "부드러운 잎과 작은 크기로 책상 위에 잘 어울려요.",
    difficulty: 2,
    price: 15000,
    score: 96,
    category: "plant",
    image:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=85",
    petSafe: true,
  },
  {
    id: "2",
    common_name: "스킨답서스",
    scientific_name: "Epipremnum aureum",
    description: "빛이 적은 방에서도 씩씩하게 자라는 다정한 식물이에요.",
    difficulty: 1,
    price: 12000,
    score: 92,
    category: "plant",
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "3",
    common_name: "몬스테라",
    scientific_name: "Monstera deliciosa",
    description: "넓고 선명한 잎이 공간에 생기를 더해줘요.",
    difficulty: 2,
    price: 32000,
    score: 88,
    category: "plant",
    image:
      "https://images.unsplash.com/photo-1690818083154-e4eaa4e8b8ac?auto=format&fit=crop&w=1000&q=85",
    large: true,
  },
];
const quests = [
  { n: "7", t: "7일 동안 건강하게", r: "500P", p: 72 },
  { n: "↗", t: "첫 새잎 인증", r: "10% 쿠폰", p: 35 },
  { n: "30", t: "30일 성장 사진", r: "무료배송", p: 18 },
];
const catalog: Plant[] = [
  ...demo,
  {
    id: "4",
    common_name: "아레카야자",
    scientific_name: "Dypsis lutescens",
    description: "풍성한 잎이 천연 가습기 역할을 하는 펫 프렌들리 식물이에요.",
    difficulty: 2,
    price: 45000,
    score: 91,
    category: "plant",
    image:
      "https://images.unsplash.com/photo-1583955967842-14dd8d6b8257?auto=format&fit=crop&w=1000&q=85",
    petSafe: true,
    large: true,
  },
  {
    id: "5",
    common_name: "산세베리아 문샤인",
    scientific_name: "Dracaena trifasciata",
    description: "한 달에 한두 번 물을 줘도 건강한 초보자 대표 식물이에요.",
    difficulty: 1,
    price: 24000,
    score: 94,
    category: "plant",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "6",
    common_name: "보스턴 고사리",
    scientific_name: "Nephrolepis exaltata",
    description:
      "반려동물에게 안전하고 촉촉한 공간을 좋아하는 풍성한 고사리예요.",
    difficulty: 3,
    price: 21000,
    score: 86,
    category: "plant",
    image:
      "https://images.unsplash.com/photo-1690221115995-8c80b43aac01?auto=format&fit=crop&w=1000&q=85",
    petSafe: true,
  },
  {
    id: "7",
    common_name: "올리브 나무",
    scientific_name: "Olea europaea",
    description: "햇빛 좋은 창가에 지중해의 따뜻한 분위기를 더해줘요.",
    difficulty: 3,
    price: 39000,
    score: 82,
    category: "plant",
    image:
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1000&q=85",
    large: true,
  },
  {
    id: "8",
    common_name: "인도고무나무",
    scientific_name: "Ficus elastica",
    description: "두껍고 윤기 나는 잎이 차분한 공간에 잘 어울려요.",
    difficulty: 2,
    price: 29000,
    score: 89,
    category: "plant",
    large: true,
    image:
      "https://images.unsplash.com/photo-1653788214734-c9c55f67c703?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "9",
    common_name: "금전수",
    scientific_name: "Zamioculcas zamiifolia",
    description: "건조와 낮은 빛을 잘 견뎌 바쁜 사람에게 든든해요.",
    difficulty: 1,
    price: 26000,
    score: 93,
    category: "plant",
    image:
      "https://images.unsplash.com/photo-1614594575810-ecbb2d3f5cc5?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "10",
    common_name: "극락조",
    scientific_name: "Strelitzia reginae",
    description: "큰 잎과 곧은 수형으로 거실에 선명한 포인트를 만들어요.",
    difficulty: 3,
    price: 52000,
    score: 84,
    category: "plant",
    large: true,
    image:
      "https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "11",
    common_name: "페페로미아",
    scientific_name: "Peperomia obtusifolia",
    description: "통통한 잎이 귀엽고 반려동물과 사는 작은 방에도 좋아요.",
    difficulty: 1,
    price: 14000,
    score: 95,
    category: "plant",
    petSafe: true,
    image:
      "https://images.unsplash.com/photo-1509423350716-97f2360af8e4?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "12",
    common_name: "칼라데아 오르비폴리아",
    scientific_name: "Goeppertia orbifolia",
    description: "은빛 줄무늬 잎이 돋보이는 반려동물 안전 식물이에요.",
    difficulty: 3,
    price: 33000,
    score: 87,
    category: "plant",
    petSafe: true,
    image:
      "https://images.unsplash.com/photo-1632321353847-5c6c49c1aef7?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "pot-1",
    common_name: "핸드메이드 테라코타",
    description: "통기성이 좋은 국내 제작 토분과 받침 세트예요.",
    difficulty: 1,
    price: 18000,
    category: "pot",
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "pot-2",
    common_name: "오프화이트 세라믹 화분",
    description: "어떤 가구에도 자연스럽게 섞이는 무광 원통 화분이에요.",
    difficulty: 1,
    price: 24000,
    category: "pot",
    image:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "care-1",
    common_name: "롱스파우트 물뿌리개",
    description: "좁은 잎 사이에도 정확히 물을 주는 1L 물뿌리개예요.",
    difficulty: 1,
    price: 16000,
    category: "care",
    image:
      "https://images.unsplash.com/photo-1597868165921-3e37f22b0c6b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "care-2",
    common_name: "미세 분무기",
    description: "고사리와 열대식물 주변 습도를 섬세하게 관리해요.",
    difficulty: 1,
    price: 9000,
    category: "care",
    image:
      "https://images.unsplash.com/photo-1597868233688-147bbd3a7ff9?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "soil-1",
    common_name: "초보자 통기 배양토 5L",
    description: "펄라이트와 코코피트를 배합해 과습 위험을 낮췄어요.",
    difficulty: 1,
    price: 12000,
    category: "soil",
    image:
      "https://images.unsplash.com/photo-1621460248083-6271cc4437a8?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "soil-2",
    common_name: "뿌리 활력 영양제",
    description: "분갈이 뒤 뿌리 활착과 새잎 성장을 돕는 희석형 영양제예요.",
    difficulty: 1,
    price: 8000,
    category: "soil",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "pack-1",
    common_name: "처음 만나는 초록 패키지",
    description: "식물·화분·관리도구·센서·이름표를 한 상자에 담았어요.",
    difficulty: 1,
    price: 49000,
    category: "package",
    image:
      "https://images.unsplash.com/photo-1583955967842-14dd8d6b8257?auto=format&fit=crop&w=1000&q=85",
  },
];
const symptoms = [
  "잎끝이 갈색으로 말라요",
  "아래 잎이 노랗게 변해요",
  "줄기가 축 처지고 물러요",
  "흰 솜 같은 벌레가 보여요",
  "줄기가 길고 잎이 작아져요",
  "검은 반점이 번져요",
];
const pointGoods = [
  {
    id: "soil",
    icon: "🌱",
    image:
      "https://images.unsplash.com/photo-1621460248083-6271cc4437a8?auto=format&fit=crop&w=700&q=82",
    name: "통기 배양토 1L",
    price: 800,
    desc: "과습 걱정을 줄이는 초보자용 배양토",
  },
  {
    id: "ampoule",
    icon: "💚",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=700&q=82",
    name: "활력 앰플 2개",
    price: 600,
    desc: "새잎과 뿌리 활착을 돕는 영양 앰플",
  },
  {
    id: "mister",
    icon: "💧",
    image:
      "https://images.unsplash.com/photo-1597868233688-147bbd3a7ff9?auto=format&fit=crop&w=700&q=82",
    name: "파인 미스트 분무기",
    price: 1200,
    desc: "잎 주변 습도를 부드럽게 관리해요",
  },
  {
    id: "tag",
    icon: "🏷️",
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=700&q=82",
    name: "나만의 식물 이름표",
    price: 400,
    desc: "반려식물 이름을 적는 우드 이름표",
  },
];
export default function Home() {
  const [view, setView] = useState<
      "home" | "analyze" | "dash" | "market" | "doctor" | "diary" | "quiz"
    >("home"),
    [auth, setAuth] = useState(false),
    [mode, setMode] = useState<"register" | "login">("register");
  const [token, setToken] = useState(""),
    [name, setName] = useState("초록이"),
    [notice, setNotice] = useState(""),
    [file, setFile] = useState<File | null>(null),
    [preview, setPreview] = useState(""),
    [busy, setBusy] = useState(false),
    [plants, setPlants] = useState(demo),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("전체"),
    [category, setCategory] = useState<Plant["category"] | "all">("all"),
    [recommendedNames, setRecommendedNames] = useState<string[]>([]),
    [saved, setSaved] = useState<string[]>([]),
    [doctorText, setDoctorText] = useState(""),
    [doctorBusy, setDoctorBusy] = useState(false),
    [doctorMessages, setDoctorMessages] = useState<DoctorChatMessage[]>([
      { role: "assistant", content: "안녕하세요, AI 식물 닥터 그린입니다. 식물 이름과 지금 보이는 증상을 편하게 말씀해주세요. 제가 한 단계씩 함께 살펴볼게요." },
    ]),
    [quizStep, setQuizStep] = useState(0),
    [quizScore, setQuizScore] = useState(0),
    [entries, setEntries] = useState([
      {
        date: "8월 20일",
        title: "새 찢잎이 완전히 펼쳐진 날",
        tag: "새잎",
        note: "거실 창가에서 몬이가 일곱 번째 잎을 보여줬어요.",
      },
      {
        date: "8월 14일",
        title: "물을 듬뿍 준 날",
        tag: "물주기",
        note: "겉흙이 마른 걸 확인하고 천천히 저면관수했어요.",
      },
    ]),
    [selected, setSelected] = useState<Plant | null>(null),
    [quantity, setQuantity] = useState(1),
    [pot, setPot] = useState("기본 토분"),
    [packageName, setPackageName] = useState("식물만"),
    [cart, setCart] = useState<CartItem[]>([]),
    [cartOpen, setCartOpen] = useState(false),
    [checkout, setCheckout] = useState(false),
    [paid, setPaid] = useState(false),
    [diaryOpen, setDiaryOpen] = useState(false),
    [activity, setActivity] = useState("watering"),
    [diaryNote, setDiaryNote] = useState(""),
    [diaryPhoto, setDiaryPhoto] = useState(false),
    [points, setPoints] = useState(650),
    [pointOpen, setPointOpen] = useState(false),
    [pointHistory, setPointHistory] = useState([
      { label: "회원가입 시작 포인트", amount: 500 },
      { label: "7일 건강 돌봄 퀘스트", amount: 150 },
    ]),
    [exchanges, setExchanges] = useState<string[]>([]);
  const picker = useRef<HTMLInputElement>(null);
  const shown = useMemo(() => {
    const list = catalog.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (filter === "전체" ||
          filter === "추천" ||
          (filter === "초보" && p.difficulty <= 1) ||
          (filter === "반려동물" && p.petSafe) ||
          (filter === "대형" && p.large)) &&
        `${p.common_name} ${p.scientific_name || ""} ${p.description}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    );
    return [...list].sort((a, b) => {
      const ai = recommendedNames.indexOf(a.common_name),
        bi = recommendedNames.indexOf(b.common_name);
      if (ai < 0 && bi < 0) return 0;
      if (ai < 0) return 1;
      if (bi < 0) return -1;
      return ai - bi;
    });
  }, [search, filter, category, recommendedNames]);
  const cartCount = cart.reduce((n, x) => n + x.quantity, 0),
    cartTotal = cart.reduce((n, x) => n + x.unitPrice * x.quantity, 0);
  const imageFor = (product: Plant) =>
    product.image ||
    catalog.find((item) => item.common_name === product.common_name)?.image ||
    FALLBACK_IMAGE;
  const openProduct = (product: Plant) => {
    setSelected(product);
    setQuantity(1);
    setPot(product.category === "plant" ? "기본 토분" : "해당 없음");
    setPackageName(product.category === "plant" ? "식물만" : "단품");
  };
  const addToCart = () => {
    if (!selected) return;
    const product = selected;
    const extra =
      product.category === "plant"
        ? (pot === "세라믹 화분" ? 9000 : pot === "디자이너 토분" ? 14000 : 0) +
          (packageName === "스타터 패키지" ? 12000 : 0)
        : 0;
    const chosenPot = product.category === "plant" ? pot : "해당 없음";
    const chosenPackage = product.category === "plant" ? packageName : "단품";
    const unitPrice = Number(product.price) + extra;
    setCart((current) => {
      const same = current.find(
        (item) =>
          item.plant.id === product.id &&
          item.pot === chosenPot &&
          item.packageName === chosenPackage,
      );
      if (same)
        return current.map((item) =>
          item.key === same.key
            ? { ...item, quantity: Math.min(99, item.quantity + quantity) }
            : item,
        );
      return [
        ...current,
        {
          key: `${product.id}-${Date.now()}`,
          plant: product,
          quantity,
          pot: chosenPot,
          packageName: chosenPackage,
          unitPrice,
        },
      ];
    });
    setNotice(`${product.common_name} ${quantity}개를 장바구니에 담았어요.`);
    setSelected(null);
    setCartOpen(true);
    setQuantity(1);
  };
  const addDiary = () => {
    const meta: Record<string, { label: string; point: number }> = {
        observation: { label: "상태 관찰", point: 20 },
        watering: { label: "물주기 완료", point: 30 },
        new_leaf: { label: "새잎 인증", point: 80 },
        repotting: { label: "분갈이 완료", point: 60 },
        doctor_followup: { label: "닥터 처방 실천", point: 40 },
      },
      m = meta[activity];
    setEntries((e) => [
      {
        date: "오늘",
        title: m.label,
        tag: m.label,
        note: diaryNote || "오늘의 관리 미션을 완료했어요.",
      },
      ...e,
    ]);
    const earned = m.point + (diaryPhoto ? 20 : 0);
    setPoints((p) => p + earned);
    setPointHistory((h) => [
      {
        label: `${m.label}${diaryPhoto ? " + 사진 인증" : ""}`,
        amount: earned,
      },
      ...h,
    ]);
    setDiaryOpen(false);
    setDiaryNote("");
    setDiaryPhoto(false);
    setNotice(`${m.label} 기록 완료! ${earned}P가 적립됐어요.`);
  };
  const goAnalyze = () => {
    setView("analyze");
    scrollTo({ top: 0, behavior: "smooth" });
  };
  async function submitAuth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      body: Record<string, unknown> = {
        email: f.get("email"),
        password: f.get("password"),
      };
    if (mode === "register") body.displayName = f.get("displayName");
    try {
      const r = await fetch(`${API}/api/v1/auth/${mode}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        j = await r.json();
      if (!r.ok) throw Error(j.error?.message);
      if (mode === "register") {
        setMode("login");
        setNotice("가입됐어요! 같은 정보로 로그인해주세요.");
      } else {
        setToken(j.accessToken);
        setName(j.user.displayName);
        setAuth(false);
        setView("dash");
      }
    } catch (x) {
      setNotice(x instanceof Error ? x.message : "연결할 수 없어요");
    }
  }
  function choose(e: ChangeEvent<HTMLInputElement>) {
    const x = e.target.files?.[0];
    if (x) {
      setFile(x);
      setPreview(URL.createObjectURL(x));
    }
  }
  async function analyze() {
    if (!file) {
      picker.current?.click();
      return;
    }
    if (!token) {
      setNotice("결과를 저장하려면 먼저 가입해주세요.");
      setAuth(true);
      return;
    }
    setBusy(true);
    try {
      const sr = await fetch(`${API}/api/v1/spaces`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "나의 방",
            lifestyle: { level: "beginner" },
          }),
        }),
        s = await sr.json();
      if (!sr.ok) throw Error(s.error?.message);
      const form = new FormData();
      form.append("image", file);
      const ar = await fetch(`${API}/api/v1/spaces/${s.id}/analyze`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }),
        a = await ar.json();
      if (!ar.ok) throw Error(a.error?.message);
      const rr = await fetch(`${API}/api/v1/spaces/${s.id}/recommendations`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }),
        rec = await rr.json();
      const matched: Plant[] = rec.items?.length ? rec.items : demo;
      setPlants(matched);
      setRecommendedNames(matched.map((p) => p.common_name));
      setCategory("plant");
      setFilter("추천");
      setNotice("사진 분석 결과와 잘 맞는 식물을 먼저 보여드려요.");
      setView("market");
    } catch (x) {
      setNotice(x instanceof Error ? x.message : "분석 중 문제가 생겼어요");
    } finally {
      setBusy(false);
    }
  }
  async function askDoctor(question: string) {
    const clean = question.trim();
    if (!clean || doctorBusy) return;
    const next: DoctorChatMessage[] = [...doctorMessages, { role: "user", content: clean }];
    setDoctorMessages(next);
    setDoctorText("");
    setDoctorBusy(true);
    try {
      const response = await fetch(`${API}/api/v1/doctor/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-12) }),
      });
      const data = await response.json();
      if (!response.ok || !data.reply) throw new Error("AI 닥터 연결 오류");
      setDoctorMessages((messages) => [...messages, { role: "assistant", content: data.reply }]);
    } catch {
      const fallback = /노랗|축축|과습/.test(clean)
        ? "흙이 계속 축축하면서 잎이 노랗다면 과습 가능성이 있어요. 우선 물주기를 멈추고 받침의 물을 비워주세요. 최근 물을 준 날짜와 식물 이름을 알려주실래요?"
        : /벌레|솜|거미줄/.test(clean)
          ? "병충해 가능성이 있어 보여요. 다른 식물과 먼저 분리하고 잎 앞뒤를 확인해주세요. 벌레의 색과 크기를 알려주시면 더 좁혀볼게요."
          : "지금은 AI 연결이 잠시 불안정하지만 상담은 계속할 수 있어요. 식물 이름, 최근 물 준 날짜, 햇빛이 드는 시간과 흙의 촉감을 알려주세요.";
      setDoctorMessages((messages) => [...messages, { role: "assistant", content: fallback }]);
    } finally {
      setDoctorBusy(false);
    }
  }
  return (
    <main>
      <header>
        <button className="brand" onClick={() => setView("home")}>
          <i>G</i>Greening
        </button>
        <nav>
          <button onClick={goAnalyze}>공간 분석</button>
          <button onClick={() => setView("quiz")}>맞춤 테스트</button>
          <button onClick={() => setView("market")}>식물 찾기</button>
          <button onClick={() => setView("doctor")}>식물 닥터</button>
          <button onClick={() => setView("diary")}>성장 기록</button>
          <button onClick={() => setPointOpen(true)}>포인트 상점</button>
        </nav>
        <button className="cartButton" onClick={() => setCartOpen(true)}>
          장바구니 <b>{cartCount}</b>
        </button>
        {token ? (
          <button className="profile" onClick={() => setView("dash")}>
            🌱 {name}
          </button>
        ) : (
          <button className="navCta" onClick={() => setAuth(true)}>
            시작하기
          </button>
        )}
      </header>
      {view === "home" && (
        <>
          <section className="hero">
            <div>
              <p className="eyebrow">PLANT YOUR MOMENT</p>
              <h1>
                내 방에 찾아온
                <br />
                <em>작은 초록의 시작</em>
              </h1>
              <p className="lead">
                공간 사진 한 장이면 충분해요. 빛과 분위기를 살펴보고 오래 함께할
                수 있는 반려식물을 찾아드릴게요.
              </p>
              <div className="actions">
                <button className="primary" onClick={goAnalyze}>
                  내 공간 분석하기 →
                </button>
                <button
                  className="link"
                  onClick={() =>
                    document
                      .querySelector(".how")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  어떻게 시작하나요?
                </button>
              </div>
              <div className="trust">
                ✓ 초보자 맞춤 추천　✓ 관리 알림　✓ 성장 보상
              </div>
            </div>
            <div className="room">
              <img
                className="roomPhoto"
                src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1400&q=88"
                alt="식물이 놓인 실제 거실"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              <div className="scan">
                <span>✓</span>
                <p>
                  이 공간의 빛<strong>밝은 간접광</strong>
                </p>
                <mark>분석 완료</mark>
              </div>
            </div>
          </section>
          <section className="how">
            <div className="title">
              <p className="eyebrow">HOW IT WORKS</p>
              <h2>어려운 준비는 저희가 할게요</h2>
              <p>당신은 마음에 드는 초록을 고르기만 하세요.</p>
            </div>
            <div className="steps">
              {[
                [
                  "01",
                  "▣",
                  "공간을 보여주세요",
                  "방 사진과 생활 패턴으로 빛과 분위기를 살펴봐요.",
                ],
                [
                  "02",
                  "✦",
                  "잘 맞는 식물을 만나요",
                  "예쁘기만 한 식물보다 실제로 잘 살 친구를 추천해요.",
                ],
                [
                  "03",
                  "⌂",
                  "함께 키워가요",
                  "관리 알림과 성장 퀘스트로 즐겁게 돌봐요.",
                ],
              ].map((x) => (
                <article key={x[0]}>
                  <span>{x[0]}</span>
                  <i>{x[1]}</i>
                  <h3>{x[2]}</h3>
                  <p>{x[3]}</p>
                </article>
              ))}
            </div>
          </section>
          <section className="match">
            <div>
              <p className="eyebrow">A BETTER MATCH</p>
              <h2>
                식물도 공간과
                <br />
                궁합이 있어요
              </h2>
              <p>
                햇빛, 습도, 놓을 자리와 생활 리듬까지. 식물이 오래 머물 수 있는
                조건을 먼저 봅니다.
              </p>
              <button className="link light" onClick={goAnalyze}>
                나의 식물 궁합 알아보기 →
              </button>
            </div>
            <article className="featured">
              <div>
                <img
                  src={imageFor(demo[0])}
                  alt="실제 테이블야자"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              </div>
              <small>나의 공간 추천 1위</small>
              <h3>테이블야자</h3>
              <p>은은한 빛 · 주 1회 물주기</p>
              <b>
                <i />
                96%
              </b>
            </article>
          </section>
          <section className="rewards">
            <div>
              <p className="eyebrow">GROW TOGETHER</p>
              <h2>
                잘 키운 오늘이
                <br />
                다음 혜택이 돼요
              </h2>
              <p>
                새잎이 난 날, 함께한 지 30일. 작은 성장의 순간을 기록하고 보상을
                받아보세요.
              </p>
            </div>
            <div>
              {quests.slice(0, 2).map((q) => (
                <article key={q.t}>
                  <i>{q.n}</i>
                  <p>
                    <strong>{q.t}</strong>
                    <small>오늘의 상태를 기록해요</small>
                  </p>
                  <b>{q.r}</b>
                </article>
              ))}
            </div>
          </section>
          <section className="serviceHub">
            <div className="title">
              <p className="eyebrow">ALL IN ONE PLANT CARE</p>
              <h2>처음 만나는 날부터 아픈 날까지</h2>
              <p>식물 생활에 필요한 순간을 한곳에서 이어가세요.</p>
            </div>
            <div>
              {[
                [
                  "✦",
                  "1분 맞춤 테스트",
                  "생활 리듬과 취향으로 식물을 찾아요",
                  "quiz",
                ],
                [
                  "⌕",
                  "식물 닥터",
                  "아픈 잎의 증상과 대처법을 확인해요",
                  "doctor",
                ],
                [
                  "▤",
                  "성장 다이어리",
                  "물주기와 새잎의 순간을 기록해요",
                  "diary",
                ],
                [
                  "♧",
                  "식물 라이브러리",
                  "식물과 관리용품을 탐색하고 저장해요",
                  "market",
                ],
              ].map((x) => (
                <button key={x[1]} onClick={() => setView(x[3] as typeof view)}>
                  <i>{x[0]}</i>
                  <strong>{x[1]}</strong>
                  <span>{x[2]}</span>
                  <b>→</b>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
      {view === "analyze" && (
        <section className="analyze">
          <div>
            <p className="eyebrow">SPACE SCAN</p>
            <h1>
              당신의 공간을
              <br />
              보여주세요
            </h1>
            <p className="lead">
              창문과 식물을 놓고 싶은 자리가 함께 보이도록 촬영하면 더 정확해요.
            </p>
            <ol>
              <li>
                <b>1</b>방 전체가 보이는 사진 선택
              </li>
              <li>
                <b>2</b>AI가 빛과 여유 공간 분석
              </li>
              <li>
                <b>3</b>공간에 어울리는 식물 추천
              </li>
            </ol>
          </div>
          <div className="upload">
            <input
              ref={picker}
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={choose}
            />
            <button
              className={`drop ${preview ? "filled" : ""}`}
              onClick={() => picker.current?.click()}
              style={
                preview
                  ? {
                      backgroundImage: `linear-gradient(#18322522,#18322555),url(${preview})`,
                    }
                  : {}
              }
            >
              {!preview ? (
                <>
                  <i>◎</i>
                  <strong>방 사진을 올려주세요</strong>
                  <small>JPG, PNG, WEBP · 최대 5MB</small>
                </>
              ) : (
                <span>사진 바꾸기</span>
              )}
            </button>
            <div className="privacy">
              ⌁{" "}
              <p>
                <b>사진은 안전하게 다뤄져요</b>
                <br />
                공간 분석 이외의 목적으로 사용하지 않습니다.
              </p>
            </div>
            {notice && <p className="notice">{notice}</p>}
            <button className="primary full" disabled={busy} onClick={analyze}>
              {busy ? "공간을 살펴보는 중..." : "이 사진으로 분석하기 →"}
            </button>
          </div>
        </section>
      )}
      {view === "dash" && (
        <section className="dashboard">
          <div className="dashHead">
            <div>
              <p className="eyebrow">MY GREEN ROOM</p>
              <h1>
                {name}님의 공간에
                <br />이 식물들이 잘 맞아요
              </h1>
            </div>
            <button className="outline" onClick={goAnalyze}>
              ＋ 다른 공간 분석
            </button>
          </div>
          {notice && <div className="success">✓ {notice}</div>}
          <div className="insights">
            <div>
              ☀ <small>예상 조도</small>
              <b>밝은 간접광</b>
            </div>
            <div>
              ⌂ <small>추천 위치</small>
              <b>창가에서 1~2m</b>
            </div>
            <div>
              ♡ <small>관리 난이도</small>
              <b>초보자에게 쉬움</b>
            </div>
          </div>
          <div className="dashGrid">
            <section>
              <div className="sub">
                <h2>추천 식물</h2>
                <span>{plants.length}개의 식물</span>
              </div>
              <div className="plantGrid">
                {plants.slice(0, 6).map((p, i) => (
                  <article
                    className="plantCard"
                    key={p.id}
                    onClick={() => openProduct(p)}
                    onKeyDown={(event) =>
                      event.key === "Enter" && openProduct(p)
                    }
                    role="button"
                    tabIndex={0}
                  >
                    <div className="art photoArt">
                      <img
                        src={imageFor(p)}
                        alt={p.common_name}
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                      <b>{Math.round(Number(p.score) || 90)}%</b>
                    </div>
                    <div className="plantText">
                      <small>공간과 잘 맞아요</small>
                      <h3>{p.common_name}</h3>
                      <i>{p.scientific_name}</i>
                      <p>{p.description}</p>
                      <div>
                        <span>
                          난이도 {"●".repeat(Math.min(p.difficulty, 3))}
                        </span>
                        <strong>{Number(p.price).toLocaleString()}원</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <aside>
              <div className="sub">
                <h2>성장 퀘스트</h2>
                <span>전체 보기</span>
              </div>
              <div className="companion">
                <i>🪴</i>
                <p>
                  <small>오늘의 반려식물</small>
                  <b>{plants[0]?.common_name}</b>
                  <span>함께한 지 5일째</span>
                </p>
              </div>
              {quests.map((q) => (
                <article className="quest" key={q.t}>
                  <i>{q.n}</i>
                  <p>
                    <strong>{q.t}</strong>
                    <small>성장 순간을 기록해요</small>
                    <span>
                      <b style={{ width: `${q.p}%` }} />
                    </span>
                  </p>
                  <em>{q.r}</em>
                </article>
              ))}
              <button className="primary full">오늘의 성장 기록 남기기</button>
            </aside>
          </div>
        </section>
      )}
      {view === "market" && (
        <section className="featurePage marketPage">
          <div className="pageHero">
            <p className="eyebrow">PLANT LIBRARY</p>
            <h1>
              내 생활에 맞는
              <br />
              초록을 찾아보세요
            </h1>
            <p>
              식물부터 화분, 관리용품까지 한 번에 탐색하고 관심 목록에 저장할 수
              있어요.
            </p>
          </div>
          <div className="marketTools">
            <label>
              ⌕
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="식물 이름이나 특징을 검색하세요"
              />
            </label>
            <div>
              {[
                "전체",
                ...(recommendedNames.length ? ["추천"] : []),
                "초보",
                "대형",
              ].map((x) => (
                <button
                  className={filter === x ? "on" : ""}
                  onClick={() => setFilter(x)}
                  key={x}
                >
                  {x}
                </button>
              ))}
            </div>
          </div>
          <div className="categoryRow">
            {[
              ["PL", "반려식물", "plant"],
              ["PT", "디자이너 화분", "pot"],
              ["CR", "관리용품", "care"],
              ["SO", "배양토·영양제", "soil"],
              ["BX", "스타터 패키지", "package"],
            ].map((x) => (
              <button
                key={x[1]}
                onClick={() => {
                  setCategory(x[2] as Plant["category"]);
                  setFilter("전체");
                  setNotice(`${x[1]} 카테고리를 선택했어요.`);
                }}
              >
                <i>{x[0]}</i>
                <b>{x[1]}</b>
              </button>
            ))}
          </div>
          {recommendedNames.length > 0 && category === "plant" && (
            <div className="recommendStrip">
              <span>YOUR MATCH</span>
              <p>
                <b>{recommendedNames.slice(0, 2).join(", ")}</b>을(를) 분석
                결과에 따라 가장 먼저 배치했어요.
              </p>
              <button onClick={() => setRecommendedNames([])}>
                추천 표시 닫기
              </button>
            </div>
          )}
          <div className="marketHead">
            <h2>
              {category === "all"
                ? "전체 라이브러리"
                : category === "plant"
                  ? "반려식물"
                  : category === "pot"
                    ? "디자이너 화분"
                    : category === "care"
                      ? "관리용품"
                      : category === "soil"
                        ? "배양토·영양제"
                        : "스타터 패키지"}
            </h2>
            <span>{shown.length}개</span>
          </div>
          <div className="marketGrid">
            {shown.map((p, i) => (
              <article
                key={p.id}
                onClick={() => openProduct(p)}
                role="button"
                tabIndex={0}
              >
                <div className="productArt">
                  <img
                    src={imageFor(p)}
                    alt={p.common_name}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                  <em>
                    {recommendedNames.includes(p.common_name)
                      ? "맞춤 추천"
                      : p.difficulty === 1
                        ? "초보 추천"
                        : i % 2
                          ? "공기 정화"
                          : "공간 포인트"}
                  </em>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSaved((s) =>
                        s.includes(p.id)
                          ? s.filter((id) => id !== p.id)
                          : [...s, p.id],
                      );
                    }}
                  >
                    {saved.includes(p.id) ? "♥" : "♡"}
                  </button>
                </div>
                <div>
                  <small>
                    {p.category === "plant"
                      ? `난이도 ${p.difficulty} · 실제 식물명`
                      : "Greening 셀렉트 · 생활 원예용품"}
                  </small>
                  <h3>{p.common_name}</h3>
                  <p>{p.description}</p>
                  <footer>
                    <b>{p.price.toLocaleString()}원</b>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openProduct(p);
                      }}
                    >
                      옵션 선택
                    </button>
                  </footer>
                </div>
              </article>
            ))}
          </div>
          {notice && <div className="toast">{notice}</div>}
        </section>
      )}
      {view === "doctor" && (
        <section className="featurePage doctorPage">
          <div className="pageHero">
            <p className="eyebrow">GREENING AI PLANT DOCTOR · ONLINE</p>
            <h1>
              식물 고민을 바로 묻는
              <br />
              나만의 AI 닥터
            </h1>
            <p>
              증상을 자유롭게 이야기하고 추가 질문을 이어가세요. 대화의 문맥을
              기억해 지금 필요한 관리 순서를 함께 찾아드려요.
            </p>
          </div>
          <div className="aiDoctorShell">
            <aside className="doctorSide">
              <div className="doctorIdentity"><span>AI</span><div><b>닥터 그린</b><small><i /> 실시간 상담 가능</small></div></div>
              <h3>빠른 질문</h3>
              <div className="doctorPrompts">
                {symptoms.slice(0, 5).map((x) => <button key={x} onClick={() => askDoctor(x)}>{x}<span>→</span></button>)}
              </div>
              <div className="doctorTip"><b>이렇게 알려주세요</b><p>식물 이름 · 증상 시작일<br />최근 물 준 날짜 · 빛의 양<br />흙이 마른 정도</p></div>
            </aside>
            <section className="doctorChat">
              <header><div><b>AI 식물 닥터</b><small>대화 내용을 바탕으로 관리 방법을 안내해요</small></div><button onClick={() => setDoctorMessages([{ role:"assistant", content:"새 상담을 시작할게요. 어떤 식물이 아픈가요?" }])}>새 상담</button></header>
              <div className="chatMessages">
                {doctorMessages.map((message, index) => (
                  <div className={`chatBubble ${message.role}`} key={`${message.role}-${index}`}>
                    {message.role === "assistant" && <span>AI</span>}
                    <p>{message.content}</p>
                  </div>
                ))}
                {doctorBusy && <div className="chatBubble assistant"><span>AI</span><p className="typing"><i /><i /><i /></p></div>}
              </div>
              <div className="chatSuggestions">
                {["몬스테라 잎이 노래요", "물을 얼마나 줘야 하나요?", "흙에 작은 벌레가 보여요"].map((x) => <button key={x} onClick={() => askDoctor(x)}>{x}</button>)}
              </div>
              <form className="doctorComposer" onSubmit={(e) => { e.preventDefault(); askDoctor(doctorText); }}>
                <label className="chatAttach" title="사진 첨부 준비 중">＋<input type="file" accept="image/*" hidden /></label>
                <textarea value={doctorText} onChange={(e) => setDoctorText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askDoctor(doctorText); } }} placeholder="식물 상태를 자세히 적어주세요…" />
                <button type="submit" disabled={!doctorText.trim() || doctorBusy}>보내기</button>
              </form>
            </section>
          </div>
          <p className="medicalNote">
            AI 식물 닥터는 관리 판단을 돕는 가이드입니다. 병충해가 빠르게 번지거나 뿌리가 급격히 썩으면 가까운 화원 전문가에게 확인하세요.
          </p>
        </section>
      )}
      {view === "diary" && (
        <section className="featurePage diaryPage">
          <div className="pageHero">
            <p className="eyebrow">GROWTH DIARY</p>
            <h1>
              관리할수록 쌓이는
              <br />
              우리의 성장 기록
            </h1>
            <p>
              오늘 필요한 돌봄 미션을 완료하고 기록하면 포인트와 퀘스트 진척을
              함께 얻어요.
            </p>
          </div>
          <div className="careFlow">
            <div>
              <span>1</span>
              <b>오늘의 케어 확인</b>
              <small>흙 마름과 잎 상태를 살펴봐요</small>
            </div>
            <i>→</i>
            <div>
              <span>2</span>
              <b>관리 행동 인증</b>
              <small>물주기·새잎·분갈이를 기록해요</small>
            </div>
            <i>→</i>
            <div>
              <span>3</span>
              <b>포인트 적립</b>
              <small>상점에서 관리용품으로 교환해요</small>
            </div>
          </div>
          <div className="diaryGrid">
            <aside>
              <div className="diaryPlant">🪴</div>
              <small>나의 반려식물</small>
              <h2>몬이</h2>
              <p>몬스테라 · 거실 창가</p>
              <div className="todayCare">
                <strong>오늘의 추천 케어</strong>
                <span>흙 마름 확인 + 잎 닦기</span>
                <button onClick={() => setDiaryOpen(true)}>
                  완료하고 기록하기
                </button>
              </div>
              <dl>
                <div>
                  <dt>함께한 날</dt>
                  <dd>35일</dd>
                </div>
                <div>
                  <dt>최근 물주기</dt>
                  <dd>3일 전</dd>
                </div>
                <div>
                  <dt>사용 가능 포인트</dt>
                  <dd>{points}P</dd>
                </div>
              </dl>
              <button className="pointLink" onClick={() => setPointOpen(true)}>
                포인트 적립·사용 내역 →
              </button>
            </aside>
            <section>
              <div className="diaryHead">
                <h2>식물 로그</h2>
                <button className="primary" onClick={() => setDiaryOpen(true)}>
                  ＋ 관리 기록 인증
                </button>
              </div>
              {notice && <div className="success">{notice}</div>}
              <div className="timeline">
                {entries.map((e, i) => (
                  <article key={`${e.date}${i}`}>
                    <i />
                    <time>{e.date}</time>
                    <div>
                      <span>{e.tag}</span>
                      <h3>{e.title}</h3>
                      <p>{e.note}</p>
                      {i === 0 && <div className="logPhoto">🌱</div>}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      )}
      {view === "quiz" && (
        <section className="featurePage quizPage">
          <div className="quizCard">
            <p className="eyebrow">1 MINUTE PLANT MATCH</p>
            {quizStep < 4 ? (
              <>
                <div className="quizProgress">
                  <i style={{ width: `${(quizStep + 1) * 25}%` }} />
                </div>
                <small>{quizStep + 1} / 4</small>
                <h1>
                  {
                    [
                      "내 방의 햇빛은 어떤가요?",
                      "물주기를 얼마나 자주 챙길 수 있나요?",
                      "원하는 식물의 크기는요?",
                      "반려동물과 함께 살고 있나요?",
                    ][quizStep]
                  }
                </h1>
                <div className="quizOptions">
                  {[
                    [
                      "햇살이 오래 들어와요",
                      "은은한 빛이 들어와요",
                      "빛이 거의 없어요",
                    ],
                    [
                      "매주 잘 챙길 수 있어요",
                      "가끔 잊어버려요",
                      "한 달에 한두 번이 좋아요",
                    ],
                    [
                      "책상 위 작은 식물",
                      "공간 포인트 중형 식물",
                      "거실을 채우는 큰 식물",
                    ],
                    [
                      "함께 살고 있어요",
                      "없지만 안전한 식물이 좋아요",
                      "해당 없어요",
                    ],
                  ][quizStep].map((x, i) => (
                    <button
                      key={x}
                      onClick={() => {
                        setQuizScore((s) => s + i);
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
              <div className="quizResult">
                <span>🌿</span>
                <small>당신의 식물 타입</small>
                <h1>
                  {quizScore > 5
                    ? "햇살을 닮은 플랜테리어형"
                    : "느긋하고 단단한 초록 친구형"}
                </h1>
                <p>
                  {quizScore > 5
                    ? "밝은 공간에서 존재감 있게 자라는 몬스테라와 아레카야자가 잘 맞아요."
                    : "자주 돌보지 않아도 씩씩한 산세베리아와 스킨답서스가 잘 맞아요."}
                </p>
                <div>
                  {(quizScore > 5
                    ? catalog.filter((p) => ["3", "4", "7"].includes(p.id))
                    : catalog.filter((p) => ["2", "5"].includes(p.id))
                  ).map((p) => (
                    <b key={p.id}>{p.common_name}</b>
                  ))}
                </div>
                <button
                  className="primary"
                  onClick={() => {
                    const names =
                      quizScore > 5
                        ? ["몬스테라", "아레카야자", "올리브 나무", "극락조"]
                        : [
                            "산세베리아 문샤인",
                            "스킨답서스",
                            "금전수",
                            "페페로미아",
                          ];
                    setRecommendedNames(names);
                    setCategory("plant");
                    setFilter("추천");
                    setNotice(
                      "맞춤 테스트 결과를 기준으로 추천 식물을 먼저 정렬했어요.",
                    );
                    setView("market");
                  }}
                >
                  추천 식물 보러가기 →
                </button>
                <button
                  className="link"
                  onClick={() => {
                    setQuizStep(0);
                    setQuizScore(0);
                  }}
                >
                  다시 테스트하기
                </button>
              </div>
            )}
          </div>
        </section>
      )}
      <footer>
        <button className="brand">
          <i>G</i>Greening
        </button>
        <p>식물과 함께 시작하는 조금 더 다정한 일상.</p>
        <span>© 2026 Greening</span>
      </footer>
      {selected && (
        <div className="backdrop" onMouseDown={() => setSelected(null)}>
          <section
            className="productModal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button className="close" onClick={() => setSelected(null)}>
              ×
            </button>
            <div className="productHero">
              <img
                key={`${selected.id}-${pot}-${packageName}`}
                className={
                  selected.category === "plant"
                    ? `plantPreview ${pot === "세라믹 화분" ? "ceramic" : pot === "디자이너 토분" ? "designer" : "terracotta"}`
                    : "productPreview"
                }
                src={imageFor(selected)}
                alt={`${selected.common_name} ${pot} ${packageName} 미리보기`}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              <b>
                {selected.category !== "plant"
                  ? "GREENING SELECT"
                  : recommendedNames.includes(selected.common_name)
                    ? "맞춤 추천 1순위"
                    : `${Math.round(Number(selected.score) || 90)}% 공간 매칭`}
              </b>
              <div className="previewCaption">
                <small>LIVE PREVIEW</small>
                <strong>
                  {selected.category === "plant"
                    ? `${pot} · ${packageName}`
                    : selected.common_name}
                </strong>
              </div>
              {selected.category === "plant" && (
                <div
                  className={`potSample ${pot === "세라믹 화분" ? "ceramic" : pot === "디자이너 토분" ? "designer" : "terracotta"}`}
                >
                  <i />
                  <span>{pot}</span>
                  {packageName === "스타터 패키지" && <em>도구 + 센서 포함</em>}
                </div>
              )}
            </div>
            <div className="productOptions">
              <p className="eyebrow">RECOMMENDED FOR YOUR ROOM</p>
              <h2>{selected.common_name}</h2>
              <i>{selected.scientific_name}</i>
              <p>{selected.description}</p>
              {selected.category === "plant" ? (
                <>
                  <ul>
                    <li>✓ 초보자용 맞춤 관리 가이드</li>
                    <li>✓ 안전 포장 및 건강 도착 보장</li>
                    <li>✓ 성장 퀘스트 자동 시작</li>
                  </ul>
                  <label>
                    화분 선택
                    <select
                      value={pot}
                      onChange={(e) => setPot(e.target.value)}
                    >
                      <option>기본 토분</option>
                      <option>세라믹 화분</option>
                      <option>디자이너 토분</option>
                    </select>
                  </label>
                  <label>
                    구성 선택
                    <select
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                    >
                      <option>식물만</option>
                      <option>스타터 패키지</option>
                    </select>
                  </label>
                </>
              ) : (
                <ul className="goodsInfo">
                  <li>✓ 선택한 상품 단품으로 배송</li>
                  <li>✓ 화분·패키지 옵션이 적용되지 않아요</li>
                  <li>✓ 데모 주문으로 결제 비용 없음</li>
                </ul>
              )}
              <label>
                수량
                <div className="quantity">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <b>{quantity}</b>
                  <button
                    onClick={() => setQuantity((q) => Math.min(9, q + 1))}
                  >
                    ＋
                  </button>
                </div>
              </label>
              <div className="productTotal">
                <span>예상 금액</span>
                <b>
                  {(
                    (selected.price +
                      (selected.category === "plant"
                        ? (pot === "세라믹 화분"
                            ? 9000
                            : pot === "디자이너 토분"
                              ? 14000
                              : 0) +
                          (packageName === "스타터 패키지" ? 12000 : 0)
                        : 0)) *
                    quantity
                  ).toLocaleString()}
                  원
                </b>
              </div>
              <button
                type="button"
                className="primary full addCartButton"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  addToCart();
                }}
              >
                장바구니에 담기
              </button>
            </div>
          </section>
        </div>
      )}
      {cartOpen && (
        <div className="drawerShade" onMouseDown={() => setCartOpen(false)}>
          <aside
            className="cartDrawer"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="drawerHead">
              <div>
                <p className="eyebrow">MY CART</p>
                <h2>
                  장바구니 <small>{cartCount}</small>
                </h2>
              </div>
              <button onClick={() => setCartOpen(false)}>×</button>
            </div>
            {cart.length === 0 ? (
              <div className="emptyCart">
                <span>🧺</span>
                <h3>장바구니가 비어 있어요</h3>
                <p>추천 식물을 눌러 옵션을 선택해보세요.</p>
                <button
                  className="outline"
                  onClick={() => {
                    setCartOpen(false);
                    setView("market");
                  }}
                >
                  식물 둘러보기
                </button>
              </div>
            ) : (
              <>
                <div className="cartList">
                  {cart.map((x) => (
                    <article key={x.key}>
                      <img
                        className="cartThumb"
                        src={imageFor(x.plant)}
                        alt={x.plant.common_name}
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                      <div>
                        <h3>{x.plant.common_name}</h3>
                        <p>
                          {x.pot} · {x.packageName}
                        </p>
                        <small>
                          {x.quantity}개 · {x.unitPrice.toLocaleString()}원
                        </small>
                      </div>
                      <button
                        onClick={() =>
                          setCart((c) => c.filter((i) => i.key !== x.key))
                        }
                      >
                        삭제
                      </button>
                    </article>
                  ))}
                </div>
                <div className="cartSummary">
                  <p>
                    <span>상품 금액</span>
                    <b>{cartTotal.toLocaleString()}원</b>
                  </p>
                  <p>
                    <span>배송비</span>
                    <b>{cartTotal >= 50000 ? "무료" : "3,000원"}</b>
                  </p>
                  <strong>
                    <span>총 결제 예정 금액</span>
                    <b>
                      {(
                        cartTotal + (cartTotal >= 50000 ? 0 : 3000)
                      ).toLocaleString()}
                      원
                    </b>
                  </strong>
                </div>
                <div className="demoBanner">
                  학교 프로젝트 시연용이며 실제 결제·청구는 발생하지 않습니다.
                </div>
                <button
                  className="primary full"
                  onClick={() => {
                    setCartOpen(false);
                    setCheckout(true);
                    setPaid(false);
                  }}
                >
                  데모 결제하기 →
                </button>
              </>
            )}
          </aside>
        </div>
      )}
      {checkout && (
        <div className="backdrop">
          <section className="checkoutModal">
            {!paid ? (
              <>
                <p className="demoTag">DEMO CHECKOUT · 실제 결제 없음</p>
                <h2>배송 정보와 결제 수단</h2>
                <div className="checkoutSteps">
                  <b>1 장바구니</b>
                  <b>2 정보 입력</b>
                  <b>3 체험 결제</b>
                </div>
                <label>
                  받는 분<input defaultValue={name} />
                </label>
                <label>
                  연락처
                  <input placeholder="010-0000-0000" />
                </label>
                <label>
                  배송 주소
                  <input placeholder="학교 프로젝트용 데모 주소" />
                </label>
                <div className="payMethods">
                  <button className="on">신용·체크카드</button>
                  <button>간편결제</button>
                  <button>무통장입금</button>
                </div>
                <div className="fakeCard">
                  <span>DEMO CARD</span>
                  <b>••••　••••　••••　2026</b>
                  <small>실제 카드 정보는 입력하지 않습니다.</small>
                </div>
                <button
                  className="primary full"
                  onClick={() => {
                    setPaid(true);
                    setCart([]);
                  }}
                >
                  {(
                    cartTotal + (cartTotal >= 50000 ? 0 : 3000)
                  ).toLocaleString()}
                  원 결제 체험 완료하기
                </button>
                <button className="switch" onClick={() => setCheckout(false)}>
                  취소
                </button>
              </>
            ) : (
              <div className="paid">
                <span>✓</span>
                <p className="eyebrow">DEMO ORDER COMPLETE</p>
                <h2>주문 체험이 완료됐어요</h2>
                <p>
                  실제 결제나 배송 요청은 발생하지 않았습니다.
                  <br />
                  학교 발표에서 구매 흐름을 시연할 수 있어요.
                </p>
                <b>데모 주문번호 GREEN-{Date.now().toString().slice(-6)}</b>
                <button
                  className="primary"
                  onClick={() => {
                    setCheckout(false);
                    setView("diary");
                  }}
                >
                  반려식물 관리 시작하기
                </button>
              </div>
            )}
          </section>
        </div>
      )}
      {diaryOpen && (
        <div className="backdrop" onMouseDown={() => setDiaryOpen(false)}>
          <section
            className="diaryModal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button className="close" onClick={() => setDiaryOpen(false)}>
              ×
            </button>
            <p className="eyebrow">CARE MISSION LOG</p>
            <h2>오늘 어떤 돌봄을 했나요?</h2>
            <p>
              실제로 한 관리 행동을 선택하면 난이도에 따라 포인트가 적립돼요.
            </p>
            <div className="activityGrid">
              {[
                ["observation", "👀", "상태 관찰", "20P"],
                ["watering", "💧", "물주기", "30P"],
                ["new_leaf", "🌱", "새잎 인증", "80P"],
                ["repotting", "🪴", "분갈이", "60P"],
                ["doctor_followup", "🩺", "닥터 처방 실천", "40P"],
              ].map((x) => (
                <button
                  className={activity === x[0] ? "on" : ""}
                  onClick={() => setActivity(x[0])}
                  key={x[0]}
                >
                  <i>{x[1]}</i>
                  <b>{x[2]}</b>
                  <span>+{x[3]}</span>
                </button>
              ))}
            </div>
            <label>
              관리 메모
              <textarea
                value={diaryNote}
                onChange={(e) => setDiaryNote(e.target.value)}
                placeholder="흙이 충분히 말라서 물을 줬어요. 잎 뒷면도 확인했어요."
              />
            </label>
            <label className="proofUpload">
              {diaryPhoto ? "✓ 성장 사진 선택됨" : "＋ 성장 사진 첨부"}{" "}
              <small>사진 인증 시 보너스 +20P</small>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(event) =>
                  setDiaryPhoto(Boolean(event.target.files?.[0]))
                }
              />
            </label>
            <div className="missionExplain">
              <b>왜 기록하나요?</b>
              <p>
                식물의 관리 주기와 상태 변화를 연결해 다음 물주기와 케어 알림을
                더 정확하게 만들고, 퀘스트 달성 여부도 확인해요.
              </p>
            </div>
            <button className="primary full" onClick={addDiary}>
              관리 완료 인증하고 포인트 받기
            </button>
          </section>
        </div>
      )}
      {pointOpen && (
        <div className="backdrop" onMouseDown={() => setPointOpen(false)}>
          <section
            className="pointModal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button className="close" onClick={() => setPointOpen(false)}>
              ×
            </button>
            <div className="pointTop">
              <div>
                <p className="eyebrow">GREENING POINT SHOP</p>
                <h2>{points.toLocaleString()}P</h2>
                <span>사용 가능한 성장 포인트</span>
              </div>
              <button onClick={() => setView("diary")}>
                포인트 모으러 가기 →
              </button>
            </div>
            <div className="earnGuide">
              <h3>포인트는 이렇게 모아요</h3>
              <div>
                {[
                  ["👀", "상태 관찰", "20P"],
                  ["💧", "물주기", "30P"],
                  ["📷", "사진 인증", "+20P"],
                  ["🌱", "새잎 인증", "80P"],
                  ["🪴", "분갈이", "60P"],
                  ["🏆", "퀘스트 완료", "최대 500P"],
                ].map((x) => (
                  <span key={x[1]}>
                    <i>{x[0]}</i>
                    <b>{x[1]}</b>
                    <em>+{x[2]}</em>
                  </span>
                ))}
              </div>
            </div>
            <h3>관리용품 교환</h3>
            <div className="pointGoods">
              {pointGoods.map((g) => (
                <article key={g.id}>
                  <img
                    src={g.image}
                    alt={g.name}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                  <h4>{g.name}</h4>
                  <p>{g.desc}</p>
                  <b>{g.price.toLocaleString()}P</b>
                  <button
                    disabled={points < g.price}
                    onClick={() => {
                      setPoints((p) => p - g.price);
                      setPointHistory((h) => [
                        { label: `${g.name} 교환`, amount: -g.price },
                        ...h,
                      ]);
                      setExchanges((e) => [g.name, ...e]);
                    }}
                  >
                    {points >= g.price ? "포인트로 교환" : "포인트 부족"}
                  </button>
                </article>
              ))}
            </div>
            <div className="pointBottom">
              <div>
                <h3>최근 적립·사용</h3>
                {pointHistory.slice(0, 5).map((h, i) => (
                  <p key={`${h.label}${i}`}>
                    <span>{h.label}</span>
                    <b className={h.amount > 0 ? "plus" : ""}>
                      {h.amount > 0 ? "+" : ""}
                      {h.amount}P
                    </b>
                  </p>
                ))}
              </div>
              <div>
                <h3>교환 보관함</h3>
                {exchanges.length ? (
                  exchanges.map((x, i) => (
                    <p key={`${x}${i}`}>✓ {x} · 교환 완료</p>
                  ))
                ) : (
                  <p>아직 교환한 관리용품이 없어요.</p>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
      {auth && (
        <div className="backdrop" onMouseDown={() => setAuth(false)}>
          <section className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setAuth(false)}>
              ×
            </button>
            <p className="eyebrow">WELCOME TO GREENING</p>
            <h2>
              {mode === "register"
                ? "초록 생활을 시작해요"
                : "다시 만나 반가워요"}
            </h2>
            <p>
              {mode === "register"
                ? "내 공간과 잘 맞는 식물을 만나보세요."
                : "나의 반려식물에게 돌아가 볼까요?"}
            </p>
            <form onSubmit={submitAuth}>
              {mode === "register" && (
                <label>
                  닉네임
                  <input
                    name="displayName"
                    required
                    minLength={2}
                    placeholder="어떻게 불러드릴까요?"
                  />
                </label>
              )}
              <label>
                이메일
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="hello@greening.kr"
                />
              </label>
              <label>
                비밀번호
                <input
                  name="password"
                  type="password"
                  required
                  minLength={10}
                  placeholder="10자 이상 입력해주세요"
                />
              </label>
              {notice && <p className="notice">{notice}</p>}
              <button className="primary full">
                {mode === "register" ? "가입하고 시작하기" : "로그인"}
              </button>
            </form>
            <button
              className="switch"
              onClick={() => {
                setMode(mode === "register" ? "login" : "register");
                setNotice("");
              }}
            >
              {mode === "register"
                ? "이미 함께하고 있나요? 로그인"
                : "처음이신가요? 회원가입"}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
