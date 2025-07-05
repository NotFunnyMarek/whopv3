import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

export default function CourseSection({
  isEditing,
  courseSteps,
  handleCourseChange,
  addStep,
  removeStep,
}) {
  const steps = Array.isArray(courseSteps) ? courseSteps : [];
  return (
    <div className="course-section">
      <h2 className="course-section-title">Course</h2>
      {isEditing ? (
        <>
          {steps.map((step, idx) => (
            <div key={step.id} className="course-step-edit">
              <div className="course-step-header">
                <span>Step {idx + 1}</span>
                {steps.length > 1 && (
                  <button
                    type="button"
                    className="course-remove-btn"
                    onClick={() => removeStep(step.id)}
                  >
                    <FaTrash /> Remove
                  </button>
                )}
              </div>
              <input
                type="text"
                className="course-input"
                placeholder="Step title"
                value={step.title}
                onChange={(e) => handleCourseChange(step.id, "title", e.target.value)}
              />
              <textarea
                className="course-textarea"
                rows="3"
                placeholder="Step content"
                value={step.content}
                onChange={(e) => handleCourseChange(step.id, "content", e.target.value)}
              />
            </div>
          ))}
          <button type="button" className="course-add-btn" onClick={addStep}>
            <FaPlus /> Add Step
          </button>
        </>
      ) : (
        <ol className="course-step-list">
          {steps.map((step, idx) => (
            <li key={idx} className="course-step">
              <h3 className="course-step-title">{step.title}</h3>
              <p className="course-step-content">{step.content}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
