import React from 'react';

export function Icon({ name, size = 22, fill = false, weight = 400, color, title, style }) {
  return (
    <span
      className="kys-icon"
      aria-hidden={title ? undefined : true}
      title={title}
      style={{ fontSize: size, color, fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'opsz' 24`, ...style }}
    >{name}</span>
  );
}
