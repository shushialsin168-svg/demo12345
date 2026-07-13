import { useState } from "react";
import { useCart } from "../store";
import { categories, formatPrice } from "../data";
import {
  IconArrowRight,
  IconCart,
  IconChevronDown,
  IconClock,
  IconGift,
  IconHome,
} from "../components/Icons";
import ShopPopup from "../components/ShopPopup";
import PriceTablePopup from "../components/PriceTablePopup";
import BrandLogo from "../components/BrandLogo";
import brandImage from "../assets/IMG_7403.PNG";
import brandImage1 from "../assets/IMG_7401.PNG";
import heroImage from "../assets/coffee-mocha.jpg";

export default function Home({
  onNavigate,
  onOpenProduct,
}: {
  onNavigate: (s: "shop" | "cart" | "admin") => void;
  onOpenProduct: (id: string) => void;
}) {
  const { customerName, points, totalItems, tgUser, isFromTelegram, logout, products, productsLoading } = useCart();
  const [showShopPopup, setShowShopPopup] = useState(false);
  const [showPriceTable, setShowPriceTable] = useState(false);
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="flex flex-col h-full">
      {showShopPopup && <ShopPopup onClose={() => setShowShopPopup(false)} />}
      {showPriceTable && <PriceTablePopup onClose={() => setShowPriceTable(false)} />}
      {/* Hero banner */}
      <div
        className="relative hero-brush overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* top bar: logo left, socials right */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          {/* Brand logo — top left (opens shop info & distance popup) */}
          {/* <button onClick={() => setShowShopPopup(true)} className="flex-shrink-0">
            <BrandLogo size={100} />
          </button> */}
          <div className="flex-1" />
          {/* Facebook Link */}
            <a 
              href="https://www.facebook.com/NoukThom26CoffeenDrinks" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Facebook_f_logo_%282021%29.svg/960px-Facebook_f_logo_%282021%29.svg.png" 
                alt="Facebook" 
                className="w-full h-full object-cover" 
              />
            </a>

            {/* TikTok Link */}
            <a 
              href="https://www.tiktok.com/@nt26genzcoffe?is_from_webapp=1&sender_device=pc" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEohsl44VcIOTFLazDoGPTpIgzSnvEbFIGoGwP2UhsBYTz5By1go4Fj5k&s=10" 
                alt="TikTok" 
                className="w-full h-full object-cover" 
              />
            </a>

            {/* Telegram Link */}
            <a 
              href="https://t.me/NT26_Cafe" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/960px-Telegram_logo.svg.png?_=20220101141644" 
                alt="Telegram" 
                className="w-full h-full object-cover" 
              />
            </a>

            {/* Settings Button */}
            <button
              onClick={() => onNavigate("admin")}
              title="Admin"
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <img 
                src="https://img.magnific.com/free-psd/3d-settings-icon_84443-55889.jpg?semt=ais_hybrid&w=740&q=80" 
                alt="Settings" 
                className="w-full h-full object-cover" 
              />
          </button>
        </div>
        <div className="absolute left-4 top-4 z-30">
          <img
            src={brandImage}
            alt="Brand"
            className="w-25 h-25 rounded-full object-cover shadow-2xl"
          />
        </div>
        {/* Hero area: faded cup illustrations + big brand title */}
        <div className="relative h-56 flex items-center justify-center">
          {/* faded cup illustration */}
          {/* <div className="absolute left-6 top-6 opacity-40">
            <svg width="80" height="120" viewBox="0 0 80 120" fill="none" stroke="#fff8dc" strokeWidth="2">
              <path d="M15 30h50l-6 80H21z" />
              <path d="M20 40h40" />
            </svg>
          </div> */}
          {/* faded coffee bag */}
          {/* <div className="absolute left-24 top-16 opacity-40">
            <svg width="60" height="80" viewBox="0 0 60 80" fill="none" stroke="#fff8dc" strokeWidth="2">
              <rect x="10" y="10" width="40" height="60" rx="2" />
              <text x="30" y="45" textAnchor="middle" fill="#fff8dc" fontSize="8">coffee</text>
            </svg>
          </div> */}
          {/* khmer text */}
          <div className="absolute inset-0 flex items-start justify-end pt-8 pointer-events-none">
            <div className="flex flex-col items-center text-center">
            {/* <div
              className="text-[#3D2314] text-5xl font-black leading-none tracking-wide"
              style={{ fontFamily: "Kantumruy Pro", textShadow: "0 2px 8px rgba(0,0,0,0.65)" }}
            >
              នុធំ26
            </div>
            <div
              className="text-[#3D2314] text-3xl mt-1 font-semibold"
              style={{ fontFamily: "Kantumruy Pro", textShadow: "0 2px 8px rgba(0,0,0,0.65)" }}
            >
              កាហ្វេ
            </div> */}
            </div>
          </div>
          {/* faded coffee cup icon */}
          {/* <div className="absolute right-6 top-4 opacity-40">
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none" stroke="#fff8dc" strokeWidth="2">
              <path d="M10 25c0-8 6-15 15-15s15 7 15 15" />
              <path d="M8 30h34l-4 12H12z" />
              <path d="M42 32c4 0 5 6 0 6" />
            </svg>
          </div> */}
        </div>

        {/* bottom contact bar */}
        <div className="absolute bottom-0 left-0 right-0 grid grid-cols-2 items-center pb-3 text-white text-xs w-full px-2">
  {/* Left side: Phone number with solid background pill */}
  <div className="flex justify-end pr-1.5 max-w-full">
  <div className="flex items-center gap-1.5 sm:gap-2 opacity-95 contact-float shadow-[0_4px_10px_rgba(0,0,0,0.22),0_8px_24px_rgba(0,0,0,0.16)] rounded-full pl-1 pr-3 py-1 bg-gray-500/50 border-2 border-[#148577] min-w-0 max-w-full">
    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB6INYnvxmk0WWLLzUhvu2pRekYTLq2gjBIDAoJsqlhFOa8GeIetYJKno&s=10"
        alt="Telegram Contact"
        className="w-6 h-6 object-cover contact-pulse"
      />
    </div>
    {/* Changed text-[#148577] back to text-white */}
    <span className="font-black text-white text-[16px] sm:text-sm whitespace-nowrap">
        +855 93 342 226    
    </span>
  </div>
</div>

  {/* Right side: Brand button */}
  <div className="flex justify-start pl-1.5 max-w-full">
    <button
      onClick={() => setShowPriceTable(true)}
      className="price-btn float-anim bg-white rounded-full pl-1 pr-2 py-1 flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-sm font-semibold text-gray-800 shadow-[0_4px_10px_rgba(0,0,0,0.22),0_8px_24px_rgba(0,0,0,0.16)] border-2 border-[#148c78] transform active:translate-y-1 active:shadow-[0_2px_6px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,0,0,0.12)] min-w-0 max-w-full"
    >
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0">
        <img src={brandImage1} alt="Brand" className="w-full h-full object-cover" />
      </div>
      <span className="truncate text-gray-800">នុធំ26 បោកគក់ សម្ងួតរហ័ស</span>
      <IconChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 chev-rotate" />
    </button>
  </div>
</div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 bg-[#f2f7f5]">
        {/* Profile card + gift card */}
        <div className="px-4 -mt-4 relative z-10 grid grid-cols-[1fr_130px] gap-3">
          <div className="bg-white rounded-2xl card-shadow p-3">
            <div className="flex items-center gap-3">
              {tgUser?.photo_url ? (
                <img
                  src={tgUser.photo_url}
                  alt={customerName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#148c78]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 via-yellow-300 to-yellow-500 flex items-center justify-center text-2xl border-2 border-amber-500 text-yellow-950 shadow-[0_10px_30px_rgba(255,200,0,0.25)]">
                  👩
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm text-gray-600 font-medium flex items-center gap-1">
                  សូមស្វាគមន៍ 🙏
                  {isFromTelegram && (
                    <span className="inline-flex items-center gap-0.5 bg-[#26A5E4]/10 text-[#26A5E4] text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
                        <path d="m21.5 4.5-19 8 6 2 2 6 4-4 5 4z" />
                      </svg>
                      Telegram
                    </span>
                  )}
                </div>
                <div className="text-[15px] font-bold text-[#148c78] tracking-wide truncate">
                  {customerName}
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm("ចេញពីគណនី?")) logout();
                }}
                title="Logout"
                className="text-gray-400 hover:text-red-500 p-1"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="m16 17 5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
              </button>
            </div>
            <div className="mt-3 relative bg-[#f2f7f5] rounded-full h-8 overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1/3 bg-[#148c78] rounded-full flex items-center justify-end pr-3 text-white text-xs font-medium">
                ៛ {(0).toLocaleString()}
              </div>
              <div className="absolute inset-0 flex items-center justify-start pl-3 text-xs text-gray-600 font-medium">
                ​
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl card-shadow p-3 flex flex-col items-center justify-center">
            <IconGift className="w-9 h-9 text-[#148c78]" />
            <div className="mt-2 text-sm font-semibold text-gray-700">
              {points} ពិន្ទុ
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="flex justify-end px-4 mt-2 opacity-40">
          <svg width="90" height="30" viewBox="0 0 90 30" fill="none" stroke="#148c78" strokeWidth="2">
            <path d="M2 15c5-8 10-8 15 0s10 8 15 0 10-8 15 0 10 8 15 0 10-8 15 0" />
            <path d="M2 22c5-8 10-8 15 0s10 8 15 0 10-8 15 0 10 8 15 0 10-8 15 0" opacity=".6" />
          </svg>
        </div>

        {/* Featured category */}
        <div className="px-4 mt-2 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">ប្រភេទមុខទំនិញ</h3>
          <button
            onClick={() => onNavigate("shop")}
            className="text-xs text-[#148c78] font-medium flex items-center gap-1"
          >
            មើលទាំងអស់ <IconArrowRight className="w-3 h-3" />
          </button>
        </div>

        {productsLoading ? (
          <div className="px-4 mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 py-8">
            <span className="w-4 h-4 border-2 border-[#148c78]/30 border-t-[#148c78] rounded-full animate-spin" />
            កំពុងទាញយកទំនិញ...
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="px-4 mt-4 text-center text-sm text-gray-400 py-8">
            ☕ មិនទាន់មានទំនិញនៅឡើយទេ
          </div>
        ) : (
          <div className="px-4 mt-2 grid grid-cols-3 gap-3">
            {featuredProducts.map((p) => {
              const cat = categories.find((c) => c.id === p.categoryId);
              return (
                <div key={p.id} className="flex flex-col items-center">
                  <div className="text-[11px] text-[#148c78] font-medium mb-1 line-clamp-1">
                    {cat?.nameKh ?? ""}
                  </div>
                  <button
                    onClick={() => onOpenProduct(p.id)}
                    className="relative w-full aspect-square rounded-2xl overflow-hidden card-shadow bg-white"
                  >
                    <img src={p.image} alt={p.nameKh} className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-[#148c78] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {formatPrice(p.price)}
                    </div>
                  </button>
                  <div className="mt-1.5 text-xs text-gray-700 text-center line-clamp-1">{p.nameKh}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* small padding */}
        <div className="h-8" />

        {/* ── PREMIUM CORE FOOTER COMPONENT ── */}
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

      {/* Bottom nav */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around px-6 py-3 bg-white/90 backdrop-blur-md border-t border-gray-100">
        <button className="w-12 h-12 rounded-full flex items-center justify-center text-[#148c78]">
          <IconHome className="w-6 h-6" />
        </button>
        <button
          onClick={() => onNavigate(totalItems > 0 ? "cart" : "shop")}
          className="w-14 h-14 -mt-6 rounded-full bg-black text-white flex items-center justify-center shadow-lg relative"
        >
          <IconCart className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </button>
        <button className="w-12 h-12 rounded-full flex items-center justify-center text-[#148c78]">
          <IconClock className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
