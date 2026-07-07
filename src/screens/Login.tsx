import { useState } from "react";
import { upsertUser } from "../db";
import { sendNewUserRegistration } from "../telegram";
import { getTelegramUser } from "../telegramWebApp";
import { IconCheck } from "../components/Icons";
import LocationPicker, { type PickedLocation } from "../components/LocationPicker";
import type { UserLocation } from "../store";

export default function Login({
  defaultName,
  onSuccess,
}: {
  defaultName: string;
  onSuccess: (data: { name: string; phone: string; location: UserLocation | null }) => void;
}) {
  const [name, setName] = useState(defaultName === "USER" ? "" : defaultName);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<PickedLocation | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tg = getTelegramUser();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (trimmedName.length < 2) {
      setError("សូមបញ្ចូលឈ្មោះឲ្យបានត្រឹមត្រូវ");
      return;
    }
    if (!/^\+?\d{8,15}$/.test(trimmedPhone)) {
      setError("សូមបញ្ចូលលេខទូរស័ព្ទឲ្យបានត្រឹមត្រូវ (៨-១៥ ខ្ទង់)");
      return;
    }
    if (!location) {
      setError("សូមជ្រើសរើសទីតាំងរបស់អ្នកពីផែនទី");
      return;
    }
    setLoading(true);
    try {
      await upsertUser({
        name: trimmedName,
        phone: trimmedPhone,
        telegramId: tg ? String(tg.id) : null,
        telegramUsername: tg?.username ?? null,
        locationLat: location.latitude,
        locationLng: location.longitude,
        locationAddress: location.address ?? null,
      });
      const userLoc: UserLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      };
      // Fire-and-forget: notify Telegram channel with the chosen location.
      sendNewUserRegistration({
        name: trimmedName,
        phone: trimmedPhone,
        telegramUsername: tg?.username ?? null,
        telegramId: tg ? String(tg.id) : null,
        location: userLoc,
      }).catch((e) => console.error("TG registration notify failed", e));

      localStorage.setItem(
        "nt26.user",
        JSON.stringify({ name: trimmedName, phone: trimmedPhone, location: userLoc })
      );
      onSuccess({ name: trimmedName, phone: trimmedPhone, location: userLoc });
    } catch (err) {
      console.error(err);
      setError("ការភ្ជាប់ទៅ server បរាជ័យ។ សូមព្យាយាមម្តងទៀត។");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#148c78] to-[#0f6f61] text-white relative">
      {showPicker && (
        <LocationPicker
          initial={location}
          onConfirm={(loc) => {
            setLocation(loc);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Decorative header */}
      <div className="relative h-48 flex items-end justify-center pb-5 overflow-hidden flex-shrink-0">
        <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute top-10 -right-20 w-64 h-64 rounded-full bg-white/5" />

        <div className="relative text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/95 flex items-center justify-center text-3xl shadow-xl">
            ☕
          </div>
          <div className="mt-3 text-2xl font-black tracking-wide">NT26 COFFEE</div>
          <div className="mt-0.5 text-xs text-white/80">សូមស្វាគមន៍ 🙏</div>
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-6 pb-6 text-gray-800 -mt-4 relative overflow-y-auto no-scrollbar">
        <h2 className="text-lg font-bold text-gray-800">ចូលប្រើប្រាស់</h2>
        <p className="text-xs text-gray-500 mt-1">
          សូមបញ្ចូលឈ្មោះ លេខទូរស័ព្ទ និងជ្រើសរើសទីតាំងរបស់អ្នក
        </p>

        {tg && (
          <div className="mt-3 bg-[#26A5E4]/10 border border-[#26A5E4]/30 rounded-xl px-3 py-2 flex items-center gap-2">
            {tg.photo_url ? (
              <img
                src={tg.photo_url}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#26A5E4] text-white flex items-center justify-center text-xs font-bold">
                {(tg.first_name || "T")[0]}
              </div>
            )}
            <div className="text-xs">
              <div className="text-[#26A5E4] font-semibold flex items-center gap-1">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                  <path d="m21.5 4.5-19 8 6 2 2 6 4-4 5 4z" />
                </svg>
                បានចាប់យកពី Telegram
              </div>
              <div className="text-gray-600">
                {tg.username ? `@${tg.username}` : `ID: ${tg.id}`}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs text-gray-600 font-medium">
              ឈ្មោះ <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ឧ. Sok Pheng"
              className="mt-1 w-full bg-[#f2f7f5] rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[#148c78]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium">
              លេខទូរស័ព្ទ <span className="text-red-500">*</span>
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ""))}
              placeholder="ឧ. 012345678"
              inputMode="tel"
              className="mt-1 w-full bg-[#f2f7f5] rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[#148c78]"
            />
          </div>

          {/* Location field */}
          <div>
            <label className="text-xs text-gray-600 font-medium">
              ទីតាំងរបស់អ្នក <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className={`mt-1 w-full rounded-xl px-4 py-3 text-sm text-left border transition ${
                location
                  ? "bg-[#148c78]/5 border-[#148c78]/40"
                  : "bg-[#f2f7f5] border-transparent hover:border-[#148c78]/30"
              }`}
            >
              {location ? (
                <div className="flex items-start gap-2">
                  <span className="text-lg leading-none">📍</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-mono text-gray-700">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </div>
                    {location.address && (
                      <div className="text-[11px] text-gray-500 truncate mt-0.5">
                        {location.address}
                      </div>
                    )}
                    <div className="text-[11px] text-[#148c78] mt-0.5 font-medium">
                      ចុចដើម្បីផ្លាស់ប្ដូរ
                    </div>
                  </div>
                  <IconCheck className="w-4 h-4 text-[#148c78] flex-shrink-0 mt-0.5" />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="text-lg">🗺️</span>
                  ជ្រើសរើសទីតាំងពីផែនទី
                </div>
              )}
            </button>
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#148c78] hover:bg-[#0f6f61] disabled:opacity-60 text-white rounded-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#148c78]/30"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                កំពុងរក្សាទុក...
              </>
            ) : (
              <>
                <IconCheck className="w-4 h-4" />
                ចូលចាប់ផ្ដើម
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-gray-400">
            ដោយចុច "ចូលចាប់ផ្ដើម" អ្នកយល់ព្រមឲ្យយើងរក្សាទុកព័ត៌មានរបស់អ្នក
          </p>
        </form>
      </div>
    </div>
  );
}
