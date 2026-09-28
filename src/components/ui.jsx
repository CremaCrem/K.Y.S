import React from 'react';
import { useLanguage } from '../context/LanguageContext';

// The K.Y.S design system primitives (docs/design-system/components/), styled
// with the --kys-* tokens from index.css. Icons are Material Symbols names.

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

const BUTTON_VARIANTS = {
  primary: { background: 'var(--kys-primary)', color: 'var(--kys-on-primary)', border: 'none', boxShadow: 'var(--kys-shadow-primary)' },
  tonal: { background: 'var(--kys-primary-container)', color: 'var(--kys-on-primary-container)', border: 'none' },
  outline: { background: 'transparent', color: 'var(--kys-text)', border: '1px solid var(--kys-border-strong)' },
  ghost: { background: 'transparent', color: 'var(--kys-primary-text)', border: 'none' },
  danger: { background: 'transparent', color: 'var(--kys-danger)', border: '1px solid var(--kys-border-strong)' },
};
const BUTTON_SIZES = {
  md: { height: 40, padding: 18, fontSize: 14, icon: 18 },
  lg: { height: 48, padding: 22, fontSize: 15, icon: 20 },
  xl: { height: 52, padding: 28, fontSize: 17, icon: 22 },
};

export function Button({ variant = 'primary', size = 'md', icon, fullWidth = false, disabled = false, type = 'button', onClick, title, children, style }) {
  const s = BUTTON_SIZES[size];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={variant === 'ghost' ? 'kys-ghost' : 'kys-press'}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 0,
        height: s.height, padding: `0 ${s.padding}px 0 ${icon ? s.padding - 4 : s.padding}px`,
        width: fullWidth ? '100%' : undefined,
        borderRadius: 'var(--kys-radius-full)', fontSize: s.fontSize, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1, whiteSpace: 'nowrap',
        ...BUTTON_VARIANTS[variant], ...(disabled ? { boxShadow: 'none' } : null), ...style,
      }}
    >
      {icon && <Icon name={icon} size={s.icon} />}
      {children}
    </button>
  );
}

const ICON_BUTTON_VARIANTS = {
  standard: { background: 'transparent', color: 'var(--kys-text-muted)', border: 'none' },
  filled: { background: 'var(--kys-primary)', color: 'var(--kys-on-primary)', border: 'none' },
  tonal: { background: 'var(--kys-surface-muted)', color: 'var(--kys-text)', border: 'none' },
  outline: { background: 'transparent', color: 'var(--kys-text-muted)', border: '1px solid var(--kys-border-strong)' },
};

export function IconButton({ icon, variant = 'standard', size = 40, shape = 'circle', fill = false, color, title, onClick, disabled = false, style }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={variant === 'standard' || variant === 'outline' ? 'kys-ghost' : 'kys-press'}
      style={{
        width: size, height: size, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: shape === 'circle' ? '50%' : 'var(--kys-radius-sm)', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1, padding: 0, ...ICON_BUTTON_VARIANTS[variant], ...(color ? { color } : null), ...style,
      }}
    >
      <Icon name={icon} size={Math.round(size * 0.5)} fill={fill} />
    </button>
  );
}

const fieldLabel = { fontSize: 15, fontWeight: 600, color: 'var(--kys-text)' };
const fieldBox = { borderRadius: 'var(--kys-radius-md)', background: 'var(--kys-surface)', border: '1px solid var(--kys-border-strong)' };
const bareInput = { flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: 'var(--kys-text)', fontSize: 16 };

// Extra props (autoFocus, required, maxLength, onBlur...) go to the <input>.
export function TextField({ label, value, onChange, placeholder, type = 'text', mono = false, trailing, hint, style, inputStyle, ...inputProps }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, ...style }}>
      {label && <span style={fieldLabel}>{label}</span>}
      <span className="kys-field" style={{ display: 'flex', alignItems: 'center', gap: 4, height: 52, padding: `0 ${trailing ? 6 : 16}px 0 16px`, ...fieldBox }}>
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{ ...bareInput, fontFamily: mono ? 'var(--kys-font-mono)' : 'var(--kys-font-sans)', ...inputStyle }}
          {...inputProps}
        />
        {trailing}
      </span>
      {hint && <span style={{ fontSize: 13, color: 'var(--kys-text-muted)' }}>{hint}</span>}
    </label>
  );
}

