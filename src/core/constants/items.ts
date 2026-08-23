import { GEN4_ITEM_NAMES } from './items.generated';

/** Exact Generation IV game-index names used by PK4 held-item fields. */
export const ITEMS: Record<number, string> = GEN4_ITEM_NAMES;

/** Look up an item name by Gen IV game index. */
export function getItemName(id: number): string {
  if (id === 0) return '---';
  return ITEMS[id] ?? `Item #${id}`;
}
