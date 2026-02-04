import React, { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

const PasswordStrength = ({ password }) => {
  const { t } = useLanguage();

  const analysis = useMemo(() => {
    if (!password) return null;

    let score = 0;
    const checks = {
      length: password.length >= 12,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (checks.lowercase) score += 1;
    if (checks.uppercase) score += 1;
    if (checks.numbers) score += 1;
    if (checks.special) score += 2;

    let strength, color, bgColor, width;
    if (score <= 2) {
      strength = 'weak';
      color = 'text-red-500';
      bgColor = 'bg-red-500';
      width = '25%';
    } else if (score <= 4) {
      strength = 'fair';
      color = 'text-orange-500';
      bgColor = 'bg-orange-500';
      width = '50%';
    } else if (score <= 6) {
      strength = 'good';
      color = 'text-yellow-500';
      bgColor = 'bg-yellow-500';
      width = '75%';
    } else {
      strength = 'strong';
      color = 'text-green-500';
      bgColor = 'bg-green-500';
      width = '100%';
    }

    return { score, strength, color, bgColor, width, checks };
  }, [password]);

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
