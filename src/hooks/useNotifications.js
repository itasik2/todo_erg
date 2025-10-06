import { useState, useRef, useCallback } from 'react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const audioRef = useRef(null);

  // Функция для воспроизведения звука
  const playSound = useCallback((type = 'success') => {
    try {
      // Создаем звук программно вместо использования файлов
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'success') {
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      } else if (type === 'error') {
        oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime); // G4
        oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime + 0.1); // F4
        oscillator.frequency.setValueAtTime(293.66, audioContext.currentTime + 0.2); // D4
      }
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Аудио недоступно:', error);
    }
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

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
    audioRef,
  };
};
