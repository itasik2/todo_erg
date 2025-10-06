import { useState, useCallback } from 'react';

// Простые звуки с использованием Web Audio API
const createBeepSound = (frequency, duration) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (error) {
    console.log('Web Audio API не поддерживается');
  }
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const playSound = useCallback((type = 'success') => {
    if (type === 'success') {
      createBeepSound(800, 200);
      setTimeout(() => createBeepSound(1000, 200), 100);
    } else if (type === 'error') {
      createBeepSound(400, 300);
      setTimeout(() => createBeepSound(300, 300), 150);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showNotification = useCallback((message, type = 'success', duration = 5000) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      message,
      type,
      timestamp: new Date(),
    };

    setNotifications(prev => [...prev, newNotification]);

    // Воспроизводим звук
    playSound(type);

    // Автоматическое удаление уведомления
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, [playSound, removeNotification]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
  };
};
