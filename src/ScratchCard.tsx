import { useEffect, useRef, useState } from "react";
import { Sparkles, Heart } from "lucide-react";
import { useInvitation } from "./invitation/InvitationContext";

export function ScratchCard() {
  const config = useInvitation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const paintCover = () => {
      setScratchPercent(0);
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = rect.width || 340;
      const height = rect.height || 210;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Midnight Navy & Starry Antique Gold metallic foil gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#0e1a2f");
      grad.addColorStop(0.3, "#192841");
      grad.addColorStop(0.5, "#d4af37");
      grad.addColorStop(0.7, "#192841");
      grad.addColorStop(1, "#0a1322");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Starry Gold double border
      ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
      ctx.lineWidth = 2;
      ctx.strokeRect(8, 8, width - 16, height - 16);

      ctx.strokeStyle = "rgba(243, 229, 171, 0.85)";
      ctx.lineWidth = 1;
      ctx.strokeRect(12, 12, width - 24, height - 24);

      // Gold stars and dust
      ctx.fillStyle = "rgba(255, 245, 205, 0.8)";
      for (let i = 0; i < 50; i++) {
        const px = ((i * 47) % (width - 28)) + 14;
        const py = ((i * 61) % (height - 28)) + 14;
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Title on Midnight foil
      ctx.fillStyle = "#faf8f5";
      ctx.font = `700 ${width < 340 ? 13 : 15}px "Cinzel", "Cormorant Garamond", Georgia, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("✦ MIDNIGHT ROYAL NIKAH ✦", width / 2, height / 2 - 14);

      ctx.fillStyle = "#f3e5ab";
      ctx.font = "italic 15px Georgia, serif";
      ctx.fillText("Scratch to Reveal the Sacred Date", width / 2, height / 2 + 16);
    };

    paintCover();
    const observer = new ResizeObserver(paintCover);
    observer.observe(container);
    return () => observer.disconnect();
  }, [isRevealed]);

  const scratchAt = (clientX: number, clientY: number) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();

    if (lastPoint.current) {
      ctx.lineWidth = 36;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPoint.current = { x, y };
    checkProgress();
  };

  const checkProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    try {
      const step = 16;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width;
      const h = canvas.height;
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      let transparent = 0;
      let total = 0;

      for (let y = 0; y < h; y += step * dpr) {
        for (let x = 0; x < w; x += step * dpr) {
          const idx = (Math.floor(y) * w + Math.floor(x)) * 4 + 3;
          if (data[idx] < 128) {
            transparent++;
          }
          total++;
        }
      }

      const percent = Math.round((transparent / total) * 100);
      setScratchPercent(percent);

      if (percent >= 35) {
        revealCard();
      }
    } catch {
      // Fallback
    }
  };

  const revealCard = () => {
    setIsRevealed(true);
    setScratchPercent(100);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawing.current = false;
    lastPoint.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="scratch-card-wrapper midnight-scratch-wrapper">
      <div
        ref={containerRef}
        className="scratch-card-box midnight-card-box"
        role="region"
        aria-label="Interactive scratch card revealing wedding date"
      >
        {/* Base Layer: Revealed Wedding Date in Midnight Navy & Antique Gold */}
        <div className="scratch-underlay midnight-underlay">
          <div className="scratch-inner-border midnight-inner-border">
            <span className="scratch-kicker text-[#d4af37]">Save The Date</span>
            <div className="scratch-date-display">
              <span className="scratch-day-num text-[#faf8f5]">{config.display.wedding.day}</span>
              <div className="scratch-month-col">
                <strong className="text-[#f3e5ab]">{config.display.wedding.month.toUpperCase()}</strong>
                <span className="text-[#cbd5e1]">{config.display.wedding.year} · {config.display.wedding.weekday.toUpperCase()}</span>
              </div>
            </div>
            <p className="scratch-couple-names text-[#faf8f5]">
              {config.couple.first} <span className="text-[#d4af37]">&amp;</span> {config.couple.second}
            </p>
            <p className="scratch-venue-city text-[#d4af37]">Nikah Ceremony · January 2027</p>
            <div className="scratch-forever-pill bg-[#081225]/80 border border-[#d4af37]/40 text-[#faf8f5]">
              <Heart size={12} className="text-[#d4af37]" aria-hidden="true" />
              <span>Two Souls United In Duas</span>
            </div>
          </div>
        </div>

        {/* Scratchable Canvas Layer */}
        {!isRevealed && (
          <canvas
            ref={canvasRef}
            className="scratch-canvas"
            aria-hidden="true"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        )}
      </div>

      <div className="scratch-actions-row">
        <p className="scratch-status-hint" aria-live="polite" aria-atomic="true">
          {isRevealed ? (
            <span className="scratch-revealed-text text-[#f3e5ab]">
              <Sparkles size={13} className="inline mr-1 text-[#d4af37]" aria-hidden="true" />
              Date Revealed: {config.display.wedding.full}
            </span>
          ) : (
            <span className="text-[#cbd5e1]">
              {scratchPercent > 0
                ? "Keep scratching to reveal the starry date..."
                : "Scratch with finger or mouse, or tap Reveal"}
            </span>
          )}
        </p>

        {!isRevealed && (
          <button type="button" className="scratch-reveal-button midnight-reveal-btn focus-ring" onClick={revealCard}>
            Reveal Date
          </button>
        )}
      </div>
    </div>
  );
}
