"use client";

import { LocateFixed, Minus, Plus, Radar, Waves } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { hazardColors, type WeatherEvent } from "@/lib/weather-data";
import { indiaStatePaths } from "@/lib/india-state-paths";

function projectEventCoordinates(coordinates: string) {
  const latitude = coordinates.match(/([\d.]+)\s*°?\s*([NS])/i);
  const longitude = coordinates.match(/([\d.]+)\s*°?\s*([EW])/i);

  if (!latitude || !longitude) return null;

  const lat = Number(latitude[1]) * (latitude[2].toUpperCase() === "S" ? -1 : 1);
  const lon = Number(longitude[1]) * (longitude[2].toUpperCase() === "W" ? -1 : 1);
  return {
    x: 30 + (lon - 67) * 13.3,
    y: 25 + (37.5 - lat) * 14.1,
  };
}

type IndiaWeatherMapProps = {
  events: WeatherEvent[];
  selectedId: string;
  onSelect: (id: string) => void;
  t: (text: string) => string;
};

export function IndiaWeatherMap({
  events,
  selectedId,
  onSelect,
  t,
}: IndiaWeatherMapProps) {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="map-shell">
      <div className="map-toolbar" aria-label="Map controls">
        <button type="button" aria-label="Zoom in" disabled={zoom >= 1.4} onClick={() => setZoom((value) => Math.min(1.4, value + 0.1))}>
          <Plus size={15} />
        </button>
        <button type="button" aria-label="Zoom out" disabled={zoom <= 0.9} onClick={() => setZoom((value) => Math.max(0.9, value - 0.1))}>
          <Minus size={15} />
        </button>
        <button type="button" aria-label="Center map" onClick={() => setZoom(1)}>
          <LocateFixed size={15} />
        </button>
      </div>

      <div className="map-orbit map-orbit-one" />
      <div className="map-orbit map-orbit-two" />

      <svg
        className="india-map"
        style={{ "--map-zoom": zoom } as CSSProperties}
        viewBox="0 0 460 500"
        role="img"
        aria-label="India weather incident map"
      >
        <defs>
          <linearGradient id="indiaFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#163752" />
            <stop offset="100%" stopColor="#071c2d" />
          </linearGradient>
          <pattern id="mapGrid" width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M 18 0 L 0 0 0 18" fill="none" stroke="#9bd9e5" strokeOpacity="0.08" strokeWidth="0.6" />
          </pattern>
          <filter id="mapGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="india-outline">
          {indiaStatePaths.map((path, index) => (
            <path
              d={path}
              fill="url(#indiaFill)"
              key={index}
              stroke="#8bd4de"
              strokeLinejoin="round"
              strokeOpacity="0.48"
              strokeWidth="1.15"
            />
          ))}
        </g>
        <path
          d="M0 0 H460 V500 H0 Z"
          fill="url(#mapGrid)"
          pointerEvents="none"
        />

        {events.map((event) => {
          const point = projectEventCoordinates(event.coordinates);
          const x = point?.x ?? (event.mapX / 100) * 390 + 20;
          const y = point?.y ?? (event.mapY / 100) * 430 + 18;
          const isSelected = event.id === selectedId;
          const color = hazardColors[event.type];

          return (
            <g
              className="event-marker"
              key={event.id}
              role="button"
              tabIndex={0}
              aria-label={`${t(event.type)} in ${event.city}, ${event.confidence}% ${t("verified")}`}
              onClick={() => onSelect(event.id)}
              onKeyDown={(keyEvent) => {
                if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                  keyEvent.preventDefault();
                  onSelect(event.id);
                }
              }}
            >
              <circle
                className="event-pulse"
                cx={x}
                cy={y}
                r={isSelected ? 19 : 14}
                fill="none"
                stroke={color}
              />
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 8 : 6.5}
                fill={color}
                stroke="#eaf9fb"
                strokeWidth="2"
                filter="url(#mapGlow)"
              />
              {isSelected ? (
                <g className="map-label">
                  <rect x={x + 13} y={y - 25} width="116" height="43" rx="4" fill="#f5f1e8" />
                  <text x={x + 23} y={y - 8} fill="#0a2638" fontSize="12" fontWeight="700">
                    {event.city}
                  </text>
                  <text x={x + 23} y={y + 8} fill="#58707d" fontSize="12">
                    {t(event.type)} · {event.confidence}%
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>

      <div className="map-watermark">
        <Radar size={16} />
        <span>{t("Multi-layer fusion")}</span>
      </div>
      <div className="map-legend">
        <span><i className="legend-dot critical" /> {t("Critical")}</span>
        <span><i className="legend-dot high" /> {t("High")}</span>
        <span><i className="legend-dot moderate" /> {t("Moderate")}</span>
      </div>
      <div className="bay-label">
        <Waves size={13} /> {t("Bay of Bengal")}
      </div>
    </div>
  );
}
