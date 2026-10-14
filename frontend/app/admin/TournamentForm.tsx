'use client';

import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { apiFetch } from '@/lib/api';
import type { Platform, TimeControl } from '@/lib/types';

type NotifType = 'success' | 'error' | 'idle';

export default function TournamentForm({ onCreated }: { onCreated?: () => void }) {
  const [status, setStatus] = useState<NotifType>('idle');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function notify(msg: string, type: NotifType) {
    setMessage(msg);
    setStatus(type);
    if (type === 'success') setTimeout(() => setStatus('idle'), 4000);
  }

  async function createTournament(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const res = await apiFetch('/tournaments', {
        method: 'POST',
        body: JSON.stringify({
          name: fd.get('name') as string,
          platform: fd.get('platform') as Platform,
          timeControl: fd.get('timeControl') as TimeControl,
          date: fd.get('date') as string,
        }),
      });
      if (res.ok) {
        notify('Tournoi cr\u00e9\u00e9 avec succ\u00e8s.', 'success');
        form.reset();
        onCreated?.();
      } else {
        const text = await res.text();
        notify(`Erreur ${res.status} : ${text || 'r\u00e9ponse inattendue.'}`, 'error');
      }
    } catch {
      notify('Impossible de contacter le serveur.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={createTournament} className="space-y-4">
      <Input id="tf-name" name="name" label="Nom du tournoi" placeholder="Blitz du dimanche #12" required disabled={loading} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select id="tf-platform" name="platform" label="Plateforme" disabled={loading}>
          <option value="LICHESS">Lichess</option>
          <option value="CHESSCOM">Chess.com</option>
          <option value="OTHER">Autre</option>
        </Select>
        <Select id="tf-timeControl" name="timeControl" label="Cadence" disabled={loading}>
          <option value="BULLET">Bullet</option>
          <option value="BLITZ">Blitz</option>
          <option value="RAPID">Rapide</option>
          <option value="CLASSICAL">Classique</option>
        </Select>
      </div>
      <Input id="tf-date" name="date" type="date" label="Date du tournoi" required disabled={loading} />
      {status === 'success' && <Alert type="success" message={message} />}
      {status === 'error' && <Alert type="error" message={message} />}
      <Button type="submit" loading={loading}>
        {loading ? 'Cr\u00e9ation\u2026' : '+ Cr\u00e9er le tournoi'}
      </Button>
    </form>
  );
}
