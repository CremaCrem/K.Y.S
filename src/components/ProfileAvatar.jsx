import React from 'react';

const COLORS = ['bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500', 'bg-indigo-500'];

// A profile's first letter on a color that stays the same for that profile.
const ProfileAvatar = ({ profile, className = 'w-24 h-24 text-4xl rounded-2xl' }) => {
  const hash = [...profile.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return (
    <div className={`${COLORS[hash % COLORS.length]} ${className} flex items-center justify-center text-white font-bold select-none`}>
      {profile.name.charAt(0).toUpperCase()}
    </div>
  );
};

export default ProfileAvatar;
