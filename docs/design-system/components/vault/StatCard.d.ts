import * as React from 'react';
/** Big-number vault health metric. */
export interface StatCardProps {
  value: number | string;
  label: string;
  tone?: 'primary' | 'danger' | 'warning' | 'success' | 'neutral';
  /** Makes it a filter shortcut. */
  onClick?: () => void;
}
export declare function StatCard(props: StatCardProps): JSX.Element;
