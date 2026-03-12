import { jokers } from "./jokers";
import { tarotCards } from "./tarot";
import { planetCards } from "./planet";
import { spectralCards } from "./spectral";
import type { AnyCard, CardCategory } from "../types";

export const allCards: AnyCard[] = [
  ...jokers,
  ...tarotCards,
  ...planetCards,
  ...spectralCards,
];

export function getCardsByCategory(category: CardCategory): AnyCard[] {
  return allCards.filter((c) => c.category === category);
}

export function getRandomJoker() {
  const idx = Math.floor(Math.random() * jokers.length);
  return jokers[idx];
}

export { jokers, tarotCards, planetCards, spectralCards };