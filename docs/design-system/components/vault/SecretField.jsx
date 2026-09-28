import React, { useState } from 'react';
import { IconButton } from '../core/IconButton.jsx';

export function SecretField({ label, value = '', secret = false, onCopy }) {
  const [shown, setShown] = useState(false);
  const masked = secret && !shown;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '10px 6px 10px 16px', borderRadius: 'var(--kys-radius-md)', background: 'var(--kys-surface-sunken)', border: '1px solid var(--kys-border)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: 'var(--kys-text-muted)' }}>{label}</div>
        <div style={{ fontFamily: secret ? 'var(--kys-font-mono)' : 'var(--kys-font-sans)', fontSize: 15, color: 'var(--kys-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {masked ? '•'.repeat(12) : value}
        </div>
      </div>
      {secret && <IconButton icon={shown ? 'visibility_off' : 'visibility'} title={shown ? 'Hide' : 'Show'} onClick={() => setShown(!shown)} />}
      <IconButton icon="content_copy" title={`Copy ${(label || '').toLowerCase()}`} onClick={() => onCopy && onCopy(value)} />
    </div>
  );
}
