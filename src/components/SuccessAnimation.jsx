import React, { useEffect } from 'react';

const SuccessAnimation = ({ show, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative">
        {/* Circle SVG with draw animation */}
        <svg 
          className="w-32 h-32" 
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(var(--button), 0.2)"
            strokeWidth="4"
          />
          {/* Animated circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(var(--button))"
            strokeWidth="4"
            strokeLinecap="round"
            className="animate-draw-circle"
            style={{
              strokeDasharray: '283',
              strokeDashoffset: '283',
            }}
          />
          {/* Checkmark */}
          <path
            d="M30 50 L45 65 L70 35"
            fill="none"
            stroke="rgba(var(--button))"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-draw-check"
            style={{
              strokeDasharray: '60',
              strokeDashoffset: '60',
            }}
          />
        </svg>
      </div>
    </div>
  );
};

export default SuccessAnimation;
