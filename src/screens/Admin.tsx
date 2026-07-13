import { useRef, useState } from "react";
import { categories, formatPrice } from "../data";
import { addProduct, deleteProduct, updateProduct } from "../db"; 
import { useCart } from "../store";
import { IconArrowLeft, IconCheck, IconEdit, IconTrash } from "../components/Icons";

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

  // Active Navigation Side-Bar View States
  const [activeTab, setActiveTab] = useState<"add-product" | "product-list" | "shop-status">("add-product");

  // Shop Close States (Loaded directly from localStorage)
  const [closedDates, setClosedDates] = useState<string[]>(() => {
    const saved = localStorage.getItem("shop_closed_dates");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCloseDate, setSelectedCloseDate] = useState("");

  // Product Form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("tea");
  const [image, setImage] = useState<string | null>(null);
  const [multiToppings, setMultiToppings] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
    setInStock(p.tag !== "Out of Stock");
    setMsg(null);
    setActiveTab("add-product"); // Redirect context view into input workspace layer
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
        text: wasEditing ? "បច្ចុប្បន្នភាពទិន្នន័យបានជោគជ័យ" : "រក្សាទុកទំនិញថ្មីដោយជោគជ័យ",
      });
      // Redirect dynamically into list right after operations complete
      setTimeout(() => setActiveTab("product-list"), 400);
    } catch (err: unknown) {
      console.error(err);
      const detail = err instanceof Error ? err.message : String(err ?? "unknown error");
      setMsg({ ok: false, text: `បរាជ័យ: ${detail.slice(0, 160)}` });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("តើអ្នកពិតជាចង់លុបទំនិញនេះមែនទេ?")) return;
    try {
      await deleteProduct(id);
      await refreshProducts();
      if (editingId === id) resetForm();
    } catch (e) {
      console.error(e);
      alert("ការលុបបរាជ័យ");
    }
  };

  const handleAddCloseDate = () => {
    if (!selectedCloseDate) return;
    if (closedDates.includes(selectedCloseDate)) {
      alert("កាលបរិច្ឆេទនេះមានរួចហើយ!");
      return;
    }
    const updated = [...closedDates, selectedCloseDate].sort();
    setClosedDates(updated);
    localStorage.setItem("shop_closed_dates", JSON.stringify(updated));
    setSelectedCloseDate("");
  };

  const handleRemoveCloseDate = (dateString: string) => {
    const updated = closedDates.filter((d) => d !== dateString);
    setClosedDates(updated);
    localStorage.setItem("shop_closed_dates", JSON.stringify(updated));
  };

  // ── SECURITY AUTHENTICATION SCREEN ──────────────────────────────────────────
  if (!authed) {
    return (
      <div className="flex flex-col h-full bg-slate-50 justify-between">
        <div className="flex items-center gap-3 px-6 pt-6">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-600 shadow-sm border border-slate-200/60 hover:bg-slate-50 transition-all active:scale-95"
          >
            <IconArrowLeft className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={tryLogin} className="flex-1 flex flex-col items-center justify-center px-8 -mt-12 max-w-sm mx-auto w-full">
          <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-600/10 mb-6">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">ប្រព័ន្ធគ្រប់គ្រងសុវត្ថិភាព</h2>
          <p className="mt-1 text-xs text-slate-400 text-center">សូមបញ្ចូលលេខកូដសម្ងាត់សហគ្រាស (Admin PIN)</p>
          
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••••••"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="mt-6 w-full text-center tracking-widest text-lg bg-white rounded-xl px-4 py-3 outline-none border border-slate-200 shadow-inner focus:border-teal-600 focus:ring-4 focus:ring-teal-50 transition-all"
            autoFocus
          />
          {pinErr && <div className="mt-2.5 text-xs font-semibold text-rose-600">⚠️ លេខកូដសម្ងាត់មិនត្រឹមត្រូវ សាកល្បងម្ដងទៀត</div>}
          
          <button type="submit" className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 text-xs font-bold tracking-wide shadow-sm transition-colors">
            ផ្ទៀងផ្ទាត់អត្តសញ្ញាណ
          </button>
        </form>
        <div className="py-6 text-center text-[10px] text-slate-400 font-medium tracking-wider uppercase">Enterprise Authentication Layer</div>
      </div>
    );
  }

  // ── CORE DASHBOARD SIDEBAR DESKTOP SYSTEM ────────────────────────────────────
  return (
    <div className="flex h-full bg-[#f8fafc] text-slate-800 antialiased overflow-hidden">
      
      {/* PROFESSIONAL DASHBOARD SIDEBAR */}
      <aside className="w-64 bg-[#0f172a] flex flex-col flex-shrink-0 border-r border-slate-800 hidden md:flex">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 font-bold">
            HQ
          </div>
          <div>
            <h1 className="text-xs font-bold text-slate-100 tracking-wider uppercase">Merchant Panel</h1>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wide">v2.4.0 Live System</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab("add-product")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-[11px] font-bold tracking-wide rounded-lg transition-all uppercase ${
              activeTab === "add-product"
                ? "bg-slate-800 text-teal-400 border border-slate-700/50 shadow-sm"
                : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>បញ្ចូលទំនិញថ្មី</span>
          </button>

          <button
            onClick={() => setActiveTab("product-list")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-[11px] font-bold tracking-wide rounded-lg transition-all uppercase ${
              activeTab === "product-list"
                ? "bg-slate-800 text-teal-400 border border-slate-700/50 shadow-sm"
                : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>បញ្ជីទំនិញរួមក្នុងប្រព័ន្ធ</span>
          </button>

          <button
            onClick={() => setActiveTab("shop-status")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-[11px] font-bold tracking-wide rounded-lg transition-all uppercase ${
              activeTab === "shop-status"
                ? "bg-slate-800 text-teal-400 border border-slate-700/50 shadow-sm"
                : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>ថ្ងៃឈប់សម្រាក</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-bold bg-slate-800 text-slate-400 rounded-lg border border-slate-700 hover:bg-slate-700/60 hover:text-slate-200 transition-all"
          >
            <IconArrowLeft className="w-3 h-3" />
            <span>ចាកចេញពីផ្ទាំង Admin</span>
          </button>
        </div>
      </aside>

      {/* CANVAS CENTRAL FLOW WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP META SYSTEM HEADER */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-200/60 hover:bg-slate-100 md:hidden"
            >
              <IconArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                {activeTab === "add-product" && "📥 បញ្ចូលទំនិញថ្មី និងកែប្រែ"}
                {activeTab === "product-list" && "📦 បញ្ជីទំនិញរួមក្នុងប្រព័ន្ធ"}
                {activeTab === "shop-status" && "🗓️ កំណត់ប្រតិទិនថ្ងៃឈប់សម្រាកហាង"}
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                {activeTab === "add-product" && "Product Catalog Onboarding Form"}
                {activeTab === "product-list" && "Global System Storage Matrix"}
                {activeTab === "shop-status" && "Store Operational Status Configuration"}
              </p>
            </div>
          </div>
          
          <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-lg hidden sm:block">
            Access Context: <span className="text-teal-700">System Admin</span>
          </div>
        </header>

        {/* ── PREMIUM MOBILE NAVIGATION SEGMENT BAR ── */}
        <div className="bg-[#0b1329] border-b border-slate-800/80 px-4 py-2 flex gap-1.5 md:hidden flex-shrink-0 overflow-x-auto no-scrollbar shadow-md">
          
          {/* TAB 1 */}
          <button
            onClick={() => setActiveTab("add-product")}
            className={`flex-1 min-w-[105px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold tracking-wide uppercase transition-all duration-300 ${
              activeTab === "add-product"
                ? "bg-gradient-to-r from-teal-500/10 to-emerald-500/10 text-teal-400 border border-teal-500/30 shadow-sm shadow-teal-500/5 scale-[1.02]"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${activeTab === "add-product" ? "scale-110 text-teal-400" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>បញ្ចូលទំនិញ</span>
          </button>

          {/* TAB 2 */}
          <button
            onClick={() => setActiveTab("product-list")}
            className={`flex-1 min-w-[105px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold tracking-wide uppercase transition-all duration-300 ${
              activeTab === "product-list"
                ? "bg-gradient-to-r from-teal-500/10 to-emerald-500/10 text-teal-400 border border-teal-500/30 shadow-sm shadow-teal-500/5 scale-[1.02]"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${activeTab === "product-list" ? "scale-110 text-teal-400" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>បញ្ជីទំនិញរួម</span>
          </button>

          {/* TAB 3 */}
          <button
            onClick={() => setActiveTab("shop-status")}
            className={`flex-1 min-w-[105px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold tracking-wide uppercase transition-all duration-300 ${
              activeTab === "shop-status"
                ? "bg-gradient-to-r from-teal-500/10 to-emerald-500/10 text-teal-400 border border-teal-500/30 shadow-sm shadow-teal-500/5 scale-[1.02]"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${activeTab === "shop-status" ? "scale-110 text-teal-400" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>ថ្ងៃឈប់សម្រាក</span>
          </button>
        </div>

        {/* INNER CONTAINER ROUTER SCROLL AREA */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* 1. VIEW SEGMENT: ADD / EDIT PRODUCT */}
            {activeTab === "add-product" && (
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                  <div className="text-slate-900 font-bold text-[11px] tracking-wider uppercase">
                    {editingId ? "✏️ កំពុងកែប្រែព័ត៌មានទំនិញ" : "📥 ព័ត៌មានទំនិញដែលត្រូវបញ្ចូល"}
                  </div>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setMsg(null);
                      }}
                      className="text-xs text-rose-600 hover:underline font-bold"
                    >
                      បោះបង់ការកែប្រែ
                    </button>
                  )}
                </div>

                {editingId && (
                  <div className="mb-5 text-xs bg-amber-50 text-amber-900 rounded-lg px-3 py-2 border border-amber-200/60 font-medium">
                    កូដទំនិញដែលកំពុងកែប្រែ: <span className="font-bold underline">{editingId}</span>
                  </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-700 font-bold block mb-1">ឈ្មោះទំនិញ (Khmer) *</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ឧ. កាហ្វេឡាតេទឹកដោះគោ"
                        className="w-full bg-slate-50/50 rounded-lg px-3.5 py-2.5 text-sm outline-none border border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-700 font-bold block mb-1">តម្លៃគិតជា៛ (Price) *</label>
                      <input
                        value={price}
                        onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="ឧ. 6000"
                        inputMode="numeric"
                        className="w-full bg-slate-50/50 rounded-lg px-3.5 py-2.5 text-sm outline-none border border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-700 font-bold block mb-1">ជម្រើសប្រភេទទំនិញ *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-slate-50/50 rounded-lg px-3 py-2.5 text-sm outline-none border border-slate-200 focus:bg-white focus:border-teal-600 transition-all"
                    >
                      {selectableCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.nameKh}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-700 font-bold block mb-1">ឯកសាររូបភាពទំនិញ *</label>
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
                        <div className="relative rounded-lg overflow-hidden border border-slate-200 group shadow-sm max-w-sm">
                          <img src={image} alt="preview" className="w-full h-40 object-cover" />
                          <div className="absolute inset-0 bg-slate-900/40 text-white text-[11px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            📸 ចុចលើនេះដើម្បីប្ដូររូបភាពថ្មី
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-28 rounded-lg bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100/50 transition-colors">
                          <span className="text-xl mb-1">📤</span>
                          <span className="text-xs font-semibold">សូមជ្រើសរើសឯកសាររូបភាពផលិតផល</span>
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3.5 space-y-2.5 border border-slate-200/60 shadow-inner">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={multiToppings}
                        disabled={!inStock} 
                        onChange={(e) => setMultiToppings(e.target.checked)}
                        className="accent-teal-600 w-4 h-4 rounded border-slate-300 disabled:opacity-40"
                      />
                      <span className={`text-xs font-semibold text-slate-600 ${!inStock ? "opacity-40" : ""}`}>អនុញ្ញាតឱ្យថែម Multiple Toppings</span>
                    </label>

                    <div className="border-t border-slate-200 my-1"></div>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                        className="accent-teal-600 w-4 h-4 rounded border-slate-300"
                      />
                      <span className="text-xs font-bold text-slate-800">ផលិតផលនេះមានក្នុងស្តុកលក់ (In Stock)</span>
                    </label>
                  </div>

                  {msg && (
                    <div className={`text-xs font-medium rounded-lg px-3.5 py-2.5 border ${
                      msg.ok ? "bg-emerald-50 text-emerald-900 border-emerald-200" : "bg-rose-50 text-rose-900 border-rose-200"
                    }`}>
                      {msg.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-slate-950 hover:bg-slate-800 disabled:opacity-60 text-white rounded-lg py-3 text-xs font-bold tracking-wide shadow-sm transition-colors uppercase flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <IconCheck className="w-3.5 h-3.5" />
                        <span>{editingId ? "រក្សាទុកការកែប្រែទិន្នន័យ" : "រក្សាទុកទំនិញចូលប្រព័ន្ធ"}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* 2. VIEW SEGMENT: GLOBAL PRODUCT CATALOG LIST */}
            {activeTab === "product-list" && (
              <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm p-5">
                <div className="text-slate-900 font-bold text-[11px] tracking-wider uppercase mb-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                  <span>បញ្ជីទំនិញរួមក្នុងប្រព័ន្ធទាំងអស់ ({dbProducts.length})</span>
                  <button 
                    onClick={() => setActiveTab("add-product")}
                    className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded font-bold"
                  >
                    + បន្ថែមទំនិញថ្មី
                  </button>
                </div>
                
                {dbProducts.length === 0 && (
                  <div className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg p-8 text-center">
                    មិនទាន់មានទិន្នន័យទំនិញត្រូវបានរក្សាទុកទេ។
                  </div>
                )}
                
                <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto pr-1">
                  {dbProducts.map((p) => {
                    const cat = categories.find((c) => c.id === p.categoryId);
                    const isOut = p.tag === "Out of Stock";

                    return (
                      <div key={p.id} className={`py-3.5 flex items-center gap-4 transition-all first:pt-0 last:pb-0 ${isOut ? "bg-slate-50/40 opacity-70" : ""}`}>
                        <div className="relative flex-shrink-0">
                          <img src={p.image} alt={p.nameKh} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                          {isOut && (
                            <div className="absolute inset-0 bg-slate-900/50 rounded-lg flex items-center justify-center text-[8px] text-white font-extrabold uppercase">
                              Out
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-800 truncate flex items-center gap-2">
                            <span>{p.nameKh}</span>
                            {isOut && (
                              <span className="text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded">
                                ដាច់ស្តុក
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
                            {cat?.nameKh} <span className="text-slate-300 mx-1">|</span> តម្លៃលក់: <span className="text-teal-700 font-bold">{formatPrice(p.price)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => startEdit(p.id)}
                            title="កែប្រែព័ត៌មាន"
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200 transition-colors"
                          >
                            <IconEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => remove(p.id)}
                            title="លុបចេញ"
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 flex items-center justify-center border border-slate-200 transition-colors"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. VIEW SEGMENT: OPERATION CLOSURES CALENDAR */}
            {activeTab === "shop-status" && (
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6">
                <div className="text-slate-900 font-bold text-[11px] tracking-wider uppercase mb-1.5">
                  កំណត់កាលវិភាគថ្ងៃឈប់សម្រាករបស់ហាង
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-5">
                  ប្រព័ន្ធស្វ័យប្រវត្តិនឹងបិទដំណើរការទទួលការបញ្ជាទិញ (Orders) ពីអតិថិជនទាំងអស់នៅរាល់ថ្ងៃកាលបរិច្ឆេទដែលបានកំណត់ខាងក្រោម។
                </p>

                <div className="flex gap-2 items-center mb-6">
                  <input
                    type="date"
                    value={selectedCloseDate}
                    onChange={(e) => setSelectedCloseDate(e.target.value)}
                    className="flex-1 bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-teal-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddCloseDate}
                    className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-3 rounded-lg text-xs font-bold tracking-wide shadow-sm transition-colors"
                  >
                    + បន្ថែមថ្ងៃសម្រាក
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="text-[11px] font-bold text-slate-600 mb-3 uppercase tracking-wider">
                    បញ្ជីថ្ងៃឈប់សម្រាកដែលបានកំណត់រួម ({closedDates.length})
                  </div>

                  {closedDates.length === 0 ? (
                    <div className="text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-lg p-6 text-center">
                      មិនទាន់មានកាលបរិច្ឆេទឈប់សម្រាកណាមួយនៅក្នុងប្រព័ន្ធនៅឡើយទេ។
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {closedDates.map((date) => (
                        <div key={date} className="bg-slate-50 border border-slate-200/60 rounded-lg px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-700">
                          <div className="flex items-center gap-2.5 font-bold text-slate-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block"></span> 
                            {new Date(date).toLocaleDateString("kh-KH", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          <button
                            onClick={() => handleRemoveCloseDate(date)}
                            className="text-slate-400 hover:text-rose-600 p-1 font-bold text-sm transition-colors"
                            title="លុបចោលវិញ"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div> 
              </div>
            )}

            {/* ── PREMIUM CORE FOOTER COMPONENT ── */}
            <footer className="pt-6 pb-2 text-center border-t border-slate-200/50">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 border border-slate-200/60 rounded-full shadow-inner">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrator</span>
                <span className="text-[9px] text-slate-300">|</span>
                <span className="text-[10px] font-medium text-slate-500">
                  Power by: <span className="font-extrabold text-teal-600 tracking-wide">B4D DEV</span>
                </span>
              </div>
            </footer>

          </div>
        </main>
      </div>
    </div>
  );
}
