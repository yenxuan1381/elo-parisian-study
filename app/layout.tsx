import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Élo’s room — A little corner of Paris', description: 'Step inside a sunlit Parisian creative study. Look around, settle at the desk, and take in the view.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
