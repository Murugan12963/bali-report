import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Articles - Bali Report',
  description: 'Your personal reading list of saved articles from BRICS news, Indonesia updates, and Bali events. Track reading progress and organize by tags and priority.',
  keywords: 'saved articles, reading list, bookmarks, BRICS news, Indonesia news, Bali news, personal library',
  openGraph: {
    type: 'website',
    title: 'Saved Articles - Bali Report',
    description: 'Your personal reading list of saved articles from BRICS news, Indonesia updates, and Bali events.',
    siteName: 'Bali Report',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saved Articles - Bali Report',
    description: 'Your personal reading list of saved articles from BRICS news, Indonesia updates, and Bali events.',
  },
  robots: {
    index: false, // Private user data
    follow: false,
  },
};

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
