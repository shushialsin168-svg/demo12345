import { useState } from "react";

/**
 * Brand logo resolution order:
 *  1. Local file at src/assets/logo.{png,jpg,jpeg,webp} (if you add one)
 *  2. The NT26 emblem from the Telegram channel photo (CDN URL)
 *  3. SVG fallback badge drawn in the same style
 */

// Vite glob: resolves to {} if no file exists — build never breaks.
const logoModules = import.meta.glob("../assets/logo.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});
const localLogoUrl = Object.values(logoModules)[0] as string | undefined;

// NT26 Cafe emblem — Telegram channel (@sokphengnetcafe) profile photo.
const TELEGRAM_LOGO_URL =
  "https://cdn5.telesco.pe/file/NaYNpfyeY1z4oO7T6sA7ICDak3O0P3UJx4kf4saiIXEBZDdBtHldqmlk-DHBZcSMXVOwodqb5hZL3xsdB17VHWwQkvL-CegPAgszTe59O3f8NikIJMsgpWDt_nHNvYxOm0oqDvPI-7Vzdu9tk8cLPRvnfaL_1eHLSSHDNcmdDguqq_NzxkRLvoy3lzDmLqYAcCNIjROMWDIetWp5_2akVnNXmI2C1mtewQVYVp-_nOtakDrDxBVk_63iap7FzgfWRg27l2ZX5aqWzVhRTUexe7PCrAIg78pdNvdN9e-sIzMjv66kYk7LGtJtHMYpUoV-vfM_AmAqDMqnakCJ_EW4yA.jpg";

const logoUrl = localLogoUrl ?? TELEGRAM_LOGO_URL;

export const hasBrandLogo = true;

export default function BrandLogo({ size = 160 }: { size?: number }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (logoUrl && !imgFailed) {
    return (
      <img
        src={logoUrl}
        alt="NT26 Coffee"
        width={size}
        height={size}
        onError={() => setImgFailed(true)}
        referrerPolicy="no-referrer"
        className="rounded-full object-cover shadow-2xl"
        style={{ width: size, height: size }}
      />
    );
  }

  // SVG fallback badge inspired by the brand emblem
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label="NT26 Coffee"
      style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,.35))" }}
    >
      {/* outer ring */}
      <circle cx="100" cy="100" r="98" fill="#5a2317" />
      <circle cx="100" cy="100" r="92" fill="#6f2f1f" />
      <circle cx="100" cy="100" r="92" fill="none" stroke="#f6ede2" strokeWidth="1.5" opacity=".55" />

      {/* ornamental flame swirls (simplified) */}
      <g stroke="#f6ede2" strokeWidth="1.4" fill="none" opacity=".5">
        <path d="M30 130 C20 100 30 70 55 52 C45 75 48 95 60 110 C48 118 38 124 30 130Z" />
        <path d="M170 130 C180 100 170 70 145 52 C155 75 152 95 140 110 C152 118 162 124 170 130Z" />
        <path d="M45 155 C60 165 80 168 100 165 C80 175 58 170 45 155Z" />
        <path d="M155 155 C140 165 120 168 100 165 C120 175 142 170 155 155Z" />
      </g>

      {/* central drop / bodhi leaf shape */}
      <path
        d="M100 22 C118 52 142 76 142 108 C142 136 124 158 100 166 C76 158 58 136 58 108 C58 76 82 52 100 22Z"
        fill="none"
        stroke="#f6ede2"
        strokeWidth="2"
        opacity=".85"
      />
      <path
        d="M100 34 C114 58 132 80 132 106 C132 130 118 148 100 156 C82 148 68 130 68 106 C68 80 86 58 100 34Z"
        fill="none"
        stroke="#f6ede2"
        strokeWidth="1"
        opacity=".5"
      />

      {/* Khmer brand text */}
      <text
        x="100"
        y="98"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="'Kantumruy Pro', sans-serif"
        fontWeight="700"
        fontSize="34"
      >
        នូវចំ
      </text>

      {/* banner */}
      <rect x="52" y="112" width="96" height="18" rx="9" fill="#5a2317" stroke="#f6ede2" strokeWidth="1" />
      <text
        x="100"
        y="125"
        textAnchor="middle"
        fill="#f6ede2"
        fontFamily="'Kantumruy Pro', sans-serif"
        fontWeight="600"
        fontSize="10"
      >
        ☕ កាហ្វេ &amp; ភេសជ្ជៈ ☕
      </text>

      {/* ២៦ */}
      <text
        x="100"
        y="152"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="'Kantumruy Pro', sans-serif"
        fontWeight="700"
        fontSize="22"
      >
        ២៦
      </text>
    </svg>
  );
}
