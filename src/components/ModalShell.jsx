import React from 'react';
import { FaTimes } from 'react-icons/fa';

// Backdrop, card, title, and close button shared by the app's dialogs.
const ModalShell = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
    <div className="relative bg-card-bg rounded-2xl shadow-strong w-full max-w-md p-6 animate-fade-in max-h-[90vh] overflow-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-text-color">{title}</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface transition-colors"
        >
          <FaTimes size={16} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export const primaryButton = 'w-full h-10 bg-button text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50';
export const secondaryButton = 'w-full h-10 bg-surface text-text-color rounded-xl font-medium text-sm hover:bg-border-color transition-colors disabled:opacity-50';

export default ModalShell;
