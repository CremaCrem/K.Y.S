import * as React from 'react';
/** Orange desktop window bar: K mark, security/lock/theme, language, window controls. */
export interface TitleBarProps {
  language?: string;
  dark?: boolean;
  onLock?: () => void;
  onToggleTheme?: () => void;
  onSecurity?: () => void;
  windowControls?: boolean;
}
export declare function TitleBar(props: TitleBarProps): JSX.Element;
