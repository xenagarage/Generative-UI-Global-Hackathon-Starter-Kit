"use client";

import { useEffect, useRef } from "react";
import type { Layer as LeafletLayer, Map as LeafletMap } from "leaflet";

// ─── Public types (imported by MapLab via `import type`) ──────────────────────

export type MapModeGeo = {
  center: [number, number];
  zoom: number;
  routeColor: string;
  routeDashed?: boolean;
  waypoints: [number, number][];
  markers: { pos: [number, number]; label: string; color: string; ring?: boolean }[];
  zones: { sw: [number, number]; ne: [number, number]; color: string; label: string }[];
};

// ─── Internal state ────────────────────────────────────────────────────────────

type State = {
  L: typeof import("leaflet");
  map: LeafletMap;
  layers: LeafletLayer[];
  animFrame: number;
};

// ─── Route maths ──────────────────────────────────────────────────────────────

function segLen(a: [number, number], b: [number, number]) {
  return Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2);
}

function posOnRoute(pts: [number, number][], t: number): [number, number] {
  if (pts.length < 2) return pts[0] ?? [0, 0];
  const lens = pts.slice(0, -1).map((p, i) => segLen(p, pts[i + 1]));
  const total = lens.reduce((s, l) => s + l, 0);
  const target = total * (t % 1);
  let walked = 0;
  for (let i = 0; i < lens.length; i++) {
    if (walked + lens[i] >= target) {
      const f = (target - walked) / lens[i];
      const a = pts[i], b = pts[i + 1];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    }
    walked += lens[i];
  }
  return pts[pts.length - 1];
}

// ─── Overlay rendering ────────────────────────────────────────────────────────

function drawMode(state: State, mode: MapModeGeo) {
  const { L, map, layers } = state;

  // Coloured zone rectangles
  for (const z of mode.zones) {
    const rect = L.rectangle([z.sw, z.ne], {
      color: z.color,
      fillColor: z.color,
      fillOpacity: 0.13,
      weight: 1.5,
      opacity: 0.6,
    });
    rect.bindTooltip(z.label, {
      permanent: true,
      direction: "center",
      className: "map-zone-tip",
    });
    rect.addTo(map);
    layers.push(rect);
  }

  // Route polyline
  if (mode.waypoints.length >= 2) {
    const poly = L.polyline(mode.waypoints, {
      color: mode.routeColor,
      weight: 4,
      opacity: 0.9,
      dashArray: mode.routeDashed ? "10 7" : undefined,
      lineJoin: "round",
      lineCap: "round",
    });
    poly.addTo(map);
    layers.push(poly);
  }

  // Named stop markers (circle + permanent tooltip)
  for (let i = 0; i < mode.markers.length; i++) {
    const mk = mode.markers[i];
    const circle = L.circleMarker(mk.pos, {
      radius: mk.ring ? 11 : 7,
      color: mk.color,
      fillColor: mk.color,
      fillOpacity: mk.ring ? 0.22 : 0.85,
      weight: mk.ring ? 2 : 0,
    });
    circle.bindTooltip(mk.label, {
      permanent: true,
      direction: i === 0 ? "top" : "right",
      className: "map-tip",
    });
    circle.addTo(map);
    layers.push(circle);
  }

  // Animated dot travelling along the route
  if (mode.waypoints.length >= 2) {
    const dot = L.circleMarker(mode.waypoints[0], {
      radius: 9,
      color: "#fff",
      fillColor: mode.routeColor,
      fillOpacity: 1,
      weight: 2.5,
    });
    dot.addTo(map);
    layers.push(dot);

    const PERIOD_MS = 22_000; // full loop every 22 s
    let t0: number | null = null;

    const tick = (now: number) => {
      if (!t0) t0 = now;
      const pos = posOnRoute(mode.waypoints, ((now - t0) % PERIOD_MS) / PERIOD_MS);
      dot.setLatLng(pos);
      state.animFrame = requestAnimationFrame(tick);
    };
    state.animFrame = requestAnimationFrame(tick);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapCanvas({ mode }: { mode: MapModeGeo }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<State | null>(null);
  const firstRef = useRef(true);
  const sizeSyncTimeoutRef = useRef<number | null>(null);
  const sizeSyncRafRef = useRef<number | null>(null);

  const clearScheduledSizeSync = () => {
    if (sizeSyncRafRef.current !== null) {
      cancelAnimationFrame(sizeSyncRafRef.current);
      sizeSyncRafRef.current = null;
    }
    if (sizeSyncTimeoutRef.current !== null) {
      window.clearTimeout(sizeSyncTimeoutRef.current);
      sizeSyncTimeoutRef.current = null;
    }
  };

  const scheduleSizeSync = () => {
    clearScheduledSizeSync();

    sizeSyncRafRef.current = requestAnimationFrame(() => {
      stateRef.current?.map.invalidateSize({ pan: false });
      sizeSyncRafRef.current = null;
    });

    sizeSyncTimeoutRef.current = window.setTimeout(() => {
      stateRef.current?.map.invalidateSize({ pan: false });
      sizeSyncTimeoutRef.current = null;
    }, 120);
  };

  // Initialize map once on mount
  useEffect(() => {
    let isCancelled = false;
    let resizeHandler: (() => void) | null = null;

    const initMap = async () => {
      if (!containerRef.current || stateRef.current) return;

      const L = await import("leaflet");
      if (isCancelled || !containerRef.current || stateRef.current) return;

      const map = L.map(containerRef.current, {
        center: mode.center,
        zoom: mode.zoom,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // CartoDB Positron — clean, light, free, no API key
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        },
      ).addTo(map);

      stateRef.current = { L, map, layers: [], animFrame: 0 };

      // Trigger size sync after mount and when the map reports ready.
      scheduleSizeSync();
      map.whenReady(() => scheduleSizeSync());

      resizeHandler = () => scheduleSizeSync();
      window.addEventListener("resize", resizeHandler);

      // Draw initial overlays once the client-only map has been created.
      drawMode(stateRef.current, mode);
      firstRef.current = false;
    };

    void initMap();

    return () => {
      isCancelled = true;
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      clearScheduledSizeSync();
      cancelAnimationFrame(stateRef.current?.animFrame ?? 0);
      stateRef.current?.map.remove();
      stateRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redraw overlays whenever mode changes (runs after init on first mount too)
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;

    cancelAnimationFrame(state.animFrame);
    state.layers.forEach((l) => l.remove());
    state.layers = [];

    // Fly to new location on subsequent mode changes, not on first paint
    if (!firstRef.current) {
      state.map.flyTo(mode.center, mode.zoom, { duration: 0.8 });
    }
    drawMode(state, mode);

    scheduleSizeSync();
  }, [mode]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
