import { motion, useReducedMotion } from "motion/react";
import { useInvitation } from "./invitation/InvitationContext";

export function CouplePortrait({
  className = "",
  animate = true,
}: {
  className?: string;
  animate?: boolean;
}) {
  const config = useInvitation();
  const reducedMotion = useReducedMotion();
  const shouldAnimate = animate && !reducedMotion;

  return (
    <div className={`couple-portrait midnight-jali-portrait ${className}`}>
      <div
        className="portrait-aura"
        style={{
          background:
            "radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(8, 18, 37, 0) 75%)",
        }}
        aria-hidden="true"
      />
      <svg className="portrait-arch" viewBox="0 0 400 540" fill="none" aria-hidden="true">
        {/* Midnight Royal Ogee / Pointed Islamic Arch fill */}
        <path
          className="arch-fill"
          d="M30 520V230C30 170 80 150 110 110C140 70 175 35 200 15C225 35 260 70 290 110C320 150 370 170 370 230V520Z"
          fill="rgba(10, 25, 47, 0.65)"
        />

        {/* Islamic Jali Lattice geometric accents inside arch background */}
        <g stroke="rgba(212, 175, 55, 0.15)" strokeWidth="1">
          <line x1="60" y1="200" x2="340" y2="480" />
          <line x1="60" y1="280" x2="340" y2="560" />
          <line x1="340" y1="200" x2="60" y2="480" />
          <line x1="340" y1="280" x2="60" y2="560" />
          <circle cx="200" cy="340" r="45" fill="none" stroke="rgba(212, 175, 55, 0.18)" />
          <circle cx="200" cy="340" r="75" fill="none" stroke="rgba(212, 175, 55, 0.1)" />
        </g>

        {/* Outer Radiant Gold Islamic Arch Stroke */}
        <motion.path
          d="M30 520V230C30 170 80 150 110 110C140 70 175 35 200 15C225 35 260 70 290 110C320 150 370 170 370 230V520Z"
          stroke="#d4af37"
          strokeWidth="3"
          strokeLinejoin="round"
          initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.3, ease: "easeInOut" }}
        />

        {/* Inner Dotted Gold Jali Outline */}
        <path
          d="M44 510V235C44 180 90 162 118 124C145 88 178 52 200 32C222 52 255 88 282 124C310 162 356 180 356 235V510Z"
          className="arch-inner-line"
          stroke="rgba(243, 229, 171, 0.7)"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />

        {/* Gold Baseline Plinth */}
        <path d="M10 528H390M40 536H360" stroke="#c5a059" strokeWidth="2.5" />

        {/* Crescent / Star Crown Finial at Apex */}
        <path
          d="M200 15V4M194 9H206"
          stroke="#d4af37"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="200" cy="4" r="3.5" fill="#f3e5ab" />

        {/* Symmetrical Star Medallions */}
        <g transform="translate(110, 110)" fill="#d4af37">
          <circle cx="0" cy="0" r="4" fill="#f3e5ab" />
          <circle cx="0" cy="0" r="8" fill="none" stroke="#d4af37" strokeWidth="1" />
        </g>
        <g transform="translate(290, 110)" fill="#d4af37">
          <circle cx="0" cy="0" r="4" fill="#f3e5ab" />
          <circle cx="0" cy="0" r="8" fill="none" stroke="#d4af37" strokeWidth="1" />
        </g>
      </svg>
      <div className="portrait-plinth" aria-hidden="true" />
      <motion.div
        className="portrait-illustration"
        initial={shouldAnimate ? { opacity: 0, y: 24, scale: 0.96 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={config.media.portraitUrl}
          alt={config.media.portraitAlt}
          width="375"
          height="533"
          fetchPriority="high"
          decoding="async"
        />
      </motion.div>
      <span className="portrait-star portrait-star-one text-[#f3e5ab]" aria-hidden="true">
        ✦
      </span>
      <span className="portrait-star portrait-star-two text-[#d4af37]" aria-hidden="true">
        ✧
      </span>
      <span className="portrait-star portrait-star-three text-[#f3e5ab]" aria-hidden="true">
        ✧
      </span>
    </div>
  );
}
