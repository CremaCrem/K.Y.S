import React from 'react';
import { Icon } from '../core/Icon.jsx';

export const CATEGORIES = {
  games: { label: 'Games', icon: 'sports_esports', color: 'var(--kys-cat-games)' },
  email: { label: 'Email', icon: 'mail', color: 'var(--kys-cat-email)' },
  web: { label: 'Web', icon: 'language', color: 'var(--kys-cat-web)' },
  apps: { label: 'Apps', icon: 'desktop_windows', color: 'var(--kys-cat-apps)' },
  banking: { label: 'Banking', icon: 'account_balance', color: 'var(--kys-cat-banking)' },
  wifi: { label: 'Wi‑Fi', icon: 'wifi', color: 'var(--kys-cat-wifi)' },
  social: { label: 'Social', icon: 'forum', color: 'var(--kys-cat-social)' },
  shopping: { label: 'Shopping', icon: 'shopping_bag', color: 'var(--kys-cat-shopping)' },
  streaming: { label: 'Streaming', icon: 'smart_display', color: 'var(--kys-cat-streaming)' },
  work: { label: 'Work', icon: 'work', color: 'var(--kys-cat-work)' },
  dev: { label: 'Dev tools', icon: 'terminal', color: 'var(--kys-cat-dev)' },
  servers: { label: 'Servers & SSH', icon: 'dns', color: 'var(--kys-cat-servers)' },
  apikeys: { label: 'API keys', icon: 'key', color: 'var(--kys-cat-apikeys)' },
  licenses: { label: 'Licenses', icon: 'license', color: 'var(--kys-cat-licenses)' },
  crypto: { label: 'Crypto', icon: 'currency_bitcoin', color: 'var(--kys-cat-crypto)' },
  identity: { label: 'Identity', icon: 'badge', color: 'var(--kys-cat-identity)' },
  smarthome: { label: 'Smart home', icon: 'home', color: 'var(--kys-cat-smarthome)' },
  recovery: { label: 'Recovery codes', icon: 'lock_reset', color: 'var(--kys-cat-recovery)' },
  other: { label: 'Other', icon: 'category', color: 'var(--kys-cat-other)' },
};

export function CategoryIcon({ category = 'other', size = 44, logo, brandColor, shape = 'rounded', style }) {
  const c = CATEGORIES[category] || CATEGORIES.other;
  const glyph = Math.round(size * 0.5);
  return (
    <span style={{
      width: size, height: size, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: shape === 'circle' ? '50%' : Math.round(size * 0.32), background: brandColor || c.color, color: '#fff', ...style,
    }}>
      {logo
        ? <span style={{ width: glyph, height: glyph, background: `url(https://cdn.simpleicons.org/${logo}/ffffff) center/contain no-repeat` }} />
        : <Icon name={c.icon} size={glyph} fill />}
    </span>
  );
}
