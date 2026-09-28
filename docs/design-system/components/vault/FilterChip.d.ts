import * as React from 'react';
/** Single-select filter pill with a colored icon dot. */
export interface FilterChipProps {
  label: string;
  icon?: string;
  /** Dot color — usually a --kys-cat-* var. */
  color?: string;
  selected?: boolean;
  count?: number;
  onClick?: () => void;
}
export declare function FilterChip(props: FilterChipProps): JSX.Element;
