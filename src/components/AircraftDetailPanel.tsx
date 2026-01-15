import { X, MapPin, ArrowUp, ArrowDown, Plane } from "lucide-react";
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
    <div className="flex flex-col px-3 py-1 bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
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
  const [flightRoute, setFlightRoute] = useState<{
    origin: {
      iata: string;
      name: string;
      city: string;
      gate?: string | null;
      terminal?: string | null;
    };
    destination: {
      iata: string;
      name: string;
      city: string;
      gate?: string | null;
      terminal?: string | null;
      baggage_claim?: string | null;
    };
    times?: {
      scheduled_out?: string | null;
      estimated_out?: string | null;
      actual_out?: string | null;
      scheduled_in?: string | null;
      estimated_in?: string | null;
      actual_in?: string | null;
    };
    status?: string;
    operator?: string | null;
    codeshares?: string[];
    codeshares_iata?: string[];
  } | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [airlineLogo, setAirlineLogo] = useState<string | null>(null);

  // Reset state when aircraft changes
  useEffect(() => {
    setImageError(false);
    setPhotoData(null);
    setBasicData(null);
    setIsLightboxOpen(false);
    setFlightRoute(null);
    setRouteLoading(false);

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

      // 3. Fetch Flight Route from FlightAware (if callsign available)
      if (aircraft.callsign && aircraft.callsign.trim()) {
        setRouteLoading(true);
        fetch(`/api/flight/${aircraft.callsign.trim()}`)
          .then((res) => res.json())
          .then((data) => {
            console.log("[FlightAware Response]", data);
            if (data.origin && data.destination) {
              setFlightRoute({
                origin: data.origin,
                destination: data.destination,
                times: data.times,
                status: data.status,
                operator: data.operator,
                codeshares: data.codeshares,
                codeshares_iata: data.codeshares_iata,
              });
            }
          })
          .catch(() => {})
          .finally(() => setRouteLoading(false));
      }
    }
  }, [aircraft?.hex, aircraft?.callsign]);

  // Fetch airline logo when operator changes
  useEffect(() => {
    if (flightRoute?.operator && aircraft?.callsign) {
      // Extract ICAO code from callsign (first 3 letters)
      const icaoCode = aircraft.callsign.substring(0, 3).toUpperCase();
      if (icaoCode) {
        const logoUrl = `/airline-logos/${icaoCode}.png`;
        // Test if logo exists
        const img = new Image();
        img.onload = () => setAirlineLogo(logoUrl);
        img.onerror = () => setAirlineLogo(null);
        img.src = logoUrl;
      }
    } else {
      setAirlineLogo(null);
    }
  }, [flightRoute?.operator, aircraft?.callsign]);

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
          <div className="flex gap-2">
            {photoData?.link && !basicData?.largeImageUrl && (
              <a
                href={photoData.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-full text-sm font-semibold transition-colors"
              >
                PlaneSpotters.net
              </a>
            )}
            {/* External Route Links inside Lightbox too? Maybe not, keep it clean. */}
          </div>
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
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-sky-900/20 to-transparent relative">
          {/* Close button - absolute positioned */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white z-10"
          >
            <X size={20} />
          </button>

          <div className="pr-0">
            <div className="flex items-center gap-2 mb-1">
              {/* Airline Logo or Airplane Placeholder */}
              <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                {airlineLogo ? (
                  <img
                    src={airlineLogo}
                    alt="Airline logo"
                    className="max-w-full max-h-full object-contain opacity-90"
                    onError={() => setAirlineLogo(null)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-500/20 to-sky-600/20 rounded-lg border border-sky-500/30">
                    <Plane className="text-sky-400/60" size={28} />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                {/* Registration or Callsign/Hex as main title */}
                <h2
                  className="text-1xl font-bold text-sky-400 font-mono tracking-tight leading-none"
                  title={basicData?.reg ? "Registration" : "Callsign"}
                >
                  {basicData?.reg || aircraft.callsign || aircraft.hex}
                </h2>
                {/* Show callsign below if we have reg and callsign is different */}
                <div className="flex items-center gap-2 mt-2">
                  {basicData?.reg &&
                    aircraft.callsign &&
                    aircraft.callsign !== basicData.reg && (
                      <span
                        className="text-xs font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        title="Callsign"
                      >
                        {aircraft.callsign}
                      </span>
                    )}
                  {aircraft.squawk && (
                    <span
                      className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                      title="Squawk"
                    >
                      SQK {aircraft.squawk}
                    </span>
                  )}
                  <span
                    className="text-xs font-mono text-white/50 bg-white/5 px-1.5 py-0.5 rounded border border-white/5"
                    title="Hex"
                  >
                    {aircraft.hex}
                  </span>
                </div>
              </div>
            </div>

            {/* Airline name and country */}
            <div className="flex flex-col gap-0.5 mt-3">
              {basicData?.airline && (
                <div className="text-sm text-white/70 font-medium">
                  {basicData.airline}
                </div>
              )}
              {displayCountry !== "Unknown" && (
                <div className="flex items-center gap-1.5">
                  <span className="text-base" title={displayCountry}>
                    {displayFlag}
                  </span>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                    {displayCountry}
                  </span>
                </div>
              )}
            </div>

            {/* Codeshares */}
            {flightRoute?.codeshares && flightRoute.codeshares.length > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <span className="text-[9px] text-white/30 uppercase tracking-wider">
                  Codeshares:
                </span>
                {flightRoute.codeshares.slice(0, 3).map((code, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono text-sky-400/70 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20"
                  >
                    {code}
                  </span>
                ))}
                {flightRoute.codeshares.length > 3 && (
                  <span className="text-[9px] text-white/30">
                    +{flightRoute.codeshares.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Flight Route Display */}
        {flightRoute && (
          <div className="border-b border-white/10 bg-gradient-to-r from-sky-500/5 to-transparent">
            {/* Status Bar */}
            {flightRoute.status && (
              <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
                  Flight Status
                </span>
                <span
                  className={clsx(
                    "text-xs font-bold px-2 py-0.5 rounded",
                    flightRoute.status === "Scheduled" &&
                      "bg-blue-500/20 text-blue-400",
                    flightRoute.status === "En Route" &&
                      "bg-emerald-500/20 text-emerald-400",
                    flightRoute.status === "Landed" &&
                      "bg-sky-500/20 text-sky-400",
                    flightRoute.status === "Cancelled" &&
                      "bg-rose-500/20 text-rose-400",
                    !flightRoute.status.match(
                      /Scheduled|En Route|Landed|Cancelled/
                    ) && "bg-white/10 text-white/60"
                  )}
                >
                  {flightRoute.status}
                </span>
              </div>
            )}

            {/* Flight Progress Bar */}
            {flightRoute.times &&
              (flightRoute.times.actual_out ||
                flightRoute.times.estimated_out ||
                flightRoute.times.scheduled_out) &&
              (flightRoute.times.actual_in ||
                flightRoute.times.estimated_in ||
                flightRoute.times.scheduled_in) &&
              (() => {
                const departureTime = new Date(
                  flightRoute.times.actual_out ||
                    flightRoute.times.estimated_out ||
                    flightRoute.times.scheduled_out!
                ).getTime();
                const arrivalTime = new Date(
                  flightRoute.times.estimated_in ||
                    flightRoute.times.actual_in ||
                    flightRoute.times.scheduled_in!
                ).getTime();
                const currentTime = Date.now();

                const totalDuration = arrivalTime - departureTime;
                const elapsed = currentTime - departureTime;
                const remaining = arrivalTime - currentTime;

                const progress = Math.min(
                  Math.max((elapsed / totalDuration) * 100, 0),
                  100
                );

                const formatDuration = (ms: number) => {
                  const hours = Math.floor(Math.abs(ms) / (1000 * 60 * 60));
                  const minutes = Math.floor(
                    (Math.abs(ms) % (1000 * 60 * 60)) / (1000 * 60)
                  );
                  return `${hours}h ${minutes}m`;
                };

                return (
                  <div className="px-4 pb-3">
                    <div className="flex items-center justify-between text-[9px] text-white/40 mb-1.5">
                      <span>{formatDuration(elapsed)} elapsed</span>
                      <span className="text-white/60 font-bold">
                        {formatDuration(totalDuration)} total
                      </span>
                      <span>{formatDuration(remaining)} remaining</span>
                    </div>
                    <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                    </div>
                    <div className="flex items-center justify-center mt-1">
                      <span className="text-[8px] text-white/30 font-mono">
                        {Math.round(progress)}% complete
                      </span>
                    </div>
                  </div>
                );
              })()}

            {/* Route */}
            <div className="px-4 py-3 flex items-start justify-between gap-4">
              {/* Origin */}
              <div className="flex items-start gap-2 flex-1">
                <MapPin size={14} className="text-emerald-400 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {flightRoute.origin.iata}
                  </span>
                  <span className="text-[9px] text-white/40 leading-tight max-w-[140px]">
                    {flightRoute.origin.city || flightRoute.origin.name}
                  </span>
                  {(flightRoute.origin.gate || flightRoute.origin.terminal) && (
                    <div className="flex gap-1 mt-0.5">
                      {flightRoute.origin.terminal && (
                        <span className="text-[8px] bg-white/5 text-white/50 px-1 py-0.5 rounded">
                          T{flightRoute.origin.terminal}
                        </span>
                      )}
                      {flightRoute.origin.gate && (
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded">
                          Gate {flightRoute.origin.gate}
                        </span>
                      )}
                    </div>
                  )}
                  {/* Departure Time */}
                  {flightRoute.times && (
                    <div className="text-[9px] text-white/50 mt-1 flex flex-col gap-0.5">
                      {flightRoute.times.actual_out ? (
                        <>
                          <span className="text-emerald-400 font-bold">
                            ✓{" "}
                            {new Date(
                              flightRoute.times.actual_out
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {flightRoute.times.scheduled_out && (
                            <span className="text-white/30 line-through text-[8px]">
                              {new Date(
                                flightRoute.times.scheduled_out
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </>
                      ) : flightRoute.times.estimated_out ? (
                        <>
                          <span className="text-amber-400">
                            Est:{" "}
                            {new Date(
                              flightRoute.times.estimated_out
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {flightRoute.times.scheduled_out && (
                            <span className="text-white/30 text-[8px]">
                              Sch:{" "}
                              {new Date(
                                flightRoute.times.scheduled_out
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </>
                      ) : flightRoute.times.scheduled_out ? (
                        <span>
                          Sch:{" "}
                          {new Date(
                            flightRoute.times.scheduled_out
                          ).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-white/30 text-lg mt-1">→</div>

              {/* Destination */}
              <div className="flex items-start gap-2 flex-1 justify-end">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-mono font-bold text-sky-400">
                    {flightRoute.destination.iata}
                  </span>
                  <span className="text-[9px] text-white/40 leading-tight max-w-[140px] text-right">
                    {flightRoute.destination.city ||
                      flightRoute.destination.name}
                  </span>
                  {(flightRoute.destination.gate ||
                    flightRoute.destination.terminal ||
                    flightRoute.destination.baggage_claim) && (
                    <div className="flex gap-1 mt-0.5">
                      {flightRoute.destination.terminal && (
                        <span className="text-[8px] bg-white/5 text-white/50 px-1 py-0.5 rounded">
                          T{flightRoute.destination.terminal}
                        </span>
                      )}
                      {flightRoute.destination.gate && (
                        <span className="text-[8px] bg-sky-500/10 text-sky-400 px-1 py-0.5 rounded">
                          Gate {flightRoute.destination.gate}
                        </span>
                      )}
                      {flightRoute.destination.baggage_claim && (
                        <span className="text-[8px] bg-amber-500/10 text-amber-400 px-1 py-0.5 rounded">
                          🎒 {flightRoute.destination.baggage_claim}
                        </span>
                      )}
                    </div>
                  )}
                  {/* Arrival Time */}
                  {flightRoute.times && (
                    <div className="text-[9px] text-white/50 mt-1 flex flex-col gap-0.5 items-end">
                      {flightRoute.times.actual_in ? (
                        <>
                          <span className="text-sky-400 font-bold">
                            ✓{" "}
                            {new Date(
                              flightRoute.times.actual_in
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {flightRoute.times.scheduled_in && (
                            <span className="text-white/30 line-through text-[8px]">
                              {new Date(
                                flightRoute.times.scheduled_in
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </>
                      ) : flightRoute.times.estimated_in ? (
                        <>
                          <span className="text-amber-400">
                            Est:{" "}
                            {new Date(
                              flightRoute.times.estimated_in
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {flightRoute.times.scheduled_in && (
                            <span className="text-white/30 text-[8px]">
                              Sch:{" "}
                              {new Date(
                                flightRoute.times.scheduled_in
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </>
                      ) : flightRoute.times.scheduled_in ? (
                        <span>
                          Sch:{" "}
                          {new Date(
                            flightRoute.times.scheduled_in
                          ).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
                <MapPin size={14} className="text-sky-400 mt-0.5" />
              </div>
            </div>
          </div>
        )}
        {routeLoading && (
          <div className="p-3 border-b border-white/10 bg-white/5 text-center">
            <span className="text-xs text-white/40 animate-pulse">
              Loading route...
            </span>
          </div>
        )}

        {/* Route / External Links */}
        {(aircraft.callsign || basicData?.reg) && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-white/5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold shrink-0">
              Route Info:
            </span>
            <a
              href={`https://flightaware.com/live/flight/${aircraft.callsign || basicData?.reg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs rounded border border-sky-500/20 whitespace-nowrap transition-colors"
            >
              FlightAware
            </a>
            <a
              href={
                aircraft.callsign
                  ? `https://www.flightradar24.com/data/flights/${aircraft.callsign}`
                  : `https://www.flightradar24.com/data/aircraft/${basicData?.reg}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs rounded border border-amber-500/20 whitespace-nowrap transition-colors"
            >
              FlightRadar24
            </a>
            <a
              href={`https://www.google.com/search?q=flight+${aircraft.callsign || basicData?.reg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs rounded border border-white/10 whitespace-nowrap transition-colors"
            >
              Google
            </a>
          </div>
        )}

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
