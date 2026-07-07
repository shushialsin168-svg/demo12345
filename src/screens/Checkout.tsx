import { useEffect, useState } from "react";
import { useCart } from "../store";
import { formatPrice } from "../data";
import { StepBar } from "../components/Layout";
import { IconArrowLeft, IconArrowRight, IconBag, IconCheck, IconClock } from "../components/Icons";
import {
  distanceMeters,
  formatDistance,
  requestLocation,
  type TgLocation,
} from "../telegramWebApp";

const SHOP_LOCATION = { latitude: 11.528618, longitude: 104.941755 };

type LocState =
  | { kind: "idle" }
  | { kind: "requesting" }
  | { kind: "ok"; loc: TgLocation; distance: number; address?: string; source: "saved" | "gps" }
  | { kind: "denied" }
  | { kind: "error"; message: string };

export default function Checkout({
  onBack,
  onSubmit,
  onEditProfile,
}: {
  onBack: () => void;
  onSubmit: (data: {
    method: "pickup" | "delivery";
    note: string;
    location: (TgLocation & { address?: string }) | null;
    distance: number | null;
  }) => void;
  onEditProfile: () => void;
}) {
  const { totalPrice, customerName, customerPhone, points, userLocation } = useCart();
  const [method, setMethod] = useState<"pickup" | "delivery">("delivery");
  const [usePoints, setUsePoints] = useState(false);
  const [duration, setDuration] = useState<string>("normal");
  const [invoice, setInvoice] = useState("");
  const [note, setNote] = useState("");
  const [loc, setLoc] = useState<LocState>({ kind: "idle" });

  const useSavedLocation = () => {
    if (!userLocation) return false;
    const l = { latitude: userLocation.latitude, longitude: userLocation.longitude };
    setLoc({
      kind: "ok",
      loc: l,
      distance: distanceMeters(l, SHOP_LOCATION),
      address: userLocation.address,
      source: "saved",
    });
    return true;
  };

  const fetchLocation = () => {
    setLoc({ kind: "requesting" });
    requestLocation()
      .then((l) => {
        setLoc({
          kind: "ok",
          loc: l,
          distance: distanceMeters(l, SHOP_LOCATION),
          source: "gps",
        });
      })
      .catch((err) => {
        // Fallback: use the location saved at registration.
        if (useSavedLocation()) return;
        const msg = String(err?.message || err || "");
        if (msg.toLowerCase().includes("denied") || err?.code === 1) {
          setLoc({ kind: "denied" });
        } else {
          setLoc({ kind: "error", message: msg || "មិនអាចទទួលទីតាំង" });
        }
      });
  };

  // When the user picks delivery: prefer the location they chose on the map
  // at registration; otherwise request live GPS.
  useEffect(() => {
    if (method === "delivery" && loc.kind === "idle") {
      if (!useSavedLocation()) fetchLocation();
    }
  }, [method, loc.kind]);

  return (
    <div className="flex flex-col h-full bg-[#f2f7f5]">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 bg-[#e6f4ef]">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-gray-600"
        >
          <IconArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 flex-1 text-center pr-10">
          បញ្ជាក់ការបញ្ជាទិញ
        </h1>
      </div>

      <StepBar step={2} />

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-40">
        {/* Delivery method */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMethod("pickup")}
            className={`bg-white rounded-2xl p-4 flex flex-col items-center gap-2 border-2 ${
              method === "pickup" ? "border-[#148c78]" : "border-transparent"
            }`}
          >
            <div className="w-20 h-20 rounded-2xl bg-[#e6f4ef] flex items-center justify-center text-4xl">
              🛍️
            </div>
            <div className="text-sm font-medium text-gray-700">យកនៅហាងផ្ទាល់</div>
          </button>
          <button
            onClick={() => setMethod("delivery")}
            className={`bg-white rounded-2xl p-4 flex flex-col items-center gap-2 border-2 ${
              method === "delivery" ? "border-[#148c78]" : "border-transparent"
            }`}
          >
            <div className="w-20 h-20 rounded-2xl bg-[#e6f4ef] flex items-center justify-center text-4xl">
              🛵
            </div>
            <div className="text-sm font-medium text-gray-700">ដឹកជញ្ជូនដល់ទីតាំង</div>
          </button>
        </div>

        {/* Delivery location panel — shown only for delivery */}
        {method === "delivery" && (
          <div className="mt-3 bg-white rounded-2xl p-3 card-shadow">
            <div className="flex items-center justify-between">
              <div className="text-[#148c78] font-semibold text-sm flex items-center gap-1">
                📍 ទីតាំងដឹកជញ្ជូន
              </div>
              {loc.kind === "ok" && (
                <span className="text-xs text-gray-500">
                  {formatDistance(loc.distance)} ពីហាង
                </span>
              )}
            </div>

            {loc.kind === "requesting" && (
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                <span className="w-2 h-2 bg-[#148c78] rounded-full animate-pulse" />
                កំពុងស្នើសុំទីតាំង...
              </div>
            )}

            {loc.kind === "ok" && (
              <>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      loc.source === "saved"
                        ? "bg-[#148c78]/10 text-[#148c78]"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {loc.source === "saved" ? "📌 ទីតាំងដែលបានជ្រើសរើស" : "🛰️ ទីតាំងបច្ចុប្បន្ន (GPS)"}
                  </span>
                </div>
                <div className="mt-1.5 text-[11px] text-gray-600 font-mono">
                  {loc.loc.latitude.toFixed(6)}, {loc.loc.longitude.toFixed(6)}
                </div>
                {loc.address && (
                  <div className="mt-1 text-[11px] text-gray-500 line-clamp-2">
                    {loc.address}
                  </div>
                )}
                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  <a
                    href={`https://maps.google.com/?q=${loc.loc.latitude},${loc.loc.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#148c78] underline"
                  >
                    មើលក្នុងផែនទី
                  </a>
                  {loc.source === "saved" ? (
                    <button
                      onClick={fetchLocation}
                      className="text-[11px] text-blue-600 underline"
                    >
                      🛰️ ប្រើទីតាំងបច្ចុប្បន្ន
                    </button>
                  ) : (
                    userLocation && (
                      <button
                        onClick={useSavedLocation}
                        className="text-[11px] text-[#148c78] underline"
                      >
                        📌 ប្រើទីតាំងដែលបានជ្រើសរើស
                      </button>
                    )
                  )}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 bg-green-50 text-green-700 text-[11px] px-2 py-1 rounded-full">
                  <IconCheck className="w-3 h-3" />
                  ទីតាំងនេះនឹងត្រូវផ្ញើទៅ Telegram ស្វ័យប្រវត្តិ
                </div>
              </>
            )}

            {loc.kind === "denied" && (
              <>
                <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  ⚠️ ការចូលដំណើរការទីតាំងត្រូវបានបដិសេធ។ សូមអនុញ្ញាតដើម្បីបញ្ជាទិញដឹកជញ្ជូន។
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={fetchLocation}
                    className="text-xs text-[#148c78] font-medium underline"
                  >
                    ព្យាយាមម្ដងទៀត
                  </button>
                  {userLocation && (
                    <button
                      onClick={useSavedLocation}
                      className="text-xs text-[#148c78] font-medium underline"
                    >
                      📍 ប្រើទីតាំងដែលបានរក្សាទុក
                    </button>
                  )}
                </div>
              </>
            )}

            {loc.kind === "error" && (
              <>
                <div className="mt-2 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  ⚠️ {loc.message}
                </div>
                <button
                  onClick={fetchLocation}
                  className="mt-2 text-xs text-[#148c78] font-medium underline"
                >
                  ព្យាយាមម្ដងទៀត
                </button>
              </>
            )}
          </div>
        )}

        {/* Customer info */}
        <button
          onClick={onEditProfile}
          className="mt-4 w-full text-left"
        >
          <div className="flex items-center justify-between">
            <div className="text-[#148c78] font-semibold text-sm">ព័ត៌មានអ្នកទទួល</div>
            <IconArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-1 text-sm text-gray-700">ឈ្មោះ: {customerName}</div>
          <div className="text-sm text-gray-700">
            លេខទូរស័ព្ទ*: {customerPhone || <span className="text-red-400">ត្រូវការ</span>}
          </div>
        </button>

        <div className="border-t border-gray-200 my-4" />

        {/* Time */}
        <div>
          <div className="flex items-center justify-between">
            <div className="text-[#148c78] font-semibold text-sm">ពេលវេលាទៅយក</div>
            <IconClock className="w-4 h-4 text-[#148c78]" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <select className="bg-white border border-gray-200 rounded-md px-2 py-1 text-sm">
              <option>00</option>
              <option>01</option>
            </select>
            <span className="text-sm text-gray-600">ម៉ោង</span>
            <select className="bg-white border border-gray-200 rounded-md px-2 py-1 text-sm">
              <option>00</option>
              <option>15</option>
              <option>30</option>
            </select>
            <span className="text-sm text-gray-600">នាទី</span>
            <button className="ml-auto w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs">
              ×
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            {[
              { id: "normal", label: "ធម្មតា" },
              { id: "15", label: "15 នាទី" },
              { id: "30", label: "30 នាទី" },
              { id: "60", label: "60 នាទី" },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDuration(d.id)}
                className={`px-3 py-1 text-xs rounded-full border ${
                  duration === d.id
                    ? "border-[#148c78] text-[#148c78] bg-[#148c78]/10"
                    : "border-gray-200 text-gray-600 bg-white"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ចំណាំ"
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#148c78]"
          />
        </div>

        <div className="border-t border-gray-200 my-4" />

        {/* Summary */}
        <div>
          <div className="text-[#148c78] font-semibold text-sm">សង្ខេបនៃការបញ្ជាទិញ</div>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">សរុបរួម</span>
              <span className="font-medium">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">បញ្ចុះតម្លៃ</span>
              <span className="font-medium">៛ 0</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-gray-800">ប្រាក់សរុប</span>
              <span className="text-[#148c78]">{formatPrice(totalPrice)}</span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-gray-700">
              <span className="text-[#148c78]">🎁</span> ប្រើប្រាស់ {points} ពិន្ទុរបស់ខ្ញុំដើម្បីបញ្ចុះ
            </span>
            <button
              onClick={() => setUsePoints((v) => !v)}
              className={`w-10 h-5 rounded-full relative transition ${
                usePoints ? "bg-[#148c78]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${
                  usePoints ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Invoice input */}
        <div className="mt-4 bg-[#148c78] rounded-2xl p-3 flex items-center gap-2">
          <div className="text-4xl">🎁</div>
          <input
            value={invoice}
            onChange={(e) => setInvoice(e.target.value)}
            placeholder="លេខកូដបញ្ចុះ"
            className="flex-1 bg-white/95 rounded-lg px-3 py-2 text-sm outline-none"
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute left-0 right-0 bottom-0 p-3 bg-white/80 backdrop-blur border-t border-gray-100">
        <div className="bg-black rounded-full flex items-center justify-between p-1 pl-4">
          <div className="text-white">
            <div className="text-[10px] opacity-70">ប្រាក់សរុប</div>
            <div className="text-sm font-bold">{formatPrice(totalPrice)}</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-white text-gray-700 rounded-full px-3 py-2 text-xs font-medium border border-gray-200">
              អនុលោម
            </button>
            <button
              onClick={() =>
                onSubmit({
                  method,
                  note,
                  location:
                    loc.kind === "ok"
                      ? { ...loc.loc, address: loc.address }
                      : null,
                  distance: loc.kind === "ok" ? loc.distance : null,
                })
              }
              disabled={
                !customerPhone ||
                (method === "delivery" && loc.kind !== "ok")
              }
              className="bg-orange-400 hover:bg-orange-500 disabled:opacity-50 text-white rounded-full px-5 py-2.5 text-sm font-medium flex items-center gap-2"
            >
              <IconCheck className="w-4 h-4" />
              បញ្ជាទិញ
            </button>
          </div>
        </div>
        {!customerPhone && (
          <div className="text-center text-[11px] text-red-500 mt-1 flex items-center justify-center gap-1">
            <IconBag className="w-3 h-3" /> សូមបញ្ចូលលេខទូរស័ព្ទដើម្បីបញ្ជាទិញ
          </div>
        )}
        {customerPhone && method === "delivery" && loc.kind !== "ok" && (
          <div className="text-center text-[11px] text-amber-600 mt-1 flex items-center justify-center gap-1">
            📍 សូមអនុញ្ញាតទីតាំងសម្រាប់ការដឹកជញ្ជូន
          </div>
        )}
      </div>
    </div>
  );
}
