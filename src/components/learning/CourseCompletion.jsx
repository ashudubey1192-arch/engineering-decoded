import { useEffect, useState } from "react";
import { api, getSession } from "../../services/api";
import "./CourseCompletion.css";
import { dsaLessonKey, updateDsaProgress } from "../../services/dsaProgress.js";
import { getStructuredCourse } from "../../data/structuredCourses";

export default function CourseCompletion({ module, track, navigate, articleSlug: requestedSlug }) {
  const articleSlug =
    getStructuredCourse(module.id, track.slug)?.aliases?.[requestedSlug] || requestedSlug;
  const userId = getSession()?.user?.id;
  const [bookmarked, setBookmarked] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setBusy(Boolean(userId));
    setCompleted(false);
    setBookmarked(false);
    setError("");
    if (userId)
      Promise.all([
        api(articleSlug ? "/progress" : "/progress/courses"),
        api("/progress/bookmarks"),
      ])
        .then(([courses, bookmarks]) => {
          if (!active) return;
          const matches = (row) => row.moduleSlug === module.id && row.courseSlug === track.slug;
          setCompleted(
            courses.some(
              (row) =>
                matches(row) &&
                (!articleSlug || (row.articleSlug === articleSlug && row.completed)),
            ),
          );
          setBookmarked(bookmarks.some(matches));
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
  }, [userId, module.id, track.slug, articleSlug]);
  const complete = async () => {
    if (!userId) {
      navigate("/login");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api(articleSlug ? "/progress" : "/progress/courses", {
        method: "PUT",
        body: JSON.stringify({
          moduleSlug: module.id,
          courseSlug: track.slug,
          ...(articleSlug
            ? {
                articleSlug,
                sectionSlug: "course",
                completed: true,
                progressPercent: 100,
                lastPosition: Math.max(0, Math.round(window.scrollY)),
              }
            : {}),
        }),
      });
      if (getSession()?.user?.id === userId) {
        setCompleted(true);
        if (articleSlug && module.id === "dsa")
          updateDsaProgress("lessons", dsaLessonKey(track.slug, articleSlug), true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const bookmark = async () => {
    if (!userId) {
      navigate("/login");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api("/progress/bookmarks", {
        method: bookmarked ? "DELETE" : "PUT",
        body: JSON.stringify({ moduleSlug: module.id, courseSlug: track.slug }),
      });
      if (getSession()?.user?.id === userId) setBookmarked(!bookmarked);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="learningActionSpace">
      <section
        className="learningActionBar"
        aria-label={`${articleSlug ? "Lesson" : "Course"} actions for ${track.name}`}
        aria-busy={busy}
      >
        {error && (
          <p className="learningActionError" role="alert">
            {error}
          </p>
        )}
        <button type="button" disabled={busy} aria-pressed={bookmarked} onClick={bookmark}>
          <svg viewBox="0 0 24 24" aria-hidden="true" fill={bookmarked ? "currentColor" : "none"}>
            <path d="M6 3h12v18l-6-4-6 4z" />
          </svg>
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </button>
        <span className="learningActionDivider" aria-hidden="true" />
        <button
          type="button"
          className={completed ? "isComplete" : ""}
          disabled={busy || completed}
          onClick={complete}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" fill={completed ? "currentColor" : "none"}>
            <circle cx="12" cy="12" r="9" />
            <path className={completed ? "completedCheck" : ""} d="m8 12 3 3 5-6" />
          </svg>
          <span aria-live="polite">{completed ? "Completed" : "Mark as complete"}</span>
        </button>
      </section>
    </div>
  );
}
