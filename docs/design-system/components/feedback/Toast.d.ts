import * as React from 'react';
/** Transient confirmation. Position it yourself (bottom-center, 24px). */
export interface ToastProps {
  message: React.ReactNode;
  icon?: string;
  style?: React.CSSProperties;
}
export declare function Toast(props: ToastProps): JSX.Element;
