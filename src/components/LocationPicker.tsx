import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { requestLocation, distanceMeters, formatDistance } from "../telegramWebApp";

export type PickedLocation = {
  latitude: number;
  longitude: number;
  address?: string;
};

const SHOP_LOCATION = { latitude: 11.528618, longitude: 104.941755 };
// Default view: Phnom Penh
const DEFAULT_CENTER: [number, number] = [11.5564, 104.9282];

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="font-size:34px;line-height:1;transform:translate(-50%,-90%);position:absolute;">📍</div>`,
  iconSize: [0, 0],
});

const shopIcon = L.divIcon({
  className: "",
  html: `<div style="font-size:26px;line-height:1;transform:translate(-50%,-90%);position:absolute;">☕</div>`,
  iconSize: [0, 0],
});

/** Best-effort reverse geocoding via OSM Nominatim (free). */
async function reverseGeocode(lat: number, lng: number): Promise<string | undefined> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=km,en`,
      { headers: { Accept: "application/json" } }
    );
    const data = await res.json();
    return data?.display_name as string | undefined;
  } catch {
    return undefined;
  }
}

export default function LocationPicker({
  initial,
  onConfirm,
  onClose,
}: {
  initial?: PickedLocation | null;
  onConfirm: (loc: PickedLocation) => void;
  onClose: () => void;
}) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [picked, setPicked] = useState<PickedLocation | null>(initial ?? null);
  const [address, setAddress] = useState<string | undefined>(initial?.address);
  const [locating, setLocating] = useState(false);
  const [geoErr, setGeoErr] = useState<string | null>(null);

  // init map
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const startCenter: [number, number] = initial
      ? [initial.latitude, initial.longitude]
      : DEFAULT_CENTER;

    const map = L.map(mapDivRef.current, {
      center: startCenter,
      zoom: initial ? 17 : 13,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    // shop marker (fixed)
    L.marker([SHOP_LOCATION.latitude, SHOP_LOCATION.longitude], {
      icon: shopIcon,
      interactive: false,
    }).addTo(map);

    // user pin
    const marker = L.marker(startCenter, {
      icon: pinIcon,
      draggable: true,
    }).addTo(map);
    if (!initial) marker.setOpacity(0); // hide until first tap

    const setPoint = (lat: number, lng: number) => {
      marker.setLatLng([lat, lng]);
      marker.setOpacity(1);
      setPicked({ latitude: lat, longitude: lng });
      setAddress(undefined);
      reverseGeocode(lat, lng).then((a) => setAddress(a));
    };

    map.on("click", (e: L.LeafletMouseEvent) => {
      setPoint(e.latlng.lat, e.latlng.lng);
    });
    marker.on("dragend", () => {
      const ll = marker.getLatLng();
      setPoint(ll.lat, ll.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    // Leaflet needs a resize kick when mounted inside animated containers
    setTimeout(() => map.invalidateSize(), 150);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useMyLocation = () => {
    setLocating(true);
    setGeoErr(null);
    requestLocation()
      .then((loc) => {
        const map = mapRef.current;
        const marker = markerRef.current;
        if (map && marker) {
          map.setView([loc.latitude, loc.longitude], 17);
          marker.setLatLng([loc.latitude, loc.longitude]);
          marker.setOpacity(1);
        }
        setPicked({ latitude: loc.latitude, longitude: loc.longitude });
        setAddress(undefined);
        reverseGeocode(loc.latitude, loc.longitude).then((a) => setAddress(a));
      })
      .catch(() => {
        setGeoErr("មិនអាចទទួលទីតាំងបច្ចុប្បន្ន។ សូមចុចលើផែនទីដើម្បីជ្រើសរើស។");
      })
      .finally(() => setLocating(false));
  };

  const dist = picked ? distanceMeters(picked, SHOP_LOCATION) : null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white">
      {/* header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#148c78] text-white">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
        >
          ←
        </button>
        <div className="font-semibold text-sm flex-1">ជ្រើសរើសទីតាំងរបស់អ្នក</div>
        <a
          href={
            picked
              ? `https://maps.google.com/?q=${picked.latitude},${picked.longitude}`
              : "https://maps.google.com"
          }
          target="_blank"
          rel="noreferrer"
          className="text-[11px] bg-white/20 rounded-full px-2 py-1"
        >
          Google Maps ↗
        </a>
      </div>

      {/* map */}
      <div className="relative flex-1">
        <div ref={mapDivRef} className="absolute inset-0" style={{ zIndex: 0 }} />

        {/* my location button */}
        <button
          onClick={useMyLocation}
          disabled={locating}
          className="absolute bottom-4 right-4 z-[500] bg-white shadow-lg rounded-full px-3 py-2.5 text-xs font-medium text-[#148c78] flex items-center gap-1 disabled:opacity-60"
        >
          {locating ? (
            <span className="w-3 h-3 border-2 border-[#148c78]/40 border-t-[#148c78] rounded-full animate-spin" />
          ) : (
            "🎯"
          )}
          ទីតាំងខ្ញុំ
        </button>

        {/* hint */}
        {!picked && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] bg-black/70 text-white text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap">
            👆 ចុចលើផែនទីដើម្បីជ្រើសទីតាំង
          </div>
        )}

        {geoErr && (
          <div className="absolute top-3 left-3 right-3 z-[500] bg-amber-50 border border-amber-300 text-amber-800 text-[11px] px-3 py-2 rounded-lg">
            ⚠️ {geoErr}
          </div>
        )}
      </div>

      {/* footer */}
      <div className="p-4 border-t border-gray-100 bg-white">
        {picked ? (
          <div className="mb-3">
            <div className="text-xs font-mono text-gray-600">
              📍 {picked.latitude.toFixed(6)}, {picked.longitude.toFixed(6)}
              {dist !== null && (
                <span className="ml-2 text-[#148c78] font-sans font-semibold">
                  ({formatDistance(dist)} ពីហាង)
                </span>
              )}
            </div>
            {address && (
              <div className="text-[11px] text-gray-500 mt-1 line-clamp-2">{address}</div>
            )}
          </div>
        ) : (
          <div className="mb-3 text-xs text-gray-400">មិនទាន់បានជ្រើសទីតាំង</div>
        )}
        <button
          onClick={() => picked && onConfirm({ ...picked, address })}
          disabled={!picked}
          className="w-full bg-[#148c78] disabled:opacity-40 text-white rounded-full py-3 text-sm font-semibold"
        >
          ✓ រក្សាទុកទីតាំងនេះ
        </button>
      </div>
    </div>
  );
}
