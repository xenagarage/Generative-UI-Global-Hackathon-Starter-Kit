"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Droplets,
  Plane,
  Send,
  ShieldCheck,
  Utensils,
} from "lucide-react";
import { type ElementType, useEffect, useMemo, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Vec2 = { x: number; y: number };

type Zone = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  labelColor: string;
};

type RouteSegment = {
  id: string;
  points: Vec2[];
  color: string;
  dashed?: boolean;
};

type MapMarker = {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
  ring?: boolean;
};

type Mode = {
  id: string;
  label: string;
  Icon: ElementType<{ className?: string }>;
  accent: string;
  bgFrom: string;
  prompt: string;
  tagline: string;
  zones: Zone[];
  routes: RouteSegment[];
  markers: MapMarker[];
  insights: string[];
  animRoute: Vec2[];
  animSpeed: number;
};

// ─── Mode data ────────────────────────────────────────────────────────────────

const MODES: Mode[] = [
  {
    id: "travel",
    label: "Travel Advisor",
    Icon: Plane,
    accent: "#60a5fa",
    bgFrom: "rgba(96,165,250,0.10)",
    prompt:
      "You're a travel adviser. Help me travel for work in this city May 19–22. Optimize for timeliness.",
    tagline: "Work trip · May 19–22 · Optimised for timeliness",
    zones: [
      { id: "airport", label: "Airport", x: 4, y: 4, w: 20, h: 16, fill: "rgba(96,165,250,0.22)", labelColor: "#93c5fd" },
      { id: "biz", label: "Business District", x: 34, y: 28, w: 28, h: 22, fill: "rgba(96,165,250,0.14)", labelColor: "#93c5fd" },
      { id: "hotel", label: "Hotel Zone", x: 66, y: 54, w: 22, h: 20, fill: "rgba(96,165,250,0.18)", labelColor: "#93c5fd" },
    ],
    routes: [
      { id: "r1", points: [{ x: 14, y: 12 }, { x: 30, y: 24 }, { x: 48, y: 39 }, { x: 77, y: 64 }], color: "#60a5fa" },
    ],
    markers: [
      { id: "m1", x: 14, y: 12, label: "Departure", color: "#60a5fa", ring: true },
      { id: "m2", x: 48, y: 39, label: "Meeting A", color: "#60a5fa" },
      { id: "m3", x: 77, y: 64, label: "Hotel", color: "#60a5fa" },
    ],
    insights: [
      "Direct flight saves 2 h 40 m vs connecting",
      "Meeting → Hotel: 14 min metro, line 3",
      "Hotel checkout 10 am fits 11 am flight",
    ],
    animRoute: [{ x: 14, y: 12 }, { x: 30, y: 24 }, { x: 48, y: 39 }, { x: 77, y: 64 }],
    animSpeed: 0.032,
  },
  {
    id: "restaurants",
    label: "Restaurant Finder",
    Icon: Utensils,
    accent: "#f59e0b",
    bgFrom: "rgba(245,158,11,0.08)",
    prompt:
      "You're a restaurant recommender. Find top spots for a business dinner near my hotel. Walkable only, tonight.",
    tagline: "Business dinner · Walkable · Top-rated tonight",
    zones: [
      { id: "fine", label: "Fine Dining", x: 6, y: 18, w: 22, h: 20, fill: "rgba(245,158,11,0.20)", labelColor: "#fcd34d" },
      { id: "bistro", label: "Bistros", x: 40, y: 12, w: 22, h: 18, fill: "rgba(245,158,11,0.14)", labelColor: "#fcd34d" },
      { id: "casual", label: "Casual", x: 64, y: 48, w: 22, h: 22, fill: "rgba(245,158,11,0.12)", labelColor: "#fcd34d" },
    ],
    routes: [
      { id: "walk", points: [{ x: 77, y: 64 }, { x: 66, y: 54 }, { x: 54, y: 40 }, { x: 43, y: 21 }], color: "#f59e0b", dashed: true },
    ],
    markers: [
      { id: "r1", x: 14, y: 28, label: "La Maison ⭐4.8", color: "#f59e0b", ring: true },
      { id: "r2", x: 43, y: 21, label: "Bistro Nord ⭐4.6", color: "#f59e0b" },
      { id: "r3", x: 72, y: 57, label: "The Corner ⭐4.5", color: "#f59e0b" },
      { id: "h1", x: 77, y: 64, label: "Your Hotel", color: "#e7e5e4" },
    ],
    insights: [
      "La Maison: 18 min walk, Michelin-listed",
      "Bistro Nord: best for groups of 4+",
      "The Corner: outdoor terrace, 5 min walk",
    ],
    animRoute: [{ x: 77, y: 64 }, { x: 66, y: 54 }, { x: 54, y: 40 }, { x: 43, y: 21 }, { x: 14, y: 28 }],
    animSpeed: 0.025,
  },
  {
    id: "flooding",
    label: "Flood Analyzer",
    Icon: Droplets,
    accent: "#22d3ee",
    bgFrom: "rgba(34,211,238,0.09)",
    prompt:
      "You're a flooding analyzer. Assess flood risk for this area during the incoming storm system this weekend.",
    tagline: "Storm risk · 72 h window · 3 risk zones",
    zones: [
      { id: "high", label: "High Risk", x: 4, y: 52, w: 30, h: 34, fill: "rgba(34,211,238,0.38)", labelColor: "#67e8f9" },
      { id: "med", label: "Medium Risk", x: 28, y: 32, w: 30, h: 28, fill: "rgba(34,211,238,0.20)", labelColor: "#67e8f9" },
      { id: "low", label: "Low Risk", x: 57, y: 12, w: 34, h: 42, fill: "rgba(34,211,238,0.09)", labelColor: "#67e8f9" },
    ],
    routes: [
      { id: "evac", points: [{ x: 10, y: 74 }, { x: 26, y: 58 }, { x: 48, y: 42 }, { x: 74, y: 28 }], color: "#22d3ee", dashed: true },
    ],
    markers: [
      { id: "f1", x: 12, y: 76, label: "⚠ Levee", color: "#22d3ee", ring: true },
      { id: "f2", x: 28, y: 58, label: "⚠ Creek overflow", color: "#22d3ee" },
      { id: "f3", x: 74, y: 28, label: "✓ Shelter", color: "#4ade80" },
    ],
    insights: [
      "Low-lying zone: expected 40 cm inundation",
      "Storm surge peaks Sat 3 am – 9 am",
      "Evacuation via Route 7 recommended",
    ],
    animRoute: [{ x: 10, y: 74 }, { x: 26, y: 58 }, { x: 48, y: 42 }, { x: 74, y: 28 }],
    animSpeed: 0.02,
  },
  {
    id: "events",
    label: "Event Planner",
    Icon: CalendarDays,
    accent: "#a78bfa",
    bgFrom: "rgba(167,139,250,0.08)",
    prompt:
      "You're an event logistics planner. I have 3 meetings across this city tomorrow morning. Optimise my route.",
    tagline: "3 meetings · Tomorrow morning · Route optimised",
    zones: [
      { id: "conv", label: "Convention Ctr", x: 8, y: 8, w: 26, h: 18, fill: "rgba(167,139,250,0.22)", labelColor: "#c4b5fd" },
      { id: "hub", label: "Startup Hub", x: 40, y: 33, w: 22, h: 18, fill: "rgba(167,139,250,0.16)", labelColor: "#c4b5fd" },
      { id: "cowork", label: "Coworking", x: 64, y: 56, w: 22, h: 20, fill: "rgba(167,139,250,0.16)", labelColor: "#c4b5fd" },
    ],
    routes: [
      { id: "leg1", points: [{ x: 21, y: 17 }, { x: 36, y: 28 }, { x: 51, y: 42 }], color: "#a78bfa" },
      { id: "leg2", points: [{ x: 51, y: 42 }, { x: 62, y: 54 }, { x: 75, y: 66 }], color: "#a78bfa", dashed: true },
    ],
    markers: [
      { id: "e1", x: 21, y: 17, label: "9:00 Keynote", color: "#a78bfa", ring: true },
      { id: "e2", x: 51, y: 42, label: "11:30 Demo", color: "#a78bfa" },
      { id: "e3", x: 75, y: 66, label: "14:00 Pitch", color: "#a78bfa" },
    ],
    insights: [
      "Stop 1→2: 22 min, coffee at Station Café",
      "Stop 2→3: 18 min, taxi recommended",
      "40 min buffer total — on track",
    ],
    animRoute: [{ x: 21, y: 17 }, { x: 36, y: 28 }, { x: 51, y: 42 }, { x: 62, y: 54 }, { x: 75, y: 66 }],
    animSpeed: 0.034,
  },
  {
    id: "safety",
    label: "Safety Check",
    Icon: ShieldCheck,
    accent: "#4ade80",
    bgFrom: "rgba(74,222,128,0.07)",
    prompt:
      "You're a safety advisor. What's the safety profile of these neighborhoods for a solo traveler arriving at night?",
    tagline: "Solo travel · Night arrival · Risk profile",
    zones: [
      { id: "safe", label: "Safe zone", x: 54, y: 8, w: 36, h: 38, fill: "rgba(74,222,128,0.22)", labelColor: "#86efac" },
      { id: "caution", label: "Caution", x: 24, y: 28, w: 30, h: 30, fill: "rgba(251,191,36,0.22)", labelColor: "#fde68a" },
      { id: "avoid", label: "Avoid at night", x: 4, y: 54, w: 28, h: 32, fill: "rgba(248,113,113,0.24)", labelColor: "#fca5a5" },
    ],
    routes: [
      { id: "sroute", points: [{ x: 74, y: 18 }, { x: 70, y: 36 }, { x: 62, y: 54 }, { x: 56, y: 70 }], color: "#4ade80" },
    ],
    markers: [
      { id: "s1", x: 74, y: 18, label: "Hotel", color: "#4ade80", ring: true },
      { id: "s2", x: 62, y: 54, label: "Late bar ✓", color: "#4ade80" },
      { id: "s3", x: 12, y: 68, label: "⚠ Avoid", color: "#f87171" },
    ],
    insights: [
      "Northern district: well-lit, active until 2 am",
      "Central zone: use main boulevards only",
      "South port: avoid after 10 pm solo",
    ],
    animRoute: [{ x: 74, y: 18 }, { x: 70, y: 36 }, { x: 62, y: 54 }, { x: 56, y: 70 }],
    animSpeed: 0.028,
  },
];

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function segLen(a: Vec2, b: Vec2) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function posOnRoute(route: Vec2[], t: number): Vec2 {
  if (route.length <= 1) return route[0] ?? { x: 50, y: 50 };
  const lens = route.slice(0, -1).map((p, i) => segLen(p, route[i + 1]));
  const total = lens.reduce((s, l) => s + l, 0);
  const target = total * (t % 1);
  let walked = 0;
  for (let i = 0; i < lens.length; i++) {
    if (walked + lens[i] >= target) {
      const frac = (target - walked) / lens[i];
      const a = route[i], b = route[i + 1];
      return { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac };
    }
    walked += lens[i];
  }
  return route[route.length - 1];
}

