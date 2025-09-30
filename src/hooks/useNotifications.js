import { useState, useCallback, useRef } from 'react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const audioRef = useRef(null);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const playSound = (type) => {
    if (audioRef.current) {
      audioRef.current.src = type === 'success' ? '/sounds/success.mp3' : '/sounds/error.mp3';
      audioRef.current.play().catch(() => {
        // Игнорируем ошибки воспроизведения
      });
    }
  };

  const showNotification = useCallback((message, type = 'success', options = {}) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      duration: options.duration || 3000,
      sound: options.sound !== false
    };

    setNotifications(prev => [...prev, notification]);

    if (notification.sound) {
      playSound(type);
    }

    if (notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }

    return id;
  }, [removeNotification]); // Добавили недостающую зависимость

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const checkPushSupport = useCallback(() => {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }, []);

  const requestPushPermission = useCallback(async () => {
    if (!checkPushSupport()) {
      throw new Error('Push-уведомления не поддерживаются');
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, [checkPushSupport]);

  const showPushNotification = useCallback(async (title, options = {}) => {
    if (!checkPushSupport()) {
      console.warn('Push-уведомления не поддерживаются');
      return;
    }

    if (Notification.permission !== 'granted') {
      const granted = await requestPushPermission();
      if (!granted) return;
    }

    const notification = new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }, [checkPushSupport, requestPushPermission]);

  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
    showPushNotification,
    requestPushPermission,
    checkPushSupport,
    audioRef
  };
};