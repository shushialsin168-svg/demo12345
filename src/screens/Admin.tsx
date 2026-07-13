import { useRef, useState } from "react";
import { categories, formatPrice } from "../data";
import { addProduct, deleteProduct, updateProduct } from "../db";
import { useCart } from "../store";
import { IconArrowLeft, IconCheck, IconEdit, IconTrash } from "../components/Icons";

// ⚠️ WARNING: Anyone viewing the network/source tab can see this string. 
// For real security, migrate this verification to a secure backend API.
const ADMIN_PIN = "wGO9Cn]Z68#J";

/** Compress an image file to a max-480px JPEG data URL. */
function fileToDataUrl(file: File, maxSize = 480, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function Admin({ onBack }: { onBack: () => void }) {
  const { products, refreshProducts } = useCart();
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("tea");
  const [image, setImage] = useState<string | null>(null);
  const [multiToppings, setMultiToppings] = useState(false);
  const [inStock, setInStock] = useState(true); // Manages available/unavailable inventory state
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const resetForm = () => {
    setName("");
    setPrice("");
    setCategoryId("tea");
    setImage(null);
    setMultiToppings(false);
    setInStock(true);
    setEditingId(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const startEdit = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setEditingId(p.id);
    setName(p.nameKh);
    setPrice(String(p.price));
    setCategoryId(p.categoryId);
    setImage(p.image);
    setMultiToppings(p.tag === "Multiple Toppings");
    setInStock(p.tag !== "Out of Stock"); // If marked out of stock, uncheck stock toggle
    setMsg(null);
    
    // Smoothly scroll the container back up to view the editing panel
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const dbProducts = products;
  const selectableCategories = categories.filter((c) => c.id !== "all");

  const tryLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAuthed(true);
      setPinErr(false);
    } else {
      setPinErr(true);
    }
  };

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setImage(dataUrl);
    } catch {
      setMsg({ ok: false, text: "មិនអាចអានរូបភាពបានទេ" });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const priceNum = Math.round(Number(price));
    if (name.trim().length < 2) {
      setMsg({ ok: false, text: "សូមបញ្ចូលឈ្មោះទំនិញ" });
      return;
    }
    if (!priceNum || priceNum <= 0) {
      setMsg({ ok: false, text: "សូមបញ្ចូលតម្លៃឲ្យបានត្រឹមត្រូវ" });
      return;
    }
    if (!image) {
      setMsg({ ok: false, text: "សូមជ្រើសរើសរូបភាពទំនិញ" });
      return;
    }
    setSaving(true);

    // Compute database standard flags from local states
    let computedTag: string | null = null;
    if (!inStock) {
      computedTag = "Out of Stock";
    } else if (multiToppings) {
      computedTag = "Multiple Toppings";
    }

    try {
      if (editingId) {
        await updateProduct({
          id: editingId,
          nameKh: name.trim(),
          categoryId,
          price: priceNum,
          image,
          tag: computedTag,
        });
      } else {
        await addProduct({
          id: `db-${Date.now()}`,
          nameKh: name.trim(),
          categoryId,
          price: priceNum,
          image,
          tag: computedTag,
        });
      }
      await refreshProducts();
      const wasEditing = !!editingId;
      resetForm();
      setMsg({
        ok: true,
        text: wasEditing ? "✅ បានកែប្រែទំនិញរួចរាល់" : "✅ បានបន្ថែមទំនិញរួចរាល់",
      });
    } catch (err: unknown) {
      console.error(err);
      const detail = err instanceof Error ? err.message : String(err ?? "unknown error");
      setMsg({
        ok: false,
        text: `ការរក្សាទុកបរាជ័យ។ សូមព្យាយាមម្តងទៀត។ (${detail.slice(0, 160)})`,
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("លុបទំនិញនេះ?")) return;
    try {
      await deleteProduct(id);
      await refreshProducts();
      if (editingId === id) resetForm();
    } catch (e) {
      console.error(e);
      alert("ការលុបបរាជ័យ");
    }
  };

  // ── PIN gate screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="flex flex-col h-full bg-[#e6f4ef]">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-gray-600"
          >
            <IconArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">🔐 Admin</h1>
        </div>
        <form onSubmit={tryLogin} className="flex-1 flex flex-col items-center justify-center px-8 -mt-16">
          <div className="w-16 h-16 rounded-full bg-[#148c78] text-white flex items-center justify-center text-3xl shadow-lg">
            🔐
          </div>
          <div className="mt-4 font-semibold text-gray-700">បញ្ចូលពាក្យសម្ងាត់ Admin</div>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••••••"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="mt-4 w-64 text-center tracking-widest text-lg bg-white rounded-xl px-4 py-3 outline-none border-2 border-transparent focus:border-[#148c78]"
            autoFocus
          />
          {pinErr && <div className="mt-2 text-xs text-red-500">ពាក្យសម្ងាត់មិនត្រឹមត្រូវ</div>}
          <button
            type="submit"
            className="mt-4 bg-[#148c78] text-white rounded-full px-8 py-2.5 text-sm font-semibold"
          >
            ចូល
          </button>
        </form>
      </div>
    );
  }

  // ── Admin Panel view ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[#f2f7f5]">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 bg-[#e6f4ef]">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-gray-600"
        >
          <IconArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 flex-1">🛠️ គ្រប់គ្រងទំនិញ</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-8">
        {/* Add / Edit Form panel */}
        <form ref={formRef} onSubmit={submit} className="bg-white rounded-2xl card-shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[#148c78] font-semibold text-sm">
              {editingId ? "✏️ កែប្រែទំនិញ" : "➕ បន្ថែមទំនិញថ្មី"}
            </div>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMsg(null);
                }}
                className="text-xs text-gray-500 underline"
              >
                បោះបង់ការកែប្រែ
              </button>
            )}
          </div>
          {editingId && (
            <div className="mb-3 text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">
              កំពុងកែប្រែ: <span className="font-semibold">{name || editingId}</span>
            </div>
          )}

          <label className="text-xs text-gray-600 font-medium">ឈ្មោះទំនិញ *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ឧ. កាហ្វេឡាតេទឹកដោះគោ"
            className="mt-1 mb-3 w-full bg-[#f2f7f5] rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[#148c78]"
          />

          <label className="text-xs text-gray-600 font-medium">តម្លៃ (៛) *</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="ឧ. 6000"
            inputMode="numeric"
            className="mt-1 mb-3 w-full bg-[#f2f7f5] rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[#148c78]"
          />

          <label className="text-xs text-gray-600 font-medium">ប្រភេទទំនិញ *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 mb-3 w-full bg-[#f2f7f5] rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[#148c78]"
          >
            {selectableCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameKh}
              </option>
            ))}
          </select>

          <label className="text-xs text-gray-600 font-medium">រូបភាពទំនិញ *</label>
          <div className="mt-1 mb-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPickImage}
              className="hidden"
              id="admin-image-input"
            />
            <label htmlFor="admin-image-input" className="block cursor-pointer">
              {image ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-[#148c78]/40">
                  <img src={image} alt="preview" className="w-full h-40 object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[11px] text-center py-1">
                    ចុចដើម្បីផ្លាស់ប្ដូររូបភាព
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 rounded-xl bg-[#f2f7f5] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 text-sm">
                  <span className="text-3xl">🖼️</span>
                  ចុចដើម្បីជ្រើសរើសរូបភាព
                </div>
              )}
            </label>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={multiToppings}
                disabled={!inStock} 
                onChange={(e) => setMultiToppings(e.target.checked)}
                className="accent-[#148c78] w-4 h-4 disabled:opacity-50"
              />
              <span className={`text-xs text-gray-600 ${!inStock ? "opacity-50" : ""}`}>Multiple Toppings</span>
            </label>

            {/* Inventory Status Switcher */}
            <label className="flex items-center gap-2 cursor-pointer border-t pt-2 mt-1">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="accent-[#148c78] w-4 h-4"
              />
              <span className="text-xs font-medium text-gray-700">
                មានក្នុងស្តុក (In Stock)
              </span>
            </label>
          </div>

          {msg && (
            <div
              className={`mb-3 text-xs rounded-lg px-3 py-2 ${
                msg.ok
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-600 border border-red-100"
              }`}
            >
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#148c78] disabled:opacity-60 text-white rounded-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                កំពុងរក្សាទុក...
              </>
            ) : (
              <>
                <IconCheck className="w-4 h-4" />
                {editingId ? "រក្សាទុកការកែប្រែ" : "រក្សាទុកទំនិញ"}
              </>
            )}
          </button>
        </form>

        {/* Existing Products List Grid */}
        <div className="mt-5">
          <div className="text-[#148c78] font-semibold text-sm mb-2">
            📦 ទំនិញដែលបានបន្ថែម ({dbProducts.length})
          </div>
          {dbProducts.length === 0 && (
            <div className="text-xs text-gray-400 bg-white rounded-xl p-4 text-center">
              មិនទាន់មានទំនិញដែលបានបន្ថែមទេ
            </div>
          )}
          <div className="space-y-2">
            {dbProducts.map((p) => {
              const cat = categories.find((c) => c.id === p.categoryId);
              const isOut = p.tag === "Out of Stock";

              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-xl p-2.5 flex items-center gap-3 card-shadow relative ${
                    isOut ? "opacity-75 bg-gray-50/50" : ""
                  }`}
                >
                  <div className="relative">
                    <img
                      src={p.image}
                      alt={p.nameKh}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    {isOut && (
                      <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center text-[9px] text-white font-bold tracking-tight">
                        ដាច់ស្តុក
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate flex items-center gap-1.5">
                      {p.nameKh}
                      {isOut && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-normal">
                          អស់ស្តុក
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {cat?.nameKh} · {formatPrice(p.price)}
                    </div>
                  </div>
                  <button
                    onClick={() => startEdit(p.id)}
                    title="កែប្រែ"
                    className="w-8 h-8 rounded-full bg-[#148c78]/10 text-[#148c78] flex items-center justify-center z-10"
                  >
                    <IconEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    title="លុប"
                    className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center z-10"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
