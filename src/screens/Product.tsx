import { useState } from "react";
import { optionGroups, formatPrice, getAvailableOptionGroups } from "../data";
import { useCart } from "../store";
import { IconArrowLeft, IconCart } from "../components/Icons";

export default function Product({
  productId,
  onBack,
  onAdded,
}: {
  productId: string;
  onBack: () => void;
  onAdded: () => void;
}) {
  const { addToCart, products } = useCart();
  const product = products.find((p) => p.id === productId) ?? products[0];
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<Record<string, string[]>>({});

  if (!product) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center gap-3">
        <div className="text-4xl">☕</div>
        <div className="text-sm text-gray-500">ទំនិញនេះមិនមានទៀតទេ</div>
        <button
          onClick={onBack}
          className="bg-[#148c78] text-white rounded-full px-6 py-2 text-sm"
        >
          ត្រឡប់ក្រោយ
        </button>
      </div>
    );
  }

  // Check if this product is out of stock
  const isOutOfStock = product.tag === "Out of Stock";

  // Get active option groups for this specific category
  const activeOptionGroups = getAvailableOptionGroups(product.categoryId);

  const toggle = (groupTitle: string, id: string, multi: boolean) => {
    if (isOutOfStock) return; // Prevent selection if out of stock
    setSelected((prev) => {
      const cur = prev[groupTitle] ?? [];
      if (multi) {
        return {
          ...prev,
          [groupTitle]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
        };
      }
      return { ...prev, [groupTitle]: [id] };
    });
  };

  // Calculate prices using the group's title key
  const optionsPrice = Object.entries(selected).reduce((sum, [groupTitle, ids]) => {
    const group = optionGroups.find((g) => g.title === groupTitle);
    if (!group) return sum;
    return sum + ids.reduce((s, id) => s + (group.options.find((o) => o.id === id)?.price ?? 0), 0);
  }, 0);

  const totalPrice = (product.price + optionsPrice) * qty;

  const handleAdd = () => {
    if (isOutOfStock) return; // Protection fallback check

    const labels: string[] = [];
    Object.entries(selected).forEach(([groupTitle, ids]) => {
      const g = optionGroups.find((group) => group.title === groupTitle);
      if (g) {
        ids.forEach((id) => {
          const opt = g.options.find((o) => o.id === id);
          if (opt) labels.push(opt.label);
        });
      }
    });
    const key = `${product.id}-${labels.join("|")}`;
    addToCart({
      key,
      product,
      qty,
      options: labels,
      optionsPrice,
    });
    onAdded();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Image */}
      <div className="relative">
        <img src={product.image} alt={product.nameKh} className="w-full h-72 object-cover" />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-700 shadow"
        >
          <IconArrowLeft className="w-5 h-5" />
        </button>
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
              អស់ស្តុក / Out of Stock
            </span>
          </div>
        )}
        <div className="absolute left-4 bottom-4 flex flex-col gap-2 text-white/90">
          <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs">🔍</div>
          <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs">↻</div>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-28">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-800 truncate">{product.nameKh}</h2>
            {isOutOfStock && (
              <span className="inline-block mt-0.5 text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded">
                មិនអាចកុម្ម៉ង់បានទេ
              </span>
            )}
          </div>
          <div className={`flex items-center gap-2 border border-gray-200 rounded-full px-1 py-0.5 ${isOutOfStock ? "opacity-40 pointer-events-none" : ""}`}>
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={isOutOfStock}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600"
            >
              −
            </button>
            <span className="w-6 text-center font-medium">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              disabled={isOutOfStock}
              className="w-8 h-8 rounded-full border border-[#148c78] text-[#148c78] flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Option groups — Displays only if allowed for this category */}
        {activeOptionGroups.map((g) => (
          <div key={g.title} className={`mt-4 ${isOutOfStock ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="text-sm font-semibold text-gray-800">{g.title}</div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
              {g.options.map((o) => {
                const checked = (selected[g.title] ?? []).includes(o.id);
                return (
                  <label
                    key={o.id}
                    className="flex items-center py-1.5 cursor-pointer border-b border-gray-50 min-w-0"
                  >
                    <span
                      className={`w-4 h-4 mr-2 flex-shrink-0 rounded border ${
                        checked ? "bg-[#148c78] border-[#148c78]" : "border-gray-300"
                      } flex items-center justify-center`}
                    >
                      {checked && (
                        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white" stroke="currentColor" strokeWidth="3">
                          <path d="m5 12 5 5L20 7" />
                        </svg>
                      )}
                    </span>
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => toggle(g.title, o.id, g.multi)}
                      className="flex-1 min-w-0 flex items-center justify-between gap-1 text-[13px] text-gray-700"
                    >
                      <span className="truncate text-left">{o.label}</span>
                      <span className="text-gray-500 text-[11px] whitespace-nowrap flex-shrink-0">
                        {formatPrice(o.price)}
                      </span>
                    </button>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {/* Note */}
        <div className="mt-4">
          <input
            placeholder="ចំណាំ"
            disabled={isOutOfStock}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#148c78] disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute left-0 right-0 bottom-0 p-3 bg-white border-t border-gray-100">
        <div className="bg-black rounded-full flex items-center justify-between p-1 pl-4">
          <div className="text-white">
            <div className="text-[10px] opacity-70">តម្លៃ</div>
            <div className="text-sm font-bold">{formatPrice(totalPrice)}</div>
          </div>
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`rounded-full px-5 py-2.5 text-sm font-medium flex items-center gap-2 text-white transition-all ${
              isOutOfStock 
                ? "bg-gray-600 cursor-not-allowed opacity-50" 
                : "bg-[#148c78] active:opacity-90"
            }`}
          >
            <IconCart className="w-4 h-4" />
            {isOutOfStock ? "ដាច់ស្តុក" : "បន្ថែមចូលកន្ត្រក"}
          </button>
        </div>
        
        <footer className="px-4 pb-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white border border-gray-200/60 rounded-full shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</span>
            <span className="text-[9px] text-gray-300">|</span>
            <span className="text-[10px] font-medium text-gray-500">
              Power by: <span className="font-extrabold text-[#148c78] tracking-wide">B4D DEV</span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
