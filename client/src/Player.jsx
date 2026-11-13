import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Reviews from "./Reviews";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function Player() {
  const [tracks, setTracks] = useState([]);
  const [current, setCurrent] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/tracks", { withCredentials: true })
      .then((res) => setTracks(res.data));
  }, []);

  const playTrack = async (track) => {
    const audio = audioRef.current;
    setCurrent(track);
    audio.src = `http://localhost:8000/audio/${encodeURIComponent(track.filename)}`;
    audio.load();
    try {
      await audio.play();
    } catch (err) {
      console.error("Playback failed:", err);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!current) return;
    if (audio.paused) audio.play();
    else audio.pause();
  };

  const currentIndex = tracks.findIndex((t) => t.id === current?.id);

  const playNext = () => {
    if (tracks.length === 0) return;
    const next = currentIndex === -1 ? 0 : (currentIndex + 1) % tracks.length;
    playTrack(tracks[next]);
  };

  const playPrev = () => {
    if (tracks.length === 0) return;
    // If the song is more than 3 seconds in, restart it instead of going back
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const prev = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1;
    playTrack(tracks[prev]);
  };

  const seek = (e) => {
    audioRef.current.currentTime = Number(e.target.value);
  };

    return (
    <div className="player">
      <ul className="track-list">
        {tracks.map((t) => (
          <li
            key={t.id}
            className={`track ${current?.id === t.id ? "active" : ""}`}
            onClick={() => playTrack(t)}
          >
            <span>
              {t.title} - {t.artist}
            </span>
          </li>
        ))}
      </ul>

      <div className="controls">
        <div className="control-buttons">
          <button
            className="skip-btn"
            onClick={playPrev}
            disabled={!current}
            aria-label="Previous"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <rect x="5" y="5" width="3" height="14" rx="1" />
              <path d="M19 5v14L9 12z" />
            </svg>
          </button>

          <button
            className="play-btn"
            onClick={togglePlay}
            disabled={!current}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            className="skip-btn"
            onClick={playNext}
            disabled={!current}
            aria-label="Next"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M5 5v14l10-7z" />
              <rect x="16" y="5" width="3" height="14" rx="1" />
            </svg>
          </button>
        </div>

        <div className="now-playing">
          <div className="now-title">
            {current ? current.title : "Nothing playing"}
          </div>
          <div className="seek-row">
            <span>{formatTime(progress)}</span>
            <input
              type="range"
              className="seek-bar"
              min="0"
              max={duration || 0}
              step="0.1"
              value={progress}
              onChange={seek}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {current && <Reviews track={current} />}

      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setProgress(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={playNext}
      />
    </div>
  );
}

export default Player;