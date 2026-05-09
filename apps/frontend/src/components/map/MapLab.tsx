"use client";

import Link from "next/link";
import { ArrowLeft, Footprints, MapPinned, Route, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Point = { x: number; y: number };

type Zone = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tone: string;
};

type Walker = {
  id: string;
  label: string;
  speed: number;
  route: Point[];
  color: string;
  delay: number;
};

const ZONES: Zone[] = [
  {
    id: "station",
    label: "Station",
    x: 8,
    y: 14,
    w: 24,
    h: 22,
    tone: "from-sky-400/32 to-cyan-300/8",
  },
  {
    id: "promenade",
    label: "Promenade",
    x: 39,
    y: 10,
    w: 24,
    h: 18,
    tone: "from-emerald-300/26 to-lime-200/8",
  },
  {
    id: "square",
    label: "Market Square",
    x: 66,
    y: 40,
    w: 18,
    h: 24,
    tone: "from-amber-300/30 to-orange-200/8",
  },
  {
    id: "museum",
    label: "Museum",
    x: 22,
    y: 60,
    w: 22,
    h: 18,
    tone: "from-fuchsia-300/26 to-rose-200/8",
  },
];

const WALKERS: Walker[] = [
  {
    id: "w1",
    label: "Commuters",
    speed: 0.045,
    delay: 0,
    color: "#9bd2ff",
    route: [
      { x: 12, y: 22 },
      { x: 25, y: 24 },
      { x: 48, y: 18 },
      { x: 73, y: 26 },
      { x: 84, y: 48 },
    ],
  },
  {
    id: "w2",
    label: "Tour Group",
    speed: 0.032,
    delay: 0.18,
    color: "#ffe08f",
    route: [
      { x: 18, y: 72 },
      { x: 31, y: 64 },
      { x: 45, y: 54 },
      { x: 60, y: 48 },
      { x: 77, y: 51 },
    ],
  },
  {
    id: "w3",
    label: "Lunch Rush",
    speed: 0.056,
    delay: 0.35,
    color: "#b4f0c8",
    route: [
      { x: 46, y: 12 },
      { x: 52, y: 26 },
      { x: 52, y: 43 },
      { x: 48, y: 58 },
      { x: 37, y: 72 },
    ],
  },
  {
    id: "w4",
    label: "Evening Loop",
    speed: 0.024,
    delay: 0.52,
    color: "#f7b1c8",
    route: [
      { x: 71, y: 25 },
      { x: 76, y: 42 },
      { x: 70, y: 60 },
      { x: 52, y: 66 },
      { x: 34, y: 58 },
      { x: 21, y: 42 },
    ],
  },
];

function segmentLength(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function getPointOnRoute(route: Point[], progress: number): Point {
  if (route.length <= 1) return route[0] ?? { x: 50, y: 50 };

  const lengths = route.slice(0, -1).map((point, index) =>
    segmentLength(point, route[index + 1]),
  );
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const target = total * progress;
  let travelled = 0;

  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index];
    if (travelled + length >= target) {
      const local = (target - travelled) / length;
      const from = route[index];
      const to = route[index + 1];
      return {
        x: from.x + (to.x - from.x) * local,
        y: from.y + (to.y - from.y) * local,
      };
    }
    travelled += length;
  }

  return route[route.length - 1];
}

