import { useCart } from "../store";
import { formatPrice, categories } from "../data";
import { StepBar } from "../components/Layout";
import { IconArrowLeft, IconEdit, IconExternal, IconTrash } from "../components/Icons";

export default function Cart({
  onBack,
  onCheckout,
}: {
  onBack: () => void;
  onCheckout: () => void;
}) {
  const { cart, updateQty, removeItem, clearCart, totalPrice } = useCart();

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
          ទំនិញដែលបានកុម្ម៉ង់
        </h1>
      </div>

      <StepBar step={2} />

      {/* Clear button */}
      {cart.length > 0 && (
        <div className="px-5 flex justify-end pt-2">
          <button
            onClick={clearCart}
            className="text-red-500 text-xs flex items-center gap-1"
          >
            <IconTrash className="w-4 h-4" />
            លុបទំនិញដែលបានកុម្ម៉ង់
          </button>
        </div>
      )}

      {/* Items */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-2 pb-32">
        {cart.length === 0 && (
          <div className="mt-16 text-center text-gray-500 text-sm">
            មិនមានទំនិញនៅក្នុងកន្ត្រកទេ
          </div>
        )}

        <div className="space-y-3">
          {cart.map((item) => {
            const cat = categories.find((c) => c.id === item.product.categoryId);
            return (
              <div
                key={item.key}
                className="bg-white rounded-2xl p-3 card-shadow flex gap-3 items-center"
              >
                <img
                  src={item.product.image}
                  alt={item.product.nameKh}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {item.product.nameKh}
                  </div>
                  <div className="text-[11px] text-gray-500">{cat?.nameKh}</div>
                  <div className="text-[#148c78] font-bold mt-1 text-sm">
                    {formatPrice(item.product.price + item.optionsPrice)}
                  </div>
                  {item.options.length > 0 && (
                    <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                      {item.options.join(" · ")}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQty(item.key, -1)}
                    className="w-7 h-7 rounded-full border border-gray-300 text-gray-500 flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.key, 1)}
                    className="w-7 h-7 rounded-full border border-[#148c78] text-[#148c78] flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.key)}
                  className="text-gray-400 ml-1"
                >
                  <IconTrash className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {cart.length > 0 && (
          <div className="mt-2 text-xs text-gray-600 flex items-center gap-1 px-1">
            ចំណាំ: <IconEdit className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="absolute left-0 right-0 bottom-0 p-3 bg-white/80 backdrop-blur border-t border-gray-100">
        <div className="bg-black rounded-full flex items-center justify-between p-1 pl-4">
          <div className="text-white">
            <div className="text-[10px] opacity-70">ប្រាក់សរុប</div>
            <div className="text-sm font-bold">{formatPrice(totalPrice)}</div>
          </div>
          <button
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="bg-teal-400 disabled:opacity-40 text-white rounded-full px-5 py-2.5 text-sm font-medium flex items-center gap-2"
          >
            ទូទាត់ប្រាក់
            <IconExternal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
