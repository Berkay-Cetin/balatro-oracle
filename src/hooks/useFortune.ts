import { useState, useCallback } from "react";
import type { AnyCard } from "../types";

interface UseFortuneReturn {
  reading: string;
  loading: boolean;
  error: string | null;
  getFortune: (card: AnyCard) => Promise<void>;
  clear: () => void;
}

export function useFortune(): UseFortuneReturn {
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFortune = useCallback(async (card: AnyCard) => {
    setLoading(true);
    setError(null);
    setReading("");

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1024,
          temperature: 1.0,
          messages: [
            {
              role: "system",
              content: "Sen mistik ve gizemli bir Balatro kart falcısısın. Türkçe, şiirsel ve gizemli bir dilde fal söylersin. Sadece fal metnini yazarsın, başlık veya açıklama eklemezsin.",
            },
            {
              role: "user",
              content: `Bugün "${card.name}" kartını çektim.

Kart hakkında bilgi:
- Kategori: ${card.category}
- Efekt: ${card.effect}
${card.category === "joker" ? `- Nadirlik: ${"rarity" in card ? card.rarity : ""}` : ""}

Bu karta dayanarak bugünkü falımı söyle. Falın:
- Kartın efektiyle ve temasıyla bağlantılı olmalı
- Mistik, şiirsel ve gizemli bir dilde yazılmalı
- 3-4 paragraf olmalı
- Hem bir uyarı hem de bir fırsat içermeli
- Balatro oyununun ruhunu yansıtmalı (şans, risk, strateji)`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message ?? `HTTP ${response.status}`);
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content ?? "";
      setReading(text);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Hata: ${err.message}`
          : "Fal okunurken bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setReading("");
    setError(null);
  }, []);

  return { reading, loading, error, getFortune, clear };
}