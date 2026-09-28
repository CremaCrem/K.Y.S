import * as React from 'react';
/** Icon-only button. Always pass a title for accessibility. */
export interface IconButtonProps {
  icon: string;
  variant?: 'standard' | 'filled' | 'tonal' | 'outline';
  /** Pixel size of the square hit area. Min 40 for touch. */
  size?: number;
  shape?: 'circle' | 'square';
  fill?: boolean;
  color?: string;
  title?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
