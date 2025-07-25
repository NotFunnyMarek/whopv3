// src/pages/WhopDashboard/manageCourse.js

export default function manageCourse(editCourseSteps, setEditCourseSteps) {
  const addStep = () => {
    const newId =
      editCourseSteps.length > 0
        ? Math.max(...editCourseSteps.map((s) => s.id)) + 1
        : 1;
    setEditCourseSteps((prev) => [
      ...(Array.isArray(prev) ? prev : []),
      { id: newId, title: "", content: "", fileUrl: "", fileType: "", isUploading: false, error: "" },
    ]);
  };

  const removeStep = (id) => {
    if (editCourseSteps.length <= 1) return;
    setEditCourseSteps((prev) =>
      Array.isArray(prev) ? prev.filter((s) => s.id !== id) : []
    );
  };

  const handleCourseChange = (id, field, value) => {
    setEditCourseSteps((prev) =>
      Array.isArray(prev)
        ? prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
        : []
    );
  };

  return { addStep, removeStep, handleCourseChange };
}
