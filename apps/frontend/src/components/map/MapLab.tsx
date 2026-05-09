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
import {
  useAgent,
  useConfigureSuggestions,
  useCopilotKit,
  useFrontendTool,
} from "@copilotkit/react-core/v2";
import { type ElementType, useCallback, useMemo, useState } from "react";
import { z } from "zod";
import MapCanvas, { type MapModeGeo } from "./MapCanvas";

const MODE_IDS = ["travel", "restaurants", "flooding", "events", "safety"] as const;
type ModeId = (typeof MODE_IDS)[number];

type Mode = {
  id: ModeId;
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

type ItineraryStop = {
  time: string;
  title: string;
  detail: string;
  eta: string;
};

type RestaurantProfile = {
  id: string;
  name: string;
  rating: string;
  price: string;
  walk: string;
  pos: [number, number];
  summary: string;
  menu: string[];
};

const TRAVEL_ITINERARY: ItineraryStop[] = [
  {
    time: "08:15",
    title: "Arrive CDG and transfer",
    detail: "RER B to Chatelet, then Line 1 to La Defense",
    eta: "45 min",
  },
  {
    time: "10:00",
    title: "Client workshop",
    detail: "La Defense Tower A, check-in closes 09:50",
    eta: "90 min",
  },
  {
    time: "12:15",
    title: "Transit to hotel",
    detail: "Metro + short final walk in 8th arrondissement",
    eta: "28 min",
  },
  {
    time: "14:00",
    title: "Partner sync",
    detail: "Champs-Elysees, contract review and action list",
    eta: "60 min",
  },
];

const RESTAURANT_HOTEL: [number, number] = [48.8608, 2.3588];
const RESTAURANT_IDS = ["septime", "jacques-genin", "enfants-rouges"] as const;

const RESTAURANTS: RestaurantProfile[] = [
  {
    id: "septime",
    name: "Septime",
    rating: "4.8",
    price: "EUR 120 avg",
    walk: "18 min",
    pos: [48.8511, 2.3721],
    summary: "Seasonal tasting menus and strong wine pairing.",
    menu: [
      "Smoked eel with green apple",
      "Asparagus with beurre blanc",
      "Roasted cod with fennel",
      "Aged duck breast with cherries",
      "Hazelnut praline millefeuille",
    ],
  },
  {
    id: "jacques-genin",
    name: "Jacques Genin",
    rating: "4.7",
    price: "EUR 45 avg",
    walk: "5 min",
    pos: [48.8574, 2.3545],
    summary: "Dessert-focused salon, ideal for shorter dinners.",
    menu: [
      "Mille-feuille a la minute",
      "Warm Paris-Brest",
      "Single-origin ganache selection",
      "Salted caramel truffles",
      "Darjeeling first flush tea",
    ],
  },
  {
    id: "enfants-rouges",
    name: "Marche des Enfants Rouges",
    rating: "4.5",
    price: "EUR 28 avg",
    walk: "9 min",
    pos: [48.856, 2.3612],
    summary: "Fast casual market with broad cuisine options.",
    menu: [
      "Confit chicken sandwich",
      "Goat cheese tartine",
      "Bento salmon plate",
      "Moroccan couscous bowl",
      "Fresh pressed seasonal juice",
    ],
  },
];

const FLOOD_FORECAST = [
  { window: "Fri 18:00", levelCm: 34, risk: "Medium" },
  { window: "Sat 02:00", levelCm: 57, risk: "High" },
  { window: "Sat 14:00", levelCm: 61, risk: "High" },
  { window: "Sun 09:00", levelCm: 42, risk: "Medium" },
];

const FLOOD_ACTIONS = [
  "Pre-stage barriers at Quai de la Tournelle by 17:00",
  "Alert transport teams if level exceeds +55 cm",
  "Move backup power to elevated storage before midnight",
  "Confirm Pont Neuf evacuation corridor every 3 hours",
];

const EVENT_RUN_OF_SHOW = [
  {
    time: "09:00",
    venue: "Eiffel Conference Room",
    item: "Opening pitch + team intros",
    transit: "Start point",
  },
  {
    time: "11:30",
    venue: "Pompidou Demo Lab",
    item: "Product demo and Q&A",
    transit: "35 min metro",
  },
  {
    time: "14:00",
    venue: "Palais des Congres",
    item: "Investor deck + next steps",
    transit: "22 min taxi",
  },
];

const SAFETY_MATRIX = [
  { zone: "Historic core (1st-6th)", score: 86, level: "Low risk", color: "#4ade80" },
  { zone: "North Pigalle belt", score: 52, level: "Moderate risk", color: "#facc15" },
  { zone: "Peripheral east fringe", score: 34, level: "High caution", color: "#f87171" },
];

const NIGHT_PROTOCOL = [
  "Prefer metro exits on major boulevards after 22:30",
  "Use licensed taxi ranks for hotel return after midnight",
  "Keep route sharing enabled during solo movement",
  "Avoid isolated canal and park paths at night",
];

export function MapLab() {
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();

  const [activeId, setActiveId] = useState<ModeId>("travel");
  const [prompt, setPrompt] = useState(MODES[0].prompt);
  const [sent, setSent] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(RESTAURANTS[0].id);

  const mode = MODES.find((m) => m.id === activeId) ?? MODES[0];
  const selectedRestaurant =
    RESTAURANTS.find((restaurant) => restaurant.id === selectedRestaurantId) ?? RESTAURANTS[0];
  const mapKey =
    activeId === "restaurants"
      ? `${activeId}-${selectedRestaurant.id}`
      : activeId;

  useConfigureSuggestions({
    available: "before-first-message",
    suggestions: [
      {
        title: "Travel mode",
        message: "Switch to Travel mode and optimize the itinerary for fewer transfers.",
      },
      {
        title: "Dinner plan",
        message: "Switch to Restaurant mode and focus the map on Septime.",
      },
      {
        title: "Flood prep",
        message: "Switch to Flood mode and show a stricter response checklist.",
      },
      {
        title: "Night safety",
        message: "Switch to Safety mode and update the prompt for a solo traveler.",
      },
    ],
  });

  const restaurantGeo = useMemo<MapModeGeo>(() => {
    const center: [number, number] = [
      (RESTAURANT_HOTEL[0] + selectedRestaurant.pos[0]) / 2,
      (RESTAURANT_HOTEL[1] + selectedRestaurant.pos[1]) / 2,
    ];

    return {
      center,
      zoom: 15,
      routeColor: "#f59e0b",
      routeDashed: true,
      waypoints: [RESTAURANT_HOTEL, selectedRestaurant.pos],
      markers: [
        { pos: RESTAURANT_HOTEL, label: "Your hotel", color: "#9ca3af", ring: false },
        ...RESTAURANTS.map((restaurant) => ({
          pos: restaurant.pos,
          label: `${restaurant.name} ${restaurant.rating}`,
          color: restaurant.id === selectedRestaurant.id ? "#f59e0b" : "#d6a35f",
          ring: restaurant.id === selectedRestaurant.id,
        })),
      ],
      zones: [
        {
          sw: [selectedRestaurant.pos[0] - 0.0035, selectedRestaurant.pos[1] - 0.006],
          ne: [selectedRestaurant.pos[0] + 0.0035, selectedRestaurant.pos[1] + 0.006],
          color: "#f59e0b",
          label: `${selectedRestaurant.name} focus`,
        },
        {
          sw: [48.856, 2.352],
          ne: [48.864, 2.364],
          color: "#fde68a",
          label: "Le Marais core",
        },
      ],
    };
  }, [selectedRestaurant]);

  const injectPrompt = useCallback(
    (text: string) => {
      if (!agent) return;
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `msg-${Date.now()}`;
      agent.addMessage({ id, role: "user", content: text });
      void copilotkit.runAgent({ agent }).catch((error: unknown) => {
        console.error("map-lab: runAgent failed", error);
      });
    },
    [agent, copilotkit],
  );

  const handleModeChange = (id: ModeId) => {
    const next = MODES.find((m) => m.id === id);
    if (next) setPrompt(next.prompt);
    setActiveId(id);
    setSent(false);
  };

  useFrontendTool({
    name: "mapSetMode",
    description:
      "Switch the map-lab scenario mode. Use one of: travel, restaurants, flooding, events, safety.",
    parameters: z.object({ modeId: z.enum(MODE_IDS) }),
    handler: async ({ modeId }) => {
      handleModeChange(modeId);
      return `mode set to ${modeId}`;
    },
  });

  useFrontendTool({
    name: "mapSetPrompt",
    description: "Replace the map-lab prompt text shown below the map.",
    parameters: z.object({ prompt: z.string() }),
    handler: async ({ prompt: nextPrompt }) => {
      setPrompt(nextPrompt);
      setSent(false);
      return "prompt updated";
    },
  });

  useFrontendTool({
    name: "mapFocusRestaurant",
    description:
      "In restaurant mode, focus one restaurant on the map and optionally switch to restaurant mode.",
    parameters: z.object({
      restaurantId: z.enum(RESTAURANT_IDS),
      switchMode: z.boolean().optional(),
    }),
    handler: async ({ restaurantId, switchMode }) => {
      if (switchMode !== false) {
        handleModeChange("restaurants");
      }
      setSelectedRestaurantId(restaurantId);
      return `restaurant focus set to ${restaurantId}`;
    },
  });

  const renderModeLayout = () => {
    if (activeId === "travel") {
      return (
        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-[2rem] border border-stone-900/10 shadow-xl h-[54vh] min-h-[460px] max-h-[700px]">
            <MapCanvas key={mapKey} mode={mode.geo} />
          </div>

          <div className="rounded-[2rem] border border-stone-900/10 bg-white/85 p-5 shadow-sm backdrop-blur-sm">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500">
              Live itinerary
            </p>
            <div className="mt-4 space-y-3">
              {TRAVEL_ITINERARY.map((stop) => (
                <article key={stop.time} className="rounded-xl border border-stone-900/10 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] tracking-[0.16em] text-stone-500">
                      {stop.time}
                    </span>
                    <span className="text-xs text-stone-500">{stop.eta}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-stone-900">{stop.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-stone-600">{stop.detail}</p>
                </article>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-blue-200/70 bg-blue-50 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                Planner note
              </p>
              <p className="mt-1 text-sm text-blue-900">{mode.insights[0]}</p>
            </div>
          </div>
        </div>
      );
    }

    if (activeId === "restaurants") {
      return (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[2rem] border border-stone-900/10 shadow-xl h-[68vh] min-h-[560px] max-h-[840px]">
            <MapCanvas key={mapKey} mode={restaurantGeo} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.4fr_0.6fr]">
            <div className="rounded-[2rem] border border-stone-900/10 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500">
                Restaurant selector
              </p>
              <label className="mt-3 block text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
                Choose destination
              </label>
              <select
                value={selectedRestaurantId}
                onChange={(event) => setSelectedRestaurantId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-amber-400"
              >
                {RESTAURANTS.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name} · {restaurant.rating}
                  </option>
                ))}
              </select>

              <p className="mt-3 text-sm leading-relaxed text-stone-700">{selectedRestaurant.summary}</p>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
                <p>Rating: {selectedRestaurant.rating}</p>
                <p className="mt-1">Price: {selectedRestaurant.price}</p>
                <p className="mt-1">Walk time: {selectedRestaurant.walk}</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-stone-900/10 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500">
                {selectedRestaurant.name} menu
              </p>
              <ul className="mt-4 grid gap-2 text-sm text-stone-700 md:grid-cols-2">
                {selectedRestaurant.menu.map((item) => (
                  <li key={item} className="rounded-lg border border-stone-900/10 bg-white px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (activeId === "flooding") {
      return (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-[2rem] border border-stone-900/10 shadow-xl h-[60vh] min-h-[500px] max-h-[760px]">
            <MapCanvas key={mapKey} mode={mode.geo} />
          </div>

          <div className="grid gap-4">
            <div className="rounded-[2rem] border border-stone-900/10 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500">
                72h river forecast
              </p>
              <div className="mt-4 space-y-3">
                {FLOOD_FORECAST.map((entry) => (
                  <div key={entry.window} className="grid grid-cols-[100px_1fr_auto] items-center gap-3">
                    <span className="text-xs text-stone-600">{entry.window}</span>
                    <div className="h-2 rounded-full bg-stone-200">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((entry.levelCm / 70) * 100))}%`,
                          backgroundColor:
                            entry.risk === "High"
                              ? "#f87171"
                              : entry.risk === "Medium"
                                ? "#facc15"
                                : "#4ade80",
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-stone-700">{entry.levelCm} cm</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-stone-900/10 bg-stone-950 p-5 text-stone-100 shadow-sm">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-400">
                Response checklist
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-stone-200">
                {FLOOD_ACTIONS.map((action) => (
                  <li key={action} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (activeId === "events") {
      return (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[2rem] border border-stone-900/10 shadow-xl h-[56vh] min-h-[500px] max-h-[760px]">
            <MapCanvas key={mapKey} mode={mode.geo} />
          </div>

          <div className="rounded-[2rem] border border-stone-900/10 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500">
              Run of show
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {EVENT_RUN_OF_SHOW.map((slot) => (
                <article key={slot.time} className="rounded-xl border border-stone-900/10 bg-white p-3">
                  <p className="font-mono text-[11px] tracking-[0.14em] text-violet-500">{slot.time}</p>
                  <p className="mt-1 text-sm font-semibold text-stone-900">{slot.venue}</p>
                  <p className="mt-1 text-xs text-stone-600">{slot.item}</p>
                  <p className="mt-2 text-xs font-medium text-stone-500">Transit: {slot.transit}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-violet-200/70 bg-violet-50 px-4 py-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-violet-600">
              Logistics buffers
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-violet-900">
              {mode.insights.map((insight) => (
                <li key={insight}>• {insight}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[2rem] border border-stone-900/10 shadow-xl h-[58vh] min-h-[500px] max-h-[760px]">
          <MapCanvas key={mapKey} mode={mode.geo} />
        </div>

        <div className="grid gap-4">
          <div className="rounded-[2rem] border border-stone-900/10 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500">
              Neighborhood safety matrix
            </p>
            <div className="mt-4 space-y-3">
              {SAFETY_MATRIX.map((row) => (
                <article key={row.zone} className="rounded-lg border border-stone-200 bg-white px-3 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-stone-900">{row.zone}</p>
                    <span className="text-xs text-stone-500">{row.level}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-stone-200">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${row.score}%`, backgroundColor: row.color }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-stone-900/10 bg-stone-950 p-5 text-stone-100 shadow-sm">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-400">
              Night arrival protocol
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-stone-200">
              {NIGHT_PROTOCOL.map((item) => (
                <li key={item} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main
      className="min-h-screen px-4 py-5 transition-colors duration-500 md:px-6 md:py-6"
      style={{
        background: `radial-gradient(ellipse at top, ${mode.bgFrom}, transparent 50%), #f4f1eb`,
      }}
    >
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
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

        <section className="flex flex-col gap-4">
          {renderModeLayout()}

          <div className="rounded-[2rem] border border-stone-900/10 bg-white/92 px-4 py-4 shadow-sm backdrop-blur-sm">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500">
              Agent prompt
            </p>
            <div className="flex items-start gap-2 rounded-2xl border border-stone-900/10 bg-white px-4 py-3 shadow-sm">
              <textarea
                value={prompt}
                onChange={(event) => {
                  setPrompt(event.target.value);
                  setSent(false);
                }}
                rows={2}
                className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-stone-800 placeholder-stone-400 outline-none"
                placeholder="Describe your scenario..."
              />
              <button
                onClick={() => {
                  const nextPrompt = prompt.trim();
                  if (!nextPrompt) return;
                  setSent(true);
                  injectPrompt(nextPrompt);
                }}
                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow transition hover:opacity-90"
                style={{ backgroundColor: sent ? "#4ade80" : mode.accent }}
                aria-label="Send prompt"
              >
                <Send className="size-4" />
              </button>
            </div>
            {sent && (
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">
                Prompt sent - check chat for the agent response
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
