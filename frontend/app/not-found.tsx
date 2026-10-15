import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Logo } from '@/components/Logo';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo size="sm" />
          <nav className="flex gap-2 text-sm">
            <Link
              href="/"
              className="rounded-lg px-2.5 py-1.5 text-muted transition hover:bg-gray-50 hover:text-gray-900"
            >
              Classement
            </Link>
            <Link
              href="/tournois"
              className="rounded-lg px-2.5 py-1.5 text-muted transition hover:bg-gray-50 hover:text-gray-900"
            >
              Tournois
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div
          className="mb-2 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-light text-4xl"
          aria-hidden
        >
          ♟
        </div>
        <p className="text-6xl font-bold tracking-tight text-brand">404</p>
        <h1 className="mt-3 text-xl font-semibold text-gray-900">
          Page introuvable
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
          Cette page n’existe pas, a été déplacée, ou le lien est incorrect.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-dark"
          >
            Classement
          </Link>
          <Link
            href="/tournois"
            className="inline-flex items-center rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-brand hover:text-brand"
          >
            Tournois
          </Link>
          <Link
            href="/a-propos"
            className="inline-flex items-center rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-brand hover:text-brand"
          >
            À propos
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
