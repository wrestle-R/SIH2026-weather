"use client";

import { LocateFixed, Minus, Plus, Radar, Waves } from "lucide-react";
import { hazardColors, type WeatherEvent } from "@/lib/weather-data";

type IndiaWeatherMapProps = {
  events: WeatherEvent[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function IndiaWeatherMap({
  events,
  selectedId,
  onSelect,
}: IndiaWeatherMapProps) {
  return (
    <div className="map-shell">
      <div className="map-toolbar" aria-label="Map controls">
        <button type="button" aria-label="Zoom in">
          <Plus size={15} />
        </button>
        <button type="button" aria-label="Zoom out">
          <Minus size={15} />
        </button>
        <button type="button" aria-label="Center map">
          <LocateFixed size={15} />
        </button>
      </div>

      <div className="map-orbit map-orbit-one" />
      <div className="map-orbit map-orbit-two" />

      <svg
        className="india-map"
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

        <path
          className="india-outline"
          d="M148 54 L176 40 L196 47 L211 37 L235 43 L251 57 L278 61 L294 72 L314 72 L329 88 L353 97 L371 118 L359 133 L331 137 L315 151 L301 155 L298 173 L283 182 L276 205 L260 221 L258 245 L247 265 L247 293 L234 312 L229 339 L215 360 L203 390 L190 414 L176 396 L169 367 L153 346 L146 320 L130 303 L118 276 L99 257 L91 232 L73 220 L67 197 L78 176 L69 158 L81 139 L76 118 L92 104 L104 82 L124 78 Z"
          fill="url(#indiaFill)"
          stroke="#78c8d7"
          strokeOpacity="0.62"
          strokeWidth="1.4"
        />
        <path
          d="M146 78 L151 118 M102 105 L142 137 L183 141 L224 118 M80 176 L124 181 L168 172 L211 184 L258 164 M95 232 L139 225 L183 240 L232 217 M123 300 L169 282 L225 293 M151 346 L203 331 M186 143 L179 203 L168 282 M226 120 L211 184 L232 217 L225 293"
          fill="none"
          stroke="#8fd3df"
          strokeDasharray="3 5"
          strokeOpacity="0.19"
          strokeWidth="0.8"
        />
        <path
          d="M0 0 H460 V500 H0 Z"
          fill="url(#mapGrid)"
          pointerEvents="none"
        />

        {events.map((event) => {
          const x = (event.mapX / 100) * 390 + 20;
          const y = (event.mapY / 100) * 430 + 18;
          const isSelected = event.id === selectedId;
          const color = hazardColors[event.type];

          return (
            <g
              className="event-marker"
              key={event.id}
              role="button"
              tabIndex={0}
              aria-label={`${event.type} in ${event.city}, ${event.confidence}% verified`}
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
                  <text x={x + 23} y={y - 8} fill="#0a2638" fontSize="11" fontWeight="700">
                    {event.city}
                  </text>
                  <text x={x + 23} y={y + 8} fill="#58707d" fontSize="9">
                    {event.type} · {event.confidence}%
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>

      <div className="map-watermark">
        <Radar size={16} />
        <span>Multi-layer fusion</span>
      </div>
      <div className="map-legend">
        <span><i className="legend-dot critical" /> Critical</span>
        <span><i className="legend-dot high" /> High</span>
        <span><i className="legend-dot moderate" /> Moderate</span>
      </div>
      <div className="bay-label">
        <Waves size={13} /> Bay of Bengal
      </div>
    </div>
  );
}
