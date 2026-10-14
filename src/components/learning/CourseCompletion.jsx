import { useEffect, useState } from "react";
import { api, getSession } from "../../services/api";

export default function CourseCompletion({ module, track, navigate }) {
  const userId = getSession()?.user?.id;
  const [completed, setCompleted] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setBusy(Boolean(userId));
    setCompleted(false);
    setError("");
    if (userId)
      api("/progress/courses")
        .then((rows) => {
          if (active)
            setCompleted(
              rows.some((row) => row.moduleSlug === module.id && row.courseSlug === track.slug),
            );
        })
        .catch((err) => {
          if (active) setError(err.message);
        })
        .finally(() => {
          if (active) setBusy(false);
        });
    return () => {
      active = false;
    };
  }, [userId, module.id, track.slug]);
  const complete = async () => {
    if (!userId) {
      navigate("/login");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api("/progress/courses", {
        method: "PUT",
        body: JSON.stringify({ moduleSlug: module.id, courseSlug: track.slug }),
      });
      if (getSession()?.user?.id === userId) setCompleted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section
      style={{ maxWidth: 960, margin: "32px auto", padding: 24 }}
      aria-label="Course completion"
    >
      <h2>{completed ? "Course completed" : "Finished this course?"}</h2>
      <p>
        {track.name} ·{" "}
        {completed
          ? "Your completion is saved to your account."
          : "Mark this course complete to save your achievement."}
      </p>
      {error && <p role="alert">{error}</p>}
      <button className="primary" disabled={busy || completed} onClick={complete}>
        {busy
          ? "Loading…"
          : completed
            ? "✓ Completed"
            : userId
              ? "Complete course"
              : "Sign in to complete course"}
      </button>
      {completed && <button onClick={() => navigate("/")}>View dashboard →</button>}
    </section>
  );
}
