// src/components/Modal.jsx

import React from 'react';
import '../styles/modal.scss';

/**
 * Modal displays its children only when isOpen is true.
 */
export default function Modal({
  isOpen = false,
  onClose = () => {},
  children
}) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // Close the modal if the backdrop itself is clicked
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
