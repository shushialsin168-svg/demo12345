import { forwardRef } from "react";
import type { CartItem } from "../store";
import { formatPrice } from "../data";

export type ReceiptProps = {
  invoice: string;
  customerName: string;
  customerPhone: string;
  method: "pickup" | "delivery";
  items: CartItem[];
  total: number;
  createdAt: Date;
  deliveryFee?: number;
};

/**
 * Thermal-printer style receipt. Designed to be readable both on-screen and
 * when captured via html-to-image for sending to Telegram.
 */
const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(function Receipt(
  { invoice, customerName, customerPhone, method, items, total, createdAt, deliveryFee = 0 },
  ref
) {
  const dateStr = createdAt.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const subtotal = items.reduce(
    (s, it) => s + it.qty * (it.product.price + it.optionsPrice),
    0
  );

  return (
    <div
      ref={ref}
      className="bg-white text-black mx-auto"
      style={{
        width: 360,
        padding: 20,
        fontFamily: '"Kantumruy Pro", "Courier New", monospace',
        fontSize: 12,
        lineHeight: 1.5,
        color: "#111",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>
          NT26 COFFEE
        </div>
        <div style={{ fontSize: 11, color: "#444" }}>
          ផ្លូវបេតុងថ្មី(ព្រែកបារាំង) ចម្ងាយ 300ម៉ែត្រពីកាវ៉ាស់សាំង Total និរោធ ឆ្ពោះទៅស្តុបផ្លូវព្រែកប្រា
        </div>
        <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>
          Tel: +855 93 342 226
        </div>
      </div>

      <Divider />

      {/* Invoice meta */}
      <Row label="Invoice" value={invoice} bold />
      <Row label="Date" value={dateStr} />
      <Row
        label="Type"
        value={method === "pickup" ? "Pickup at store" : "Delivery"}
      />
      <Row label="Customer" value={customerName} />
      <Row label="Phone" value={customerPhone || "-"} />

      <Divider />

      {/* Column header */}
      <div style={{ display: "flex", fontWeight: 700, fontSize: 11 }}>
        <div style={{ flex: 2 }}>Item</div>
        <div style={{ width: 30, textAlign: "center" }}>Qty</div>
        <div style={{ width: 80, textAlign: "right" }}>Amount</div>
      </div>

      <Divider dashed />

      {/* Items */}
      {items.map((it, i) => {
        const unit = it.product.price + it.optionsPrice;
        const amt = unit * it.qty;
        return (
          <div key={i} style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <div style={{ flex: 2, paddingRight: 4 }}>
                <div style={{ fontWeight: 600 }}>{it.product.nameKh}</div>
                <div style={{ fontSize: 10, color: "#555" }}>
                  @ {formatPrice(unit)}
                </div>
                {it.options.length > 0 && (
                  <div style={{ fontSize: 10, color: "#666" }}>
                    • {it.options.join(", ")}
                  </div>
                )}
              </div>
              <div style={{ width: 30, textAlign: "center" }}>{it.qty}</div>
              <div style={{ width: 80, textAlign: "right", fontWeight: 600 }}>
                {formatPrice(amt)}
              </div>
            </div>
          </div>
        );
      })}

      <Divider dashed />

      <Row label="Subtotal" value={formatPrice(subtotal)} />
      {deliveryFee > 0 && (
        <Row label="Delivery fee" value={formatPrice(deliveryFee)} />
      )}
      <Row label="Discount" value="៛ 0" />

      <Divider />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: 800,
          fontSize: 14,
        }}
      >
        <span>TOTAL</span>
        <span>{formatPrice(total)}</span>
      </div>

      <Divider />

      {/* Barcode-ish */}
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <Barcode text={invoice} />
        <div style={{ fontSize: 10, letterSpacing: 4, marginTop: 2 }}>
          {invoice}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 12, fontSize: 11 }}>
        🙏 សូមអរគុណសម្រាប់ការទិញ 🙏
        <div style={{ color: "#666", marginTop: 2 }}>
          Thank you for your order!
        </div>
      </div>
    </div>
  );
});

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontWeight: bold ? 700 : 400,
      }}
    >
      <span style={{ color: "#555" }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Divider({ dashed }: { dashed?: boolean }) {
  return (
    <div
      style={{
        borderTop: `1px ${dashed ? "dashed" : "solid"} #333`,
        margin: "8px 0",
      }}
    />
  );
}

/** Very lightweight fake barcode made of bars for visual effect. */
function Barcode({ text }: { text: string }) {
  const bars: number[] = [];
  for (let i = 0; i < text.length; i++) {
    bars.push((text.charCodeAt(i) % 3) + 1);
    bars.push(1);
  }
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 1, height: 32 }}>
      {bars.map((w, i) => (
        <div
          key={i}
          style={{
            width: w,
            background: i % 2 === 0 ? "#111" : "transparent",
            height: "100%",
          }}
        />
      ))}
    </div>
  );
}

export default Receipt;
