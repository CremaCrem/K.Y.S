import * as React from 'react';
/** Vertical primary navigation. 3–4 destinations max. */
export interface NavRailItem { id: string; label: string; icon: string; }
export interface NavRailProps {
  items: NavRailItem[];
  active?: string;
  onChange?: (id: string) => void;
  footer?: React.ReactNode;
}
export declare function NavRail(props: NavRailProps): JSX.Element;
