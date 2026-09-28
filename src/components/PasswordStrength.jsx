import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { passwordStrength } from '../utils/passwordStrength.mjs';

const STYLES = {
  weak: { color: 'text-red-500', bgColor: 'bg-red-500', width: '25%' },
  fair: { color: 'text-orange-500', bgColor: 'bg-orange-500', width: '50%' },
  good: { color: 'text-yellow-500', bgColor: 'bg-yellow-500', width: '75%' },
  strong: { color: 'text-green-500', bgColor: 'bg-green-500', width: '100%' },
};

const PasswordStrength = ({ password }) => {
  const { t } = useLanguage();
  const strength = passwordStrength(password);
  const analysis = { strength, ...STYLES[strength] };

  if (!password || !analysis) return null;

  const strengthLabels = {
    weak: t('weak') || 'Weak',
    fair: t('fair') || 'Fair',
    good: t('good') || 'Good',
    strong: t('strong') || 'Strong',
  };

  return (
    <div className="mt-2 space-y-1">
      {/* Progress Bar */}
      <div className="h-1.5 bg-border-color/30 rounded-full overflow-hidden">
        <div 
          className={`h-full ${analysis.bgColor} transition-all duration-300 rounded-full`}
          style={{ width: analysis.width }}
        />
      </div>
      
      {/* Label */}
      <div className="flex justify-between items-center text-xs">
        <span className={`font-medium ${analysis.color}`}>
          {strengthLabels[analysis.strength]}
        </span>
        <span className="text-text-secondary">
          {password.length} chars
        </span>
      </div>
    </div>
  );
};

export default PasswordStrength;
