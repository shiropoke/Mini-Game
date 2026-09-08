import type { ComponentType } from 'react';

export interface GameDefinition {
  id: string;
  title: string;
  description: string;
  /** Unique, lower-case URL path, e.g. /games/my-game (no trailing slash). */
  path: `/games/${string}`;
  component: ComponentType;
}

// Add a component import and one entry here to publish it in the list and router.
export const games: readonly GameDefinition[] = [];
