export default function PriceTablePopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center overflow-y-auto no-scrollbar py-8 px-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* card */}
      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-[popIn_.2s_ease-out] bg-gradient-to-b from-[#1a9be0] to-[#0d7fc4]">
        {/* close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/25 text-white flex items-center justify-center text-lg"
        >
          ×
        </button>

        {/* FREE សាប៊ូ animated tag — top right, flyer style */}
        <div className="absolute top-10 right-4 z-10 animate-[tagPop_1.6s_ease-in-out_infinite]">
          <div className="w-[74px] h-[74px] rounded-full bg-gradient-to-b from-[#f5d848] to-[#e8b830] shadow-xl border-2 border-white flex flex-col items-center justify-center text-center rotate-[8deg]">
            <div
              className="text-[#c0392b] font-black text-[17px] leading-none"
              style={{ textShadow: "0 1px 0 rgba(255,255,255,.6)" }}
            >
              FREE
            </div>
            <div
              className="text-white font-black text-[12px] leading-tight mt-0.5"
              style={{
                fontFamily: "Kantumruy Pro",
                textShadow: "0 1px 2px rgba(160,90,20,.8)",
              }}
            >
              ទឹកសាប៊ូ
            </div>
            <div className="text-[#a3541c] font-bold text-[7px] leading-none mt-0.5">
              Detergent
            </div>
          </div>
        </div>

        {/* header */}
        <div className="px-5 pt-5 pb-3 text-center">
          <div
            className="text-white font-black text-2xl leading-tight"
            style={{ fontFamily: "Kantumruy Pro" }}
          >
            តម្លៃសេវាកម្ម | LAUNDRY PRICES
          </div>
        </div>

        {/* ── WASHING PRICE ── */}
        <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-b from-[#dff2fb] to-[#bfe6f7] p-3">
          <div className="mx-auto w-fit bg-[#0d7fc4] text-white text-sm font-bold rounded-full px-4 py-1.5 mb-3 text-center">
            តម្លៃបោកគក់ | WASHING PRICE
          </div>

          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="text-[#0a5c8f] text-[11px] font-bold">
                <th className="py-1">
                  ខ្នាតម៉ាស៊ីន
                  <div className="font-normal text-[9px]">(Size)</div>
                </th>
                <th className="py-1">
                  ទឹកត្រជាក់
                  <div className="font-normal text-[9px]">(Cold)</div>
                </th>
                <th className="py-1">
                  ទឹកក្តៅឧណ្ហា
                  <div className="font-normal text-[9px]">(Warm)</div>
                </th>
                <th className="py-1">
                  ទឹកក្តៅខ្លាំង
                  <div className="font-normal text-[9px]">(Hot)</div>
                </th>
                <th className="py-1">
                  រយៈពេល
                  <div className="font-normal text-[9px]">(Duration)</div>
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-900">
              <tr>
                <td className="bg-white rounded-l-xl border border-[#9fd4ef] py-2 font-bold text-sm">
                  13 <span className="text-[10px] font-medium">គីឡូ (kg)</span>
                </td>
                <td className="bg-white border border-[#9fd4ef] py-2">
                  <div className="font-bold text-sm">7000៛</div>
                  <div className="text-[10px] text-gray-500">$1.75</div>
                </td>
                <td className="bg-white border border-[#9fd4ef] py-2">
                  <div className="font-bold text-sm">8000៛</div>
                  <div className="text-[10px] text-gray-500">$2.00</div>
                </td>
                <td className="bg-white border border-[#9fd4ef] py-2">
                  <div className="font-bold text-sm">9000៛</div>
                  <div className="text-[10px] text-gray-500">$2.25</div>
                </td>
                <td rowSpan={2} className="bg-white rounded-r-xl border border-[#9fd4ef] py-2 align-middle">
                  <div className="font-bold text-sm">36នាទី</div>
                  <div className="text-[10px] text-gray-500">(Mins)</div>
                </td>
              </tr>
              <tr>
                <td className="bg-white rounded-l-xl border border-[#9fd4ef] py-2 font-bold text-sm">
                  18 <span className="text-[10px] font-medium">គីឡូ (kg)</span>
                </td>
                <td className="bg-white border border-[#9fd4ef] py-2">
                  <div className="font-bold text-sm">8000៛</div>
                  <div className="text-[10px] text-gray-500">$2.00</div>
                </td>
                <td className="bg-white border border-[#9fd4ef] py-2">
                  <div className="font-bold text-sm">9000៛</div>
                  <div className="text-[10px] text-gray-500">$2.25</div>
                </td>
                <td className="bg-white border border-[#9fd4ef] py-2">
                  <div className="font-bold text-sm">10000៛</div>
                  <div className="text-[10px] text-gray-500">$2.50</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── DRYING PRICE ── */}
        <div className="mx-4 mb-5 rounded-2xl bg-gradient-to-b from-[#f5d848] to-[#eec73a] p-3">
          <div className="mx-auto w-fit bg-[#0d7fc4] text-white text-sm font-bold rounded-full px-4 py-1.5 mb-3 text-center">
            តម្លៃសម្ងួត | DRYING PRICE
          </div>

          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="text-[#6b5900] text-[11px] font-bold">
                <th className="py-1">
                  ខ្នាតម៉ាស៊ីន
                  <div className="font-normal text-[9px]">(Size)</div>
                </th>
                <th className="py-1">
                  40នាទី
                  <div className="font-normal text-[9px]">(Mins)</div>
                </th>
                <th className="py-1">
                  50នាទី
                  <div className="font-normal text-[9px]">(Mins)</div>
                </th>
                <th className="py-1">
                  បន្ថែមនាទី
                  <div className="font-normal text-[9px]">(Add Mins)</div>
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-900">
              <tr>
                <td className="bg-white rounded-l-xl border border-[#d9be2a] py-2 font-bold text-sm">
                  13 <span className="text-[10px] font-medium">គីឡូ (kg)</span>
                </td>
                <td className="bg-white border border-[#d9be2a] py-2">
                  <div className="font-bold text-sm">7000៛</div>
                  <div className="text-[10px] text-gray-500">$1.75</div>
                </td>
                <td className="bg-white border border-[#d9be2a] py-2">
                  <div className="font-bold text-sm">8000៛</div>
                  <div className="text-[10px] text-gray-500">$2.00</div>
                </td>
                <td className="bg-white rounded-r-xl border border-[#d9be2a] py-2">
                  <div className="font-bold text-[11px]">1000៛ = 7នាទី</div>
                  <div className="text-[9px] text-gray-500">USD 0.25 = 7 (Mins)</div>
                </td>
              </tr>
              <tr>
                <td className="bg-white rounded-l-xl border border-[#d9be2a] py-2 font-bold text-sm">
                  18 <span className="text-[10px] font-medium">គីឡូ (kg)</span>
                </td>
                <td className="bg-white border border-[#d9be2a] py-2">
                  <div className="font-bold text-sm">8000៛</div>
                  <div className="text-[10px] text-gray-500">$2.00</div>
                </td>
                <td className="bg-white border border-[#d9be2a] py-2">
                  <div className="font-bold text-sm">9000៛</div>
                  <div className="text-[10px] text-gray-500">$2.25</div>
                </td>
                <td className="bg-white rounded-r-xl border border-[#d9be2a] py-2">
                  <div className="font-bold text-[11px]">1000៛ = 7នាទី</div>
                  <div className="text-[9px] text-gray-500">USD 0.25 = 7 (Mins)</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── FOOTER ── */}
        <div className="bg-[#0a5c8f] px-5 py-4">
          <div className="text-center">
            <span
              className="text-white font-bold text-base"
              style={{ fontFamily: "Kantumruy Pro" }}
            >
              បើកពីម៉ោង{" "}
              <span className="text-[#f5d848] font-black text-lg">6AM</span> ដល់{" "}
              <span className="text-[#f5d848] font-black text-lg">12AM</span>
            </span>
          </div>
          <p
            className="mt-2 text-white/85 text-[11px] leading-relaxed text-center"
            style={{ fontFamily: "Kantumruy Pro" }}
          >
            ផ្លូវបេតុងថ្មី(ព្រែកបារាំង) ចម្ងាយ 300ម៉ែត្រពីកាវ៉ាស់សាំង Total និរោធ
            ឆ្ពោះទៅស្តុបផ្លូវព្រែកប្រា
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-white text-xs">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              📞
            </span>
            <span className="font-semibold">+855 93 342 226</span>
            <span className="mx-1 opacity-40">|</span>
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              📍
            </span>
            <span style={{ fontFamily: "Kantumruy Pro" }}>ស្កេនសម្រាប់ទីតាំង</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: translateY(-8px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes tagPop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
}
