'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Search,
  Settings,
  Timer,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { Footer } from '@/components/Footer';
import { SiteHeader } from '@/components/SiteHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { RankingSkeleton } from '@/components/ui/Skeleton';
import { BASE_URL } from '@/lib/api';
import type { Player } from '@/lib/types';
import { cn } from '@/lib/utils';

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

interface Filter {
  id: string;
  label: string;
  query: string;
  icon: typeof Trophy;
}

function buildFilters(now = new Date()): Filter[] {
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  return [
    { id: 'general', label: 'Général', query: '', icon: Trophy },
    { id: 'bullet', label: 'Bullet', query: '?timeControl=BULLET', icon: Zap },
    { id: 'blitz', label: 'Blitz', query: '?timeControl=BLITZ', icon: Flame },
    { id: 'rapid', label: 'Rapide', query: '?timeControl=RAPID', icon: Timer },
    {
      id: 'monthly',
      label: 'Mensuel',
      query: `?type=monthly&month=${month}&year=${year}`,
      icon: Calendar,
    },
    {
      id: 'yearly',
      label: 'Annuel',
      query: `?type=yearly&year=${year}`,
      icon: BarChart3,
    },
  ];
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-900 shadow-sm">
        1
      </span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-300 text-xs font-bold text-gray-700">
        2
      </span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-amber-50">
        3
      </span>
    );
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
      {rank}
    </span>
  );
}

