import * as React from 'react';
import { CategoryKey } from './CategoryIcon';
/**
 * One vault entry: tile, name, username, risk flag, copy.
 * @startingPoint section="Vault" subtitle="Vault list row" viewport="700x320"
 */
export interface PasswordRowProps {
  name: string;
  username: string;
  category?: CategoryKey;
  logo?: string;
  brandColor?: string;
  favorite?: boolean;
  /** Short risk reason, e.g. "Weak password" or "Reused on Amazon". Shows a red flag. */
  risk?: string;
  selected?: boolean;
  onClick?: () => void;
  onCopy?: () => void;
}
export declare function PasswordRow(props: PasswordRowProps): JSX.Element;
