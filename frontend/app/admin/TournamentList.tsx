'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { apiFetch } from '@/lib/api';
import { toast } from '@/lib/toast';
import {
  PLATFORM_LABELS,
  TIME_CONTROL_LABELS,
  type Platform,
  type TimeControl,
  type Tournament,
} from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function TournamentList() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(false);

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
    const externalUrl = String(fd.get('externalUrl') ?? '').trim();

    try {
      const res = await apiFetch(`/tournaments/${editing.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: fd.get('name') as string,
          platform: fd.get('platform') as Platform,
          timeControl: fd.get('timeControl') as TimeControl,
          date: fd.get('date') as string,
          externalUrl: externalUrl || null,
        }),
      });

      if (res.ok) {
        toast.success('Tournoi modifié avec succès.');
        setEditing(null);
        void loadTournaments();
      } else {
        toast.error(`Erreur ${res.status} lors de la modification.`);
      }
    } catch {
      toast.error('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteTournament(t: { id: number; name: string }) {
    const ok = confirm(
      `Supprimer le tournoi « ${t.name} » ?\n\nTous les résultats associés seront effacés. Cette action est irréversible.`,
    );
    if (!ok) return;

    try {
      const res = await apiFetch(`/tournaments/${t.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Tournoi « ${t.name} » supprimé.`);
        if (editing?.id === t.id) setEditing(null);
        void loadTournaments();
      } else {
        toast.error(`Erreur ${res.status} lors de la suppression.`);
      }
    } catch {
      toast.error('Impossible de contacter le serveur.');
    }
  }

  return (
    <div className="space-y-4">
      {editing && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-3 text-sm font-semibold text-gray-900">
            Modifier — {editing.name}
          </p>
          <form onSubmit={updateTournament} className="space-y-3">
            <Input
              id="tl-name"
              name="name"
              label="Nom"
              defaultValue={editing.name}
              required
              disabled={loading}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                id="tl-platform"
                name="platform"
                label="Plateforme"
                defaultValue={editing.platform}
                disabled={loading}
              >
                <option value="LICHESS">Lichess</option>
                <option value="CHESSCOM">Chess.com</option>
                <option value="OTHER">Autre</option>
              </Select>
              <Select
                id="tl-timeControl"
                name="timeControl"
                label="Cadence"
                defaultValue={editing.timeControl}
                disabled={loading}
              >
                <option value="BULLET">Bullet</option>
                <option value="BLITZ">Blitz</option>
                <option value="RAPID">Rapide</option>
                <option value="CLASSICAL">Classique</option>
              </Select>
            </div>
            <Input
              id="tl-date"
              name="date"
              type="date"
              label="Date"
              defaultValue={editing.date.slice(0, 10)}
              required
              disabled={loading}
            />
            <Input
              id="tl-externalUrl"
              name="externalUrl"
              type="url"
              label="URL Chess.com / Lichess (optionnel)"
              placeholder="https://www.chess.com/tournament/live/…"
              defaultValue={editing.externalUrl ?? ''}
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button type="submit" loading={loading}>
                {loading ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditing(null)}
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {tournaments.length === 0 ? (
        <EmptyState
          variant="empty"
          title="Aucun tournoi"
          message="Créez un tournoi ci-dessus pour commencer le suivi des résultats."
        />
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
                <th className="px-3 py-2.5 text-center font-medium">Résultats</th>
                <th className="px-3 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {tournaments.map((t) => (
                <tr
                  key={t.id}
                  className={
                    editing?.id === t.id
                      ? 'bg-brand-light/50 shadow-[inset_3px_0_0_var(--color-brand)]'
                      : 'table-row-interactive'
                  }
                >
                  <td className="px-3 py-2.5 text-xs text-muted">{t.id}</td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium">{t.name}</p>
                    {t.externalUrl ? (
                      <p className="mt-0.5 max-w-[220px] truncate text-[11px] text-blue">
                        {t.externalUrl.replace(/^https?:\/\/(www\.)?/, '')}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant="blue">
                      {PLATFORM_LABELS[t.platform] ?? t.platform}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-muted">
                    {TIME_CONTROL_LABELS[t.timeControl] ?? t.timeControl}
                  </td>
                  <td className="px-3 py-2.5 text-muted">{formatDate(t.date)}</td>
                  <td className="px-3 py-2.5 text-center">
                    <Badge variant="gray">{t.results?.length ?? 0}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(t);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => void deleteTournament(t)}
                      >
                        Supprimer
                      </Button>
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
