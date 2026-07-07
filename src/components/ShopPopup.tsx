import { useEffect, useState } from "react";
import {
  distanceMeters,
  formatDistance,
  requestLocation,
  type TgLocation,
} from "../telegramWebApp";

const SHOP = {
  name: "NT26 Coffee",
  phone: "+855 93 342 226",
  address: "ផ្លូវបេតុងថ្មី(ព្រែកបារាំង) ចម្ងាយ 300ម៉ែត្រពីកាវ៉ាស់សាំង Total និរោធ ឆ្ពោះទៅស្តុបផ្លូវព្រែកប្រា",
  hours: "06:00 - 18:00",
  location: { latitude: 11.528618, longitude: 104.941755 },
  mapsUrl:
    "https://www.google.com/maps/place/11%C2%B031'43.0%22N+104%C2%B056'30.3%22E/@11.5274984,104.9423826,18z",
};

type State =
  | { kind: "requesting" }
  | { kind: "ok"; distance: number; loc: TgLocation }
  | { kind: "denied" }
  | { kind: "error"; message: string };

export default function ShopPopup({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<State>({ kind: "requesting" });

  useEffect(() => {
    let cancelled = false;
    requestLocation()
      .then((loc) => {
        if (cancelled) return;
        const d = distanceMeters(loc, SHOP.location);
        setState({ kind: "ok", distance: d, loc });
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = String(err?.message || err || "");
        if (msg.toLowerCase().includes("denied") || err?.code === 1) {
          setState({ kind: "denied" });
        } else {
          setState({ kind: "error", message: msg || "មិនអាចទទួលទីតាំង" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* popup */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-[popIn_.2s_ease-out]">
        {/* header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
          <div className="flex-1 text-center text-sm font-semibold text-gray-700">
            ស្វែងរកហាងនៅក្បែរ
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        {/* shop card */}
        <div className="p-3">
          <div className="flex gap-3">
            {/* Shop illustration */}
            <div className="w-24 h-24 rounded-xl bg-[#e6f4ef] flex items-center justify-center flex-shrink-0 overflow-hidden">
              <ShopIllustration />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-gray-800 text-sm truncate">
                  {SHOP.name}
                </div>
                <DistanceBadge state={state} />
              </div>
              <a
                href={`tel:${SHOP.phone.replace(/\s/g, "")}`}
                className="text-[#148c78] text-xs underline block mt-0.5"
              >
                {SHOP.phone}
              </a>
              <div className="text-[11px] text-gray-600 mt-1 leading-snug">
                {SHOP.address}
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="text-[11px] text-gray-600">{SHOP.hours}</div>
                <a
                  href={SHOP.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#148c78] font-medium hover:underline"
                >
                  មើល
                </a>
              </div>
            </div>
          </div>

          {/* Error / denied helpers */}
          {state.kind === "denied" && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[11px] text-amber-800">
              អ្នកបានបដិសេធការចូលដំណើរការទីតាំង។ សូមអនុញ្ញាតទីតាំងក្នុងកម្មវិធីរុករក ឬ Telegram ដើម្បីមើលចម្ងាយ។
            </div>
          )}
          {state.kind === "error" && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-[11px] text-red-700">
              ⚠️ {state.message}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: translateY(-8px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

function DistanceBadge({ state }: { state: State }) {
  if (state.kind === "requesting") {
    return (
      <span className="text-[11px] text-gray-400 flex items-center gap-1 whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
        ...
      </span>
    );
  }
  if (state.kind === "ok") {
    return (
      <span className="text-[12px] text-gray-700 font-semibold whitespace-nowrap">
        {formatDistance(state.distance)}
      </span>
    );
  }
  return (
    <span className="text-[11px] text-gray-400 whitespace-nowrap">— —</span>
  );
}

function ShopIllustration() {
  return (
    <svg viewBox="0 0 100 100" width="80" height="80">
      {/* awning */}
      <rect x="15" y="30" width="70" height="10" fill="#f4a261" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect
          key={i}
          x={15 + i * 10}
          y="30"
          width="10"
          height="10"
          fill={i % 2 === 0 ? "#e76f51" : "#f4a261"}
        />
      ))}
      {/* building */}
      <rect x="15" y="40" width="70" height="45" fill="#fefae0" stroke="#d4a373" strokeWidth="1.5" />
      {/* door */}
      <rect x="42" y="55" width="16" height="30" fill="#8ecae6" stroke="#219ebc" strokeWidth="1" />
      <circle cx="55" cy="70" r="1" fill="#023047" />
      {/* windows */}
      <rect x="20" y="48" width="16" height="16" fill="#8ecae6" stroke="#219ebc" strokeWidth="1" />
      <rect x="64" y="48" width="16" height="16" fill="#8ecae6" stroke="#219ebc" strokeWidth="1" />
      {/* sign */}
      <rect x="35" y="42" width="30" height="6" fill="#2a9d8f" rx="1" />
      <text x="50" y="47" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">
        COFFEE
      </text>
      {/* ground */}
      <rect x="10" y="85" width="80" height="5" fill="#a3b18a" />
    </svg>
  );
}
