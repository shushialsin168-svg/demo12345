import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type Product } from "./data";
import { fetchProducts } from "./db";
import { initTelegram, tgUserDisplayName, type TgUser } from "./telegramWebApp";

export type CartItem = {
  key: string;
  product: Product;
  qty: number;
  options: string[]; // labels
  optionsPrice: number;
  note?: string;
};

type Ctx = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQty: (key: string, delta: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  customerName: string;
  setCustomerName: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
  points: number;
  addPoints: (n: number) => void;
  tgUser: TgUser | null;
  isFromTelegram: boolean;
  isLoggedIn: boolean;
  login: (data: { name: string; phone: string; location?: UserLocation | null }) => void;
  logout: () => void;
  userLocation: UserLocation | null;
  setUserLocation: (loc: UserLocation | null) => void;
  products: Product[];
  productsLoading: boolean;
  refreshProducts: () => Promise<void>;
};

export type UserLocation = {
  latitude: number;
  longitude: number;
  address?: string;
};

type StoredUser = { name: string; phone: string; location?: UserLocation | null };
function loadStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("nt26.user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.name === "string" && typeof parsed.phone === "string") {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  // Initialize name/phone from Telegram synchronously (before first paint).
  const initialTgUser = useMemo(() => initTelegram(), []);
  const stored = useMemo(() => loadStoredUser(), []);
  const [tgUser] = useState<TgUser | null>(initialTgUser);
  const [customerName, setCustomerName] = useState(
    stored?.name ||
      (initialTgUser ? tgUserDisplayName(initialTgUser).toUpperCase() : "USER")
  );
  const [customerPhone, setCustomerPhone] = useState(stored?.phone || "");
  const [points, setPoints] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!stored);
  const [userLocation, setUserLocationState] = useState<UserLocation | null>(
    stored?.location ?? null
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const refreshProducts = async () => {
    try {
      const dbProducts = await fetchProducts();
      const mapped: Product[] = dbProducts.map((p) => ({
        id: p.id,
        nameKh: p.name_kh,
        categoryId: p.category_id,
        price: p.price,
        image: p.image,
        tag: p.tag ?? undefined,
      }));
      // Only admin-uploaded products are shown.
      setProducts(mapped);
    } catch (e) {
      console.error("Failed to load products from DB", e);
    } finally {
      setProductsLoading(false);
    }
  };

  // Load DB products once on startup.
  useEffect(() => {
    refreshProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (partial: Partial<StoredUser>) => {
    try {
      const current = loadStoredUser() ?? { name: customerName, phone: customerPhone };
      localStorage.setItem("nt26.user", JSON.stringify({ ...current, ...partial }));
    } catch {
      /* ignore */
    }
  };

  const setUserLocation = (loc: UserLocation | null) => {
    setUserLocationState(loc);
    persist({ location: loc });
  };

  const login = (data: { name: string; phone: string; location?: UserLocation | null }) => {
    setCustomerName(data.name);
    setCustomerPhone(data.phone);
    if (data.location !== undefined) setUserLocationState(data.location);
    setIsLoggedIn(true);
  };
  const logout = () => {
    localStorage.removeItem("nt26.user");
    setIsLoggedIn(false);
    setCustomerPhone("");
    setUserLocationState(null);
  };

  // If Telegram becomes available slightly after mount (script race), pick it up.
  useEffect(() => {
    if (tgUser) return;
    const tryAttach = () => {
      const u = initTelegram();
      if (u) {
        setCustomerName(tgUserDisplayName(u).toUpperCase());
      }
    };
    // Try shortly after script loads.
    const t1 = setTimeout(tryAttach, 200);
    const t2 = setTimeout(tryAttach, 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [tgUser]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.key === item.key);
      if (existing) {
        return prev.map((p) => (p.key === item.key ? { ...p, qty: p.qty + item.qty } : p));
      }
      return [...prev, item];
    });
  };

  const updateQty = (key: string, delta: number) =>
    setCart((prev) =>
      prev
        .map((p) => (p.key === key ? { ...p, qty: Math.max(0, p.qty + delta) } : p))
        .filter((p) => p.qty > 0)
    );

  const removeItem = (key: string) => setCart((prev) => prev.filter((p) => p.key !== key));
  const clearCart = () => setCart([]);

  const { totalItems, totalPrice } = useMemo(() => {
    let items = 0;
    let price = 0;
    cart.forEach((c) => {
      items += c.qty;
      price += c.qty * (c.product.price + c.optionsPrice);
    });
    return { totalItems: items, totalPrice: price };
  }, [cart]);

  const addPoints = (n: number) => setPoints((p) => p + n);

  return (
    <CartCtx.Provider
      value={{
        cart,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        totalItems,
        totalPrice,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        points,
        addPoints,
        tgUser,
        isFromTelegram: !!tgUser,
        isLoggedIn,
        login,
        logout,
        userLocation,
        setUserLocation,
        products,
        productsLoading,
        refreshProducts,
      }}
    >
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};


