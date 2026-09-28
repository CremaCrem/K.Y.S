import * as React from 'react';
/** Labelled single-line input. */
export interface TextFieldProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'url';
  /** Use Roboto Mono (for passwords, keys). */
  mono?: boolean;
  leading?: React.ReactNode;
  /** Slot for an IconButton (e.g. reveal). */
  trailing?: React.ReactNode;
  hint?: string;
  style?: React.CSSProperties;
}
export declare function TextField(props: TextFieldProps): JSX.Element;
