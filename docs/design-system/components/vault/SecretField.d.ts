import * as React from 'react';
/** Read-only copyable field; masks + reveal toggle when secret. */
export interface SecretFieldProps {
  label: string;
  value: string;
  /** Mask with bullets, render in mono, add reveal toggle. */
  secret?: boolean;
  onCopy?: (value: string) => void;
}
export declare function SecretField(props: SecretFieldProps): JSX.Element;
