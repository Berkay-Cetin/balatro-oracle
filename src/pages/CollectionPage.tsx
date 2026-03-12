import { useState } from "react";
import type { Page } from "../App";
import type { AnyCard, CardCategory, JokerRarity } from "../types";
import { jokers, tarotCards, planetCards, spectralCards } from "../data";
import "./CollectionPage.css";
import { cardImageUrl } from "../utils/imageUrl";

interface CollectionPageProps {
  onNavigate: (page: Page) => void;
}

const CATEGORIES: { value: CardCategory; label: string; icon: string }[] = [
  { value: "joker",    label: "Jokers",   icon: "🃏" },
  { value: "planet",   label: "Planets",  icon: "🪐" },
  { value: "tarot",    label: "Tarot",    icon: "🔮" },
  { value: "spectral", label: "Spectral", icon: "👻" },
];

const RARITIES: JokerRarity[] = ["Common", "Uncommon", "Rare", "Legendary"];

const RARITY_COLORS: Record<JokerRarity, string> = {
  Common:    "#aaaaaa",
  Uncommon:  "#6dbe6d",
  Rare:      "#7aadff",
  Legendary: "#f0cc6e",
};

function getCards(category: CardCategory): AnyCard[] {
  switch (category) {
    case "joker":    return jokers;
    case "planet":   return planetCards;
    case "tarot":    return tarotCards;
    case "spectral": return spectralCards;
  }
}

interface CardDetailModalProps {
  card: AnyCard;
  onClose: () => void;
}

function CardDetailModal({ card, onClose }: CardDetailModalProps) {
  const isJoker = card.category === "joker";
  const isPlanet = card.category === "planet";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-body">
          <div className="modal-img-section">
            <img
              src={cardImageUrl(card.name)}
              alt={card.name}
              className="modal-img"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>

          <div className="modal-info">
            <h2 className="modal-name">{card.name}</h2>

            <div className="modal-badges">
              <span className="modal-badge category-badge">
                {CATEGORIES.find(c => c.value === card.category)?.icon}{" "}
                {card.category.charAt(0).toUpperCase() + card.category.slice(1)}
              </span>

              {isJoker && "rarity" in card && card.rarity && (
                <span
                  className="modal-badge rarity-badge-modal"
                  style={{ color: RARITY_COLORS[card.rarity], borderColor: RARITY_COLORS[card.rarity] + "44" }}
                >
                  {card.rarity}
                </span>
              )}

              {isPlanet && "hand" in card && (
                <span className="modal-badge hand-badge">
                  {card.hand}
                </span>
              )}
            </div>

            {isJoker && "cost" in card && (
              <div className="modal-cost">
                <span className="cost-label">Cost</span>
                <span className="cost-value">${card.cost}</span>
              </div>
            )}

            <div className="modal-effect">
              <span className="effect-label">Effect</span>
              <p className="effect-text">{card.effect}</p>
            </div>

            {isJoker && "unlock" in card && card.unlock && (
              <div className="modal-unlock">
                <span className="effect-label">Unlock</span>
                <p className="unlock-text">{card.unlock}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CollectionPage({ onNavigate }: CollectionPageProps) {
  const [category, setCategory] = useState<CardCategory>("joker");
  const [selectedRarity, setSelectedRarity] = useState<JokerRarity | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedCard, setSelectedCard] = useState<AnyCard | null>(null);

  const allCards = getCards(category);

  const filtered = allCards.filter((card) => {
    const matchSearch = card.name.toLowerCase().includes(search.toLowerCase()) ||
      card.effect.toLowerCase().includes(search.toLowerCase());
    const matchRarity = category !== "joker" || selectedRarity === "all" ||
      ("rarity" in card && card.rarity === selectedRarity);
    return matchSearch && matchRarity;
  });

  return (
    <div className="collection">

      {/* Header */}
      <header className="collection-header">
        <div className="collection-header-inner">
          <button className="nav-btn" onClick={() => onNavigate("home")}>
            ♠ Ana Sayfa
          </button>
          <h1 className="collection-title">Koleksiyon</h1>
          <span className="collection-count">{filtered.length} kart</span>
        </div>
      </header>

      {/* Kategori Tabs */}
      <div className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            className={`category-tab ${category === cat.value ? "active" : ""}`}
            onClick={() => { setCategory(cat.value); setSelectedRarity("all"); setSearch(""); }}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            <span className="tab-count">{getCards(cat.value).length}</span>
          </button>
        ))}
      </div>

      {/* Filtreler */}
      <div className="collection-filters">
        <input
          type="text"
          className="collection-search"
          placeholder="Kart adı veya efekt ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {category === "joker" && (
          <div className="rarity-filters">
            <button
              className={`rarity-btn ${selectedRarity === "all" ? "active" : ""}`}
              onClick={() => setSelectedRarity("all")}
            >
              Tümü
            </button>
            {RARITIES.map((r) => (
              <button
                key={r}
                className={`rarity-btn ${selectedRarity === r ? "active" : ""}`}
                style={selectedRarity === r ? { borderColor: RARITY_COLORS[r], color: RARITY_COLORS[r] } : {}}
                onClick={() => setSelectedRarity(r)}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Kart Grid */}
      <main className="collection-main">
        <div className="collection-grid">
          {filtered.map((card, index) => (
            <button
              key={card.id}
              className="collection-card"
              onClick={() => setSelectedCard(card)}
              style={{ animationDelay: `${Math.min(index * 20, 400)}ms` }}
            >
              <div className="collection-card-img-wrap">
                <img
                  src={cardImageUrl(card.name)}
                  alt={card.name}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="collection-card-overlay">
                  <span>Detay</span>
                </div>
              </div>

              <div className="collection-card-info">
                <span className="collection-card-name">{card.name}</span>
                {"rarity" in card && card.rarity && (
                  <span
                    className="collection-card-rarity"
                    style={{ color: RARITY_COLORS[card.rarity] }}
                  >
                    {card.rarity}
                  </span>
                )}
                {"hand" in card && (
                  <span className="collection-card-hand">{card.hand}</span>
                )}
                {"cost" in card && card.cost && (
                  <span className="collection-card-cost">${card.cost}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="collection-empty">
            <span>🃏</span>
            <p>Kart bulunamadı</p>
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}