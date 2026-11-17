import { useEffect, useMemo, useRef, useState } from "react";
import qrcode from "qrcode-generator";
import {
  CalendarPlus,
  Clock,
  Flower2,
  ArrowDown,
  RotateCcw,
  MapPin,
  Menu,
  Music,
  Navigation as NavigationIcon,
  Pause,
  Volume2,
  VolumeX,
  X,
  Heart,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll } from "motion/react";
import type { Celebration } from "./invitation/schema";
import { timezone } from "./invitation/schema";
import { useInvitation } from "./invitation/InvitationContext";
import { getCountdownParts } from "./countdown";
import { ScratchCard } from "./ScratchCard";
import { CouplePortrait } from "./CouplePortrait";
import { InvitationOpening } from "./InvitationOpening";
import { SparkleField } from "./SparkleField";

const indiaClock = new Intl.DateTimeFormat("en-GB", {
  timeZone: timezone,
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const navItems = [
  ["Our Nikah", "our-wedding"],
  ["Save The Date", "countdown"],
  ["Celebrations", "celebrations"],
  ["Blessings", "blessings"],
] as const;

function Monogram({ className = "" }: { className?: string }) {
  const config = useInvitation();
  return (
    <span
      className={`monogram ${className}`}
      role="img"
      aria-label={`${config.display.initials.join(" and ")} wedding monogram for ${config.couple.first} and ${config.couple.second}`}
    >
      <span>{config.display.initials[0]}</span>
      <i>&amp;</i>
      <span>{config.display.initials[1]}</span>
    </span>
  );
}

function IslamicJaliFlourish({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`botanical-sprig ${className}`}
      viewBox="0 0 180 240"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 227C88 182 51 90 145 20M62 184C114 174 128 143 151 118M75 133C41 112 33 83 28 55M89 89C122 87 145 71 161 48" />
        <path
          d="M49 203C31 196 25 179 31 163C48 171 55 185 49 203ZM65 174C84 175 101 163 105 146C85 143 69 155 65 174ZM69 148C48 143 38 127 42 112C62 118 72 131 69 148ZM78 114C95 113 108 99 108 83C90 87 79 99 78 114ZM96 74C79 68 74 55 78 42C94 48 101 61 96 74ZM114 54C130 56 145 46 149 34C132 32 120 39 114 54ZM120 153C113 136 119 123 131 115C139 131 133 145 120 153ZM52 104C35 104 22 91 21 77C38 78 48 89 52 104ZM143 64C146 78 137 89 124 92C122 78 130 68 143 64Z"
          fill="#d4af37"
          fillOpacity=".15"
        />
      </g>
      <circle cx="145" cy="20" r="5" fill="#d4af37" />
      <circle cx="31" cy="55" r="3" fill="#d4af37" />
      <circle cx="151" cy="118" r="3.5" fill="#d4af37" />
    </svg>
  );
}

function MusicControl({
  canPlay,
  audio,
}: {
  canPlay: boolean;
  audio: React.RefObject<HTMLAudioElement | null>;
}) {
  const config = useInvitation();
  const userControlled = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const hasMusic = Boolean(config.optional.musicUrl);

  useEffect(() => {
    const player = audio.current;
    if (!player || !canPlay || !hasMusic) return;
    let disposed = false;
    player.volume = 0.35;

    const removeListeners = () => {
      document.removeEventListener("pointerdown", startOnInteraction, true);
      document.removeEventListener("touchend", startOnInteraction, true);
      document.removeEventListener("keydown", startOnInteraction, true);
      window.removeEventListener("pageshow", tryAutoplay);
    };
    const tryAutoplay = () => {
      if (disposed || userControlled.current) return;
      void player
        .play()
        .then(() => {
          if (!disposed) removeListeners();
        })
        .catch(() => {});
    };
    const startOnInteraction = (event: Event) => {
      if (userControlled.current) {
        removeListeners();
        return;
      }
      if (event.target instanceof Element && event.target.closest(".music-controls")) return;
      tryAutoplay();
    };

    document.addEventListener("pointerdown", startOnInteraction, true);
    document.addEventListener("touchend", startOnInteraction, true);
    document.addEventListener("keydown", startOnInteraction, true);
    window.addEventListener("pageshow", tryAutoplay);
    tryAutoplay();
    return () => {
      disposed = true;
      removeListeners();
    };
  }, [canPlay, hasMusic, audio]);

  const togglePlay = async () => {
    if (!audio.current || !canPlay || !hasMusic) return;
    userControlled.current = true;
    if (audio.current.paused) {
      try {
        await audio.current.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      audio.current.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="music-controls midnight-music-controls" role="group" aria-label="Background music">
      {hasMusic && (
        <audio
          ref={audio}
          src={config.optional.musicUrl}
          preload="metadata"
          loop
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onVolumeChange={() => setMuted(Boolean(audio.current?.muted))}
          onError={() => setPlaying(false)}
        />
      )}
      <button
        type="button"
        className="icon-button focus-ring"
        onClick={togglePlay}
        disabled={!hasMusic}
        aria-label={hasMusic ? (playing ? "Pause music" : "Play music") : "Music is not configured"}
        aria-pressed={playing}
        title={playing ? "Pause music" : "Play music"}
      >
        {playing ? <Pause /> : <Music />}
      </button>
      {hasMusic && (
        <button
          type="button"
          className="icon-button focus-ring"
          onClick={() => {
            if (!audio.current) return;
            audio.current.muted = !muted;
            setMuted(!muted);
          }}
          aria-label={muted ? "Unmute music" : "Mute music"}
          aria-pressed={muted}
          title={muted ? "Unmute music" : "Mute music"}
        >
          {muted ? <VolumeX /> : <Volume2 />}
        </button>
      )}
    </div>
  );
}

function Navigation() {
  const config = useInvitation();
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <nav className="site-nav midnight-site-nav" aria-label="Invitation navigation">
      <motion.div
        className="reading-progress"
        style={{ scaleX: scrollYProgress, background: "#d4af37" }}
        aria-hidden="true"
      />
      <a
        className="nav-mark focus-ring"
        href="#our-wedding"
        aria-label="Home"
        onClick={() => setOpen(false)}
      >
        {config.display.initials[0]} <span>&</span> {config.display.initials[1]}
      </a>
      <div id="invitation-navigation" className={`nav-links ${open ? "nav-links-open" : ""}`}>
        {navItems.map(([label, id]) => (
          <a key={id} className="focus-ring" href={`#${id}`} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </div>
      <button
        ref={toggle}
        type="button"
        className="icon-button nav-toggle focus-ring"
        aria-expanded={open}
        aria-controls="invitation-navigation"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </nav>
  );
}

function Countdown() {
  const config = useInvitation();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const remaining = getCountdownParts(Date.parse(config.countdownTarget), now);
  const values = [
    ["Days", remaining.days],
    ["Hours", remaining.hours],
    ["Minutes", remaining.minutes],
    ["Seconds", remaining.seconds],
  ] as const;

  return (
    <div className="countdown-wrap midnight-countdown-wrap">
      <p className="countdown-note">
        {remaining.complete ? "The royal day has arrived!" : "Counting down to the sacred Nikah"}
      </p>
      <p className="countdown-target">
        <time dateTime={config.countdownTarget}>{config.display.countdownLabel}</time>
      </p>
      <div
        className="countdown midnight-countdown-grid"
        role="timer"
        aria-label={`Time remaining until ${config.display.countdownLabel}`}
      >
        {values.map(([label, value]) => (
          <div key={label} className="midnight-count-box">
            <strong>{String(value).padStart(2, "0")}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <p className="countdown-clock">
        Current time in IST:{" "}
        <time dateTime={new Date(now).toISOString()}>{indiaClock.format(now)}</time>
      </p>
    </div>
  );
}

function SectionHeading({ eyebrow, children }: { eyebrow?: string; children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className="section-heading midnight-section-heading"
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
    >
      {eyebrow && <span>{eyebrow}</span>}
      <h2>{children}</h2>
      <div className="botanical-rule" aria-hidden="true">
        <i style={{ background: "#d4af37" }} />
        <Flower2 strokeWidth={1} style={{ color: "#d4af37" }} />
        <i style={{ background: "#d4af37" }} />
      </div>
    </motion.div>
  );
}

function getGoogleCalendarUrl(event: Celebration) {
  try {
    const startDate = new Date(event.start);
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);
    const formatTime = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    // The PDF gives prayer-relative timing, so avoid inventing a precise calendar time.
    const nextDay = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    const dates = event.hasExactTime
      ? `${formatTime(startDate)}/${formatTime(endDate)}`
      : `${event.start.slice(0, 10).replace(/-/g, "")}/${nextDay.toLocaleDateString("en-CA", { timeZone: timezone }).replace(/-/g, "")}`;
    const title = encodeURIComponent(event.calendarTitle || event.title);
    const details = encodeURIComponent(
      `${event.title}\n${event.supportingLine}${event.venue ? `\nVenue: ${event.venue}` : ""}`,
    );
    const location = encodeURIComponent(event.venue ? `${event.venue}, ${event.address || ""}` : "Royal Wedding Celebration");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  } catch {
    return "#";
  }
}

function VenueQr({ href }: { href: string }) {
  const code = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(href);
    qr.make();
    const size = qr.getModuleCount();
    const cells: string[] = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (qr.isDark(row, col)) cells.push(`M${col + 4},${row + 4}h1v1h-1z`);
      }
    }
    return { path: cells.join(""), size: size + 8 };
  }, [href]);
  return (
    <a className="venue-qr focus-ring" href={href} target="_blank" rel="noreferrer">
      <svg viewBox={`0 0 ${code.size} ${code.size}`} width="180" height="180" role="img"
        aria-label="QR code for the wedding venue on Google Maps" shapeRendering="crispEdges">
        <rect width={code.size} height={code.size} fill="#fff" />
        <path d={code.path} fill="#000" />
      </svg>
      <span>Scan for Google Maps</span>
    </a>
  );
}

function EventCard({ event, index }: { event: Celebration; index: number }) {
  const reducedMotion = useReducedMotion();
  const isReception = event.id === "reception";
  const subtitle = event.title.includes(" — ") ? event.title.split(" — ")[1] : event.title;
  const hasTime = Boolean(event.timeLabel && event.timeLabel.trim());
  const hasVenue = Boolean(event.venue && event.venue.trim());

  return (
    <motion.article
      id={event.id}
      className={`wedding-function-card midnight-function-card event-${event.id}`}
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
    >
      <div className="function-card-heading">
        <div className="ceremony-heading-art" aria-hidden="true">
          <img src={event.image} alt="" loading="lazy" decoding="async" />
        </div>
        <h3>{event.shortName}</h3>
        {subtitle !== event.shortName && <p className="function-card-subtitle">{subtitle}</p>}
      </div>
      <div className="function-card-details">
        <p className="function-card-date-line">
          <time dateTime={event.start}>{event.dateLabel}</time>
        </p>
        {hasTime && (
          <p className="function-card-time">
            <Clock size={19} aria-hidden="true" />
            <strong>{event.timeLabel}</strong>
            {event.hasExactTime && <span>IST</span>}
          </p>
        )}
        {hasVenue && (
          <div className="function-card-venue-block">
            <MapPin size={22} aria-hidden="true" />
            <h4>{event.venue}</h4>
            {event.address && <p>{event.address}</p>}
          </div>
        )}
        {event.supportingLine && <p className="event-description">{event.supportingLine}</p>}
        <div className="event-actions">
          {hasVenue && event.mapUrl && (
            <a
              className="button button-solid midnight-btn focus-ring"
              href={event.mapUrl}
              target="_blank"
              rel="noreferrer"
            >
              <NavigationIcon size={18} aria-hidden="true" /> Get directions
            </a>
          )}
          {!isReception && <a
            className="calendar-link midnight-cal-link focus-ring"
            href={getGoogleCalendarUrl(event)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Add ${event.shortName} to your calendar`}
          >
            <CalendarPlus size={19} aria-hidden="true" /> Add to calendar
          </a>}
        </div>
        {!isReception && hasVenue && event.mapUrl && <VenueQr href={event.mapUrl} />}
      </div>
      <div className="ceremony-footer-art" aria-hidden="true">
        <img src={event.image} alt="" loading="lazy" decoding="async" />
      </div>
    </motion.article>
  );
}

export default function App() {
  const config = useInvitation();
  const [opened, setOpened] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const invitationHeading = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();
  const weddingAudio = useRef<HTMLAudioElement>(null);
  const dissolveDuration = reducedMotion ? 0.25 : 2.0;

  useEffect(() => {
    if (revealed) {
      window.scrollTo({ top: 0, behavior: "instant" });
      invitationHeading.current?.focus({ preventScroll: true });
    }
  }, [revealed]);

  useEffect(() => {
    if (revealed) return;
    const body = document.body;
    const scrollY = window.scrollY;
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    document.body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    return () => {
      Object.assign(body.style, previous);
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, [revealed]);

  const handleStartOpening = () => {
    if (!weddingAudio.current) return;
    weddingAudio.current.volume = 0.35;
    void weddingAudio.current.play().catch(() => {});
  };

  const openInvitation = () => {
    if (opened) return;
    if (weddingAudio.current) {
      weddingAudio.current.volume = 0.35;
      void weddingAudio.current.play().catch(() => {});
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    setOpened(true);
  };

  return (
    <>
      <AnimatePresence onExitComplete={() => setRevealed(true)}>
        {!opened && (
          <InvitationOpening
            key="opening"
            onOpen={openInvitation}
            onStart={handleStartOpening}
            dissolveDuration={dissolveDuration}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="invitation midnight-royal-invitation"
        inert={!revealed}
        aria-hidden={!revealed}
        initial={{ opacity: 0 }}
        animate={{ opacity: opened ? 1 : 0 }}
        transition={{ duration: dissolveDuration, ease: [0.4, 0, 0.2, 1] }}
      >
        <Navigation />
        <MusicControl canPlay={opened} audio={weddingAudio} />

        <main>
          <a className="skip-to-content focus-ring" href="#celebrations">
            Skip to celebration details
          </a>

          {/* Section 2 — Main Invitation Hero */}
          <section
            className={`hero cinematic-hero midnight-hero ${opened ? "hero-is-revealed" : ""}`}
            id="our-wedding"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(8, 18, 37, 0.90), rgba(4, 9, 20, 0.95)), url("${config.media.venueArtworkUrl}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <SparkleField variant="hero" active={opened} />
            <div className="hero-editorial-grid">
              <div className="hero-portrait-column">
                <div className="hero-portrait-caption">
                  <span>Blessed Union</span>
                </div>
                <CouplePortrait className="hero-couple" animate={false} />
                <p className="hero-art-caption text-[#e2d6b5]">{config.couple.brideFullName} &amp; {config.couple.groomFullName}</p>
              </div>

              <div className="hero-inner midnight-hero-inner">
                <p className="arabic-bismillah text-[#d4af37]" dir="rtl" lang="ar">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
                <p className="eyebrow text-[#d4af37]">Together with their families</p>
                <h1 ref={invitationHeading} tabIndex={-1}>
                  <span className="hero-name text-[#faf7ee]">{config.couple.first}</span>
                  <span className="hero-ampersand text-[#d4af37]">&amp;</span>
                  <span className="hero-name hero-groom-name text-[#faf7ee]">{config.couple.second}</span>
                </h1>
                <p className="hero-invitation-line text-[#e8dfc8]">
                  {config.wording.heroMessage}
                </p>
                <div className="hero-date midnight-hero-date">
                  <span>{config.display.wedding.weekday}</span>
                  <time dateTime={config.weddingDate}>{config.display.wedding.full}</time>
                </div>
                <a className="button button-solid midnight-gold-btn focus-ring" href="#celebrations">
                  Explore the celebrations <ArrowDown size={18} aria-hidden="true" />
                </a>
                <p className="hero-footnote text-[#c7beaa]">{config.wording.heroFootnote}</p>
              </div>
            </div>

            <a className="hero-scroll-cue midnight-scroll-cue focus-ring" href="#invitation">
              <span>The Royal Invitation</span>
              <ArrowDown size={18} aria-hidden="true" />
            </a>
          </section>

          {/* Formal Invitation Details Section */}
          <section className="family-section midnight-family-section" id="invitation">
            <IslamicJaliFlourish className="family-sprig" />
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
            >
              <Monogram className="family-monogram" />
              <p className="arabic-bismillah-small text-[#d4af37]" dir="rtl" lang="ar">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <SectionHeading eyebrow="In The Name of Allah, The Most Beneficent, The Most Merciful">
                The Sacred Union
              </SectionHeading>

              <div className="invitation-families midnight-families" aria-label="The couple">
                <div className="formal-name-card midnight-name-card">
                  <span className="formal-role text-[#d4af37]">Bride</span>
                  <h2>{config.couple.brideFullName || config.couple.first}</h2>
                  {config.couple.brideQualification && <p className="formal-qualification">{config.couple.brideQualification}</p>}
                  {config.couple.brideParents && <p>{config.couple.brideParents}</p>}
                  {config.couple.brideGrandparents && <p>{config.couple.brideGrandparents}</p>}
                </div>
                <span className="family-weds text-[#d4af37]">and</span>
                <div className="formal-name-card midnight-name-card">
                  <span className="formal-role text-[#d4af37]">Groom</span>
                  <h2>{config.couple.groomFullName || config.couple.second}</h2>
                  {config.couple.groomQualification && <p className="formal-qualification">{config.couple.groomQualification}</p>}
                  {config.couple.groomParents && <p>{config.couple.groomParents}</p>}
                  {config.couple.groomGrandparents && <p>{config.couple.groomGrandparents}</p>}
                </div>
              </div>

              <p className="invitation-main-paragraph">
                {config.invitationLine}
              </p>

              <p className="family-blessing text-[#f3e5ab] italic">
                "May Allah bless this union and shower His blessings upon you both, and unite you in goodness."
              </p>
            </motion.div>
          </section>

          {/* Section 3 & 5 — Scratch to Reveal Date & Countdown */}
          <section className="countdown-section midnight-countdown-section" id="countdown">
            <div className="date-keepsake">
              <SectionHeading eyebrow="Royal Keepsake">Save Our Date</SectionHeading>
              <ScratchCard />
            </div>

            <div className="countdown-panel">
              <SectionHeading eyebrow="Until We Celebrate Together">
                The Sacred Countdown
              </SectionHeading>
              <Countdown />
            </div>
          </section>

          {/* Section 4 — Wedding Celebrations */}
          <section className="celebrations-section midnight-celebrations-section" id="celebrations">
            <SparkleField variant="celebrations" active={opened} />
            <SectionHeading eyebrow="Royal Occasions">
              Wedding Celebrations
            </SectionHeading>
            <p className="section-intro">
              {config.wording.celebrationsIntro}
            </p>
            <div className="events">
              {config.celebrations.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </section>

          {/* Section 7 — Closing Blessings */}
          <footer id="blessings" className="site-footer midnight-site-footer">
            <div className="closing-copy">
              <Monogram />
              <SectionHeading eyebrow="With Warmth &amp; Gratitude">Closing Blessings</SectionHeading>
              <p className="closing-message text-[#e2d6b5]">
                {config.wording.closingNote}
              </p>
              <p className="closing-couple-names text-[#d4af37]">
                {config.couple.first} &amp; {config.couple.second}
              </p>
              {config.wishesFrom && <div className="closing-wishes">
                <h3>Best Wishes</h3>
                <p>{config.wishesFrom}</p>
                {config.homeAddress && <p>{config.homeAddress}</p>}
              </div>}
              <div className="closing-rule" aria-hidden="true" style={{ background: "rgba(212, 175, 55, 0.4)" }} />
              <div className="closing-navigation">
                <a className="back-to-top text-[#d4af37] focus-ring" href="#our-wedding">
                  Back to the invitation ↑
                </a>
                <button
                  type="button"
                  className="opening-replay text-[#d4af37] focus-ring"
                  onClick={() => {
                    setRevealed(false);
                    setOpened(false);
                  }}
                >
                  <RotateCcw size={16} aria-hidden="true" /> Replay the entrance
                </button>
              </div>
            </div>
          </footer>
        </main>
      </motion.div>
    </>
  );
}