export function TextArea({ label, value, onChange, placeholder, rows = 3, autoFocus }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && <span style={fieldLabel}>{label}</span>}
      <span className="kys-field" style={{ display: 'flex', ...fieldBox }}>
        <textarea
          value={value} onChange={onChange} placeholder={placeholder} rows={rows} autoFocus={autoFocus}
          style={{ ...bareInput, resize: 'vertical', padding: 14, lineHeight: 1.4 }}
        />
      </span>
    </label>
  );
}

export function SearchField({ value, onChange, onClear, placeholder, style }) {
  const { t } = useLanguage();
  return (
    <div className="kys-field" style={{
      display: 'flex', alignItems: 'center', gap: 12, height: 48, padding: '0 6px 0 18px', borderRadius: 'var(--kys-radius-full)',
      background: 'var(--kys-surface-muted)', border: '1px solid transparent', minWidth: 0, ...style,
    }}>
      <Icon name="search" color="var(--kys-text-muted)" />
      <input value={value} onChange={onChange} placeholder={placeholder} aria-label={placeholder} style={bareInput} />
      {value ? <IconButton icon="close" size={36} title={t('clearSearch')} onClick={onClear} /> : null}
    </div>
  );
}

// `placeholder={null}` leaves out the empty first option.
export function Select({ label, value, onChange, options, placeholder = '--', style }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, ...style }}>
      {label && <span style={fieldLabel}>{label}</span>}
      <span className="kys-field" style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 52, ...fieldBox }}>
        <select value={value} onChange={onChange}
          style={{ ...bareInput, appearance: 'none', WebkitAppearance: 'none', width: '100%', height: '100%', padding: '0 40px 0 16px', cursor: 'pointer' }}>
          {placeholder !== null && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Icon name="expand_more" size={20} color="var(--kys-text-muted)" style={{ position: 'absolute', right: 12, pointerEvents: 'none' }} />
      </span>
    </label>
  );
}

export function Checkbox({ checked = false, onChange, disabled = false, children }) {
  return (
    <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'flex-start', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, fontSize: 14, color: 'var(--kys-text-muted)' }}>
      <input type="checkbox" className="kys-check" checked={checked} disabled={disabled} onChange={e => onChange(e.target.checked)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      <span style={{ width: 20, height: 20, flexShrink: 0, borderRadius: 'var(--kys-radius-xs)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: checked ? 'var(--kys-primary)' : 'var(--kys-surface)', border: checked ? 'none' : '1.5px solid var(--kys-border-strong)',
        color: '#fff', transition: 'background-color var(--kys-dur-fast)' }}>
        {checked && <Icon name="check" size={16} weight={600} />}
      </span>
      <span>{children}</span>
    </label>
  );
}

export function Slider({ label, value, min, max, onChange }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--kys-text-muted)' }}>
      {label}
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: 180, accentColor: 'var(--kys-primary)', cursor: 'pointer' }} />
      <span style={{ fontFamily: 'var(--kys-font-mono)', fontSize: 14, color: 'var(--kys-text)', minWidth: 24 }}>{value}</span>
    </label>
  );
}

// `value` is what's stored in the vault, so existing entries keep their category.
// `label` is a translation key.
export const CATEGORIES = [
  { value: 'Games', label: 'games', icon: 'sports_esports', color: 'var(--kys-cat-games)' },
  { value: 'Email', label: 'email', icon: 'mail', color: 'var(--kys-cat-email)' },
  { value: 'Web', label: 'web', icon: 'language', color: 'var(--kys-cat-web)' },
  { value: 'Apps', label: 'apps', icon: 'desktop_windows', color: 'var(--kys-cat-apps)' },
  { value: 'Bank', label: 'bank', icon: 'account_balance', color: 'var(--kys-cat-banking)' },
  { value: 'WiFi', label: 'wifi', icon: 'wifi', color: 'var(--kys-cat-wifi)' },
  { value: 'Socials', label: 'socials', icon: 'forum', color: 'var(--kys-cat-social)' },
  { value: 'Shopping', label: 'shopping', icon: 'shopping_bag', color: 'var(--kys-cat-shopping)' },
  { value: 'Entertainment', label: 'entertainment', icon: 'smart_display', color: 'var(--kys-cat-streaming)' },
  { value: 'Work', label: 'work', icon: 'work', color: 'var(--kys-cat-work)' },
  { value: 'Dev', label: 'devTools', icon: 'terminal', color: 'var(--kys-cat-dev)' },
  { value: 'Servers', label: 'servers', icon: 'dns', color: 'var(--kys-cat-servers)' },
  { value: 'ApiKeys', label: 'apiKeys', icon: 'key', color: 'var(--kys-cat-apikeys)' },
  { value: 'Licenses', label: 'licenses', icon: 'license', color: 'var(--kys-cat-licenses)' },
  { value: 'Crypto', label: 'crypto', icon: 'currency_bitcoin', color: 'var(--kys-cat-crypto)' },
  { value: 'Identity', label: 'identity', icon: 'badge', color: 'var(--kys-cat-identity)' },
  { value: 'SmartHome', label: 'smartHome', icon: 'home', color: 'var(--kys-cat-smarthome)' },
  { value: 'RecoveryCodes', label: 'recoveryCodes', icon: 'lock_reset', color: 'var(--kys-cat-recovery)' },
  { value: 'Other', label: 'other', icon: 'category', color: 'var(--kys-cat-other)' },
];
const OTHER = CATEGORIES[CATEGORIES.length - 1];
export const categoryOf = (value) => CATEGORIES.find(c => c.value === value) || OTHER;

