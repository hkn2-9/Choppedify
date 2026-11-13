import { useEffect, useRef, useState } from "react";
import axios from "axios";

function Player() {
  const [tracks, setTracks] = useState([]);
  const [current, setCurrent] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    axios.get("http://localhost:8000/api/tracks", { withCredentials: true })
      .then((res) => setTracks(res.data));
  }, []);

  const play = (track) => {
    setCurrent(track);
    audioRef.current.src = `http://localhost:8000/audio/${encodeURIComponent(track.filename)}`;
    audioRef.current.play();
  };

  return (
    <div>
      <ul>
        {tracks.map((t) => (
          <li key={t.id}>
            {t.title} - {t.artist}
            <button onClick={() => play(t)}>Play</button>
          </li>
        ))}
      </ul>
      <p>{current ? `Now playing: ${current.title}` : "Nothing playing"}</p>
      <audio ref={audioRef} controls />
    </div>
  );
}

export default Player;