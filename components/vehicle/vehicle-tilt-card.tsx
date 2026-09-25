"use client";

import * as React from "react";
import Link from "next/link";
import { m, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Gauge, MapPin } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { getCategory } from "@/lib/categories";
import { vehicleHref, type Vehicle } from "@/lib/vehicles";
import { VehicleVisual } from "./vehicle-visual";

interface VehicleTiltCardProps {
  vehicle: Vehicle;
  /**
   * "grid"  : catalogue — inclinaison à la souris sur desktop, simple ombre/scale au tap sur mobile.
   * "focus" : fiche véhicule — inclinaison à la souris sur desktop, gyroscope sur mobile (permission iOS 13+).
   */
  variant?: "grid" | "focus";
  /** Ville affichée (ex. ville recherchée) ; par défaut, ville de rattachement */
  city?: string;
  priority?: boolean;
  onSelect?: () => void;
  ctaLabel?: string;
  ctaHref?: string;
  /** Indisponible sur les dates recherchées */
  unavailable?: boolean;
  className?: string;
}

type PermissionFn = () => Promise<"granted" | "denied">;

const clamp = (v: number) => Math.max(-0.5, Math.min(0.5, v));
const isCoarse = () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

export const VehicleTiltCard = React.forwardRef<HTMLDivElement, VehicleTiltCardProps>(
  ({ vehicle, variant = "grid", city, priority, onSelect, ctaLabel = "Voir le véhicule", ctaHref, unavailable, className }, ref) => {
    const category = getCategory(vehicle.category);
    const href = ctaHref ?? vehicleHref(vehicle);
    const focus = variant === "focus";

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 15, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);
    const rotateX = useTransform(springY, [-0.5, 0.5], ["8deg", "-8deg"]);
    const rotateY = useTransform(springX, [-0.5, 0.5], ["-8deg", "8deg"]);
    // Reflet lumineux qui suit l'inclinaison (desktop uniquement, masqué en CSS sur écran tactile)
    const glareX = useTransform(springX, [-0.5, 0.5], [20, 80]);
    const glareY = useTransform(springY, [-0.5, 0.5], [20, 80]);
    const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.14), transparent 55%)`;

    const [gyro, setGyro] = React.useState<"idle" | "on" | "denied">("idle");
    const [touchHint, setTouchHint] = React.useState(false);
    const baseline = React.useRef<{ beta: number; gamma: number } | null>(null);

    React.useEffect(() => {
      if (focus) setTouchHint(isCoarse());
    }, [focus]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isCoarse()) return;
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    const reset = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    // Gyroscope : uniquement pour la fiche véhicule (une seule carte à l'écran)
    React.useEffect(() => {
      if (!focus || gyro !== "on") return;
      const handler = (e: DeviceOrientationEvent) => {
        if (e.beta == null || e.gamma == null) return;
        // Position de tenue naturelle du téléphone prise comme référence
        baseline.current ??= { beta: e.beta, gamma: e.gamma };
        mouseY.set(clamp((e.beta - baseline.current.beta) / 60));
        mouseX.set(clamp((e.gamma - baseline.current.gamma) / 60));
      };
      window.addEventListener("deviceorientation", handler);
      return () => window.removeEventListener("deviceorientation", handler);
    }, [focus, gyro, mouseX, mouseY]);

    const requestGyro = async () => {
      if (!focus || !isCoarse() || gyro !== "idle") return;
      const DOE = typeof DeviceOrientationEvent !== "undefined" ? (DeviceOrientationEvent as unknown as { requestPermission?: PermissionFn }) : null;
      if (!DOE) return setGyro("denied");
      try {
        if (typeof DOE.requestPermission === "function") {
          // iOS 13+ : permission explicite sur geste utilisateur
          setGyro((await DOE.requestPermission()) === "granted" ? "on" : "denied");
        } else {
          setGyro("on");
        }
      } catch {
        setGyro("denied");
      }
    };

    // Fallback tactile léger si le gyroscope est refusé / indisponible
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
      if (!focus || gyro === "on") return;
      const t = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(clamp(((t.clientX - rect.left) / rect.width - 0.5) * 0.5));
      mouseY.set(clamp(((t.clientY - rect.top) / rect.height - 0.5) * 0.5));
    };

    const available = vehicle.available && !unavailable;

    return (
      <m.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={reset}
        onTouchStart={focus ? requestGyro : undefined}
        onTouchMove={focus ? handleTouchMove : undefined}
        onTouchEnd={focus && gyro !== "on" ? reset : undefined}
        whileTap={focus ? undefined : { scale: 0.98 }}
        // Pas de translateZ sur le contenu : le texte reste net (profondeur donnée par l'ombre et le reflet)
        style={{ rotateX, rotateY, transformPerspective: 1200 }}
        className={cn(
          "group relative w-full rounded-2xl border border-white/10 bg-anthracite shadow-2xl transition-shadow duration-500 hover:shadow-[0_30px_60px_-25px_rgba(200,169,106,0.25)]",
          focus ? "h-[28rem] max-w-md sm:h-[32rem] lg:max-w-none" : "h-[22rem] max-w-md sm:h-[26rem] sm:max-w-none",
          className,
        )}
      >
        <div className="absolute inset-3 grid grid-rows-[1fr_auto] overflow-hidden rounded-xl">
          <VehicleVisual vehicle={vehicle} priority={priority} fit="full" className="transition-transform duration-700 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.45)_30%,rgba(0,0,0,0)_50%,rgba(0,0,0,0.7)_68%,rgba(0,0,0,0.94)_100%)]" />
          <m.div aria-hidden="true" style={{ background: glare }} className="pointer-events-none absolute inset-0 [@media(pointer:coarse)]:hidden" />

          <div className="relative flex h-full flex-col justify-between p-4 text-white sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="whitespace-nowrap text-2xs uppercase tracking-wide2 text-gold-soft drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {category.label} · {vehicle.category}
                </p>
                <h3 className="mt-1 font-display text-2xl leading-tight">
                  {vehicle.brand} {vehicle.model}
                </h3>
                {vehicle.variant && <p className="text-xs text-subtle">{vehicle.variant}</p>}
              </div>
              <span
                className={cn(
                  "mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-black/40 px-2 py-1 text-2xs uppercase tracking-[0.1em]",
                  available ? "border-silver/40 text-silver" : "border-white/20 text-muted",
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", available ? "bg-emerald-400/80" : "bg-white/40")} />
                {unavailable ? "Indisponible à ces dates" : vehicle.available ? "Disponible" : "Sur demande"}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/85">
                <span className="nums inline-flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5" /> {vehicle.powerHp} ch
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {city ?? vehicle.baseCity}
                </span>
              </div>
              <p className="nums text-lg">
                <span className="font-medium">{formatPrice(vehicle.pricePerDay)}</span>
                <span className="text-sm text-subtle"> / jour</span>
              </p>
              <Link
                href={href}
                onClick={onSelect}
                className="block min-h-11 w-full rounded-lg bg-white/10 py-3 text-center text-xs font-medium uppercase tracking-wide2 ring-1 ring-inset ring-white/20 transition hover:scale-[1.02] hover:bg-white/20 active:scale-[0.98]"
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        </div>
        {focus && touchHint && gyro === "idle" && (
          <p className="absolute -bottom-7 left-0 right-0 text-center text-2xs uppercase tracking-wide2 text-muted">
            Touchez la carte puis inclinez votre téléphone
          </p>
        )}
      </m.div>
    );
  },
);
VehicleTiltCard.displayName = "VehicleTiltCard";
