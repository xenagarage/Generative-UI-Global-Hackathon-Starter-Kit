"use client";

import dynamic from "next/dynamic";
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
import { type ElementType, useState } from "react";
import type { MapModeGeo } from "./MapCanvas";

const MapCanvas = dynamic(() => import("./MapCanvas"), { ssr: false });

type Mode = {
  id: string;
  label: string;
  Icon: ElementType<{ className?: string }>;
  accent: string;
  bgFrom: string;
  prompt: string;
  tagline: string;
  insights: string[];
  geo: MapModeGeo;
};

const MODES: Mode[] = [
  {
    id: "travel",
    label: "Travel Advisor",
    Icon: Plane,
    accent: "#60a5fa",
    bgFrom: "rgba(96,165,250,0.10)",
    prompt:
      "You're a travel adviser. Help me travel for work in Paris May 19–22. Optimize for timeliness — I have back-to-back meetings.",
    tagline: "Work trip · Paris · May 19–22 · Optimised for timeliness",
    insights: [
      "CDG → La Défense: 45 min via RER B + Line 1",
      "Meetings cluster in 8th arr — all walkable within 12 min",
      "Hotel checkout 10 am comfortably fits 12:30 pm departure",
    ],
    geo: {
      center: [48.875, 2.29],
      zoom: 12,
      routeColor: "#60a5fa",
      routeDashed: false,
      waypoints: [
        [49.0097, 2.5479],
        [48.8924, 2.2386],
        [48.8698, 2.3079],
      ],
      markers: [
        { pos: [49.0097, 2.5479], label: "CDG Airport", color: "#60a5fa", ring: true },
        { pos: [48.8924, 2.2386], label: "Meeting — La Défense", color: "#60a5fa" },
        { pos: [48.8698, 2.3079], label: "Hotel", color: "#60a5fa" },
      ],
      zones: [
        { sw: [49.000, 2.520], ne: [49.022, 2.568], color: "#60a5fa", label: "Airport" },
        { sw: [48.879, 2.218], ne: [48.905, 2.260], color: "#60a5fa", label: "La Défense" },
        { sw: [48.862, 2.294], ne: [48.878, 2.325], color: "#60a5fa", label: "Hotel zone" },
      ],
    },
  },
  {
    id: "restaurants",
    label: "Restaurant Finder",
    Icon: Utensils,
    accent: "#f59e0b",
    bgFrom: "rgba(245,158,11,0.08)",
    prompt:
      "You're a restaurant recommender. Find top spots for a business dinner near my hotel in Le Marais. Walkable only, tonight.",
    tagline: "Business dinner · Le Marais, Paris · Walkable · Top-rated",
    insights: [
      "Septime: seasonal French, 18 min walk — book ahead",
      "Jacques Genin (dessert): 5 min walk from hotel",
      "Marché des Enfants Rouges closes at 8 pm — go early",
    ],
    geo: {
      center: [48.857, 2.356],
      zoom: 15,
      routeColor: "#f59e0b",
      routeDashed: true,
      waypoints: [
        [48.8608, 2.3588],
        [48.8574, 2.3545],
        [48.8560, 2.3612],
        [48.8511, 2.3721],
      ],
      markers: [
        { pos: [48.8608, 2.3588], label: "Your hotel", color: "#e7e5e4", ring: true },
        { pos: [48.8511, 2.3721], label: "Septime 4.8", color: "#f59e0b" },
        { pos: [48.8574, 2.3545], label: "J. Genin 4.7", color: "#f59e0b" },
        { pos: [48.8560, 2.3612], label: "Enfants Rouges 4.5", color: "#f59e0b" },
      ],
      zones: [
        { sw: [48.849, 2.365], ne: [48.856, 2.376], color: "#f59e0b", label: "Fine dining" },
        { sw: [48.854, 2.349], ne: [48.862, 2.362], color: "#f59e0b", label: "Bistros" },
      ],
    },
  },
  {
    id: "flooding",
    label: "Flood Analyzer",
    Icon: Droplets,
    accent: "#22d3ee",
    bgFrom: "rgba(34,211,238,0.09)",
    prompt:
      "You're a flooding analyzer. Assess flood risk along the Seine for this weekend's incoming storm system.",
    tagline: "Storm risk · Paris Seine · 72 h window · 3 risk zones",
    insights: [
      "Quai de la Tournelle: expected +60 cm above normal level",
      "Île Saint-Louis: medium risk — monitor Saturday night",
      "Evacuation via Pont Neuf to Right Bank confirmed passable",
    ],
    geo: {
      center: [48.851, 2.346],
      zoom: 14,
      routeColor: "#22d3ee",
      routeDashed: true,
      waypoints: [
        [48.8355, 2.2968],
        [48.8487, 2.3327],
        [48.8530, 2.3488],
        [48.8519, 2.3570],
      ],
      markers: [
        { pos: [48.8355, 2.2968], label: "Quai flood risk", color: "#22d3ee", ring: true },
        { pos: [48.8519, 2.3570], label: "Ile Saint-Louis", color: "#22d3ee" },
        { pos: [48.8606, 2.3522], label: "Shelter Pompidou", color: "#4ade80" },
      ],
      zones: [
        { sw: [48.826, 2.280], ne: [48.856, 2.306], color: "#22d3ee", label: "High risk" },
        { sw: [48.842, 2.334], ne: [48.858, 2.358], color: "#facc15", label: "Medium risk" },
        { sw: [48.850, 2.358], ne: [48.863, 2.384], color: "#4ade80", label: "Low risk" },
      ],
    },
  },
  {
    id: "events",
    label: "Event Planner",
    Icon: CalendarDays,
    accent: "#a78bfa",
    bgFrom: "rgba(167,139,250,0.08)",
    prompt:
      "You're an event logistics planner. I have 3 meetings across Paris tomorrow morning. Optimise my route and timing.",
    tagline: "3 meetings · Paris · Tomorrow morning · Route optimised",
    insights: [
      "Eiffel to Pompidou: 35 min via Metro 6 then 11",
      "Pompidou to Palais des Congres: 22 min by taxi",
      "35 min buffer total — comfortable if meeting 1 runs on time",
    ],
    geo: {
      center: [48.868, 2.308],
      zoom: 13,
      routeColor: "#a78bfa",
      routeDashed: false,
      waypoints: [
        [48.8584, 2.2945],
        [48.8607, 2.3523],
        [48.8788, 2.2821],
      ],
      markers: [
        { pos: [48.8584, 2.2945], label: "9:00 Eiffel conf.", color: "#a78bfa", ring: true },
        { pos: [48.8607, 2.3523], label: "11:30 Pompidou demo", color: "#a78bfa" },
        { pos: [48.8788, 2.2821], label: "14:00 Palais pitch", color: "#a78bfa" },
      ],
      zones: [
        { sw: [48.854, 2.285], ne: [48.864, 2.304], color: "#a78bfa", label: "Venue A" },
        { sw: [48.856, 2.346], ne: [48.866, 2.362], color: "#a78bfa", label: "Venue B" },
        { sw: [48.873, 2.269], ne: [48.886, 2.296], color: "#a78bfa", label: "Venue C" },
      ],
    },
  },
  {
    id: "safety",
    label: "Safety Check",
    Icon: ShieldCheck,
    accent: "#4ade80",
    bgFrom: "rgba(74,222,128,0.07)",
    prompt:
      "You're a safety advisor. What's the safety profile of Paris neighborhoods for a solo traveler arriving late at night?",
    tagline: "Solo travel · Night arrival · Paris safety profile",
    insights: [
      "1st to 6th arr.: very safe, well-lit, active all night",
      "North of Pigalle (18th arr.): use main boulevards only",
      "Avoid isolated parks and Canal Saint-Martin after midnight",
    ],
    geo: {
      center: [48.864, 2.342],
      zoom: 13,
      routeColor: "#4ade80",
      routeDashed: false,
      waypoints: [
        [48.8698, 2.3079],
        [48.8534, 2.3333],
        [48.8867, 2.3431],
      ],
      markers: [
        { pos: [48.8698, 2.3079], label: "Hotel", color: "#4ade80", ring: true },
        { pos: [48.8534, 2.3333], label: "Saint-Germain safe", color: "#4ade80" },
        { pos: [48.8867, 2.3431], label: "North Pigalle avoid", color: "#f87171" },
      ],
      zones: [
        { sw: [48.840, 2.316], ne: [48.876, 2.362], color: "#4ade80", label: "Safe zone" },
        { sw: [48.876, 2.316], ne: [48.896, 2.358], color: "#facc15", label: "Caution" },
        { sw: [48.876, 2.358], ne: [48.900, 2.400], color: "#f87171", label: "Avoid at night" },
      ],
    },
  },
];

