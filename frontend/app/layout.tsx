<<<<<<< HEAD
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Home — ChessGabonGestion',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html>
    <body>
      <>{children}</>;
    </body>
  </html>
=======
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Home — ChessGabonGestion',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html>
    <body>
      <>{children}</>;
    </body>
  </html>
>>>>>>> 2b74049e844e35d7271fdf2b317af138b33ba0c3
}