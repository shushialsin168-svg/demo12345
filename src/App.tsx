import { useState } from "react";
import { CartProvider, useCart } from "./store";
import { MobileFrame } from "./components/Layout";
import Home from "./screens/Home";
import Shop from "./screens/Shop";
import Product from "./screens/Product";
import Cart from "./screens/Cart";
import Checkout from "./screens/Checkout";
import CustomerInfo from "./screens/CustomerInfo";
import ThankYou from "./screens/ThankYou";
import Login from "./screens/Login";
import Admin from "./screens/Admin";
import type { OrderPayload } from "./telegram";
import { saveOrder } from "./db";

type Screen =
  | { name: "home" }
  | { name: "shop" }
  | { name: "product"; id: string }
  | { name: "cart" }
  | { name: "checkout" }
  | { name: "customer" }
  | { name: "admin" }
  | { name: "thanks"; order: OrderPayload };

function generateInvoice() {
  return "E" + Math.floor(100000 + Math.random() * 900000).toString();
}

function AppInner() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [, setHistory] = useState<Screen[]>([]);
  const { cart, totalPrice, customerName, customerPhone, clearCart, addPoints, tgUser, isLoggedIn, login } = useCart();

  const nav = (s: Screen) => {
    setHistory((h) => [...h, screen]);
    setScreen(s);
  };
  const back = () => {
    setHistory((h) => {
      if (h.length === 0) {
        setScreen({ name: "home" });
        return h;
      }
      const prev = h[h.length - 1];
      setScreen(prev);
      return h.slice(0, -1);
    });
  };

  // Gate: require login before showing anything else.
  if (!isLoggedIn) {
    return (
      <MobileFrame>
        <Login
          defaultName={customerName}
          onSuccess={(data) => login(data)}
        />
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      {screen.name === "home" && (
        <Home
          onNavigate={(s) => nav({ name: s })}
          onOpenProduct={(id) => nav({ name: "product", id })}
        />
      )}
      {screen.name === "shop" && (
        <Shop
          onBack={back}
          onOpenProduct={(id) => nav({ name: "product", id })}
          onOpenCart={() => nav({ name: "cart" })}
        />
      )}
      {screen.name === "product" && (
        <Product
          productId={screen.id}
          onBack={back}
          onAdded={() => nav({ name: "cart" })}
        />
      )}
      {screen.name === "cart" && (
        <Cart
          onBack={back}
          onCheckout={() => nav({ name: "checkout" })}
        />
      )}
      {screen.name === "checkout" && (
        <Checkout
          onBack={back}
          onSubmit={({ method, note, location, distance }) => {
            const order: OrderPayload = {
              invoice: generateInvoice(),
              customerName,
              customerPhone,
              method,
              items: cart,
              total: totalPrice,
              note,
              createdAt: new Date(),
              tgUser,
              deliveryLocation: location,
              distanceMeters: distance,
            };
            addPoints(1);
            // Fire-and-forget: persist order to Neon Postgres.
            saveOrder({
              invoice: order.invoice,
              userPhone: order.customerPhone,
              userName: order.customerName,
              method: order.method,
              total: order.total,
              items: order.items.map((it) => ({
                id: it.product.id,
                name: it.product.nameKh,
                qty: it.qty,
                unitPrice: it.product.price + it.optionsPrice,
                options: it.options,
              })),
              note: order.note,
              deliveryLat: order.deliveryLocation?.latitude ?? null,
              deliveryLng: order.deliveryLocation?.longitude ?? null,
              distanceM: order.distanceMeters ?? null,
            });
            // NOTE: don't clear cart yet — ThankYou needs items to render the
            // receipt. We snapshotted them into `order` already, but keeping
            // the cart until user leaves the thank-you page is safer.
            setScreen({ name: "thanks", order });
          }}
          onEditProfile={() => nav({ name: "customer" })}
        />
      )}
      {screen.name === "customer" && <CustomerInfo onDone={back} />}
      {screen.name === "admin" && <Admin onBack={back} />}
      {screen.name === "thanks" && (
        <ThankYou
          order={screen.order}
          onHome={() => {
            clearCart();
            setHistory([]);
            setScreen({ name: "home" });
          }}
        />
      )}
    </MobileFrame>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppInner />
    </CartProvider>
  );
}
