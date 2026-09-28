import * as React from 'react';
/** Inline status message on a tinted container. */
export interface AlertProps {
  tone?: 'danger' | 'warning' | 'success' | 'info';
  icon?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}
export declare function Alert(props: AlertProps): JSX.Element;