function Podium({ players }: { players: Player[] }) {
  const top = players.slice(0, 3);
  if (top.length < 1) return null;
  const orders = [top[1], top[0], top[2]];
  const heights = ['h-16', 'h-24', 'h-14'];

  return (
    <div className="mb-6 flex items-end justify-center gap-2 sm:gap-3">
      {orders.map((p, i) => {
        if (!p) return <div key={i} className="w-20 sm:w-24" />;
        const isFirst = p.rank === 1;
        return (
          <Link
            key={p.id}
            href={`/membres/${p.id}`}
            className="flex w-20 flex-col items-center rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand/40 sm:w-24"
          >
            <Avatar
              name={p.fullName || p.pseudo}
              size={isFirst ? 'md' : 'sm'}
              className={cn(
                isFirst && 'h-10 w-10 text-xs ring-2 ring-yellow-400 ring-offset-1',
              )}
            />
            <p className="mt-1.5 max-w-full truncate text-center text-xs font-semibold text-gray-900 hover:text-brand sm:text-sm">
              {p.pseudo}
            </p>
            <p className="text-[11px] text-muted tabular-nums">{p.points} pts</p>
            <div
              className={cn(
                'mt-2 flex w-full items-start justify-center rounded-t-lg pt-2 text-base font-bold text-white',
                heights[i],
                isFirst && 'bg-brand',
                p.rank === 2 && 'bg-gray-400',
                p.rank === 3 && 'bg-amber-600',
              )}
            >
              {p.rank}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function filterSubtitle(filter: Filter, now: Date): string | null {
  if (filter.id === 'monthly') {
    const label = now.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
  if (filter.id === 'yearly') return `Année ${now.getFullYear()}`;
  return null;
}

export default function HomePage() {
  const now = useMemo(() => new Date(), []);
  const filters = useMemo(() => buildFilters(now), [now]);
  const [rankings, setRankings] = useState<Player[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>(filters[0]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('loading');

  const [search, setSearch] = useState('');
  const [onlyWithPoints, setOnlyWithPoints] = useState(true);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(25);
  const [page, setPage] = useState(1);

  const loadRankings = useCallback(async (filter: Filter) => {
    setActiveFilter(filter);
    setStatus('loading');
    setRankings([]);
    setPage(1);
    try {
      const res = await fetch(`${BASE_URL}/rankings${filter.query}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: unknown = await res.json();
      setRankings(Array.isArray(data) ? (data as Player[]) : []);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void loadRankings(filters[0]);
  }, [loadRankings, filters]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rankings.filter((p) => {
      if (onlyWithPoints && !(p.points > 0)) return false;
      if (!q) return true;
      const hay = [p.pseudo, p.fullName, String(p.rank), String(p.points)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rankings, search, onlyWithPoints]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageSlice = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, onlyWithPoints, pageSize, activeFilter.id]);

  const periodHint = filterSubtitle(activeFilter, now);

  const podiumPlayers = useMemo(() => {
    const withPts = rankings.filter((p) => p.points > 0);
    return (withPts.length ? withPts : rankings).slice(0, 3);
  }, [rankings]);

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <SiteHeader
        action={
          <Link
            href="/admin"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-accent-dark bg-accent px-2.5 py-1.5 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-accent-dark sm:gap-2 sm:px-3.5 sm:py-2"
          >
            <Settings className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Administration</span>
          </Link>
        }
      />

      <main className="mx-auto max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Classements officiels
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Club d'échecs Chess Gabon — tournois multi-cadences
          </p>
        </div>

        <nav
          aria-label="Filtres de classement"
          className="mb-6 flex flex-wrap items-center justify-center gap-2"
        >
          {filters.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => void loadRankings(f)}
                aria-pressed={activeFilter.id === f.id}
                className={cn(
                  'pill inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium',
                  activeFilter.id === f.id
                    ? 'border-brand bg-brand text-white shadow-md ring-2 ring-brand/20'
                    : 'border-border bg-white text-gray-600',
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {f.label}
              </button>
            );
          })}
        </nav>

        {status === 'loading' && <RankingSkeleton />}

        {status === 'idle' && podiumPlayers.length >= 1 && (
          <Podium players={podiumPlayers} />
        )}

        {status !== 'loading' && (
          <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            <div className="space-y-3 border-b border-border px-4 py-3.5 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Classement {activeFilter.label}
                  </h2>
                  {periodHint && (
                    <p className="text-xs text-muted">{periodHint}</p>
                  )}
                </div>
                <Badge variant="gray">
                  {status === 'idle'
                    ? `${filtered.length} / ${rankings.length} joueur${rankings.length !== 1 ? 's' : ''}`
                    : '…'}
                </Badge>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un joueur (pseudo, nom…)"
                    className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-9 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                    aria-label="Rechercher dans le classement"
                  />
                  {search ? (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-100"
                      aria-label="Effacer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
                <label className="flex shrink-0 items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={onlyWithPoints}
                    onChange={(e) => setOnlyWithPoints(e.target.checked)}
                    className="rounded border-border"
                  />
                  Avec points uniquement
                </label>
                <label className="flex shrink-0 items-center gap-1.5 text-sm text-gray-600">
                  <span className="hidden sm:inline">Par page</span>
                  <select
                    value={pageSize}
                    onChange={(e) =>
                      setPageSize(
                        Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number],
                      )
                    }
                    className="rounded-lg border border-border bg-white px-2 py-1.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {status === 'error' && (
              <EmptyState
                variant="offline"
                title="Connexion impossible"
                message="Impossible de contacter le serveur. Vérifiez votre connexion réseau."
                action={
                  <button
                    type="button"
                    onClick={() => void loadRankings(activeFilter)}
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    Réessayer
                  </button>
                }
              />
            )}

            {status === 'idle' && rankings.length === 0 && (
              <EmptyState
                variant="empty"
                title={
                  activeFilter.id === 'monthly' || activeFilter.id === 'yearly'
                    ? 'Aucun résultat sur cette période'
                    : 'Classement vide'
                }
                message={
                  activeFilter.id === 'monthly' || activeFilter.id === 'yearly'
                    ? `Pas encore de tournoi enregistré pour ${periodHint ?? 'cette période'}.`
                    : 'Aucun joueur dans ce classement pour le moment. Importez des résultats depuis l’administration.'
                }
                action={
                  activeFilter.id !== 'general' ? (
                    <button
                      type="button"
                      onClick={() => void loadRankings(filters[0])}
                      className="text-sm font-medium text-brand hover:underline"
                    >
                      Voir le classement général
                    </button>
                  ) : (
                    <Link
                      href="/tournois"
                      className="text-sm font-medium text-brand hover:underline"
                    >
                      Voir les tournois
                    </Link>
                  )
                }
              />
            )}

            {status === 'idle' && rankings.length > 0 && filtered.length === 0 && (
              <EmptyState
                variant="search"
                title="Aucun résultat"
                message="Aucun joueur ne correspond à la recherche ou au filtre."
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setOnlyWithPoints(false);
                    }}
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    Réinitialiser les filtres
                  </button>
                }
              />
            )}

            {status === 'idle' && filtered.length > 0 && (
              <>
                <ul className="stagger-children divide-y divide-border sm:hidden">
                  {pageSlice.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 px-4 py-3.5">
                      <RankBadge rank={p.rank} />
                      <Avatar name={p.fullName || p.pseudo} size="sm" />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/membres/${p.id}`}
                          className="block truncate font-medium text-blue hover:underline"
                        >
                          {p.pseudo || '—'}
                        </Link>
                        <p className="truncate text-xs text-muted">
                          {p.fullName || '—'}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold tabular-nums">
                          {p.points ?? '—'}
                          <span className="ml-0.5 text-xs font-normal text-muted">
                            pts
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {p.tournaments ?? 0}
                          {p.rawPoints != null ? ` · ${p.rawPoints}` : ''}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="bg-brand text-white">
                        <th className="w-16 px-4 py-3 text-center font-medium">
                          Rang
                        </th>
                        <th className="px-4 py-3 font-medium">Joueur</th>
                        <th className="px-4 py-3 font-medium">Nom complet</th>
                        <th className="px-4 py-3 text-right font-medium">
                          Points
                        </th>
                        <th className="px-4 py-3 text-right font-medium">
                          Score brut
                        </th>
                        <th className="px-4 py-3 text-right font-medium">
                          Tournois
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pageSlice.map((p) => (
                        <tr key={p.id} className="table-row-interactive">
                          <td className="px-4 py-3 text-center">
                            <RankBadge rank={p.rank} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar
                                name={p.fullName || p.pseudo}
                                size="sm"
                              />
                              <Link
                                href={`/membres/${p.id}`}
                                className="font-medium text-blue hover:underline"
                              >
                                {p.pseudo || '—'}
                              </Link>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted">
                            {p.fullName || '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold tabular-nums">
                            {p.points ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-muted">
                            {p.rawPoints ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-muted">
                            {p.tournaments ?? 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
                  <p className="text-xs text-muted">
                    {(safePage - 1) * pageSize + 1}–
                    {Math.min(safePage * pageSize, filtered.length)} sur{' '}
                    {filtered.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Page précédente"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="min-w-[5.5rem] text-center text-sm tabular-nums text-gray-700">
                      {safePage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Page suivante"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
