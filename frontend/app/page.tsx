'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { BASE_URL } from '@/lib/api';
import type { Player } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Filter {
  label: string;
  query: string;
  icon: string;
}

const FILTERS: Filter[] = [
  { label: 'G\u00e9n\u00e9ral', query: '', icon: '\ud83c\udfc6' },
  { label: 'Bullet', query: '?timeControl=BULLET', icon: '\u26a1' },
  { label: 'Blitz', query: '?timeControl=BLITZ', icon: '\ud83d\udd25' },
  { label: 'Rapide', query: '?timeControl=RAPID', icon: '\u23f1' },
  { label: 'Mensuel', query: '?type=monthly&month=6&year=2026', icon: '\ud83d\udcc5' },
  { label: 'Annuel', query: '?type=yearly&year=2026', icon: '\ud83d\udcca' },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-900 shadow-sm">1</span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-300 text-xs font-bold text-gray-700">2</span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-amber-50">3</span>
    );
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">{rank}</span>
  );
}

function Podium({ players }: { players: Player[] }) {
  const top = players.slice(0, 3);
  if (top.length < 1) return null;
  const orders = [top[1], top[0], top[2]];
  const heights = ['h-24', 'h-32', 'h-20'];
  return (
    <div className="mb-8 flex items-end justify-center gap-3 sm:gap-6">
      {orders.map((p, i) => {
        if (!p) return <div key={i} className="w-24 sm:w-28" />;
        const isFirst = p.rank === 1;
        return (
          <div key={p.id} className="flex w-24 flex-col items-center sm:w-28">
            <Avatar name={p.fullName || p.pseudo} size={isFirst ? 'lg' : 'md'} className={cn(isFirst && 'ring-2 ring-yellow-400 ring-offset-2')} />
            <p className="mt-2 max-w-full truncate text-center text-sm font-semibold text-gray-900">{p.pseudo}</p>
            <p className="text-xs text-muted">{p.points} pts</p>
            <div className={cn('mt-3 flex w-full items-start justify-center rounded-t-xl pt-3 text-lg font-bold text-white', heights[i], isFirst && 'bg-brand', p.rank === 2 && 'bg-gray-400', p.rank === 3 && 'bg-amber-600')}>
              {p.rank === 1 ? '\ud83e\udd47' : p.rank === 2 ? '\ud83e\udd48' : '\ud83e\udd49'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const [rankings, setRankings] = useState<Player[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>(FILTERS[0]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('loading');

  const loadRankings = useCallback(async (filter: Filter) => {
    setActiveFilter(filter);
    setStatus('loading');
    setRankings([]);
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
    void loadRankings(FILTERS[0]);
  }, [loadRankings]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <Link href="/login" className="inline-flex items-center gap-2 rounded-lg border border-accent-dark bg-accent px-3.5 py-2 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-accent-dark">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Administration</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Classements officiels</h1>
          <p className="mt-1.5 text-sm text-muted">Club d&apos;\u00e9checs Chess Gabon \u2014 tournois multi-cadences</p>
        </div>
        <nav aria-label="Filtres de classement" className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {FILTERS.map((f) => (
            <button key={f.label} type="button" onClick={() => void loadRankings(f)} aria-pressed={activeFilter.label === f.label} className={cn('inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition', activeFilter.label === f.label ? 'border-brand bg-brand text-white shadow-sm' : 'border-border bg-white text-gray-600 hover:border-brand/40 hover:text-brand')}>
              <span>{f.icon}</span>{f.label}
            </button>
          ))}
        </nav>
        {status === 'idle' && rankings.length >= 1 && <Podium players={rankings} />}
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-semibold text-gray-900">Classement {activeFilter.label}</h2>
            <Badge variant="gray">{status === 'loading' ? '\u2026' : `${rankings.length} joueur${rankings.length !== 1 ? 's' : ''}`}</Badge>
          </div>
          {status === 'loading' && (<div className="flex items-center justify-center gap-2 py-16 text-sm text-muted"><Spinner /> Chargement\u2026</div>)}
          {status === 'error' && <EmptyState message="Impossible de contacter le serveur. V\u00e9rifiez votre connexion." />}
          {status === 'idle' && rankings.length === 0 && <EmptyState message="Aucun joueur dans ce classement." />}
          {status === 'idle' && rankings.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="bg-brand text-white">
                    <th className="w-16 px-4 py-3 text-center font-medium">Rang</th>
                    <th className="px-4 py-3 font-medium">Joueur</th>
                    <th className="px-4 py-3 font-medium">Nom complet</th>
                    <th className="px-4 py-3 text-right font-medium">Points</th>
                    <th className="px-4 py-3 text-right font-medium">Score brut</th>
                    <th className="px-4 py-3 text-right font-medium">Tournois</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rankings.map((p) => (
                    <tr key={p.id} className="transition hover:bg-gray-50/80">
                      <td className="px-4 py-3 text-center"><RankBadge rank={p.rank} /></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar name={p.fullName || p.pseudo} size="sm" /><span className="font-medium text-blue">{p.pseudo || '\u2014'}</span></div></td>
                      <td className="px-4 py-3 text-muted">{p.fullName || '\u2014'}</td>
                      <td className="px-4 py-3 text-right font-semibold">{p.points ?? '\u2014'}</td>
                      <td className="px-4 py-3 text-right text-muted">{p.rawPoints ?? '\u2014'}</td>
                      <td className="px-4 py-3 text-right"><Badge variant="gray">\u265e {p.tournaments ?? 0}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="mt-8 text-center text-xs text-muted">ChessGabon Gestion \u00b7 Classements multi-cadences</p>
      </main>
    </div>
  );
}
