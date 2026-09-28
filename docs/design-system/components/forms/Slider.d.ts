import * as React from 'react';
/** Range slider with label and mono value readout. */
export interface SliderProps {
  label?: React.ReactNode;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  showValue?: boolean;
  style?: React.CSSProperties;
}
export declare function Slider(props: SliderProps): JSX.Element;