function svgPath(pts: Vec2[]) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MapLab() {
  const [activeId, setActiveId] = useState("travel");
  const [tick, setTick] = useState(0);
  const [prompt, setPrompt] = useState(MODES[0].prompt);
  const [sent, setSent] = useState(false);

  const mode = MODES.find((m) => m.id === activeId) ?? MODES[0];

  // Sync prompt when mode changes
  const handleModeChange = (id: string) => {
    const next = MODES.find((m) => m.id === id);
    if (next) setPrompt(next.prompt);
    setActiveId(id);
    setSent(false);
  };

  // Animation ticker
  useEffect(() => {
    let frame = 0;
    let start = 0;
    const animate = (now: number) => {
      if (!start) start = now;
      setTick((now - start) / 1000);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const animPos = useMemo(
    () => posOnRoute(mode.animRoute, tick * mode.animSpeed),
    [tick, mode],
  );

  return (
    <main
      className="min-h-screen px-4 py-5 transition-colors duration-500 md:px-6 md:py-6"
      style={{
        background: `radial-gradient(ellipse at top, ${mode.bgFrom}, transparent 55%), #f4f1eb`,
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between rounded-3xl border border-stone-900/10 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-stone-500">Map Lab</p>
            <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-stone-950 md:text-xl">
              {mode.tagline}
            </h1>
          </div>
          <Link
            href="/showcase"
            className="inline-flex items-center gap-2 rounded-full border border-stone-900/10 bg-white px-3 py-2 text-sm text-stone-700 transition hover:border-stone-900/20 hover:text-stone-950"
          >
            <ArrowLeft className="size-4" /> Back
          </Link>
        </div>

        {/* Mode pills */}
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                m.id === activeId
                  ? "shadow-sm"
                  : "border-stone-200 bg-white/60 text-stone-600 hover:border-stone-300 hover:text-stone-900"
              }`}
              style={
                m.id === activeId
                  ? { backgroundColor: mode.accent + "1e", borderColor: mode.accent + "55", color: "#1c1917" }
                  : {}
              }
            >
              <m.Icon
                className="size-4"
                style={{ color: m.id === activeId ? mode.accent : undefined }}
              />
              {m.label}
            </button>
          ))}
        </div>

        {/* Main grid */}
        <section className="grid gap-4 lg:grid-cols-[1.5fr_0.5fr]">

          {/* Map canvas */}
          <div
            className="relative overflow-hidden rounded-[2rem] border border-stone-900/10 shadow-xl transition-colors duration-500"
            style={{ background: "#e8e3d8" }}
          >
            {/* Grid texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(56,51,40,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(56,51,40,0.07) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            {/* Vignette */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(24,22,14,0.24)_100%)]" />

            {/* SVG overlay */}
            <svg
              viewBox="0 0 100 100"
              className="relative z-10 aspect-[16/10] h-auto w-full"
              aria-hidden="true"
            >
              {/* Zones */}
              {mode.zones.map((z) => (
                <g key={z.id}>
                  <rect
                    x={z.x} y={z.y} width={z.w} height={z.h}
                    rx="3" ry="3"
                    fill={z.fill}
                    stroke={z.labelColor} strokeWidth="0.25" strokeOpacity="0.5"
                  />
                  <text
                    x={z.x + z.w / 2} y={z.y + 4.5}
                    textAnchor="middle" fontSize="2.6"
                    fontFamily="ui-monospace,monospace"
                    fill={z.labelColor} opacity="0.95"
                  >
                    {z.label}
                  </text>
                </g>
              ))}

              {/* Routes */}
              {mode.routes.map((r) => (
                <path
                  key={r.id}
                  d={svgPath(r.points)}
                  fill="none"
                  stroke={r.color}
                  strokeWidth="0.9"
                  strokeDasharray={r.dashed ? "1.6 2.2" : undefined}
                  strokeOpacity="0.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* Static markers */}
              {mode.markers.map((mk) => (
                <g key={mk.id}>
                  {mk.ring && (
                    <circle cx={mk.x} cy={mk.y} r="3.8" fill={mk.color} fillOpacity="0.15" />
                  )}
                  <circle cx={mk.x} cy={mk.y} r="1.3" fill={mk.color} />
                  <text
                    x={mk.x + 2.4} y={mk.y + 1}
                    fontSize="2.5" fontFamily="system-ui,sans-serif"
                    fill={mk.color} opacity="0.95"
                  >
                    {mk.label}
                  </text>
                </g>
              ))}

              {/* Animated dot */}
              <circle cx={animPos.x} cy={animPos.y} r="3" fill={mode.accent} fillOpacity="0.2" />
              <circle cx={animPos.x} cy={animPos.y} r="1.2" fill={mode.accent} />
            </svg>

            {/* Prompt bar pinned to map bottom */}
            <div className="absolute inset-x-4 bottom-4 z-20">
              <div className="flex items-start gap-2 rounded-2xl border border-white/50 bg-white/88 px-4 py-3 shadow-lg backdrop-blur-md">
                <textarea
                  value={prompt}
                  onChange={(e) => { setPrompt(e.target.value); setSent(false); }}
                  rows={2}
                  className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-stone-800 placeholder-stone-400 outline-none"
                  placeholder="Describe your scenario…"
                />
                <button
                  onClick={() => setSent(true)}
                  className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition hover:opacity-90"
                  style={{ backgroundColor: sent ? "#4ade80" : mode.accent }}
                  aria-label="Send prompt"
                >
                  <Send className="size-4" />
                </button>
              </div>
              {sent && (
                <p className="mt-2 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">
                  Prompt sent — connect agent to see the response
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4">
            {/* Agent insights */}
            <div className="rounded-[2rem] border border-stone-900/10 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500">
                Agent insights
              </p>
              <ul className="mt-4 space-y-3">
                {mode.insights.map((ins, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-stone-700">
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: mode.accent }}
                    />
                    {ins}
                  </li>
                ))}
              </ul>
            </div>

            {/* Other modes */}
            <div className="rounded-[2rem] border border-stone-900/10 bg-stone-950 p-5 text-stone-50 shadow-sm">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-400">
                Switch mode
              </p>
              <div className="mt-4 space-y-2">
                {MODES.filter((m) => m.id !== activeId).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleModeChange(m.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-stone-200 transition hover:bg-white/10"
                  >
                    <m.Icon className="size-4 text-stone-400" />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

        </section>
      </div>
    </main>
  );
}

