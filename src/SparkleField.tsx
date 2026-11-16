import { useRef, type CSSProperties } from "react";
import { useInView, useReducedMotion } from "motion/react";

// Fixed positions keep the decoration stable across renders and replays.
const motes = Array.from({ length: 28 }, (_, index) => {
  const inset = 3 + ((index * 7) % 17);
  return {
    left: `${index % 2 ? 100 - inset : inset}%`,
    top: `${10 + ((index * 19) % 85)}%`,
    "--mote-size": `${1.5 + (index % 3) * 0.65}px`,
    "--mote-drift": `${(index % 2 ? -1 : 1) * (8 + (index % 13))}px`,
    "--mote-duration": `${7 + (index % 6)}s`,
    "--mote-delay": `${-(index * 1.7)}s`,
  } as CSSProperties;
});

const glints = [
  { left: "7%", top: "18%", size: 12, delay: -1.4 },
  { left: "92%", top: "28%", size: 15, delay: -4.2 },
  { left: "12%", top: "66%", size: 11, delay: -2.8 },
  { left: "94%", top: "79%", size: 13, delay: -0.7 },
  { left: "5%", top: "87%", size: 9, delay: -5.1 },
  { left: "85%", top: "11%", size: 10, delay: -3.5 },
];

export function SparkleField({
  variant = "hero",
  active = true,
}: {
  variant?: "opening" | "hero" | "celebrations";
  active?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.01 });
  const reducedMotion = useReducedMotion();
  const count = variant === "opening" ? 28 : variant === "hero" ? 20 : 14;

  return (
    <div
      ref={ref}
      className={`sparkle-field sparkle-field-${variant}`}
      data-active={active && inView && !reducedMotion}
      aria-hidden="true"
    >
      <div className="sparkle-haze" />
      {motes.slice(0, count).map((style, index) => (
        <i key={index} className="gold-mote" style={style} />
      ))}
      {glints.map((glint, index) => (
        <span
          key={index}
          className="gold-glint"
          style={
            {
              left: glint.left,
              top: glint.top,
              "--glint-size": `${glint.size}px`,
              "--glint-delay": `${glint.delay}s`,
            } as CSSProperties
          }
        />
      ))}
      {variant === "opening" && <div className="sparkle-lustre" />}
    </div>
  );
}
