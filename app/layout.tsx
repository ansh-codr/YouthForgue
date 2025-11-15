import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'YouthForge | Connect, Collaborate, Create',
  description: 'YouthForge is a global platform for young developers to collaborate on projects, participate in challenges, and build their tech careers together.',
  keywords: 'developers, projects, challenges, collaboration, youth, tech, community',
  authors: [{ name: 'YouthForge Team' }],
  openGraph: {
    title: 'YouthForge - Where Young Developers Forge Their Future',
    description: 'Connect with talented developers, work on real projects, and grow your skills.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
