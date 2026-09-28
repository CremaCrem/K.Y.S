import React from 'react';
import { Icon } from '../core/Icon.jsx';

function BarButton({ icon, title, onClick }) {
  return (
    <button type="button" title={title} aria-label={title} onClick={onClick} className="kys-press"
      style={{ width: 40, height: 40, border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--kys-radius-sm)' }}>
      <Icon name={icon} size={22} />
    </button>
  );
}

export function TitleBar({ language = 'English', dark = false, onLock, onToggleTheme, onSecurity, windowControls = true }) {
  return (
    <div style={{ height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px 0 18px', background: 'var(--kys-primary)', color: '#fff' }}>
      <span style={{ fontFamily: 'var(--kys-font-wordmark)', fontWeight: 800, fontSize: 20 }}>K</span>
      <span style={{ flex: 1 }} />
      <BarButton icon="shield" title="Security" onClick={onSecurity} />
      <BarButton icon="lock" title="Lock vault" onClick={onLock} />
      <BarButton icon={dark ? 'light_mode' : 'dark_mode'} title="Toggle theme" onClick={onToggleTheme} />
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 10px', fontSize: 15, fontWeight: 500 }}>
        {language}<Icon name="expand_more" size={18} />
      </span>
      {windowControls && <>
        <span style={{ width: 12 }} />
        <BarButton icon="remove" title="Minimize" />
        <BarButton icon="open_in_full" title="Maximize" />
        <BarButton icon="close" title="Close" />
      </>}
    </div>
  );
}
