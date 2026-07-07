// Minimal typings + helpers for the Telegram WebApp SDK.
// Docs: https://core.telegram.org/bots/webapps

export type TgUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

export type TgLocation = { latitude: number; longitude: number };

type TgLocationManager = {
  isInited: boolean;
  isLocationAvailable: boolean;
  isAccessRequested: boolean;
  isAccessGranted: boolean;
  init: (cb?: () => void) => void;
  getLocation: (cb: (loc: TgLocation | null) => void) => void;
  openSettings?: () => void;
};

type TgWebApp = {
  initData: string;
  initDataUnsafe: {
    user?: TgUser;
    query_id?: string;
    auth_date?: number;
    hash?: string;
  };
  ready: () => void;
  expand: () => void;
  version?: string;
  colorScheme?: "light" | "dark";
  themeParams?: Record<string, string>;
  LocationManager?: TgLocationManager;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TgWebApp };
  }
}

/** Return the Telegram WebApp instance if available. */
export function getTelegramWebApp(): TgWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

/**
 * Get the current Telegram user (if the site is opened inside Telegram as a
 * Web App / Mini App). Returns null when opened in a normal browser.
 */
export function getTelegramUser(): TgUser | null {
  const wa = getTelegramWebApp();
  if (!wa) return null;
  // initDataUnsafe is only populated when Telegram actually launched the page
  return wa.initDataUnsafe?.user ?? null;
}

/** Build a display name from Telegram user object. */
export function tgUserDisplayName(u: TgUser): string {
  const parts = [u.first_name, u.last_name].filter(Boolean);
  const full = parts.join(" ").trim();
  return full || u.username || `User ${u.id}`;
}

/** Signal the Telegram client that the WebApp is ready to be displayed. */
export function initTelegram(): TgUser | null {
  const wa = getTelegramWebApp();
  if (!wa) return null;
  try {
    wa.ready();
    wa.expand();
  } catch {
    /* noop */
  }
  return wa.initDataUnsafe?.user ?? null;
}

/**
 * Request the user's current geolocation.
 * Tries Telegram's LocationManager first (available in Bot API 8.0+),
 * then falls back to the browser Geolocation API.
 */
export function requestLocation(): Promise<TgLocation> {
  return new Promise((resolve, reject) => {
    const wa = getTelegramWebApp();
    const lm = wa?.LocationManager;

    const useBrowser = () => {
      if (!("geolocation" in navigator)) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
      );
    };

    if (lm && typeof lm.init === "function") {
      try {
        lm.init(() => {
          if (!lm.isLocationAvailable) {
            useBrowser();
            return;
          }
          lm.getLocation((loc) => {
            if (loc) resolve(loc);
            else useBrowser();
          });
        });
        return;
      } catch {
        // fall through
      }
    }
    useBrowser();
  });
}

/** Haversine distance in metres between two lat/lng points. */
export function distanceMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371000; // Earth radius in metres
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
