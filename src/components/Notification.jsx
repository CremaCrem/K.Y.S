import React, { useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const Notification = ({ message, duration = 3000, onHide }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onHide();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onHide]);

  return (
    <div className="fixed inset-0 flex items-start mt-10 justify-center z-50 pointer-events-none">
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
        <FaCheckCircle className="text-white" />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Notification;
