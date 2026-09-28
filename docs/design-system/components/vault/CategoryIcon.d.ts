import * as React from 'react';
export type CategoryKey = 'games' | 'email' | 'web' | 'apps' | 'banking' | 'wifi' | 'social' | 'shopping' | 'streaming' | 'work' | 'dev' | 'servers' | 'apikeys' | 'licenses' | 'crypto' | 'identity' | 'smarthome' | 'recovery' | 'other';
export declare const CATEGORIES: Record<CategoryKey, { label: string; icon: string; color: string }>;
/**
 * Solid colored tile with white glyph or brand logo. The item avatar everywhere.
 * @startingPoint section="Vault" subtitle="Category tiles — 19 colors + icons" viewport="700x300"
 */
export interface CategoryIconProps {
  category?: CategoryKey;
  size?: number;
  /** Simple Icons slug (e.g. "github"). Overrides the category glyph. */
  logo?: string;
  /** Brand hex to use instead of the category color when a logo is shown. */
  brandColor?: string;
  shape?: 'rounded' | 'circle';
  style?: React.CSSProperties;
}
export declare function CategoryIcon(props: CategoryIconProps): JSX.Element;
