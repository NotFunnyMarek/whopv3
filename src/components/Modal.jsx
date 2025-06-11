// src/components/Modal.jsx

import React from 'react';
import '../styles/modal.scss';

/**
 * Modal ukáže obsah (children) pouze pokud isOpen=true.
 */
export default function Modal({
  isOpen = false,
  onClose = () => {},
  children
}) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
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
