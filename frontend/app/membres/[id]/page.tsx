'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { SiteHeader } from '@/components/SiteHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { BASE_URL } from '@/lib/api';
import {
  PLATFORM_LABELS,
  TIME_CONTROL_LABELS,
  type MemberDetail,
  type Platform,
  type TimeControl,
} from '@/lib/types';
import { formatDate } from '@/lib/utils';

type Status = 'loading' | 'idle' | 'error' | 'notfound';

function RankPill({ rank }: { rank: number | null }) {
  if (rank == null) return <span className="text-muted">—</span>;
  if (rank === 1)
    return (
      <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-yellow-400 px-1.5 text-xs font-bold text-yellow-900">1</span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-gray-300 px-1.5 text-xs font-bold text-gray-700">2</span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-amber-600 px-1.5 text-xs font-bold text-amber-50">3</span>
    );
  return <span className="tabular-nums text-sm text-gray-700">{rank}</span>;
}

export default function MemberPublicPage() {
  const params = useParams();
  const id = String(params?.id ?? '');
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (!id) {
      setStatus('notfound');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/members/${id}/results`);
        if (res.status === 404) {
          if (!cancelled) setStatus('notfound');
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as MemberDetail;
        if (!cancelled) {
          setMember(data);
          setStatus('idle');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <SiteHeader />

      <main className="mx-auto max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Retour au classement
        </Link>

        {status === 'loading' && (
          <div className="space-y-4" role="status" aria-label="Chargement">
            <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-6">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        )}

        {status === 'error' && (
          <EmptyState variant="offline" title="Connexion impossible" message="Impossible de charger la fiche joueur." />
        )}

        {status === 'notfound' && (
          <EmptyState
            variant="search"
            title="Joueur introuvable"
            message="Ce membre n’existe pas ou n’est plus référencé."
            action={
              <Link href="/" className="text-sm font-medium text-brand hover:underline">
                ← Retour au classement
              </Link>
            }
          />
        )}

        {status === 'idle' && member && (
          <>
            <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-white p-6 text-center shadow-sm sm:flex-row sm:text-left">
              <Avatar
                name={`${member.firstName} ${member.lastName}`}
                size="lg"
                className="h-14 w-14 text-base ring-2 ring-brand/15 ring-offset-2"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-gray-900">{member.pseudo}</h1>
                <p className="text-sm text-muted">
                  {member.firstName} {member.lastName}
                </p>
                <div className="mt-2.5 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {member.lichess && (
                    <a
                      href={`https://lichess.org/@/${member.lichess}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:border-brand hover:text-brand"
                    >
                      ♟ {member.lichess}
                      <ExternalLink className="h-3 w-3 opacity-50" aria-hidden />
                    </a>
                  )}
                  {member.chesscom && (
                    <a
                      href={`https://www.chess.com/member/${member.chesscom}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:border-brand hover:text-brand"
                    >
                      ♞ {member.chesscom}
                      <ExternalLink className="h-3 w-3 opacity-50" aria-hidden />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="brand" className="px-3 py-1 text-sm">
                  {member.totalPoints} pts
                </Badge>
                <Badge variant="gray" className="px-3 py-1 text-sm">
                  {member.tournamentsPlayed} tournoi
                  {member.tournamentsPlayed !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>

            <div className="mb-3 mt-8 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Résultats</h2>
              {member.results?.length ? (
                <span className="text-xs text-muted">
                  {member.results.length} participation
                  {member.results.length !== 1 ? 's' : ''}
                </span>
              ) : null}
            </div>

            {!member.results?.length ? (
              <EmptyState
                variant="empty"
                title="Pas encore de résultats"
                message="Ce joueur n’a pas encore de tournoi enregistré."
              />
            ) : (
              <>
                <ul className="space-y-2 sm:hidden">
                  {member.results.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-xl border border-border bg-white p-3.5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">{r.tournament.name}</p>
                          <p className="mt-0.5 text-xs text-muted">
                            {formatDate(r.tournament.date)}
                          </p>
                        </div>
                        <RankPill rank={r.rank} />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge variant="blue">
                          {PLATFORM_LABELS[r.tournament.platform as Platform] ??
                            r.tournament.platform}
                        </Badge>
                        <Badge variant="gray">
                          {TIME_CONTROL_LABELS[
                            r.tournament.timeControl as TimeControl
                          ] ?? r.tournament.timeControl}
                        </Badge>
                        <span className="ml-auto text-sm font-semibold tabular-nums">
                          {r.points}{' '}
                          <span className="text-xs font-normal text-muted">pts tournoi</span>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="hidden overflow-hidden rounded-xl border border-border bg-white shadow-sm sm:block">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-brand text-white">
                        <th className="px-4 py-2.5 font-medium">Tournoi</th>
                        <th className="px-4 py-2.5 font-medium">Date</th>
                        <th className="px-4 py-2.5 font-medium">Plateforme</th>
                        <th className="px-4 py-2.5 text-center font-medium">Rang</th>
                        <th className="px-4 py-2.5 text-right font-medium">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {member.results.map((r) => (
                        <tr key={r.id} className="table-row-interactive">
                          <td className="px-4 py-2.5 font-medium">
                            {r.tournament.name}
                            <p className="text-xs text-muted">
                              {TIME_CONTROL_LABELS[
                                r.tournament.timeControl as TimeControl
                              ] ?? r.tournament.timeControl}
                            </p>
                          </td>
                          <td className="px-4 py-2.5 text-muted">
                            {formatDate(r.tournament.date)}
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge variant="blue">
                              {PLATFORM_LABELS[r.tournament.platform as Platform] ??
                                r.tournament.platform}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <RankPill rank={r.rank} />
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                            {r.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
