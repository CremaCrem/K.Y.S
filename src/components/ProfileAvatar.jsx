import React from 'react';

// Category tile colors: saturated solids that carry white text.
const COLORS = ['email', 'wifi', 'banking', 'games', 'apps', 'social', 'servers', 'work'].map(c => `var(--kys-cat-${c})`);

// A profile's first letter on a color that stays the same for that profile.
const ProfileAvatar = ({ profile, size = 96 }) => {
  const hash = [...profile.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return (
    <div className="flex items-center justify-center text-white font-extrabold select-none flex-shrink-0" style={{
      width: size, height: size, borderRadius: Math.round(size * 0.32), fontSize: Math.round(size * 0.42),
      background: COLORS[hash % COLORS.length],
    }}>
      {profile.name.charAt(0).toUpperCase()}
    </div>
  );
};

export default ProfileAvatar;
