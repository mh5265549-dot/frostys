import * as React from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion, useAnimate } from "motion/react";

export type Direction = "up" | "down" | "left" | "right";

const radiusFromPercent = (w: number, h: number, pct: number) =>
  (Math.min(w, h) / 2) * (Math.max(0, Math.min(100, pct)) / 100);

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const getOffset = (
  dir: Direction,
  pct: number
): { x: string | number; y: string | number } => {
  const clamped = Math.max(0, Math.min(100, pct));
  const fillRatio = clamped / 100;
  const emptyRatio = 1 - fillRatio;

  if (dir === "up") {
    if (clamped === 0) return { x: "0%", y: "calc(100% + 20px)" };
    return { x: "0%", y: `${emptyRatio * 100}%` };
  }
  if (dir === "down") {
    if (clamped === 0) return { x: "0%", y: "calc(-100% - 20px)" };
    return { x: "0%", y: `-${emptyRatio * 100}%` };
  }
  if (dir === "left") {
    if (clamped === 0) return { x: "calc(100% + 20px)", y: "0%" };
    return { x: `${emptyRatio * 100}%`, y: "0%" };
  }
  if (clamped === 0) return { x: "calc(-100% - 20px)", y: "0%" };
  return { x: `-${emptyRatio * 100}%`, y: "0%" };
};

const wavePath = (period: number, amp: number, invert = false): string => {
  const count = Math.round(400 / period);
  const q = period / 4;
  const a = invert ? amp : -amp;
  let d = "M 0 15";
  for (let i = 0; i < count; i++) {
    const x0 = i * period;
    d += ` C ${x0 + q} ${15 + a}, ${x0 + period - q} ${15 - a}, ${
      x0 + period
    } 15`;
  }
  return `${d} V 40 H 0 Z`;
};

const BACK_PATH = wavePath(200, 9, true);
const FRONT_PATH = wavePath(100, 10);

const DEFAULT_TRANSITION = {
  type: "tween",
  ease: [0.25, 1, 0.5, 1],
  duration: 0.45,
};

export type SlideFillButtonProps = {
  children?: React.ReactNode;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  fill?: string;
  textColor?: string;
  hoverFill?: string;
  hoverTextColor?: string;
  direction?: Direction;
  waveSpeed?: number;
  defaultFill?: number;
  rounded?: number;
  padding?: string;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  type?: "button" | "submit" | "reset";
  form?: string;
  href?: string;
  target?: string;
  rel?: string;
  title?: string;
  id?: string;
  ariaLabel?: string;
};