export function CategoryIcon({ category, size = 44 }) {
  const c = categoryOf(category);
  return (
    <span style={{
      width: size, height: size, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: Math.round(size * 0.32), background: c.color, color: '#fff',
    }}>
      <Icon name={c.icon} size={Math.round(size * 0.5)} fill />
    </span>
  );
}

export function FilterChip({ label, icon, color = 'var(--kys-neutral-700)', selected = false, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className="kys-press" style={{
      height: 36, padding: icon ? '0 14px 0 5px' : '0 14px', borderRadius: 'var(--kys-radius-full)', border: 'none', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap',
      background: selected ? 'var(--kys-primary)' : 'var(--kys-surface-muted)', color: selected ? 'var(--kys-on-primary)' : 'var(--kys-text)',
    }}>
      {icon && (
        <span style={{ width: 26, height: 26, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: selected ? 'rgba(255,255,255,0.25)' : color, color: '#fff' }}>
          <Icon name={icon} size={16} fill />
        </span>
      )}
      {label}
    </button>
  );
}

export const ISSUE_LABELS = { weak: 'weak', reused: 'reusedBadge', old: 'oldBadge' };

export function PasswordRow({ name, username, category, favorite, issues, selected, onClick, onCopy }) {
  const { t } = useLanguage();
  return (
    <div
      role="button" tabIndex={0} aria-current={selected || undefined}
      onClick={onClick}
      onKeyDown={e => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}
      className={selected ? undefined : 'kys-row'}
      style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '12px 10px 12px 14px', borderRadius: 'var(--kys-radius-md)', cursor: 'pointer',
        background: selected ? 'var(--kys-state-selected)' : 'transparent',
      }}
    >
      <CategoryIcon category={category} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16, fontWeight: 500, color: 'var(--kys-text)' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
          {favorite && <Icon name="star" size={16} fill color="var(--kys-favorite)" />}
        </div>
        <div style={{ fontSize: 14, color: 'var(--kys-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</div>
      </div>
      {issues?.length > 0 && <Icon name="error" size={20} fill color="var(--kys-danger)" title={issues.map(i => t(ISSUE_LABELS[i])).join(' · ')} />}
      <IconButton icon="content_copy" title={t('copyPassword')} onClick={e => { e.stopPropagation(); onCopy(); }} />
    </div>
  );
}

