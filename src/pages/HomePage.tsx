import { useState, useRef, useCallback, useEffect } from "react";
import type { Page } from "../App";
import type { AnyCard } from "../types";
import { jokers } from "../data";
import { useFortune } from "../hooks/useFortune";
import { cardImageUrl } from "../utils/imageUrl";
import "./HomePage.css";

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

const ALL_CARDS: AnyCard[] = [...jokers, ...jokers, ...jokers];
const CARD_WIDTH = 88;
const CARD_HEIGHT = 124;
const CARD_SPACING = 108;
const AUTO_SPEED = 2.5;

export function HomePage({ onNavigate }: HomePageProps) {
  const [selectedCard, setSelectedCard] = useState<AnyCard | null>(null);
  const [revealed, setRevealed] = useState(false);

  const scrollX = useRef(0);
  const autoScrollPaused = useRef(false);
  const rafRef = useRef(0);
  const [, forceRender] = useState(0);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [cardOrigin, setCardOrigin] = useState({ x: 0, y: 0 });
  const [dragged, setDragged] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const { reading, loading, error, getFortune, clear } = useFortune();

  const totalWidth = ALL_CARDS.length * CARD_SPACING;

  useEffect(() => {
    const tick = () => {
      if (!autoScrollPaused.current) {
        scrollX.current = (scrollX.current + AUTO_SPEED) % totalWidth;
        forceRender(n => n + 1);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [totalWidth]);

  const handleCardMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDraggingIndex(index);
    setDragged(false);
    dragStart.current = { x: e.clientX, y: e.clientY };
    setCardOrigin({ x: rect.left, y: rect.top });
    setDragPos({ x: rect.left, y: rect.top });
    autoScrollPaused.current = true;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingIndex === null) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) setDragged(true);
    setDragPos({ x: cardOrigin.x + dx, y: cardOrigin.y + dy });
  }, [draggingIndex, cardOrigin]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (draggingIndex === null) return;
    const dy = dragStart.current.y - e.clientY;
    if (dragged && dy > 60) {
      setSelectedCard(ALL_CARDS[draggingIndex]);
      setRevealed(false);
      clear();
    }
    setDraggingIndex(null);
    setDragged(false);
    autoScrollPaused.current = false;
  }, [draggingIndex, dragged, clear]);

  const handleCardClick = useCallback((card: AnyCard) => {
    if (dragged) return;
    setSelectedCard(card);
    setRevealed(false);
    clear();
  }, [dragged, clear]);

  const handleReveal = async () => {
    setRevealed(true);
    if (selectedCard) await getFortune(selectedCard);
  };

  const handleReset = () => {
    setSelectedCard(null);
    setRevealed(false);
    clear();
    autoScrollPaused.current = false;
  };

  // Kartın ekran x pozisyonu
  const getScreenX = (index: number): number => {
    const raw = index * CARD_SPACING - scrollX.current;
    const looped = ((raw % totalWidth) + totalWidth) % totalWidth;
    return looped > totalWidth / 2 ? looped - totalWidth : looped;
  };

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-header-inner">
          <div className="home-logo">
            <span className="home-logo-suit">♠</span>
            <h1 className="home-logo-text">BALATRO</h1>
            <span className="home-logo-sub">CARD ORACLE</span>
            <span className="home-logo-suit">♥</span>
          </div>
          <button className="nav-btn" onClick={() => onNavigate("collection")}>
            ♣ Koleksiyon
          </button>
        </div>
      </header>

      {!selectedCard ? (
        <main className="home-main">
          <div className="oracle-intro">
            <p className="oracle-subtitle">Kartlar seni bekliyor...</p>
            <p className="oracle-hint">Kartı yukarı çek veya tıkla</p>
          </div>

          <div
            className="card-stream-wrapper"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {ALL_CARDS.map((card, i) => {
              const isDragging = draggingIndex === i;
              const screenX = getScreenX(i);
              const screenW = window.innerWidth;
              const isVisible = screenX > -screenW * 0.6 && screenX < screenW * 0.6;
              if (!isVisible && !isDragging) return null;

              const isHovered = hoveredIndex === i && draggingIndex === null;

              const style: React.CSSProperties = isDragging
                ? {
                    position: "fixed",
                    left: dragPos.x,
                    top: dragPos.y,
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    zIndex: 999,
                    transform: "scale(1.15)",
                    transition: "none",
                  }
                : {
                    position: "absolute",
                    left: `calc(50% + ${screenX}px - ${CARD_WIDTH / 2}px)`,
                    top: "50%",
                    marginTop: -(CARD_HEIGHT / 2),
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    transform: `scale(${isHovered ? 1.12 : 1})`,
                    zIndex: isHovered ? 200 : 10,
                    transition: "transform 0.15s ease",
                  };

              return (
                <div
                  key={`${card.id}-${i}`}
                  className="playing-card back"
                  style={style}
                  onMouseDown={(e) => handleCardMouseDown(e, i)}
                  onMouseEnter={() => { setHoveredIndex(i); autoScrollPaused.current = true; }}
                  onMouseLeave={() => { setHoveredIndex(null); autoScrollPaused.current = false; }}
                  onClick={() => handleCardClick(card)}
                >
                  <div className="card-back-pattern">
                    <span className="card-back-suit">♦</span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="drag-hint">← Kartlar akıyor · Yukarı çek veya tıkla →</p>
        </main>

      ) : (
        <main className="home-main fortune-screen">
          {!revealed ? (
            <div className="selected-card-screen">
              <p className="oracle-subtitle">Kartın seçildi...</p>
              <div className="selected-card-float">
                <div className="playing-card back large">
                  <div className="card-back-pattern">
                    <span className="card-back-suit">♦</span>
                  </div>
                </div>
              </div>
              <div className="reveal-actions">
                <button className="btn-reveal" onClick={handleReveal}>
                  ✦ Falı Aç ✦
                </button>
                <button className="btn-back" onClick={handleReset}>
                  Geri Dön
                </button>
              </div>
            </div>

          ) : (
            <div className="fortune-result">
              <div className="fortune-card-display">
                <div className="fortune-card-img-wrap">
                  <img
                    src={cardImageUrl(selectedCard.name)}
                    alt={selectedCard.name}
                    className="fortune-card-img"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div className="fortune-card-info">
                  <h2 className="fortune-card-name">{selectedCard.name}</h2>
                  {"rarity" in selectedCard && (
                    <span className={`rarity-badge rarity-${selectedCard.rarity?.toLowerCase()}`}>
                      {selectedCard.rarity}
                    </span>
                  )}
                  <p className="fortune-card-effect">{selectedCard.effect}</p>
                </div>
              </div>

              <div className="fortune-reading-box">
                <div className="fortune-reading-header">
                  <span className="fortune-reading-icon">✦</span>
                  <span className="fortune-reading-title">Bugünün Falı</span>
                  <span className="fortune-reading-icon">✦</span>
                </div>
                {loading && (
                  <div className="fortune-loading">
                    <div className="fortune-spinner" />
                    <span>Kartlar okunuyor...</span>
                  </div>
                )}
                {error && <div className="fortune-error">⚠ {error}</div>}
                {reading && (
                  <div className="fortune-text">
                    {reading.split("\n").filter(Boolean).map((para: string, i: number) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                )}
              </div>

              <button className="btn-back" onClick={handleReset}>
                ← Yeni Kart Seç
              </button>
            </div>
          )}
        </main>
      )}
    </div>
  );
}