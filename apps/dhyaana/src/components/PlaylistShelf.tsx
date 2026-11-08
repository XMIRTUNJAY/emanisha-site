import type { WorldId } from "../data";
import type { LocalState } from "../storage";
import {
  playlistUrl,
  playlists,
  videosForWorld,
  worldPlaylists,
  type PlaylistVideo,
} from "../content/youtube";
import { Icon, SectionLabel } from "./Primitives";

type Props = {
  world: WorldId;
  state: LocalState;
  onPlay: (video: PlaylistVideo) => void;
  heading?: string;
  intro?: string;
  /** Background tone of the section behind the shelf, used by the fixed header. */
  tone?: "light" | "dark";
};

export function PlaylistShelf({ world, state, onPlay, heading, intro, tone = "light" }: Props) {
  const videos = videosForWorld(world);
  if (!videos.length) return null;

  const completed = videos.filter((video) => state.videos[video.id]?.completed).length;
  const percent = videos.length ? Math.round((completed / videos.length) * 100) : 0;

  const links = worldPlaylists[world]
    .map((entry) => playlists.find((playlist) => playlist.id === entry.playlistId))
    .filter((playlist): playlist is NonNullable<typeof playlist> => Boolean(playlist))
    .filter((playlist, index, all) => all.findIndex((item) => item.id === playlist.id) === index);

  return (
    <section className="watch-shelf section-shell" data-tone={tone}>
      <header className="watch-head">
        <div>
          <SectionLabel>Watch &amp; listen</SectionLabel>
          <h2>{heading ?? "From the Dhyaana channel."}</h2>
          <p>{intro ?? "Short practices you can follow now. Completed videos are remembered on this device."}</p>
        </div>
        <div className="watch-score">
          <strong>
            {completed}
            <span>/{videos.length}</span>
          </strong>
          <small>completed</small>
          <div className="watch-score-bar">
            <i style={{ width: `${percent}%` }} />
          </div>
        </div>
      </header>

      <div className="watch-row">
        {videos.map((video) => {
          const entry = state.videos[video.id];
          const done = entry?.completed ?? false;
          const partial = !done && entry && entry.secondsWatched > 5;
          // Real progress, so the bar reflects how far through the video you are.
          const watchedPercent = entry?.duration
            ? Math.min(100, Math.round((entry.secondsWatched / entry.duration) * 100))
            : 0;
          return (
            <button
              key={video.id}
              className={done ? "watch-card is-done" : "watch-card"}
              onClick={() => onPlay(video)}
              aria-label={`Play ${video.title}`}
            >
              <span className="watch-thumb">
                <img src={video.thumb} alt="" loading="lazy" />
                <span className="watch-play">
                  <Icon name="play" size={16} />
                </span>
                <span className={done ? "watch-badge is-done" : "watch-badge"}>
                  {done ? "Watched" : video.playlistTitle}
                </span>
                {partial && (
                  <span
                    className="watch-partial"
                    style={{ width: `${watchedPercent}%` }}
                    role="progressbar"
                    aria-valuenow={watchedPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${watchedPercent}% watched`}
                  />
                )}
              </span>
              <strong>{video.title}</strong>
              <small>
                {done
                  ? "Completed"
                  : partial
                    ? `${watchedPercent}% watched · ${video.playlistTitle}`
                    : `${video.playlistTitle} · in-app`}
              </small>
            </button>
          );
        })}
      </div>

      <div className="watch-links">
        {links.map((playlist) => (
          <a key={playlist.id} href={playlistUrl(playlist.id)} target="_blank" rel="noreferrer">
            {playlist.title} on YouTube <span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}
