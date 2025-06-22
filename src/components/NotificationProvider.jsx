// src/components/NotificationProvider.jsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmModal from './ConfirmModal';
import Notification from './Notification';
import '../styles/notifications.scss';

const NotificationContext = createContext();

let nextNotificationId = 1;

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  // Show a toast notification of a given type ('info', 'success', 'error', etc.) with a message
  const showNotification = useCallback(({ type = 'info', message = '' }) => {
    const id = nextNotificationId++;
    setNotifications(prev => [...prev, { id, type, message }]);
    // Automatically remove the notification after 3.5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3500);
  }, []);

  // Show a confirmation modal with a message; returns a Promise that resolves or rejects
  const showConfirm = useCallback(message => {
    return new Promise((resolve, reject) => {
      setConfirmState({ message, resolve, reject });
    });
  }, []);

  // Handle the "OK" action in the confirmation modal
  const handleConfirm = useCallback(() => {
    if (confirmState && confirmState.resolve) {
      confirmState.resolve(true);
    }
    setConfirmState(null);
  }, [confirmState]);

  // Handle the "Cancel" action in the confirmation modal
  const handleCancel = useCallback(() => {
    if (confirmState && confirmState.reject) {
      confirmState.reject(false);
    }
    setConfirmState(null);
  }, [confirmState]);

  const contextValue = {
    showNotification,
    showConfirm
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      {/* Render the confirmation modal if needed */}
      {confirmState && (
        <ConfirmModal
          message={confirmState.message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {/* Container for toast notifications */}
      <div className="notification-container">
        {notifications.map(n => (
          <Notification key={n.id} type={n.type} message={n.message} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
