export function cardImageUrl(name: string): string {
  const filename = name
    .replace(/['']/g, "")
    .replace(/\s+/g, "_")
    .replace(/!/g, "%21")
    .replace(/\./g, ".");
  return `https://balatrowiki.org/images/${filename}.png`;
}