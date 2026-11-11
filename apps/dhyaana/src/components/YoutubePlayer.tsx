import { useEffect, useRef, useState } from "react";
import { isComplete } from "../content/thresholds";
import { watchUrl } from "../content/youtube";

/* The YouTube IFrame API attaches itself to window. */
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<any> | null = null;

function loadYouTubeApi(): Promise<any> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      document.head.appendChild(tag);
    }
  });
  return apiPromise;
}

type Props = {
  videoId: string;
  title: string;
  onProgress?: (seconds: number, duration: number) => void;
  onEnded?: (seconds: number, duration: number) => void;
};

export function YoutubePlayer({ videoId, title, onProgress, onEnded }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const endedRef = useRef(false);
  const callbacks = useRef({ onProgress, onEnded });
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  callbacks.current = { onProgress, onEnded };

  useEffect(() => {
    let cancelled = false;
    let poll: number | undefined;
    endedRef.current = false;
    setState("loading");

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !wrapRef.current) return;
        const target = document.createElement("div");
        target.className = "yt-target";
        wrapRef.current.innerHTML = "";
        wrapRef.current.appendChild(target);

        const player = new YT.Player(target, {
          videoId,
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              if (cancelled) return;
              playerRef.current = event.target;
              // Keep the player out of the dialog's tab order: a cross-origin
              // iframe would otherwise trap Tab and Escape inside itself.
              try {
                event.target.getIframe?.()?.setAttribute("tabindex", "-1");
              } catch {
                // Older embeds may not expose the iframe yet.
              }
              setState("ready");
              try {
                event.target.playVideo();
              } catch {
                // A blocked autoplay simply leaves the YouTube play button visible.
              }
            },
            onStateChange: (event: any) => {
              if (cancelled) return;
              if (event.data === YT.PlayerState.ENDED && !endedRef.current) {
                endedRef.current = true;
                const duration = Number(event.target.getDuration?.() ?? 0);
                callbacks.current.onEnded?.(duration, duration);
              }
            },
            onError: () => {
              if (!cancelled) setState("error");
            },
          },
        });
        playerRef.current = player;

        poll = window.setInterval(() => {
          const current = playerRef.current;
          if (!current || typeof current.getCurrentTime !== "function") return;
          const duration = Number(current.getDuration?.() ?? 0);
          const seconds = Number(current.getCurrentTime?.() ?? 0);
          callbacks.current.onProgress?.(seconds, duration);
          // Completion is proportional to the clip: a 10s short counts as
          // watched once ~9s of it has played.
          if (isComplete(seconds, duration) && !endedRef.current) {
            endedRef.current = true;
            callbacks.current.onEnded?.(seconds, duration);
          }
        }, 1000);
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
      if (poll) window.clearInterval(poll);
      const player = playerRef.current;
      playerRef.current = null;
      try {
        player?.destroy?.();
      } catch {
        // The iframe may already be gone.
      }
      if (wrapRef.current) wrapRef.current.innerHTML = "";
    };
  }, [videoId]);

  return (
    <div className="yt-shell">
      <div ref={wrapRef} className="yt-mount" aria-label={title} />
      {state === "loading" && <p className="yt-note">Opening YouTube…</p>}
      {state === "error" && (
        <p className="yt-note">
          This video could not be embedded.{" "}
          <a href={watchUrl(videoId)} target="_blank" rel="noreferrer">
            Watch it on YouTube
          </a>
          .
        </p>
      )}
    </div>
  );
}
