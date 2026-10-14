'use client';

import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { apiFetch } from '@/lib/api';
import {
  PLATFORM_LABELS,
  TIME_CONTROL_LABELS,
  type Platform,
  type TimeControl,
  type Tournament,
} from '@/lib/types';
import { formatDate } from '@/lib/utils';

type NotifType = 'success' | 'error' | 'idle';

export default function TournamentList() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [status, setStatus] = useState<NotifType>('idle');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function notify(msg: string, type: NotifType) {
    setMessage(msg);
    setStatus(type);
    if (type === 'success') setTimeout(() => setStatus('idle'), 4000);
  }

  const loadTournaments = useCallback(async () => {
    try {
      const res = await apiFetch('/tournaments');
      if (!res.ok) return;
      const data: unknown = await res.json();
      setTournaments(Array.isArray(data) ? (data as Tournament[]) : []);
    } catch {
      /* network */
    }
  }, []);

  useEffect(() => {
    void loadTournaments();
  }, [loadTournaments]);

  async function updateTournament(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await apiFetch(`/tournaments/${editing.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: fd.get('name') as string,
          platform: fd.get('platform') as Platform,
          timeControl: fd.get('timeControl') as TimeControl,
          date: fd.get('date') as string,
        }),
      });
      if (res.ok) {
        notify('Tournoi modifi\u00e9 avec succ\u00e8s.', 'success');
        setEditing(null);
        void loadTournaments();
      } else {
        notify(`Erreur ${res.status} lors de la modification.`, 'error');
      }
    } catch {
      notify('Impossible de contacter le serveur.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function deleteTournament(id: number) {
    if (!confirm('Voulez-vous vraiment supprimer ce tournoi et tous ses r\u00e9sultats ?')) return;
    try {
      const res = await apiFetch(`/tournaments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify('Tournoi supprim\u00e9.', 'success');
        if (editing?.id === id) setEditing(null);
        void loadTournaments();
      } else {
        notify(`Erreur ${res.status} lors de la suppression.`, 'error');
      }
    } catch {
      notify('Impossible de contacter le serveur.', 'error');
    }
  }

  return (
    <div className="space-y-4">
      {status === 'success' && <Alert type="success" message={message} />}
      {status === 'error' && <Alert type="error" message={message} />}
      {editing && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-3 text-sm font-semibold text-gray-900">Modifier \u2014 {editing.name}</p>
          <form onSubmit={updateTournament} className="space-y-3">
            <Input id="tl-name" name="name" label="Nom" defaultValue={editing.name} required disabled={loading} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select id="tl-platform" name="platform" label="Plateforme" defaultValue={editing.platform} disabled={loading}>
                <option value="LICHESS">Lichess</option>
                <option value="CHESSCOM">Chess.com</option>
                <option value="OTHER">Autre</option>
              </Select>
              <Select id="tl-timeControl" name="timeControl" label="Cadence" defaultValue={editing.timeControl} disabled={loading}>
                <option value="BULLET">Bullet</option>
                <option value="BLITZ">Blitz</option>
                <option value="RAPID">Rapide</option>
                <option value="CLASSICAL">Classique</option>
              </Select>
            </div>
            <Input id="tl-date" name="date" type="date" label="Date" defaultValue={editing.date.slice(0, 10)} required disabled={loading} />
            <div className="flex gap-2">
              <Button type="submit" loading={loading}>{loading ? 'Enregistrement\u2026' : 'Enregistrer'}</Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
            </div>
          </form>
        </div>
      )}
      {tournaments.length === 0 ? (
        <EmptyState message="Aucun tournoi enregistr\u00e9." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="bg-brand text-white">
                <th className="w-12 px-3 py-2.5 font-medium">ID</th>
                <th className="px-3 py-2.5 font-medium">Nom</th>
                <th className="px-3 py-2.5 font-medium">Plateforme</th>
                <th className="px-3 py-2.5 font-medium">Cadence</th>
                <th className="px-3 py-2.5 font-medium">Date</th>
                <th className="px-3 py-2.5 text-center font-medium">R\u00e9sultats</th>
                <th className="px-3 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {tournaments.map((t) => (
                <tr key={t.id} className={editing?.id === t.id ? 'bg-brand-light/40' : 'hover:bg-gray-50/80'}>
                  <td className="px-3 py-2.5 text-xs text-muted">{t.id}</td>
                  <td className="px-3 py-2.5 font-medium">{t.name}</td>
                  <td className="px-3 py-2.5"><Badge variant="blue">{PLATFORM_LABELS[t.platform] ?? t.platform}</Badge></td>
                  <td className="px-3 py-2.5 text-muted">{TIME_CONTROL_LABELS[t.timeControl] ?? t.timeControl}</td>
                  <td className="px-3 py-2.5 text-muted">{formatDate(t.date)}</td>
                  <td className="px-3 py-2.5 text-center"><Badge variant="gray">{t.results?.length ?? 0}</Badge></td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="secondary" onClick={() => { setEditing(t); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Modifier</Button>
                      <Button size="sm" variant="danger" onClick={() => void deleteTournament(t.id)}>Supprimer</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
