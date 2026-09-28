import * as React from 'react';
/** Pill search bar for the vault. */
export interface SearchFieldProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Shows a clear (×) button when value is non-empty. */
  onClear?: () => void;
  placeholder?: string;
  style?: React.CSSProperties;
}
export declare function SearchField(props: SearchFieldProps): JSX.Element;
