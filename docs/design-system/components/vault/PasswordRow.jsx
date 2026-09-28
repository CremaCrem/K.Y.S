import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { IconButton } from '../core/IconButton.jsx';
import { CategoryIcon } from './CategoryIcon.jsx';

export function PasswordRow({ name, username, category, logo, brandColor, favorite = false, risk, selected = false, onClick, onCopy }) {
  return (
    <div onClick={onClick} className={selected ? undefined : 'kys-row'} style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '12px 10px 12px 14px', borderRadius: 'var(--kys-radius-md)', cursor: 'pointer',
      background: selected ? 'var(--kys-state-selected)' : 'transparent', transition: 'background-color var(--kys-dur-fast)',
    }}>
      <CategoryIcon category={category} logo={logo} brandColor={brandColor} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16, fontWeight: 500, color: 'var(--kys-text)' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
          {favorite && <Icon name="star" size={16} fill color="var(--kys-favorite)" />}
        </div>
        <div style={{ fontSize: 14, color: 'var(--kys-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</div>
      </div>
      {risk && <Icon name="error" size={20} fill color="var(--kys-danger)" title={risk} />}
      <IconButton icon="content_copy" title="Copy password" onClick={e => { e.stopPropagation(); onCopy && onCopy(); }} />
    </div>
  );
}
