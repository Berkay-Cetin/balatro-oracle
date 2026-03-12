export type CardCategory = "joker" | "planet" | "tarot" | "spectral";

export type JokerRarity = "Common" | "Uncommon" | "Rare" | "Legendary";

export type JokerActivation = "on_scored" | "on_played" | "passive" | "on_discard" | "independent";

export interface BalatroCard {
  id: string;
  name: string;
  category: CardCategory;
  rarity?: JokerRarity;
  effect: string;
  cost?: number;
  image: string;
  unlock?: string;
}

export interface Joker extends BalatroCard {
  category: "joker";
  rarity: JokerRarity;
  cost: number;
  activation: JokerActivation;
}

export interface PlanetCard extends BalatroCard {
  category: "planet";
  hand: string;
}

export interface TarotCard extends BalatroCard {
  category: "tarot";
}

export interface SpectralCard extends BalatroCard {
  category: "spectral";
}

export type AnyCard = Joker | PlanetCard | TarotCard | SpectralCard;

export interface FortuneReading {
  card: AnyCard;
  reading: string;
  loading: boolean;
  error: string | null;
}