export function MapLab() {
  const [activeId, setActiveId] = useState("travel");
  const [prompt, setPrompt] = useState(MODES[0].prompt);
  const [sent, setSent] = useState(false);

  const mode = MODES.find((m) => m.id === activeId) ?? MODES[0];

  const handleModeChange = (id: string) => {
    const next = MODES.find((m) => m.id === id);
    if (next) setPrompt(next.prompt);
    setActiveId(id);
    setSent(false);
  };

  return (
    <main
      className="min-h-screen px-4 py-5 transition-colors duration-500 md:px-6 md:py-6"
      style={{
        background: `radial-gradient(ellipse at top, ${mode.bgFrom}, transparent 50%), #f4f1eb`,
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <div className="flex items-center justify-between rounded-3xl border border-stone-900/10 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-stone-500">
              Map Lab
            </p>
            <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-stone-950 md:text-xl">
              {mode.tagline}
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
                  ? {
                      backgroundColor: mode.accent + "22",
                      borderColor: mode.accent + "55",
                      color: "#1c1917",
                    }
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

        <section className="grid gap-4 lg:grid-cols-[1.5fr_0.5fr]">
          <div
            className="relative overflow-hidden rounded-[2rem] border border-stone-900/10 shadow-xl"
            style={{ height: 540 }}
          >
            <MapCanvas mode={mode.geo} />

            <div className="absolute inset-x-4 bottom-4 z-[1000]">
              <div className="flex items-start gap-2 rounded-2xl border border-white/60 bg-white/92 px-4 py-3 shadow-lg backdrop-blur-md">
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setSent(false);
                  }}
                  rows={2}
                  className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-stone-800 placeholder-stone-400 outline-none"
                  placeholder="Describe your scenario…"
                />
                <button
                  onClick={() => setSent(true)}
                  className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow transition hover:opacity-90"
                  style={{ backgroundColor: sent ? "#4ade80" : mode.accent }}
                  aria-label="Send prompt"
                >
                  <Send className="size-4" />
                </button>
              </div>
              {sent && (
                <p className="mt-1.5 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">
                  Prompt sent — connect agent to see the response
                </p>
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-[2rem] border border-stone-900/10 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500">
                Agent insights
              </p>
              <ul className="mt-4 space-y-3">
                {mode.insights.map((ins, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-stone-700"
                  >
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: mode.accent }}
                    />
                    {ins}
                  </li>
                ))}
              </ul>
            </div>

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
