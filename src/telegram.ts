import type { CartItem } from "./store";
import { formatPrice } from "./data";
import type { TgUser, TgLocation } from "./telegramWebApp";

// NOTE: In production, secrets like a bot token should NEVER be shipped in a
// client bundle. This is here per the user's request for a demo/prototype.
const TELEGRAM_BOT_TOKEN = "8822852010:AAFf3tOSupVet3t2zW8qlQCLiQmQoV9XxH0";
const TELEGRAM_CHANNEL = "@sokphengnetcafe";

export type OrderPayload = {
  invoice: string;
  customerName: string;
  customerPhone: string;
  method: "pickup" | "delivery";
  items: CartItem[];
  total: number;
  note?: string;
  createdAt: Date;
  tgUser?: TgUser | null;
  deliveryLocation?: (TgLocation & { address?: string }) | null;
  distanceMeters?: number | null;
};

function buildMessage(o: OrderPayload): string {
  const linesArr: string[] = [];
  linesArr.push("🧾 *NEW ORDER — NT26 Coffee*");
  linesArr.push("");
  linesArr.push(`🧾 Invoice: \`${o.invoice}\``);
  linesArr.push(`🕒 ${o.createdAt.toLocaleString()}`);
  linesArr.push(`🚚 Method: ${o.method === "pickup" ? "Pickup at store" : "Delivery"}`);
  linesArr.push("");
  linesArr.push("*👤 Customer*");
  linesArr.push(`Name: ${o.customerName}`);
  linesArr.push(`Phone: ${o.customerPhone || "-"}`);
  if (o.tgUser) {
    const handle = o.tgUser.username ? `@${o.tgUser.username}` : `id ${o.tgUser.id}`;
    linesArr.push(`Telegram: ${handle}`);
  }
  if (o.method === "delivery") {
    if (o.deliveryLocation) {
      const { latitude, longitude, address } = o.deliveryLocation;
      const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      linesArr.push("");
      linesArr.push("*📍 Delivery Location*");
      linesArr.push(`Lat/Lng: \`${latitude.toFixed(6)}, ${longitude.toFixed(6)}\``);
      if (address) linesArr.push(`Address: ${address}`);
      if (typeof o.distanceMeters === "number") {
        const km = (o.distanceMeters / 1000).toFixed(2);
        linesArr.push(`Distance from shop: ${km} km`);
      }
      linesArr.push(`[Open in Google Maps](${mapsUrl})`);
    } else {
      linesArr.push("");
      linesArr.push("*📍 Delivery Location:* ⚠️ not shared");
    }
  }
  linesArr.push("");
  linesArr.push("*🛒 Items*");
  o.items.forEach((it, i) => {
    const unit = it.product.price + it.optionsPrice;
    linesArr.push(`${i + 1}. ${it.product.nameKh} × ${it.qty} — ${formatPrice(unit * it.qty)}`);
    if (it.options.length) linesArr.push(`   • ${it.options.join(", ")}`);
  });
  linesArr.push("");
  linesArr.push(`*💰 Total: ${formatPrice(o.total)}*`);
  if (o.note) {
    linesArr.push("");
    linesArr.push(`📝 Note: ${o.note}`);
  }
  return linesArr.join("\n");
}

/** Notify the channel about a new user registration, incl. chosen location pin. */
export async function sendNewUserRegistration(user: {
  name: string;
  phone: string;
  telegramUsername?: string | null;
  telegramId?: string | null;
  location?: { latitude: number; longitude: number; address?: string } | null;
}): Promise<boolean> {
  const lines: string[] = [];
  lines.push("👤 *NEW USER REGISTERED — NT26 Coffee*");
  lines.push("");
  lines.push(`Name: ${user.name}`);
  lines.push(`Phone: ${user.phone}`);
  if (user.telegramUsername) lines.push(`Telegram: @${user.telegramUsername}`);
  else if (user.telegramId) lines.push(`Telegram ID: ${user.telegramId}`);
  if (user.location) {
    const { latitude, longitude, address } = user.location;
    lines.push("");
    lines.push("*📍 Chosen Location*");
    lines.push(`Lat/Lng: \`${latitude.toFixed(6)}, ${longitude.toFixed(6)}\``);
    if (address) lines.push(`Address: ${address}`);
    lines.push(`[Open in Google Maps](https://maps.google.com/?q=${latitude},${longitude})`);
  }
  const ok = await sendTelegramMessage(lines.join("\n"));

  // Also drop a native location pin for one-tap directions.
  if (user.location) {
    await sendTelegramLocation(
      user.location.latitude,
      user.location.longitude,
      `📍 Location of new user *${user.name}* (${user.phone})`
    );
  }
  return ok;
}

/** Send a native Telegram location pin to the channel. */
export async function sendTelegramLocation(
  latitude: number,
  longitude: number,
  caption?: string
): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendLocation`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL,
        latitude,
        longitude,
      }),
    });
    const data = await res.json();
    if (!data.ok) return false;

    // Follow up with a caption message referencing the pin
    if (caption) {
      await sendTelegramMessage(caption);
    }
    return true;
  } catch (e) {
    console.error("Telegram location error", e);
    return false;
  }
}

/** Send a plain text message to the channel. */
export async function sendTelegramMessage(text: string): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL,
        text,
        parse_mode: "Markdown",
      }),
    });
    const data = await res.json();
    return !!data.ok;
  } catch (e) {
    console.error("Telegram send error", e);
    return false;
  }
}

/** Send a photo (data URL) with caption to the channel. */
export async function sendTelegramPhoto(dataUrl: string, caption: string): Promise<boolean> {
  try {
    // Convert data URL to Blob
    const blob = await (await fetch(dataUrl)).blob();
    const form = new FormData();
    form.append("chat_id", TELEGRAM_CHANNEL);
    form.append("caption", caption);
    form.append("parse_mode", "Markdown");
    form.append("photo", blob, "receipt.png");

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
    const res = await fetch(url, { method: "POST", body: form });
    const data = await res.json();
    return !!data.ok;
  } catch (e) {
    console.error("Telegram photo error", e);
    return false;
  }
}

/** High-level: submit an order. Sends photo if provided, otherwise text. */
export async function submitOrder(order: OrderPayload, receiptImage?: string): Promise<boolean> {
  const message = buildMessage(order);
  let ok = false;
  if (receiptImage) {
    // Telegram caption max ~1024 chars; the message is short so it's fine.
    ok = await sendTelegramPhoto(receiptImage, message);
  }
  if (!ok) ok = await sendTelegramMessage(message);

  // For delivery orders, also drop a native Telegram location pin so the
  // shop can tap it and get directions in one click.
  if (order.method === "delivery" && order.deliveryLocation) {
    const { latitude, longitude } = order.deliveryLocation;
    await sendTelegramLocation(
      latitude,
      longitude,
      `📍 Delivery pin for invoice \`${order.invoice}\` — ${order.customerName}`
    );
  }

  return ok;
}

export { buildMessage };
