import { useRef, useState } from "react";
import { motion, useIsPresent } from "motion/react";

export function InvitationOpening({
  onOpen,
  onStart,
  dissolveDuration,
}: {
  onOpen: () => void;
  onStart: () => void;
  dissolveDuration: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPresent = useIsPresent();
  const finished = useRef(false);
  const playbackRequested = useRef(false);
  const [phase, setPhase] = useState<"idle" | "starting" | "playing">("idle");
  const [mediaFailed, setMediaFailed] = useState(false);

  const finishOpening = () => {
    if (finished.current) return;
    finished.current = true;
    onOpen();
  };

  const playVideo = () => {
    const video = videoRef.current;
    if (!video || finished.current || playbackRequested.current) return;
    if (mediaFailed) video.load();
    video.currentTime = 0;
    video.playbackRate = 1;
    playbackRequested.current = true;
    setPhase("starting");
    // Remain inside the guest's gesture so inline playback works on Safari.
    const playback = video.play();
    onStart();
    void playback.catch(() => {
      if (finished.current) return;
      playbackRequested.current = false;
      setPhase("idle");
    });
  };

  return (
    <motion.section
      className="video-opening"
      data-phase={phase}
      aria-label="Wedding invitation opening"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: dissolveDuration, ease: [0.4, 0, 0.2, 1] }}
    >
      <video
        ref={videoRef}
        className="envelope-video"
        src="/assets/envelope-opening-safari.mp4"
        poster="/envelope-poster.jpg"
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        tabIndex={-1}
        aria-label="Wedding invitation opening video"
        onPlaying={() => setPhase("playing")}
        onEnded={finishOpening}
        onError={() => {
          setMediaFailed(true);
          playbackRequested.current = false;
          setPhase("idle");
        }}
      />
      {phase !== "playing" && (
        <img
          className="envelope-poster"
          src="/envelope-poster.jpg"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
        />
      )}
      {phase !== "playing" && (
        <button
          type="button"
          className="envelope-open-trigger focus-ring"
          aria-label="Tap to open"
          onClick={playVideo}
          disabled={phase === "starting" || !isPresent}
        >
          <span className="simple-open-label">{mediaFailed ? "Tap to retry" : "Tap to open"}</span>
        </button>
      )}
    </motion.section>
  );
}
