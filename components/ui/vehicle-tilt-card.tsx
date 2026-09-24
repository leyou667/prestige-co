"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Gauge, MapPin } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { getCategory } from "@/lib/categories";
import { vehicleHref, type Vehicle } from "@/lib/vehicles";
import { VehicleVisual } from "@/components/vehicle/vehicle-visual";

export interface VehicleTiltCardProps {
  vehicle: Vehicle;
  /**
   * "grid"  : catalogue — tilt souris sur desktop, simple ombre/scale au tap sur mobile.
   * "focus" : fiche véhicule — tilt souris sur desktop, gyroscope sur mobile (permission iOS 13+).
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

function useIsTouch() {
  const [touch, setTouch] = React.useState(false);
  React.useEffect(() => setTouch(window.matchMedia("(pointer: coarse)").matches), []);
  return touch;
}

const clamp = (v: number) => Math.max(-0.5, Math.min(0.5, v));

export const VehicleTiltCard = React.forwardRef<HTMLDivElement, VehicleTiltCardProps>(
  ({ vehicle, variant = "grid", city, priority, onSelect, ctaLabel = "Voir le véhicule", ctaHref, unavailable, className }, ref) => {
    const category = getCategory(vehicle.category);
    const href = ctaHref ?? vehicleHref(vehicle);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 15, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);
    const rotateX = useTransform(springY, [-0.5, 0.5], ["8deg", "-8deg"]);
    const rotateY = useTransform(springX, [-0.5, 0.5], ["-8deg", "8deg"]);
    // Reflet lumineux qui suit l'inclinaison
    const glareX = useTransform(springX, [-0.5, 0.5], ["20%", "80%"]);
    const glareY = useTransform(springY, [-0.5, 0.5], ["20%", "80%"]);
    const glare = useTransform(
      [glareX, glareY] as never,
      ([x, y]: string[]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.14), transparent 55%)`,
    );

    const isTouchDevice = useIsTouch();
    const [gyro, setGyro] = React.useState<"idle" | "on" | "denied">("idle");
    const baseline = React.useRef<{ beta: number; gamma: number } | null>(null);
    const focus = variant === "focus";

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isTouchDevice) return;
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
      if (!focus || !isTouchDevice || gyro !== "on") return;
      const handler = (e: DeviceOrientationEvent) => {
        if (e.beta == null || e.gamma == null) return;
        // Position de tenue naturelle du téléphone prise comme référence
        baseline.current ??= { beta: e.beta, gamma: e.gamma };
        mouseY.set(clamp((e.beta - baseline.current.beta) / 60));
        mouseX.set(clamp((e.gamma - baseline.current.gamma) / 60));
      };
      window.addEventListener("deviceorientation", handler);
      return () => window.removeEventListener("deviceorientation", handler);
    }, [focus, gyro, isTouchDevice, mouseX, mouseY]);

    const requestGyro = async () => {
      if (!focus || !isTouchDevice || gyro !== "idle") return;
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

    const lightTouch = isTouchDevice && !focus;

    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={reset}
        onTouchStart={focus ? requestGyro : undefined}
        onTouchMove={focus ? handleTouchMove : undefined}
        onTouchEnd={focus && gyro !== "on" ? reset : undefined}
        whileTap={lightTouch ? { scale: 0.97, boxShadow: "0 30px 60px -20px rgba(200,169,106,0.25)" } : undefined}
        style={lightTouch ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn(
          "group relative w-full rounded-2xl border border-white/10 bg-anthracite shadow-2xl [perspective:1200px]",
          focus ? "h-[28rem] max-w-md sm:h-[32rem]" : "h-[26rem]",
          className,
        )}
      >
        <div
          style={lightTouch ? undefined : { transform: "translateZ(50px)", transformStyle: "preserve-3d" }}
          className="absolute inset-3 grid h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] grid-rows-[1fr_auto] overflow-hidden rounded-xl"
        >
          <VehicleVisual vehicle={vehicle} priority={priority} className="transition-transform duration-700 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.15)_28%,rgba(0,0,0,0)_45%,rgba(0,0,0,0.55)_68%,rgba(0,0,0,0.92)_100%)]" />
          {!lightTouch && <motion.div aria-hidden="true" style={{ background: glare }} className="pointer-events-none absolute inset-0" />}

          <div className="relative flex h-full flex-col justify-between p-4 text-white sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div style={lightTouch ? undefined : { transform: "translateZ(50px)" }}>
                <p className="text-[0.6rem] uppercase tracking-luxe text-gold/90">{category.label} · {vehicle.category}</p>
                <h3 className="mt-1 font-display text-2xl leading-tight">
                  {vehicle.brand} {vehicle.model}
                </h3>
                {vehicle.variant && <p className="text-xs text-white/60">{vehicle.variant}</p>}
              </div>
              <span
                className={cn(
                  "mt-1 shrink-0 rounded-full border px-2.5 py-1 text-[0.58rem] uppercase tracking-wide2",
                  vehicle.available && !unavailable ? "border-emerald-400/30 text-emerald-300/90" : "border-white/20 text-white/50",
                )}
              >
                {unavailable ? "Indisponible à ces dates" : vehicle.available ? "Disponible" : "Sur demande"}
              </span>
            </div>

            <div style={lightTouch ? undefined : { transform: "translateZ(40px)" }} className="space-y-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/70">
                <span className="inline-flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5" /> {vehicle.powerHp} ch
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {city ?? vehicle.baseCity}
                </span>
              </div>
              <p className="text-lg">
                <span className="font-medium">{formatPrice(vehicle.pricePerDay)}</span>
                <span className="text-sm text-white/60"> / jour</span>
              </p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href={href}
                  onClick={onSelect}
                  className="block w-full rounded-lg bg-white/10 py-2.5 text-center text-xs font-medium uppercase tracking-wide2 ring-1 ring-inset ring-white/20 backdrop-blur-md transition hover:bg-white/20"
                >
                  {ctaLabel}
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
        {focus && isTouchDevice && gyro === "idle" && (
          <p className="absolute -bottom-7 left-0 right-0 text-center text-[0.6rem] uppercase tracking-wide2 text-white/40">
            Touchez la carte puis inclinez votre téléphone
          </p>
        )}
      </motion.div>
    );
  },
);
VehicleTiltCard.displayName = "VehicleTiltCard";
