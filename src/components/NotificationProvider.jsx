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

  const showNotification = useCallback(({ type = 'info', message = '' }) => {
    const id = nextNotificationId++;
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3500);
  }, []);

  const showConfirm = useCallback((message) => {
    return new Promise((resolve, reject) => {
      setConfirmState({ message, resolve, reject });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState && confirmState.resolve) {
      confirmState.resolve(true);
    }
    setConfirmState(null);
  }, [confirmState]);

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

      {confirmState && (
        <ConfirmModal
          message={confirmState.message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      <div className="notification-container">
        {notifications.map((n) => (
          <Notification key={n.id} type={n.type} message={n.message} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
