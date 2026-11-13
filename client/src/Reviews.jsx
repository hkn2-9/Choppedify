import { useEffect, useState } from "react";
import axios from "axios";

function Reviews({ track }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setReviews([]);
    axios
      .get(`http://localhost:8000/api/tracks/${track.id}/reviews`)
      .then((res) => setReviews(res.data))
      .catch((err) => console.error(err));
  }, [track.id]);

  const submit = async () => {
    setError("");
    if (rating === 0) return setError("Pick a star rating.");

    try {
      const res = await axios.post(
        `http://localhost:8000/api/tracks/${track.id}/reviews`,
        { rating, comment }
      );
      setReviews([res.data, ...reviews]);
      setRating(0);
      setComment("");
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit review.");
    }
  };

  const average =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="reviews">
      <h3 className="reviews-title">
        Reviews for {track.title}
        {average && (
          <span className="avg-rating">
            ★ {average} ({reviews.length})
          </span>
        )}
      </h3>

      <div className="review-form">
        <div className="star-picker">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`star ${n <= rating ? "on" : ""}`}
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          className="review-input"
          placeholder="What did you think? (optional)"
          maxLength={1000}
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {error && <p className="review-error">{error}</p>}
        <button className="review-submit" onClick={submit}>
          Post review
        </button>
      </div>

      <ul className="review-list">
        {reviews.length === 0 && (
          <li className="review-empty">No reviews yet. Be the first.</li>
        )}
        {reviews.map((r) => (
          <li key={r.id} className="review">
            <div className="review-head">
              <span className="review-stars">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </span>
              <small className="review-date">
                {new Date(r.created_at).toLocaleDateString()}
              </small>
            </div>
            {r.comment && <p className="review-comment">{r.comment}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Reviews;