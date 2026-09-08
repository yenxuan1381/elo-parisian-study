// Add the owner's destinations here when supplied. Empty values never launch a payment or email.
export const roomSettings = {
  ownerEmail: 'emilylo1381@gmail.com',
  gifts: { tea: '', matcha: '', coffee: '' },
  musicLinks: [] as { title: string; url: string; kind: 'song' | 'album' | 'playlist' }[],
};

export const destinations = [
  { id: 'london', name: 'London', lat: 51.507, lon: -.128, caption: 'The Thames, old bookshops, and a little rain.', tile: 0 },
  { id: 'malaysia', name: 'Malaysia', lat: 3.139, lon: 101.687, caption: 'Tropical greens and the Kuala Lumpur skyline.', tile: 1 },
  { id: 'norway', name: 'Norway', lat: 60.392, lon: 5.324, caption: 'Quiet fjords and little red houses.', tile: 2 },
  { id: 'greece', name: 'Greece', lat: 36.461, lon: 25.376, caption: 'Blue domes, white walls, and the Aegean.', tile: 3 },
  { id: 'spain', name: 'Spain', lat: 37.389, lon: -5.984, caption: 'Warm courtyards and the colors of Seville.', tile: 4 },
  { id: 'italy', name: 'Italy', lat: 45.44, lon: 12.315, caption: 'A slow afternoon beside a Venetian canal.', tile: 5 },
] as const;
export type Drink = 'tea' | 'matcha' | 'coffee';
export type Activity = 'drinks' | 'typewriter' | 'music' | 'travel' | 'candles' | 'cat' | 'fireworks' | 'reading';
export const drinkSteps: Record<Drink, string[]> = {
  tea: ['Add the tea leaves', 'Pour hot water', 'Let it steep'],
  matcha: ['Sift the matcha', 'Add warm water', 'Whisk until frothy'],
  coffee: ['Grind the beans', 'Pour the water', 'Brew slowly'],
};
export function safeExternalUrl(value: string): string | null {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export function letterMailto(email: string, name: string, note: string): string | null {
  if (!/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email) || !note.trim()) return null;
  return `mailto:${email}?subject=${encodeURIComponent('My Parisian Dream — A letter from the room')}&body=${encodeURIComponent(`${note.trim()}\n\nWith love,\n${name.trim() || 'A visitor'}\n\nSent from My Parisian Dream.`)}`;
}
export function spotifyEmbed(value: string): string | null {
  const url = safeExternalUrl(value); if (!url) return null;
  const parsed = new URL(url); if (parsed.hostname !== 'open.spotify.com') return null;
  const match = parsed.pathname.match(/^\/(?:intl-[a-z]+\/)?(track|album|playlist)\/([a-zA-Z0-9]+)\/?$/);
  return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}` : null;
}
