/**
 * Official Brand & Visual Style System for 365-Day LinkedIn SEO Series
 */
export const BRAND_THEME = {
  background: 'Deep Navy / Near Black (#060814 / #0a0d1f)',
  primary: 'Neon Purple (#a855f7 / #9333ea)',
  secondary: 'Magenta (#ec4899 / #d946ef)',
  accent: 'Electric Blue (#3b82f6 / #2563eb)',
  highlight: 'Cyan (#06b6d4 / #22d3ee)',
  text: 'White / Soft White (#ffffff / #f1f5f9)',
  effects: 'Neon glow + subtle gradients + glassmorphism',
  cards: 'Dark glass (bg-white/5 backdrop-blur-md) with subtle glowing borders',
  buttons: 'Purple → Blue/Cyan smooth gradient',
  preferredDailyPostingTime: '19:30', // PKT Daily posting time
};

export function buildImagePromptForDay(dayNumber: number, topic: string, takeaways: string[]): string {
  return `A sleek, high-end LinkedIn social media infographic graphic for Day ${dayNumber} SEO Growth Series.
Theme: '${topic}'.
Strict Brand Aesthetic:
- Background: Deep Navy / Near Black with subtle geometric grid and cosmic dark glass atmosphere
- Primary Neon Purple glow accents with Magenta highlights
- Electric Blue & Cyan neon glows and borders
- Clean bold modern typography in crisp White and Soft White
- 3 distinct Dark Glass takeaway cards with glowing border:
  1. ${takeaways[0] || 'Core Strategy & Focus'}
  2. ${takeaways[1] || 'Execution & Implementation'}
  3. ${takeaways[2] || 'Compounding Results & Metrics'}
- Premium UI/UX dashboard presentation with glowing trend icons, 4k ultra-sharp resolution, professional graphic design masterpiece.`;
}