// Controlled: the parent fetches a secret only when it's revealed.
export function SecretField({ label, value, secret = false, shown = false, onToggle, onCopy, multiline = false }) {
  const { t } = useLanguage();
  const masked = secret && !shown;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '10px 6px 10px 16px', borderRadius: 'var(--kys-radius-md)', background: 'var(--kys-surface-sunken)', border: '1px solid var(--kys-border)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: 'var(--kys-text-muted)' }}>{label}</div>
        <div style={{
          fontFamily: secret ? 'var(--kys-font-mono)' : 'var(--kys-font-sans)', fontSize: 15, color: 'var(--kys-text)',
          ...(multiline ? { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: '2px 10px 2px 0' } : { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
        }}>
          {masked ? '•'.repeat(12) : value}
        </div>
      </div>
      {secret && <IconButton icon={shown ? 'visibility_off' : 'visibility'} title={t(shown ? 'hide' : 'show')} onClick={onToggle} />}
      {onCopy && <IconButton icon="content_copy" title={t('copy')} onClick={onCopy} />}
    </div>
  );
}

const STAT_TONES = { primary: 'var(--kys-primary)', danger: 'var(--kys-danger)', warning: 'var(--kys-cat-games)', neutral: 'var(--kys-text)' };

export function StatCard({ value, label, tone = 'primary', selected = false, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className="kys-press" style={{
      flex: 1, minWidth: 0, padding: '12px 16px', borderRadius: 'var(--kys-radius-lg)', background: 'var(--kys-surface-muted)', border: 'none',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer',
      boxShadow: selected ? 'inset 0 0 0 2px var(--kys-primary)' : 'none',
    }}>
      <span style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, color: STAT_TONES[tone] }}>{value}</span>
      <span style={{ fontSize: 13, color: 'var(--kys-text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}

export function NavRail({ items, active, onChange, footer }) {
  return (
    <nav style={{ width: 84, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0' }}>
      {items.map(it => <NavItem key={it.id} {...it} active={it.id === active} onClick={() => onChange(it.id)} />)}
      {footer && <div style={{ marginTop: 'auto' }}>{footer}</div>}
    </nav>
  );
}

export function NavItem({ label, icon, active = false, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-current={active ? 'page' : undefined}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, borderRadius: 'var(--kys-radius-md)' }}>
      <span className={active ? undefined : 'kys-ghost'} style={{ width: 56, height: 32, borderRadius: 'var(--kys-radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'var(--kys-primary)' : 'transparent', color: active ? 'var(--kys-on-primary)' : 'var(--kys-text-muted)' }}>
        <Icon name={icon} fill={active} />
      </span>
      <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? 'var(--kys-text)' : 'var(--kys-text-muted)' }}>{label}</span>
    </button>
  );
}

export function Toast({ message }) {
  return (
    <div role="status" className="kys-fade-in" style={{
      position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', zIndex: 60,
      display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderRadius: 'var(--kys-radius-sm)',
      background: 'var(--kys-neutral-800)', color: '#fff', fontSize: 14, boxShadow: 'var(--kys-shadow-3)',
    }}>
      <Icon name="check_circle" size={18} fill color="var(--kys-orange-300)" />{message}
    </div>
  );
}

const ALERT_TONES = {
  danger: ['var(--kys-danger-container)', 'var(--kys-on-danger-container)', 'error'],
  warning: ['var(--kys-warning-container)', 'var(--kys-on-warning-container)', 'warning'],
  success: ['var(--kys-success-container)', 'var(--kys-on-success-container)', 'check_circle'],
  info: ['var(--kys-info-container)', 'var(--kys-on-info-container)', 'info'],
};

export function Alert({ tone = 'danger', icon, children, action }) {
  const [bg, fg, defaultIcon] = ALERT_TONES[tone];
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 'var(--kys-radius-md)', background: bg, color: fg, fontSize: 14, fontWeight: 500 }}>
      <Icon name={icon || defaultIcon} size={20} fill style={{ alignSelf: 'flex-start', marginTop: 1 }} />
      <div style={{ flex: 1 }}>{children}</div>
      {action}
    </div>
  );
}

// "K.Y.S" in Montserrat 800 with the tagline. The only brand mark (no logo file).
export function Wordmark({ large = false, center = false }) {
  const { t } = useLanguage();
  return (
    <div style={{ textAlign: center ? 'center' : undefined }}>
      <div style={{ fontFamily: 'var(--kys-font-wordmark)', fontWeight: 800, fontSize: large ? 40 : 26, lineHeight: 1.1, color: 'var(--kys-text)' }}>{t('appName')}</div>
      <div style={{ fontSize: large ? 16 : 13, fontWeight: large ? 500 : 400, color: 'var(--kys-text-muted)' }}>{t('tagline')}</div>
    </div>
  );
}

// White card for forms (lock screen, add password): radius 24, shadow-1.
export function Card({ as: Tag = 'div', children, className = '', style, ...props }) {
  return (
    <Tag className={`bg-surface rounded-kys-xl shadow-kys-1 ${className}`} style={{ padding: 32, ...style }} {...props}>
      {children}
    </Tag>
  );
}
