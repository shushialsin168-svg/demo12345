import { useState } from "react";
import { useCart } from "../store";

export default function CustomerInfo({ onDone }: { onDone: () => void }) {
  const { customerName, setCustomerName, customerPhone, setCustomerPhone, isFromTelegram, tgUser } = useCart();
  const [name, setName] = useState(customerName);
  const [phone, setPhone] = useState(customerPhone);

  const save = () => {
    setCustomerName(name);
    setCustomerPhone(phone);
    onDone();
  };

  return (
    <div className="flex flex-col h-full bg-[#e6f4ef]">
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-800 flex-1">ព័ត៌មានអ្នកទទួល</h1>
        <button
          onClick={save}
          className="bg-[#148c78] text-white rounded-md px-4 py-1.5 text-sm font-medium"
        >
          រក្សាទុក
        </button>
      </div>

      {isFromTelegram && tgUser && (
        <div className="mx-5 mb-3 bg-white/70 rounded-xl p-3 flex items-center gap-3 border border-[#26A5E4]/30">
          {tgUser.photo_url ? (
            <img
              src={tgUser.photo_url}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#26A5E4] text-white flex items-center justify-center font-bold">
              {(tgUser.first_name || "T")[0]}
            </div>
          )}
          <div className="text-xs text-gray-700 flex-1">
            <div className="font-semibold text-[#26A5E4] flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                <path d="m21.5 4.5-19 8 6 2 2 6 4-4 5 4z" />
              </svg>
              បានចាប់យកពី Telegram
            </div>
            <div className="text-gray-600">
              {tgUser.username ? `@${tgUser.username}` : `ID: ${tgUser.id}`}
            </div>
          </div>
        </div>
      )}

      <div className="px-5 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ឈ្មោះ"
          className="w-full bg-white rounded-full px-4 py-3 text-sm outline-none border border-white focus:border-[#148c78]"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ""))}
          placeholder="លេខទូរស័ព្ទ"
          className="w-full bg-white rounded-full px-4 py-3 text-sm outline-none border border-white focus:border-[#148c78]"
        />
      </div>

      <div className="flex-1" />
    </div>
  );
}
