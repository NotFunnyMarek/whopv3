import React, { useState, useEffect } from "react";
import "../styles/whop-dashboard/_member.scss";

export default function CourseViewer({
  steps = [],
  initialCompleted = [],
  whopId,
  onProgressChange,
}) {
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState(initialCompleted);

  useEffect(() => {
    setCompleted(initialCompleted);
  }, [initialCompleted]);

  const total = steps.length;
  const percent = total ? Math.round((completed.length / total) * 100) : 0;

  function gotoStep(i) {
    if (i >= 0 && i < total) setCurrent(i);
  }

  async function save(newCompleted) {
    setCompleted(newCompleted);
    if (typeof onProgressChange === "function") {
      try {
        onProgressChange(newCompleted);
      } catch {}
    }
    try {
      await fetch("https://app.byxbot.com/php/save_course_progress.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ whop_id: whopId, completed_steps: newCompleted })
      });
    } catch {}
  }

  function toggleComplete(idx) {
    const arr = completed.includes(idx)
      ? completed.filter((i) => i !== idx)
      : [...completed, idx];
    save(arr);
  }

  function restart() {
    setCurrent(0);
    save([]);
  }

  if (!steps.length) return <p>No steps.</p>;

  const step = steps[current];

  return (
    <div className="course-viewer">
      <aside className="course-sidebar">
        <div className="course-progress-bar">
          <div className="course-progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <p className="course-progress-text">{percent}% complete</p>
        <ul className="course-steps-list">
          {steps.map((s, i) => (
            <li key={i} className={`course-sidebar-step ${i === current ? "active" : ""}`}> 
              <button onClick={() => gotoStep(i)}>
                <span className="step-index">{i + 1}</span>
                <span className="step-title">{s.title}</span>
                {completed.includes(i) && <span className="step-complete">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="course-content">
        <h4 className="course-step-title">{step.title}</h4>
        {step.file_url || step.video_url ? (
          (step.file_type || "").startsWith("video/") || step.video_url ? (
            <video src={step.file_url || step.video_url} controls className="course-video" />
          ) : step.file_type === "application/pdf" ? (
            <iframe
              src={step.file_url}
              title="Course PDF"
              className="course-pdf"
              frameBorder="0"
            />
          ) : (
            <a href={step.file_url} target="_blank" rel="noopener noreferrer" download>
              Download File
            </a>
          )
        ) : null}
        <p className="course-step-content">{step.content}</p>
        <button type="button" className="course-complete-btn" onClick={() => toggleComplete(current)}>
          {completed.includes(current) ? "Completed" : "Mark Complete"}
        </button>
        <div className="course-controls">
          <button className="course-control-btn" onClick={() => gotoStep(current - 1)} disabled={current === 0}>
            Back
          </button>
          <button className="course-control-btn" onClick={() => gotoStep(current + 1)} disabled={current === total - 1}>
            Next
          </button>
        </div>
        <button className="course-restart-btn" onClick={restart}>
          Restart Course
        </button>
      </div>
    </div>
  );
}
