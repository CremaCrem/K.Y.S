import * as React from 'react';
/** Labelled native dropdown styled like TextField. */
export interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: Array<string | { value: string; label: string }>;
  placeholder?: string;
  style?: React.CSSProperties;
}
export declare function Select(props: SelectProps): JSX.Element;