export const SlideFillButton: React.FC<SlideFillButtonProps> = ({
  children,
  label,
  className = "",
  style,
  fill = "#ffffff",
  textColor = "#1c1917",
  hoverFill = "#dc2626",
  hoverTextColor = "#ffffff",
  direction = "up" as Direction,
  waveSpeed = 45,
  defaultFill = 0,
  rounded = 14,
  padding,
  borderWidth = 1,
  borderColor = "rgba(0,0,0,0.08)",
  borderStyle = "solid",
  disabled = false,
  onClick,
  type = "button",
  form,
  href,
  target,
  rel,
  title,
  id,
  ariaLabel,
}) => {
  const [scope, animate] = useAnimate();

  const [radiusBox, setRadiusBox] = useState({ w: 0, h: 0 });
  const [box, setBox] = useState({ w: 0, h: 0 });

  useIsoLayoutEffect(() => {
    const el = scope.current as HTMLElement | null;
    if (!el) return;
    const read = () => {
      setRadiusBox((prev) =>
        prev.w === el.offsetWidth && prev.h === el.offsetHeight
          ? prev
          : { w: el.offsetWidth, h: el.offsetHeight }
      );
      setBox((prev) =>
        prev.w === el.clientWidth && prev.h === el.clientHeight
          ? prev
          : { w: el.clientWidth, h: el.clientHeight }
      );
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scope]);

  const radiusPx = radiusFromPercent(radiusBox.w, radiusBox.h, rounded);
  const waterRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const backRef = useRef<SVGSVGElement | null>(null);
  const frontRef = useRef<SVGSVGElement | null>(null);

  const hovered = useRef(false);
  const focused = useRef(false);
  const filled = useRef(false);

  const restOffset = getOffset(direction, defaultFill);
  const fullOffset = getOffset(direction, 100);

  useEffect(() => {
    const rate = Math.max(0, Math.min(20, Math.round(waveSpeed)));
    if (rate === 0) return;
    const base = 15 / rate;
    const specs: Array<[SVGSVGElement | null, number, string[]]> = [
      [backRef.current, base * 1.35, ["0%", "-50%"]],
      [frontRef.current, base, ["-50%", "0%"]],
    ];
    const controls = specs
      .map(([el, duration, keys]) =>
        el
          ? animate(
              el,
              { x: keys },
              { duration, repeat: Infinity, ease: "linear" }
            )
          : null
      )
      .filter(Boolean);
    return () => {
      controls.forEach((c) => c?.stop());
    };
  }, [animate, waveSpeed]);

  const resetToEmpty = useCallback(() => {
    filled.current = false;
    if (waterRef.current) {
      animate(
        waterRef.current,
        { x: restOffset.x, y: restOffset.y },
        { duration: 0 }
      );
    }
    const submerged = defaultFill >= 60;
    if (labelRef.current) {
      animate(
        labelRef.current,
        { color: submerged ? hoverTextColor : textColor },
        { duration: 0 }
      );
    }
  }, [animate, restOffset.x, restOffset.y, textColor, hoverTextColor, defaultFill]);

  const runFill = useCallback(() => {
    if (waterRef.current) {
      animate(
        waterRef.current,
        { x: fullOffset.x, y: fullOffset.y },
        DEFAULT_TRANSITION as any
      );
    }
    if (labelRef.current) {
      animate(labelRef.current, { color: hoverTextColor }, DEFAULT_TRANSITION as any);
    }
  }, [animate, fullOffset.x, fullOffset.y, hoverTextColor]);

  const runDrain = useCallback(() => {
    if (waterRef.current) {
      animate(
        waterRef.current,
        { x: restOffset.x, y: restOffset.y },
        DEFAULT_TRANSITION as any
      );
    }
    const submerged = defaultFill >= 60;
    if (labelRef.current) {
      animate(
        labelRef.current,
        { color: submerged ? hoverTextColor : textColor },
        DEFAULT_TRANSITION as any
      );
    }
  }, [animate, restOffset.x, restOffset.y, textColor, hoverTextColor, defaultFill]);

  useEffect(() => {
    if (hovered.current || focused.current) runFill();
    else resetToEmpty();
  }, [resetToEmpty, runFill]);

  const sync = useCallback(() => {
    const want = hovered.current || focused.current;
    if (want === filled.current) return;
    filled.current = want;
    if (want) {
      runFill();
    } else {
      runDrain();
    }
  }, [runFill, runDrain]);

  const onPointerEnter = useCallback(() => {
    if (disabled) return;
    hovered.current = true;
    sync();
  }, [sync, disabled]);

  const onPointerLeave = useCallback(() => {
    hovered.current = false;
    sync();
  }, [sync]);

  const onFocus = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      if (disabled) return;
      let visible = true;
      try {
        visible = e.currentTarget.matches(":focus-visible");
      } catch {
        // ignore
      }
      if (!visible) return;
      focused.current = true;
      sync();
    },
    [sync, disabled]
  );

  const onBlur = useCallback(() => {
    focused.current = false;
    sync();
  }, [sync]);

  const isLink = Boolean(href);
  const Root: any = isLink ? motion.a : motion.button;

  const CREST = 14;
  const AHEAD = 12;
  const crestFrame: React.CSSProperties =
    direction === "up"
      ? { top: -AHEAD, left: 0, right: 0, height: CREST }
      : direction === "down"
      ? {
          bottom: -AHEAD,
          left: 0,
          right: 0,
          height: CREST,
          transform: "rotate(180deg)",
        }
      : direction === "left"
      ? {
          top: 0,
          left: 0,
          width: box.h || 40,
          height: CREST,
          transformOrigin: "0 0",
          transform: `translate(${-AHEAD}px, ${box.h || 40}px) rotate(-90deg)`,
        }
      : {
          top: 0,
          left: 0,
          width: box.h || 40,
          height: CREST,
          transformOrigin: "0 0",
          transform: `translate(${(box.w || 100) + AHEAD}px, 0px) rotate(90deg)`,
        };

  const layerStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "200%",
    height: "100%",
  };

  const rootProps = isLink
    ? {
        href,
        target,
        rel: target === "_blank" ? rel || "noopener noreferrer" : rel,
      }
    : {
        type,
        form,
        disabled,
      };

  return (
    <Root
      ref={scope}
      id={id}
      title={title}
      aria-label={ariaLabel || label}
      {...rootProps}
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`group relative overflow-hidden inline-flex items-center justify-center font-bold text-center select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-transform active:scale-[0.98] ${className}`}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: radiusPx > 0 ? radiusPx : undefined,
        borderWidth: borderWidth > 0 ? borderWidth : 0,
        borderColor: borderColor,
        borderStyle: borderStyle as any,
        background: fill,
        padding: padding || undefined,
        textDecoration: "none",
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
    >
      {/* Animated Liquid Wave / Slide Fill Layer */}
      <motion.div
        ref={waterRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: hoverFill,
          pointerEvents: "none",
          zIndex: 1,
          x: restOffset.x,
          y: restOffset.y,
        }}
      >
        <div
          style={{
            position: "absolute",
            pointerEvents: "none",
            overflow: "visible",
            ...crestFrame,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "50% 100%",
            }}
          >
            <motion.svg
              ref={backRef}
              viewBox="0 0 400 30"
              preserveAspectRatio="none"
              style={{ ...layerStyle, opacity: 0.35 }}
            >
              <path d={BACK_PATH} fill={hoverFill} />
            </motion.svg>

            <motion.svg
              ref={frontRef}
              viewBox="0 0 400 30"
              preserveAspectRatio="none"
              style={layerStyle}
            >
              <path d={FRONT_PATH} fill={hoverFill} />
            </motion.svg>

            <div
              style={{
                position: "absolute",
                top: "calc(100% - 2px)",
                left: 0,
                right: 0,
                height: 26,
                background: hoverFill,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Button Content / Label with smooth contrasting text color transition */}
      <motion.span
        ref={labelRef}
        className="relative z-10 flex items-center justify-center gap-2 w-full transition-colors duration-200"
        style={{
          color: defaultFill >= 60 ? hoverTextColor : textColor,
        }}
      >
        {children || label}
      </motion.span>
    </Root>
  );
};

export default SlideFillButton;
