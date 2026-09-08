export type MemoryDifficulty = '初級' | '中級' | '上級' | 'エキスパート' | 'マスター' | 'エクストリーム';
export type MemoryCard = { id: number; pair: number; symbol: string };

export const memoryConfigs: Record<MemoryDifficulty, { rows: number; cols: number; pairs: number }> = {
  初級: { rows: 3, cols: 4, pairs: 6 },
  中級: { rows: 4, cols: 4, pairs: 8 },
  上級: { rows: 4, cols: 5, pairs: 10 },
  エキスパート: { rows: 4, cols: 6, pairs: 12 },
  マスター: { rows: 5, cols: 6, pairs: 15 },
  エクストリーム: { rows: 6, cols: 6, pairs: 18 },
};
export const memoryDifficulties = Object.keys(memoryConfigs) as MemoryDifficulty[];
const symbols = ['●', '▲', '■', '◆', '★', '✿', '☀', '☂', '☕', '♫', '♠', '♥', '♣', '♦', '☾', '⚑', '✦', '◎'];

export function createDeck(pairs: number): MemoryCard[] {
  const cards = symbols.slice(0, pairs).flatMap((symbol, pair) => [
    { id: pair * 2, pair, symbol },
    { id: pair * 2 + 1, pair, symbol },
  ]);
  for (let index = cards.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [cards[index], cards[target]] = [cards[target], cards[index]];
  }
  return cards;
}
