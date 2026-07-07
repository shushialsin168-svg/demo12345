import { useState } from "react";
import { optionGroups, formatPrice } from "../data";
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

  const toggle = (groupIdx: number, id: string, multi: boolean) => {
    setSelected((prev) => {
      const key = String(groupIdx);
      const cur = prev[key] ?? [];
      if (multi) {
        return {
          ...prev,
          [key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
        };
      }
      return { ...prev, [key]: [id] };
    });
  };

  const optionsPrice = Object.entries(selected).reduce((sum, [k, ids]) => {
    const group = optionGroups[Number(k)];
    return sum + ids.reduce((s, id) => s + (group.options.find((o) => o.id === id)?.price ?? 0), 0);
  }, 0);

  const totalPrice = (product.price + optionsPrice) * qty;

  const handleAdd = () => {
    const labels: string[] = [];
    Object.entries(selected).forEach(([k, ids]) => {
      const g = optionGroups[Number(k)];
      ids.forEach((id) => {
        const opt = g.options.find((o) => o.id === id);
        if (opt) labels.push(opt.label);
      });
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
        <div className="absolute left-4 bottom-4 flex flex-col gap-2 text-white/90">
          <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs">🔍</div>
          <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs">↻</div>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-28">
        <div className="flex items-center gap-3">
          <h2 className="flex-1 text-lg font-bold text-gray-800">{product.nameKh}</h2>
          <div className="flex items-center gap-2 border border-gray-200 rounded-full px-1 py-0.5">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600"
            >
              −
            </button>
            <span className="w-6 text-center font-medium">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="w-8 h-8 rounded-full border border-[#148c78] text-[#148c78] flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Option groups */}
        {optionGroups.map((g, i) => (
          <div key={i} className="mt-4">
            <div className="text-sm font-semibold text-gray-800">{g.title}</div>
            <div className="mt-2 divide-y divide-gray-100">
              {g.options.map((o) => {
                const checked = (selected[String(i)] ?? []).includes(o.id);
                return (
                  <label key={o.id} className="flex items-center py-2 cursor-pointer">
                    <span
                      className={`w-4 h-4 mr-3 rounded border ${
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
                      onClick={() => toggle(i, o.id, g.multi)}
                      className="flex-1 flex items-center justify-between text-sm text-gray-700"
                    >
                      <span>{o.label}</span>
                      <span className="text-gray-500">{formatPrice(o.price)}</span>
                    </button>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {/* note */}
        <div className="mt-4">
          <input
            placeholder="ចំណាំ"
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#148c78]"
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
            className="bg-[#148c78] text-white rounded-full px-5 py-2.5 text-sm font-medium flex items-center gap-2"
          >
            <IconCart className="w-4 h-4" />
            បន្ថែមចូលកន្ត្រក
          </button>
        </div>
      </div>
    </div>
  );
}
