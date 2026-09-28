import * as React from 'react';
/** Material Symbols Rounded glyph. */
export interface IconProps {
  /** Material Symbols ligature name, e.g. "content_copy". */
  name: string;
  size?: number;
  fill?: boolean;
  weight?: 300 | 400 | 500 | 600;
  color?: string;
  title?: string;
  style?: React.CSSProperties;
}
export declare function Icon(props: IconProps): JSX.Element;
