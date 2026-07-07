import { useMemo, useState } from "react";
import { categories, formatPrice } from "../data";
import { useCart } from "../store";
import { StepBar } from "../components/Layout";
import { IconArrowLeft, IconArrowUp, IconClock, IconMenu, IconSearch } from "../components/Icons";

export default function Shop({
  onBack,
  onOpenProduct,
  onOpenCart,
}: {
  onBack: () => void;
  onOpenProduct: (id: string) => void;
  onOpenCart: () => void;
}) {
  const [activeCat, setActiveCat] = useState("all");
  const [query, setQuery] = useState("");
  const { totalItems, products, productsLoading } = useCart();

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const okCat = activeCat === "all" || p.categoryId === activeCat;
      const okQ = !query || p.nameKh.includes(query);
      return okCat && okQ;
    });
  }, [activeCat, query, products]);

  const activeCatName = categories.find((c) => c.id === activeCat)?.nameKh ?? "";

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 bg-[#e6f4ef]">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-gray-600"
        >
          <IconArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 flex-1">NT26 Coffee</h1>
        <button
          onClick={onOpenCart}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#148c78] border border-[#148c78]/40 relative"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="17" cy="20" r="1.5" />
            <path d="M3 4h2l2.5 12h11L21 8H6" />
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      <StepBar step={1} />

      {/* shop info */}
      <div className="px-5 pb-3 bg-[#e6f4ef]">
        <div className="text-sm text-gray-700">
          ផ្លូវបេតុងថ្មី(ព្រែកបារាំង) ចម្ងាយ 300ម៉ែត្រពីកាវ៉ាស់សាំង Total និរោធ ឆ្ពោះទៅស្តុបផ្លូវព្រែកប្រា
        </div>
        <div className="flex items-center gap-1 text-[#148c78] text-sm mt-1">
          <IconClock className="w-4 h-4" />
          <span>ហាងកំពុងបើក (06:00AM → 12:00AM)</span>
        </div>
      </div>

      {/* search */}
      <div className="px-5 pb-3 bg-[#e6f4ef]">
        <div className="bg-white rounded-full flex items-center gap-2 px-4 py-2.5 shadow-sm border border-white">
          <IconSearch className="w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ស្វែងរកទំនិញ"
            className="flex-1 outline-none bg-transparent text-sm placeholder:text-gray-400"
          />
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#148c78]" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M6 12h12M10 18h4" />
          </svg>
        </div>
      </div>

      {/* categories */}
      <div className="px-3 pb-3 bg-[#e6f4ef] flex items-center gap-2">
        <button className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-gray-500">
          <IconMenu className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCat === c.id
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 border border-white"
              }`}
            >
              {c.nameKh}
            </button>
          ))}
        </div>
      </div>

      {/* product grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-[#f2f7f5] px-4 pt-3 pb-6 relative">
        <div className="text-[#148c78] font-semibold mb-3">{activeCatName}</div>
        {productsLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-12">
            <span className="w-4 h-4 border-2 border-[#148c78]/30 border-t-[#148c78] rounded-full animate-spin" />
            កំពុងទាញយកទំនិញ...
          </div>
        )}
        {!productsLoading && filtered.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-12">
            ☕ មិនមានទំនិញក្នុងប្រភេទនេះទេ
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => onOpenProduct(p.id)}
              className="bg-white rounded-2xl overflow-hidden card-shadow text-left flex flex-col"
            >
              <div className="relative aspect-square">
                <img src={p.image} alt={p.nameKh} className="w-full h-full object-cover" />
                {p.tag && (
                  <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                    {p.tag}
                  </span>
                )}
              </div>
              <div className="p-3">
                <div className="text-sm font-medium text-gray-800 line-clamp-1">{p.nameKh}</div>
                <div className="text-[#148c78] font-bold mt-1">{formatPrice(p.price)}</div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            const el = document.querySelector(".no-scrollbar") as HTMLElement | null;
            el?.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed md:absolute bottom-6 right-6 w-10 h-10 rounded-full bg-[#148c78]/80 text-white flex items-center justify-center shadow-lg"
        >
          <IconArrowUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
