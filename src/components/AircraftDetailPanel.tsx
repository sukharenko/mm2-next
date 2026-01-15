import { X, ArrowUp, ArrowDown, Plane } from "lucide-react";
import { Aircraft } from "@/hooks/useAircraft";
import { getCountryFromHex, getFlagEmoji } from "@/utils/icao";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { useSettings } from "@/contexts/SettingsContext";

interface AircraftDetailPanelProps {
  aircraft: Aircraft | null;
  onClose: () => void;
}

export function DetailedStat({
  label,
  value,
  highlight,
  extra,
}: {
  label: string;
  value: string;
  highlight?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col p-4 bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
      <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">
        {label}
      </span>
      <div className="flex items-end gap-2">
        <span
          className={clsx(
            "text-xl font-mono tracking-tight",
            highlight ? highlight : "text-white/90"
          )}
        >
          {value}
        </span>
        {extra}
      </div>
    </div>
  );
}

export function AircraftDetailPanel({
  aircraft,
  onClose,
}: AircraftDetailPanelProps) {
  const { formatAltitude, formatSpeed, formatVertRate } = useSettings();
  const [photoData, setPhotoData] = useState<{
    url: string;
    type: string;
    link: string;
  } | null>(null);
  const [basicData, setBasicData] = useState<{
    type?: string;
    icaoType?: string;
    manufacturer?: string;
    reg?: string;
    airline?: string;
    country?: string;
    countryISO?: string;
    imageUrl?: string;
    largeImageUrl?: string;
  } | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Reset state when aircraft changes
  useEffect(() => {
    setImageError(false);
    setPhotoData(null);
    setBasicData(null);
    setIsLightboxOpen(false);

    if (aircraft?.hex && !aircraft.hex.startsWith("MOCK")) {
      // 1. Fetch Photo & Type from PlaneSpotters (Secondary source now)
      fetch(`https://api.planespotters.net/pub/photos/hex/${aircraft.hex}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.photos && data.photos.length > 0) {
            const photo = data.photos[0];
            setPhotoData({
              url: photo.thumbnail_large?.src || photo.thumbnail?.src,
              type: photo.plane_type,
              link: photo.link,
            });
          }
        })
        .catch(() => {});

      // 2. Fetch Rich Info from ADS-B DB (via local proxy)
      const paddedHex = aircraft.hex.padStart(6, "0");
      fetch(`/api/hex/${paddedHex}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.response?.aircraft) {
            const ac = data.response.aircraft;
            console.log(ac);
            setBasicData({
              type: ac.type,
              icaoType: ac.icao_type,
              manufacturer: ac.manufacturer,
              reg: ac.registration,
              airline: ac.registered_owner,
              country: ac.registered_owner_country_name,
              countryISO: ac.registered_owner_country_iso_name,
              imageUrl: ac.url_photo,
              largeImageUrl: ac.url_photo,
            });
          }
        })
        .catch(() => {});
    }
  }, [aircraft?.hex]);

  if (!aircraft) return null;

  // Lightbox Component
  const Lightbox = () => {
    const lbImage =
      basicData?.largeImageUrl || basicData?.imageUrl || photoData?.url;
    if (!isLightboxOpen || !lbImage) return null;

    // Use proxy for lightbox image too if needed
    const proxyLbImage = lbImage.startsWith("http")
      ? `/api/proxy-image?url=${encodeURIComponent(lbImage)}`
      : lbImage;

    return (
      <div
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
        onClick={() => setIsLightboxOpen(false)}
      >
        <button className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
          <X size={32} />
        </button>
        <img
          src={proxyLbImage}
          alt={basicData?.type || photoData?.type}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <div
          className="mt-4 flex flex-col items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-white text-xl font-bold">
            {basicData?.manufacturer} {basicData?.type || basicData?.icaoType}
          </span>
          {photoData?.link && !basicData?.largeImageUrl && (
            <a
              href={photoData.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-full text-sm font-semibold transition-colors"
            >
              View on PlaneSpotters.net
            </a>
          )}
        </div>
      </div>
    );
  };

  const hexStr = String(aircraft.hex || "");
  const country = getCountryFromHex(hexStr);
  const displayCountry = basicData?.country || country.name;
  const displayFlag = basicData?.countryISO
    ? getFlagEmoji(basicData.countryISO)
    : country.flag;

  const vertRate = aircraft.vertRate || 0;
  const isClimbing = vertRate > 100;
  const isDescending = vertRate < -100;

  const placeholderUrl =
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop";

  // Priority: ADS-B DB Image -> PlaneSpotters Image -> Placeholder
  const rawImageUrl = basicData?.imageUrl || photoData?.url;

  // Use local proxy for remote images to bypass CORS
  let displayImageUrl = placeholderUrl;
  if (rawImageUrl) {
    displayImageUrl = `/api/proxy-image?url=${encodeURIComponent(rawImageUrl)}`;
  }

  const aircraftName = [
    basicData?.manufacturer,
    basicData?.type || basicData?.icaoType || photoData?.type,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <Lightbox />
      <div className="absolute top-24 right-4 w-96 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl z-20 animate-in slide-in-from-right fade-in duration-300 ring-1 ring-white/10">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-start bg-gradient-to-r from-sky-900/20 to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl" title={displayCountry}>
                {displayFlag}
              </span>
              <h2 className="text-3xl font-bold text-sky-400 font-mono tracking-tight">
                {basicData?.reg || aircraft.callsign || aircraft.hex}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white/50 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                {aircraft.hex}
              </span>
              {aircraft.squawk && (
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  SQK {aircraft.squawk}
                </span>
              )}
              {displayCountry !== "Unknown" && (
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                  {displayCountry}
                </span>
              )}
            </div>
            {basicData?.airline && (
              <div className="mt-1 text-sm text-white/70 font-medium truncate max-w-[200px]">
                {basicData.airline}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-px bg-white/10 border-b border-white/10">
          <DetailedStat
            label="ALTITUDE"
            value={
              aircraft.altitude ? formatAltitude(aircraft.altitude) : "---"
            }
            extra={
              <>
                {isClimbing && (
                  <ArrowUp
                    size={16}
                    className="text-emerald-400 animate-pulse"
                  />
                )}
                {isDescending && (
                  <ArrowDown
                    size={16}
                    className="text-rose-400 animate-pulse"
                  />
                )}
              </>
            }
          />
          <DetailedStat
            label="SPEED"
            value={aircraft.speed ? formatSpeed(aircraft.speed) : "---"}
          />
          <DetailedStat
            label="HEADING"
            value={
              aircraft.heading ? `${Math.round(aircraft.heading)}°` : "---"
            }
          />
          <DetailedStat
            label="VERT RATE"
            value={vertRate !== 0 ? formatVertRate(vertRate) : "Level"}
            highlight={
              isClimbing
                ? "text-emerald-400"
                : isDescending
                  ? "text-rose-400"
                  : undefined
            }
          />
        </div>

        {/* Image Area */}
        <div className="relative h-56 bg-black/50 overflow-hidden group">
          {!imageError ? (
            <img
              src={displayImageUrl}
              alt="Aircraft"
              onError={() => setImageError(true)}
              onClick={() =>
                !imageError && rawImageUrl && setIsLightboxOpen(true)
              }
              className={clsx(
                "w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-700",
                rawImageUrl && "cursor-pointer"
              )}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-3 bg-white/5">
              <div className="p-4 rounded-full bg-white/5">
                <Plane size={48} strokeWidth={1} />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest opacity-50">
                Visual Unavailable
              </span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
            <div className="flex items-center gap-2 text-[10px] text-white/60 font-mono">
              <div className="flex flex-col">
                <span className="uppercase tracking-widest text-white/30">
                  Aircraft Type
                </span>
                <span className="text-white text-lg font-bold tracking-tight">
                  {aircraftName ||
                    (aircraft.category
                      ? `CAT ${aircraft.category}`
                      : "Unknown")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
