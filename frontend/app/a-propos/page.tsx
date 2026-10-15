import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ExternalLink,
  Mail,
  MapPin,
  Trophy,
  Users,
  Upload,
} from 'lucide-react';
import { Footer } from '@/components/Footer';
import { SiteHeader } from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'Présentation du club d’échecs Chess Gabon et de l’application de gestion des classements.',
};

const FEATURES = [
  {
    icon: Trophy,
    title: 'Classements multi-cadences',
    text: 'Général, Bullet, Blitz, Rapide, mensuel et annuel selon le règlement du club.',
  },
  {
    icon: Users,
    title: 'Gestion des membres',
    text: 'Fiches joueurs, pseudos Lichess / Chess.com et historique des résultats.',
  },
  {
    icon: Upload,
    title: 'Import CSV',
    text: 'Import des classements depuis Lichess, Chess.com ou un format générique.',
  },
] as const;

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <SiteHeader />

      <main className="mx-auto max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            À propos
          </h1>
          <p className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted sm:justify-start">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              Libreville, Gabon
            </span>
            <span className="hidden text-border sm:inline">·</span>
            <span>Club d’échecs Chess Gabon</span>
          </p>
        </div>

        <section className="mt-8 rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Le club</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            Chess Gabon rassemble les passionnés d’échecs au Gabon. Le club
            organise des tournois multi-cadences (bullet, blitz, rapide) sur
            Lichess et Chess.com, et suit les performances de ses membres via
            des classements officiels.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="https://lichess.org/team/chess-gabon"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-brand hover:text-brand"
            >
              Lichess
              <ExternalLink className="h-3.5 w-3.5 opacity-50" aria-hidden />
            </a>
            <a
              href="https://www.chess.com/club/chess-gabon"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-brand hover:text-brand"
            >
              Chess.com
              <ExternalLink className="h-3.5 w-3.5 opacity-50" aria-hidden />
            </a>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Cette application
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-gray-700">
            <strong>ChessGabon Gestion</strong> centralise les membres,
            l’import des résultats et l’affichage des classements publics.
            Projet réalisé dans le cadre du <strong>BTS SIO option SLAM</strong>.
          </p>
          <ul className="grid gap-3 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="rounded-xl border border-border bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light text-brand">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Contact</h2>
          <p className="mt-2 text-sm text-gray-700">
            Une question sur le club ou l’application ?
          </p>
          <a
            href="mailto:contact@chessgabon.ga"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-dark"
          >
            <Mail className="h-4 w-4" aria-hidden />
            contact@chessgabon.ga
          </a>
        </section>

        <div className="mt-8 flex flex-wrap justify-center gap-3 sm:justify-start">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-dark"
          >
            Voir le classement
          </Link>
          <Link
            href="/tournois"
            className="inline-flex items-center rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-brand hover:text-brand"
          >
            Liste des tournois
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
