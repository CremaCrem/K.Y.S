import * as React from 'react';
/**
 * Pill button. One primary per view.
 * @startingPoint section="Core" subtitle="Pill buttons in brand orange" viewport="700x260"
 */
export interface ButtonProps {
  variant?: 'primary' | 'tonal' | 'outline' | 'ghost' | 'danger';
  size?: 'md' | 'lg' | 'xl';
  /** Material Symbols name shown before the label. */
  icon?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