function routePath(route: Point[]) {
  return route
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

export function MapLab() {
  const [tick, setTick] = useState(0);

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

  const walkers = useMemo(
    () =>
      WALKERS.map((walker) => {
        const progress = (tick * walker.speed + walker.delay) % 1;
        return {
          ...walker,
          point: getPointOnRoute(walker.route, progress),
        };
      }),
    [tick],
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f4f1e8_0%,#dfdfd5_35%,#cfcfc3_100%)] px-4 py-5 text-stone-950 md:px-6 md:py-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <div className="flex items-center justify-between rounded-3xl border border-stone-900/10 bg-white/70 px-4 py-3 shadow-[0_20px_60px_rgba(34,34,20,0.08)] backdrop-blur-sm">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-stone-500">
              Map lab
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
              Suggestive map UI prototype
            </h1>
          </div>
          <Link
            href="/showcase"
            className="inline-flex items-center gap-2 rounded-full border border-stone-900/10 bg-white px-3 py-2 text-sm text-stone-700 transition hover:border-stone-900/20 hover:text-stone-950"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </div>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-stone-900/10 bg-[#e5e0d2] shadow-[0_30px_80px_rgba(30,28,18,0.14)]">
            <div className="absolute inset-0 opacity-70">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0,transparent_9%,rgba(56,51,40,0.05)_10%,transparent_11%,transparent_100%),linear-gradient(transparent_0,transparent_9%,rgba(56,51,40,0.05)_10%,transparent_11%,transparent_100%)] bg-[length:88px_88px]" />
              <div className="absolute left-[8%] top-[18%] h-[56%] w-[5%] rounded-full bg-stone-700/12 blur-sm" />
              <div className="absolute left-[28%] top-[5%] h-[72%] w-[4%] rotate-[14deg] rounded-full bg-stone-700/10 blur-sm" />
              <div className="absolute left-[58%] top-[10%] h-[76%] w-[5%] rotate-[-8deg] rounded-full bg-stone-700/11 blur-sm" />
              <div className="absolute left-[76%] top-[22%] h-[50%] w-[4%] rounded-full bg-stone-700/10 blur-sm" />
              <div className="absolute left-[16%] top-[43%] h-[6%] w-[70%] rounded-full bg-stone-700/10 blur-sm" />
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.04),rgba(26,24,16,0.34)_68%)]" />

            {ZONES.map((zone) => (
              <div
                key={zone.id}
                className="absolute rounded-[1.6rem] border border-white/40 bg-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-[2px]"
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  width: `${zone.w}%`,
                  height: `${zone.h}%`,
                }}
              >
                <div className={`absolute inset-0 rounded-[1.6rem] bg-gradient-to-br ${zone.tone}`} />
                <div className="absolute left-3 top-3 rounded-full bg-stone-950/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/90">
                  {zone.label}
                </div>
              </div>
            ))}

            <svg
              viewBox="0 0 100 100"
              className="relative z-10 aspect-[16/10] h-auto w-full"
              aria-hidden="true"
            >
              {WALKERS.map((walker) => (
                <path
                  key={walker.id}
                  d={routePath(walker.route)}
                  fill="none"
                  stroke={walker.color}
                  strokeWidth="0.7"
                  strokeDasharray="1.2 2.4"
                  strokeOpacity="0.75"
                />
              ))}
              {walkers.map((walker) => (
                <g key={walker.id}>
                  <circle
                    cx={walker.point.x}
                    cy={walker.point.y}
                    r="2.4"
                    fill={walker.color}
                    fillOpacity="0.2"
                  />
                  <circle
                    cx={walker.point.x}
                    cy={walker.point.y}
                    r="0.95"
                    fill={walker.color}
                  />
                </g>
              ))}
            </svg>

            <div className="pointer-events-none absolute inset-x-5 bottom-5 z-20 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/30 bg-white/76 px-4 py-3 backdrop-blur-md">
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-stone-500">
                  Focus
                </p>
                <p className="mt-1 text-sm font-medium text-stone-900">
                  Spotlight zones guide the eye before the user reads text.
                </p>
              </div>
              <div className="rounded-2xl border border-white/30 bg-white/76 px-4 py-3 backdrop-blur-md">
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-stone-500">
                  Motion
                </p>
                <p className="mt-1 text-sm font-medium text-stone-900">
                  Walkers imply live foot traffic without video or GIF assets.
                </p>
              </div>
              <div className="rounded-2xl border border-white/30 bg-white/76 px-4 py-3 backdrop-blur-md">
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-stone-500">
                  Next
                </p>
                <p className="mt-1 text-sm font-medium text-stone-900">
                  Replace mock routes with real map geometry and agent output.
                </p>
              </div>
            </div>
          </div>

          <aside className="grid gap-4">
            <div className="rounded-[2rem] border border-stone-900/10 bg-white/72 p-5 shadow-[0_24px_64px_rgba(34,34,20,0.09)] backdrop-blur-sm">
              <div className="flex items-center gap-2 text-stone-700">
                <MapPinned className="size-4" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
                  Why this first
                </h2>
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
                <li>Map stays readable because the base is quiet.</li>
                <li>Zones create visual hierarchy before data density grows.</li>
                <li>Moving dots prove the interaction pattern before heavy assets.</li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-stone-900/10 bg-stone-950 p-5 text-stone-50 shadow-[0_24px_64px_rgba(34,34,20,0.16)]">
              <div className="flex items-center gap-2 text-stone-200">
                <Footprints className="size-4" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
                  Live walkers
                </h2>
              </div>
              <div className="mt-4 space-y-3">
                {walkers.map((walker) => (
                  <div
                    key={walker.id}
                    className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{walker.label}</span>
                      <span
                        className="inline-flex size-2.5 rounded-full"
                        style={{ backgroundColor: walker.color }}
                      />
                    </div>
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-stone-400">
                      x {walker.point.x.toFixed(1)} · y {walker.point.y.toFixed(1)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-stone-900/10 bg-white/72 p-5 shadow-[0_24px_64px_rgba(34,34,20,0.09)] backdrop-blur-sm">
              <div className="flex items-center gap-2 text-stone-700">
                <Route className="size-4" />
                <Sparkles className="size-4" />
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-700">
                Next step: swap this faux map for Mapbox or MapLibre, then feed
                route arrays from the agent and promote each walker into a real
                sprite or Lottie marker.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}