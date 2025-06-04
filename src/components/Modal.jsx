import React from 'react';
import PropTypes from 'prop-types';
import '../styles/modal.scss';

/**
 * Modal – jednoduchá wrapper‐komponenta, která vykreslí velký overlay,
 * a ve středu zobrazí obsah (children).
 *
 * Props:
 * - isOpen: boolean – zda je modal viditelný či skrytý.
 * - onClose: funkce – volá se, když uživatel klikne mimo obsah modalu (na overlay).
 * - children: ReactNode – obsah modalu (např. formulář).
 */
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  // Kliknutí na overlay (ale ne na „content“) spustí onClose
  const handleOverlayClick = (e) => {
    // Jestliže kliknuto přímo na overlay (nikoli na potomka .modal__content)
    if (e.target.classList.contains('modal__overlay')) {
      onClose();
    }
  };

  return (
    <div className="modal__overlay" onClick={handleOverlayClick}>
      <div className="modal__content">
        <button className="modal__close-btn" onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node
};

Modal.defaultProps = {
  children: null
};

export default Modal;
